import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { verifyPassword, generateToken } from '@/lib/auth';
import { logEvent } from '@/lib/audit';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(request: NextRequest) {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  try {
    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Log failed attempt (user not found)
      await logEvent({
        event: 'AUTH_LOGIN_FAILURE',
        status: 'FAILURE',
        actorEmail: email,
        ipAddress: ip,
        userAgent: userAgent,
        details: { reason: 'User not found' }
      });

      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      // Log failed attempt (wrong password)
      await logEvent({
        event: 'AUTH_LOGIN_FAILURE',
        status: 'FAILURE',
        actorId: user.id,
        actorEmail: user.email,
        ipAddress: ip,
        userAgent: userAgent,
        details: { reason: 'Invalid password' }
      });

      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if email is verified
    if (!user.isVerified) {
      return NextResponse.json(
        { 
          error: 'Please verify your email before logging in.',
          requiresVerification: true 
        },
        { status: 403 }
      );
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Log successful login
    await logEvent({
      event: 'AUTH_LOGIN_SUCCESS',
      status: 'SUCCESS',
      actorId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      ipAddress: ip,
      userAgent: userAgent
    });

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name || undefined,
      avatar: user.avatar || undefined,
      role: user.role,
      isVerified: user.isVerified,
    });

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        isVerified: user.isVerified,
      },
      token,
    });

    // Set cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}