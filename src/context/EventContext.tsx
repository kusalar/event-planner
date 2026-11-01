'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
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
  CurrencyCode,
  GeneratedPlanResponse,
} from '@/types';
import {
  initialProfile,
  sampleEvents,
  sampleBudgetCategories,
  sampleExpenses,
  sampleTimelineTasks,
  sampleVendors,
  sampleGuests,
  sampleIdeas,
} from '@/lib/mockData';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency as formatCurrencyUtil } from '@/lib/formatters';
import { loadUserState, saveUserState, clearUserState } from '@/lib/storage';
import { generateEventAssets } from '@/lib/planGenerator';

export interface EventContextType {
  // Current Active State
  currentEvent: EventItem | null;
  events: EventItem[];
  budgetCategories: BudgetCategory[];
  expenses: Expense[];
  timelineTasks: TimelineTask[];
  vendors: Vendor[];
  guests: Guest[];
  ideas: CreativeIdea[];
  chatMessages: ChatMessage[];
  userProfile: UserProfile;
  theme: 'light' | 'dark';
  geminiApiKey: string;
  isLiveAiAvailable: boolean;

  // Computed Metrics
  totalSpent: number;
  remainingBudget: number;
  budgetProgressPercentage: number;
  taskCompletionPercentage: number;
  completedTasksCount: number;
  totalTasksCount: number;
  bookedVendorsCount: number;
  totalVendorCommitted: number;
  totalVendorAdvancePaid: number;
  confirmedGuestsCount: number;

  // Actions
  switchEvent: (eventId: string) => void;
  createEventFromPlan: (
    eventData: Omit<EventItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
    plan?: GeneratedPlanResponse
  ) => EventItem;
  updateEvent: (eventId: string, updates: Partial<EventItem>) => void;
  deleteEvent: (eventId: string) => { success: boolean; error?: string };

  // Expense & Budget Actions
  addExpense: (expense: Omit<Expense, 'id' | 'eventId'>) => void;
  deleteExpense: (expenseId: string) => void;
  updateBudgetCategory: (categoryId: string, amount: number) => void;
  addBudgetCategory: (name: string, allocatedAmount: number, color?: string) => void;

  // Timeline Actions
  addTimelineTask: (task: Omit<TimelineTask, 'id' | 'eventId'>) => void;
  toggleTimelineTask: (taskId: string) => void;
  deleteTimelineTask: (taskId: string) => void;

  // Vendor Actions
  addVendor: (vendor: Omit<Vendor, 'id' | 'eventId'>) => void;
  updateVendor: (vendorId: string, updates: Partial<Vendor>) => void;
  deleteVendor: (vendorId: string) => void;

  // Guest Actions
  addGuest: (guest: Omit<Guest, 'id' | 'eventId'>) => void;
  updateGuest: (guestId: string, updates: Partial<Guest>) => void;
  deleteGuest: (guestId: string) => void;

  // Ideas Actions
  addIdea: (idea: Omit<CreativeIdea, 'id' | 'eventId'>) => void;
  toggleFavoriteIdea: (ideaId: string) => void;

  // Chat Actions
  addChatMessage: (content: string, sender: 'user' | 'assistant', isLiveModel?: boolean) => void;
  clearChat: () => void;

