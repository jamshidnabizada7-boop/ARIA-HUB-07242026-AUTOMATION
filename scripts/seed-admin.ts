import { db } from '../src/lib/db';
import bcrypt from 'bcryptjs';

async function main() {
  const email = 'admin@ariahub.com';
  const password = 'admin123';
  const hash = await bcrypt.hash(password, 10);

  await db.adminUser.upsert({
    where: { email },
    update: { password: hash },
    create: {
      email,
      name: 'Super Admin',
      password: hash,
      role: 'super_admin',
    },
  });

  console.log('✅ Admin user created:');
  console.log('   Email:    admin@ariahub.com');
  console.log('   Password: admin123');
  console.log('   Login at: /admin');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await db.$disconnect(); });
