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
  const type = searchParams.get('type') || 'mock';
  const major = searchParams.get('major') || 'Computer Science';
  const targetCountry = searchParams.get('country') || 'USA';
  const scholarshipType = searchParams.get('scholarship') || 'Fulbright';
  
  const [questionIndex, setQuestionIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState("Loading your first personalized question...");
  const [previousQuestions, setPreviousQuestions] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(true);
  const [feedback, setFeedback] = useState<any>(null);
  
  const recognitionRef = useRef<any>(null);

  const fetchQuestion = async () => {
    setIsGeneratingQuestion(true);
    try {
      const res = await fetch('/api/interviews/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetCountry,
          major,
          scholarshipType,
          currentIndex: questionIndex,
          previousQuestions
        })
      });
      const data = await res.json();
      if (res.ok && data.question) {
        setCurrentQuestion(data.question);
        setPreviousQuestions(prev => [...prev, data.question]);
      } else {
        setCurrentQuestion("Tell me about yourself and why you are applying for this scholarship."); // Fallback
      }
    } catch (error) {
      console.error(error);
      setCurrentQuestion("Tell me about yourself and why you are applying for this scholarship."); // Fallback
    } finally {
      setIsGeneratingQuestion(false);
    }
  };

  useEffect(() => {
    fetchQuestion();
    
    // Initialize SpeechRecognition if supported
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US'; // Set to English for interviews
        
        recognitionRef.current.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
        };
        
        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsRecording(false);
        };
        
        recognitionRef.current.onend = () => {
          setIsRecording(false);
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
    if (!recognitionRef.current) {
      alert("Your browser does not support voice recording, or microphone access was denied. Please type your answer or use a supported browser like Chrome.");
      return;
    }
    
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      setTranscript('');
      setFeedback(null);
      try {
        recognitionRef.current?.start();
        setIsRecording(true);
      } catch (e) {
        console.error(e);
        setIsRecording(false);
      }
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
          questionText: currentQuestion
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
    const maxQuestions = type === 'random' ? 1 : (type === 'mock' ? 5 : 3);
    
    if (questionIndex < maxQuestions - 1) {
      setQuestionIndex(prev => prev + 1);
      fetchQuestion();
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
          <h1 className="text-2xl font-bold">Interactive AI Coach</h1>
          <div className="text-sm font-medium text-muted-foreground">
            Question {questionIndex + 1}
          </div>
        </div>

        {/* Question Card */}
        <Card className="mb-6 border-primary/20 bg-primary/5 relative overflow-hidden">
          {isGeneratingQuestion && (
             <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
               <Loader2 className="w-8 h-8 text-primary animate-spin" />
               <p className="mt-2 text-sm font-medium text-primary">Generating personalized question...</p>
             </div>
          )}
          <CardHeader>
            <CardTitle className="text-xl text-primary flex justify-between">
              <span>AI Interviewer</span>
              <span className="text-sm font-normal text-muted-foreground bg-white dark:bg-slate-900 px-3 py-1 rounded-full shadow-sm">Profile: {major} | {targetCountry}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-medium leading-relaxed">
              "{currentQuestion}"
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
                    disabled={isEvaluating || isGeneratingQuestion}
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
                  className="w-full h-48 p-3 border rounded-md dark:bg-slate-900 dark:border-slate-800 focus:ring-2 focus:ring-primary outline-none resize-none"
                  placeholder="Type your answer here..."
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  disabled={isEvaluating || isGeneratingQuestion}
                />
              ) : (
                <div className="h-48 rounded-md border bg-slate-100 p-4 dark:bg-slate-900/50 overflow-y-auto">
                  {transcript ? (
                    <p className="text-slate-700 dark:text-slate-300">{transcript}</p>
                  ) : (
                    <p className="text-muted-foreground italic flex h-full items-center justify-center">
                      {isRecording ? "Listening..." : "Click the microphone to start speaking"}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setTranscript('')}
                disabled={!transcript || isEvaluating || isRecording}
              >
                Clear
              </Button>
              <Button 
                onClick={submitAnswer}
                disabled={!transcript || isEvaluating || isRecording}
              >
                {isEvaluating ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Evaluating...</>
                ) : 'Submit Answer'}
              </Button>
            </CardFooter>
          </Card>

          {/* Feedback Area */}
          <Card className={!feedback ? "opacity-50" : ""}>
            <CardHeader>
              <CardTitle className="text-lg">AI Evaluation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {!feedback ? (
                <div className="flex h-48 flex-col items-center justify-center text-center text-muted-foreground">
                  <RefreshCcw className="mb-2 h-8 w-8 opacity-20" />
                  <p>Submit your answer to receive detailed AI feedback</p>
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20 text-center">
                      <div className="text-sm font-medium text-blue-600 dark:text-blue-400">Confidence</div>
                      <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">{feedback.confidenceScore}/100</div>
                    </div>
                    <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20 text-center">
                      <div className="text-sm font-medium text-purple-600 dark:text-purple-400">Content</div>
                      <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">{feedback.contentStrengthScore || feedback.fluencyScore || 85}/100</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-1">Feedback</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{feedback.overallFeedback}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-1">Tips to Improve</h4>
                    <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-400 space-y-1">
                      {feedback.tipsForImprovement?.map((tip: string, i: number) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  </div>

                  {feedback.idealAnswer && (
                    <div className="mt-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30">
                      <h4 className="font-semibold text-green-700 dark:text-green-400 mb-1">Ideal Answer Example</h4>
                      <p className="text-sm text-green-800 dark:text-green-300 italic">"{feedback.idealAnswer}"</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
            {feedback && (
              <CardFooter>
                <Button className="w-full" onClick={nextQuestion}>
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <InterviewSessionContent />
    </Suspense>
  );
}
