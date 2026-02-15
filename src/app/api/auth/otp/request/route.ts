import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendOTPEmail } from '@/lib/brevo';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user using the centralized auth utility
    const payload = verifyToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save to DB
    await prisma.user.update({
      where: { id: user.id },
      data: {
        otpCode,
        otpExpiry,
      },
    });

    // Send email
    try {
      await sendOTPEmail(user.email, user.name || user.username, otpCode);
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      // We still return success if the DB was updated, but warn in logs
      // Or we could return an error if email is critical
      return NextResponse.json({ error: 'Failed to send verification email. Please try again later.' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Verification code sent to your email' });
  } catch (error) {
    console.error('OTP request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}