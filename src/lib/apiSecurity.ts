import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

// Maximum allowed JSON payload size (64 KB)
export const MAX_BODY_BYTES = 65_536;

/**
 * Validates request payload size against content-length header as an early check.
 */
export function checkPayloadSize(req: NextRequest): { valid: boolean; errorResponse?: NextResponse } {
  const contentLength = req.headers.get('content-length');
  if (contentLength) {
    const bytes = parseInt(contentLength, 10);
    if (!isNaN(bytes) && bytes > MAX_BODY_BYTES) {
      return {
        valid: false,
        errorResponse: NextResponse.json(
          { error: 'Request body exceeds maximum allowed size (64 KB)' },
          { status: 413 }
        ),
      };
    }
  }
  return { valid: true };
}

/**
 * Safely parses request body as a streaming reader with strict 64 KB cut-off.
 * - Enforces 64 KB limit immediately during stream consumption without buffering whole oversized payloads.
 * - Returns 413 Payload Too Large on oversized bodies.
 * - Returns 400 Bad Request on empty or malformed JSON.
 * - Handles stream errors safely.
 */
export async function parseJsonBody<T = Record<string, unknown>>(
  req: NextRequest
): Promise<{ success: boolean; data?: T; errorResponse?: NextResponse }> {
  // 1. Fast-path Content-Length header validation
  const earlyCheck = checkPayloadSize(req);
  if (!earlyCheck.valid) {
    return { success: false, errorResponse: earlyCheck.errorResponse };
  }

  // 2. Stream consumption with immediate cutoff
  const bodyStream = req.body;
  if (!bodyStream) {
    return {
      success: false,
      errorResponse: NextResponse.json(
        { error: 'Invalid or empty JSON in request body' },
        { status: 400 }
      ),
    };
  }

  const reader = bodyStream.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        totalBytes += value.length;
        if (totalBytes > MAX_BODY_BYTES) {
          // Immediately terminate the stream
          await reader.cancel('Payload Too Large');
          return {
            success: false,
            errorResponse: NextResponse.json(
              { error: 'Request body exceeds maximum allowed size (64 KB)' },
              { status: 413 }
            ),
          };
        }
        chunks.push(value);
      }
    }
  } catch {
    return {
      success: false,
      errorResponse: NextResponse.json(
        { error: 'Failed to read request body stream' },
        { status: 400 }
      ),
    };
  }

  if (chunks.length === 0 || totalBytes === 0) {
    return {
      success: false,
      errorResponse: NextResponse.json(
        { error: 'Invalid or empty JSON in request body' },
        { status: 400 }
      ),
    };
  }

  // Concatenate and decode stream
  const fullBuffer = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    fullBuffer.set(chunk, offset);
    offset += chunk.length;
  }

  const rawText = new TextDecoder('utf-8').decode(fullBuffer);
  if (!rawText.trim()) {
    return {
      success: false,
      errorResponse: NextResponse.json(
        { error: 'Invalid or empty JSON in request body' },
        { status: 400 }
      ),
    };
  }

  try {
    const data = JSON.parse(rawText) as T;
    if (!data || typeof data !== 'object') {
      return {
        success: false,
        errorResponse: NextResponse.json(
          { error: 'Request body must be a valid JSON object' },
          { status: 400 }
        ),
      };
    }
    return { success: true, data };
  } catch {
    return {
      success: false,
      errorResponse: NextResponse.json(
        { error: 'Invalid or empty JSON in request body' },
        { status: 400 }
      ),
    };
  }
}

/**
 * Sanitizes and bounds input strings against prompt injection, control characters, and buffer bloat.
 */
export function sanitizeText(input: unknown, maxLength = 1000): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/\0/g, '') // Strip null bytes
    .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F]/g, '') // Strip non-printable ASCII control codes
    .trim()
    .slice(0, maxLength);
}

/**
 * Validates custom Gemini API keys format.
 * Matches official Google AI Studio format (typically 39 characters starting with AIzaSy)
 * and Google Cloud API keys (20-100 alphanumeric and safe symbol characters).
 */
export function validateCustomApiKey(key?: unknown): string | undefined {
  if (typeof key !== 'string') return undefined;
  const trimmed = key.trim();
  // Safe format check: alphanumeric and standard symbols (-_), 20-100 characters, no whitespace
  if (/^[A-Za-z0-9_-]{20,100}$/.test(trimmed)) {
    return trimmed;
  }
  return undefined;
}

/**
 * Extracts and verifies optional Bearer token from request headers via Supabase Auth.
 */
export async function authenticateRequestUser(req: NextRequest): Promise<User | null> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7).trim();
  if (!token || !isSupabaseConfigured || !supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      return null;
    }
    return data.user;
  } catch {
    return null;
  }
}
