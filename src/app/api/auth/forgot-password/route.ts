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

    // Check if JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET is not configured in environment variables');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    // If user doesn't exist, inform them (updated per user request)
    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this email address' },
        { status: 404 }
      );
    }

    // Generate a unique reset token (valid for 1 hour)
    const resetToken = jwt.sign(
      { userId: user.id, email: user.email, type: 'password-reset' },
      process.env.JWT_SECRET,
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
    // Ensure SITE_URL doesn't have a trailing slash before appending path
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://kasrah-games.onrender.com';
    const resetLink = `${siteUrl}/auth/reset-password?token=${resetToken}`;

    console.log(`🔗 Generated reset link for ${user.email}: ${resetLink}`);

    // Send password reset email
    try {
      const result = await sendPasswordResetEmail(user.email, user.name || '', resetLink);
      if (result) {
        console.log(`✅ Password reset email sent to ${user.email}. Result:`, JSON.stringify(result));
      } else {
        console.warn(`⚠️ sendPasswordResetEmail returned null for ${user.email} (Check BREVO_API_KEY)`);
      }
    } catch (emailError: any) {
      console.error('❌ Failed to send password reset email:', emailError);
      return NextResponse.json(
        { error: 'Failed to send email. Please try again later.', details: emailError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'A password reset link has been sent to your email address.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}