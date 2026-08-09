require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function main() {
  const res = await db.opportunity.updateMany({
    where: { sourceUrl: { contains: 'scholarships.af' } },
    data: { contentHash: '' }
  });
  console.log('Updated:', res);
}

main().finally(() => db.$disconnect());
