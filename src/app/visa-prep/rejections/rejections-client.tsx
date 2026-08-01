"use client";

import React, { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Search, Info, HelpCircle, XCircle, FileWarning, Briefcase, Users, Bot } from 'lucide-react';

const REJECTION_DATA = [
  {
    id: "214b",
    code: "Section 214(b)",
    title: "Immigrant Intent / Insufficient Ties",
    icon: <Users className="h-5 w-5 text-rose-500" />,
    description: "The most common reason for rejection. The consular officer believed you intend to immigrate permanently rather than return to your home country.",
    mitigation: [
      "Demonstrate strong family ties in your home country.",
      "Show stable, long-term employment or business ownership.",
      "Provide evidence of property ownership or financial investments.",
      "Be prepared to concisely explain your specific, temporary purpose of travel."
    ]
  },
  {
    id: "221g",
    code: "Section 221(g)",
    title: "Incomplete Application / Administrative Processing",
    icon: <FileWarning className="h-5 w-5 text-amber-500" />,
    description: "Your application is missing crucial information or requires additional administrative processing.",
    mitigation: [
      "Follow the exact instructions provided on the 221(g) slip given to you.",
      "Submit any requested documents promptly via the specified channel (email or drop-off).",
      "Do not re-apply while your case is in administrative processing.",
      "Ensure all forms (DS-160) are completely and accurately filled out."
    ]
  },
  {
    id: "212a6c",
    code: "Section 212(a)(6)(C)(i)",
    title: "Misrepresentation / Fraud",
    icon: <XCircle className="h-5 w-5 text-red-600" />,
    description: "The officer determined you attempted to obtain a visa by willful misrepresentation of a material fact.",
    mitigation: [
      "Always answer all DS-160 questions and interview questions truthfully.",
      "Never use fake documents (bank statements, job letters). Consulates routinely verify these.",
      "If you made an honest mistake, apply for a waiver if eligible, though this is difficult.",
      "Hire a reputable immigration attorney if dealing with a fraud finding."
    ]
  },
  {
    id: "financial",
    code: "Financial",
    title: "Insufficient Funds / Public Charge",
    icon: <Briefcase className="h-5 w-5 text-emerald-500" />,
    description: "The officer is not convinced you have the financial means to support your trip without working illegally or becoming a public charge.",
    mitigation: [
      "Provide legitimate, verifiable bank statements spanning 3-6 months.",
      "If sponsored by a relative, provide an Affidavit of Support (I-134) along with their tax returns.",
      "Clearly explain how your trip will be funded if asked during the interview.",
      "Show proof of steady income."
    ]
  },
  {
    id: "purpose",
    code: "Travel Purpose",
    title: "Unclear Purpose of Travel",
    icon: <HelpCircle className="h-5 w-5 text-blue-500" />,
    description: "The applicant could not clearly articulate the specific reason for their trip, their itinerary, or whom they are meeting.",
    mitigation: [
      "Have a clear, logical itinerary (e.g., 'I am attending my brother's wedding on June 15th at X location').",
      "Know the details of the conference or university you are attending.",
      "Avoid vague answers like 'I just want to visit' without specifics.",
      "If visiting friends/family, know their exact status and address in the destination country."
    ]
  }
];

export function RejectionsClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const filteredRejections = REJECTION_DATA.filter(item => 
    item.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAiSearch = async () => {
    if (!aiQuery.trim()) return;
    setIsAiLoading(true);
    setAiResponse(null);

    try {
      // We will create this AI route shortly
      const res = await fetch('/api/visa-prep/ai-rejection-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: aiQuery })
      });
      
      const data = await res.json();
      if (data.advice) {
        setAiResponse(data.advice);
      } else {
        setAiResponse("I couldn't generate advice for this situation. Please try rephrasing.");
      }
    } catch (error) {
      setAiResponse("An error occurred while connecting to the AI assistant. Please try again.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* AI Assistant Section */}
      <Card className="border-t-4 border-t-primary shadow-md overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Bot className="w-32 h-32" />
        </div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            AI Visa Assistant
          </CardTitle>
          <CardDescription>
            Describe your specific situation or the reason you were given for your rejection, and our AI will provide tailored advice.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input 
              placeholder="e.g. I was rejected because they said my bank statement wasn't enough..." 
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              className="flex-grow"
              onKeyDown={(e) => e.key === 'Enter' && handleAiSearch()}
            />
            <Button onClick={handleAiSearch} disabled={isAiLoading || !aiQuery.trim()}>
              {isAiLoading ? "Analyzing..." : "Ask AI"}
            </Button>
          </div>

          {aiResponse && (
            <div className="mt-4 p-4 bg-primary/5 rounded-xl border border-primary/20 text-slate-800 dark:text-slate-200">
              <div className="flex gap-3">
                <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed" 
                     dangerouslySetInnerHTML={{ __html: aiResponse.replace(/\n/g, '<br/>') }} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Search & Accordion */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 className="text-2xl font-bold tracking-tight">Rejection Dictionary</h2>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search code or reason..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {filteredRejections.length === 0 ? (
          <div className="text-center py-12 border border-dashed rounded-xl">
            <p className="text-muted-foreground">No rejection reasons found matching "{searchQuery}"</p>
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full space-y-4">
            {filteredRejections.map((item) => (
              <AccordionItem key={item.id} value={item.id} className="bg-white dark:bg-slate-900 border rounded-xl overflow-hidden px-2 shadow-sm">
                <AccordionTrigger className="hover:no-underline py-4 px-2">
                  <div className="flex items-center text-left gap-4">
                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">{item.code}</h3>
                      <p className="text-sm font-normal text-muted-foreground">{item.title}</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-6 pt-2">
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-lg border">
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                        <Info className="h-4 w-4 text-blue-500" />
                        What this means
                      </h4>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-3 mt-4">How to Mitigate & Prepare</h4>
                      <ul className="space-y-2">
                        {item.mitigation.map((tip, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <div className="h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs shrink-0 mt-0.5">
                              {idx + 1}
                            </div>
                            <span className="text-slate-700 dark:text-slate-300">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </div>
  );
}
