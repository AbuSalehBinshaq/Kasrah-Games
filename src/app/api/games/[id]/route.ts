import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 Searching for game with slug/id:', params.id);
    
    // Normalize slug for search (convert to lowercase and trim)
    const normalizedSlug = params.id.toLowerCase().trim();
    
    // Try to find by slug first, then by id
    const game = await prisma.game.findFirst({
      where: {
        OR: [
          { slug: normalizedSlug },
          { slug: params.id }, // Also try original in case it wasn't normalized
          { id: params.id },
        ],
      },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        ratings: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!game) {
      console.log('❌ Game not found with slug/id:', params.id);
      // Let's check if any games exist with similar slugs
      const allGames = await prisma.game.findMany({
        select: { id: true, slug: true, title: true, isPublished: true },
        take: 10,
      });
      console.log('📋 Available games:', allGames.map(g => ({ slug: g.slug, title: g.title, published: g.isPublished })));
      
      return NextResponse.json(
        { error: 'Game not found', message: `No game found with slug or id: ${params.id}` },
        { status: 404 }
      );
    }
    
    console.log('✅ Game found:', { id: game.id, slug: game.slug, title: game.title, isPublished: game.isPublished });

    if (!game.isPublished) {
      return NextResponse.json(
        { error: 'Game not published', message: 'This game exists but is not published yet. Please publish it from the admin panel.' },
        { status: 404 }
      );
    }

    // Increment view count
    await prisma.game.update({
      where: { id: game.id },
      data: { views: { increment: 1 } },
    });

    // Calculate likes and dislikes
    const allRatings = await prisma.rating.findMany({
      where: { gameId: game.id },
      select: { isLike: true, userId: true },
    });

    const likes = allRatings.filter(r => r.isLike).length;
    const dislikes = allRatings.filter(r => !r.isLike).length;
    const total = likes + dislikes;
    const likePercentage = total > 0 ? Math.round((likes / total) * 100) : 0;

    // Calculate online users (active play sessions in last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
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
    
    // Count unique users with active sessions (not ended or ended recently)
    const onlineUsers = new Set(
      activeSessions
        .filter(session => !session.endedAt || session.endedAt >= fiveMinutesAgo)
        .map(session => session.userId)
    );
    const onlineCount = onlineUsers.size;

    // Get user's vote if authenticated
    const userVote = request.headers.get('cookie')?.includes('token') 
      ? await (async () => {
          try {
            const { getCurrentUser } = await import('@/lib/auth');
            const user = await getCurrentUser();
            if (!user) return null;
            const userRating = allRatings.find(r => r.userId === user.id);
            return userRating ? (userRating.isLike ? 'like' : 'dislike') : null;
          } catch {
            return null;
          }
        })()
      : null;

    const gameWithRating = {
      ...game,
      likes,
      dislikes,
      likePercentage,
      totalRatings: total,
      onlineCount,
      userVote,
      categoryNames: game.categories.map(gc => gc.category.name),
      tags: game.tags || [],
    };

    return NextResponse.json(gameWithRating);
  } catch (error) {
    console.error('Game fetch error:', error);
    console.error('Searching for game with slug/id:', params.id);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Update game logic here
    const game = await prisma.game.update({
      where: { id: params.id },
      data: body,
    });

    return NextResponse.json(game);
  } catch (error) {
    console.error('Game update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
