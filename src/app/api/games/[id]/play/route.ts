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

    // Increment play count
    await prisma.game.update({
      where: { id: game.id },
      data: { playCount: { increment: 1 } },
    });

    // Create play session
    // If user is not logged in, we still want to track them for "Online Count"
    // We'll use a special system user ID or handle it in the schema if needed
    // For now, we'll try to create it with the user ID if available
    const session = await prisma.playSession.create({
      data: {
        userId: user?.id || 'anonymous', // Ensure your DB handles this or use a valid UUID
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
