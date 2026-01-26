import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

    let games;
    let total;

    // خوارزمية مخصصة بناءً على نصوص الشرح (Roblox-style)
    if (sort === 'popular' || sort === 'trending' || sort === 'newest') {
      const allGames = await prisma.game.findMany({
        where,
        include: {
          categories: { include: { category: true } },
          ratings: { select: { isLike: true } },
        },
      });

      total = allGames.length;

      // حساب اللاعبين النشطين (آخر 10 دقائق)
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

      const activeSessions = await prisma.playSession.findMany({
        where: {
          startedAt: { gte: tenMinutesAgo },
          OR: [{ endedAt: null }, { endedAt: { gte: tenMinutesAgo } }]
        },
        select: { gameId: true, userId: true }
      });

      const sessionsByGame = activeSessions.reduce((acc: any, session) => {
        if (!acc[session.gameId]) acc[session.gameId] = new Set();
        acc[session.gameId].add(session.userId);
        return acc;
      }, {});

      const gamesWithScores = allGames.map(game => {
        const onlineCount = sessionsByGame[game.id]?.size || 0;
        const ratings = game.ratings || [];
        const likes = ratings.filter(r => r.isLike).length;
        const totalRatings = ratings.length;
        const likePercentage = totalRatings > 0 ? (likes / totalRatings) : 0;
        
        // حساب "النمو" في وقت اللعب (تبسيط: استخدام playCount كمعيار للتفاعل)
        // في بيئة حقيقية، سنحتاج لجدول إحصائيات يومي
        const recentPlayFactor = game.playCount * 0.2; 
        
        let score = 0;

        if (sort === 'popular') {
          // Top Trending: زيادة في وقت اللعب + عدد المستخدمين اليومي
          // (onlineCount * 1000) + (تفاعل حديث * 50) + (نسبة إعجاب * 100)
          score = (onlineCount * 1000) + (recentPlayFactor * 50) + (likePercentage * 100);
        } else if (sort === 'newest') {
          // Up-and-Coming: ألعاب جديدة + أكبر زيادة نسبية في وقت اللعب
          const isNew = game.createdAt > twoWeeksAgo ? 2000 : 0;
          score = isNew + (recentPlayFactor * 100) + (onlineCount * 500);
        } else if (sort === 'trending') {
          // Top Playing Now: الترتيب حسب عدد المستخدمين المتزامنين (Concurrent Users)
          score = onlineCount;
        }
        
        return { 
          ...game, 
          onlineCount, 
          score, 
          likes, 
          totalRatings, 
          likePercentage: Math.round(likePercentage * 100),
          categoryNames: game.categories.map(gc => gc.category.name)
        };
      });

      gamesWithScores.sort((a, b) => b.score - a.score);
      games = gamesWithScores.slice(skip, skip + limit);
    } else {
      // الترتيب الافتراضي (Views, Oldest, etc.)
      let orderBy: any = {};
      switch (sort) {
        case 'views': orderBy = { views: 'desc' }; break;
        case 'oldest': orderBy = { createdAt: 'asc' }; break;
        default: orderBy = { createdAt: 'desc' };
      }

      [total, games] = await Promise.all([
        prisma.game.count({ where }),
        prisma.game.findMany({
          where,
          include: {
            categories: { include: { category: true } },
            ratings: { select: { isLike: true } },
          },
          orderBy,
          skip,
          take: limit,
        })
      ]);

      // إضافة عدد المتصلين للألعاب في الترتيب الافتراضي أيضاً
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      const gameIds = games.map(g => g.id);
      const activeSessions = await prisma.playSession.findMany({
        where: {
          gameId: { in: gameIds },
          startedAt: { gte: tenMinutesAgo },
          OR: [{ endedAt: null }, { endedAt: { gte: tenMinutesAgo } }]
        },
        select: { gameId: true, userId: true }
      });

      const sessionsByGame = activeSessions.reduce((acc: any, session) => {
        if (!acc[session.gameId]) acc[session.gameId] = new Set();
        acc[session.gameId].add(session.userId);
        return acc;
      }, {});

      games = games.map(game => {
        const ratings = game.ratings || [];
        const likes = ratings.filter(r => r.isLike).length;
        const totalRatings = ratings.length;
        return {
          ...game,
          onlineCount: sessionsByGame[game.id]?.size || 0,
          likes,
          totalRatings,
          likePercentage: totalRatings > 0 ? Math.round((likes / totalRatings) * 100) : 0,
          categoryNames: game.categories.map(gc => gc.category.name),
        };
      });
    }

    return NextResponse.json({
      games,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Games fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
