import { db } from './src/lib/db';

async function main() {
  const published = await db.opportunity.count({ where: { status: 'published' } });
  const all = await db.opportunity.count();
  console.log('Total published:', published);
  console.log('Total in DB:', all);

  const categories = await db.opportunityCategory.findMany();
  console.log('Categories:', categories);

  const one = await db.opportunity.findFirst({ include: { category: true } });
  console.log('Sample opportunity:', one);
}

main().catch(console.error);
