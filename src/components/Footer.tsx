'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 text-slate-600 dark:text-slate-400 text-xs py-8 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand info */}
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-violet-600 to-pink-500 flex items-center justify-center text-white">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-slate-800 dark:text-slate-200">Eventora AI</span>
          <span className="text-slate-400">|</span>
          <span>GenAI-Powered Smart Event Planning Operating System</span>
        </div>

        {/* Tech tags */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-[11px]">
          <span className="px-2 py-0.5 rounded-full bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
            Next.js 16 + React 19
          </span>
          <span className="px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 font-medium">
            Google Gemini API
          </span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-medium">
            Supabase DB
          </span>
          <span className="px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 font-medium">
            Recharts & Tailwind
          </span>
        </div>

        {/* Copyright */}
        <div className="flex items-center space-x-4 text-slate-500 text-[11px]">
          <span>© 2027 Eventora AI. All rights reserved.</span>
          <Link href="/settings" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
            Configure API
          </Link>
        </div>
      </div>
    </footer>
  );
};

