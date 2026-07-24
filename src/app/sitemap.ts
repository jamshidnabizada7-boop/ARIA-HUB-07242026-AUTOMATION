import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';

export const revalidate = 86400; // Cache sitemap for 24 hours

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Use the most-recently-updated opportunity to signal freshness for the
  // opportunities section (helps crawlers detect new content).
  let oppLastModified = now;
  try {
    const latest = await db.opportunity.findFirst({
      where: { status: 'published' },
      orderBy: { updatedAt: 'desc' },
      select: { updatedAt: true },
    });
    if (latest?.updatedAt) oppLastModified = latest.updatedAt;
  } catch {
    // ignore — fall back to now
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://myariahub.com';

  return [
    {
      url: baseUrl,
      lastModified: oppLastModified,
      changeFrequency: 'daily',
      priority: 1,
    }
  ];
}
