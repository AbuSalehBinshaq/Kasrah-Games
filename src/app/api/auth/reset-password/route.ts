import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hashPassword, verifyToken } from '@/lib/auth';
import jwt from 'jsonwebtoken';
import { sendPasswordResetConfirmationEmail } from '@/lib/brevo';

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Confirm password must be at least 8 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = resetPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { token, password } = validation.data;

    // Verify the token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    // Find user with valid reset token
    const user = await prisma.user.findFirst({
      where: {
        id: decoded.userId,
        resetPasswordToken: token,
        resetPasswordTokenExpiry: { gte: new Date() },
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await hashPassword(password);

    // Update user password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordTokenExpiry: null,
      },
    });

    // Send confirmation email
    try {
      await sendPasswordResetConfirmationEmail(user.email, user.name || '');
      console.log(`✅ Password reset confirmation email sent to ${user.email}`);
    } catch (emailError) {
      console.error('❌ Failed to send confirmation email:', emailError);
      // Still return success as password was already reset
    }

    return NextResponse.json({
      message: 'Password has been reset successfully. You can now log in with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
