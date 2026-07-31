'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Mic, Square, Loader2, ArrowRight, RefreshCcw } from 'lucide-react';

// Example hardcoded questions for now (since we don't have db prepopulated in this demo)
const SAMPLE_QUESTIONS = [
  "Tell me about yourself and why you are applying for this scholarship.",
  "What is your greatest academic achievement?",
  "How do you plan to use this scholarship to impact your community?",
  "Describe a time when you faced a significant challenge and how you overcame it."
];

function InterviewSessionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const mode = searchParams.get('mode') || 'voice';
  
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize SpeechRecognition if supported
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        
        recognitionRef.current.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
        };
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      setTranscript('');
      setFeedback(null);
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  const submitAnswer = async () => {
    if (!transcript) return;
    
    setIsEvaluating(true);
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    }

    try {
      const res = await fetch('/api/interviews/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          questionText: SAMPLE_QUESTIONS[questionIndex]
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        setFeedback(data);
      } else {
        alert(data.error || 'Evaluation failed');
      }
    } catch (error) {
      console.error(error);
      alert('Network error during evaluation');
    } finally {
      setIsEvaluating(false);
    }
  };

  const nextQuestion = () => {
    setTranscript('');
    setFeedback(null);
    if (questionIndex < SAMPLE_QUESTIONS.length - 1) {
      setQuestionIndex(prev => prev + 1);
    } else {
      alert("Session completed! Great job.");
      router.push('/interview-prep');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 dark:bg-slate-950">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        
        {/* Progress Header */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Interactive Session</h1>
          <div className="text-sm font-medium text-muted-foreground">
            Question {questionIndex + 1} of {SAMPLE_QUESTIONS.length}
          </div>
        </div>

        {/* Question Card */}
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-xl text-primary">AI Interviewer</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-medium leading-relaxed">
              "{SAMPLE_QUESTIONS[questionIndex]}"
            </p>
          </CardContent>
        </Card>

        {/* Input Area */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg">
                Your Answer
                {mode === 'voice' && (
                  <Button
                    variant={isRecording ? 'destructive' : 'default'}
                    size="icon"
                    onClick={toggleRecording}
                    disabled={isEvaluating}
                    className="rounded-full"
                  >
                    {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {mode === 'text' ? (
                <textarea
                  className="h-48 w-full resize-none rounded-md border p-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Type your answer here..."
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  disabled={isEvaluating}
                />
              ) : (
                <div className="h-48 overflow-y-auto rounded-md border bg-muted/30 p-4">
                  {transcript ? (
                    <p className="text-foreground">{transcript}</p>
                  ) : (
                    <p className="text-muted-foreground italic">
                      {isRecording ? 'Listening...' : 'Click the microphone to start speaking...'}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setTranscript('')} disabled={!transcript || isEvaluating || isRecording}>
                <RefreshCcw className="mr-2 h-4 w-4" /> Reset
              </Button>
              <Button onClick={submitAnswer} disabled={!transcript || isEvaluating || isRecording}>
                {isEvaluating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isEvaluating ? 'Evaluating...' : 'Submit Answer'}
              </Button>
            </CardFooter>
          </Card>

          {/* AI Feedback Area */}
          <Card className={feedback ? 'border-green-500/30 bg-green-500/5' : ''}>
            <CardHeader>
              <CardTitle className="text-lg">AI Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              {!feedback && !isEvaluating && (
                <div className="flex h-48 flex-col items-center justify-center text-center text-muted-foreground">
                  <p>Submit your answer to receive detailed AI feedback on your performance.</p>
                </div>
              )}
              {isEvaluating && (
                <div className="flex h-48 flex-col items-center justify-center text-center">
                  <Loader2 className="mb-4 h-8 w-8 animate-spin text-primary" />
                  <p className="animate-pulse font-medium text-primary">Analyzing your response...</p>
                </div>
              )}
              {feedback && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg border bg-card p-2">
                      <div className="text-2xl font-black text-primary">{feedback.confidenceScore}%</div>
                      <div className="text-[10px] font-semibold uppercase text-muted-foreground">Confidence</div>
                    </div>
                    <div className="rounded-lg border bg-card p-2">
                      <div className="text-2xl font-black text-primary">{feedback.fluencyScore}%</div>
                      <div className="text-[10px] font-semibold uppercase text-muted-foreground">Fluency</div>
                    </div>
                    <div className="rounded-lg border bg-card p-2">
                      <div className="text-2xl font-black text-primary">{feedback.grammarScore}%</div>
                      <div className="text-[10px] font-semibold uppercase text-muted-foreground">Grammar</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Overall Feedback</h4>
                    <p className="mt-1 text-sm text-muted-foreground">{feedback.overallFeedback}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Tips for Improvement</h4>
                    <ul className="mt-1 list-inside list-disc text-sm text-muted-foreground">
                      {feedback.tipsForImprovement?.map((tip: string, i: number) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
            {feedback && (
              <CardFooter className="flex justify-end">
                <Button onClick={nextQuestion} className="w-full sm:w-auto">
                  Next Question <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            )}
          </Card>
          
        </div>
      </div>
    </div>
  );
}

export default function InterviewSessionPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <InterviewSessionContent />
    </Suspense>
  );
}
