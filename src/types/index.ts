export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  currency: CurrencyCode;
  avatar?: string;
}

export type EventType =
  | 'wedding'
  | 'birthday'
  | 'anniversary'
  | 'corporate'
  | 'college_fest'
  | 'community'
  | 'other';

export interface EventItem {
  id: string;
  userId: string;
  title: string;
  eventType: EventType;
  date: string;
  duration: string;
  location: string;
  guestCount: number;
  totalBudget: number;
  currency: CurrencyCode;
  theme: string;
  foodPreferences: string;
  specialRequirements: string;
  rawPrompt?: string;
  aiSummary: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetCategory {
  id: string;
  eventId: string;
  name: string;
  allocatedAmount: number;
  color: string;
}

export interface Expense {
  id: string;
  eventId: string;
  categoryId: string;
  categoryName: string;
  title: string;
  amount: number;
  paidDate: string;
  vendorId?: string;
  notes?: string;
}

export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskPhase =
  | '6_months'
  | '3_months'
  | '1_month'
  | '2_weeks'
  | '1_week'
  | 'event_day';

export interface TimelineTask {
  id: string;
  eventId: string;
  title: string;
  description?: string;
  phase: TaskPhase;
  deadline: string;
  priority: TaskPriority;
  category: string;
  isCompleted: boolean;
}

export type VendorCategory =
  | 'Venue'
  | 'Catering'
  | 'Decoration'
  | 'Photography'
  | 'Makeup & Styling'
  | 'DJ & Music'
  | 'Florist'
  | 'Transportation'
  | 'Event Coordinator'
  | 'Invitations & Favors'
  | 'Other';

export type VendorStatus =
  | 'inquiry'
  | 'shortlisted'
  | 'contract_sent'
  | 'booked'
  | 'completed';

export interface Vendor {
  id: string;
  eventId: string;
  name: string;
  category: VendorCategory;
  contactPerson?: string;
  phone?: string;
  email?: string;
  quotedPrice: number;
  advancePaid: number;
  status: VendorStatus;
  rating: number; // 1-5
  notes?: string;
  checklist?: string[];
}

export type RSVPStatus = 'confirmed' | 'pending' | 'declined';

export interface Guest {
  id: string;
  eventId: string;
  name: string;
  email?: string;
  phone?: string;
  rsvpStatus: RSVPStatus;
  dietaryPreference: string;
  plusOnes: number;
  tableAssigned?: string;
}

export type IdeaCategory =
  | 'decor'
  | 'menu'
  | 'entertainment'
  | 'gifts'
  | 'photography'
  | 'general';

export interface CreativeIdea {
  id: string;
  eventId: string;
  category: IdeaCategory;
  title: string;
  description: string;
  isFavorite: boolean;
  tags?: string[];
}

export interface ChatMessage {
  id: string;
  eventId: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isLiveModel?: boolean;
}

export interface GeneratedPlanResponse {
  event_summary: string;
  budget: {
    total: number;
    currency?: CurrencyCode;
    categories: Array<{
      name: string;
      estimated_cost: number;
      percentage?: number;
      description?: string;
    }>;
  };
  timeline: Array<{
    task: string;
    phase: TaskPhase;
    deadline: string;
    priority: TaskPriority;
    category?: string;
    description?: string;
  }>;
  vendors_required: Array<{
    category: VendorCategory;
    specs: string;
    estimated_budget: number;
    recommended_booking_window?: string;
    key_questions_to_ask?: string[];
  }>;
  food_recommendations?: Array<{
    course: string;
    items: string[];
    highlight: string;
  }>;
  creative_ideas: Array<{
    category: IdeaCategory;
    title: string;
    description: string;
  }>;
  recommendations: string[];
  isDemoMode?: boolean;
}

