import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const identifier = params.id;
    
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
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    const user = await getCurrentUser();

    // Increment play count only if it's a new session or after some time
    // For simplicity and accuracy, we increment on every POST request to this endpoint
    // which is triggered when the user clicks "Play Now"
    await prisma.game.update({
      where: { id: game.id },
      data: { playCount: { increment: 1 } },
    });

    // Create play session
    const session = await prisma.playSession.create({
      data: {
        userId: user?.id || 'anonymous',
        gameId: game.id,
        duration: 0,
        startedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
    });
  } catch (error) {
    console.error('Play session error:', error);
    return NextResponse.json({ success: true, message: 'Started' }, { status: 200 });
  }
}
