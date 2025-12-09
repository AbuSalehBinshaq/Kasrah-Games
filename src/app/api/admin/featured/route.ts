import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const featuredGames = await prisma.game.findMany({
      where: { isFeatured: true, isPublished: true },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        ratings: {
          select: {
            isLike: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const gamesWithStats = featuredGames.map(game => {
      const ratings = Array.isArray(game.ratings) ? game.ratings : [];
      const likes = ratings.filter(r => r && typeof r.isLike === 'boolean' && r.isLike).length;
      const dislikes = ratings.filter(r => r && typeof r.isLike === 'boolean' && !r.isLike).length;
      const total = likes + dislikes;
      const likePercentage = total > 0 ? Math.round((likes / total) * 100) : 0;

      return {
        ...game,
        likes,
        dislikes,
        likePercentage,
        totalRatings: total,
        categoryNames: Array.isArray(game.categories) ? game.categories.map(gc => gc.category.name) : [],
      };
    });

    return NextResponse.json({ games: gamesWithStats });
  } catch (error) {
    console.error('Featured games fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: error instanceof Error && error.message.includes('required') ? 401 : 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { gameId, featured } = body;

    if (typeof gameId !== 'string' || typeof featured !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Update game featured status
    const game = await prisma.game.update({
      where: { id: gameId },
      data: { isFeatured: featured },
    });

    return NextResponse.json({ 
      success: true, 
      game,
      message: `Game ${featured ? 'added to' : 'removed from'} featured list` 
    });
  } catch (error) {
    console.error('Featured update error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: error instanceof Error && error.message.includes('required') ? 401 : 500 }
    );
  }
}
