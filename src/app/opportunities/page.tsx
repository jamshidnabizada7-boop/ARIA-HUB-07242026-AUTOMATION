import { Metadata } from 'next';
import { getSiteData } from '@/lib/get-site';
import { Navbar } from '@/components/site/navbar';
import { Footer } from '@/components/site/footer';
import { db } from '@/lib/db';
import { OpportunitiesClient } from './client';

export const metadata: Metadata = {
  title: 'All Opportunities | ARIA HUB',
  description: 'Browse all jobs, scholarships, and opportunities.',
};

export const revalidate = 60;

export default async function OpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const data = await getSiteData();
  const sp = await searchParams;
  
  const page = typeof sp.page === 'string' ? parseInt(sp.page, 10) : 1;
  const categoryParam = typeof sp.category === 'string' ? sp.category : 'all';
  
  const take = 12;
  const skip = (Math.max(1, page) - 1) * take;

  const categories = await db.opportunityCategory.findMany({ orderBy: { order: 'asc' } });
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { status: 'published' };
  if (categoryParam !== 'all') {
    where.category = { slug: categoryParam };
  }

  const [opportunities, total] = await Promise.all([
    db.opportunity.findMany({
      where,
      orderBy: [{ sort: 'asc' }, { createdAt: 'desc' }],
      take,
      skip,
      include: { category: true },
    }),
    db.opportunity.count({ where })
  ]);

  const totalPages = Math.max(1, Math.ceil(total / take));

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar
        menu={data.menu}
        languages={data.languages}
        siteName={data.settings?.siteName || 'ARIA HUB'}
        logoUrl={data.settings?.logoUrl ?? null}
      />
      <main className="flex-1 pt-24 pb-20">
        <OpportunitiesClient 
          opportunities={opportunities as any} 
          categories={categories as any}
          currentPage={page}
          totalPages={totalPages}
          currentCategory={categoryParam}
          phone={data.settings?.phone}
        />
      </main>
      <Footer
        settings={data.settings}
        footer={data.footer}
        socialLinks={data.socialLinks}
      />
    </div>
  );
}
