const { PrismaClient } = require('@prisma/client');
(async () => {
  const db = new PrismaClient({ log: ['error', 'warn'] });
  try {
    console.log('site', await db.siteSetting.count());
    console.log('service', await db.service.count());
    console.log('menu', await db.menuItem.count());
  } finally {
    await db.$disconnect();
  }
})();
