import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

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
      prisma.playSession.findMany({
        where: { userId: user.id },
        select: {
          duration: true,
          gameId: true,
          startedAt: true,
        },
      }),
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

    const totalGamesPlayed = new Set(playSessions.map((ps) => ps.gameId)).size;
    const totalPlayTime = playSessions.reduce(
      (sum, ps) => sum + (Number(ps.duration) || 0),
      0
    );
    const totalPlayTimeMinutes = Math.floor(totalPlayTime / 60);
    const averageRating = 0;

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
        views: true,
      },
    });

    const ratingsMap = new Map<string, { likes: number; dislikes: number }>();
    for (const gameId of recentGameIds) {
      const gameRatingsData = await prisma.rating.findMany({
        where: { gameId },
        select: { isLike: true },
      });

      const likes = gameRatingsData.filter((r) => r.isLike).length;
      const dislikes = gameRatingsData.filter((r) => !r.isLike).length;
      ratingsMap.set(gameId, { likes, dislikes });
    }

    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    
    const recentGames = await Promise.all(recentGamesData.map(async (game) => {
      const gameSessions = playSessions.filter((ps) => ps.gameId === game.id);
      const lastPlayed = gameSessions
        .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())[0]
        ?.startedAt;

      const ratings = ratingsMap.get(game.id) || { likes: 0, dislikes: 0 };
      const total = ratings.likes + ratings.dislikes;
      const likePercentage = total > 0 ? Math.round((ratings.likes / total) * 100) : 0;

      const activeSessionsCount = await prisma.playSession.count({
        where: {
          gameId: game.id,
          startedAt: { gte: fifteenMinutesAgo },
          OR: [
            { endedAt: null },
            { endedAt: { gte: fifteenMinutesAgo } }
          ]
        }
      });

      const popularityFactor = Math.floor(game.views / 500) || 0;
      const randomPulse = Math.floor(Math.random() * 3);
      let onlineCount = activeSessionsCount + popularityFactor + randomPulse;
      if (onlineCount < 1) onlineCount = Math.floor(Math.random() * 3) + 1;

      return {
        id: game.id,
        slug: game.slug,
        title: game.title,
        thumbnail: game.thumbnail || '/images/placeholder-game.svg',
        lastPlayed: lastPlayed?.toISOString() || new Date().toISOString(),
        playCount: gameSessions.length,
        likePercentage: likePercentage,
        onlineCount: onlineCount,
      };
    }));

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
    const { name, bio, email, password, currentPassword } = body;

    // If updating email or password, current password is required for security
    if (email || password) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Current password is required to update security settings' },
          { status: 400 }
        );
      }

      const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
      if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

      const isPasswordValid = await bcrypt.compare(currentPassword, dbUser.password);
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Invalid current password' },
          { status: 400 }
        );
      }

      // Check if new email is already taken
      if (email && email !== dbUser.email) {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
          return NextResponse.json(
            { error: 'Email is already in use' },
            { status: 400 }
          );
        }
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (email !== undefined) updateData.email = email;
    if (password !== undefined) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
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
