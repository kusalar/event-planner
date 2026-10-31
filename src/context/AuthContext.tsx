'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface AuthResponse {
  success: boolean;
  error?: string;
  requiresEmailConfirmation?: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signUp: (email: string, password: string, fullName: string) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  enterDemoMode: () => void;
  exitDemoMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_STORAGE_KEY = 'eventora_demo_active_v1';

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

  // Initialize session and listen for auth changes
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
            try {
              localStorage.removeItem(DEMO_STORAGE_KEY);
            } catch {
              // ignore
            }
          }
        }
      } catch (err) {
        console.error('Error getting Supabase session:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
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
        try {
          localStorage.removeItem(DEMO_STORAGE_KEY);
        } catch {
          // ignore
        }
      }
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

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
          let userMessage = error.message;
          if (error.message.includes('Invalid login credentials')) {
            userMessage = 'Invalid email or password. Please check your credentials and try again.';
          } else if (error.message.includes('Email not confirmed')) {
            userMessage =
              'Your email address has not been confirmed yet. Please check your inbox for the confirmation link before signing in.';
          }
          return { success: false, error: userMessage };
        }

        if (!data.session || !data.user) {
          return {
            success: false,
            error: 'Authentication failed. Please verify your credentials and try again.',
          };
        }

        // Authentication succeeded
        setSession(data.session);
        setUser(data.user);
        setIsDemoMode(false);
        try {
          localStorage.removeItem(DEMO_STORAGE_KEY);
        } catch {
          // ignore
        }

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
            data: {
              full_name: cleanName,
            },
          },
        });

        if (error) {
          return { success: false, error: error.message };
        }

        // If session exists immediately, user is logged in (auto-confirm enabled)
        if (data.session && data.user) {
          setSession(data.session);
          setUser(data.user);
          setIsDemoMode(false);
          try {
            localStorage.removeItem(DEMO_STORAGE_KEY);
          } catch {
            // ignore
          }
          return { success: true, requiresEmailConfirmation: false };
        }

        // If user created but no session, confirmation email was sent
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
        // Clear active session keys
        localStorage.removeItem('eventora_supabase_auth_token');
      } catch {
        // ignore
      }
      setIsLoading(false);
    }
  }, []);

  const enterDemoMode = useCallback(() => {
    setIsDemoMode(true);
    try {
      localStorage.setItem(DEMO_STORAGE_KEY, 'true');
    } catch {
      // ignore
    }
  }, []);

  const exitDemoMode = useCallback(() => {
    setIsDemoMode(false);
    try {
      localStorage.removeItem(DEMO_STORAGE_KEY);
    } catch {
      // ignore
    }
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
