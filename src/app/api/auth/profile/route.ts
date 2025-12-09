import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user with all related data
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        avatar: true,
        bio: true,
        createdAt: true,
      },
    });

    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get statistics
    const [playSessions, bookmarks] = await Promise.all([
      // Get all play sessions for this user
      prisma.playSession.findMany({
        where: { userId: user.id },
        select: {
          duration: true,
          gameId: true,
          startedAt: true,
        },
      }),
      // Get all ratings for this user
      // Get all bookmarks for this user
      prisma.bookmark.findMany({
        where: { userId: user.id },
        select: {
          id: true,
          createdAt: true,
          game: {
            select: {
              id: true,
              slug: true,
              title: true,
              thumbnail: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);

    // Calculate stats
    const totalGamesPlayed = new Set(playSessions.map((ps) => ps.gameId)).size;
    const totalPlayTime = playSessions.reduce(
      (sum, ps) => sum + (Number(ps.duration) || 0),
      0
    ); // in seconds
    const totalPlayTimeMinutes = Math.floor(totalPlayTime / 60);
    
    // Ratings disabled temporarily
    const averageRating = 0;

    // Get recent games (last 5 unique games played)
    const recentGameIds = Array.from(
      new Set(
        playSessions
          .filter((ps) => ps.startedAt)
          .sort((a, b) => {
            const aTime = a.startedAt ? new Date(a.startedAt).getTime() : 0;
            const bTime = b.startedAt ? new Date(b.startedAt).getTime() : 0;
            return bTime - aTime;
          })
          .map((ps) => ps.gameId)
          .slice(0, 5)
      )
    );

    const recentGamesData = await prisma.game.findMany({
      where: {
        id: { in: recentGameIds },
      },
      select: {
        id: true,
        slug: true,
        title: true,
        thumbnail: true,
      },
    });

    // Get play counts for recent games
    const recentGames = recentGamesData.map((game) => {
      const gameSessions = playSessions.filter((ps) => ps.gameId === game.id);
      const lastPlayed = gameSessions
        .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())[0]
        ?.startedAt;

      return {
        id: game.id,
        slug: game.slug,
        title: game.title,
        thumbnail: game.thumbnail || '/images/placeholder-game.svg',
        lastPlayed: lastPlayed?.toISOString() || new Date().toISOString(),
        playCount: gameSessions.length,
      };
    });

    // Format bookmarks
    const bookmarksWithRatings = bookmarks.map((bookmark) => ({
      id: bookmark.id,
      game: {
        id: bookmark.game.id,
        slug: bookmark.game.slug,
        title: bookmark.game.title,
        thumbnail: bookmark.game.thumbnail || '/images/placeholder-game.svg',
        avgRating: 0,
      },
      createdAt: bookmark.createdAt.toISOString(),
    }));

    // Return profile data
    return NextResponse.json({
      id: userData.id,
      username: userData.username,
      email: userData.email,
      name: userData.name,
      avatar: userData.avatar,
      bio: userData.bio,
      createdAt: userData.createdAt.toISOString(),
      stats: {
        totalGamesPlayed,
        totalPlayTime: totalPlayTimeMinutes,
        averageRating,
        bookmarksCount: bookmarks.length,
      },
      recentGames,
      bookmarks: bookmarksWithRatings,
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, bio } = body;

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(name !== undefined && { name }),
        ...(bio !== undefined && { bio }),
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        avatar: true,
        bio: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

