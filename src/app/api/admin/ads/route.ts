import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET all ads
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ads = await prisma.ad.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ ads });
  } catch (error) {
    console.error('Failed to fetch ads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ads' },
      { status: 500 }
    );
  }
}

// POST create new ad
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      type,
      position,
      size = 'MEDIUM',
      imageUrl,
      clickUrl,
      code,
      startDate,
      endDate,
      targetUrl,
      isActive = true,
    } = body;

    if (!title || !type || !position) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (type === 'CUSTOM' && (!imageUrl || !clickUrl)) {
      return NextResponse.json(
        { error: 'Image URL and Click URL are required for CUSTOM ads' },
        { status: 400 }
      );
    }

    if (type === 'CODE' && !code) {
      return NextResponse.json(
        { error: 'Code is required for CODE ads' },
        { status: 400 }
      );
    }

    const ad = await prisma.ad.create({
      data: {
        title,
        type,
        position,
        size,
        imageUrl: type === 'CUSTOM' ? imageUrl : null,
        clickUrl: type === 'CUSTOM' ? clickUrl : null,
        code: type === 'CODE' ? code : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        targetUrl,
        isActive,
      },
    });

    return NextResponse.json({ ad }, { status: 201 });
  } catch (error) {
    console.error('Failed to create ad:', error);
    return NextResponse.json(
      { error: 'Failed to create ad' },
      { status: 500 }
    );
  }
}

