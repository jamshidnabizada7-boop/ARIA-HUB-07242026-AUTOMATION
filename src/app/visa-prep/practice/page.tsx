import { db as prisma } from '@/lib/db';
import { getLang } from '@/lib/i18n-server';
import { cookies } from 'next/headers';
import VisaPracticeSetup from './setup-client';
import { Suspense } from 'react';

export const metadata = {
  title: 'Setup Visa Interview Practice | ARIA HUB',
  description: 'Configure your AI mock visa interview.'
};

export default async function VisaPracticePage() {
  const cookieStore = await cookies();
  const lang = cookieStore.get('NEXT_LOCALE')?.value || 'en';

  const countries = await prisma.visaCountry.findMany({
    where: { status: 'published' },
    orderBy: { order: 'asc' },
    include: {
      categories: {
        where: { status: 'published' }
      }
    }
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12">
      <div className="mx-auto max-w-3xl px-4">
        <Suspense fallback={<div>Loading setup...</div>}>
          <VisaPracticeSetup countries={countries} lang={lang} />
        </Suspense>
      </div>
    </div>
  );
}
