import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/gemini';

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
    let body: Record<string, unknown>;
    try {
      body = await req.json();
      if (!body || typeof body !== 'object') {
        return NextResponse.json({ error: 'Request body must be a valid JSON object' }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: 'Invalid or empty JSON in request body' }, { status: 400 });
    }

    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const eventType = typeof body.eventType === 'string' ? body.eventType.trim() : 'event';
    const date = typeof body.date === 'string' ? body.date.trim() : '';
    const location = typeof body.location === 'string' ? body.location.trim() : '';
    const hostNames = typeof body.hostNames === 'string' ? body.hostNames.trim() : '';
    const tone = typeof body.tone === 'string' ? body.tone.trim() : 'Royal & Elegant';
    const customApiKey = typeof body.customApiKey === 'string' ? body.customApiKey.trim() : undefined;

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

        const res = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

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
          return NextResponse.json(responsePayload);
        }
      } catch (e: unknown) {
        console.warn('Gemini invitation generation failed, falling back to curated templates:', e);
      }
    }

    // Curated high quality invitation generator
    let whatsapp = '';
    let card = '';
    let subject = '';

    const displayDate = date || 'Date to be announced';
    const displayLocation = location || 'Location to be announced';
    const displayHosts = hostNames || 'The Hosts';

    if (tone === 'Traditional' || tone === 'Royal') {
      subject = `Wedding Invitation: Celebrating ${title}`;
      whatsapp = `✨ *|| শ্রী শ্রী প্রজাপতয়ে নমঃ ||* ✨\n\nWith the divine blessings of the Almighty and our elders, we cordially invite you and your family to celebrate the auspicious union of:\n\n👑 *${title}*\n\n📅 *Date:* ${displayDate}\n📍 *Venue:* ${displayLocation}\n\nJoin us for an evening of joyous rituals, traditional music, and an authentic banquet feast.\n\nWarm regards,\n*${displayHosts}*\n\n_Please RSVP by 2 weeks prior._`;
      card = `Together with their families\n\nCordially request the pleasure of your company to celebrate\n\n${title}\n\non ${displayDate}\nat ${displayLocation}\n\nDinner & Celebrations to follow.`;
    } else if (tone === 'Quirky' || tone === 'Modern') {
      subject = `You're Invited! Join us for ${title} 🎉`;
      whatsapp = `🥂 *Save the Date!* 🥂\n\nGood food, great music, and endless memories — we’re celebrating *${title}* and it wouldn't be complete without you!\n\n🗓️ *When:* ${displayDate}\n📍 *Where:* ${displayLocation}\n\nPut on your dancing shoes and get ready for a memorable time! 💃🕺\n\nCheers,\n${displayHosts}`;
      card = `Join us as we celebrate\n\n${title}\n\n${displayDate} • ${displayLocation}\n\nBring your smiles and best celebration vibes!`;
    } else {
      subject = `Official Invitation: ${title}`;
      whatsapp = `Dear Guests,\n\nYou are cordially invited to attend:\n\n*${title}*\n\nDate: ${displayDate}\nLocation: ${displayLocation}\n\nWe look forward to welcoming you.\n\nSincerely,\n${displayHosts}`;
      card = `We have the honor to invite you to attend\n\n${title}\n\nheld at ${displayLocation}\non ${displayDate}.`;
    }

    return NextResponse.json({
      whatsapp_message: whatsapp,
      card_text: card,
      subject_line: subject,
      isLiveModel: false,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Invitation generation failed';
    console.error('Invitation route error:', message);
    return NextResponse.json({ error: 'Failed to generate invitation' }, { status: 500 });
  }
}
