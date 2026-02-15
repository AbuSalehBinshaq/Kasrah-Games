import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/sdk/data/load
 * Load game data for a user
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const key = searchParams.get('key');
    const gameId = searchParams.get('gameId');
    const userId = searchParams.get('userId');

    if (!key || !gameId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Load data
    const data = await prisma.sDKGameData.findUnique({
      where: {
        userId_gameId_key: {
          userId,
          gameId,
          key
        }
      }
    });

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Data not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data.value
    });
  } catch (error) {
    console.error('Error loading data:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}