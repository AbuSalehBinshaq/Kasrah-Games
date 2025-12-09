export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    // Get stats in parallel
    const [
      totalGames,
      totalUsers,
      totalPlays,
      activeUsers,
      recentGames,
      recentRatings,
      categoryStats,
    ] = await Promise.all([
      // Total games
      prisma.game.count({ where: { isPublished: true } }),

      // Total users
      prisma.user.count(),

      // Total play sessions
      prisma.playSession.count(),

      // Active users (last 30 days)
      prisma.user.count({
        where: {
          lastLoginAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),

      // Recent games
      prisma.game.findMany({
        where: { isPublished: true },
        include: {
          ratings: {
            select: { isLike: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),

      // Recent ratings
      prisma.rating.findMany({
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
              title: true,
              thumbnail: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),

      // Category stats
      prisma.category.findMany({
        where: { isActive: true },
        include: {
          _count: {
            select: { games: true },
          },
        },
        orderBy: { order: 'asc' },
        take: 6,
      }),
    ]);

    // Calculate global like percentage
    const allRatings = await prisma.rating.findMany({
      select: { isLike: true },
    });
    const likes = allRatings.filter(r => r.isLike).length;
    const dislikes = allRatings.filter(r => !r.isLike).length;
    const totalVotes = likes + dislikes;
    const likePercentage = totalVotes > 0 ? Math.round((likes / totalVotes) * 100) : 0;

    // Process recent games with average ratings
    const recentGamesWithRatings = recentGames.map(game => {
      const gameRatings = Array.isArray(game.ratings) ? game.ratings : [];
      const gameLikes = gameRatings.filter(r => r.isLike).length;
      const gameDislikes = gameRatings.filter(r => !r.isLike).length;
      const gameTotal = gameLikes + gameDislikes;
      const gameLikePct = gameTotal > 0 ? Math.round((gameLikes / gameTotal) * 100) : 0;

      return {
        ...game,
        avgRating: gameLikePct, // keep key name for UI, value is like%
        ratings: undefined, // Remove ratings array
      };
    });

    // Process category stats
    const popularCategories = categoryStats.map(category => ({
      ...category,
      gameCount: category._count.games,
    }));

    return NextResponse.json({
      totalGames,
      totalUsers,
      totalPlays,
      avgRating: likePercentage, // use like percentage as "avg rating"
      activeUsers,
      recentGames: recentGamesWithRatings,
      recentReviews: recentRatings,
      popularCategories,
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: error instanceof Error && error.message.includes('required') ? 401 : 500 }
    );
  }
}
