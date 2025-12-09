import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const identifier = params.id;
    
    // Check if game exists and is published (try slug first, then id)
    const game = await prisma.game.findFirst({
      where: {
        OR: [
          { slug: identifier },
          { id: identifier },
        ],
      },
      select: { id: true, isPublished: true },
    });

    if (!game || !game.isPublished) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    // Try to get current user (optional - for tracking)
    const user = await getCurrentUser();

    // Increment play count (for all users, logged in or not)
    await prisma.game.update({
      where: { id: game.id },
      data: { playCount: { increment: 1 } },
    });

    // Create play session only if user is logged in (optional tracking)
    if (user) {
      try {
        await prisma.playSession.create({
          data: {
            userId: user.id,
            gameId: game.id,
            duration: 0, // Will be updated when session ends
            startedAt: new Date(),
          },
        });
      } catch (error) {
        // If play session creation fails, don't fail the whole request
        console.error('Failed to create play session:', error);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Play session started',
    });
  } catch (error) {
    console.error('Play session error:', error);
    // Don't fail the request - allow playing even if tracking fails
    return NextResponse.json(
      { success: true, message: 'Game started (tracking may have failed)' },
      { status: 200 }
    );
  }
}

