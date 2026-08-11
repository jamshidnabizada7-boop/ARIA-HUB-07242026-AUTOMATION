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
  const q = typeof sp.q === 'string' ? sp.q : '';
  const location = typeof sp.location === 'string' ? sp.location : 'all';
  const sortParam = typeof sp.sort === 'string' ? sp.sort : 'newest';
  
  const take = 12;
  const skip = (Math.max(1, page) - 1) * take;

  const categories = await db.opportunityCategory.findMany({ orderBy: { order: 'asc' } });
  
  const where: any = { status: 'published' };
  const AND: any[] = [];

  if (categoryParam !== 'all') {
    const singularCat = categoryParam.replace(/s$/, '');
    
    if (categoryParam.toLowerCase().includes('job')) {
      AND.push({
        OR: [
          { sourceName: { in: ['ACBAR', 'Wazifaha'] } },
          { category: { slug: categoryParam } },
          { jobType: { contains: singularCat, mode: 'insensitive' } },
          { jobType: { equals: categoryParam, mode: 'insensitive' } }
        ]
      });
      // Ensure scholarships don't leak into jobs
      AND.push({
        sourceName: { not: 'Scholarships.af' }
      });
    } else if (categoryParam.toLowerCase().includes('scholarship')) {
      AND.push({
        OR: [
          { sourceName: 'Scholarships.af' },
          { category: { slug: categoryParam } },
          { jobType: { contains: singularCat, mode: 'insensitive' } },
          { jobType: { equals: categoryParam, mode: 'insensitive' } }
        ]
      });
      // Ensure jobs don't leak into scholarships
      AND.push({
        sourceName: { notIn: ['ACBAR', 'Wazifaha'] }
      });
    } else {
      AND.push({
        OR: [
          { category: { slug: categoryParam } },
          { jobType: { contains: singularCat, mode: 'insensitive' } },
          { jobType: { equals: categoryParam, mode: 'insensitive' } }
        ]
      });
    }
  }
  if (location !== 'all') {
    where.country = location;
  }
  if (q) {
    AND.push({
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { organization: { contains: q, mode: 'insensitive' } }
      ]
    });
  }
  
  if (AND.length > 0) {
    where.AND = AND;
  }

  let orderBy: any = [{ sort: 'asc' }, { createdAt: 'desc' }];
  if (sortParam === 'deadline') {
    orderBy = [{ deadline: 'asc' }];
  } else if (sortParam === 'newest') {
    orderBy = [{ createdAt: 'desc' }];
  }

  const [opportunities, total, distinctLocations] = await Promise.all([
    db.opportunity.findMany({
      where,
      orderBy,
      take,
      skip,
      include: { category: true },
    }),
    db.opportunity.count({ where }),
    db.opportunity.findMany({
      where: { status: 'published', country: { not: null } },
      distinct: ['country'],
      select: { country: true }
    })
  ]);

  const locations = distinctLocations.map(d => d.country as string).filter(Boolean).sort();

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
          locations={locations}
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
