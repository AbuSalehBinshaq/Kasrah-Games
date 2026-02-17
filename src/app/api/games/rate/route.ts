import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

const rateSchema = z.object({
  isLike: z.boolean(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = rateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { isLike } = validation.data;

    // Check if user has already rated this game
    const existingRating = await prisma.rating.findUnique({
      where: {
        userId_gameId: {
          userId: user.id,
          gameId: params.id,
        },
      },
    });

    let updatedRating;
    if (existingRating) {
      updatedRating = await prisma.rating.update({
        where: { id: existingRating.id },
        data: { isLike },
      });
    } else {
      updatedRating = await prisma.rating.create({
        data: {
          isLike,
          userId: user.id,
          gameId: params.id,
        },
      });
    }

    // Calculate new average rating
    const gameRatings = await prisma.rating.findMany({
      where: { gameId: params.id },
      select: { isLike: true },
    });

    const totalRatings = gameRatings.length;
    const likesCount = gameRatings.filter((r) => r.isLike).length;
    const likePercentage = totalRatings > 0 ? Math.round((likesCount / totalRatings) * 1000) / 10 : 0;

    return NextResponse.json({
      rating: updatedRating,
      likePercentage,
      totalRatings,
    });
  } catch (error) {
    console.error('Rating error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
