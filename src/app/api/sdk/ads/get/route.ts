import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/sdk/ads/get
 * Get available ads for a game
 */
export async function POST(request: NextRequest) {
  try {
    const { gameId, type } = await request.json();

    if (!gameId) {
      return NextResponse.json(
        { success: false, error: 'gameId is required' },
        { status: 400 }
      );
    }

    // Get active ads
    const ads = await prisma.ad.findMany({
      where: {
        isActive: true,
        OR: [
          { startDate: null },
          { startDate: { lte: new Date() } }
        ],
        OR: [
          { endDate: null },
          { endDate: { gte: new Date() } }
        ]
      },
      take: 1,
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (ads.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No ads available' },
        { status: 404 }
      );
    }

    const ad = ads[0];

    // Increment impressions
    await prisma.ad.update({
      where: { id: ad.id },
      data: { impressions: { increment: 1 } }
    });

    return NextResponse.json({
      success: true,
      ad: {
        id: ad.id,
        title: ad.title,
        type: ad.type,
        imageUrl: ad.imageUrl,
        clickUrl: ad.clickUrl,
        code: ad.code
      }
    });
  } catch (error) {
    console.error('Error fetching ads:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
