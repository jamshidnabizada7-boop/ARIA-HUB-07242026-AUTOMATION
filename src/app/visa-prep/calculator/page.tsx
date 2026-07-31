import React from 'react';
import { db as prisma } from '@/lib/db';
import { CalculatorClient } from './calculator-client';
import { TranslatedText } from '@/components/ui/translated-text';
import { getLang } from '@/lib/i18n-server';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Visa Cost Calculator | ARIA HUB',
  description: 'Calculate and estimate your total visa application costs, including medical, biometrics, and other fees.'
};

export default async function VisaCostCalculatorPage() {
  const cookieStore = await cookies();
  const lang = cookieStore.get('NEXT_LOCALE')?.value || 'en';

  const countries = await prisma.visaCountry.findMany({
    where: { status: 'published' },
    orderBy: { order: 'asc' },
    select: {
      id: true,
      name: true,
      nameI18n: true,
      code: true,
      costEstimate: true,
    }
  });

  const categories = await prisma.visaCategory.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      nameI18n: true,
      slug: true,
    }
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="mb-8">
          <Link href="/visa-prep">
            <Button variant="ghost" className="mb-4 -ml-4 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Visa Prep
            </Button>
          </Link>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">
            <TranslatedText tKey="visaPrep.calc.title" />
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl">
            <TranslatedText tKey="visaPrep.calc.subtitle" />
          </p>
        </div>

        {/* Client Calculator Tool */}
        <CalculatorClient 
          countries={countries} 
          categories={categories} 
          lang={lang} 
        />
        
      </div>
    </div>
  );
}
