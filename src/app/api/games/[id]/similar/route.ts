import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCache, setCache } from '@/lib/cache';

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '8');
    const cacheKey = `similar:${params.id}:limit${limit}`;
    const cached = getCache(cacheKey);
    if (cached) return NextResponse.json(cached);

    const game = await prisma.game.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        tags: true,
        categories: { select: { categoryId: true } },
      },
    });

    if (!game) {
      return NextResponse.json({ games: [] });
    }

    const tagList = game.tags || [];
    const categoryIds = game.categories.map((c) => c.categoryId);

    const similar = await prisma.game.findMany({
      where: {
        id: { not: game.id },
        isPublished: true,
        OR: [
          tagList.length ? { tags: { hasSome: tagList } } : undefined,
          categoryIds.length ? { categories: { some: { categoryId: { in: categoryIds } } } } : undefined,
        ].filter(Boolean) as any,
      },
      include: {
        categories: { include: { category: true } },
        ratings: { select: { isLike: true } },
      },
      orderBy: [{ isFeatured: 'desc' }, { playCount: 'desc' }, { createdAt: 'desc' }],
      take: limit,
    });

    const scored = similar.map((g) => {
      const tagOverlap = tagList.filter((t) => g.tags.includes(t)).length;
      const catOverlap = g.categories.filter((c) => categoryIds.includes(c.categoryId)).length;
      const ratings = Array.isArray(g.ratings) ? g.ratings : [];
      const likes = ratings.filter((r) => r.isLike).length;
      const dislikes = ratings.filter((r) => !r.isLike).length;
      const total = likes + dislikes;
      const likePercentage = total > 0 ? Math.round((likes / total) * 100) : 0;
      const score = tagOverlap * 3 + catOverlap * 2 + likes * 0.1 + g.playCount * 0.01;
      return {
        ...g,
        likes,
        dislikes,
        totalRatings: total,
        likePercentage,
        categoryNames: g.categories.map((gc) => gc.category.name),
        tags: g.tags || [],
        _score: score,
      };
    });

    scored.sort((a, b) => (b._score || 0) - (a._score || 0));
    const payload = { games: scored.slice(0, limit) };
    setCache(cacheKey, payload, CACHE_TTL);
    return NextResponse.json(payload);
  } catch (error) {
    console.error('Similar games error:', error);
    return NextResponse.json({ games: [], error: 'Failed to load similar games' }, { status: 500 });
  }
}

