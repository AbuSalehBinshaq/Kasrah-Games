import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const MAX_DATA_SIZE = 2 * 1024 * 1024; // 2MB

/**
 * POST /api/sdk/data/save
 * Save game data for a user
 */
export async function POST(request: NextRequest) {
  try {
    const { key, value, gameId, userId } = await request.json();

    if (!key || !gameId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate data size
    const dataSize = JSON.stringify(value).length;
    if (dataSize > MAX_DATA_SIZE) {
      return NextResponse.json(
        { success: false, error: `Data exceeds maximum size of ${MAX_DATA_SIZE} bytes` },
        { status: 413 }
      );
    }

    // Save or update data
    const savedData = await prisma.sDKGameData.upsert({
      where: {
        userId_gameId_key: {
          userId,
          gameId,
          key
        }
      },
      update: {
        value,
        size: dataSize,
        updatedAt: new Date()
      },
      create: {
        userId,
        gameId,
        key,
        value,
        size: dataSize
      }
    });

    return NextResponse.json({
      success: true,
      data: savedData
    });
  } catch (error) {
    console.error('Error saving data:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
