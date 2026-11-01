import type { Metadata } from 'next';
import { headers } from 'next/headers';
import React, { Suspense } from 'react';
import { Plus_Jakarta_Sans, Playfair_Display } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { EventProvider } from '@/context/EventContext';
import { AuthGuard } from '@/components/AuthGuard';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const sansFont = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const serifFont = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://event-planner-liard-beta.vercel.app'),
  title: 'Eventora AI — GenAI-Powered Smart Event Planning Assistant',
  description:
    'Plan weddings, corporate summits, and parties with GenAI. Features smart budget allocation, milestone timelines, vendor tracking, and 24/7 AI assistance.',
  keywords: [
    'AI event planner',
    'smart event budget',
    'wedding timeline manager',
    'vendor tracker',
    'RSVP management',
    'GenAI event orchestrator',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Eventora AI — GenAI-Powered Smart Event Planning Assistant',
    description:
      'Plan weddings, corporate summits, and parties with GenAI. Features smart budget allocation, milestone timelines, vendor tracking, and 24/7 AI assistance.',
    url: 'https://event-planner-liard-beta.vercel.app',
    siteName: 'Eventora AI',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        type: 'image/jpeg',
        alt: 'Eventora AI — GenAI-Powered Smart Event Planning Assistant',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Eventora AI — GenAI-Powered Smart Event Planning Assistant',
    description:
      'Plan weddings, corporate summits, and parties with GenAI. Features smart budget allocation, milestone timelines, vendor tracking, and 24/7 AI assistance.',
    images: ['/og-image.jpg'],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Eventora AI',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description:
    'Plan weddings, corporate summits, and parties with GenAI. Features smart budget allocation, milestone timelines, vendor tracking, and 24/7 AI assistance.',
  url: 'https://event-planner-liard-beta.vercel.app',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
};

async function NonceThemeScript() {
  const headersList = await headers();
  const nonce = headersList.get('x-nonce') || undefined;

  return (
    <>
      {/* Synchronous inline script prevents flash of incorrect theme before first paint */}
      <script
        nonce={nonce}
        dangerouslySetInnerHTML={{
          __html: `(function(){try{var theme="dark";for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(k&&k.indexOf("eventora_")===0){try{var s=JSON.parse(localStorage.getItem(k)||"{}");if(s&&s.theme){theme=s.theme;break;}}catch(e){}}}if(theme==="light"){document.documentElement.classList.remove("dark");}else{document.documentElement.classList.add("dark");}}catch(e){}})();`,
        }}
      />
      {/* Structured Data (JSON-LD) for SoftwareApplication */}
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${sansFont.variable} ${serifFont.variable}`} suppressHydrationWarning>
      <head>
        <Suspense fallback={null}>
          <NonceThemeScript />
        </Suspense>
      </head>
      <body className="min-h-screen flex flex-col antialiased selection:bg-violet-500 selection:text-white font-sans">
        {/* Accessible Skip to Content Link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-violet-600 focus:text-white focus:rounded-xl focus:shadow-xl focus:font-bold focus:outline-none focus:ring-2 focus:ring-white"
        >
          Skip to main content
        </a>
        <AuthProvider>
          <EventProvider>
            <Navbar />
            <AuthGuard>
              <main id="main-content" tabIndex={-1} className="flex-1 flex flex-col outline-none">
                {children}
              </main>
            </AuthGuard>
            <Footer />
          </EventProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
