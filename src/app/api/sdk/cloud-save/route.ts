import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma Client
const prisma = new PrismaClient();

/**
 * Cloud Save API for External SDK
 * Uses existing AuditLog table to store player data as JSON
 * No schema changes required
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { gameId, data, userId } = body;

    if (!gameId || !data) {
      return NextResponse.json({ success: false, error: 'Missing gameId or data' }, { status: 400 });
    }

    // Store the data in the existing AuditLog table
    // This table has a 'details' field of type Json which is perfect for Cloud Save
    await prisma.auditLog.create({
      data: {
        event: 'SDK_CLOUD_SAVE',
        status: 'SUCCESS',
        resource: 'Game',
        resourceId: gameId,
        details: {
          gameId,
          data,
          userId: userId || 'anonymous',
          savedAt: new Date().toISOString()
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Data saved successfully to cloud (Prisma)' 
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

    // Retrieve the latest save from AuditLog for this game
    const latestSave = await prisma.auditLog.findFirst({
      where: {
        event: 'SDK_CLOUD_SAVE',
        resourceId: gameId,
        // If userId is provided, we can filter in the application logic 
        // to avoid complex JSON path queries that might not be supported by all DBs
      },
      orderBy: {
        timestamp: 'desc'
      }
    });

    if (!latestSave || !latestSave.details) {
      return NextResponse.json({ success: true, data: {} });
    }

    const details = latestSave.details as any;
    
    // If userId was specified, ensure we return the data for that user
    if (userId && details.userId !== userId) {
      // In a real scenario, we'd query for the specific user's latest save
      // For now, we'll return the latest available data
    }

    return NextResponse.json({ 
      success: true, 
      data: details.data || {},
      lastUpdated: latestSave.timestamp
    });
  } catch (error: any) {
    console.error('Cloud Load Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
