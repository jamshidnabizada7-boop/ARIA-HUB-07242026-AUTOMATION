"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, Save, Download, ArrowLeft, Languages, CheckCheck, RefreshCw, Briefcase, FileText } from 'lucide-react';

export default function TemplateEditorPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const { slug } = React.use(params);
  const [template, setTemplate] = useState<any>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAction, setAiAction] = useState('');

  useEffect(() => {
    async function fetchTemplate() {
      try {
        const res = await fetch(`/api/templates/${slug}`);
        const json = await res.json();
        if (json.success) {
          setTemplate(json.data);
          // In a real implementation with @mdxeditor/editor or similar,
          // you would parse HTML/Markdown. Here we just set text.
          setContent(json.data.content || '');
        } else {
          router.push('/templates');
        }
      } catch (error) {
        console.error('Failed to fetch:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchTemplate();
  }, [slug, router]);

  const handleAiAction = async (action: string, contextPrompt?: string) => {
    setAiLoading(true);
    setAiAction(action);
    try {
      const res = await fetch('/api/ai/template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          content,
          context: contextPrompt || '',
          language: 'en'
        })
      });
      const json = await res.json();
      if (json.success && json.text) {
        setContent(json.text);
      } else {
        alert('AI processing failed. Please try again.');
      }
    } catch (error) {
      console.error('AI action failed:', error);
      alert('An error occurred. Check the console.');
    } finally {
      setAiLoading(false);
      setAiAction('');
    }
  };

  const handlePersonalize = () => {
    const context = prompt('Enter details about yourself (e.g. "I am applying for a Master\'s in Computer Science at MIT. I have 2 years of work experience at Google."):');
    if (context) {
      handleAiAction('personalize', context);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      
      {/* Editor Top Bar */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href={`/templates/${slug}`} className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-bold text-slate-900 dark:text-white line-clamp-1">{template?.title}</h1>
            <p className="text-xs text-slate-500">AI-Powered Editor</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 px-4 py-2 rounded-lg font-medium transition-colors">
            <Save className="w-4 h-4" /> Save Draft
          </button>
          <button className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 px-4 py-2 rounded-lg font-medium transition-colors">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Toolbar (AI Tools) */}
        <div className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-2 overflow-y-auto hidden md:flex">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" /> AI Assistant
          </h3>
          
          <button 
            onClick={() => handleAiAction('rewrite')}
            disabled={aiLoading}
            className="flex items-center gap-3 px-3 py-3 w-full text-left rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-50"
          >
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600 dark:text-blue-400">
              <RefreshCw className={`w-4 h-4 ${aiAction === 'rewrite' ? 'animate-spin' : ''}`} />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm">Rewrite</div>
              <div className="text-xs text-slate-500">Make it sound professional</div>
            </div>
          </button>

          <button 
            onClick={() => handleAiAction('improve_grammar')}
            disabled={aiLoading}
            className="flex items-center gap-3 px-3 py-3 w-full text-left rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-50"
          >
            <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg text-emerald-600 dark:text-emerald-400">
              <CheckCheck className={`w-4 h-4 ${aiAction === 'improve_grammar' ? 'animate-pulse' : ''}`} />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm">Improve Grammar</div>
              <div className="text-xs text-slate-500">Fix typos & readability</div>
            </div>
          </button>

          <button 
            onClick={handlePersonalize}
            disabled={aiLoading}
            className="flex items-center gap-3 px-3 py-3 w-full text-left rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-50"
          >
            <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg text-indigo-600 dark:text-indigo-400">
              <FileText className={`w-4 h-4 ${aiAction === 'personalize' ? 'animate-pulse' : ''}`} />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm">Personalize</div>
              <div className="text-xs text-slate-500">Add your own details</div>
            </div>
          </button>

          <button 
            onClick={() => handleAiAction('translate', 'Spanish')} // Hardcoded for demo
            disabled={aiLoading}
            className="flex items-center gap-3 px-3 py-3 w-full text-left rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-50"
          >
            <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg text-amber-600 dark:text-amber-400">
              <Languages className={`w-4 h-4 ${aiAction === 'translate' ? 'animate-pulse' : ''}`} />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm">Translate</div>
              <div className="text-xs text-slate-500">Convert language</div>
            </div>
          </button>
          
          <button 
            onClick={() => handleAiAction('rewrite', 'Optimize this CV content for ATS tracking systems by highlighting keywords and formatting strictly.')}
            disabled={aiLoading || template?.category?.name !== 'CV'}
            className="flex items-center gap-3 px-3 py-3 w-full text-left rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-50"
          >
            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg text-purple-600 dark:text-purple-400">
              <Briefcase className={`w-4 h-4 ${aiAction === 'optimize' ? 'animate-pulse' : ''}`} />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm">ATS Optimize</div>
              <div className="text-xs text-slate-500">For CVs / Resumes</div>
            </div>
          </button>

        </div>

        {/* Editor Area */}
        <div className="flex-1 bg-slate-100 dark:bg-slate-950 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 min-h-[800px] flex flex-col relative overflow-hidden">
              
              {/* Overlay while AI is generating */}
              {aiLoading && (
                <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 relative flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin"></div>
                    <Sparkles className="w-6 h-6 text-blue-600 animate-pulse" />
                  </div>
                  <p className="mt-4 font-medium text-slate-700 dark:text-slate-300">
                    AI is processing your document...
                  </p>
                </div>
              )}

              {/* Simple textarea for demo purposes. In production, use @mdxeditor/editor */}
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="flex-1 w-full p-8 md:p-12 resize-none outline-none text-slate-700 dark:text-slate-300 bg-transparent leading-relaxed"
                placeholder="Start typing your document here..."
                dir="auto"
              ></textarea>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
