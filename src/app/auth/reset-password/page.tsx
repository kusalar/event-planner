'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles, Lock, ArrowRight, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [sessionReady, setSessionReady] = useState(false);

  // Supabase appends the access_token as a URL fragment (#access_token=...).
  // The Supabase client SDK picks this up automatically via detectSessionInUrl.
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    // Give the Supabase client a moment to parse the fragment and set the session
    const timer = setTimeout(async () => {
      const { data } = await supabase!.auth.getSession();
      if (data?.session) {
        setSessionReady(true);
      } else {
        setErrorMessage(
          'This password reset link is invalid or has expired. Please request a new one.'
        );
      }
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter them.');
      return;
    }
    if (!isSupabaseConfigured || !supabase) {
      setErrorMessage('Authentication service is not configured.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setErrorMessage(error.message);
        return;
      }
      setSuccessMessage('Your password has been updated successfully! Redirecting to Sign In…');
      await supabase.auth.signOut();
      setTimeout(() => router.push('/auth'), 2500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  // Suppress unused warning — searchParams is required for Suspense boundary
  void searchParams;

  return (
    <div className="w-full max-w-md rounded-2xl glass-card p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 relative z-10">
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-violet-600 to-pink-500 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-purple-500/30">
          <Sparkles className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Set New Password
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Choose a strong password for your Eventora AI account
        </p>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start space-x-2 text-rose-700 dark:text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium leading-relaxed">
            {errorMessage}
            {!sessionReady && (
              <button
                type="button"
                onClick={() => router.push('/auth')}
                className="block mt-2 text-violet-700 dark:text-violet-400 font-bold underline"
              >
                Request a new reset link →
              </button>
            )}
          </div>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-start space-x-2 text-emerald-700 dark:text-emerald-300 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium leading-relaxed">{successMessage}</div>
        </div>
      )}

      {sessionReady && !successMessage && (
        <form onSubmit={handleReset} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              New Password (Minimum 6 characters)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 text-white font-bold shadow-lg shadow-violet-500/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
          >
            <span>{loading ? 'Updating Password…' : 'Update Password'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}

      <div className="mt-6 text-center text-[11px] text-slate-400 flex items-center justify-center space-x-1">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span>Protected with Supabase Authentication &amp; end-to-end encryption.</span>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-[#09090b] relative">
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-violet-600/10 dark:bg-violet-600/20 blur-[120px] rounded-full pointer-events-none" />
      <Suspense
        fallback={
          <div className="w-full max-w-md rounded-2xl glass-card p-8 text-center text-xs text-slate-400">
            Loading password reset…
          </div>
        }
      >
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}
