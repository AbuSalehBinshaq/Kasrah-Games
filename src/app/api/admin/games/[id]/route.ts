export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { z } from 'zod';

const gameUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().min(10).optional(),
  shortDescription: z.string().min(10).optional(),
  developer: z.string().min(1).optional(),
  publisher: z.string().optional(),
  gameUrl: z.string().url().optional(),
  thumbnail: z.string().url().optional(),
  coverImage: z.string().url().optional(),
  gameType: z.enum(['HTML5', 'WebGL', 'Unity', 'Flash', 'Other']).optional(),
  technologies: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  ageRating: z.string().optional(),
  isFeatured: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  categoryIds: z.array(z.string()).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const game = await prisma.game.findUnique({
      where: { id: params.id },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(game);
  } catch (error) {
    console.error('Game fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: error instanceof Error && error.message.includes('required') ? 401 : 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const body = await request.json();
    const validation = gameUpdateSchema.partial().safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { categoryIds, tags, ...updateData } = validation.data;
    const mutableUpdate: any = { ...updateData };

    // Normalize slug if provided
    if (mutableUpdate.slug) {
      mutableUpdate.slug = mutableUpdate.slug.toLowerCase().trim();
    }

    // Set releaseDate automatically if game is being published and doesn't have a release date
    if (mutableUpdate.isPublished === true) {
      const existingGame = await prisma.game.findUnique({
        where: { id: params.id },
        select: { releaseDate: true },
      });

      // Only set releaseDate if it doesn't exist yet
      if (!existingGame?.releaseDate) {
        mutableUpdate.releaseDate = new Date();
      }
    }

    const game = await prisma.game.update({
      where: { id: params.id },
      data: {
        ...mutableUpdate,
        ...(tags ? { tags } : {}),
        categories: categoryIds
          ? {
              deleteMany: {},
              create: categoryIds.map((categoryId) => ({
                category: { connect: { id: categoryId } },
              })),
            }
          : undefined,
      },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    return NextResponse.json(game);
  } catch (error) {
    console.error('Game update error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: error instanceof Error && error.message.includes('required') ? 401 : 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    await prisma.game.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: 'Game deleted successfully' });
  } catch (error) {
    console.error('Game delete error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: error instanceof Error && error.message.includes('required') ? 401 : 500 }
    );
  }
}

