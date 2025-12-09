import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

const gameSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(10),
  shortDescription: z.string().min(10),
  developer: z.string().min(1),
  publisher: z.string().optional(),
  gameUrl: z.string().url(),
  thumbnail: z.string().url(),
  coverImage: z.string().url().optional(),
  gameType: z.enum(['HTML5', 'WebGL', 'Unity', 'Flash', 'Other']),
  technologies: z.array(z.string()),
  tags: z.array(z.string()).default([]),
  ageRating: z.string().optional(),
  categoryIds: z.array(z.string()),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const sort = searchParams.get('sort') || 'newest';

    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { developer: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // First check total count
    const total = await prisma.game.count({ where });
    console.log(`📊 Total games in database: ${total}`);

    if (total === 0) {
      console.log('⚠️  No games found in database');
      return NextResponse.json({
        games: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      });
    }

    // Determine ordering
    const orderBy: any[] = [];
    switch (sort) {
      case 'plays':
        orderBy.push({ _count: { playSessions: 'desc' } });
        break;
      case 'views':
        orderBy.push({ views: 'desc' });
        break;
      case 'likes':
        orderBy.push({ _count: { ratings: 'desc' } });
        break;
      case 'online':
      case 'votes':
        // Will sort in-memory after computed fields
        orderBy.push({ createdAt: 'desc' });
        break;
      case 'oldest':
        orderBy.push({ createdAt: 'asc' });
        break;
      case 'newest':
      default:
        orderBy.push({ createdAt: 'desc' });
        break;
    }

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

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
        playSessions: {
          where: {
            OR: [
              { endedAt: null },
              { endedAt: { gte: fiveMinutesAgo } },
              { startedAt: { gte: fiveMinutesAgo } },
            ],
          },
          select: {
            userId: true,
            endedAt: true,
          },
        },
        _count: {
          select: {
            ratings: true,
            playSessions: true,
            bookmarks: true,
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    });

    console.log(`📊 Found ${total} total games, returning ${games.length} games`);

    const gamesWithCounts = games.map(game => {
      try {
        const ratings = Array.isArray(game.ratings) ? game.ratings : [];
        const likes = ratings.filter(r => r && typeof r.isLike === 'boolean' && r.isLike).length;
        const dislikes = ratings.filter(r => r && typeof r.isLike === 'boolean' && !r.isLike).length;
        const total = likes + dislikes;
        const onlineUsers = new Set(
          (game.playSessions || []).filter(session => !session.endedAt || session.endedAt.getTime() >= fiveMinutesAgo.getTime()).map(session => session.userId)
        );
        const onlineCount = onlineUsers.size;

        return {
          ...game,
          likes,
          dislikes,
          totalRatings: total,
          ratingCount: game._count?.ratings || 0,
          playCount: game._count?.playSessions || 0,
          bookmarkCount: game._count?.bookmarks || 0,
          categoryNames: Array.isArray(game.categories) ? game.categories.map(gc => gc.category.name) : [],
          tags: Array.isArray(game.tags) ? game.tags : [],
          views: game.views ?? 0,
          onlineCount,
        };
      } catch (err) {
        console.error('Error processing game:', game.id, err);
        return {
          ...game,
          likes: 0,
          dislikes: 0,
          totalRatings: 0,
          ratingCount: 0,
          playCount: 0,
          bookmarkCount: 0,
          views: game.views ?? 0,
          onlineCount: 0,
          categoryNames: [],
          tags: [],
        };
      }
    });

    // Additional in-memory sorting for computed fields
    let sortedGames = [...gamesWithCounts];
    switch (sort) {
      case 'online':
        sortedGames.sort((a, b) => (b.onlineCount || 0) - (a.onlineCount || 0));
        break;
      case 'votes':
        sortedGames.sort((a, b) => (b.totalRatings || 0) - (a.totalRatings || 0));
        break;
      default:
        break;
    }

    return NextResponse.json({
      games: sortedGames,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Admin games fetch error:', error);
    console.error('Error details:', error);
    
    // Return empty array on error to prevent crash
    return NextResponse.json({
      games: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const validation = gameSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { categoryIds, tags = [], ...gameData } = validation.data;

    // Normalize slug: convert to lowercase and trim
    const normalizedSlug = gameData.slug.toLowerCase().trim();
    console.log('📝 Creating game with slug:', normalizedSlug, '(original:', gameData.slug, ')');

    // Check if slug already exists
    const existingGame = await prisma.game.findUnique({
      where: { slug: normalizedSlug },
    });

    if (existingGame) {
      return NextResponse.json(
        { error: 'Game with this slug already exists' },
        { status: 409 }
      );
    }

    // Set releaseDate automatically if game is published
    const releaseDate = gameData.isPublished ? new Date() : undefined;

    // Create game with categories
    const game = await prisma.game.create({
      data: {
        ...gameData,
        slug: normalizedSlug, // Use normalized slug
        releaseDate, // Set release date automatically when published
        tags,
        categories: {
          create: categoryIds.map(categoryId => ({
            category: { connect: { id: categoryId } },
          })),
        },
      },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    return NextResponse.json(game);
  } catch (error) {
    console.error('Admin game create error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: error instanceof Error && error.message.includes('required') ? 401 : 500 }
    );
  }
}
