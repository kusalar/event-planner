'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles, Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle2, ShieldCheck, PlayCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Toast } from '@/components/Toast';

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/dashboard';
  const signedOutParam = searchParams.get('signedOut');

  const { signIn, signUp, enterDemoMode } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(() =>
    signedOutParam === 'true' ? 'You have successfully signed out.' : null
  );

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (isLogin) {
        const result = await signIn(email, password);
        if (!result.success) {
          setErrorMessage(result.error || 'Authentication failed. Please verify your credentials.');
          setLoading(false);
          return;
        }
        // Successfully authenticated with Supabase
        router.push(redirectPath);
      } else {
        const result = await signUp(email, password, name);
        if (!result.success) {
          setErrorMessage(result.error || 'Registration failed. Please try again.');
          setLoading(false);
          return;
        }

        if (result.requiresEmailConfirmation) {
          setSuccessMessage(
            `Registration successful! A verification email has been sent to ${email}. Please check your inbox and confirm your email before signing in.`
          );
          setIsLogin(true);
          setPassword('');
          setLoading(false);
        } else {
          // Auto-confirmed, session established
          router.push(redirectPath);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setErrorMessage(msg);
      setLoading(false);
    }
  };

  const handleLaunchDemo = () => {
    setLoading(true);
    enterDemoMode();
    setTimeout(() => {
      setLoading(false);
      router.push('/dashboard');
    }, 200);
  };

  return (
    <div className="w-full max-w-md rounded-2xl glass-card p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 relative z-10">
      {/* Brand header */}
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-violet-600 to-pink-500 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-purple-500/30">
          <Sparkles className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          {isLogin ? 'Sign In to Eventora AI' : 'Create Your Account'}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {isLogin
            ? 'Access your private event plans, budgets, and AI director'
            : 'Join Eventora AI to plan extraordinary events with GenAI'}
        </p>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start space-x-2 text-rose-700 dark:text-rose-300 text-xs animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
        </div>
      )}

      {/* Success Alert */}
      {successMessage && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-start space-x-2 text-emerald-700 dark:text-emerald-300 text-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium leading-relaxed">{successMessage}</div>
        </div>
      )}

      {/* Tab switch */}
      <div className="flex rounded-xl bg-slate-100 dark:bg-slate-900 p-1 mb-6 text-xs font-semibold">
        <button
          type="button"
          onClick={() => {
            setIsLogin(true);
            setErrorMessage(null);
            setSuccessMessage(null);
          }}
          className={`flex-1 py-2 rounded-lg transition-all ${
            isLogin
              ? 'bg-white dark:bg-slate-800 text-violet-600 dark:text-violet-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setIsLogin(false);
            setErrorMessage(null);
            setSuccessMessage(null);
          }}
          className={`flex-1 py-2 rounded-lg transition-all ${
            !isLogin
              ? 'bg-white dark:bg-slate-800 text-violet-600 dark:text-violet-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Create Account
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs">
        {!isLogin && (
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
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

        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
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

        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Password {isLogin ? '' : '(Minimum 6 characters)'}
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="password"
              required
              minLength={isLogin ? 1 : 6}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 text-white font-bold shadow-lg shadow-violet-500/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
        >
          <span>
            {loading
              ? 'Verifying Credentials...'
              : isLogin
              ? 'Sign In with Supabase'
              : 'Create Verified Account'}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Distinct, Isolated Demo Sandbox Access */}
      <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 text-xs">
        <div className="p-3.5 rounded-xl bg-violet-50/70 dark:bg-violet-950/30 border border-violet-200/80 dark:border-violet-900/50">
          <div className="flex items-center space-x-1.5 text-violet-700 dark:text-violet-300 font-bold mb-1">
            <PlayCircle className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            <span>Interactive Demo Sandbox</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
            Want to test-drive features before creating an account? Explore our curated sample wedding and conference plans in an isolated sandbox.
          </p>
          <button
            type="button"
            onClick={handleLaunchDemo}
            disabled={loading}
            className="w-full py-2 rounded-lg bg-white dark:bg-slate-900 hover:bg-violet-100 dark:hover:bg-slate-800 border border-violet-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors shadow-sm"
          >
            <span>Launch Demo Mode (Sample Data)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-4 text-center text-[11px] text-slate-400 flex items-center justify-center space-x-1">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span>Protected with Supabase Authentication & PostgreSQL Row Level Security.</span>
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
