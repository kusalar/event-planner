'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowUp,
  Mail,
  Shield,
  FileText,
  HelpCircle,
  Heart,
  ChevronRight,
  X,
  ExternalLink,
} from 'lucide-react';

type ModalType = 'contact' | 'help' | 'privacy' | 'terms' | null;

export const Footer: React.FC = () => {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const quickLinks = [
    { name: 'Home', href: '/' },
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Create Event', href: '/create' },
    { name: 'AI Assistant', href: '/chat' },
    { name: 'Budget Planner', href: '/budget' },
  ];

  const features = [
    { name: 'AI Event Planning', href: '/create' },
    { name: 'Smart Budget Management', href: '/budget' },
    { name: 'Vendor Management', href: '/vendors' },
    { name: 'Event Timeline', href: '/timeline' },
    { name: 'Guest & RSVP Management', href: '/guests' },
  ];

  return (
    <>
      <footer className="relative border-t border-slate-200/90 dark:border-slate-800/80 bg-white/70 dark:bg-[#0c0c14]/90 backdrop-blur-xl text-slate-600 dark:text-slate-400 text-xs mt-auto z-20">
        {/* Subtle decorative top glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-5xl h-[1px] bg-gradient-to-r from-transparent via-violet-500/40 dark:via-violet-500/30 to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-12">
            {/* Column 1: Brand & Description (2 cols on lg) */}
            <div className="lg:col-span-2 space-y-4">
              <Link href="/" className="inline-flex items-center space-x-2.5 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:scale-105 transition-transform duration-200">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-xl tracking-tight bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-500 dark:from-violet-400 dark:via-fuchsia-400 dark:to-pink-400 bg-clip-text text-transparent">
                    EVENTORA<span className="text-violet-600 dark:text-violet-300 font-bold text-xs ml-1 px-1.5 py-0.5 rounded bg-violet-100 dark:bg-violet-950/80">AI</span>
                  </span>
                  <span className="text-[10px] tracking-wider uppercase text-slate-500 dark:text-slate-400 font-semibold -mt-1">
                    Smart Event Planner
                  </span>
                </div>
              </Link>

              <p className="text-sm font-semibold text-slate-900 dark:text-slate-200 italic">
                &ldquo;Every celebration deserves a perfect plan.&rdquo;
              </p>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-md font-normal">
                From dream weddings to unforgettable birthdays and community celebrations, Eventora AI helps you plan smarter, manage budgets, coordinate vendors, and create moments that last forever.
              </p>

              {/* Status Indicator */}
              <div className="pt-2 flex items-center space-x-2 text-[11px] text-slate-500 dark:text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Google Gemini 2.5 & Supabase RLS Active</span>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h4 className="font-black text-xs uppercase tracking-wider text-slate-900 dark:text-white mb-4">
                Quick Links
              </h4>
              <ul className="space-y-2.5">
                {quickLinks.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 flex items-center space-x-1.5 transition-colors group"
                    >
                      <ChevronRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Features */}
            <div>
              <h4 className="font-black text-xs uppercase tracking-wider text-slate-900 dark:text-white mb-4">
                Features
              </h4>
              <ul className="space-y-2.5">
                {features.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 flex items-center space-x-1.5 transition-colors group"
                    >
                      <ChevronRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Support & Connect */}
            <div>
              <h4 className="font-black text-xs uppercase tracking-wider text-slate-900 dark:text-white mb-4">
                Support & Legal
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <button
                    onClick={() => setActiveModal('contact')}
                    className="text-left text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 flex items-center space-x-1.5 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>Contact Concierge</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveModal('help')}
                    className="text-left text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 flex items-center space-x-1.5 transition-colors"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                    <span>Help Center & FAQ</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveModal('privacy')}
                    className="text-left text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 flex items-center space-x-1.5 transition-colors"
                  >
                    <Shield className="w-3.5 h-3.5 text-slate-400" />
                    <span>Privacy Policy</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveModal('terms')}
                    className="text-left text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 flex items-center space-x-1.5 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>Terms of Service</span>
                  </button>
                </li>
              </ul>

              {/* Social Links (Configured Repository) */}
              <div className="mt-6 pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-2">
                  Source Code & Community
                </span>
                <div className="flex items-center space-x-2.5">
                  <a
                    href="https://github.com/kusalar/event-planner"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-violet-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-violet-600 transition-colors flex items-center space-x-1.5 text-xs font-semibold shadow-sm"
                    title="View GitHub Repository"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                    <span>GitHub</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar Section */}
          <div className="pt-8 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex flex-col sm:flex-row items-center sm:space-x-3 text-center sm:text-left space-y-1 sm:space-y-0">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                © 2026 Eventora AI. All rights reserved.
              </span>
              <span className="hidden sm:inline text-slate-400">•</span>
              <span className="flex items-center space-x-1 text-slate-600 dark:text-slate-400">
                <span>Made with</span>
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                <span>for life&apos;s special moments.</span>
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-[11px] font-medium italic text-slate-600 dark:text-slate-400">
                &ldquo;Powered by AI. Designed for celebrations.&rdquo;
              </span>

              {/* Back to top button */}
              <button
                onClick={scrollToTop}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-violet-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-violet-600 transition-all flex items-center space-x-1 text-xs font-bold shadow-sm"
                title="Scroll back to top"
              >
                <ArrowUp className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Top</span>
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Interactive Support Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl glass-card p-6 sm:p-7 shadow-2xl relative border border-slate-200 dark:border-slate-800 text-left max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {activeModal === 'contact' && (
              <div>
                <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-3">
                  <Mail className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Contact Eventora AI Concierge</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 mb-4">
                  Need personalized advice or custom enterprise event assistance? Our AI director and specialist team are here to help.
                </p>
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-slate-900 dark:text-white block">Email Support Desk</span>
                    <a href="mailto:support@eventora.ai" className="text-violet-600 dark:text-violet-400 font-medium hover:underline">
                      support@eventora.ai
                    </a>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Average turnaround time: Under 2 hours</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-slate-900 dark:text-white block">24/7 In-App AI Assistant</span>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                      Chat directly with Eventora AI on your active budget, menu recommendations, or vendor checklists.
                    </p>
                    <Link
                      href="/chat"
                      onClick={() => setActiveModal(null)}
                      className="inline-block mt-2 px-3 py-1.5 rounded-lg bg-violet-600 text-white font-bold text-xs"
                    >
                      Open AI Assistant
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {activeModal === 'help' && (
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Help Center & Planning FAQ</h3>
                <div className="mt-4 space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <strong className="text-slate-900 dark:text-white block mb-1">How does the AI Event Generator work?</strong>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                      Describe your event in plain language (e.g. &ldquo;Bengali wedding in Kolkata for 300 guests with ₹8 lakh budget&rdquo;). Google Gemini parses your constraints into categorized budgets, milestone tasks, and catering blueprints.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <strong className="text-slate-900 dark:text-white block mb-1">How is my financial & vendor data stored?</strong>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                      Your private events, actual expenses, and vendor quotes are encrypted using Supabase PostgreSQL with strict Row Level Security (RLS) guaranteeing total account isolation.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <strong className="text-slate-900 dark:text-white block mb-1">Can I export my event plan?</strong>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                      Yes. Navigate to Settings or the Plan overview page to export your complete event blueprint as a JSON backup or printable summary.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeModal === 'privacy' && (
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Privacy Policy</h3>
                <p className="text-[11px] text-slate-400 mt-1 mb-3">Effective Date: October 2026</p>
                <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  <p>
                    <strong>1. Zero Data Training:</strong> Your private event budgets, guest lists, and vendor contact records are never used to train public generative AI foundation models.
                  </p>
                  <p>
                    <strong>2. Row Level Security:</strong> Multi-tenant isolation is enforced via Supabase PostgreSQL RLS policies where <code>auth.uid() = user_id</code>. No user can view or alter another user&apos;s data.
                  </p>
                  <p>
                    <strong>3. Local & Server Security:</strong> Session tokens and encryption keys are strictly handled via secure HTTP headers and authenticated browser storage.
                  </p>
                </div>
              </div>
            )}

            {activeModal === 'terms' && (
              <div>
                <div className="w-10 h-10 rounded-xl bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 flex items-center justify-center mb-3">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Terms of Service</h3>
                <p className="text-[11px] text-slate-400 mt-1 mb-3">Last Updated: October 2026</p>
                <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  <p>
                    <strong>1. Event Blueprint Estimates:</strong> Event budgets, vendor quotes, and timeline suggestions generated by Eventora AI are advisory projections designed to assist human decision-making. Final contracts remain between users and their respective vendors.
                  </p>
                  <p>
                    <strong>2. User Ownership:</strong> You retain complete intellectual property and ownership over all event concepts, custom catering menus, and invitations created through our platform.
                  </p>
                  <p>
                    <strong>3. Acceptable Use:</strong> Users agree not to misuse AI prompt endpoints or attempt unauthorized access across tenant boundaries.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-right">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-md transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
