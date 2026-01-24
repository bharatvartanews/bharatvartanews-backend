// prisma/seed-all.ts
import { PrismaClient } from '@prisma/client';
import seedCore from './seed';
import seedWebsite from './seed.website';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting FULL database seed');

  await seedCore(prisma);
  await seedWebsite(prisma);

  console.log('✅ FULL SEED COMPLETED');
}

main()
  .catch(err => {
    console.error('❌ Seed-all failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
