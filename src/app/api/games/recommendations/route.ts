export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCache, setCache } from '@/lib/cache';
import { getCurrentUser } from '@/lib/auth';

const CACHE_TTL = 3 * 60 * 1000; // 3 minutes

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '12');
    const user = await getCurrentUser();

    const cacheKey = `recommendations:${user?.id || 'guest'}:limit${limit}`;
    const cached = getCache(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    let seedTags: string[] = [];
    let seedCategories: string[] = [];

    if (user) {
      const recentPlays = await prisma.playSession.findMany({
        where: { userId: user.id },
        orderBy: { startedAt: 'desc' },
        take: 20,
        include: {
          game: {
            select: {
              id: true,
              tags: true,
              categories: {
                select: { category: { select: { id: true } } },
              },
            },
          },
        },
      });

      seedTags = Array.from(
        new Set(
          recentPlays.flatMap((p) => p.game?.tags || []).filter(Boolean)
        )
      ).slice(0, 10);

      seedCategories = Array.from(
        new Set(
          recentPlays
            .flatMap((p) => p.game?.categories?.map((c) => c.category.id) || [])
            .filter(Boolean)
        )
      ).slice(0, 6);
    }

    // Fallback when no seeds: use popular recent games
    const where: any = { isPublished: true };
    if (seedTags.length) {
      where.tags = { hasSome: seedTags };
    }
    if (seedCategories.length) {
      where.categories = {
        some: { categoryId: { in: seedCategories } },
      };
    }

    const games = await prisma.game.findMany({
      where,
      include: {
        categories: { include: { category: true } },
        ratings: { select: { isLike: true } },
      },
      orderBy: [{ isFeatured: 'desc' }, { playCount: 'desc' }, { createdAt: 'desc' }],
      take: limit,
    });

    const recommendations = games.map((game) => {
      const ratings = Array.isArray(game.ratings) ? game.ratings : [];
      const likes = ratings.filter((r) => r.isLike).length;
      const dislikes = ratings.filter((r) => !r.isLike).length;
      const total = likes + dislikes;
      const likePercentage = total > 0 ? Math.round((likes / total) * 100) : 0;
      return {
        ...game,
        likes,
        dislikes,
        likePercentage,
        totalRatings: total,
        categoryNames: game.categories.map((gc) => gc.category.name),
        tags: game.tags || [],
      };
    });

    const payload = { games: recommendations };
    setCache(cacheKey, payload, CACHE_TTL);
    return NextResponse.json(payload);
  } catch (error) {
    console.error('Recommendations error:', error);
    return NextResponse.json({ games: [], error: 'Failed to load recommendations' }, { status: 500 });
  }
}

