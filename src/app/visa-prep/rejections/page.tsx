import React from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RejectionsClient } from './rejections-client';

export const metadata = {
  title: 'Visa Rejection Reasons | ARIA HUB',
  description: 'Learn about common visa rejection reasons and how to avoid them.'
};

export default function VisaRejectionsPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12">
      <div className="container max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="mb-10 text-center max-w-3xl mx-auto">
          <Link href="/visa-prep" className="inline-block mb-6">
            <Button variant="outline" size="sm" className="rounded-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Visa Prep
            </Button>
          </Link>
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-500 rounded-full">
              <AlertTriangle className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">
            Common Rejection Reasons
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Familiarize yourself with the most frequent reasons for visa denials under US Immigration Law, such as 214(b) and 221(g), and discover actionable strategies to overcome them.
          </p>
        </div>

        {/* Interactive Client Component */}
        <RejectionsClient />
        
      </div>
    </div>
  );
}
