import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/gemini';
import { checkRateLimit, getClientIp, createRateLimitHeaders } from '@/lib/rateLimit';
import {
  parseJsonBody,
  sanitizeText,
  validateCustomApiKey,
  authenticateRequestUser,
} from '@/lib/apiSecurity';

interface InvitationResponse {
  whatsapp_message: string;
  card_text: string;
  subject_line: string;
  isLiveModel: boolean;
}

function isValidInvitationResponse(data: unknown): data is { whatsapp_message: string; card_text: string; subject_line: string } {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.whatsapp_message === 'string' &&
    typeof d.card_text === 'string' &&
    typeof d.subject_line === 'string'
  );
}

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user if Bearer token present
    const authUser = await authenticateRequestUser(req);
    const clientIdentifier = authUser ? `usr_${authUser.id}` : getClientIp(req.headers);

    // 2. Sliding window rate limit: 30 req/min for authenticated, 15 req/min for anonymous
    const rateLimitLimit = authUser ? 30 : 15;
    const rateLimit = checkRateLimit(clientIdentifier, 'invitation_generate', {
      limit: rateLimitLimit,
      windowSeconds: 60,
    });

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Please wait a moment before generating another invitation.',
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
    const title = sanitizeText(body.title, 120);
    const eventType = sanitizeText(body.eventType, 50) || 'event';
    const date = sanitizeText(body.date, 30);
    const location = sanitizeText(body.location, 120);
    const hostNames = sanitizeText(body.hostNames, 120);
    const tone = sanitizeText(body.tone, 50) || 'Royal & Elegant';
    const customApiKey = validateCustomApiKey(body.customApiKey);

    if (!title) {
      return NextResponse.json({ error: 'Event title is required for generating invitations' }, { status: 400 });
    }

    const ai = getGeminiClient(customApiKey);

    if (ai) {
      try {
        const prompt = `Write a beautifully worded event invitation for:
Event: ${title} (${eventType})
Date: ${date || 'Upcoming'}
Location: ${location || 'Venue TBA'}
Hosted by: ${hostNames || 'The Family'}
Tone: ${tone || 'Royal & Elegant'}

Provide 2 versions:
1. WhatsApp / Short Message format (with appropriate emojis, bullet points for date/venue/RSVP).
2. Formal / Card Print format (classic elegant wording suitable for an invitation card).

Respond in JSON format:
{
  "whatsapp_message": "string",
  "card_text": "string",
  "subject_line": "string"
}`;

        // 15-second AbortController to cancel remote network connection on timeout
        const abortController = new AbortController();
        const timeoutId = setTimeout(() => {
          abortController.abort(new Error('Gemini API call timed out after 15 seconds'));
        }, 15000);

        let res;
        try {
          res = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              maxOutputTokens: 1000,
              abortSignal: abortController.signal,
              httpOptions: { timeout: 15000 },
            },
          });
        } finally {
          clearTimeout(timeoutId);
        }

        const text = res.text || '';
        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed: unknown = JSON.parse(cleaned);

        if (isValidInvitationResponse(parsed)) {
          const responsePayload: InvitationResponse = {
            whatsapp_message: parsed.whatsapp_message,
            card_text: parsed.card_text,
            subject_line: parsed.subject_line,
            isLiveModel: true,
          };
          return NextResponse.json(responsePayload, {
            headers: createRateLimitHeaders(rateLimit),
          });
        }
      } catch (e: unknown) {
        console.warn('Gemini invitation generation failed, falling back to curated templates:', e instanceof Error ? e.message : String(e));
      }
    }

    // Curated high quality invitation generator
    let whatsapp = '';
    let card = '';
    let subject = '';

    const displayDate = date || 'Date to be announced';
    const displayLocation = location || 'Location to be announced';
    const displayHosts = hostNames || 'The Hosts';

    if (eventType === 'wedding') {
      subject = `Wedding Invitation: Celebrating the Union of ${title}`;
      whatsapp = `✨ *Two Hearts, One Journey* ✨\n\nWith immense joy and gratitude, *${displayHosts}* invite you to grace the auspicious wedding celebration of *${title}*.\n\n📅 *Date:* ${displayDate}\n📍 *Venue:* ${displayLocation}\n\nYour presence and blessings will make our special day complete. Kindly treat this as our personal invitation.\n\n_Please RSVP by sending a reply to this message._ 🕊️`;
      card = `Together with their families\n\n${displayHosts}\n\nrequest the honour of your presence at the wedding ceremony of\n\n${title}\n\n${displayDate}\n${displayLocation}\n\nDinner & Celebrations to follow\n\nR.S.V.P.`;
    } else if (eventType === 'corporate') {
      subject = `Official Invitation: ${title}`;
      whatsapp = `👔 *You Are Invited: ${title}* 🚀\n\nHosted by *${displayHosts}*, this premier gathering convenes thought leaders, founders, and innovators.\n\n🗓️ *Date:* ${displayDate}\n📍 *Venue:* ${displayLocation}\n\nJoin us for keynote presentations, networking luncheons, and live breakout sessions.\n\n_Confirm your registration via our event portal._`;
      card = `${displayHosts}\n\ncordially invites you to attend\n\n${title}\n\nDate: ${displayDate}\nVenue: ${displayLocation}\n\nRegistration & Networking commence at 9:00 AM\n\nStrictly by Invitation`;
    } else {
      subject = `Celebration Alert: ${title}!`;
      whatsapp = `🎉 *It's Time to Celebrate!* 🎂\n\n*${displayHosts}* cordially invite you to celebrate *${title}* with an evening of music, gourmet delicacies, and joyous memories.\n\n📅 *Date:* ${displayDate}\n📍 *Location:* ${displayLocation}\n\nCome celebrate with us! ✨`;
      card = `Join us as we celebrate\n\n${title}\n\nHosted by ${displayHosts}\n\n${displayDate}\n${displayLocation}\n\nWarmest regards & R.S.V.P.`;
    }

    return NextResponse.json(
      {
        whatsapp_message: whatsapp,
        card_text: card,
        subject_line: subject,
        isLiveModel: false,
      },
      {
        headers: createRateLimitHeaders(rateLimit),
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('Invitation API error:', message);
    return NextResponse.json({ error: 'Failed to generate invitation' }, { status: 500 });
  }
}
