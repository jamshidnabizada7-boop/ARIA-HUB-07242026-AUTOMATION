require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.importSource.findFirst({
    where: { scraperKey: 'acbar' }
  });

  if (!existing) {
    await prisma.importSource.create({
      data: {
        name: 'ACBAR Jobs',
        url: 'https://www.acbar.org/en/jobs?page=1',
        scraperKey: 'acbar',
        isActive: true,
        autoPublish: true,
        defaultCategory: 'jobs',
        config: { maxPages: 20 },
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
