import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { sendPasswordResetEmail } from '@/lib/brevo';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = forgotPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { email } = validation.data;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    // For security reasons, always return the same message
    // whether the user exists or not (prevents email enumeration)
    if (!user) {
      return NextResponse.json({
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    }

    // Generate a unique reset token (valid for 1 hour)
    const resetToken = jwt.sign(
      { userId: user.id, email: user.email, type: 'password-reset' },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    const expiryDate = new Date(new Date().getTime() + 3600 * 1000); // 1 hour from now

    // Save the reset token to the database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordTokenExpiry: expiryDate,
      },
    });

    // Generate reset link
    const resetLink = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password?token=${resetToken}`;

    // Send password reset email
    try {
      await sendPasswordResetEmail(user.email, user.name || '', resetLink);
      console.log(`✅ Password reset email sent to ${user.email}`);
    } catch (emailError) {
      console.error('❌ Failed to send password reset email:', emailError);
      // Still return success to the user to prevent information leakage
    }

    return NextResponse.json({
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
