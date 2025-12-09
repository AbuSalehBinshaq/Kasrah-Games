const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.update({
      where: { email: 'admin@kasrah.com' },
      data: { role: 'ADMIN' },
    });
    console.log(`Successfully promoted user ${user.email} to role ${user.role}`);
  } catch (e) {
    console.error('Error promoting user:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
