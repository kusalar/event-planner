'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
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

interface EventContextType {
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
  deleteEvent: (eventId: string) => void;

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

const LOCAL_STORAGE_KEY = 'eventora_app_state_v2';

function getSavedState() {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn('Failed to parse saved state:', e);
  }
  return null;
}

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isLoadedRef = React.useRef(false);

  const [events, setEvents] = useState<EventItem[]>(() => {
    const saved = getSavedState();
    return saved?.events?.length ? saved.events : sampleEvents;
  });

  const [currentEventId, setCurrentEventId] = useState<string>(() => {
    const saved = getSavedState();
    return saved?.currentEventId || sampleEvents[0].id;
  });

  const [categoriesMap, setCategoriesMap] = useState<Record<string, BudgetCategory[]>>(() => {
    const saved = getSavedState();
    return saved?.categoriesMap || sampleBudgetCategories;
  });

  const [expensesMap, setExpensesMap] = useState<Record<string, Expense[]>>(() => {
    const saved = getSavedState();
    return saved?.expensesMap || sampleExpenses;
  });

  const [tasksMap, setTasksMap] = useState<Record<string, TimelineTask[]>>(() => {
    const saved = getSavedState();
    return saved?.tasksMap || sampleTimelineTasks;
  });

  const [vendorsMap, setVendorsMap] = useState<Record<string, Vendor[]>>(() => {
    const saved = getSavedState();
    return saved?.vendorsMap || sampleVendors;
  });

  const [guestsMap, setGuestsMap] = useState<Record<string, Guest[]>>(() => {
    const saved = getSavedState();
    return saved?.guestsMap || sampleGuests;
  });

  const [ideasMap, setIdeasMap] = useState<Record<string, CreativeIdea[]>>(() => {
    const saved = getSavedState();
    return saved?.ideasMap || sampleIdeas;
  });

  const [chatMap, setChatMap] = useState<Record<string, ChatMessage[]>>(() => {
    const saved = getSavedState();
    return (
      saved?.chatMap || {
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
      }
    );
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = getSavedState();
    return saved?.userProfile || initialProfile;
  });

  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    const saved = getSavedState();
    return saved?.theme || 'dark';
  });

  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => {
    const saved = getSavedState();
    return saved?.geminiApiKey || '';
  });

  useEffect(() => {
    isLoadedRef.current = true;
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (!isLoadedRef.current) return;
    try {
      const stateToSave = {
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
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.error('Failed to save state to localStorage:', e);
    }
  }, [
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

  // Apply dark theme class to document body
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
  const currentEvent = events.find((e) => e.id === currentEventId) || events[0] || null;
  const activeEventId = currentEvent ? currentEvent.id : '';

  const budgetCategories = (activeEventId && categoriesMap[activeEventId]) || [];
  const expenses = (activeEventId && expensesMap[activeEventId]) || [];
  const timelineTasks = (activeEventId && tasksMap[activeEventId]) || [];
  const vendors = (activeEventId && vendorsMap[activeEventId]) || [];
  const guests = (activeEventId && guestsMap[activeEventId]) || [];
  const ideas = (activeEventId && ideasMap[activeEventId]) || [];
  const chatMessages = (activeEventId && chatMap[activeEventId]) || [];

  // Metrics
  const totalSpent = expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const totalBudget = currentEvent ? currentEvent.totalBudget : 0;
  const remainingBudget = Math.max(0, totalBudget - totalSpent);
  const budgetProgressPercentage = totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0;

  const totalTasksCount = timelineTasks.length;
  const completedTasksCount = timelineTasks.filter((t) => t.isCompleted).length;
  const taskCompletionPercentage = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  const bookedVendorsCount = vendors.filter((v) => v.status === 'booked' || v.status === 'completed').length;
  const totalVendorCommitted = vendors.reduce((acc, v) => acc + (Number(v.quotedPrice) || 0), 0);
  const totalVendorAdvancePaid = vendors.reduce((acc, v) => acc + (Number(v.advancePaid) || 0), 0);
  const confirmedGuestsCount = guests.filter((g) => g.rsvpStatus === 'confirmed').length;

  const isLiveAiAvailable = Boolean(geminiApiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY);

  // Currency formatting helper
  const formatCurrency = (amount: number): string => {
    const curr = userProfile.currency || 'INR';
    try {
      if (curr === 'INR') {
        return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          maximumFractionDigits: 0,
        }).format(amount);
      }
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: curr,
        maximumFractionDigits: 0,
      }).format(amount);
    } catch {
      return `₹${amount.toLocaleString()}`;
    }
  };

  const switchEvent = (eventId: string) => {
    if (events.some((e) => e.id === eventId)) {
      setCurrentEventId(eventId);
    }
  };

  const createEventFromPlan = (
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

    setEvents((prev) => [createdEvent, ...prev]);
    setCurrentEventId(newId);

    // Populate categories from plan or defaults
    const categoryColors = ['#8b5cf6', '#ec4899', '#f59e0b', '#3b82f6', '#10b981', '#06b6d4', '#6366f1', '#a855f7', '#64748b'];
    let newCategories: BudgetCategory[] = [];

    if (plan?.budget?.categories?.length) {
      newCategories = plan.budget.categories.map((c, idx) => ({
        id: `cat_${newId}_${idx}`,
        eventId: newId,
        name: c.name,
        allocatedAmount: c.estimated_cost,
        color: categoryColors[idx % categoryColors.length],
      }));
    } else {
      const b = createdEvent.totalBudget;
      newCategories = [
        { id: `cat_${newId}_0`, eventId: newId, name: 'Venue', allocatedAmount: Math.round(b * 0.25), color: '#8b5cf6' },
        { id: `cat_${newId}_1`, eventId: newId, name: 'Catering', allocatedAmount: Math.round(b * 0.35), color: '#ec4899' },
        { id: `cat_${newId}_2`, eventId: newId, name: 'Decoration', allocatedAmount: Math.round(b * 0.15), color: '#f59e0b' },
        { id: `cat_${newId}_3`, eventId: newId, name: 'Photography', allocatedAmount: Math.round(b * 0.1), color: '#3b82f6' },
        { id: `cat_${newId}_4`, eventId: newId, name: 'Entertainment', allocatedAmount: Math.round(b * 0.08), color: '#10b981' },
        { id: `cat_${newId}_5`, eventId: newId, name: 'Miscellaneous', allocatedAmount: Math.round(b * 0.07), color: '#64748b' },
      ];
    }
    setCategoriesMap((prev) => ({ ...prev, [newId]: newCategories }));

    // Populate tasks
    let newTasks: TimelineTask[] = [];
    if (plan?.timeline?.length) {
      newTasks = plan.timeline.map((t, idx) => ({
        id: `tsk_${newId}_${idx}`,
        eventId: newId,
        title: t.task,
        description: t.description || '',
        phase: t.phase || '1_month',
        deadline: t.deadline || createdEvent.date,
        priority: t.priority || 'medium',
        category: t.category || 'General',
        isCompleted: false,
      }));
    } else {
      newTasks = [
        {
          id: `tsk_${newId}_0`,
          eventId: newId,
          title: `Book primary venue for ${createdEvent.title}`,
          phase: '6_months',
          deadline: createdEvent.date,
          priority: 'high',
          category: 'Venue',
          isCompleted: false,
        },
        {
          id: `tsk_${newId}_1`,
          eventId: newId,
          title: 'Finalize core catering menu & tasting',
          phase: '3_months',
          deadline: createdEvent.date,
          priority: 'high',
          category: 'Catering',
          isCompleted: false,
        },
      ];
    }
    setTasksMap((prev) => ({ ...prev, [newId]: newTasks }));

    // Populate vendors required
    let newVendors: Vendor[] = [];
    if (plan?.vendors_required?.length) {
      newVendors = plan.vendors_required.map((v, idx) => ({
        id: `vnd_${newId}_${idx}`,
        eventId: newId,
        name: `${v.category} Specialist (To Hire)`,
        category: v.category,
        quotedPrice: v.estimated_budget || 0,
        advancePaid: 0,
        status: 'inquiry',
        rating: 5,
        notes: v.specs,
        checklist: v.key_questions_to_ask || [
          'Confirm availability on event date',
          'Review cancellation terms & refund policy',
          'Review portfolio of similar past events',
        ],
      }));
    }
    setVendorsMap((prev) => ({ ...prev, [newId]: newVendors }));

    // Populate ideas
    let newIdeas: CreativeIdea[] = [];
    if (plan?.creative_ideas?.length) {
      newIdeas = plan.creative_ideas.map((i, idx) => ({
        id: `idea_${newId}_${idx}`,
        eventId: newId,
        category: i.category || 'decor',
        title: i.title,
        description: i.description,
        isFavorite: idx === 0,
      }));
    }
    setIdeasMap((prev) => ({ ...prev, [newId]: newIdeas }));

    // Init chat
    setChatMap((prev) => ({
      ...prev,
      [newId]: [
        {
          id: `msg_init_${newId}`,
          eventId: newId,
          sender: 'assistant',
          content: `Welcome to **${createdEvent.title}**! I have created your AI Master Plan based on your requirements in ${createdEvent.location}.\n\nAsk me anything from cost-saving strategies to decor concepts or vendor checklists!`,
          timestamp: '2026-10-31T12:00:00.000Z',
          isLiveModel: false,
        },
      ],
    }));

    return createdEvent;
  };

  const updateEvent = (eventId: string, updates: Partial<EventItem>) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, ...updates, updatedAt: '2026-10-31T12:00:00.000Z' } : e))
    );
  };

  const deleteEvent = (eventId: string) => {
    if (events.length <= 1) {
      alert('You must have at least one active event.');
      return;
    }
    const remaining = events.filter((e) => e.id !== eventId);
    setEvents(remaining);
    if (currentEventId === eventId) {
      setCurrentEventId(remaining[0].id);
    }
  };

  const addExpense = (expense: Omit<Expense, 'id' | 'eventId'>) => {
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
  };

  const deleteExpense = (expenseId: string) => {
    if (!activeEventId) return;
    setExpensesMap((prev) => ({
      ...prev,
      [activeEventId]: (prev[activeEventId] || []).filter((e) => e.id !== expenseId),
    }));
  };

  const updateBudgetCategory = (categoryId: string, amount: number) => {
    if (!activeEventId) return;
    setCategoriesMap((prev) => ({
      ...prev,
      [activeEventId]: (prev[activeEventId] || []).map((c) =>
        c.id === categoryId ? { ...c, allocatedAmount: amount } : c
      ),
    }));
  };

  const addBudgetCategory = (name: string, allocatedAmount: number, color?: string) => {
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
  };

  const addTimelineTask = (task: Omit<TimelineTask, 'id' | 'eventId'>) => {
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
  };

  const toggleTimelineTask = (taskId: string) => {
    if (!activeEventId) return;
    setTasksMap((prev) => ({
      ...prev,
      [activeEventId]: (prev[activeEventId] || []).map((t) =>
        t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
      ),
    }));
  };

  const deleteTimelineTask = (taskId: string) => {
    if (!activeEventId) return;
    setTasksMap((prev) => ({
      ...prev,
      [activeEventId]: (prev[activeEventId] || []).filter((t) => t.id !== taskId),
    }));
  };

  const addVendor = (vendor: Omit<Vendor, 'id' | 'eventId'>) => {
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
  };

  const updateVendor = (vendorId: string, updates: Partial<Vendor>) => {
    if (!activeEventId) return;
    setVendorsMap((prev) => ({
      ...prev,
      [activeEventId]: (prev[activeEventId] || []).map((v) => (v.id === vendorId ? { ...v, ...updates } : v)),
    }));
  };

  const deleteVendor = (vendorId: string) => {
    if (!activeEventId) return;
    setVendorsMap((prev) => ({
      ...prev,
      [activeEventId]: (prev[activeEventId] || []).filter((v) => v.id !== vendorId),
    }));
  };

  const addGuest = (guest: Omit<Guest, 'id' | 'eventId'>) => {
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
  };

  const updateGuest = (guestId: string, updates: Partial<Guest>) => {
    if (!activeEventId) return;
    setGuestsMap((prev) => ({
      ...prev,
      [activeEventId]: (prev[activeEventId] || []).map((g) => (g.id === guestId ? { ...g, ...updates } : g)),
    }));
  };

  const deleteGuest = (guestId: string) => {
    if (!activeEventId) return;
    setGuestsMap((prev) => ({
      ...prev,
      [activeEventId]: (prev[activeEventId] || []).filter((g) => g.id !== guestId),
    }));
  };

  const addIdea = (idea: Omit<CreativeIdea, 'id' | 'eventId'>) => {
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
  };

  const toggleFavoriteIdea = (ideaId: string) => {
    if (!activeEventId) return;
    setIdeasMap((prev) => ({
      ...prev,
      [activeEventId]: (prev[activeEventId] || []).map((i) =>
        i.id === ideaId ? { ...i, isFavorite: !i.isFavorite } : i
      ),
    }));
  };

  const addChatMessage = (content: string, sender: 'user' | 'assistant', isLiveModel = false) => {
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
  };

  const clearChat = () => {
    if (!activeEventId) return;
    setChatMap((prev) => ({
      ...prev,
      [activeEventId]: [],
    }));
  };

  const setCurrency = (currency: CurrencyCode) => {
    setUserProfile((prev) => ({ ...prev, currency }));
  };

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
  };

  const setCustomGeminiKey = (key: string) => {
    setGeminiApiKey(key);
  };

  const resetToSampleData = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setEvents(sampleEvents);
    setCurrentEventId(sampleEvents[0].id);
    setCategoriesMap(sampleBudgetCategories);
    setExpensesMap(sampleExpenses);
    setTasksMap(sampleTimelineTasks);
    setVendorsMap(sampleVendors);
    setGuestsMap(sampleGuests);
    setIdeasMap(sampleIdeas);
    setUserProfile(initialProfile);
  };

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

export const useEventContext = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEventContext must be used within an EventProvider');
  }
  return context;
};
