import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, generateToken } from '@/lib/auth';
import { registerSchema } from '@/lib/validation';
import { sendVerificationEmail } from '@/lib/brevo';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { email, username, password, name } = validation.data;

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email or username already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate verification token if JWT_SECRET is available
    let verificationToken = null;
    let verificationExpiry = null;
    
    if (process.env.JWT_SECRET) {
      verificationToken = jwt.sign(
        { email, type: 'email-verification' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      verificationExpiry = new Date(new Date().getTime() + 24 * 3600 * 1000);
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        name,
        emailVerificationToken: verificationToken,
        emailVerificationExpiry: verificationExpiry,
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        avatar: true,
        role: true,
        isVerified: true,
      },
    });

    // Send verification email
    if (verificationToken) {
      try {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://kasrah-games.onrender.com';
        const verificationLink = `${siteUrl}/api/auth/verify-email?token=${verificationToken}`;
        await sendVerificationEmail(user.email, user.name || user.username, verificationLink);
        console.log(`✅ Verification email sent to ${user.email}`);
      } catch (emailError) {
        console.error('❌ Failed to send verification email:', emailError);
      }
    }

    // Generate session token
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
      user,
      token,
      message: 'Registration successful. Redirecting to verification notice...',
      redirectTo: '/auth/verify-notice'
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
    console.error('❌ Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
