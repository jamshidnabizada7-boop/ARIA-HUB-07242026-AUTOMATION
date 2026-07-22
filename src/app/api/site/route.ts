import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/site — returns all public site data in one payload
export async function GET() {
  const [
    settings,
    languages,
    sections,
    menuItems,
    serviceCategories,
    services,
    visas,
    opportunityCategories,
    opportunities,
    galleryItems,
    paymentMethods,
    testimonials,
    partners,
    counters,
    faqs,
    news,
    socialLinks,
    footerLinks,
    departments,
    branches,
    processSteps,
    pricingPackages,
    teamMembers,
    comparisonRows,
    ctaBanners,
  ] = await Promise.all([
    db.siteSetting.findFirst(),
    db.language.findMany({ where: { enabled: true }, orderBy: { order: 'asc' } }),
    db.section.findMany({ orderBy: { order: 'asc' } }),
    db.menuItem.findMany({ where: { visible: true }, orderBy: { order: 'asc' } }),
    db.serviceCategory.findMany({ orderBy: { order: 'asc' } }),
    db.service.findMany({ where: { status: 'published' }, orderBy: { sort: 'asc' }, include: { category: true } }),
    db.visa.findMany({ where: { status: 'published' }, orderBy: { sort: 'asc' } }),
    db.opportunityCategory.findMany({ orderBy: { order: 'asc' } }),
    db.opportunity.findMany({ where: { status: 'published' }, orderBy: { sort: 'asc' }, include: { category: true } }),
    db.galleryItem.findMany({ orderBy: { order: 'asc' } }),
    db.paymentMethod.findMany({ where: { status: 'active' }, orderBy: { order: 'asc' } }),
    db.testimonial.findMany({ where: { status: 'published' }, orderBy: { order: 'asc' } }),
    db.partner.findMany({ where: { status: 'active' }, orderBy: { order: 'asc' } }),
    db.counter.findMany({ orderBy: { order: 'asc' } }),
    db.faq.findMany({ where: { status: 'published' }, orderBy: { order: 'asc' } }),
    db.news.findMany({ where: { status: 'published' }, orderBy: { publishedAt: 'desc' }, take: 6, include: { category: true } }),
    db.socialLink.findMany({ where: { enabled: true }, orderBy: { order: 'asc' } }),
    db.footerLink.findMany({ orderBy: { order: 'asc' } }),
    db.department.findMany({ orderBy: { order: 'asc' } }),
    db.branch.findMany({ orderBy: { order: 'asc' } }),
    db.processStep.findMany({ where: { status: 'published' }, orderBy: { order: 'asc' } }),
    db.pricingPackage.findMany({ where: { status: 'published' }, orderBy: { order: 'asc' } }),
    db.teamMember.findMany({ where: { status: 'published' }, orderBy: { order: 'asc' } }),
    db.comparisonRow.findMany({ where: { status: 'published' }, orderBy: { order: 'asc' } }),
    db.ctaBanner.findMany({ where: { status: 'published' }, orderBy: { order: 'asc' } }),
  ]);

  const menuTree = buildMenuTree(menuItems as any);
  const footer: Record<string, typeof footerLinks> = {};
  for (const fl of footerLinks) {
    (footer[fl.column] ||= []).push(fl);
  }

  return NextResponse.json({
    settings,
    languages,
    sections,
    menu: menuTree,
    serviceCategories,
    services,
    visas,
    opportunityCategories,
    opportunities,
    gallery: galleryItems,
    paymentMethods,
    testimonials,
    partners,
    counters,
    faqs,
    news,
    socialLinks,
    footer,
    departments,
    branches,
    processSteps,
    pricingPackages,
    teamMembers,
    comparisonRows,
    ctaBanners,
  });
}

function buildMenuTree(items: { id: string; label: string; url: string | null; parentId: string | null; icon: string | null; order: number; openInNewTab: boolean }[]) {
  const map = new Map<string, any>();
  items.forEach(i => map.set(i.id, { ...i, children: [] }));
  const roots: any[] = [];
  for (const i of items) {
    const node = map.get(i.id)!;
    if (i.parentId && map.has(i.parentId)) {
      map.get(i.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}
