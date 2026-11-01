import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  // Generate a cryptographically secure, unique per-request nonce
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const isDev = process.env.NODE_ENV === 'development';

  // Construct strict Content Security Policy
  // - default-src 'none': strict baseline; all resource types explicitly declared
  // - script-src: 'self' for Next.js static chunks + unsafe-inline for framework hydration
  // - style-src: self + unsafe-inline; style-src-attr 'unsafe-inline' for element style attributes (Recharts/Framer Motion)
  // - connect-src: Supabase REST/Realtime, Gemini API, Vercel Live
  // - img-src: Unsplash, Supabase storage, Google & GitHub profile avatars, blob & data URIs
  // - font-src: self + Google fonts gstatic data URIs
  // - frame-ancestors 'none': anti-clickjacking
  // - object-src 'none': block legacy plugins (Flash, Java)
  // - base-uri & form-action 'self': form submission and base tag restriction
  // - upgrade-insecure-requests: automatic HTTPS upgrading
  const cspHeader = `
    default-src 'none';
    script-src 'self' 'unsafe-inline' https://vercel.live${isDev ? " 'unsafe-eval'" : ''};
    style-src 'self' 'unsafe-inline';
    style-src-attr 'unsafe-inline';
    img-src 'self' data: blob: https://images.unsplash.com https://*.supabase.co https://*.googleusercontent.com https://*.githubusercontent.com;
    font-src 'self' data: https://fonts.gstatic.com;
    connect-src 'self' https://*.supabase.co wss://*.supabase.co https://generativelanguage.googleapis.com https://vercel.live;
    manifest-src 'self';
    media-src 'self' blob: data:;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `;

  // Clean redundant whitespace and newlines
  const contentSecurityPolicyHeaderValue = cspHeader
    .replace(/\s{2,}/g, ' ')
    .trim();

  // Forward nonce and CSP to Next.js internal rendering pipeline
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', contentSecurityPolicyHeaderValue);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Attach Content-Security-Policy to response headers
  response.headers.set('Content-Security-Policy', contentSecurityPolicyHeaderValue);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api routes (handled separately)
     * - _next/static (static chunks)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt, manifest.json
     */
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.json).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};

