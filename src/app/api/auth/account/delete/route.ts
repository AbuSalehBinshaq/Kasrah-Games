import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    const body = await request.json();
    const { otp } = body;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!otp) {
      return NextResponse.json({ error: 'OTP is required' }, { status: 400 });
    }

    // Verify user using centralized auth utility
    const payload = verifyToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify OTP
    if (!user.otpCode || user.otpCode !== otp) {
      return NextResponse.json({ error: 'Invalid OTP code' }, { status: 400 });
    }

    if (user.otpExpiry && new Date() > user.otpExpiry) {
      return NextResponse.json({ error: 'OTP has expired' }, { status: 400 });
    }

    // Delete user
    await prisma.user.delete({
      where: { id: user.id },
    });

    // Clear auth cookie
    const response = NextResponse.json({ message: 'Account deleted successfully' });
    response.cookies.set('token', '', { maxAge: 0 });

    return response;
  } catch (error) {
    console.error('Account deletion error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}