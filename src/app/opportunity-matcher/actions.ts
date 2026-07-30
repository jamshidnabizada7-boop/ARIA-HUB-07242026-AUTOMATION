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
      take: 100
    });
    
    if (opportunities.length === 0) {
      return null; // Signals client to use mock data fallback
    }

    const scored = opportunities.map(opp => {
      let score = 20; // Base score
      
      // Country match
      if (opp.country && userData.targetCountry && opp.country.toLowerCase().includes(userData.targetCountry.toLowerCase())) {
        score += 45;
      }
      
      // Goal match
      const typeStr = (opp.jobType || opp.category?.name || '').toLowerCase();
      const goalLower = (userData.goal || '').toLowerCase();
      if (goalLower && typeStr.includes(goalLower)) {
        score += 25;
      } else if (goalLower === 'scholarship' && typeStr.includes('scholar')) {
        score += 25;
      } else if (goalLower === 'internship' && typeStr.includes('intern')) {
        score += 25;
      } else if (goalLower === 'work visa' && (typeStr.includes('job') || typeStr.includes('work'))) {
        score += 25;
      }

      // Add a small random factor to break ties and make it feel dynamic
      score += Math.floor(Math.random() * 10);
      
      return {
        id: opp.id,
        title: opp.title,
        type: opp.jobType || opp.category?.name || 'Opportunity',
        location: opp.country || 'Global',
        match: Math.min(99, score),
        slug: opp.slug
      };
    });

    return scored.sort((a, b) => b.match - a.match).slice(0, 3);
  } catch (error) {
    console.error('Match error', error);
    return null;
  }
}
