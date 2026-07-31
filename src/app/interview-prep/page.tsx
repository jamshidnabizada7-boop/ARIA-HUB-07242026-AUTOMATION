import { TranslatedText } from '@/components/ui/translated-text';
import { Button } from '@/components/ui/button';
import { BookOpen, Video, Users, Mic, Plus } from 'lucide-react';
import Link from 'next/link';
import { db as prisma } from '@/lib/db';
import { getLang } from '@/lib/i18n-server';
import { cookies } from 'next/headers';

export const metadata = {
  title: 'Interview Preparation | ARIA HUB',
  description: 'Practice with AI and real scenarios for scholarship and visa interviews.'
};

export default async function InterviewPrepPage() {
  const cookieStore = cookies();
  const lang = cookieStore.get('NEXT_LOCALE')?.value || 'en';
  
  const categories = await prisma.interviewCategory.findMany({
    orderBy: { order: 'asc' },
    include: {
      _count: {
        select: { questions: true }
      }
    }
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero Section */}
      <div className="bg-primary px-4 py-20 text-center text-primary-foreground md:py-32">
        <div className="mx-auto max-w-4xl space-y-6">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            <TranslatedText tKey="interview.title" />
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-primary-foreground/80 sm:text-xl">
            <TranslatedText tKey="interview.subtitle" />
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" variant="secondary" className="font-bold">
              <Link href="/interview-prep/practice">
                <Mic className="mr-2 h-5 w-5" />
                <TranslatedText tKey="interview.practice" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent font-bold text-primary-foreground hover:bg-primary-foreground hover:text-primary border-primary-foreground/30 hover:border-primary-foreground">
              <Link href="/interview-prep/community">
                <Users className="mr-2 h-5 w-5" />
                <TranslatedText tKey="interview.community" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            <TranslatedText tKey="interview.categories" />
          </h2>
          <p className="mt-2 text-muted-foreground">Explore 1000+ questions across various topics</p>
        </div>

        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-12 text-center">
            <p className="text-muted-foreground">No categories found. Admin can add categories in the dashboard.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((category) => {
              const name = typeof category.nameI18n === 'object' && category.nameI18n !== null && (category.nameI18n as any)[lang] ? (category.nameI18n as any)[lang] : category.name;
              const desc = typeof category.descriptionI18n === 'object' && category.descriptionI18n !== null && (category.descriptionI18n as any)[lang] ? (category.descriptionI18n as any)[lang] : category.description;
              
              return (
                <Link key={category.id} href={`/interview-prep/category/${category.slug}`} className="group relative flex flex-col justify-between rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50">
                  <div>
                    <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold">{name}</h3>
                    {desc && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{desc}</p>}
                  </div>
                  <div className="mt-6 flex items-center justify-between text-sm font-medium text-muted-foreground">
                    <span>{category._count.questions} Questions</span>
                    <span className="text-primary group-hover:translate-x-1 transition-transform">Explore →</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
