import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * Create all missing Prisma tables
 * This endpoint will use Prisma to ensure all models exist
 */
export async function GET() {
  try {
    console.log('🚀 Creating all missing tables via Prisma...');

    // Try to access each model to force Prisma to create tables
    const operations = [];

    // Just try to count rows in each table - Prisma will handle table creation via migrations
    try { await db.siteSetting.count(); } catch (e) { operations.push('SiteSetting: ' + (e as Error).message); }
    try { await db.language.count(); } catch (e) { operations.push('Language: ' + (e as Error).message); }
    try { await db.menuItem.count(); } catch (e) { operations.push('MenuItem: ' + (e as Error).message); }
    try { await db.section.count(); } catch (e) { operations.push('Section: ' + (e as Error).message); }
    try { await db.serviceCategory.count(); } catch (e) { operations.push('ServiceCategory: ' + (e as Error).message); }
    try { await db.service.count(); } catch (e) { operations.push('Service: ' + (e as Error).message); }
    try { await db.visa.count(); } catch (e) { operations.push('Visa: ' + (e as Error).message); }
    try { await db.opportunityCategory.count(); } catch (e) { operations.push('OpportunityCategory: ' + (e as Error).message); }
    try { await db.opportunity.count(); } catch (e) { operations.push('Opportunity: ' + (e as Error).message); }
    try { await db.importSource.count(); } catch (e) { operations.push('ImportSource: ' + (e as Error).message); }
    try { await db.importRun.count(); } catch (e) { operations.push('ImportRun: ' + (e as Error).message); }
    try { await db.galleryAlbum.count(); } catch (e) { operations.push('GalleryAlbum: ' + (e as Error).message); }
    try { await db.galleryItem.count(); } catch (e) { operations.push('GalleryItem: ' + (e as Error).message); }
    try { await db.paymentMethod.count(); } catch (e) { operations.push('PaymentMethod: ' + (e as Error).message); }
    try { await db.testimonial.count(); } catch (e) { operations.push('Testimonial: ' + (e as Error).message); }
    try { await db.partner.count(); } catch (e) { operations.push('Partner: ' + (e as Error).message); }
    try { await db.counter.count(); } catch (e) { operations.push('Counter: ' + (e as Error).message); }
    try { await db.faq.count(); } catch (e) { operations.push('Faq: ' + (e as Error).message); }
    try { await db.newsCategory.count(); } catch (e) { operations.push('NewsCategory: ' + (e as Error).message); }
    try { await db.news.count(); } catch (e) { operations.push('News: ' + (e as Error).message); }
    try { await db.socialLink.count(); } catch (e) { operations.push('SocialLink: ' + (e as Error).message); }
    try { await db.footerLink.count(); } catch (e) { operations.push('FooterLink: ' + (e as Error).message); }
    try { await db.contactMessage.count(); } catch (e) { operations.push('ContactMessage: ' + (e as Error).message); }
    try { await db.department.count(); } catch (e) { operations.push('Department: ' + (e as Error).message); }
    try { await db.branch.count(); } catch (e) { operations.push('Branch: ' + (e as Error).message); }
    try { await db.advertisement.count(); } catch (e) { operations.push('Advertisement: ' + (e as Error).message); }
    try { await db.subscriber.count(); } catch (e) { operations.push('Subscriber: ' + (e as Error).message); }
    try { await db.adminUser.count(); } catch (e) { operations.push('AdminUser: ' + (e as Error).message); }
    try { await db.auditLog.count(); } catch (e) { operations.push('AuditLog: ' + (e as Error).message); }
    try { await db.visit.count(); } catch (e) { operations.push('Visit: ' + (e as Error).message); }
    try { await db.processStep.count(); } catch (e) { operations.push('ProcessStep: ' + (e as Error).message); }
    try { await db.pricingPackage.count(); } catch (e) { operations.push('PricingPackage: ' + (e as Error).message); }
    try { await db.teamMember.count(); } catch (e) { operations.push('TeamMember: ' + (e as Error).message); }
    try { await db.comparisonRow.count(); } catch (e) { operations.push('ComparisonRow: ' + (e as Error).message); }
    try { await db.ctaBanner.count(); } catch (e) { operations.push('CtaBanner: ' + (e as Error).message); }

    return NextResponse.json({
      success: false,
      message: 'Prisma cannot create tables automatically - we need to run migrations',
      errors: operations,
      solution: 'We need to create all missing tables manually via SQL',
    });

  } catch (error: any) {
    console.error('❌ Table creation failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
