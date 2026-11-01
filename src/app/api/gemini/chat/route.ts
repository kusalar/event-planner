import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/gemini';
import { checkRateLimit, getClientIp, createRateLimitHeaders } from '@/lib/rateLimit';
import {
  parseJsonBody,
  sanitizeText,
  validateCustomApiKey,
  authenticateRequestUser,
} from '@/lib/apiSecurity';

interface IncomingChatMessage {
  sender: 'user' | 'assistant';
  content: string;
}

interface EventContextPayload {
  title?: string;
  eventType?: string;
  date?: string;
  location?: string;
  guestCount?: number;
  totalBudget?: number;
  totalSpent?: number;
  remainingBudget?: number;
  foodPreferences?: string;
  theme?: string;
  bookedVendorsCount?: number;
  completedTasksCount?: number;
  totalTasksCount?: number;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user if Bearer token present
    const authUser = await authenticateRequestUser(req);
    const clientIdentifier = authUser ? `usr_${authUser.id}` : getClientIp(req.headers);

    // 2. Sliding window rate limit: 60 req/min for authenticated, 30 req/min for anonymous
    const rateLimitLimit = authUser ? 60 : 30;
    const rateLimit = checkRateLimit(clientIdentifier, 'chat_message', {
      limit: rateLimitLimit,
      windowSeconds: 60,
    });

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Please wait a moment before sending another message.',
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

    const rawMessages = Array.isArray(body.messages) ? (body.messages as IncomingChatMessage[]) : null;
    const rawContext = (body.eventContext && typeof body.eventContext === 'object') ? (body.eventContext as EventContextPayload) : null;
    const customApiKey = validateCustomApiKey(body.customApiKey);

    if (!rawMessages || rawMessages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
    }

    // Bound conversation history to last 25 messages and sanitize each message
    const messages: IncomingChatMessage[] = rawMessages.slice(-25).map((m) => ({
      sender: m.sender === 'user' ? 'user' : 'assistant',
      content: sanitizeText(m.content, 2000),
    }));

    const lastMsg = messages[messages.length - 1];
    if (!lastMsg || !lastMsg.content) {
      return NextResponse.json({ error: 'Last message must contain non-empty text content' }, { status: 400 });
    }

    // Sanitize event context
    const eventContext: EventContextPayload | null = rawContext
      ? {
          title: sanitizeText(rawContext.title, 120),
          eventType: sanitizeText(rawContext.eventType, 50),
          date: sanitizeText(rawContext.date, 30),
          location: sanitizeText(rawContext.location, 120),
          guestCount: Math.max(0, Math.min(100000, Number(rawContext.guestCount) || 0)),
          totalBudget: Math.max(0, Math.min(1000000000, Number(rawContext.totalBudget) || 0)),
          totalSpent: Math.max(0, Math.min(1000000000, Number(rawContext.totalSpent) || 0)),
          remainingBudget: Math.max(-1000000000, Math.min(1000000000, Number(rawContext.remainingBudget) || 0)),
          foodPreferences: sanitizeText(rawContext.foodPreferences, 200),
          theme: sanitizeText(rawContext.theme, 200),
          bookedVendorsCount: Math.max(0, Math.min(500, Number(rawContext.bookedVendorsCount) || 0)),
          completedTasksCount: Math.max(0, Math.min(1000, Number(rawContext.completedTasksCount) || 0)),
          totalTasksCount: Math.max(0, Math.min(1000, Number(rawContext.totalTasksCount) || 0)),
        }
      : null;

    const lastUserMessage = lastMsg.content;
    const ai = getGeminiClient(customApiKey);

    const contextSummary = eventContext
      ? `Active Event Context:
- Title: ${eventContext.title || 'Untitled'}
- Event Type: ${eventContext.eventType || 'Event'}
- Date: ${eventContext.date || 'TBA'}
- Location: ${eventContext.location || 'TBA'}
- Guests: ${eventContext.guestCount || 0}
- Total Budget: ₹${Number(eventContext.totalBudget || 0).toLocaleString('en-IN')}
- Spent so far: ₹${Number(eventContext.totalSpent || 0).toLocaleString('en-IN')}
- Remaining: ₹${Number(eventContext.remainingBudget || 0).toLocaleString('en-IN')}
- Food Preferences: ${eventContext.foodPreferences || 'Standard'}
- Theme: ${eventContext.theme || 'Standard'}
- Booked Vendors: ${eventContext.bookedVendorsCount || 0}
- Completed Tasks: ${eventContext.completedTasksCount || 0} of ${eventContext.totalTasksCount || 0}`
      : 'No active event selected.';

