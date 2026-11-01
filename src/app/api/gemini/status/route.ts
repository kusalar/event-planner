import { NextResponse } from 'next/server';

export async function GET() {
  const hasServerKey = Boolean(process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('placeholder'));
  return NextResponse.json(
    {
      hasServerKey,
      model: 'gemini-2.5-flash',
      status: hasServerKey ? 'ready' : 'demo_fallback',
    },
    {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  );
}
