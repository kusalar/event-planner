import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient, generateCuratedPlan } from '@/lib/gemini';
import { GeneratedPlanResponse } from '@/types';
import { checkRateLimit, getClientIp, createRateLimitHeaders } from '@/lib/rateLimit';
import {
  parseJsonBody,
  sanitizeText,
  validateCustomApiKey,
  authenticateRequestUser,
} from '@/lib/apiSecurity';

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
    // 1. Authenticate user if Bearer token present
    const authUser = await authenticateRequestUser(req);
    const clientIdentifier = authUser ? `usr_${authUser.id}` : getClientIp(req.headers);

    // 2. Sliding window rate limit: 20 req/min for authenticated, 10 req/min for anonymous
    const rateLimitLimit = authUser ? 20 : 10;
    const rateLimit = checkRateLimit(clientIdentifier, 'plan_generate', {
      limit: rateLimitLimit,
      windowSeconds: 60,
    });

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Please wait a moment before generating another plan.',
          retryAfter: rateLimit.retryAfter,
        },
        {
          status: 429,
          headers: createRateLimitHeaders(rateLimit),
        }
      );
    }

    // 3. Request payload validation (max 64 KB + safe JSON parse)
    const bodyResult = await parseJsonBody<Record<string, unknown>>(req);
    if (!bodyResult.success || !bodyResult.data) {
      return bodyResult.errorResponse!;
    }
    const body = bodyResult.data;

    // 4. Input sanitization & bounds checking
    const eventType = sanitizeText(body.eventType, 50) || 'other';
    const title = sanitizeText(body.title, 120);
    const date = sanitizeText(body.date, 30);
    const location = sanitizeText(body.location, 120);
    const duration = sanitizeText(body.duration, 50) || '1 day';
    const theme = sanitizeText(body.theme, 500);
    const foodPreferences = sanitizeText(body.foodPreferences, 500);
    const specialRequirements = sanitizeText(body.specialRequirements, 500);
    const rawPrompt = sanitizeText(body.rawPrompt, 2000);
    const customApiKey = validateCustomApiKey(body.customApiKey);

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
    if (!Number.isFinite(totalBudget) || totalBudget <= 0 || totalBudget > 1000000000) {
      return NextResponse.json({ error: 'Total budget must be a positive number up to ₹1,00,00,00,000' }, { status: 400 });
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

        // 15-second AbortController to cancel remote network connection on timeout
        const abortController = new AbortController();
        const timeoutId = setTimeout(() => {
          abortController.abort(new Error('Gemini API call timed out after 15 seconds'));
        }, 15000);

        let response;
        try {
          response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: promptText,
            config: {
              systemInstruction,
              responseMimeType: 'application/json',
              maxOutputTokens: 2500,
              abortSignal: abortController.signal,
              httpOptions: { timeout: 15000 },
            },
          });
        } finally {
          clearTimeout(timeoutId);
        }

        const rawText = response.text || '';
        const cleanedText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedData: unknown = JSON.parse(cleanedText);

        if (isValidPlanResponse(parsedData)) {
          parsedData.isDemoMode = false;
          return NextResponse.json(parsedData, {
            headers: createRateLimitHeaders(rateLimit),
          });
        }

        console.warn('Gemini response missing required schema fields, using curated fallback');
      } catch (geminiError: unknown) {
        console.warn('Gemini API call failed, falling back to curated plan:', geminiError instanceof Error ? geminiError.message : String(geminiError));
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

    return NextResponse.json(curatedPlan, {
      headers: createRateLimitHeaders(rateLimit),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('Plan generation route error:', message);
    return NextResponse.json({ error: 'Failed to process event plan request' }, { status: 500 });
  }
}
