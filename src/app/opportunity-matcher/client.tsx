'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ArrowRight, CheckCircle2, Search, Briefcase, GraduationCap, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import Link from 'next/link';

type Goal = 'Scholarship' | 'Internship' | 'Work Visa';

interface UserData {
  age: string;
  targetCountry: string;
  education: string;
  goal: Goal | '';
}

const COUNTRIES = [
  'Germany', 'Canada', 'United States', 'United Kingdom', 'Australia',
  'France', 'Netherlands', 'Sweden', 'Italy', 'Spain'
];

const EDUCATION_LEVELS = [
  'High School', "Bachelor's Degree", "Master's Degree", 'PhD', 'Other'
];

const MOCK_OPPORTUNITIES = [
  { id: 1, title: 'DAAD Scholarship in Germany', type: 'Scholarship', location: 'Germany', match: 98 },
  { id: 2, title: 'Tech Start Internship', type: 'Internship', location: 'Canada', match: 92 },
  { id: 3, title: 'Skilled Worker Visa Program', type: 'Work Visa', location: 'Australia', match: 89 },
  { id: 4, title: 'Global Excellence Scholarship', type: 'Scholarship', location: 'United Kingdom', match: 95 },
  { id: 5, title: 'Engineering Graduate Program', type: 'Work Visa', location: 'United States', match: 87 },
  { id: 6, title: 'European Union Tech Internship', type: 'Internship', location: 'Netherlands', match: 91 },
];

