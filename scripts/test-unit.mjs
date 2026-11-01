/**
 * Eventora AI - Deterministic Business Logic Unit Test Suite
 * Tests formatting, days remaining, budget distribution, storage key isolation,
 * and corrupted state sanitization using Node.js native test runner.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

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
    // Normalize non-breaking spaces if any from Intl
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

    const weddingVenue = wedding.categories.find(c => c.name === 'Venue').amount;
    const corporateVenue = corporate.categories.find(c => c.name === 'Venue').amount;

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

// 4. Storage Key Isolation & Sanitization
describe('Multi-Tenant Storage Isolation & Sanitization', () => {
  const DEMO_STORAGE_KEY = 'eventora_demo_sandbox_v1';

  function getUserStorageKey(userId, isDemo) {
    if (userId) return `eventora_user_state_${userId}`;
    if (isDemo) return DEMO_STORAGE_KEY;
    return null;
  }

  function validateAndSanitizePersistedState(data) {
    if (!data || typeof data !== 'object') return null;

    let events = [];
    if (Array.isArray(data.events)) {
      events = data.events.filter(
        e => Boolean(e && typeof e === 'object' && typeof e.id === 'string' && typeof e.title === 'string')
      );
    }

    const currentEventId =
      typeof data.currentEventId === 'string' && data.currentEventId
        ? data.currentEventId
        : events[0]?.id || '';

    const sanitizeMap = candidate => {
      if (candidate && typeof candidate === 'object' && !Array.isArray(candidate)) {
        const result = {};
        for (const [k, v] of Object.entries(candidate)) {
          if (Array.isArray(v)) result[k] = v;
        }
        return result;
      }
      return {};
    };

    return {
      events,
      currentEventId,
      categoriesMap: sanitizeMap(data.categoriesMap),
      expensesMap: sanitizeMap(data.expensesMap),
      tasksMap: sanitizeMap(data.tasksMap),
      vendorsMap: sanitizeMap(data.vendorsMap),
      guestsMap: sanitizeMap(data.guestsMap),
      ideasMap: sanitizeMap(data.ideasMap),
      chatMap: sanitizeMap(data.chatMap),
      theme: data.theme === 'light' || data.theme === 'dark' ? data.theme : undefined,
    };
  }

  it('isolates user keys strictly by user UUID', () => {
    const userA = 'uuid-user-aaa';
    const userB = 'uuid-user-bbb';
    assert.equal(getUserStorageKey(userA, false), 'eventora_user_state_uuid-user-aaa');
    assert.equal(getUserStorageKey(userB, false), 'eventora_user_state_uuid-user-bbb');
    assert.notEqual(getUserStorageKey(userA, false), getUserStorageKey(userB, false));
  });

  it('assigns demo sandbox key when in demo mode without user', () => {
    assert.equal(getUserStorageKey(null, true), DEMO_STORAGE_KEY);
  });

  it('sanitizes corrupted localStorage without throwing errors', () => {
    const corrupted = {
      events: 'corrupted_string_instead_of_array',
      currentEventId: 12345,
      categoriesMap: null,
      expensesMap: 'bad_map',
    };
    const sanitized = validateAndSanitizePersistedState(corrupted);
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
    const sanitized = validateAndSanitizePersistedState(mixed);
    assert.equal(sanitized.events.length, 2);
    assert.equal(sanitized.events[0].id, 'evt_1');
    assert.equal(sanitized.events[1].id, 'evt_2');
  });

  it('returns null for non-object data', () => {
    assert.equal(validateAndSanitizePersistedState(null), null);
    assert.equal(validateAndSanitizePersistedState('raw string'), null);
    assert.equal(validateAndSanitizePersistedState(12345), null);
  });
});

