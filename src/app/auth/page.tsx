'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Sparkles, Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle2,
  ShieldCheck, PlayCircle, KeyRound, Clock, TriangleAlert,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Toast } from '@/components/Toast';

// ── How many seconds the user must wait before submitting another signup ──────
const SIGNUP_COOLDOWN_SECONDS = 60;

// ── View modes ────────────────────────────────────────────────────────────────
type ViewMode = 'signin' | 'signup' | 'forgot';

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/dashboard';
  const signedOutParam = searchParams.get('signedOut');

  const { signIn, signUp, forgotPassword, enterDemoMode } = useAuth();

  // ── Form state ─────────────────────────────────────────────────────────────
  const [view, setView] = useState<ViewMode>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showSwitchToSignIn, setShowSwitchToSignIn] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(() =>
    signedOutParam === 'true' ? 'You have successfully signed out.' : null
  );

  // ── Client-side signup cooldown ────────────────────────────────────────────
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const cooldownTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  function startCooldown() {
    setCooldownRemaining(SIGNUP_COOLDOWN_SECONDS);
    if (cooldownTimer.current) clearInterval(cooldownTimer.current);
    cooldownTimer.current = setInterval(() => {
      setCooldownRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownTimer.current!);
          cooldownTimer.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (cooldownTimer.current) clearInterval(cooldownTimer.current);
    };
  }, []);

  // Reset errors when switching view
  function switchView(next: ViewMode) {
    setView(next);
    setErrorMessage(null);
    setSuccessMessage(null);
    setShowSwitchToSignIn(false);
  }

  // ── Sign In / Sign Up handler ──────────────────────────────────────────────
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setShowSwitchToSignIn(false);
    setLoading(true);

    try {
      if (view === 'signin') {
        // ── Sign In — only calls signInWithPassword ─────────────────────────
        const result = await signIn(email, password);
        if (!result.success) {
          setErrorMessage(result.error || 'Authentication failed. Please verify your credentials.');
          setLoading(false);
          return;
        }
        router.push(redirectPath);

      } else {
        // ── Sign Up — only calls signUp ─────────────────────────────────────
        const result = await signUp(email, password, name);

        if (!result.success) {
          setErrorMessage(result.error || 'Registration failed. Please try again.');
          // If it is a rate-limit error, offer the "switch to Sign In" CTA
          if (result.error?.includes('Too many registration')) {
            setShowSwitchToSignIn(true);
            startCooldown();
          }
          setLoading(false);
          return;
        }

        if (result.requiresEmailConfirmation) {
          if (result.possibleDuplicate) {
            // Supabase returned identities:[] — email may already be registered.
            // We don't confirm the email exists (avoids enumeration), but we
            // suggest both checking inbox AND trying Sign In.
            setSuccessMessage(
              `We've sent a link to ${email}. If an account already exists for this address, please switch to Sign In instead.`
            );
            setShowSwitchToSignIn(true);
          } else {
            setSuccessMessage(
              `Almost there! A verification email has been sent to ${email}. ` +
              `Please check your inbox and click the confirmation link before signing in.`
            );
          }
          // After any successful signUp call, apply a cooldown to prevent
          // accidental repeated verification email requests
          startCooldown();
          setView('signin');
          setPassword('');
        } else {
          // Auto-confirmed (email confirmation disabled in Supabase dashboard)
          router.push(redirectPath);
        }
        setLoading(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setErrorMessage(msg);
      setLoading(false);
    }
  };

  // ── Forgot Password handler ────────────────────────────────────────────────
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const result = await forgotPassword(email);
      if (!result.success) {
        setErrorMessage(result.error || 'Failed to send password reset email. Please try again.');
      } else {
        // Always show a generic message regardless of whether the email exists
        setSuccessMessage(
          `If an account exists for ${email}, you will receive a password reset link shortly. ` +
          `Please also check your spam folder.`
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Demo Mode handler ──────────────────────────────────────────────────────
  const handleLaunchDemo = () => {
    setLoading(true);
    enterDemoMode();
    setTimeout(() => {
      setLoading(false);
      router.push('/dashboard');
    }, 200);
  };

  // ── Derived state ──────────────────────────────────────────────────────────
  const isSignupCooldownActive = view === 'signup' && cooldownRemaining > 0;
  const submitDisabled = loading || isSignupCooldownActive;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-md rounded-2xl glass-card p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 relative z-10">

      {/* Brand header */}
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-violet-600 to-pink-500 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-purple-500/30">
          <Sparkles className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          {view === 'signin' && 'Sign In to Eventora AI'}
          {view === 'signup' && 'Create Your Account'}
          {view === 'forgot' && 'Reset Your Password'}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {view === 'signin' && 'Access your private event plans, budgets, and AI director'}
          {view === 'signup' && 'Join Eventora AI to plan extraordinary events with GenAI'}
          {view === 'forgot' && "Enter your email and we'll send you a reset link"}
        </p>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start space-x-2 text-rose-700 dark:text-rose-300 text-xs animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium leading-relaxed">
            {errorMessage}
            {showSwitchToSignIn && (
              <button
                type="button"
                onClick={() => switchView('signin')}
                className="block mt-2 text-violet-700 dark:text-violet-400 font-bold underline underline-offset-2 hover:no-underline"
              >
                Switch to Sign In →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Success Banner */}
      {successMessage && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-start space-x-2 text-emerald-700 dark:text-emerald-300 text-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium leading-relaxed">
            {successMessage}
            {showSwitchToSignIn && (
              <button
                type="button"
                onClick={() => switchView('signin')}
                className="block mt-2 text-violet-700 dark:text-violet-400 font-bold underline underline-offset-2 hover:no-underline"
              >
                Go to Sign In →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Cooldown Notice (signup only) */}
      {isSignupCooldownActive && (
        <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-center space-x-2 text-amber-700 dark:text-amber-300 text-xs">
          <Clock className="w-4 h-4 shrink-0" />
          <span className="font-medium">
            Please wait <span className="font-black">{cooldownRemaining}s</span> before submitting another registration request.
          </span>
        </div>
      )}

      {/* Tab switcher — Sign In / Create Account (not shown for Forgot Password) */}
      {view !== 'forgot' && (
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-900 p-1 mb-6 text-xs font-semibold">
          <button
            type="button"
            onClick={() => switchView('signin')}
            className={`flex-1 py-2 rounded-lg transition-all ${
              view === 'signin'
                ? 'bg-white dark:bg-slate-800 text-violet-600 dark:text-violet-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => switchView('signup')}
            className={`flex-1 py-2 rounded-lg transition-all ${
              view === 'signup'
                ? 'bg-white dark:bg-slate-800 text-violet-600 dark:text-violet-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>
      )}

      {/* ── SIGN IN FORM ──────────────────────────────────────────────────── */}
      {view !== 'forgot' && (
        <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs">

          {/* Full Name — only shown in signup */}
          {view === 'signup' && (
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Sreya Sengupta"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white outline-none"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Password{view === 'signup' ? ' (Minimum 6 characters)' : ''}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                minLength={view === 'signup' ? 6 : 1}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white outline-none"
              />
            </div>
          </div>

          {/* Forgot Password link — Sign In only */}
          {view === 'signin' && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => switchView('forgot')}
                className="text-[11px] text-violet-600 dark:text-violet-400 hover:underline font-semibold"
              >
                Forgot password?
              </button>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitDisabled}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 text-white font-bold shadow-lg shadow-violet-500/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSignupCooldownActive ? (
              <>
                <Clock className="w-4 h-4" />
                <span>Please wait {cooldownRemaining}s</span>
              </>
            ) : (
              <>
                <span>
                  {loading
                    ? view === 'signin' ? 'Verifying Credentials…' : 'Creating Account…'
                    : view === 'signin' ? 'Sign In with Supabase' : 'Create Verified Account'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Duplicate-account hint — signup only */}
          {view === 'signup' && !successMessage && (
            <p className="text-center text-[11px] text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => switchView('signin')}
                className="text-violet-600 dark:text-violet-400 font-semibold hover:underline"
              >
                Sign In
              </button>
            </p>
          )}
        </form>
      )}

      {/* ── FORGOT PASSWORD FORM ──────────────────────────────────────────── */}
      {view === 'forgot' && (
        <form onSubmit={handleForgotPassword} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 text-white font-bold shadow-lg shadow-violet-500/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <span>Sending Reset Link…</span>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Send Password Reset Email</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => switchView('signin')}
            className="w-full py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs transition-colors"
          >
            ← Back to Sign In
          </button>
        </form>
      )}

      {/* Email Verification Info Box — shown in signup view */}
      {view === 'signup' && (
        <div className="mt-4 p-3 rounded-xl bg-violet-50/60 dark:bg-violet-950/20 border border-violet-200/70 dark:border-violet-900/40 text-[11px] text-slate-600 dark:text-slate-400 flex items-start space-x-2">
          <TriangleAlert className="w-3.5 h-3.5 text-violet-500 shrink-0 mt-0.5" />
          <span>
            A confirmation email is required to activate your account. Please check your inbox
            (including spam) after registering.
          </span>
        </div>
      )}

      {/* Demo Sandbox */}
      <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 text-xs">
        <div className="p-3.5 rounded-xl bg-violet-50/70 dark:bg-violet-950/30 border border-violet-200/80 dark:border-violet-900/50">
          <div className="flex items-center space-x-1.5 text-violet-700 dark:text-violet-300 font-bold mb-1">
            <PlayCircle className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            <span>Interactive Demo Sandbox</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
            Want to test-drive features before creating an account? Explore our curated sample
            wedding and conference plans in an isolated sandbox.
          </p>
          <button
            type="button"
            onClick={handleLaunchDemo}
            disabled={loading}
            className="w-full py-2 rounded-lg bg-white dark:bg-slate-900 hover:bg-violet-100 dark:hover:bg-slate-800 border border-violet-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors shadow-sm disabled:opacity-50"
          >
            <span>Launch Demo Mode (Sample Data)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-4 text-center text-[11px] text-slate-400 flex items-center justify-center space-x-1">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span>Protected with Supabase Authentication &amp; PostgreSQL Row Level Security.</span>
      </div>

      <Toast
        message={toastMessage || ''}
        isVisible={Boolean(toastMessage)}
        onClose={() => setToastMessage(null)}
      />
    </div>
  );
}

export default function AuthPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-[#09090b] relative">
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-violet-600/10 dark:bg-violet-600/20 blur-[120px] rounded-full pointer-events-none" />
      <Suspense
        fallback={
          <div className="w-full max-w-md rounded-2xl glass-card p-8 text-center text-xs text-slate-400">
            Loading authentication interface...
          </div>
        }
      >
        <AuthContent />
      </Suspense>
    </div>
  );
}
