/**
 * seed-admin-neon-http.ts
 * Seeds the admin user into Neon via HTTP (port 443).
 */
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import * as fs from 'fs';

// Load .env
const envFile = fs.readFileSync('.env', 'utf-8');
const envVars: Record<string, string> = {};
for (const line of envFile.split('\n')) {
  const match = line.match(/^([^#=\r]+)=(.*)$/);
  if (match) envVars[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
}

const DATABASE_URL = envVars['DATABASE_URL'] || process.env.DATABASE_URL;
if (!DATABASE_URL) { console.error('❌ DATABASE_URL not found'); process.exit(1); }

const sql = neon(DATABASE_URL);

async function run() {
  const email = 'admin@ariahub.com';
  const password = 'admin123';
  const hash = await bcrypt.hash(password, 10);
  const id = 'admin-' + Date.now();

  await sql`
    INSERT INTO "AdminUser" (id, email, password, name, role, "createdAt", "updatedAt")
    VALUES (${id}, ${email}, ${hash}, 'Super Admin', 'super_admin', now(), now())
    ON CONFLICT (email) DO UPDATE SET password = ${hash}, "updatedAt" = now()
  `;

  console.log('✅ Admin user created:');
  console.log('   Email:    admin@ariahub.com');
  console.log('   Password: admin123');
  console.log('   Login at: /admin');
}

run().catch(e => { console.error('❌', e?.message || e); process.exit(1); });
