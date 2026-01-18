import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCache, setCache } from '@/lib/cache';

// Remove force-dynamic to allow Next.js caching
// export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    const sort = searchParams.get('sort') || 'newest';
    const featured = searchParams.get('featured') === 'true';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      isPublished: true,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { developer: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.categories = {
        some: {
          category: {
            slug: category,
          },
        },
      };
    }

    if (tag) {
      where.tags = { has: tag };
    }

    if (featured) {
      where.isFeatured = true;
    }

    // Build orderBy clause
    let orderBy: any = {};
    switch (sort) {
      case 'popular':
      case 'plays':
        orderBy = { playCount: 'desc' };
        break;
      case 'views':
        orderBy = { views: 'desc' };
        break;
      case 'rating':
      case 'likes':
        orderBy = { ratings: { _count: 'desc' } };
        break;
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'newest':
      case 'trending':
      case 'relevance':
      default:
        orderBy = { createdAt: 'desc' };
    }

    // Check cache first
    const cacheKey = `games:${sort}:${search}:${category}:${tag}:page${page}:limit${limit}:featured${featured}`;
    const cachedData = getCache<{ games: any; pagination: any }>(cacheKey);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    // Get total count and games in parallel
    const [total, games] = await Promise.all([
      prisma.game.count({ where }),
      prisma.game.findMany({
        where,
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
          // Optimized: Fetch play sessions count in the same query if possible
          // or handle it more efficiently
        },
        orderBy,
        skip,
        take: limit,
      })
    ]);

    if (total === 0) {
      return NextResponse.json({
        games: [],
        pagination: {
          page: 1,
          limit,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });
    }

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    // Optimized: Fetch all active sessions for the current page of games in ONE query
    const gameIds = games.map(g => g.id);
    const allActiveSessions = await prisma.playSession.findMany({
      where: {
        gameId: { in: gameIds },
        startedAt: { gte: fiveMinutesAgo },
        OR: [
          { endedAt: null },
          { endedAt: { gte: fiveMinutesAgo } }
        ]
      },
      select: {
        gameId: true,
        userId: true,
      }
    });

    // Group sessions by gameId with accurate counting
    const sessionsByGame = allActiveSessions.reduce((acc: any, session) => {
      if (!acc[session.gameId]) {
        acc[session.gameId] = { loggedIn: new Set(), anonymous: 0 };
      }
      if (session.userId === 'anonymous') {
        acc[session.gameId].anonymous += 1;
      } else {
        acc[session.gameId].loggedIn.add(session.userId);
      }
      return acc;
    }, {});

    const processedGames = games.map((game) => {
      const ratings = Array.isArray(game.ratings) ? game.ratings : [];
      const likes = ratings.filter(r => r.isLike).length;
      const dislikes = ratings.filter(r => !r.isLike).length;
      const totalRatings = likes + dislikes;
      const likePercentage = totalRatings > 0 ? Math.round((likes / totalRatings) * 100) : 0;
      
      const gameStats = sessionsByGame[game.id];
      const onlineCount = gameStats ? (gameStats.loggedIn.size + gameStats.anonymous) : 0;

      return {
        ...game,
        likes,
        dislikes,
        likePercentage,
        totalRatings,
        onlineCount,
        categoryNames: game.categories.map(gc => gc.category.name),
      };
    });

    const responsePayload = {
      games: processedGames,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };

    // Cache the result for 5 minutes
    setCache(cacheKey, responsePayload, 5 * 60 * 1000);

    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error('Games fetch error:', error);
    return NextResponse.json({
      games: [],
      pagination: { page: 1, limit: 12, total: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false },
      error: 'Internal server error',
    }, { status: 500 });
  }
}
