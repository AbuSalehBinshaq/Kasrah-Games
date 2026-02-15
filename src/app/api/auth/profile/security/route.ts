import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, otp, newValue } = body;

    if (!otp || !newValue) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify session using centralized auth utility
    const payload = verifyToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ 
      where: { id: payload.userId },
      select: {
        id: true,
        otpCode: true,
        otpExpiry: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Trim and normalize OTP for comparison
    const submittedOtp = otp.toString().trim();
    const storedOtp = user.otpCode?.toString().trim();

    // Verify OTP
    if (!storedOtp || storedOtp !== submittedOtp) {
      console.log(`OTP Mismatch: Stored[${storedOtp}] vs Submitted[${submittedOtp}]`);
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
    }

    if (user.otpExpiry && new Date() > user.otpExpiry) {
      return NextResponse.json({ error: 'Verification code has expired' }, { status: 400 });
    }

    const updateData: any = {
      otpCode: null,
      otpExpiry: null,
    };

    if (type === 'password') {
      updateData.password = await hashPassword(newValue);
    } else if (type === 'email') {
      // Check if email is already taken
      const existingUser = await prisma.user.findUnique({ where: { email: newValue } });
      if (existingUser) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
      }
      updateData.email = newValue;
      updateData.isVerified = false; // Reset verification for new email
    } else {
      return NextResponse.json({ error: 'Invalid update type' }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    return NextResponse.json({ message: 'Security settings updated successfully' });
  } catch (error) {
    console.error('Security update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}