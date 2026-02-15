import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/sdk/ads/track
 * Track ad impressions and clicks
 */
export async function POST(request: NextRequest) {
  try {
    const { adId, type, gameId, userId } = await request.json();

    if (!adId || !type || !gameId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Record ad impression
    await prisma.sDKAdImpression.create({
      data: {
        gameId,
        adType: type,
        adId,
        userId: userId || null,
        completed: true
      }
    });

    // Update ad clicks if tracking click
    if (type === 'click') {
      await prisma.ad.update({
        where: { id: adId },
        data: { clicks: { increment: 1 } }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking ad:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
