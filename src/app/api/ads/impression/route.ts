import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Track ad impression
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adId } = body;

    if (!adId) {
      return NextResponse.json(
        { error: 'Ad ID is required' },
        { status: 400 }
      );
    }

    await prisma.ad.update({
      where: { id: adId },
      data: {
        impressions: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to track ad impression:', error);
    return NextResponse.json(
      { error: 'Failed to track impression' },
      { status: 500 }
    );
  }
}

