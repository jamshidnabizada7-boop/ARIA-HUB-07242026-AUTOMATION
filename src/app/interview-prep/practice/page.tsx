'use client';

import { useState } from 'react';
import { TranslatedText } from '@/components/ui/translated-text';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, Video, Type, CheckCircle2, Play } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PracticeSetupPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'voice' | 'video' | 'text'>('voice');
  const [type, setType] = useState<'mock' | 'timed' | 'random'>('mock');
  const [loading, setLoading] = useState(false);

  const startSession = async () => {
    setLoading(true);
    // In a real implementation, we would create a session in the DB here
    // For now, we just navigate to the session page with query params
    setTimeout(() => {
      router.push(`/interview-prep/practice/session?mode=${mode}&type=${type}`);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 dark:bg-slate-950">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Configure Your Practice Session</h1>
          <p className="mt-2 text-muted-foreground">Customize your AI interview experience before starting.</p>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="mb-4 text-xl font-semibold">1. Your Profile</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Major / Field of Study</label>
                <input 
                  type="text" 
                  id="major"
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" 
                  placeholder="e.g. Computer Science"
                  defaultValue="Computer Science"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Target Country</label>
                <input 
                  type="text" 
                  id="targetCountry"
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" 
                  placeholder="e.g. USA"
                  defaultValue="USA"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Scholarship Type</label>
                <input 
                  type="text" 
                  id="scholarshipType"
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" 
                  placeholder="e.g. Fulbright"
                  defaultValue="Fulbright"
                />
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold">2. Choose Input Mode</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <ModeCard
                icon={Mic}
                title="Voice Interview"
                description="Speak naturally to the AI using your microphone."
                selected={mode === 'voice'}
                onClick={() => setMode('voice')}
              />
              <ModeCard
                icon={Video}
                title="Video Interview"
                description="Record yourself while answering questions."
                selected={mode === 'video'}
                onClick={() => setMode('video')}
              />
              <ModeCard
                icon={Type}
                title="Text Interview"
                description="Type your answers if you're in a quiet place."
                selected={mode === 'text'}
                onClick={() => setMode('text')}
              />
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold">3. Choose Session Type</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <ModeCard
                icon={CheckCircle2}
                title="Full Mock Interview"
                description="A complete 5-question interview experience."
                selected={type === 'mock'}
                onClick={() => setType('mock')}
              />
              <ModeCard
                icon={Play}
                title="Timed Practice"
                description="Answer questions with a strict 2-minute timer."
                selected={type === 'timed'}
                onClick={() => setType('timed')}
              />
              <ModeCard
                icon={CheckCircle2}
                title="Random Question"
                description="Quick practice with a single random question."
                selected={type === 'random'}
                onClick={() => setType('random')}
              />
            </div>
          </section>

          <div className="flex justify-center pt-8">
            <Button size="lg" onClick={() => {
              setLoading(true);
              const major = (document.getElementById('major') as HTMLInputElement)?.value || 'Computer Science';
              const targetCountry = (document.getElementById('targetCountry') as HTMLInputElement)?.value || 'USA';
              const scholarshipType = (document.getElementById('scholarshipType') as HTMLInputElement)?.value || 'Fulbright';
              setTimeout(() => {
                router.push(`/interview-prep/practice/session?mode=${mode}&type=${type}&major=${encodeURIComponent(major)}&country=${encodeURIComponent(targetCountry)}&scholarship=${encodeURIComponent(scholarshipType)}`);
              }, 500);
            }} disabled={loading} className="w-full sm:w-auto min-w-[200px]">
              {loading ? 'Starting...' : 'Start Session'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModeCard({ icon: Icon, title, description, selected, onClick }: any) {
  return (
    <Card
      className={`cursor-pointer transition-all hover:border-primary/50 ${
        selected ? 'border-primary ring-1 ring-primary' : ''
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <Icon className={`h-8 w-8 ${selected ? 'text-primary' : 'text-muted-foreground'}`} />
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </Card>
  );
}
