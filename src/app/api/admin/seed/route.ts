import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

/**
 * One-time database seeding endpoint
 * Visit: /api/admin/seed to populate initial data
 */
export async function GET() {
  try {
    console.log('🚀 Starting database seed...');

    // Check if already seeded
    const existingAdmin = await db.admin.findUnique({
      where: { email: 'admin@ariahub.com' }
    });

    if (existingAdmin) {
      return NextResponse.json({
        success: true,
        message: 'Database already seeded!',
        data: {
          admin: { email: existingAdmin.email, fullName: existingAdmin.fullName },
          alreadySeeded: true,
        },
        nextSteps: [
          '✅ Database is already populated',
          '1. Login to admin panel: /admin',
          '2. Email: admin@ariahub.com',
          '3. Password: admin123',
        ]
      });
    }

    // 1. Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await db.admin.create({
      data: {
        email: 'admin@ariahub.com',
        password: hashedPassword,
        fullName: 'ARIA HUB Administrator',
      },
    });

    // 2. Create default site settings
    await db.siteSetting.create({
      data: {
        id: 'default',
        siteName: 'ARIA HUB',
        tagline: 'Professional Business Services Platform',
        description: 'Premium business, visa and opportunity services.',
      },
    });

    // 3. Create opportunity categories (minimal set)
    const categories = [
      { slug: 'it-technology', name: 'IT & Technology', nameI18n: { en: 'IT & Technology', fa: 'فناوری اطلاعات', ps: 'معلوماتي ټکنالوژي' } },
      { slug: 'healthcare', name: 'Healthcare', nameI18n: { en: 'Healthcare', fa: 'مراقبت‌های بهداشتی', ps: 'روغتیا پاملرنه' } },
      { slug: 'education', name: 'Education', nameI18n: { en: 'Education', fa: 'آموزش', ps: 'زده کړه' } },
      { slug: 'business', name: 'Business', nameI18n: { en: 'Business', fa: 'کسب و کار', ps: 'سوداګرۍ' } },
      { slug: 'other', name: 'Other', nameI18n: { en: 'Other', fa: 'سایر', ps: 'نور' } },
    ];

    await db.opportunityCategory.createMany({
      data: categories,
      skipDuplicates: true,
    });

    // 4. Create import sources
    await db.importSource.createMany({
      data: [
        {
          name: 'Wazifaha Jobs',
          type: 'job',
          scraperKey: 'wazifaha',
          baseUrl: 'https://wazifaha.org',
          enabled: true,
          autoPublish: true,
          scheduleMinutes: 360,
        },
        {
          name: 'Scholarships.af',
          type: 'scholarship',
          scraperKey: 'scholarshipsAf',
          baseUrl: 'https://scholarships.af',
          enabled: true,
          autoPublish: true,
          scheduleMinutes: 360,
        },
      ],
      skipDuplicates: true,
    });

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully! ✅',
      data: {
        admin: { email: admin.email, fullName: admin.fullName },
        categoriesCreated: categories.length,
        importSourcesCreated: 2,
      },
      nextSteps: [
        '✅ Database populated!',
        '1. Login: https://www.myariahub.com/admin',
        '2. Email: admin@ariahub.com',
        '3. Password: admin123',
        '4. Go to Auto Import tab',
        '5. Click "Run All Imports"',
      ]
    });

  } catch (error: any) {
    console.error('❌ Seeding failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }, { status: 500 });
  }
}