  // Preferences & Currency
  setCurrency: (currency: CurrencyCode) => void;
  formatCurrency: (amount: number) => string;
  setTheme: (theme: 'light' | 'dark') => void;
  setCustomGeminiKey: (key: string) => void;
  resetToSampleData: () => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isDemoMode } = useAuth();
  const isLoadedRef = React.useRef(false);

  // Active state maps
  const [events, setEvents] = useState<EventItem[]>([]);
  const [currentEventId, setCurrentEventId] = useState<string>('');
  const [categoriesMap, setCategoriesMap] = useState<Record<string, BudgetCategory[]>>({});
  const [expensesMap, setExpensesMap] = useState<Record<string, Expense[]>>({});
  const [tasksMap, setTasksMap] = useState<Record<string, TimelineTask[]>>({});
  const [vendorsMap, setVendorsMap] = useState<Record<string, Vendor[]>>({});
  const [guestsMap, setGuestsMap] = useState<Record<string, Guest[]>>({});
  const [ideasMap, setIdeasMap] = useState<Record<string, CreativeIdea[]>>({});
  const [chatMap, setChatMap] = useState<Record<string, ChatMessage[]>>({});

  const [userProfile, setUserProfile] = useState<UserProfile>(() => initialProfile);
  const [theme, setThemeState] = useState<'light' | 'dark'>('dark');
  const [geminiApiKey, setGeminiApiKey] = useState<string>('');
  const [hasServerAiKey, setHasServerAiKey] = useState<boolean>(false);

  // Check server-side Gemini AI key status securely without exposing secrets
  useEffect(() => {
    let isMounted = true;
    fetch('/api/gemini/status')
      .then((res) => (res.ok ? res.json() : { hasServerKey: false }))
      .then((data) => {
        if (isMounted && data && typeof data.hasServerKey === 'boolean') {
          setHasServerAiKey(data.hasServerKey);
        }
      })
      .catch(() => {
        if (isMounted) setHasServerAiKey(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Synchronize state when authentication or demo status changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (user) {
        const saved = loadUserState(user.id, false);
        const profile: UserProfile = {
          id: user.id,
          name: (user.user_metadata?.full_name as string) || user.email?.split('@')[0] || 'Eventora Planner',
          email: user.email || '',
          currency: (saved?.userProfile?.currency as CurrencyCode) || 'INR',
          avatar: (user.user_metadata?.avatar_url as string) || undefined,
        };
        setUserProfile(profile);

        if (saved && saved.events) {
          setEvents(saved.events);
          setCurrentEventId(saved.currentEventId || saved.events[0]?.id || '');
          setCategoriesMap(saved.categoriesMap || {});
          setExpensesMap(saved.expensesMap || {});
          setTasksMap(saved.tasksMap || {});
          setVendorsMap(saved.vendorsMap || {});
          setGuestsMap(saved.guestsMap || {});
          setIdeasMap(saved.ideasMap || {});
          setChatMap(saved.chatMap || {});
          if (saved.theme) setThemeState(saved.theme);
          if (saved.geminiApiKey) setGeminiApiKey(saved.geminiApiKey);
        } else {
          // New authenticated user starts clean (isolated from other users' events)
          setEvents([]);
          setCurrentEventId('');
          setCategoriesMap({});
          setExpensesMap({});
          setTasksMap({});
          setVendorsMap({});
          setGuestsMap({});
          setIdeasMap({});
          setChatMap({});
        }
      } else if (isDemoMode) {
        // Demo sandbox mode: load curated sample events
        const saved = loadUserState(null, true);
        if (saved && saved.events) {
          setEvents(saved.events);
          setCurrentEventId(saved.currentEventId || sampleEvents[0].id);
          setCategoriesMap(saved.categoriesMap || sampleBudgetCategories);
          setExpensesMap(saved.expensesMap || sampleExpenses);
          setTasksMap(saved.tasksMap || sampleTimelineTasks);
          setVendorsMap(saved.vendorsMap || sampleVendors);
          setGuestsMap(saved.guestsMap || sampleGuests);
          setIdeasMap(saved.ideasMap || sampleIdeas);
          setChatMap(saved.chatMap || {});
          setUserProfile(saved.userProfile || initialProfile);
        } else {
          setEvents(sampleEvents);
          setCurrentEventId(sampleEvents[0].id);
          setCategoriesMap(sampleBudgetCategories);
          setExpensesMap(sampleExpenses);
          setTasksMap(sampleTimelineTasks);
          setVendorsMap(sampleVendors);
          setGuestsMap(sampleGuests);
          setIdeasMap(sampleIdeas);
          setUserProfile(initialProfile);
          setChatMap({
            evt_bengali_wedding: [
              {
                id: 'msg_welcome',
                eventId: 'evt_bengali_wedding',
                sender: 'assistant',
                content: `Hello Priya! I'm your **Eventora AI** personal wedding director for **Aditi & Rohan's Royal Bengali Wedding**.\n\nI have structured your 2-day wedding plan with a budget of ₹8,00,000, 300 guests, and key cultural arrangements in Kolkata. How can I assist your planning today?`,
                timestamp: '2026-10-31T12:00:00.000Z',
                isLiveModel: false,
              },
            ],
          });
        }
      } else {
        // Not authenticated & not demo
        setEvents([]);
        setCurrentEventId('');
        setCategoriesMap({});
        setExpensesMap({});
        setTasksMap({});
        setVendorsMap({});
        setGuestsMap({});
        setIdeasMap({});
        setChatMap({});
      }

      isLoadedRef.current = true;
    }, 0);

    return () => clearTimeout(timer);
  }, [user, isDemoMode]);

  // Persist state to active user's isolated storage
  useEffect(() => {
    if (!isLoadedRef.current) return;
    saveUserState(user?.id || null, isDemoMode, {
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
    });
  }, [
    user,
    isDemoMode,
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
  ]);

  // Apply dark theme class to document element
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [theme]);

  // Currently active event
  const currentEvent = useMemo(
    () => events.find((e) => e.id === currentEventId) || events[0] || null,
    [events, currentEventId]
  );
  const activeEventId = currentEvent ? currentEvent.id : '';

  // Active domain collections
  const budgetCategories = useMemo(
    () => (activeEventId && categoriesMap[activeEventId]) || [],
    [activeEventId, categoriesMap]
  );
  const expenses = useMemo(
    () => (activeEventId && expensesMap[activeEventId]) || [],
    [activeEventId, expensesMap]
  );
  const timelineTasks = useMemo(
    () => (activeEventId && tasksMap[activeEventId]) || [],
    [activeEventId, tasksMap]
  );
  const vendors = useMemo(
    () => (activeEventId && vendorsMap[activeEventId]) || [],
    [activeEventId, vendorsMap]
  );
  const guests = useMemo(
    () => (activeEventId && guestsMap[activeEventId]) || [],
    [activeEventId, guestsMap]
  );
  const ideas = useMemo(
    () => (activeEventId && ideasMap[activeEventId]) || [],
    [activeEventId, ideasMap]
  );
  const chatMessages = useMemo(
    () => (activeEventId && chatMap[activeEventId]) || [],
    [activeEventId, chatMap]
  );

  // Computed Metrics
  const totalSpent = useMemo(
    () => expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0),
    [expenses]
  );
  const totalBudget = currentEvent ? currentEvent.totalBudget : 0;
  const remainingBudget = useMemo(() => Math.max(0, totalBudget - totalSpent), [totalBudget, totalSpent]);
  const budgetProgressPercentage = useMemo(
    () => (totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0),
    [totalBudget, totalSpent]
  );

  const totalTasksCount = timelineTasks.length;
  const completedTasksCount = useMemo(
    () => timelineTasks.filter((t) => t.isCompleted).length,
    [timelineTasks]
  );
  const taskCompletionPercentage = useMemo(
    () => (totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0),
    [totalTasksCount, completedTasksCount]
  );

  const bookedVendorsCount = useMemo(
    () => vendors.filter((v) => v.status === 'booked' || v.status === 'completed').length,
    [vendors]
  );
  const totalVendorCommitted = useMemo(
    () => vendors.reduce((acc, v) => acc + (Number(v.quotedPrice) || 0), 0),
    [vendors]
  );
  const totalVendorAdvancePaid = useMemo(
    () => vendors.reduce((acc, v) => acc + (Number(v.advancePaid) || 0), 0),
    [vendors]
  );
  const confirmedGuestsCount = useMemo(
    () => guests.filter((g) => g.rsvpStatus === 'confirmed').length,
    [guests]
  );

  const isLiveAiAvailable = Boolean(geminiApiKey || hasServerAiKey);

  // Currency formatting helper
  const formatCurrency = useCallback(
    (amount: number): string => formatCurrencyUtil(amount, userProfile.currency),
    [userProfile.currency]
  );

  const switchEvent = useCallback(
    (eventId: string) => {
      if (events.some((e) => e.id === eventId)) {
        setCurrentEventId(eventId);
      }
    },
    [events]
  );

  const createEventFromPlan = useCallback(
    (
      eventData: Omit<EventItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
      plan?: GeneratedPlanResponse
    ): EventItem => {
      const newId = `evt_${Date.now()}`;
      const timestamp = '2026-10-31T12:00:00.000Z';

      const createdEvent: EventItem = {
        ...eventData,
        id: newId,
        userId: userProfile.id,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      const assets = generateEventAssets(newId, createdEvent, plan);

      setEvents((prev) => [createdEvent, ...prev]);
      setCurrentEventId(newId);
      setCategoriesMap((prev) => ({ ...prev, [newId]: assets.categories }));
      setTasksMap((prev) => ({ ...prev, [newId]: assets.tasks }));
      setVendorsMap((prev) => ({ ...prev, [newId]: assets.vendors }));
      setIdeasMap((prev) => ({ ...prev, [newId]: assets.ideas }));
      setChatMap((prev) => ({ ...prev, [newId]: assets.initialChat }));

      return createdEvent;
    },
    [userProfile.id]
  );

  const updateEvent = useCallback((eventId: string, updates: Partial<EventItem>) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, ...updates, updatedAt: '2026-10-31T12:00:00.000Z' } : e))
    );
  }, []);

  const deleteEvent = useCallback(
    (eventId: string): { success: boolean; error?: string } => {
      if (events.length <= 1) {
        return { success: false, error: 'You must have at least one active event.' };
      }
      const remaining = events.filter((e) => e.id !== eventId);
      setEvents(remaining);
      if (currentEventId === eventId) {
        setCurrentEventId(remaining[0].id);
      }
      return { success: true };
    },
    [events, currentEventId]
  );

  const addExpense = useCallback(
    (expense: Omit<Expense, 'id' | 'eventId'>) => {
      if (!activeEventId) return;
      const newExp: Expense = {
        ...expense,
        id: `exp_${Date.now()}`,
        eventId: activeEventId,
      };
      setExpensesMap((prev) => ({
        ...prev,
        [activeEventId]: [newExp, ...(prev[activeEventId] || [])],
      }));
    },
    [activeEventId]
  );

  const deleteExpense = useCallback(
    (expenseId: string) => {
      if (!activeEventId) return;
      setExpensesMap((prev) => ({
        ...prev,
        [activeEventId]: (prev[activeEventId] || []).filter((e) => e.id !== expenseId),
      }));
    },
    [activeEventId]
  );

  const updateBudgetCategory = useCallback(
    (categoryId: string, amount: number) => {
      if (!activeEventId) return;
      setCategoriesMap((prev) => ({
        ...prev,
        [activeEventId]: (prev[activeEventId] || []).map((c) =>
          c.id === categoryId ? { ...c, allocatedAmount: amount } : c
        ),
      }));
    },
    [activeEventId]
  );

  const addBudgetCategory = useCallback(
    (name: string, allocatedAmount: number, color?: string) => {
      if (!activeEventId) return;
      const newCat: BudgetCategory = {
        id: `cat_${Date.now()}`,
        eventId: activeEventId,
        name,
        allocatedAmount,
        color: color || '#8b5cf6',
      };
      setCategoriesMap((prev) => ({
        ...prev,
        [activeEventId]: [...(prev[activeEventId] || []), newCat],
      }));
    },
    [activeEventId]
  );

  const addTimelineTask = useCallback(
    (task: Omit<TimelineTask, 'id' | 'eventId'>) => {
      if (!activeEventId) return;
      const newTask: TimelineTask = {
        ...task,
        id: `tsk_${Date.now()}`,
        eventId: activeEventId,
      };
      setTasksMap((prev) => ({
        ...prev,
        [activeEventId]: [...(prev[activeEventId] || []), newTask],
      }));
    },
    [activeEventId]
  );

  const toggleTimelineTask = useCallback(
    (taskId: string) => {
      if (!activeEventId) return;
      setTasksMap((prev) => ({
        ...prev,
        [activeEventId]: (prev[activeEventId] || []).map((t) =>
          t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
        ),
      }));
    },
    [activeEventId]
  );

  const deleteTimelineTask = useCallback(
    (taskId: string) => {
      if (!activeEventId) return;
      setTasksMap((prev) => ({
        ...prev,
        [activeEventId]: (prev[activeEventId] || []).filter((t) => t.id !== taskId),
      }));
    },
    [activeEventId]
  );

  const addVendor = useCallback(
    (vendor: Omit<Vendor, 'id' | 'eventId'>) => {
      if (!activeEventId) return;
      const newV: Vendor = {
        ...vendor,
        id: `vnd_${Date.now()}`,
        eventId: activeEventId,
      };
      setVendorsMap((prev) => ({
        ...prev,
        [activeEventId]: [newV, ...(prev[activeEventId] || [])],
      }));
    },
    [activeEventId]
  );

  const updateVendor = useCallback(
    (vendorId: string, updates: Partial<Vendor>) => {
      if (!activeEventId) return;
      setVendorsMap((prev) => ({
        ...prev,
        [activeEventId]: (prev[activeEventId] || []).map((v) => (v.id === vendorId ? { ...v, ...updates } : v)),
      }));
    },
    [activeEventId]
  );

  const deleteVendor = useCallback(
    (vendorId: string) => {
      if (!activeEventId) return;
      setVendorsMap((prev) => ({
        ...prev,
        [activeEventId]: (prev[activeEventId] || []).filter((v) => v.id !== vendorId),
      }));
    },
    [activeEventId]
  );

  const addGuest = useCallback(
    (guest: Omit<Guest, 'id' | 'eventId'>) => {
      if (!activeEventId) return;
      const newG: Guest = {
        ...guest,
        id: `gst_${Date.now()}`,
        eventId: activeEventId,
      };
      setGuestsMap((prev) => ({
        ...prev,
        [activeEventId]: [newG, ...(prev[activeEventId] || [])],
      }));
    },
    [activeEventId]
  );

  const updateGuest = useCallback(
    (guestId: string, updates: Partial<Guest>) => {
      if (!activeEventId) return;
      setGuestsMap((prev) => ({
        ...prev,
        [activeEventId]: (prev[activeEventId] || []).map((g) => (g.id === guestId ? { ...g, ...updates } : g)),
      }));
    },
    [activeEventId]
  );

  const deleteGuest = useCallback(
    (guestId: string) => {
      if (!activeEventId) return;
      setGuestsMap((prev) => ({
        ...prev,
        [activeEventId]: (prev[activeEventId] || []).filter((g) => g.id !== guestId),
      }));
    },
    [activeEventId]
  );

  const addIdea = useCallback(
    (idea: Omit<CreativeIdea, 'id' | 'eventId'>) => {
      if (!activeEventId) return;
      const newI: CreativeIdea = {
        ...idea,
        id: `idea_${Date.now()}`,
        eventId: activeEventId,
      };
      setIdeasMap((prev) => ({
        ...prev,
        [activeEventId]: [newI, ...(prev[activeEventId] || [])],
      }));
    },
    [activeEventId]
  );

  const toggleFavoriteIdea = useCallback(
    (ideaId: string) => {
      if (!activeEventId) return;
      setIdeasMap((prev) => ({
        ...prev,
        [activeEventId]: (prev[activeEventId] || []).map((i) =>
          i.id === ideaId ? { ...i, isFavorite: !i.isFavorite } : i
        ),
      }));
    },
    [activeEventId]
  );

  const addChatMessage = useCallback(
    (content: string, sender: 'user' | 'assistant', isLiveModel = false) => {
      if (!activeEventId) return;
      const newMsg: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        eventId: activeEventId,
        sender,
        content,
        timestamp: '2026-10-31T12:00:00.000Z',
        isLiveModel,
      };
      setChatMap((prev) => ({
        ...prev,
        [activeEventId]: [...(prev[activeEventId] || []), newMsg],
      }));
    },
    [activeEventId]
  );

  const clearChat = useCallback(() => {
    if (!activeEventId) return;
    setChatMap((prev) => ({
      ...prev,
      [activeEventId]: [],
    }));
  }, [activeEventId]);

  const setCurrency = useCallback((currency: CurrencyCode) => {
    setUserProfile((prev) => ({ ...prev, currency }));
  }, []);

  const setTheme = useCallback((newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
  }, []);

  const setCustomGeminiKey = useCallback((key: string) => {
    setGeminiApiKey(key);
  }, []);

  const resetToSampleData = useCallback(() => {
    clearUserState(user?.id || null, isDemoMode);
    setEvents(sampleEvents);
    setCurrentEventId(sampleEvents[0].id);
    setCategoriesMap(sampleBudgetCategories);
    setExpensesMap(sampleExpenses);
    setTasksMap(sampleTimelineTasks);
    setVendorsMap(sampleVendors);
    setGuestsMap(sampleGuests);
    setIdeasMap(sampleIdeas);
    setUserProfile(initialProfile);
  }, [user?.id, isDemoMode]);

  return (
    <EventContext.Provider
      value={{
        currentEvent,
        events,
        budgetCategories,
        expenses,
        timelineTasks,
        vendors,
        guests,
        ideas,
        chatMessages,
        userProfile,
        theme,
        geminiApiKey,
        isLiveAiAvailable,
        totalSpent,
        remainingBudget,
        budgetProgressPercentage,
        taskCompletionPercentage,
        completedTasksCount,
        totalTasksCount,
        bookedVendorsCount,
        totalVendorCommitted,
        totalVendorAdvancePaid,
        confirmedGuestsCount,
        switchEvent,
        createEventFromPlan,
        updateEvent,
        deleteEvent,
        addExpense,
        deleteExpense,
        updateBudgetCategory,
        addBudgetCategory,
        addTimelineTask,
        toggleTimelineTask,
        deleteTimelineTask,
        addVendor,
        updateVendor,
        deleteVendor,
        addGuest,
        updateGuest,
        deleteGuest,
        addIdea,
        toggleFavoriteIdea,
        addChatMessage,
        clearChat,
        setCurrency,
        formatCurrency,
        setTheme,
        setCustomGeminiKey,
        resetToSampleData,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

export const useEventContext = (): EventContextType => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEventContext must be used within an EventProvider');
  }
  return context;
};