    let apiErrorMessage: string | null = null;

    if (ai) {
      try {
        const systemInstruction = `You are Eventora AI, an elite, warm, articulate, and highly experienced 24/7 personal event planner and production director.
You have complete knowledge of the user's active event details:
${contextSummary}

Rules:
1. Always keep your advice practical, budget-aware, culturally authentic, and tailored specifically to their event location, guest count, and current spending.
2. Structure your answers with clear bullet points, actionable tips, and estimated savings or metrics where applicable.
3. If they ask about saving money, give concrete 15-20% reduction strategies (e.g., seasonal flower substitutions, day-time catering shifts, corkage waivers).
4. Maintain a supportive, enthusiastic, yet professional tone.`;

        // Format conversation history
        const contents = messages.map((m: IncomingChatMessage) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }],
        }));

        // 15-second AbortController to cancel remote network connection on timeout
        const abortController = new AbortController();
        const timeoutId = setTimeout(() => {
          abortController.abort(new Error('Gemini API call timed out after 15 seconds'));
        }, 15000);

        let response;
        try {
          response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents,
            config: {
              systemInstruction,
              maxOutputTokens: 1500,
              abortSignal: abortController.signal,
              httpOptions: { timeout: 15000 },
            },
          });
        } finally {
          clearTimeout(timeoutId);
        }

        const reply = response.text || "I'm ready to help you plan your event. What would you like to explore next?";
        return NextResponse.json(
          {
            reply,
            isLiveModel: true,
            model: 'gemini-2.5-flash',
          },
          {
            headers: createRateLimitHeaders(rateLimit),
          }
        );
      } catch (geminiError: unknown) {
        apiErrorMessage = geminiError instanceof Error ? geminiError.message : 'Upstream provider error';
        console.warn('Gemini chat failed, using contextual fallback:', apiErrorMessage);
      }
    }

    // Contextual intelligent fallback
    const lower = String(lastUserMessage || '').toLowerCase();
    let reply = '';

    if (lower.includes('reduce') || lower.includes('save') || lower.includes('cut') || lower.includes('expense') || lower.includes('budget')) {
      reply = `### 💡 4 High-Impact Strategies to Optimize Your Budget for **${eventContext?.title || 'your event'}**

Based on your current budget of **₹${Number(eventContext?.totalBudget || 800000).toLocaleString('en-IN')}** for **${eventContext?.guestCount || 300} guests**:

1. **Strategic Catering Optimizations (Save 10%–15%):**
   - Replace 2 elaborate live specialty counters with high-volume, crowd-favorite street delicacies (e.g. Puchka/Chaat stations or Kulhar Chai).
   - Consolidate desserts to 2 authentic signature sweets (like hot Nolen Gur Rosogolla and Baked Sandesh) instead of 5 overlapping confectioneries.

2. **Floral & Decoration Smart Substitutions (Save 15%–20%):**
   - Utilize locally sourced fresh marigolds, tuberoses, and cascading fabric drapes instead of imported exotic blooms (hydrangeas, orchids).
   - Use reusable warm LED fairy light canopies and brass lanterns (Urlis) to create a royal glow with minimal floral volume.

3. **Vendor Bundle Negotiations:**
   - Contract photography, videography, and drone reel editing with a unified studio team to negotiate a 15% combined package discount.

4. **Beverage & Bar Protocol:**
   - Negotiate a fixed corkage waiver directly with the venue management rather than paying per-bottle bar handling markups.`;
    } else if (lower.includes('theme') || lower.includes('decor') || lower.includes('decoration')) {
      reply = `### 🎨 Curated Decoration Themes for **${eventContext?.title || 'Your Celebration'}** in ${eventContext?.location || 'Kolkata'}

1. **The Rajbari Heritage Courtyard:**
   - **Color Palette:** Royal Terracotta, Vermillion Red, Marigold Yellow, and Antique Gold.
   - **Elements:** Brass Urlis with floating rose petals, traditional hand-painted Alpona motifs at the entrance, vintage handloom Gamcha textile backdrops, and soft warm string lighting.

2. **Modern Botanical Minimalist:**
   - **Color Palette:** Emerald Green, Ivory White, and Champagne Gold.
   - **Elements:** Banana leaf framing, fragrant Bela/Jasmine floral chandeliers, cascading tuberose curtains, and subtle pastel lounge seating.

3. **Glow of Ganges (Evening Diya Symphony):**
   - **Elements:** Earthen diya walkways, floating candles in clay basins, and hanging brass lanterns casting intricate shadow patterns.`;
    } else if (lower.includes('1 week') || lower.includes('one week') || lower.includes('week before') || lower.includes('prepare')) {
      reply = `### 📋 Critical 1-Week Countdown Checklist for **${eventContext?.title || 'Your Event'}**

With your event scheduled for **${eventContext?.date || 'upcoming dates'}**:

- [ ] **Final Headcount Lock:** Call caterer and provide exact guaranteed plate count (keeping a 5% buffer).
- [ ] **Vendor Schedule Matrix:** Distribute a single-page WhatsApp schedule to venue, decorator, photographer, and music team with entry and setup times.
- [ ] **Cash Envelope Preparation:** Organize cash or UPI reserves for vendor final balances, priest/emcee Dakshina, and helper tips.
- [ ] **Wardrobe & Steaming:** Inspect all outfits, footwear, and accessories; schedule garment steaming.
- [ ] **Emergency Kit:** Pack a bag with safety pins, stain remover wipes, pain relief tablets, phone power banks, and scissors.
- [ ] **Key Point of Contact:** Appoint one dependable family member or coordinator as the vendor phone point-of-contact so you remain calm and present.`;
    } else if (lower.includes('menu') || lower.includes('food') || lower.includes('vegetarian') || lower.includes('catering')) {
      reply = `### 🍽️ Curated Banquet Menu Proposal for **${eventContext?.guestCount || 300} Guests**

**Welcome Refreshments:**
- Aam Panna with roasted cumin & rock salt
- Gondhoraj Lemon & Mint Basil Spritzer
- Fresh Kulhar Masala Chai & Mini Singara

**Starter Canapés:**
- Crispy Mochar Chop (Banana Blossom Cutlets) with Kasundi mustard
- Golden Paneer Tikka with mint chutney
- Kolkata Street Phuchka Live Counter (3 spiced waters)

**The Main Feast:**
- Fragrant Basmati Kaju-Kishmish Pulao
- Radhaballabhi with Hing-Chholar Dal
- Chanar Dalna (Cottage Cheese Dumplings in rich gravy)
- Navratan Korma / Seasonal Dum Aloo
- Fresh Tomato & Aamshotto (Mango bar) Sweet Chutney with Papad

**Grand Desserts:**
- Warm Nolen Gur Baked Rosogolla
- Creamy Mishti Doi in miniature earthen pots
- Traditional Malpua with Rabdi garnish`;
    } else if (lower.includes('forget') || lower.includes('checklist') || lower.includes('tips') || lower.includes('remind')) {
      reply = `### ⚠️ Top 5 Things People Frequently Forget to Plan:

1. **Vendor Feeding Policy:** Ensure you include 8–12 vendor crew meals (photographers, DJ team, sound engineer, coordinator) in your catering order.
2. **Audio/Mic Redundancy:** Venues occasionally have spotty microphones. Ensure your DJ or sound vendor has at least 2 cordless microphones with fresh AA batteries.
3. **Dedicated Bridal/VIP Room Key:** Keep one trusted person in charge of the dressing room key where valuables, gifts, and personal accessories are stored.
4. **Permits & Sound Permissions:** In cities like ${eventContext?.location || 'Kolkata'}, outdoor sound amplified beyond 10:00 PM requires local clearance. Have an indoor acoustic plan ready.
5. **Luggage & Gift Transportation:** Designate a vehicle and 2 relatives to transport gifts, leftover decor items, and luggage safely back home at the end of the night.`;
    } else {
      reply = `Thank you for your question regarding **${eventContext?.title || 'your event'}**!

Here is my recommendation:
- **Guest Scale:** For ${eventContext?.guestCount || 300} guests, keeping lines flowing and logistics smooth is paramount.
- **Budget Balance:** Your remaining budget is **₹${Number(eventContext?.remainingBudget || 0).toLocaleString('en-IN')}**. Prioritize locking any pending vendor contracts before costs rise.
- **Next Step:** Would you like me to refine your catering menu, draft custom invitation wording, or review your vendor checklists?`;
    }

    return NextResponse.json(
      {
        reply,
        isLiveModel: false,
        isDemoMode: true,
        keyError: apiErrorMessage,
        note: apiErrorMessage
          ? `API notice: ${apiErrorMessage}. Reverted to curated domain intelligence.`
          : 'Demo Mode: Running curated local intelligence. Set a valid Gemini API Key in Settings to enable Live Gemini API calls.',
      },
      {
        headers: createRateLimitHeaders(rateLimit),
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('Chat API error:', message);
    return NextResponse.json({ error: 'Failed to process chat message' }, { status: 500 });
  }
}
