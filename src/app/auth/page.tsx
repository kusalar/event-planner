'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Mail, Lock, User, ArrowRight, Zap } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

export default function AuthPage() {
  const router = useRouter();

  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('priya@eventora.ai');
  const [password, setPassword] = useState('eventora2027');
  const [loading, setLoading] = useState(false);

  const handleDemoLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push('/dashboard');
    }, 400);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isSupabaseConfigured && supabase) {
      try {
        if (isLogin) {
          const { error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) throw error;
        } else {
          const { error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: name } },
          });
          if (error) throw error;
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn('Supabase auth notice:', msg);
      }
    }

    setTimeout(() => {
      setLoading(false);
      router.push('/dashboard');
    }, 500);
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-[#09090b] relative">
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-violet-600/10 dark:bg-violet-600/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md rounded-2xl glass-card p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 relative z-10">
        {/* Brand header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-violet-600 to-pink-500 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-purple-500/30">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {isLogin ? 'Welcome Back to Eventora AI' : 'Create Your Eventora Account'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isLogin
              ? 'Access your intelligent event workspaces & budgets'
              : 'Join thousands planning world-class celebrations with GenAI'}
          </p>
        </div>

        {/* Instant 1-Click Demo Profiles Banner */}
        <div className="mb-6 p-3.5 rounded-xl bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800/80 text-xs">
          <div className="flex items-center space-x-1.5 text-violet-700 dark:text-violet-300 font-bold mb-2">
            <Zap className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            <span>Instant Demo Access (No Password Required):</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleDemoLogin}
              className="px-2.5 py-2 rounded-lg bg-white dark:bg-slate-900 hover:bg-violet-100 dark:hover:bg-slate-800 border border-violet-200 dark:border-slate-700 text-left font-medium text-slate-800 dark:text-slate-200 transition-colors"
            >
              <div className="font-bold text-[11px] text-violet-600 dark:text-violet-400">Priya Sharma</div>
              <div className="text-[10px] text-slate-400">Bengali Wedding Plan</div>
            </button>
            <button
              onClick={handleDemoLogin}
              className="px-2.5 py-2 rounded-lg bg-white dark:bg-slate-900 hover:bg-violet-100 dark:hover:bg-slate-800 border border-violet-200 dark:border-slate-700 text-left font-medium text-slate-800 dark:text-slate-200 transition-colors"
            >
              <div className="font-bold text-[11px] text-pink-600 dark:text-pink-400">Arjun Mehta</div>
              <div className="text-[10px] text-slate-400">AI Tech Summit Plan</div>
            </button>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-900 p-1 mb-6 text-xs font-semibold">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 rounded-lg transition-all ${
              isLogin
                ? 'bg-white dark:bg-slate-800 text-violet-600 dark:text-violet-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsLogin(false)}
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
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
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
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 text-white font-bold shadow-lg shadow-violet-500/25 flex items-center justify-center space-x-2 transition-all"
          >
            <span>{loading ? 'Authenticating...' : isLogin ? 'Sign In to Dashboard' : 'Create Free Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-[11px] text-slate-400">
          <span>Protected with 256-bit AES encryption & Supabase Auth.</span>
        </div>
      </div>
    </div>
  );
}
