import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

// GET - الحصول على إحصائيات اللعبة
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('gameId');
    const period = searchParams.get('period') || 'day'; // day, week, month, year

    if (!gameId) {
      return NextResponse.json(
        { error: 'Game ID is required' },
        { status: 400 }
      );
    }

    // حساب تاريخ البداية بناءً على الفترة
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default: // day
        startDate.setDate(now.getDate() - 1);
    }

    // الحصول على إحصائيات اللعبة
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      select: {
        id: true,
        gameId: true,
        title: true,
        playCount: true,
        views: true,
        totalRevenue: true,
      },
    });

    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    // إحصائيات الجلسات
    const sessions = await prisma.sDKSession.findMany({
      where: {
        gameId,
        startedAt: { gte: startDate },
      },
      select: {
        id: true,
        duration: true,
        adCount: true,
        adRevenue: true,
      },
    });

    // إحصائيات الإعلانات
    const adImpressions = await prisma.sDKAdImpression.findMany({
      where: {
        gameId,
        createdAt: { gte: startDate },
      },
    });

    // إحصائيات الأحداث
    const events = await prisma.sDKAnalyticsEvent.findMany({
      where: {
        gameId,
        timestamp: { gte: startDate },
      },
    });

    // الحسابات
    const totalSessions = sessions.length;
    const totalAdImpressions = adImpressions.length;
    const completedAds = adImpressions.filter(a => a.completed).length;
    const totalRevenue = sessions.reduce((sum, s) => sum + s.adRevenue, 0);
    const avgSessionDuration = totalSessions > 0 
      ? Math.round(sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / totalSessions)
      : 0;
    const ctr = totalAdImpressions > 0 
      ? ((completedAds / totalAdImpressions) * 100).toFixed(2)
      : '0';

    return NextResponse.json({
      game,
      period,
      stats: {
        totalSessions,
        totalAdImpressions,
        completedAds,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        avgSessionDuration,
        ctr: parseFloat(ctr),
        totalEvents: events.length,
        uniqueUsers: new Set(sessions.map(s => s.userId)).size,
      },
      timeline: {
        sessions: totalSessions,
        impressions: totalAdImpressions,
        revenue: totalRevenue,
      },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

// POST - حفظ إحصائيات يومية
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
    const { gameId, date, totalPlays, totalUsers, totalSessions, totalAdImpressions, totalAdClicks, totalRevenue, avgSessionDuration } = body;

    if (!gameId || !date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const stats = await prisma.sDKGameStats.upsert({
      where: {
        gameId_date: {
          gameId,
          date: new Date(date),
        },
      },
      create: {
        gameId,
        date: new Date(date),
        totalPlays: totalPlays || 0,
        totalUsers: totalUsers || 0,
        totalSessions: totalSessions || 0,
        totalAdImpressions: totalAdImpressions || 0,
        totalAdClicks: totalAdClicks || 0,
        totalRevenue: totalRevenue || 0,
        avgSessionDuration: avgSessionDuration || 0,
      },
      update: {
        totalPlays: totalPlays || undefined,
        totalUsers: totalUsers || undefined,
        totalSessions: totalSessions || undefined,
        totalAdImpressions: totalAdImpressions || undefined,
        totalAdClicks: totalAdClicks || undefined,
        totalRevenue: totalRevenue || undefined,
        avgSessionDuration: avgSessionDuration || undefined,
      },
    });

    return NextResponse.json(stats, { status: 201 });
  } catch (error) {
    console.error('Error saving stats:', error);
    return NextResponse.json(
      { error: 'Failed to save stats' },
      { status: 500 }
    );
  }
}