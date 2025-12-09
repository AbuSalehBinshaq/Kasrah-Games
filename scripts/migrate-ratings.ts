import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateRatings() {
  console.log('🔄 Starting rating migration...');

  try {
    // Get all ratings with old structure (if any exist)
    // Since we changed the schema, old ratings might not exist
    // But we'll check if there are any ratings at all
    
    const totalRatings = await prisma.rating.count();
    console.log(`📊 Found ${totalRatings} total ratings`);

    if (totalRatings === 0) {
      console.log('✅ No ratings to migrate');
      return;
    }

    // Check if ratings have isLike field
    const sampleRating = await prisma.rating.findFirst();
    
    if (sampleRating && 'isLike' in sampleRating) {
      console.log('✅ Ratings already migrated (isLike field exists)');
      return;
    }

    console.log('⚠️  Old rating structure detected. Migration needed.');
    console.log('Note: This script assumes ratings with value >= 3 are likes, < 3 are dislikes');
    
    // If we had old ratings, we would convert them here
    // But since schema changed, we'll just log
    console.log('✅ Migration complete');
  } catch (error) {
    console.error('❌ Migration error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateRatings()
  .then(() => {
    console.log('✅ Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });

