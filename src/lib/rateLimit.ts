/**
 * Eventora AI - Server-side Rate Limiting Engine
 * Provides sliding-window IP rate limiting with header propagation for Next.js API routes.
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory store per serverless instance
const ipStore = new Map<string, RateLimitRecord>();

// Periodic garbage collection for expired entries (prevents memory leak in warm instances)
let lastCleanup = Date.now();
const CLEANUP_INTERVAL_MS = 60_000;

function cleanupExpiredRecords(now: number): void {
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, record] of ipStore.entries()) {
    if (now >= record.resetAt) {
      ipStore.delete(key);
    }
  }
}

export interface RateLimitOptions {
  limit: number;      // Maximum requests allowed in the window
  windowSeconds: number; // Duration of the window in seconds
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;       // Unix timestamp (seconds) when window resets
  retryAfter: number;  // Seconds until caller can retry
}

/**
 * Extracts the true client IP address from request headers.
 * Prioritizes trusted edge headers (Vercel x-real-ip) over easily-spoofed client headers.
 */
export function getClientIp(headers: Headers): string {
  // 1. Vercel trusted edge header (injected by Vercel proxy, non-spoofable by client)
  const realIp = headers.get('x-real-ip');
  if (realIp && realIp.trim()) return realIp.trim();

  // 2. Vercel forwarded IP chain
  const vercelForwardedFor = headers.get('x-vercel-forwarded-for');
  if (vercelForwardedFor && vercelForwardedFor.trim()) {
    const firstIp = vercelForwardedFor.split(',')[0].trim();
    if (firstIp) return firstIp;
  }

  // 3. Cloudflare connecting IP
  const cfConnectingIp = headers.get('cf-connecting-ip');
  if (cfConnectingIp && cfConnectingIp.trim()) return cfConnectingIp.trim();

  // 4. Standard X-Forwarded-For fallback
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor && forwardedFor.trim()) {
    const firstIp = forwardedFor.split(',')[0].trim();
    if (firstIp) return firstIp;
  }

  return '127.0.0.1';
}

/**
 * Checks and updates rate limits for a given client identifier and route action.
 */
export function checkRateLimit(
  identifier: string,
  routeKey: string,
  options: RateLimitOptions
): RateLimitResult {
  const now = Date.now();
  cleanupExpiredRecords(now);

  const key = `${routeKey}:${identifier}`;
  const windowMs = options.windowSeconds * 1000;
  const existing = ipStore.get(key);

  if (!existing || now >= existing.resetAt) {
    // New or expired window
    const record: RateLimitRecord = {
      count: 1,
      resetAt: now + windowMs,
    };
    ipStore.set(key, record);
    return {
      success: true,
      limit: options.limit,
      remaining: options.limit - 1,
      reset: Math.ceil(record.resetAt / 1000),
      retryAfter: 0,
    };
  }

  // Active window
  if (existing.count < options.limit) {
    existing.count += 1;
    return {
      success: true,
      limit: options.limit,
      remaining: options.limit - existing.count,
      reset: Math.ceil(existing.resetAt / 1000),
      retryAfter: 0,
    };
  }

  // Rate limit exceeded
  const retryAfter = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
  return {
    success: false,
    limit: options.limit,
    remaining: 0,
    reset: Math.ceil(existing.resetAt / 1000),
    retryAfter,
  };
}

/**
 * Generates standard rate-limiting HTTP headers.
 */
export function createRateLimitHeaders(result: RateLimitResult): Headers {
  const headers = new Headers();
  headers.set('X-RateLimit-Limit', result.limit.toString());
  headers.set('X-RateLimit-Remaining', result.remaining.toString());
  headers.set('X-RateLimit-Reset', result.reset.toString());
  if (!result.success) {
    headers.set('Retry-After', result.retryAfter.toString());
  }
  return headers;
}
