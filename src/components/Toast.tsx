'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  type?: 'success' | 'error';
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  isVisible,
  onClose,
  type = 'success',
  duration = 4000,
}) => {
  useEffect(() => {
    if (!isVisible) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const isError = type === 'error';

  return (
    <div
      role={isError ? 'alert' : 'status'}
      aria-live={isError ? 'assertive' : 'polite'}
      aria-atomic="true"
      className={`fixed bottom-6 right-6 z-[120] max-w-sm rounded-2xl glass-card p-3.5 sm:p-4 shadow-2xl backdrop-blur-xl flex items-center space-x-3 animate-in slide-in-from-bottom-5 fade-in duration-200 border ${
        isError
          ? 'border-rose-500/50 bg-white/95 dark:bg-[#1a0f14]/95 text-rose-900 dark:text-rose-100'
          : 'border-emerald-500/40 bg-white/95 dark:bg-[#151522]/95 text-slate-900 dark:text-white'
      }`}
    >
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
          isError
            ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400'
            : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
        }`}
      >
        {isError ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
      </div>

      <div className="flex-1 text-xs font-semibold leading-relaxed">
        {message}
      </div>

      <button
        type="button"
        onClick={onClose}
        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
