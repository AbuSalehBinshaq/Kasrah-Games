import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { nanoid } from 'nanoid';

// GET - الحصول على معلومات اللعبة مع Game ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('gameId');
    const slug = searchParams.get('slug');

    if (!gameId && !slug) {
      return NextResponse.json(
        { error: 'Game ID or slug is required' },
        { status: 400 }
      );
    }

    const game = await prisma.game.findUnique({
      where: gameId ? { id: gameId } : { slug: slug! },
      include: {
        sdkConfig: true,
        sdkAds: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
        },
        categories: {
          include: { category: true },
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
    console.error('Error fetching game:', error);
    return NextResponse.json(
      { error: 'Failed to fetch game' },
      { status: 500 }
    );
  }
}

// POST - إنشاء Game ID جديد للعبة
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { gameId, generateNewId } = body;

    if (!gameId) {
      return NextResponse.json(
        { error: 'Game ID is required' },
        { status: 400 }
      );
    }

    const game = await prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    // إنشاء SDK Config جديد
    let sdkConfig = await prisma.sDKConfig.findUnique({
      where: { gameId },
    });

    if (!sdkConfig) {
      const apiKey = `kasrah_${nanoid(32)}`;
      sdkConfig = await prisma.sDKConfig.create({
        data: {
          gameId,
          apiKey,
        },
      });
    } else if (generateNewId) {
      // إعادة توليد API Key
      const apiKey = `kasrah_${nanoid(32)}`;
      sdkConfig = await prisma.sDKConfig.update({
        where: { gameId },
        data: { apiKey },
      });
    }

    return NextResponse.json({
      game: {
        id: game.id,
        gameId: game.gameId,
        title: game.title,
      },
      sdkConfig,
    });
  } catch (error) {
    console.error('Error creating SDK config:', error);
    return NextResponse.json(
      { error: 'Failed to create SDK config' },
      { status: 500 }
    );
  }
}

// PUT - تحديث معلومات اللعبة
export async function PUT(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Game ID is required' },
        { status: 400 }
      );
    }

    const game = await prisma.game.update({
      where: { id },
      data: updateData,
      include: {
        sdkConfig: true,
      },
    });

    return NextResponse.json(game);
  } catch (error) {
    console.error('Error updating game:', error);
    return NextResponse.json(
      { error: 'Failed to update game' },
      { status: 500 }
    );
  }
}