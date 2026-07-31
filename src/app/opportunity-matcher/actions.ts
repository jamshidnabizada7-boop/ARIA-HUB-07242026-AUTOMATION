'use server';

import { db } from '@/lib/db';

export async function getMatchedOpportunities(userData: {
  age: string;
  targetCountry: string;
  education: string;
  goal: string;
}) {
  try {
    const opportunities = await db.opportunity.findMany({
      where: { status: 'published' },
      include: { category: true },
      take: 20 // Take a reasonable sample to pass to the LLM
    });
    
    if (opportunities.length === 0) {
      return null;
    }

    // Step 1: Pre-filter or pre-score based on basic criteria to find top 5 candidates
    const scored = opportunities.map(opp => {
      let score = 20;
      if (opp.country && userData.targetCountry && opp.country.toLowerCase().includes(userData.targetCountry.toLowerCase())) score += 45;
      const typeStr = (opp.jobType || opp.category?.name || '').toLowerCase();
      const goalLower = (userData.goal || '').toLowerCase();
      if (goalLower && typeStr.includes(goalLower)) score += 25;
      else if (goalLower === 'scholarship' && typeStr.includes('scholar')) score += 25;
      else if (goalLower === 'internship' && typeStr.includes('intern')) score += 25;
      else if (goalLower === 'work visa' && (typeStr.includes('job') || typeStr.includes('work'))) score += 25;
      return { ...opp, baseScore: score };
    });

    const topCandidates = scored.sort((a, b) => b.baseScore - a.baseScore).slice(0, 5);
    
    // Step 2: Use Groq LLM to analyze the top 5 and pick the best 3 with personalized explanations
    const groqApiKey = process.env.GROQ_API_KEY;
    const model = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

    let aiResults: any = null;

    if (groqApiKey) {
      const prompt = `
        You are an expert admissions and career counselor for ARIA HUB. 
        A user has provided the following profile:
        - Age: ${userData.age}
        - Education: ${userData.education}
        - Target Country: ${userData.targetCountry}
        - Goal: ${userData.goal}

        Here are 5 potential opportunities from our database:
        ${topCandidates.map(c => `ID: ${c.id} | Title: ${c.title} | Type: ${c.jobType || c.category?.name} | Location: ${c.country}`).join('\n')}

        Select the top 3 best matching opportunities for this user. 
        For each, provide:
        1. A "match" score from 1 to 99.
        2. "chanceOfAcceptance": "High", "Medium", or "Low".
        3. A brief "rationale" (1-2 sentences explaining exactly why this is a good fit for their specific profile).

        Output ONLY valid JSON in this exact array format:
        [
          {
            "id": "opp_id_here",
            "match": 95,
            "chanceOfAcceptance": "High",
            "rationale": "Because you want a scholarship in the UK..."
          }
        ]
      `;

      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${groqApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.2,
            response_format: { type: "json_object" } // Using JSON mode if supported, but just relying on structure
          })
        });

        if (response.ok) {
          const data = await response.json();
          let content = data.choices[0].message.content;
          // Extract JSON array
          const jsonStart = content.indexOf('[');
          const jsonEnd = content.lastIndexOf(']') + 1;
          if (jsonStart !== -1 && jsonEnd !== -1) {
            aiResults = JSON.parse(content.substring(jsonStart, jsonEnd));
          }
        } else {
          console.error("Groq API error:", await response.text());
        }
      } catch (err) {
        console.error("Groq fetch error:", err);
      }
    }

    // Step 3: Map AI results back to our objects
    let finalResults = [];
    if (aiResults && Array.isArray(aiResults) && aiResults.length > 0) {
      finalResults = aiResults.map((aiObj: any) => {
        const opp = topCandidates.find(c => c.id === aiObj.id) || topCandidates[0];
        return {
          id: opp.id,
          title: opp.title,
          type: opp.jobType || opp.category?.name || 'Opportunity',
          location: opp.country || 'Global',
          match: aiObj.match || opp.baseScore,
          chanceOfAcceptance: aiObj.chanceOfAcceptance || 'Medium',
          rationale: aiObj.rationale || 'A strong match based on your preferences.',
          slug: opp.slug
        };
      });
    } else {
      // Fallback if AI fails
      finalResults = topCandidates.slice(0, 3).map(opp => ({
        id: opp.id,
        title: opp.title,
        type: opp.jobType || opp.category?.name || 'Opportunity',
        location: opp.country || 'Global',
        match: Math.min(99, opp.baseScore),
        chanceOfAcceptance: opp.baseScore > 50 ? 'High' : 'Medium',
        rationale: 'Matches your selected target country and goals.',
        slug: opp.slug
      }));
    }

    return finalResults.sort((a, b) => b.match - a.match);
  } catch (error) {
    console.error('Match error', error);
    return null;
  }
}

