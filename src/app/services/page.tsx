import { Metadata } from 'next';
import { getSiteData } from '@/lib/get-site';
import { Navbar } from '@/components/site/navbar';
import { Footer } from '@/components/site/footer';
import { db } from '@/lib/db';
import { ServicesClient } from './client';

export const metadata: Metadata = {
  title: 'All Services | ARIA HUB',
  description: 'Browse all available services provided by ARIA HUB.',
};

export const revalidate = 60;

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const data = await getSiteData();
  const sp = await searchParams;
  
  const page = typeof sp.page === 'string' ? parseInt(sp.page, 10) : 1;
  
  const take = 12;
  const skip = (Math.max(1, page) - 1) * take;

  const [services, total] = await Promise.all([
    db.service.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      take,
      skip,
    }),
    db.service.count()
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
        <ServicesClient 
          services={services as any} 
          currentPage={page}
          totalPages={totalPages}
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
