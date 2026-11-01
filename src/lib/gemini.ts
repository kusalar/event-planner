import { GoogleGenAI } from '@google/genai';
import { GeneratedPlanResponse } from '@/types';

// Get API key from env (server-only) or custom user key
export function getGeminiClient(customApiKey?: string) {
  const validCustomKey =
    typeof customApiKey === 'string' && /^[A-Za-z0-9_-]{20,100}$/.test(customApiKey.trim())
      ? customApiKey.trim()
      : undefined;

  const key = validCustomKey || process.env.GEMINI_API_KEY;
  if (!key) return null;
  return new GoogleGenAI({ apiKey: key });
}

export function isGeminiKeyConfigured(customApiKey?: string): boolean {
  const validCustomKey =
    typeof customApiKey === 'string' && /^[A-Za-z0-9_-]{20,100}$/.test(customApiKey.trim())
      ? customApiKey.trim()
      : undefined;
  return Boolean(validCustomKey || process.env.GEMINI_API_KEY);
}

// Fallback high-fidelity plan generator tailored strictly to user inputs
export function generateCuratedPlan(params: {
  eventType: string;
  title: string;
  date: string;
  location: string;
  guestCount: number;
  totalBudget: number;
  duration?: string;
  theme?: string;
  foodPreferences?: string;
  specialRequirements?: string;
  rawPrompt?: string;
}): GeneratedPlanResponse {
  const { eventType, title, date, location, guestCount, totalBudget, theme, foodPreferences, specialRequirements } = params;

  // Sanitize numeric parameters defensively
  const safeTotalBudget = Math.max(1000, Math.round(Number(totalBudget) || 100000));
  const safeGuestCount = Math.max(1, Math.round(Number(guestCount) || 50));

  // Compute realistic budget distribution
  const venueCost = Math.round(safeTotalBudget * (eventType === 'wedding' ? 0.22 : 0.3));
  const cateringCost = Math.round(safeTotalBudget * (eventType === 'wedding' ? 0.32 : 0.35));
  const decorCost = Math.round(safeTotalBudget * 0.15);
  const photoCost = Math.round(safeTotalBudget * 0.1);
  const entertainmentCost = Math.round(safeTotalBudget * 0.08);
  const invitesCost = Math.round(safeTotalBudget * 0.04);
  const miscCost = safeTotalBudget - (venueCost + cateringCost + decorCost + photoCost + entertainmentCost + invitesCost);

  // Compute milestone dates relative to event date with invalid-date guards
  let eventDateObj = new Date(date || '2027-02-14');
  if (isNaN(eventDateObj.getTime())) {
    eventDateObj = new Date('2027-02-14');
  }

  const dMinus6M = new Date(eventDateObj);
  dMinus6M.setMonth(dMinus6M.getMonth() - 6);
  const dMinus3M = new Date(eventDateObj);
  dMinus3M.setMonth(dMinus3M.getMonth() - 3);
  const dMinus1M = new Date(eventDateObj);
  dMinus1M.setMonth(dMinus1M.getMonth() - 1);
  const dMinus2W = new Date(eventDateObj);
  dMinus2W.setDate(dMinus2W.getDate() - 14);
  const dMinus1W = new Date(eventDateObj);
  dMinus1W.setDate(dMinus1W.getDate() - 7);

  const formatDate = (d: Date) => {
    try {
      if (isNaN(d.getTime())) return '2027-02-14';
      return d.toISOString().split('T')[0];
    } catch {
      return '2027-02-14';
    }
  };

  return {
    isDemoMode: true,
    event_summary: `A meticulously engineered, bespoke plan for "${title}" in ${location}. Designed for ${safeGuestCount} guests with a structured budget of ₹${safeTotalBudget.toLocaleString('en-IN')}.${specialRequirements ? ` Special accommodations: ${specialRequirements}.` : ''} The production harmonizes ${theme || 'curated modern aesthetics'} with an unforgettable culinary and entertainment experience.`,
    budget: {
      total: safeTotalBudget,
      currency: 'INR',
      categories: [
        {
          name: 'Catering & Beverages',
          estimated_cost: cateringCost,
          percentage: Math.round((cateringCost / safeTotalBudget) * 100),
          description: `Full live banquet & hospitality for ${safeGuestCount} guests, including welcome refreshments and desserts.`,
        },
        {
          name: 'Venue & Infrastructure',
          estimated_cost: venueCost,
          percentage: Math.round((venueCost / safeTotalBudget) * 100),
          description: `Primary venue booking in ${location}, bridal/VIP suites, generator backup, and parking logistics.`,
        },
        {
          name: 'Decoration & Thematic Styling',
          estimated_cost: decorCost,
          percentage: Math.round((decorCost / safeTotalBudget) * 100),
          description: `Custom stage/mandap design, ambient lighting, floral arches, and photobooth installations matching ${theme || 'event theme'}.`,
        },
        {
          name: 'Photography & Cinematography',
          estimated_cost: photoCost,
          percentage: Math.round((photoCost / safeTotalBudget) * 100),
          description: 'Candid photo team, 4K documentary video reel, drone aerial coverage, and teaser video delivery.',
        },
        {
          name: 'Entertainment & Music',
          estimated_cost: entertainmentCost,
          percentage: Math.round((entertainmentCost / safeTotalBudget) * 100),
          description: 'Sound system, DJ console, live regional/acoustic artists, and anchor/emcee coordination.',
        },
        {
          name: 'Invitations & Guest Favors',
          estimated_cost: invitesCost,
          percentage: Math.round((invitesCost / safeTotalBudget) * 100),
          description: 'Digital interactive e-invites, physical keepsakes, and personalized return gifts.',
        },
        {
          name: 'Contingency & Logistics',
          estimated_cost: miscCost,
          percentage: Math.round((miscCost / safeTotalBudget) * 100),
          description: 'Emergency buffer fund, transportation shuttles, and regulatory permits.',
        },
      ],
    },
    timeline: [
      {
        task: `Finalize and lock the primary venue contract in ${location}`,
        phase: '6_months',
        deadline: formatDate(dMinus6M),
        priority: 'high',
        category: 'Venue',
        description: 'Verify guest capacity, parking slots, generator backup, and sound curfew policies.',
      },
      {
        task: 'Shortlist and conduct tasting session with premier caterer',
        phase: '6_months',
        deadline: formatDate(dMinus6M),
        priority: 'high',
        category: 'Catering',
        description: `Finalize course-by-course menu respecting preferences: ${foodPreferences || 'Multi-course banquet'}.`,
      },
      {
        task: 'Retain Candid Photographer & Cinematographer',
        phase: '3_months',
        deadline: formatDate(dMinus3M),
        priority: 'high',
        category: 'Photography',
        description: 'Review portfolio of similar celebrations and draft shotlist for key cultural ceremonies.',
      },
      {
        task: 'Dispatch Save-the-Date invites and launch digital RSVP tracker',
        phase: '3_months',
        deadline: formatDate(dMinus3M),
        priority: 'medium',
        category: 'Invitations',
        description: 'Collect dietary restrictions and accommodation requirements from out-of-town guests.',
      },
      {
        task: `Finalize detailed decor layout & 3D mockups (${theme || 'Thematic'})`,
        phase: '1_month',
        deadline: formatDate(dMinus1M),
        priority: 'high',
        category: 'Decoration',
        description: 'Coordinate floral deliveries, lighting rigs, stage heights, and entrance welcome signage.',
      },
      {
        task: 'Lock hair & makeup trials, entertainment playlists, and emcee script',
        phase: '2_weeks',
        deadline: formatDate(dMinus2W),
        priority: 'medium',
        category: 'Entertainment',
        description: 'Share song cues with DJ and finalize timeline of stage entries.',
      },
      {
        task: 'Final vendor headcount confirmation & balance payment schedule',
        phase: '1_week',
        deadline: formatDate(dMinus1W),
        priority: 'high',
        category: 'Coordination',
        description: 'Reconcile RSVP headcount with catering vendor to avoid food waste and extra cover charges.',
      },
      {
        task: 'Event Day Master Execution & Stage Logistics',
        phase: 'event_day',
        deadline: formatDate(eventDateObj),
        priority: 'high',
        category: 'Logistics',
        description: 'Supervise vendor arrival 5 hours prior, test audio/visual mics, and manage guest welcome team.',
      },
    ],
    vendors_required: [
      {
        category: 'Venue',
        specs: `Banquet hall or outdoor lawn accommodating ${guestCount}+ guests with adequate parking and dressing suites in ${location}.`,
        estimated_budget: venueCost,
        recommended_booking_window: '4-6 months before',
        key_questions_to_ask: [
          'What is the electricity load limit and is power backup fuel included?',
          'Are outside decorators or caterers allowed without royalty surcharge?',
          'What is the exact sound cutoff policy in the evening?',
        ],
      },
      {
        category: 'Catering',
        specs: `Full-service hospitality caterer experienced in ${foodPreferences || 'multi-course gourmet dining'} for ${guestCount} guests.`,
        estimated_budget: cateringCost,
        recommended_booking_window: '3-5 months before',
        key_questions_to_ask: [
          'What is the staff-to-guest ratio during peak dining hours?',
          'How do you manage buffer quantity if guest turnout fluctuates by 10%?',
          'Is mineral water and live counter equipment included in per-plate quote?',
        ],
      },
      {
        category: 'Decoration',
        specs: `Scenic designer to build thematic sets matching "${theme || 'Modern Royal'}".`,
        estimated_budget: decorCost,
        recommended_booking_window: '2-3 months before',
        key_questions_to_ask: [
          'Do you supply fresh natural blooms or hybrid artificial fixtures?',
          'What time will the setup team access the venue on the event morning?',
        ],
      },
      {
        category: 'Photography',
        specs: 'Team of 2 candid photographers + 1 cinematic videographer + drone coverage.',
        estimated_budget: photoCost,
        recommended_booking_window: '3-4 months before',
        key_questions_to_ask: [
          'What is the turnaround time for the 3-minute teaser and full wedding film?',
          'Do you provide all unedited RAW high-resolution files on a hard drive?',
        ],
      },
      {
        category: 'DJ & Music',
        specs: 'Professional sound system (line-array speakers) and DJ/live performers.',
        estimated_budget: entertainmentCost,
        recommended_booking_window: '1-2 months before',
        key_questions_to_ask: [
          'Do you provide wireless lapel and handheld cordless mics for speeches?',
          'Can we submit a strict "Do Not Play" playlist prior to the event?',
        ],
      },
    ],
    food_recommendations: [
      {
        course: 'Welcome Beverages & Street Canapés',
        items: ['Gondhoraj Mint Cooler / Fresh Aam Panna', 'Crispy Golden Canapés', 'Artisanal Kulhar Chai Counter'],
        highlight: 'Interactive live station greeting guests within 60 seconds of arrival.',
      },
      {
        course: 'The Main Banquet Feast',
        items: [
          foodPreferences ? `${foodPreferences} Specialties` : 'Signature Regional Delicacies',
          'Rich Saffron Pilaf / Biryani with Raita',
          'Slow-Cooked Dal & Artisanal Breads',
        ],
        highlight: 'Hot-served main course maintaining authentic flavor balance.',
      },
      {
        course: 'Desserts & Confectionery Finale',
        items: ['Warm Baked Rosogolla / Malpua with Rabdi', 'Gourmet Artisanal Kulfi Counter', 'Paan & Mukhwas Bar'],
        highlight: 'A celebratory sweet finish that leaves a lasting impression on guests.',
      },
    ],
    creative_ideas: [
      {
        category: 'decor',
        title: 'Illuminated Heritage Entrance & Photobooth',
        description: `A warm, ambient arrival portal featuring fairy light cascades, traditional brass Urlis filled with floating petals, and custom neon signage with "${title}".`,
      },
      {
        category: 'gifts',
        title: 'Eco-Conscious Artisanal Return Hampers',
        description: 'Sustainable jute gift bags filled with locally sourced organic delicacies, terracotta scented candles, and seed-paper thank-you cards.',
      },
      {
        category: 'entertainment',
        title: 'Guest Audio Guestbook Telephone',
        description: 'Place a vintage rotary telephone at the reception table where guests pick up the receiver to record voice messages and heartfelt blessings.',
      },
      {
        category: 'photography',
        title: 'Sunset Golden Hour Photo Session',
        description: 'Schedule a dedicated 25-minute buffer just before dusk for breathtaking natural light portraits before the evening crowd gathers.',
      },
    ],
    recommendations: [
      'Book your venue and caterer first; they consume over 50% of the budget and popular dates sell out months ahead.',
      'Always reserve 5-7% of the total budget for last-minute miscellaneous and logistical contingencies.',
      'Assign one trusted family member or coordinator as the vendor point-of-contact on event day so you can enjoy the celebration stress-free.',
      `With ${guestCount} guests, ensure at least 3 separate buffet lines or multiple live counters to prevent bottlenecks during dinner.`,
    ],
  };
}

