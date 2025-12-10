import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET active ads for display
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const position = searchParams.get('position');

    const where: any = {
      isActive: true,
      OR: [
        { startDate: null },
        { startDate: { lte: new Date() } },
      ],
      AND: [
        {
          OR: [
            { endDate: null },
            { endDate: { gte: new Date() } },
          ],
        },
      ],
    };

    if (position) {
      where.position = position;
    }

    const ads = await prisma.ad.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ ads });
  } catch (error) {
    console.error('Failed to fetch ads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ads' },
      { status: 500 }
    );
  }
}

