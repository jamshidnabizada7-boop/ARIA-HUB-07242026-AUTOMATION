import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { targetCountry, major, scholarshipType, currentIndex, previousQuestions } = await request.json();

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GROQ_API_KEY not configured' }, { status: 500 });
    }

    const prompt = `
You are a strict but fair scholarship committee member for a ${scholarshipType} in ${targetCountry}. The candidate is majoring in ${major}.
You are currently on question ${currentIndex + 1} of the interview.
Previous questions asked: ${previousQuestions.length > 0 ? previousQuestions.join(" | ") : "None"}.

Generate exactly ONE challenging, realistic interview question that is tailored to their profile (${major} in ${targetCountry} for a ${scholarshipType}). 
Do not ask a question you have already asked.
Make it sound conversational but professional.

Return ONLY valid JSON without any markdown formatting.
Format:
{
  "question": "The generated question text here"
}
`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API Error:', errorText);
      return NextResponse.json({ error: 'Failed to process AI evaluation' }, { status: 500 });
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Generate Question API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
