import { db } from './src/lib/db'; async function main() { const sources = await db.importSource.findMany(); console.log(sources.map(s => s.name + ' -> ' + s.scraperKey)); } main();
