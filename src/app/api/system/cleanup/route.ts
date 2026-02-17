import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Simple security check using a secret key from environment variables
    // If not set, it will require a query param 'key' to match 'cleanup_secret'
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    const secretKey = process.env.CLEANUP_KEY || 'kasrah_cleanup_2026';

    if (key !== secretKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🚀 Starting manual database cleanup via API...');
    
    // Delete sessions older than 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const deleted = await prisma.playSession.deleteMany({
      where: {
        startedAt: {
          lt: twentyFourHoursAgo,
        },
      },
    });
    
    return NextResponse.json({
      success: true,
      message: `Cleanup successful! Deleted ${deleted.count} old sessions.`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ API Cleanup failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 });
  }
}
