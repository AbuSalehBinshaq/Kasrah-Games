import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET single ad
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ad = await prisma.ad.findUnique({
      where: { id: params.id },
    });

    if (!ad) {
      return NextResponse.json({ error: 'Ad not found' }, { status: 404 });
    }

    return NextResponse.json({ ad });
  } catch (error) {
    console.error('Failed to fetch ad:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ad' },
      { status: 500 }
    );
  }
}

// PUT update ad
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      type,
      position,
      size,
      imageUrl,
      clickUrl,
      code,
      startDate,
      endDate,
      targetUrl,
      isActive,
    } = body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (type !== undefined) updateData.type = type;
    if (position !== undefined) updateData.position = position;
    if (size !== undefined) updateData.size = size;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (targetUrl !== undefined) updateData.targetUrl = targetUrl;

    if (type === 'CUSTOM') {
      if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
      if (clickUrl !== undefined) updateData.clickUrl = clickUrl;
      updateData.code = null;
    } else if (type === 'CODE') {
      if (code !== undefined) updateData.code = code;
      updateData.imageUrl = null;
      updateData.clickUrl = null;
    }

    const ad = await prisma.ad.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({ ad });
  } catch (error) {
    console.error('Failed to update ad:', error);
    return NextResponse.json(
      { error: 'Failed to update ad' },
      { status: 500 }
    );
  }
}

// DELETE ad
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.ad.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete ad:', error);
    return NextResponse.json(
      { error: 'Failed to delete ad' },
      { status: 500 }
    );
  }
}

