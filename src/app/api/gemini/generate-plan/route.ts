import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient, generateCuratedPlan } from '@/lib/gemini';
import { GeneratedPlanResponse } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
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
      customApiKey,
    } = body;

    if (!title || !location || !totalBudget || !guestCount) {
      return NextResponse.json({ error: 'Missing required event fields' }, { status: 400 });
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
        const parsedData: GeneratedPlanResponse = JSON.parse(cleanedText);
        parsedData.isDemoMode = false;

        return NextResponse.json(parsedData);
      } catch (geminiError: unknown) {
        console.warn('Gemini API call failed, falling back to curated plan:', geminiError);
        const fallbackPlan = generateCuratedPlan({
          eventType,
          title,
          date,
          location,
          guestCount: Number(guestCount),
          totalBudget: Number(totalBudget),
          duration,
          theme,
          foodPreferences,
          specialRequirements,
          rawPrompt,
        });
        return NextResponse.json(fallbackPlan);
      }
    }

    // No API key configured: return curated plan with demo mode flag
    const curatedPlan = generateCuratedPlan({
      eventType,
      title,
      date,
      location,
      guestCount: Number(guestCount),
      totalBudget: Number(totalBudget),
      duration,
      theme,
      foodPreferences,
      specialRequirements,
      rawPrompt,
    });

    return NextResponse.json(curatedPlan);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to generate event plan';
    console.error('Plan generation route error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
