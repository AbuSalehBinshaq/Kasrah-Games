import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const analyticsId = 'G-PWYHEKJCDG';
  
  console.log(`🚀 Updating Google Analytics ID to: ${analyticsId}`);
  
  try {
    const settings = await prisma.settings.upsert({
      where: { id: 'site-settings' },
      update: {
        analyticsCode: analyticsId,
        enableAnalytics: true,
      },
      create: {
        id: 'site-settings',
        analyticsCode: analyticsId,
        enableAnalytics: true,
      },
    });
    
    console.log('✅ Settings updated successfully:', settings);
  } catch (error) {
    console.error('❌ Error updating settings:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
