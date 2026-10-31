'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface AuthResponse {
  success: boolean;
  error?: string;
  requiresEmailConfirmation?: boolean;
  /**
   * True when signUp returns a user with an empty identities array, which
   * Supabase emits for already-registered emails (instead of revealing that
   * the account exists).  The UI should show a "check your inbox OR sign in"
   * message without explicitly confirming the email is taken.
   */
  possibleDuplicate?: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signUp: (email: string, password: string, fullName: string) => Promise<AuthResponse>;
  forgotPassword: (email: string) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  enterDemoMode: () => void;
  exitDemoMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_STORAGE_KEY = 'eventora_demo_active_v1';

// Map raw Supabase error codes / messages to user-friendly strings
function mapSignInError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('invalid login credentials') || lower.includes('invalid_credentials')) {
    return 'Invalid email or password. Please check your details and try again.';
  }
  if (lower.includes('email not confirmed') || lower.includes('email_not_confirmed')) {
    return 'Your email address has not been confirmed yet. Please check your inbox for the confirmation link before signing in.';
  }
  if (lower.includes('too many requests') || lower.includes('rate limit')) {
    return 'Too many sign-in attempts. Please wait a moment and try again.';
  }
  return message;
}

function mapSignUpError(message: string, code?: string): string {
  if (code === 'over_email_send_rate_limit' || message.includes('rate limit')) {
    return 'Too many registration or verification email requests. Please wait before trying again. If you already have an account, switch to Sign In.';
  }
  if (code === 'user_already_exists' || message.includes('already registered')) {
    return 'An account with this email already exists. Please switch to Sign In.';
  }
  if (message.includes('Password should be at least')) {
    return 'Password must be at least 6 characters long.';
  }
  return message;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    return isSupabaseConfigured && Boolean(supabase);
  });
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem(DEMO_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // Initialize session and listen for auth state changes
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      return;
    }

    let isMounted = true;

    async function initAuth() {
      try {
        const { data, error } = await supabase!.auth.getSession();
        if (error) {
          console.warn('Supabase getSession notice:', error.message);
        }
        if (isMounted) {
          setSession(data?.session || null);
          setUser(data?.session?.user || null);
          if (data?.session?.user) {
            setIsDemoMode(false);
            try { localStorage.removeItem(DEMO_STORAGE_KEY); } catch { /* ignore */ }
          }
        }
      } catch (err) {
        console.error('Error getting Supabase session:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (!isMounted) return;
      setSession(currentSession);
      setUser(currentSession?.user || null);
      if (currentSession?.user) {
        setIsDemoMode(false);
        try { localStorage.removeItem(DEMO_STORAGE_KEY); } catch { /* ignore */ }
      }
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // ─── Sign In ──────────────────────────────────────────────────────────────
  const signIn = useCallback(
    async (email: string, password: string): Promise<AuthResponse> => {
      const cleanEmail = email.trim();
      if (!cleanEmail || !password) {
        return { success: false, error: 'Email and password are required.' };
      }

      if (!isSupabaseConfigured || !supabase) {
        return {
          success: false,
          error: 'Supabase authentication service is not configured. Please contact the administrator.',
        };
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) {
          return { success: false, error: mapSignInError(error.message) };
        }

        if (!data.session || !data.user) {
          return {
            success: false,
            error: 'Authentication failed. Please verify your credentials and try again.',
          };
        }

        setSession(data.session);
        setUser(data.user);
        setIsDemoMode(false);
        try { localStorage.removeItem(DEMO_STORAGE_KEY); } catch { /* ignore */ }

        return { success: true };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'An unexpected error occurred during sign in.';
        return { success: false, error: msg };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // ─── Sign Up ──────────────────────────────────────────────────────────────
  const signUp = useCallback(
    async (email: string, password: string, fullName: string): Promise<AuthResponse> => {
      const cleanEmail = email.trim();
      const cleanName = fullName.trim();

      if (!cleanEmail || !password) {
        return { success: false, error: 'Email and password are required.' };
      }
      if (password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters long.' };
      }
      if (!cleanName) {
        return { success: false, error: 'Full name is required.' };
      }

      if (!isSupabaseConfigured || !supabase) {
        return {
          success: false,
          error: 'Supabase authentication service is not configured. Please contact the administrator.',
        };
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: { full_name: cleanName },
          },
        });

        if (error) {
          // Explicit error code mapping — never pass raw server messages to the user
          return {
            success: false,
            error: mapSignUpError(error.message, error.code ?? undefined),
          };
        }

        // Supabase returns a user with NO identities when the email is already
        // registered and email-confirmation is ON.  We surface this subtly without
        // confirming the email exists (avoids user enumeration).
        if (data.user && (!data.user.identities || data.user.identities.length === 0)) {
          return {
            success: true,
            requiresEmailConfirmation: true,
            possibleDuplicate: true,
          };
        }

        // Auto-confirmed — session exists immediately
        if (data.session && data.user) {
          setSession(data.session);
          setUser(data.user);
          setIsDemoMode(false);
          try { localStorage.removeItem(DEMO_STORAGE_KEY); } catch { /* ignore */ }
          return { success: true, requiresEmailConfirmation: false };
        }

        // Normal path: confirmation email sent
        return { success: true, requiresEmailConfirmation: true };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'An unexpected error occurred during sign up.';
        return { success: false, error: msg };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // ─── Forgot Password ──────────────────────────────────────────────────────
  const forgotPassword = useCallback(
    async (email: string): Promise<AuthResponse> => {
      const cleanEmail = email.trim();
      if (!cleanEmail) {
        return { success: false, error: 'Please enter your email address.' };
      }

      if (!isSupabaseConfigured || !supabase) {
        return {
          success: false,
          error: 'Supabase authentication service is not configured.',
        };
      }

      try {
        // redirectTo must be an absolute URL that Supabase appends the token to
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: `${origin}/auth/reset-password`,
        });

        if (error) {
          if (error.message.includes('rate limit') || error.code === 'over_email_send_rate_limit') {
            return {
              success: false,
              error: 'Too many password reset requests. Please wait a few minutes and try again.',
            };
          }
          return { success: false, error: error.message };
        }

        // Always return success regardless of whether the email exists — prevents enumeration
        return { success: true };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
        return { success: false, error: msg };
      }
    },
    []
  );

  // ─── Sign Out ─────────────────────────────────────────────────────────────
  const signOut = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('Supabase signOut error:', err);
    } finally {
      setUser(null);
      setSession(null);
      setIsDemoMode(false);
      try {
        localStorage.removeItem(DEMO_STORAGE_KEY);
        localStorage.removeItem('eventora_supabase_auth_token');
      } catch { /* ignore */ }
      setIsLoading(false);
    }
  }, []);

  // ─── Demo Mode ────────────────────────────────────────────────────────────
  const enterDemoMode = useCallback(() => {
    setIsDemoMode(true);
    try { localStorage.setItem(DEMO_STORAGE_KEY, 'true'); } catch { /* ignore */ }
  }, []);

  const exitDemoMode = useCallback(() => {
    setIsDemoMode(false);
    try { localStorage.removeItem(DEMO_STORAGE_KEY); } catch { /* ignore */ }
  }, []);

  const isAuthenticated = Boolean(user !== null);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isAuthenticated,
        isDemoMode,
        signIn,
        signUp,
        forgotPassword,
        signOut,
        enterDemoMode,
        exitDemoMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
