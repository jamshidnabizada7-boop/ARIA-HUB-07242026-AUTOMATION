import { config } from 'dotenv';
config({ path: '.env.local' });
config({ path: '.env' });

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.importSource.findFirst({
    where: { scraperKey: 'acbar' }
  });

  if (!existing) {
    await prisma.importSource.create({
      data: {
        id: 'source-3',
        name: 'ACBAR Jobs',
        type: 'job',
        scraperKey: 'acbar',
        baseUrl: 'https://www.acbar.org/en/jobs',
        enabled: true,
        autoPublish: true,
        scheduleMinutes: 360,
      }
    });
    console.log('Added ACBAR to ImportSource');
  } else {
    console.log('ACBAR already exists');
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
