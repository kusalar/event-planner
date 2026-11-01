'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error securely for diagnostics without exposing to client UI
    console.error('App Router Boundary Error:', error);
  }, [error]);

  return (
    <div className="flex-1 min-h-[60vh] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-md w-full glass-card p-6 sm:p-8 rounded-3xl border border-rose-500/30 text-center shadow-2xl bg-white/90 dark:bg-[#12121e]/90 backdrop-blur-xl">
        <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center mb-5 shadow-lg shadow-rose-500/20">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2">
          Something went wrong
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
          An unexpected error occurred while loading this section. Your event blueprints and stored data remain safely preserved.
        </p>

        {error.digest && (
          <div className="mb-6 font-mono text-[10px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-900/60 py-1 px-2.5 rounded-lg inline-block">
            Reference ID: {error.digest}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-violet-500/25 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>

          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center justify-center space-x-2 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

