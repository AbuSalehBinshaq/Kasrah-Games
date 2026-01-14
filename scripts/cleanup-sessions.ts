import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanup() {
  console.log('🚀 Starting database cleanup...');
  
  try {
    // Delete sessions older than 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const deleted = await prisma.playSession.deleteMany({
      where: {
        startedAt: {
          lt: twentyFourHoursAgo,
        },
      },
    });
    
    console.log(`✅ Cleanup successful! Deleted ${deleted.count} old sessions.`);
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

cleanup();
