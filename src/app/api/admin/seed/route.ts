import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const logs: string[] = [];
    logs.push('Started seeding...');

    // ── Languages ──────────────────────────────────────────────
    const langs = [
      { code: 'en', name: 'English', nativeName: 'English', direction: 'ltr', isDefault: false, order: 1, flag: '🇬🇧' },
      { code: 'fa', name: 'Dari', nativeName: 'دری', direction: 'rtl', isDefault: true, order: 0, flag: '🇦🇫' },
      { code: 'ps', name: 'Pashto', nativeName: 'پښتو', direction: 'rtl', isDefault: false, order: 2, flag: '🇦🇫' },
    ];
    for (const l of langs) {
      await db.language.upsert({ where: { code: l.code }, update: l, create: l });
    }
    logs.push('Languages seeded.');

    // ── Admin User ──────────────────────────────────────────────
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
    logs.push('Admin seeded.');

    // ── Site settings ──────────────────────────────────────────
    await db.siteSetting.upsert({
      where: { id: 'singleton' },
      update: {},
      create: {
        id: 'singleton',
        siteName: 'ARIA HUB',
      },
    });
    logs.push('Settings seeded.');

    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, stack: error.stack });
  }
}
