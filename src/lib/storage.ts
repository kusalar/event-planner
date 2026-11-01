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
 * Defensive validation and sanitization for persisted local state.
 * Gracefully preserves valid portions of user data even if individual maps are corrupted or outdated.
 */
export function validateAndSanitizePersistedState(data: unknown): PersistedAppState | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const raw = data as Record<string, unknown>;

  // Validate events array
  let events: EventItem[] = [];
  if (Array.isArray(raw.events)) {
    events = raw.events.filter(
      (e): e is EventItem =>
        Boolean(e && typeof e === 'object' && typeof e.id === 'string' && typeof e.title === 'string')
    );
  }

  const currentEventId =
    typeof raw.currentEventId === 'string' && raw.currentEventId
      ? raw.currentEventId
      : events[0]?.id || '';

  const sanitizeMap = <T>(candidate: unknown): Record<string, T[]> => {
    if (candidate && typeof candidate === 'object' && !Array.isArray(candidate)) {
      const result: Record<string, T[]> = {};
      for (const [k, v] of Object.entries(candidate)) {
        if (Array.isArray(v)) {
          result[k] = v;
        }
      }
      return result;
    }
    return {};
  };

  const categoriesMap = sanitizeMap<BudgetCategory>(raw.categoriesMap);
  const expensesMap = sanitizeMap<Expense>(raw.expensesMap);
  const tasksMap = sanitizeMap<TimelineTask>(raw.tasksMap);
  const vendorsMap = sanitizeMap<Vendor>(raw.vendorsMap);
  const guestsMap = sanitizeMap<Guest>(raw.guestsMap);
  const ideasMap = sanitizeMap<CreativeIdea>(raw.ideasMap);
  const chatMap = sanitizeMap<ChatMessage>(raw.chatMap);

  const theme: 'light' | 'dark' | undefined =
    raw.theme === 'light' || raw.theme === 'dark' ? raw.theme : undefined;

  const geminiApiKey =
    typeof raw.geminiApiKey === 'string' ? raw.geminiApiKey.trim() : undefined;

  let userProfile: UserProfile | undefined = undefined;
  if (raw.userProfile && typeof raw.userProfile === 'object') {
    const p = raw.userProfile as Partial<UserProfile>;
    if (typeof p.name === 'string') {
      userProfile = p as UserProfile;
    }
  }

  return {
    events,
    currentEventId,
    categoriesMap,
    expensesMap,
    tasksMap,
    vendorsMap,
    guestsMap,
    ideasMap,
    chatMap,
    userProfile,
    theme,
    geminiApiKey,
  };
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
    const parsed: unknown = JSON.parse(raw);
    return validateAndSanitizePersistedState(parsed);
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