export function OpportunityMatcherClient() {
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState<UserData>({
    age: '',
    targetCountry: '',
    education: '',
    goal: '',
  });
  const [isCalculating, setIsCalculating] = useState(false);
  const [results, setResults] = useState<typeof MOCK_OPPORTUNITIES>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNext = () => {
    if (step < 4) {
      setStep(prev => prev + 1);
    } else if (step === 4) {
      calculateResults();
    }
  };

  const calculateResults = () => {
    setIsCalculating(true);
    setStep(5);

    // Simulate API call and calculation
    setTimeout(() => {
      // Filter mock opportunities based on goal or just randomize for demo
      const filtered = MOCK_OPPORTUNITIES.filter(opt =>
        userData.goal ? opt.type === userData.goal : true
      );

      // Get 3 random if enough, otherwise pad with others
      let selected = [...filtered].sort(() => 0.5 - Math.random()).slice(0, 3);
      if (selected.length < 3) {
        const others = MOCK_OPPORTUNITIES.filter(opt => opt.type !== userData.goal).sort(() => 0.5 - Math.random());
        selected = [...selected, ...others.slice(0, 3 - selected.length)];
      }

      setResults(selected);
      setIsCalculating(false);
      setStep(6);
    }, 2500);
  };

  const isStepValid = () => {
    switch (step) {
      case 1: return userData.age.trim() !== '' && parseInt(userData.age) > 0;
      case 2: return userData.targetCountry !== '';
      case 3: return userData.education !== '';
      case 4: return userData.goal !== '';
      default: return true;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  if (!mounted) return null;

  return (
    <div className="w-full max-w-2xl mx-auto p-4 z-10 font-sans">
      <AnimatePresence mode="wait">

        {/* Step 1: Age */}
        {step === 1 && (
          <motion.div key="step1" variants={containerVariants} initial="hidden" animate="visible" exit="exit">
            <GlassCard>
              <StepHeader step={1} title="Tell us about yourself" subtitle="What is your current age?" />
              <div className="my-8">
                <Label htmlFor="age" className="text-lg mb-2 block text-slate-700 dark:text-slate-300">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="e.g. 24"
                  value={userData.age}
                  onChange={(e) => setUserData({...userData, age: e.target.value})}
                  className="text-xl p-6 bg-white/50 dark:bg-black/50 border-white/30 focus-visible:ring-blue-500"
                />
              </div>
              <StepFooter onNext={handleNext} isValid={isStepValid()} />
            </GlassCard>
          </motion.div>
        )}

        {/* Step 2: Target Country */}
        {step === 2 && (
          <motion.div key="step2" variants={containerVariants} initial="hidden" animate="visible" exit="exit">
            <GlassCard>
              <StepHeader step={2} title="Destination" subtitle="Where do you want to go?" />
              <div className="my-8">
                 <Label className="text-lg mb-2 block text-slate-700 dark:text-slate-300">Target Country</Label>
                 <Select value={userData.targetCountry} onValueChange={(val) => setUserData({...userData, targetCountry: val})}>
                  <SelectTrigger className="text-xl p-6 h-auto bg-white/50 dark:bg-black/50 border-white/30 focus:ring-blue-500">
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border-white/20">
                    {COUNTRIES.map(country => (
                      <SelectItem key={country} value={country} className="text-lg">{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <StepFooter onNext={handleNext} isValid={isStepValid()} onBack={() => setStep(1)} />
            </GlassCard>
          </motion.div>
        )}

        {/* Step 3: Education */}
        {step === 3 && (
          <motion.div key="step3" variants={containerVariants} initial="hidden" animate="visible" exit="exit">
            <GlassCard>
              <StepHeader step={3} title="Background" subtitle="What is your current education level?" />
              <div className="my-8">
                <RadioGroup value={userData.education} onValueChange={(val) => setUserData({...userData, education: val})} className="space-y-3">
                  {EDUCATION_LEVELS.map(level => (
                    <div key={level} className="flex items-center space-x-3 space-x-reverse border border-slate-200 dark:border-slate-700 p-4 rounded-xl bg-white/40 dark:bg-black/40 hover:bg-white/60 dark:hover:bg-black/60 transition-colors cursor-pointer" onClick={() => setUserData({...userData, education: level})}>
                      <RadioGroupItem value={level} id={level} className="text-blue-500" />
                      <Label htmlFor={level} className="text-lg cursor-pointer flex-1 text-right ml-2">{level}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              <StepFooter onNext={handleNext} isValid={isStepValid()} onBack={() => setStep(2)} />
            </GlassCard>
          </motion.div>
        )}

        {/* Step 4: Goal */}
        {step === 4 && (
          <motion.div key="step4" variants={containerVariants} initial="hidden" animate="visible" exit="exit">
            <GlassCard>
              <StepHeader step={4} title="Your Goal" subtitle="What kind of opportunity are you seeking?" />
              <div className="my-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <GoalOption
                  icon={<GraduationCap className="w-8 h-8 mb-2" />}
                  title="Scholarship"
                  selected={userData.goal === 'Scholarship'}
                  onClick={() => setUserData({...userData, goal: 'Scholarship'})}
                />
                <GoalOption
                  icon={<Globe className="w-8 h-8 mb-2" />}
                  title="Internship"
                  selected={userData.goal === 'Internship'}
                  onClick={() => setUserData({...userData, goal: 'Internship'})}
                />
                <GoalOption
                  icon={<Briefcase className="w-8 h-8 mb-2" />}
                  title="Work Visa"
                  selected={userData.goal === 'Work Visa'}
                  onClick={() => setUserData({...userData, goal: 'Work Visa'})}
                />
              </div>
              <StepFooter onNext={handleNext} isValid={isStepValid()} onBack={() => setStep(3)} nextText="Find Matches" />
            </GlassCard>
          </motion.div>
        )}

        {/* Step 5: Loading/Calculating */}
        {step === 5 && (
          <motion.div key="step5" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="text-center py-20">
             <GlassCard className="flex flex-col items-center justify-center p-12">
                <div className="relative w-24 h-24 mb-8">
                  <div className="absolute inset-0 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
                  <div className="absolute inset-2 border-r-4 border-sky-400 border-solid rounded-full animate-spin direction-reverse"></div>
                  <div className="absolute inset-4 border-b-4 border-[#d4af37] border-solid rounded-full animate-spin"></div>
                  <Search className="absolute inset-0 m-auto text-blue-500 w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent mb-2">Analyzing Profile...</h3>
                <p className="text-slate-500 dark:text-slate-400">Matching your background with global opportunities globally.</p>
             </GlassCard>
          </motion.div>
        )}

        {/* Step 6: Results */}
        {step === 6 && (
          <motion.div key="step6" variants={containerVariants} initial="hidden" animate="visible" exit="exit">
             <div className="mb-8 text-center">
               <div className="inline-flex items-center justify-center p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full mb-4">
                 <CheckCircle2 className="w-8 h-8" />
               </div>
               <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Your Top Matches</h2>
               <p className="text-slate-600 dark:text-slate-300">Based on your profile, here are the best opportunities for you.</p>
             </div>

             <div className="space-y-4 mb-8">
               {results.map((result, idx) => (
                 <motion.div
                   key={result.id}
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: idx * 0.2 }}
                 >
                   <Card className="bg-white/60 dark:bg-black/40 backdrop-blur-lg border-white/20 shadow-xl overflow-hidden group hover:shadow-2xl transition-all">
                      <div className="flex flex-col md:flex-row items-center p-0">
                        <div className="flex-1 p-6">
                           <div className="flex items-center gap-2 mb-2">
                             <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                               {result.type}
                             </span>
                             <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                               <Globe className="w-3 h-3"/> {result.location}
                             </span>
                           </div>
                           <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1 group-hover:text-blue-500 transition-colors">
                             {result.title}
                           </h3>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-700 w-full md:w-auto h-full">
                           <div className="text-3xl font-bold text-[#d4af37]">{result.match}%</div>
                           <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Match Rating</div>
                        </div>
                      </div>
                   </Card>
                 </motion.div>
               ))}
             </div>

             <GlassCard className="text-center p-8 border-blue-500/30">
               <h3 className="text-2xl font-bold mb-4">Need Help Applying?</h3>
               <p className="text-slate-600 dark:text-slate-300 mb-6">Our experts can guide you through the entire process to maximize your chances of success.</p>
               <Button asChild size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white font-bold px-8 py-6 rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all text-lg">
                 <Link href="/services">
                   Get Application Help <ArrowRight className="ml-2 w-5 h-5" />
                 </Link>
               </Button>
               <div className="mt-4">
                 <Button variant="ghost" onClick={() => { setStep(1); setUserData({age:'', targetCountry:'', education:'', goal:''}); }} className="text-slate-500">
                   Start Over
                 </Button>
               </div>
             </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper Components

function GlassCard({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`backdrop-blur-xl bg-white/30 dark:bg-slate-900/40 border border-white/40 dark:border-slate-700/50 rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] p-8 ${className}`}>
      {children}
    </div>
  );
}

function StepHeader({ step, title, subtitle }: { step: number, title: string, subtitle: string }) {
  return (
    <div className="text-center mb-8">
      <div className="inline-block px-4 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold text-sm mb-4">
        Step {step} of 4
      </div>
      <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">{title}</h2>
      <p className="text-slate-600 dark:text-slate-400">{subtitle}</p>
    </div>
  );
}

function StepFooter({ onNext, onBack, isValid, nextText = 'Next' }: { onNext: () => void, onBack?: () => void, isValid: boolean, nextText?: string }) {
  return (
    <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-200/50 dark:border-slate-700/50">
      {onBack ? (
        <Button variant="ghost" onClick={onBack} className="text-slate-600 dark:text-slate-400">Back</Button>
      ) : <div></div>}

      <Button
        onClick={onNext}
        disabled={!isValid}
        className="bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-full"
      >
        {nextText} <ChevronRight className="ml-2 w-4 h-4" />
      </Button>
    </div>
  );
}

function GoalOption({ icon, title, selected, onClick }: { icon: React.ReactNode, title: string, selected: boolean, onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`
        cursor-pointer rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all border-2
        ${selected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-md'
          : 'border-transparent bg-white/50 dark:bg-black/30 hover:bg-white/80 dark:hover:bg-black/50 text-slate-600 dark:text-slate-400 hover:shadow'}
      `}
    >
      <div className={selected ? 'text-blue-500' : 'text-slate-400'}>{icon}</div>
      <span className="font-semibold text-lg">{title}</span>
    </div>
  );
}
