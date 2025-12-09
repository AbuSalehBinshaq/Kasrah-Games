'use server';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { gameId, folder = 'favorites' } = body || {};

    if (!gameId) {
      return NextResponse.json({ error: 'gameId is required' }, { status: 400 });
    }

    // Ensure game exists
    const game = await prisma.game.findUnique({ where: { id: gameId } });
    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    // Create or return existing bookmark (unique on user+game+folder)
    const bookmark = await prisma.bookmark.upsert({
      where: {
        userId_gameId_folder: {
          userId: user.id,
          gameId,
          folder,
        },
      },
      update: {},
      create: {
        userId: user.id,
        gameId,
        folder,
      },
    });

    return NextResponse.json({ success: true, bookmarkId: bookmark.id });
  } catch (error) {
    console.error('Bookmark error:', error);
    return NextResponse.json({ error: 'Failed to save bookmark' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { gameId, folder = 'favorites' } = body || {};

    if (!gameId) {
      return NextResponse.json({ error: 'gameId is required' }, { status: 400 });
    }

    await prisma.bookmark.deleteMany({
      where: { userId: user.id, gameId, folder },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Bookmark delete error:', error);
    return NextResponse.json({ error: 'Failed to remove bookmark' }, { status: 500 });
  }
}

