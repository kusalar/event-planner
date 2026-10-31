'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEventContext } from '@/context/EventContext';
import { SignOutModal } from '@/components/SignOutModal';
import { Toast } from '@/components/Toast';
import { Settings, LogOut, ChevronDown, ShieldCheck, LogIn } from 'lucide-react';

export const UserMenu: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated, isDemoMode, signOut } = useAuth();
  const { userProfile } = useEventContext();

  const [isOpen, setIsOpen] = useState(false);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleConfirmSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      setIsSignOutModalOpen(false);
      setToastMessage('You have successfully signed out.');
      router.replace('/auth?signedOut=true');
    } catch (err) {
      console.error('Sign-out error:', err);
    } finally {
      setIsSigningOut(false);
    }
  };

  if (!isAuthenticated && !isDemoMode) {
    return (
      <Link
        href="/auth"
        className="px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-md shadow-violet-500/20 flex items-center space-x-1.5 transition-all"
      >
        <LogIn className="w-3.5 h-3.5" />
        <span>Sign In</span>
      </Link>
    );
  }

  if (isDemoMode && !isAuthenticated) {
    return (
      <div className="flex items-center space-x-2">
        <span className="hidden sm:inline px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
          Demo
        </span>
        <button
          onClick={() => setIsSignOutModalOpen(true)}
          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950/40 text-slate-700 dark:text-slate-300 hover:text-rose-600 text-xs font-bold transition-all flex items-center space-x-1.5"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit Demo</span>
        </button>

        <SignOutModal
          isOpen={isSignOutModalOpen}
          onClose={() => setIsSignOutModalOpen(false)}
          onConfirm={handleConfirmSignOut}
          isSigningOut={isSigningOut}
        />
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        aria-label="User Account Menu"
      >
        <div className="w-8 h-8 rounded-full ring-2 ring-violet-500/40 overflow-hidden bg-gradient-to-tr from-violet-600 to-pink-500 text-white font-bold text-xs flex items-center justify-center shadow-md">
          {userProfile.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={userProfile.avatar} alt={userProfile.name} className="w-full h-full object-cover" />
          ) : (
            <span>{(userProfile.name || user?.email || 'U').charAt(0).toUpperCase()}</span>
          )}
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden sm:inline" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl shadow-2xl glass-card py-2 z-50 animate-in fade-in slide-in-from-top-2 border border-slate-200 dark:border-slate-800">
          <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
            <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
              {userProfile.name || 'Verified User'}
            </div>
            <div className="text-[11px] text-slate-400 truncate">{user?.email}</div>
            <div className="mt-1 inline-flex items-center space-x-1 text-[10px] text-emerald-500 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
              <ShieldCheck className="w-3 h-3" />
              <span>Supabase Authenticated</span>
            </div>
          </div>

          <Link
            href="/settings"
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 text-xs flex items-center space-x-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Account Settings</span>
          </Link>

          <button
            onClick={() => {
              setIsOpen(false);
              setIsSignOutModalOpen(true);
            }}
            className="w-full text-left px-4 py-2 text-xs flex items-center space-x-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-t border-slate-100 dark:border-slate-800 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      )}

      {/* Sign Out Modal */}
      <SignOutModal
        isOpen={isSignOutModalOpen}
        onClose={() => setIsSignOutModalOpen(false)}
        onConfirm={handleConfirmSignOut}
        isSigningOut={isSigningOut}
      />

      {/* Confirmation Toast */}
      <Toast
        message={toastMessage || ''}
        isVisible={Boolean(toastMessage)}
        onClose={() => setToastMessage(null)}
      />
    </div>
  );
};

