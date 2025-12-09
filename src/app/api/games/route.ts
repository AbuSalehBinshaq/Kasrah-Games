export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCache, setCache } from '@/lib/cache';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    const sort = searchParams.get('sort') || 'newest'; // newest | oldest | popular | rating | views | trending | relevance | likes
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

    // Build orderBy clause (base), some sorts refined later in-memory
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
      case 'trending': // initial order by recency; will refine in-memory
      case 'relevance': // will refine in-memory
      default:
        orderBy = { createdAt: 'desc' };
    }

    // Get total count
    const total = await prisma.game.count({ where });
    console.log(`📊 Total published games: ${total}`);

    if (total === 0) {
      console.log('⚠️  No published games found');
      return NextResponse.json({
        games: [],
        pagination: {
          page: 1,
          limit: 12,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });
    }

    // Optional cached payload for expensive sorts
    const cacheKeyBase = `games:${sort}:${search}:${category}:${tag}:page${page}:limit${limit}:featured${featured}`;
    if (!search && (sort === 'trending' || sort === 'popular' || sort === 'plays' || sort === 'views' || sort === 'likes')) {
      const cached = getCache<{ games: any; pagination: any }>(cacheKeyBase);
      if (cached) {
        return NextResponse.json(cached);
      }
    }

    // Get games with categories
    const games = await prisma.game.findMany({
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
      },
      orderBy,
      skip,
      take: limit,
    });

    console.log(`✅ Found ${games.length} games, processing...`);

    // Calculate likes and dislikes, and online count for each game
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const gamesWithRatings = await Promise.all(games.map(async (game) => {
      try {
        const ratings = Array.isArray(game.ratings) ? game.ratings : [];
        const likes = ratings.filter(r => r && typeof r.isLike === 'boolean' && r.isLike).length;
        const dislikes = ratings.filter(r => r && typeof r.isLike === 'boolean' && !r.isLike).length;
        const total = likes + dislikes;
        const likePercentage = total > 0 ? Math.round((likes / total) * 100) : 0;

        // Calculate online users for this game
        const activeSessions = await prisma.playSession.findMany({
          where: {
            gameId: game.id,
            startedAt: {
              gte: fiveMinutesAgo,
            },
          },
          select: {
            userId: true,
            endedAt: true,
          },
        });
        
        const onlineUsers = new Set(
          activeSessions
            .filter(session => !session.endedAt || session.endedAt >= fiveMinutesAgo)
            .map(session => session.userId)
        );
        const onlineCount = onlineUsers.size;

        return {
          ...game,
          likes,
          dislikes,
          likePercentage,
          totalRatings: total,
          onlineCount,
          categoryNames: Array.isArray(game.categories) ? game.categories.map(gc => gc.category.name) : [],
          tags: Array.isArray(game.tags) ? game.tags : [],
        };
      } catch (err) {
        console.error('Error processing game:', game.id, err);
        return {
          ...game,
          likes: 0,
          dislikes: 0,
          likePercentage: 0,
          totalRatings: 0,
          onlineCount: 0,
          categoryNames: [],
          tags: [],
        };
      }
    }));

    // Extra scoring for trending/relevance
    let processed = [...gamesWithRatings];

    if (sort === 'trending') {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const playCounts = await prisma.playSession.groupBy({
        by: ['gameId'],
        where: { startedAt: { gte: thirtyDaysAgo } },
        _count: { gameId: true },
      });
      const playMap = playCounts.reduce<Record<string, number>>((acc, row) => {
        acc[row.gameId] = row._count.gameId || 0;
        return acc;
      }, {});
      processed.sort((a, b) => {
        const pa = playMap[a.id] || 0;
        const pb = playMap[b.id] || 0;
        return pb - pa || (b.likes || 0) - (a.likes || 0) || b.playCount - a.playCount;
      });
    } else if (sort === 'relevance' && search) {
      const q = search.toLowerCase();
      const score = (g: any) => {
        let s = 0;
        if (g.title?.toLowerCase().includes(q)) s += 5;
        if (g.description?.toLowerCase().includes(q)) s += 2;
        if ((g.tags || []).some((t: string) => t.toLowerCase().includes(q))) s += 3;
        s += Math.min(3, Math.floor((g.likes || 0) / 5));
        s += Math.min(2, Math.floor((g.playCount || 0) / 50));
        return s;
      };
      processed.sort((a, b) => score(b) - score(a));
    }

    const responsePayload = {
      games: processed,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };

    if (!search && (sort === 'trending' || sort === 'popular' || sort === 'plays' || sort === 'views' || sort === 'likes')) {
      setCache(cacheKeyBase, responsePayload, 3 * 60 * 1000); // 3 minutes
    }

    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error('Games fetch error:', error);
    console.error('Error details:', error instanceof Error ? error.stack : error);
    
    // Return empty array on error to prevent crash
    return NextResponse.json({
      games: [],
      pagination: {
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      },
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}
