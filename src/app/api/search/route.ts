import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/search?q=...
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() || '';
  if (q.length < 2) return NextResponse.json({ results: [] });
  const [services, visas, opportunities, news] = await Promise.all([
    db.service.findMany({ where: { status: 'published', OR: [{ title: { contains: q } }, { excerpt: { contains: q } }] }, take: 5 }),
    db.visa.findMany({ where: { status: 'published', OR: [{ country: { contains: q } }, { visaType: { contains: q } }] }, take: 5 }),
    db.opportunity.findMany({ where: { status: 'published', OR: [{ title: { contains: q } }, { organization: { contains: q } }] }, take: 5 }),
    db.news.findMany({ where: { status: 'published', OR: [{ title: { contains: q } }, { excerpt: { contains: q } }] }, take: 5 }),
  ]);
  const results = [
    ...services.map(s => ({ type: 'Service', title: s.title, subtitle: s.excerpt, url: `#services`, image: s.image })),
    ...visas.map(v => ({ type: 'Visa', title: `${v.country} — ${v.visaType}`, subtitle: v.duration || '', url: `#visas`, image: v.image })),
    ...opportunities.map(o => ({ type: 'Opportunity', title: o.title, subtitle: o.organization || '', url: `#opportunities`, image: o.image })),
    ...news.map(n => ({ type: 'News', title: n.title, subtitle: n.excerpt, url: `#news`, image: n.image })),
  ];
  return NextResponse.json({ results });
}
