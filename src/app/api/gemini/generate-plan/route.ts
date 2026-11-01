import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient, generateCuratedPlan } from '@/lib/gemini';
import { GeneratedPlanResponse } from '@/types';

function isValidPlanResponse(data: unknown): data is GeneratedPlanResponse {
  if (!data || typeof data !== 'object') return false;
  const d = data as Partial<GeneratedPlanResponse>;
  if (typeof d.event_summary !== 'string' || !d.event_summary.trim()) return false;
  if (!d.budget || typeof d.budget !== 'object') return false;
  if (!Array.isArray(d.budget.categories) || d.budget.categories.length === 0) return false;
  if (!Array.isArray(d.timeline) || d.timeline.length === 0) return false;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    let body: Record<string, unknown>;
    try {
      body = await req.json();
      if (!body || typeof body !== 'object') {
        return NextResponse.json({ error: 'Request body must be a valid JSON object' }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: 'Invalid or empty JSON in request body' }, { status: 400 });
    }

    const eventType = typeof body.eventType === 'string' ? body.eventType.trim() : 'other';
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const date = typeof body.date === 'string' ? body.date.trim() : '';
    const location = typeof body.location === 'string' ? body.location.trim() : '';
    const duration = typeof body.duration === 'string' ? body.duration.trim() : '1 day';
    const theme = typeof body.theme === 'string' ? body.theme.trim() : '';
    const foodPreferences = typeof body.foodPreferences === 'string' ? body.foodPreferences.trim() : '';
    const specialRequirements = typeof body.specialRequirements === 'string' ? body.specialRequirements.trim() : '';
    const rawPrompt = typeof body.rawPrompt === 'string' ? body.rawPrompt.trim() : '';
    const customApiKey = typeof body.customApiKey === 'string' ? body.customApiKey.trim() : undefined;

    const guestCount = Number(body.guestCount);
    const totalBudget = Number(body.totalBudget);

    if (!title) {
      return NextResponse.json({ error: 'Event title is required' }, { status: 400 });
    }
    if (!location) {
      return NextResponse.json({ error: 'Event location is required' }, { status: 400 });
    }
    if (!Number.isFinite(guestCount) || guestCount <= 0 || guestCount > 100000) {
      return NextResponse.json({ error: 'Guest count must be a positive number up to 100,000' }, { status: 400 });
    }
    if (!Number.isFinite(totalBudget) || totalBudget <= 0) {
      return NextResponse.json({ error: 'Total budget must be a positive number' }, { status: 400 });
    }

    const ai = getGeminiClient(customApiKey);

    if (ai) {
      try {
        const systemInstruction = `You are Eventora AI, a world-class master event planner and production director.
Create an exhaustive, realistic, and culturally nuanced event plan based on the user's requirements.
Respond with pure JSON matching this exact structure:
{
  "event_summary": "Comprehensive overview of the event vision, scale, and theme",
  "budget": {
    "total": number,
    "categories": [
      {
        "name": "string (Venue, Catering, Decoration, Photography, Entertainment, etc.)",
        "estimated_cost": number,
        "percentage": number,
        "description": "string"
      }
    ]
  },
  "timeline": [
    {
      "task": "string",
      "phase": "6_months" | "3_months" | "1_month" | "2_weeks" | "1_week" | "event_day",
      "deadline": "YYYY-MM-DD",
      "priority": "high" | "medium" | "low",
      "category": "string",
      "description": "string"
    }
  ],
  "vendors_required": [
    {
      "category": "Venue" | "Catering" | "Decoration" | "Photography" | "Makeup & Styling" | "DJ & Music" | "Florist" | "Transportation" | "Event Coordinator" | "Invitations & Favors",
      "specs": "string",
      "estimated_budget": number,
      "recommended_booking_window": "string",
      "key_questions_to_ask": ["string"]
    }
  ],
  "food_recommendations": [
    {
      "course": "string",
      "items": ["string"],
      "highlight": "string"
    }
  ],
  "creative_ideas": [
    {
      "category": "decor" | "menu" | "entertainment" | "gifts" | "photography",
      "title": "string",
      "description": "string"
    }
  ],
  "recommendations": ["string"]
}`;

        const promptText = `Please generate an intelligent, actionable event plan for:
Event Type: ${eventType}
Event Title: ${title}
Event Date: ${date}
Duration: ${duration || '1 day'}
Location: ${location}
Guests: ${guestCount}
Total Budget: ₹${totalBudget}
Theme & Preferences: ${theme || 'None specified'}
Food Preferences: ${foodPreferences || 'None specified'}
Special Requirements: ${specialRequirements || 'None specified'}
User's Natural Language Description: ${rawPrompt || 'Standard event'}

Ensure budget categories sum up approximately to the total budget ₹${totalBudget}.
Output strictly valid JSON. Do not wrap in backticks or markdown fences if possible.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: promptText,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
          },
        });

        const rawText = response.text || '';
        const cleanedText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedData: unknown = JSON.parse(cleanedText);

        if (isValidPlanResponse(parsedData)) {
          parsedData.isDemoMode = false;
          return NextResponse.json(parsedData);
        }

        console.warn('Gemini response missing required schema fields, using curated fallback');
      } catch (geminiError: unknown) {
        console.warn('Gemini API call failed, falling back to curated plan:', geminiError);
      }
    }

    // Curated high-fidelity plan generation (fallback or when no key configured)
    const curatedPlan = generateCuratedPlan({
      eventType,
      title,
      date,
      location,
      guestCount,
      totalBudget,
      duration,
      theme,
      foodPreferences,
      specialRequirements,
      rawPrompt,
    });

    return NextResponse.json(curatedPlan);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('Plan generation route error:', message);
    return NextResponse.json({ error: 'Failed to process event plan request' }, { status: 500 });
  }
}
