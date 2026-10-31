import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Sanitize URL by removing any trailing /rest/v1, /rest/v1/ or slashes
const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const cleanUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured: boolean = Boolean(
  cleanUrl &&
  supabaseAnonKey &&
  !cleanUrl.includes('placeholder') &&
  cleanUrl.startsWith('https://')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(cleanUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'eventora_supabase_auth_token',
      },
    })
  : null;
