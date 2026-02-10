import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }

    if (!process.env.JWT_SECRET) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    if (decoded.type !== 'email-verification') {
      return NextResponse.json({ error: 'Invalid token type' }, { status: 400 });
    }

    // Find user and update verification status
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || user.emailVerificationToken !== token) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }

    if (user.emailVerificationExpiry && new Date() > user.emailVerificationExpiry) {
      return NextResponse.json({ error: 'Token has expired' }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiry: null,
      },
    });

    // Redirect to a success page or login
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://kasrah-games.onrender.com';
    return NextResponse.redirect(`${siteUrl}/auth/login?verified=true`);
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
