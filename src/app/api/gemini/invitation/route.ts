import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const { title, eventType, date, location, hostNames, tone, customApiKey } = await req.json();

    const ai = getGeminiClient(customApiKey);

    if (ai) {
      try {
        const prompt = `Write a beautifully worded event invitation for:
Event: ${title} (${eventType})
Date: ${date}
Location: ${location}
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
        const parsed = JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
        return NextResponse.json({ ...parsed, isLiveModel: true });
      } catch (e: unknown) {
        console.warn('Gemini invitation generation failed, falling back:', e);
      }
    }

    // Curated high quality invitation generator
    let whatsapp = '';
    let card = '';
    let subject = '';

    if (tone === 'Traditional' || tone === 'Royal') {
      subject = `Wedding Invitation: Celebrating ${title}`;
      whatsapp = `✨ *|| শ্রী শ্রী প্রজাপতয়ে নমঃ ||* ✨\n\nWith the divine blessings of the Almighty and our elders, we cordially invite you and your family to celebrate the auspicious union of:\n\n👑 *${title}*\n\n📅 *Date:* ${date}\n📍 *Venue:* ${location}\n\nJoin us for an evening of joyous rituals, traditional music, and an authentic banquet feast.\n\nWarm regards,\n*${hostNames || 'The Host Family'}*\n\n_Please RSVP by 2 weeks prior._`;
      card = `Together with their families\n\nCordially request the pleasure of your company to celebrate\n\n${title}\n\non ${date}\nat ${location}\n\nDinner & Celebrations to follow.`;
    } else if (tone === 'Quirky' || tone === 'Modern') {
      subject = `You're Invited! Join us for ${title} 🎉`;
      whatsapp = `🥂 *Save the Date!* 🥂\n\nGood food, great music, and endless memories — we’re celebrating *${title}* and it wouldn't be complete without you!\n\n🗓️ *When:* ${date}\n📍 *Where:* ${location}\n\nPut on your dancing shoes and get ready for a memorable time! 💃🕺\n\nCheers,\n${hostNames || 'The Hosts'}`;
      card = `Join us as we celebrate\n\n${title}\n\n${date} • ${location}\n\nBring your smiles and best celebration vibes!`;
    } else {
      subject = `Official Invitation: ${title}`;
      whatsapp = `Dear Guests,\n\nYou are cordially invited to attend:\n\n*${title}*\n\nDate: ${date}\nLocation: ${location}\n\nWe look forward to welcoming you.\n\nSincerely,\n${hostNames || 'Organizing Committee'}`;
      card = `We have the honor to invite you to attend\n\n${title}\n\nheld at ${location}\non ${date}.`;
    }

    return NextResponse.json({
      whatsapp_message: whatsapp,
      card_text: card,
      subject_line: subject,
      isLiveModel: false,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to generate invitation';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
