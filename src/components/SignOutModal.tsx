'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { LogOut, X, Loader2, ShieldAlert } from 'lucide-react';

interface SignOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isSigningOut: boolean;
}

export const SignOutModal: React.FC<SignOutModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isSigningOut,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      titleId="sign-out-modal-title"
      maxWidth="max-w-md"
      zIndex="z-[100]"
      disableEscape={isSigningOut}
      disableBackdropClick={isSigningOut}
      contentClassName="rounded-3xl p-6 sm:p-7 scale-100 animate-in zoom-in-95 duration-150"
      backdropClassName="bg-slate-950/70 backdrop-blur-md"
    >
      {/* Close Button */}
      <button
        type="button"
        onClick={onClose}
        disabled={isSigningOut}
        className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
        aria-label="Close dialog"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Warning Icon Badge */}
      <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4 shadow-md shadow-rose-500/10">
        <LogOut className="w-6 h-6" />
      </div>

      {/* Modal Title & Body */}
      <h3 id="sign-out-modal-title" className="text-lg font-black text-slate-900 dark:text-white">
        Are you sure you want to sign out?
      </h3>
      <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
        You will be securely signed out of your account. All your private event blueprints, budgets, and vendor contacts will remain safely encrypted on Supabase.
      </p>

      <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center space-x-2.5 text-xs text-slate-600 dark:text-slate-400">
        <ShieldAlert className="w-4 h-4 text-violet-500 shrink-0" />
        <span>You will need to re-authenticate to view your private dashboard.</span>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex items-center justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          disabled={isSigningOut}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={onConfirm}
          disabled={isSigningOut}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold text-xs shadow-lg shadow-rose-500/25 flex items-center space-x-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
        >
          {isSigningOut ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Signing Out...</span>
            </>
          ) : (
            <>
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </>
          )}
        </button>
      </div>
    </Modal>
  );
};

