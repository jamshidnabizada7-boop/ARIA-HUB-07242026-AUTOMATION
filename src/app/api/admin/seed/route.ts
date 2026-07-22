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

    // 1. Create admin user
    console.log('👤 Creating admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await db.admin.upsert({
      where: { email: 'admin@ariahub.com' },
      create: {
        email: 'admin@ariahub.com',
        password: hashedPassword,
        fullName: 'ARIA HUB Administrator',
      },
      update: {
        password: hashedPassword,
        fullName: 'ARIA HUB Administrator',
      },
    });

    // 2. Create default site settings
    console.log('⚙️  Creating site settings...');
    const settings = await db.siteSetting.upsert({
      where: { id: 'default' },
      create: {
        id: 'default',
        siteName: 'ARIA HUB',
        tagline: 'Professional Business Services Platform',
        description: 'Premium business, visa and opportunity services.',
      },
      update: {},
    });

    // 3. Create opportunity categories
    console.log('📁 Creating opportunity categories...');
    const categories = [
      { slug: 'it-technology', name: 'IT & Technology', nameI18n: { en: 'IT & Technology', fa: 'فناوری اطلاعات', ps: 'معلوماتي ټکنالوژي' } },
      { slug: 'healthcare', name: 'Healthcare', nameI18n: { en: 'Healthcare', fa: 'مراقبت‌های بهداشتی', ps: 'روغتیا پاملرنه' } },
      { slug: 'education', name: 'Education', nameI18n: { en: 'Education', fa: 'آموزش', ps: 'زده کړه' } },
      { slug: 'engineering', name: 'Engineering', nameI18n: { en: 'Engineering', fa: 'مهندسی', ps: 'انجینرۍ' } },
      { slug: 'business', name: 'Business & Management', nameI18n: { en: 'Business & Management', fa: 'کسب و کار و مدیریت', ps: 'سوداګرۍ او مدیریت' } },
      { slug: 'arts', name: 'Arts & Humanities', nameI18n: { en: 'Arts & Humanities', fa: 'هنر و علوم انسانی', ps: 'هنرونه او بشري علوم' } },
      { slug: 'science', name: 'Science', nameI18n: { en: 'Science', fa: 'علوم', ps: 'ساینس' } },
      { slug: 'social-sciences', name: 'Social Sciences', nameI18n: { en: 'Social Sciences', fa: 'علوم اجتماعی', ps: 'ټولنیز علوم' } },
      { slug: 'law', name: 'Law', nameI18n: { en: 'Law', fa: 'حقوق', ps: 'قانون' } },
      { slug: 'finance', name: 'Finance', nameI18n: { en: 'Finance', fa: 'مالی', ps: 'مالیه' } },
      { slug: 'other', name: 'Other', nameI18n: { en: 'Other', fa: 'سایر', ps: 'نور' } },
    ];

    const createdCategories = [];
    for (const cat of categories) {
      const category = await db.opportunityCategory.upsert({
        where: { slug: cat.slug },
        create: cat,
        update: cat,
      });
      createdCategories.push(category);
    }

    // 4. Create import sources
    console.log('🔗 Creating import sources...');
    const source1 = await db.importSource.upsert({
      where: { scraperKey: 'wazifaha' },
      create: {
        name: 'Wazifaha Jobs',
        type: 'job',
        scraperKey: 'wazifaha',
        baseUrl: 'https://wazifaha.org',
        enabled: true,
        autoPublish: true,
        scheduleMinutes: 360,
      },
      update: {},
    });

    const source2 = await db.importSource.upsert({
      where: { scraperKey: 'scholarshipsAf' },
      create: {
        name: 'Scholarships.af',
        type: 'scholarship',
        scraperKey: 'scholarshipsAf',
        baseUrl: 'https://scholarships.af',
        enabled: true,
        autoPublish: true,
        scheduleMinutes: 360,
      },
      update: {},
    });

    console.log('✅ Database seeded successfully!');

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully!',
      data: {
        admin: { email: admin.email, fullName: admin.fullName },
        settings: { siteName: settings.siteName },
        categoriesCount: createdCategories.length,
        importSources: [source1.name, source2.name],
      },
      nextSteps: [
        '1. Login to admin panel: /admin',
        '2. Email: admin@ariahub.com',
        '3. Password: admin123',
        '4. Go to Auto Import tab',
        '5. Click "Run All Imports" to populate opportunities',
      ]
    });

  } catch (error: any) {
    console.error('❌ Seeding failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error.toString(),
    }, { status: 500 });
  }
}
