import {
  EventItem,
  BudgetCategory,
  TimelineTask,
  Vendor,
  CreativeIdea,
  ChatMessage,
  GeneratedPlanResponse,
} from '@/types';

export const CATEGORY_COLORS = [
  '#8b5cf6',
  '#ec4899',
  '#f59e0b',
  '#3b82f6',
  '#10b981',
  '#06b6d4',
  '#6366f1',
  '#a855f7',
  '#64748b',
];

export interface GeneratedEventAssets {
  categories: BudgetCategory[];
  tasks: TimelineTask[];
  vendors: Vendor[];
  ideas: CreativeIdea[];
  initialChat: ChatMessage[];
}

/**
 * Builds budget categories, milestone tasks, vendor requirements, creative ideas,
 * and welcome chat messages from an AI plan or curated fallback defaults.
 */
export function generateEventAssets(
  eventId: string,
  event: EventItem,
  plan?: GeneratedPlanResponse
): GeneratedEventAssets {
  // 1. Categories
  let categories: BudgetCategory[] = [];
  if (plan?.budget?.categories?.length) {
    categories = plan.budget.categories.map((c, idx) => ({
      id: `cat_${eventId}_${idx}`,
      eventId,
      name: c.name,
      allocatedAmount: c.estimated_cost,
      color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
    }));
  } else {
    const b = event.totalBudget;
    categories = [
      { id: `cat_${eventId}_0`, eventId, name: 'Venue', allocatedAmount: Math.round(b * 0.25), color: '#8b5cf6' },
      { id: `cat_${eventId}_1`, eventId, name: 'Catering', allocatedAmount: Math.round(b * 0.35), color: '#ec4899' },
      { id: `cat_${eventId}_2`, eventId, name: 'Decoration', allocatedAmount: Math.round(b * 0.15), color: '#f59e0b' },
      { id: `cat_${eventId}_3`, eventId, name: 'Photography', allocatedAmount: Math.round(b * 0.1), color: '#3b82f6' },
      { id: `cat_${eventId}_4`, eventId, name: 'Entertainment', allocatedAmount: Math.round(b * 0.08), color: '#10b981' },
      { id: `cat_${eventId}_5`, eventId, name: 'Miscellaneous', allocatedAmount: Math.round(b * 0.07), color: '#64748b' },
    ];
  }

  // 2. Timeline Tasks
  let tasks: TimelineTask[] = [];
  if (plan?.timeline?.length) {
    tasks = plan.timeline.map((t, idx) => ({
      id: `tsk_${eventId}_${idx}`,
      eventId,
      title: t.task,
      description: t.description || '',
      phase: t.phase || '1_month',
      deadline: t.deadline || event.date,
      priority: t.priority || 'medium',
      category: t.category || 'General',
      isCompleted: false,
    }));
  } else {
    tasks = [
      {
        id: `tsk_${eventId}_0`,
        eventId,
        title: `Book primary venue for ${event.title}`,
        phase: '6_months',
        deadline: event.date,
        priority: 'high',
        category: 'Venue',
        isCompleted: false,
      },
      {
        id: `tsk_${eventId}_1`,
        eventId,
        title: 'Finalize core catering menu & tasting',
        phase: '3_months',
        deadline: event.date,
        priority: 'high',
        category: 'Catering',
        isCompleted: false,
      },
    ];
  }

  // 3. Vendors
  let vendors: Vendor[] = [];
  if (plan?.vendors_required?.length) {
    vendors = plan.vendors_required.map((v, idx) => ({
      id: `vnd_${eventId}_${idx}`,
      eventId,
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

  // 4. Creative Ideas
  let ideas: CreativeIdea[] = [];
  if (plan?.creative_ideas?.length) {
    ideas = plan.creative_ideas.map((i, idx) => ({
      id: `idea_${eventId}_${idx}`,
      eventId,
      category: i.category || 'decor',
      title: i.title,
      description: i.description,
      isFavorite: idx === 0,
    }));
  }

  // 5. Initial Welcome Chat Message
  const initialChat: ChatMessage[] = [
    {
      id: `msg_init_${eventId}`,
      eventId,
      sender: 'assistant',
      content: `Welcome to **${event.title}**! I have created your AI Master Plan based on your requirements in ${event.location}.\n\nAsk me anything from cost-saving strategies to decor concepts or vendor checklists!`,
      timestamp: '2026-10-31T12:00:00.000Z',
      isLiveModel: false,
    },
  ];

  return {
    categories,
    tasks,
    vendors,
    ideas,
    initialChat,
  };
}

