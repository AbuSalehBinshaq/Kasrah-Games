import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma Client
const prisma = new PrismaClient();

/**
 * Cloud Save API for External SDK
 * Uses the new CloudSave table to store player data
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { gameId, data, userId } = body;

    if (!gameId || !data) {
      return NextResponse.json({ success: false, error: 'Missing gameId or data' }, { status: 400 });
    }

    // Save or update data in the new CloudSave table
    // We'll use upsert if we had a unique constraint, but for now we'll just create a new entry
    // or we can find the existing one and update it.
    
    const existingSave = await prisma.cloudSave.findFirst({
      where: {
        gameId,
        userId: userId || 'anonymous'
      }
    });

    if (existingSave) {
      await prisma.cloudSave.update({
        where: { id: existingSave.id },
        data: {
          data,
          updatedAt: new Date()
        }
      });
    } else {
      await prisma.cloudSave.create({
        data: {
          gameId,
          userId: userId || 'anonymous',
          data
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Data saved successfully to CloudSave table' 
    });
  } catch (error: any) {
    console.error('Cloud Save Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const gameId = searchParams.get('gameId');
    const userId = searchParams.get('userId');

    if (!gameId) {
      return NextResponse.json({ success: false, error: 'Missing gameId' }, { status: 400 });
    }

    // Retrieve the latest save from CloudSave table
    const latestSave = await prisma.cloudSave.findFirst({
      where: {
        gameId,
        userId: userId || 'anonymous'
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: latestSave?.data || {},
      lastUpdated: latestSave?.updatedAt
    });
  } catch (error: any) {
    console.error('Cloud Load Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
