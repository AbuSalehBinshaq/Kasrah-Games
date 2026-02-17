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
      // If user clicks the same vote again, remove the vote
      if (existingRating.isLike === isLike) {
        updatedRating = await prisma.rating.delete({
          where: { id: existingRating.id },
        });
      } else {
        // Update the vote
        updatedRating = await prisma.rating.update({
          where: { id: existingRating.id },
          data: { isLike },
        });
      }
    } else {
      // Create new rating
      updatedRating = await prisma.rating.create({
        data: {
          isLike,
          userId: user.id,
          gameId: params.id,
        },
      });
    }

    // Calculate new likes and dislikes
    const gameRatings = await prisma.rating.findMany({
      where: { gameId: params.id },
      select: { isLike: true },
    });

    const likes = gameRatings.filter(r => r.isLike).length;
    const dislikes = gameRatings.filter(r => !r.isLike).length;
    const total = likes + dislikes;
    const likePercentage = total > 0 ? Math.round((likes / total) * 100) : 0;

    // Get user's current vote
    const userRating = await prisma.rating.findUnique({
      where: {
        userId_gameId: {
          userId: user.id,
          gameId: params.id,
        },
      },
    });

    return NextResponse.json({
      likes,
      dislikes,
      likePercentage,
      totalRatings: total,
      userVote: userRating ? (userRating.isLike ? 'like' : 'dislike') : null,
    });
  } catch (error) {
    console.error('Rating error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

