import {
  EventItem,
  BudgetCategory,
  Expense,
  TimelineTask,
  Vendor,
  Guest,
  CreativeIdea,
  ChatMessage,
  UserProfile,
} from '@/types';

export const DEMO_STORAGE_KEY = 'eventora_demo_sandbox_v1';

export interface PersistedAppState {
  events: EventItem[];
  currentEventId: string;
  categoriesMap: Record<string, BudgetCategory[]>;
  expensesMap: Record<string, Expense[]>;
  tasksMap: Record<string, TimelineTask[]>;
  vendorsMap: Record<string, Vendor[]>;
  guestsMap: Record<string, Guest[]>;
  ideasMap: Record<string, CreativeIdea[]>;
  chatMap: Record<string, ChatMessage[]>;
  userProfile?: UserProfile;
  theme?: 'light' | 'dark';
  geminiApiKey?: string;
}

/**
 * Returns the storage key for an authenticated user or demo sandbox session.
 * Guarantees strict user-level multi-tenant storage isolation.
 */
export function getUserStorageKey(userId: string | null, isDemo: boolean): string | null {
  if (userId) return `eventora_user_state_${userId}`;
  if (isDemo) return DEMO_STORAGE_KEY;
  return null;
}

/**
 * Safely loads persisted state from browser localStorage.
 */
export function loadUserState(userId: string | null, isDemo: boolean): PersistedAppState | null {
  if (typeof window === 'undefined') return null;
  const key = getUserStorageKey(userId, isDemo);
  if (!key) return null;

  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedAppState;
  } catch (error) {
    console.warn('Failed to parse persisted state for key:', key, error);
    return null;
  }
}

/**
 * Safely serializes state into browser localStorage.
 */
export function saveUserState(
  userId: string | null,
  isDemo: boolean,
  state: PersistedAppState
): boolean {
  if (typeof window === 'undefined') return false;
  const key = getUserStorageKey(userId, isDemo);
  if (!key) return false;

  try {
    localStorage.setItem(key, JSON.stringify(state));
    return true;
  } catch (error) {
    console.error('Failed to save state to localStorage:', error);
    return false;
  }
}

/**
 * Removes persisted state for a user (e.g. on reset to demo data).
 */
export function clearUserState(userId: string | null, isDemo: boolean): void {
  if (typeof window === 'undefined') return;
  const key = getUserStorageKey(userId, isDemo);
  if (key) {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }
}

