export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');

    console.log('📊 Fetching recent reviews/ratings...');

    // Since we removed review field, return recent ratings (likes/dislikes) instead
    const reviews = await prisma.rating.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        game: {
          select: {
            id: true,
            slug: true,
            title: true,
            thumbnail: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    console.log(`✅ Found ${reviews.length} reviews/ratings`);

    // Transform to review-like format
    const formattedReviews = reviews.map(rating => ({
      id: rating.id,
      isLike: rating.isLike,
      user: rating.user,
      game: rating.game,
      createdAt: rating.createdAt.toISOString(),
      updatedAt: rating.updatedAt.toISOString(),
    }));

    return NextResponse.json({ reviews: formattedReviews });
  } catch (error) {
    console.error('❌ Reviews fetch error:', error);
    console.error('Error details:', error instanceof Error ? error.stack : error);
    
    // Return empty array on error to prevent crash
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error', 
        reviews: [] 
      },
      { status: 500 }
    );
  }
}

