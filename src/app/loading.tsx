import React from 'react';
import { Sparkles } from 'lucide-react';

export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex-1 min-h-[50vh] flex flex-col items-center justify-center p-6 text-center"
    >
      <div className="relative mb-4 flex items-center justify-center">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
          <Sparkles className="w-6 h-6 text-white animate-spin" style={{ animationDuration: '3s' }} />
        </div>
      </div>

      <div className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1">
        Loading Eventora AI...
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
        Preparing smart event schedules and financial allocations
      </p>
      <span className="sr-only">Loading content...</span>
    </div>
  );
}

