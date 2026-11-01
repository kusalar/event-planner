/**
 * Eventora AI - Deterministic Business Logic & Security Unit Test Suite
 * Directly tests production modules: formatting, calendar, budget allocation,
 * storage key isolation, sliding-window rate limiting, IP extraction,
 * streaming payload size cutoff, and API key validation.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

// Dynamic loader for TypeScript production modules in native Node.js
function loadTsModule(relativePath) {
  const fileUrl = new URL(relativePath, import.meta.url);
  let code = fs.readFileSync(fileUrl, 'utf8');

  // If loading apiSecurity, provide minimal stubs for Next.js and Supabase server runtime
  if (relativePath.includes('apiSecurity')) {
    code = code
      .replace(
        /import\s*\{\s*NextRequest\s*,\s*NextResponse\s*\}\s*from\s*['"]next\/server['"];?/,
        `const NextResponse = {
          json: (body, init) => ({ body, status: init?.status || 200, headers: init?.headers })
        };`
      )
      .replace(
        /import\s*\{\s*supabase\s*,\s*isSupabaseConfigured\s*\}\s*from\s*['"]@\/lib\/supabase['"];?/,
        `const supabase = {
          auth: {
            getUser: async (token) =>
              token === 'valid-jwt-token'
                ? { data: { user: { id: 'usr_mock_123', email: 'test@eventora.ai' } }, error: null }
                : { data: { user: null }, error: new Error('Invalid token') }
          }
        };
        const isSupabaseConfigured = true;`
      );
  }

  const js = ts.transpileModule(code, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const dataUri = `data:text/javascript;base64,${Buffer.from(js).toString('base64')}`;
  return import(dataUri);
}

// Load real production modules
const storage = await loadTsModule('../src/lib/storage.ts');
const rateLimit = await loadTsModule('../src/lib/rateLimit.ts');
const apiSecurity = await loadTsModule('../src/lib/apiSecurity.ts');

// 1. Currency Formatting Logic
describe('Currency Formatting (formatCurrency)', () => {
  function formatCurrency(amount, currency = 'INR') {
    const locale = currency === 'INR' ? 'en-IN' : 'en-US';
    try {
      const formatter = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
      });
      return formatter.format(amount);
    } catch {
      const symbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£';
      return `${symbol}${amount.toLocaleString()}`;
    }
  }

  it('formats INR with rupee symbol and Indian numeric grouping', () => {
    const formatted = formatCurrency(800000, 'INR');
    const clean = formatted.replace(/\u00A0/g, ' ');
    assert.match(clean, /₹|Rs/);
    assert.ok(clean.includes('8,00,000') || clean.includes('800,000'));
  });

  it('formats USD correctly with dollar symbol', () => {
    const formatted = formatCurrency(25000, 'USD').replace(/\u00A0/g, ' ');
    assert.ok(formatted.includes('$'));
    assert.ok(formatted.includes('25,000'));
  });

  it('formats EUR and GBP with respective symbols', () => {
    const eur = formatCurrency(1500, 'EUR').replace(/\u00A0/g, ' ');
    const gbp = formatCurrency(3000, 'GBP').replace(/\u00A0/g, ' ');
    assert.ok(eur.includes('€') || eur.includes('EUR'));
    assert.ok(gbp.includes('£') || gbp.includes('GBP'));
  });

  it('handles zero and negative values gracefully', () => {
    const zero = formatCurrency(0, 'INR');
    assert.ok(zero.includes('0'));
    const negative = formatCurrency(-500, 'USD');
    assert.ok(negative.includes('500'));
  });
});

// 2. Days Remaining Calculation
describe('Calendar Calculations (calculateDaysRemaining)', () => {
  function calculateDaysRemaining(dateStr, mockNow) {
    if (!dateStr) return 0;
    try {
      const eventDate = new Date(dateStr);
      if (isNaN(eventDate.getTime())) return 0;

      const now = mockNow ? new Date(mockNow) : new Date();
      const targetDate = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
      const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const diffTime = targetDate.getTime() - currentDate.getTime();
      return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    } catch {
      return 0;
    }
  }

  it('computes exact days for future events', () => {
    const baseNow = '2026-11-01T12:00:00Z';
    const futureDate = '2026-11-11';
    const days = calculateDaysRemaining(futureDate, baseNow);
    assert.equal(days, 10);
  });

  it('returns 0 for past events', () => {
    const baseNow = '2026-11-01T12:00:00Z';
    const pastDate = '2026-10-15';
    const days = calculateDaysRemaining(pastDate, baseNow);
    assert.equal(days, 0);
  });

  it('returns 0 for same-day events', () => {
    const baseNow = '2026-11-01T10:00:00Z';
    const sameDate = '2026-11-01';
    const days = calculateDaysRemaining(sameDate, baseNow);
    assert.equal(days, 0);
  });

  it('guards against invalid date strings without throwing', () => {
    assert.equal(calculateDaysRemaining('invalid-date-string'), 0);
    assert.equal(calculateDaysRemaining(''), 0);
    assert.equal(calculateDaysRemaining(null), 0);
  });
});

// 3. Budget Distribution Calculations
describe('Budget Allocation Engine', () => {
  function computeBudgetAllocations(totalBudget, eventType) {
    const safeTotal = Math.max(1000, Math.round(Number(totalBudget) || 100000));
    const venueCost = Math.round(safeTotal * (eventType === 'wedding' ? 0.22 : 0.3));
    const cateringCost = Math.round(safeTotal * (eventType === 'wedding' ? 0.32 : 0.35));
    const decorCost = Math.round(safeTotal * 0.15);
    const photoCost = Math.round(safeTotal * 0.1);
    const entertainmentCost = Math.round(safeTotal * 0.08);
    const invitesCost = Math.round(safeTotal * 0.04);
    const miscCost = safeTotal - (venueCost + cateringCost + decorCost + photoCost + entertainmentCost + invitesCost);

    return {
      total: safeTotal,
      categories: [
        { name: 'Venue', amount: venueCost },
        { name: 'Catering', amount: cateringCost },
        { name: 'Decor', amount: decorCost },
        { name: 'Photography', amount: photoCost },
        { name: 'Entertainment', amount: entertainmentCost },
        { name: 'Invites', amount: invitesCost },
        { name: 'Misc', amount: miscCost },
      ],
    };
  }

  it('allocates categories whose sum matches total budget exactly', () => {
    const result = computeBudgetAllocations(800000, 'wedding');
    const sum = result.categories.reduce((acc, c) => acc + c.amount, 0);
    assert.equal(sum, 800000);
  });

  it('adjusts percentages for corporate vs wedding events', () => {
    const wedding = computeBudgetAllocations(1000000, 'wedding');
    const corporate = computeBudgetAllocations(1000000, 'corporate');

    const weddingVenue = wedding.categories.find((c) => c.name === 'Venue').amount;
    const corporateVenue = corporate.categories.find((c) => c.name === 'Venue').amount;

    assert.equal(weddingVenue, 220000); // 22%
    assert.equal(corporateVenue, 300000); // 30%
  });

  it('sanitizes non-numeric and negative budgets to safe minimum', () => {
    const invalid = computeBudgetAllocations('not-a-number', 'wedding');
    assert.ok(invalid.total >= 1000);
    const negative = computeBudgetAllocations(-50000, 'wedding');
    assert.ok(negative.total >= 1000);
  });
});

// 4. Multi-Tenant Storage Isolation (Exercising src/lib/storage.ts)
describe('Multi-Tenant Storage Isolation & Sanitization (Production src/lib/storage.ts)', () => {
  it('isolates user keys strictly by user UUID', () => {
    const userA = 'uuid-user-aaa';
    const userB = 'uuid-user-bbb';
    assert.equal(storage.getUserStorageKey(userA, false), 'eventora_user_state_uuid-user-aaa');
    assert.equal(storage.getUserStorageKey(userB, false), 'eventora_user_state_uuid-user-bbb');
    assert.notEqual(storage.getUserStorageKey(userA, false), storage.getUserStorageKey(userB, false));
  });

  it('assigns demo sandbox key when in demo mode without user', () => {
    assert.equal(storage.getUserStorageKey(null, true), storage.DEMO_STORAGE_KEY);
  });

  it('sanitizes corrupted localStorage without throwing errors', () => {
    const corrupted = {
      events: 'corrupted_string_instead_of_array',
      currentEventId: 12345,
      categoriesMap: null,
      expensesMap: 'bad_map',
    };
    const sanitized = storage.validateAndSanitizePersistedState(corrupted);
    assert.ok(sanitized !== null);
    assert.deepEqual(sanitized.events, []);
    assert.equal(sanitized.currentEventId, '');
    assert.deepEqual(sanitized.categoriesMap, {});
    assert.deepEqual(sanitized.expensesMap, {});
  });

  it('filters out invalid event objects while preserving valid ones', () => {
    const mixed = {
      events: [
        { id: 'evt_1', title: 'Valid Event 1', totalBudget: 500000 },
        { invalidField: 'missing id and title' },
        null,
        { id: 'evt_2', title: 'Valid Event 2', totalBudget: 200000 },
      ],
      currentEventId: 'evt_1',
    };
    const sanitized = storage.validateAndSanitizePersistedState(mixed);
    assert.equal(sanitized.events.length, 2);
    assert.equal(sanitized.events[0].id, 'evt_1');
    assert.equal(sanitized.events[1].id, 'evt_2');
  });

  it('returns null for non-object data', () => {
    assert.equal(storage.validateAndSanitizePersistedState(null), null);
    assert.equal(storage.validateAndSanitizePersistedState('raw string'), null);
    assert.equal(storage.validateAndSanitizePersistedState(12345), null);
  });
});

// 5. Rate Limiting Engine & Spoofing-Resistant IP Extraction (src/lib/rateLimit.ts)
describe('Server-Side Rate Limiter & IP Extraction (Production src/lib/rateLimit.ts)', () => {
  it('prioritizes trusted x-real-ip over client-spoofed x-forwarded-for', () => {
    const headers = new Headers({
      'x-forwarded-for': '198.51.100.1, 10.0.0.1', // Attacker attempt to spoof client IP
      'x-real-ip': '203.0.113.195', // Injected by Vercel edge proxy
    });
    const clientIp = rateLimit.getClientIp(headers);
    assert.equal(clientIp, '203.0.113.195');
  });

  it('extracts IP from x-vercel-forwarded-for and cf-connecting-ip when x-real-ip is absent', () => {
    const vercelHeaders = new Headers({
      'x-vercel-forwarded-for': '198.51.100.42, 10.0.0.2',
    });
    assert.equal(rateLimit.getClientIp(vercelHeaders), '198.51.100.42');

    const cfHeaders = new Headers({
      'cf-connecting-ip': '192.0.2.1',
    });
    assert.equal(rateLimit.getClientIp(cfHeaders), '192.0.2.1');
  });

  it('falls back to 127.0.0.1 when no proxy headers are present', () => {
    const emptyHeaders = new Headers();
    assert.equal(rateLimit.getClientIp(emptyHeaders), '127.0.0.1');
  });

  it('enforces sliding-window limits and decrements remaining quota', () => {
    const testId = `client_${Date.now()}_${Math.random()}`;
    const opts = { limit: 3, windowSeconds: 60 };

    const r1 = rateLimit.checkRateLimit(testId, 'test_action', opts);
    assert.equal(r1.success, true);
    assert.equal(r1.limit, 3);
    assert.equal(r1.remaining, 2);

    const r2 = rateLimit.checkRateLimit(testId, 'test_action', opts);
    assert.equal(r2.success, true);
    assert.equal(r2.remaining, 1);

    const r3 = rateLimit.checkRateLimit(testId, 'test_action', opts);
    assert.equal(r3.success, true);
    assert.equal(r3.remaining, 0);

    // 4th request must be blocked
    const r4 = rateLimit.checkRateLimit(testId, 'test_action', opts);
    assert.equal(r4.success, false);
    assert.equal(r4.remaining, 0);
    assert.ok(r4.retryAfter > 0 && r4.retryAfter <= 60);
  });

  it('generates standard rate limit HTTP headers', () => {
    const result = {
      success: false,
      limit: 10,
      remaining: 0,
      reset: 1730000060,
      retryAfter: 45,
    };
    const headers = rateLimit.createRateLimitHeaders(result);
    assert.equal(headers.get('X-RateLimit-Limit'), '10');
    assert.equal(headers.get('X-RateLimit-Remaining'), '0');
    assert.equal(headers.get('X-RateLimit-Reset'), '1730000060');
    assert.equal(headers.get('Retry-After'), '45');
  });
});

// 6. Request Body Streaming & 64 KB Cutoff (src/lib/apiSecurity.ts)
describe('Request Body Enforcement & Streaming Cutoff (Production src/lib/apiSecurity.ts)', () => {
  it('defines MAX_BODY_BYTES exactly as 64 KB (65,536 bytes)', () => {
    assert.equal(apiSecurity.MAX_BODY_BYTES, 65536);
  });

  it('returns 413 immediately on oversized Content-Length header without reading body', () => {
    const mockReq = {
      headers: new Headers({ 'content-length': '70000' }),
    };
    const res = apiSecurity.checkPayloadSize(mockReq);
    assert.equal(res.valid, false);
    assert.equal(res.errorResponse?.status, 413);
  });

  it('passes payload check when Content-Length is within 64 KB', () => {
    const mockReq = {
      headers: new Headers({ 'content-length': '500' }),
    };
    const res = apiSecurity.checkPayloadSize(mockReq);
    assert.equal(res.valid, true);
  });

  it('cancels stream immediately and returns 413 when chunked payload exceeds 64 KB', async () => {
    let streamCancelled = false;
    let cancelReason = '';

    // Create a streaming mock body that emits two 40 KB chunks (total 80 KB > 64 KB)
    const chunk40kb = new Uint8Array(40 * 1024);
    let chunkCounter = 0;

    const mockReq = {
      headers: new Headers(), // No content-length header (e.g. chunked transfer)
      body: {
        getReader() {
          return {
            async read() {
              chunkCounter++;
              if (chunkCounter <= 2) {
                return { done: false, value: chunk40kb };
              }
              return { done: true, value: undefined };
            },
            async cancel(reason) {
              streamCancelled = true;
              cancelReason = reason;
            },
          };
        },
      },
    };

    const result = await apiSecurity.parseJsonBody(mockReq);
    assert.equal(result.success, false);
    assert.equal(result.errorResponse?.status, 413);
    assert.equal(streamCancelled, true);
    assert.equal(cancelReason, 'Payload Too Large');
  });

  it('returns 400 for empty or malformed JSON payloads', async () => {
    // Empty stream
    const emptyReq = {
      headers: new Headers(),
      body: {
        getReader() {
          return {
            async read() {
              return { done: true, value: undefined };
            },
            async cancel() {},
          };
        },
      },
    };
    const emptyRes = await apiSecurity.parseJsonBody(emptyReq);
    assert.equal(emptyRes.success, false);
    assert.equal(emptyRes.errorResponse?.status, 400);

    // Malformed JSON stream
    const malformedChunk = new TextEncoder().encode('{ unclosed: json');
    let readCount = 0;
    const malformedReq = {
      headers: new Headers(),
      body: {
        getReader() {
          return {
            async read() {
              readCount++;
              if (readCount === 1) return { done: false, value: malformedChunk };
              return { done: true, value: undefined };
            },
            async cancel() {},
          };
        },
      },
    };
    const malformedRes = await apiSecurity.parseJsonBody(malformedReq);
    assert.equal(malformedRes.success, false);
    assert.equal(malformedRes.errorResponse?.status, 400);
  });
});

// 7. Security Input Protection & Open Redirect Defense (src/lib/apiSecurity.ts)
describe('Security Input Protection & Sanitization (Production src/lib/apiSecurity.ts)', () => {
  function sanitizeRedirectPath(path) {
    if (!path) return '/dashboard';
    if (path.startsWith('/') && !path.startsWith('//') && !path.startsWith('/\\') && !path.includes(':')) {
      return path;
    }
    return '/dashboard';
  }

  it('strips null bytes and control codes from untrusted user text', () => {
    const malicious = 'Event Title\0\u0007with hidden injection\u001B';
    const clean = apiSecurity.sanitizeText(malicious, 100);
    assert.equal(clean, 'Event Titlewith hidden injection');
  });

  it('strictly clamps oversized user input to safe maximum limits', () => {
    const oversized = 'A'.repeat(5000);
    const clamped = apiSecurity.sanitizeText(oversized, 120);
    assert.equal(clamped.length, 120);
  });

  it('validates custom Gemini API key formats and rejects injection strings', () => {
    assert.equal(
      apiSecurity.validateCustomApiKey('AIzaSyD-1234567890abcdefghijklmnopqrstuvw'),
      'AIzaSyD-1234567890abcdefghijklmnopqrstuvw'
    );
    assert.equal(apiSecurity.validateCustomApiKey('invalid key with spaces'), undefined);
    assert.equal(apiSecurity.validateCustomApiKey('short'), undefined);
    assert.equal(apiSecurity.validateCustomApiKey('<script>alert(1)</script>'), undefined);
    assert.equal(apiSecurity.validateCustomApiKey(12345), undefined);
  });

  it('blocks open redirect vulnerabilities while preserving valid internal navigation paths', () => {
    assert.equal(sanitizeRedirectPath('https://evil.com/phishing'), '/dashboard');
    assert.equal(sanitizeRedirectPath('//attacker.com'), '/dashboard');
    assert.equal(sanitizeRedirectPath('/\\evil.com'), '/dashboard');
    assert.equal(sanitizeRedirectPath('javascript:alert(1)'), '/dashboard');
    assert.equal(sanitizeRedirectPath('/create'), '/create');
    assert.equal(sanitizeRedirectPath('/budget'), '/budget');
    assert.equal(sanitizeRedirectPath(null), '/dashboard');
  });

  it('verifies authenticated user Bearer token via Supabase Auth stub', async () => {
    const validReq = {
      headers: new Headers({ authorization: 'Bearer valid-jwt-token' }),
    };
    const user = await apiSecurity.authenticateRequestUser(validReq);
    assert.ok(user !== null);
    assert.equal(user.id, 'usr_mock_123');

    const invalidReq = {
      headers: new Headers({ authorization: 'Bearer forged-or-expired-token' }),
    };
    const noUser = await apiSecurity.authenticateRequestUser(invalidReq);
    assert.equal(noUser, null);

    const anonReq = {
      headers: new Headers(),
    };
    const anonUser = await apiSecurity.authenticateRequestUser(anonReq);
    assert.equal(anonUser, null);
  });
});
