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
      { code: 'fa', name: 'Persian', nativeName: 'فارسی', direction: 'rtl', isDefault: true, order: 0, flag: '🇦🇫' },
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

    // ── Tools Menu ──────────────────────────────────────────────
    const existingTools = await db.menuItem.findFirst({ where: { url: null, label: 'Tools' } });
    if (!existingTools) {
      const toolsMenu = await db.menuItem.create({
        data: {
          label: 'Tools',
          labelI18n: { en: 'Tools', fa: 'ابزارها', ps: 'وسیلې' },
          url: null,
          order: 99,
          visible: true,
          openInNewTab: false,
        }
      });
      
      await db.menuItem.create({
        data: {
          label: 'CV Builder',
          labelI18n: { en: 'CV Builder', fa: 'رزومه ساز', ps: 'سی وي جوړونکی' },
          url: '/cv-builder',
          parentId: toolsMenu.id,
          order: 1,
          visible: true,
        }
      });

      await db.menuItem.create({
        data: {
          label: 'Opportunity Matcher',
          labelI18n: { en: 'Opportunity Matcher', fa: 'فرصت یاب', ps: 'د فرصت موندونکی' },
          url: '/opportunity-matcher',
          parentId: toolsMenu.id,
          order: 2,
          visible: true,
        }
      });
      logs.push('Tools menu seeded.');
    } else {
      logs.push('Tools menu already exists.');
    }

    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, stack: error.stack });
  }
}
