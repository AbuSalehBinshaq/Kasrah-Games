import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/sdk/analytics/track
 * Track analytics events from SDK
 */
export async function POST(request: NextRequest) {
  try {
    const { events, gameId, sessionId, userId } = await request.json();

    if (!events || !Array.isArray(events) || !gameId || !sessionId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create session if not exists
    await prisma.sDKSession.upsert({
      where: { sessionId },
      update: {
        events: { increment: events.length }
      },
      create: {
        gameId,
        userId: userId || null,
        sessionId,
        events: events.length
      }
    });

    // Batch insert events
    const eventRecords = events.map((event: any) => ({
      gameId,
      sessionId,
      eventName: event.name,
      eventData: event.data || null,
      userId: userId || null,
      timestamp: new Date(event.timestamp)
    }));

    await prisma.sDKAnalyticsEvent.createMany({
      data: eventRecords
    });

    return NextResponse.json({
      success: true,
      eventsTracked: events.length
    });
  } catch (error) {
    console.error('Error tracking analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
