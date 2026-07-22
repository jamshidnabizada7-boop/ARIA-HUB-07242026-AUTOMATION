import { db } from '@/lib/db';
import type { SiteData, MenuItem } from '@/lib/types';

export async function getSiteData(): Promise<SiteData> {
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

  const menuTree = buildMenuTree(menuItems as any) as MenuItem[];
  const footer: Record<string, typeof footerLinks> = {};
  for (const fl of footerLinks) {
    (footer[fl.column] ||= []).push(fl);
  }

  return {
    settings: settings as any,
    languages: languages as any,
    sections: sections as any,
    menu: menuTree,
    serviceCategories: serviceCategories as any,
    services: services as any,
    visas: visas as any,
    opportunityCategories: opportunityCategories as any,
    opportunities: opportunities as any,
    gallery: galleryItems as any,
    paymentMethods: paymentMethods as any,
    testimonials: testimonials as any,
    partners: partners as any,
    counters: counters as any,
    faqs: faqs as any,
    news: news as any,
    socialLinks: socialLinks as any,
    footer,
    departments: departments as any,
    branches: branches as any,
    processSteps: processSteps as any,
    pricingPackages: pricingPackages as any,
    teamMembers: teamMembers as any,
    comparisonRows: comparisonRows as any,
    ctaBanners: ctaBanners as any,
  };
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
