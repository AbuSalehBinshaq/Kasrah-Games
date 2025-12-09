export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');
    const includeCounts = searchParams.get('includeCounts') === 'true';

    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
      },
      include: includeCounts ? {
        _count: {
          select: { games: true },
        },
      } : undefined,
      orderBy: { order: 'asc' },
      take: limit,
    });

    const categoriesWithCounts = includeCounts
      ? categories.map(category => ({
          ...category,
          gameCount: (category as any)._count?.games ?? 0,
        }))
      : categories;

    return NextResponse.json({ categories: categoriesWithCounts });
  } catch (error) {
    console.error('Categories fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
