import { NextResponse } from 'next/server';
import { getAIProvider } from '@/lib/ai/provider';
import { GoogleGenAI } from '@google/genai'; // Assuming this is how it's used based on package.json, or we can use the provider.

export async function POST(request: Request) {
  try {
    const { action, content, context, language = 'en' } = await request.json();
    
    // We'll try to use the generic getAIProvider if it has what we need, 
    // otherwise fallback to a direct call if we need specific prompting.
    const ai = await getAIProvider();
    
    if (!ai) {
      return NextResponse.json({ success: false, error: 'AI provider not configured' }, { status: 503 });
    }
    
    let resultText = '';
    
    switch (action) {
      case 'rewrite':
        // using the existing rewrite method which expects to return a summary and text
        const rewriteResult = await ai.rewrite(content, { type: 'document template' });
        resultText = rewriteResult.text;
        break;
      case 'translate':
        resultText = await ai.translate(content, 'auto', language, { context });
        break;
      case 'improve_grammar':
        // we can hack the translate function to just improve grammar
        resultText = await ai.translate(content, language, language, { 
          context: 'Improve grammar, fix typos, and enhance readability while keeping the same meaning and tone.' 
        });
        break;
      case 'personalize':
        resultText = await ai.translate(content, language, language, { 
          context: `Personalize this document template for the user based on this context: ${context}` 
        });
        break;
      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
    
    return NextResponse.json({ success: true, text: resultText });
    
  } catch (error) {
    console.error('Error in AI template route:', error);
    return NextResponse.json({ success: false, error: 'Failed to process AI request' }, { status: 500 });
  }
}
