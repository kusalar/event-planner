'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Sparkles, ShieldAlert, ArrowRight } from 'lucide-react';
import Link from 'next/link';

// Routes that require authentication or explicit demo mode
const PROTECTED_PREFIXES = [
  '/dashboard',
  '/budget',
  '/timeline',
  '/vendors',
  '/guests',
  '/ideas',
  '/chat',
  '/create',
  '/plan',
  '/settings',
];

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isDemoMode, isLoading, exitDemoMode } = useAuth();

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  useEffect(() => {
    if (!isLoading && isProtected && !isAuthenticated && !isDemoMode) {
      router.replace(`/auth?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, isProtected, isAuthenticated, isDemoMode, pathname, router]);

  if (isLoading && isProtected) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-[60vh] text-center">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-pink-500 text-white flex items-center justify-center shadow-xl shadow-purple-500/25 animate-pulse mb-4">
          <Sparkles className="w-6 h-6 animate-spin" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Verifying Secure Session</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Authenticating with 256-bit Supabase security...
        </p>
      </div>
    );
  }

  if (isProtected && !isAuthenticated && !isDemoMode) {
    return null; // Will redirect via useEffect
  }

  return (
    <>
      {/* Demo Sandbox Alert Ribbon */}
      {isDemoMode && isProtected && (
        <div className="bg-gradient-to-r from-amber-500/15 via-violet-500/15 to-pink-500/15 border-b border-amber-500/30 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 text-slate-800 dark:text-slate-200">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold text-[10px] uppercase tracking-wider flex items-center space-x-1">
              <ShieldAlert className="w-3 h-3" />
              <span>Demo Sandbox</span>
            </span>
            <span className="text-slate-700 dark:text-slate-300 text-xs font-medium">
              You are exploring curated sample events in isolated demo mode. Real user data is protected.
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              href="/auth"
              onClick={exitDemoMode}
              className="text-xs font-bold text-violet-700 dark:text-violet-300 hover:underline flex items-center space-x-1"
            >
              <span>Sign In with Real Account</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}

      {children}
    </>
  );
};

