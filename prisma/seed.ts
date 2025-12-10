import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // إنشاء إعدادات الموقع
  console.log('📝 Creating site settings...');
  await prisma.settings.upsert({
    where: { id: 'site-settings' },
    update: {},
    create: {
      id: 'site-settings',
      siteName: 'Kasrah Games',
      siteDescription: 'Play the best HTML5 and WebGL games online',
      allowRegistration: true,
      enableRatings: true,
      enableBookmarks: true,
      showStatistics: true,
      gamesPerPage: 12,
    },
  });
  console.log('✅ Settings created');

  // إنشاء الفئات
  console.log('📂 Creating categories...');
  const categories = [
    { slug: 'action', name: 'Action', description: 'Fast-paced games with combat and adventure', color: '#ef4444', order: 1 },
    { slug: 'puzzle', name: 'Puzzle', description: 'Brain-teasing and logic games', color: '#3b82f6', order: 2 },
    { slug: 'strategy', name: 'Strategy', description: 'Games requiring planning and tactics', color: '#10b981', order: 3 },
    { slug: 'sports', name: 'Sports', description: 'Sports and racing games', color: '#f59e0b', order: 4 },
    { slug: 'arcade', name: 'Arcade', description: 'Classic arcade-style games', color: '#8b5cf6', order: 5 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log('✅ Categories created');

  // إنشاء حساب إداري
  console.log('👤 Creating admin account...');
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@kasrahgames.com' },
    update: {},
    create: {
      email: 'admin@kasrahgames.com',
      username: 'admin',
      password: hashedPassword,
      name: 'Admin',
      role: 'ADMIN',
      isVerified: true,
    },
  });
  console.log('✅ Admin account created');

  console.log('');
  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('📧 Admin credentials:');
  console.log('   Email: admin@kasrahgames.com');
  console.log('   Password: admin123');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

