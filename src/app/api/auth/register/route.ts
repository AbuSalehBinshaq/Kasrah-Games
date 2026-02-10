import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, generateToken } from '@/lib/auth';
import { registerSchema } from '@/lib/validation';
import { sendWelcomeEmail } from '@/lib/brevo';

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

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        name,
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

    // Send welcome email (Background task, don't await if you want speed, but here we keep it safe)
    try {
      await sendWelcomeEmail(user.email, user.name || '', user.username);
      console.log(`✅ Welcome email sent to ${user.email}`);
    } catch (emailError) {
      console.error('❌ Failed to send welcome email:', emailError);
    }

    const response = NextResponse.json({
      user,
      token,
    });

    // Set cookie on the response object
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
