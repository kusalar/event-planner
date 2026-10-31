import type { Metadata } from 'next';
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
  title: 'Eventora AI — GenAI-Powered Smart Event Planning Assistant',
  description:
    'Plan weddings, birthdays, corporate summits, and cultural celebrations with intelligent budget management, milestone timelines, vendor tracking, and 24/7 GenAI assistance.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${sansFont.variable} ${serifFont.variable}`} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col antialiased selection:bg-violet-500 selection:text-white font-sans">
        <AuthProvider>
          <EventProvider>
            <Navbar />
            <AuthGuard>
              <main className="flex-1 flex flex-col">{children}</main>
            </AuthGuard>
            <Footer />
          </EventProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
