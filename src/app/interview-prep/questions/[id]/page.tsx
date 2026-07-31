import { TranslatedText } from '@/components/ui/translated-text';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { db as prisma } from '@/lib/db';
import { getLang } from '@/lib/i18n-server';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { ArrowLeft, CheckCircle2, XCircle, Lightbulb, AlertTriangle, Clock } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Question Details | Interview Prep',
};

export default async function QuestionDetailPage({ params }: { params: { id: string } }) {
  const cookieStore = await cookies();
  const lang = cookieStore.get('NEXT_LOCALE')?.value || 'en';
  
  const question = await prisma.interviewQuestion.findUnique({
    where: { id: params.id },
    include: { category: true }
  });

  if (!question || question.status !== 'published') {
    return notFound();
  }

  // Parse i18n
  const qText = typeof question.questionI18n === 'object' && question.questionI18n !== null && (question.questionI18n as any)[lang] ? (question.questionI18n as any)[lang] : question.question;
  const sampleAnswer = typeof question.sampleAnswerI18n === 'object' && question.sampleAnswerI18n !== null && (question.sampleAnswerI18n as any)[lang] ? (question.sampleAnswerI18n as any)[lang] : question.sampleAnswer;
  const strongEx = typeof question.strongExampleI18n === 'object' && question.strongExampleI18n !== null && (question.strongExampleI18n as any)[lang] ? (question.strongExampleI18n as any)[lang] : question.strongExample;
  const weakEx = typeof question.weakExampleI18n === 'object' && question.weakExampleI18n !== null && (question.weakExampleI18n as any)[lang] ? (question.weakExampleI18n as any)[lang] : question.weakExample;
  const tips = typeof question.tipsI18n === 'object' && question.tipsI18n !== null && (question.tipsI18n as any)[lang] ? (question.tipsI18n as any)[lang] : question.tips;
  
  const commonMistakes = (typeof question.commonMistakesI18n === 'object' && question.commonMistakesI18n !== null && (question.commonMistakesI18n as any)[lang] ? (question.commonMistakesI18n as any)[lang] : question.commonMistakes) as string[] || [];
  const followUps = (typeof question.followUpQuestionsI18n === 'object' && question.followUpQuestionsI18n !== null && (question.followUpQuestionsI18n as any)[lang] ? (question.followUpQuestionsI18n as any)[lang] : question.followUpQuestions) as string[] || [];

  return (
    <div className="min-h-screen bg-slate-50 py-12 dark:bg-slate-950">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        
        <Link href="/interview-prep" className="mb-6 inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Prep Center
        </Link>

        {/* Question Header */}
        <Card className="mb-8 overflow-hidden border-primary/20 bg-primary/5">
          <CardHeader className="pb-4">
            <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <span>{question.category?.name || 'General'}</span>
              <span className={`rounded-full px-2 py-1 ${question.difficulty === 'hard' ? 'bg-red-500/10 text-red-500' : question.difficulty === 'medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-green-500/10 text-green-500'}`}>
                {question.difficulty}
              </span>
            </div>
            <CardTitle className="text-2xl leading-relaxed sm:text-3xl">
              "{qText}"
            </CardTitle>
          </CardHeader>
          {question.expectedDuration && (
            <CardFooter className="bg-primary/5 py-3 text-sm font-medium text-primary">
              <Clock className="mr-2 h-4 w-4" /> Expected Duration: {question.expectedDuration}
            </CardFooter>
          )}
        </Card>

        {/* Content Sections */}
        <div className="space-y-6">
          
          {sampleAnswer && (
            <section>
              <h3 className="mb-3 flex items-center text-lg font-bold">
                <Lightbulb className="mr-2 h-5 w-5 text-amber-500" /> Sample Answer
              </h3>
              <div className="rounded-xl border bg-card p-5 leading-relaxed text-card-foreground shadow-sm">
                {sampleAnswer}
              </div>
            </section>
          )}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {strongEx && (
              <section>
                <h3 className="mb-3 flex items-center text-lg font-bold text-green-600">
                  <CheckCircle2 className="mr-2 h-5 w-5" /> Strong Example
                </h3>
                <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-5 leading-relaxed text-card-foreground shadow-sm">
                  {strongEx}
                </div>
              </section>
            )}

            {weakEx && (
              <section>
                <h3 className="mb-3 flex items-center text-lg font-bold text-red-600">
                  <XCircle className="mr-2 h-5 w-5" /> Weak Example
                </h3>
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5 leading-relaxed text-card-foreground shadow-sm">
                  {weakEx}
                </div>
              </section>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {tips && (
              <section>
                <h3 className="mb-3 text-lg font-bold">How to Answer</h3>
                <div className="rounded-xl border bg-card p-5 text-sm leading-relaxed text-muted-foreground shadow-sm">
                  {tips}
                </div>
              </section>
            )}

            {commonMistakes.length > 0 && (
              <section>
                <h3 className="mb-3 flex items-center text-lg font-bold text-orange-500">
                  <AlertTriangle className="mr-2 h-5 w-5" /> Common Mistakes
                </h3>
                <ul className="list-inside list-disc space-y-2 rounded-xl border bg-card p-5 text-sm text-muted-foreground shadow-sm">
                  {commonMistakes.map((mistake, i) => (
                    <li key={i}>{mistake}</li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {followUps.length > 0 && (
            <section>
              <h3 className="mb-3 text-lg font-bold">Possible Follow-up Questions</h3>
              <div className="rounded-xl border bg-card p-5 shadow-sm">
                <ul className="space-y-3">
                  {followUps.map((q, i) => (
                    <li key={i} className="flex gap-3 text-muted-foreground">
                      <span className="font-bold text-primary">Q:</span> {q}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

        </div>
        
        <div className="mt-12 flex justify-center border-t pt-8">
          <Button size="lg" asChild>
            <Link href={`/interview-prep/practice/session?questionId=${question.id}`}>
              Practice This Question with AI
            </Link>
          </Button>
        </div>

      </div>
    </div>
  );
}
