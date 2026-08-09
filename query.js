require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();
db.counter.findMany().then(c => console.log(JSON.stringify(c, null, 2))).finally(() => db.$disconnect());
