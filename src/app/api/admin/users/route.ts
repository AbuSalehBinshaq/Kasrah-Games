import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';

    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (role) {
      where.role = role;
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
          avatar: true,
          role: true,
          isVerified: true,
          createdAt: true,
          lastLoginAt: true,
          _count: {
            select: {
              ratings: true,
              playSessions: true,
              bookmarks: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    // Aggregate playtime per user (seconds), with fallback to started/ended diff when duration is missing/zero
    const userIds = users.map(u => u.id);
    let playtimeByUser: Record<string, number> = {};
    if (userIds.length > 0) {
      const sessions = await prisma.playSession.findMany({
        where: { userId: { in: userIds } },
        select: {
          userId: true,
          duration: true,
          startedAt: true,
          endedAt: true,
        },
      });

      // Trust recorded duration when available; otherwise fall back to (endedAt - startedAt) with a conservative cap.
      const MAX_SESSION_SECONDS = 2 * 60 * 60; // cap per session to 2 hours to avoid runaway/idle inflation
      playtimeByUser = sessions.reduce<Record<string, number>>((acc, s) => {
        let seconds = 0;

        if (s.duration && s.duration > 0) {
          seconds = Math.min(s.duration, MAX_SESSION_SECONDS);
        } else if (s.endedAt) {
          const rawDiff = Math.max(0, Math.floor((s.endedAt.getTime() - s.startedAt.getTime()) / 1000));
          seconds = Math.min(rawDiff, MAX_SESSION_SECONDS);
        } else {
          // Skip sessions with no duration and no endedAt (likely still active or incomplete)
          seconds = 0;
        }

        acc[s.userId] = (acc[s.userId] || 0) + seconds;
        return acc;
      }, {});
    }

    const usersWithStats = users.map(user => ({
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt.toISOString(),
      lastLoginAt: user.lastLoginAt?.toISOString(),
      stats: {
        ratingsCount: user._count.ratings,
        playSessionsCount: user._count.playSessions,
        bookmarksCount: user._count.bookmarks,
        playMinutes: Math.round(((playtimeByUser[user.id] || 0) / 60) * 10) / 10, // minutes with 1 decimal
      },
    }));

    return NextResponse.json({
      users: usersWithStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Users fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: error instanceof Error && error.message.includes('required') ? 401 : 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { role, ...otherData } = body;

    // Only allow role updates for now
    if (role && !['USER', 'ADMIN'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (role) updateData.role = role;
    if (Object.keys(otherData).length > 0) {
      Object.assign(updateData, otherData);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        avatar: true,
        role: true,
        isVerified: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('User update error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: error instanceof Error && error.message.includes('required') ? 401 : 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin();

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Prevent deleting the last admin
    const user = await prisma.user.findUnique({
      where: { id },
      select: { role: true },
    });

    if (user?.role === 'ADMIN') {
      const adminCount = await prisma.user.count({
        where: { role: 'ADMIN' },
      });

      if (adminCount <= 1) {
        return NextResponse.json(
          { error: 'Cannot delete the last admin user' },
          { status: 400 }
        );
      }
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('User delete error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: error instanceof Error && error.message.includes('required') ? 401 : 500 }
    );
  }
}

