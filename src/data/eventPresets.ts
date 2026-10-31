import { EventType, RSVPStatus, VendorStatus, CurrencyCode } from '@/types';

export interface EventPreset {
  id: 'wedding' | 'corporate' | 'birthday' | 'fest';
  eventType: EventType;
  title: string;
  location: string;
  date: string;
  duration: string;
  guestCount: string;
  totalBudget: string;
  theme: string;
  foodPreferences: string;
  specialRequirements: string;
  rawPrompt: string;
}

export const EVENT_PRESETS: Record<EventPreset['id'], EventPreset> = {
  wedding: {
    id: 'wedding',
    eventType: 'wedding',
    title: "Aditi & Rohan's Bengali Wedding",
    location: 'Kolkata, West Bengal',
    date: '2027-02-14',
    duration: '2-Day Celebration',
    guestCount: '300',
    totalBudget: '800000',
    theme: 'Traditional Rajbari Royalty with Terracotta & Marigold',
    foodPreferences: 'Authentic Bengali Feast (Bhetki Paturi, Kosha Mangsho, Mishti Doi)',
    specialRequirements: 'Live Shehnai & Baul musicians, eco-friendly clay decor',
    rawPrompt:
      'I want to organize a Bengali wedding in Kolkata for 300 guests with a budget of ₹8 lakh. Traditional decorations and Bengali cuisine.',
  },
  corporate: {
    id: 'corporate',
    eventType: 'corporate',
    title: 'NexGen AI Conclave 2027',
    location: 'Whitefield, Bengaluru',
    date: '2027-05-18',
    duration: 'Full Day Summit',
    guestCount: '450',
    totalBudget: '1200000',
    theme: 'Futuristic Cyber Minimalist with Interactive Demo Pods',
    foodPreferences: 'Continental & Pan-Asian Buffet, Live Espresso Bar',
    specialRequirements: 'High-speed fiber connectivity, dual 4K LED backdrops, lapel mics',
    rawPrompt:
      'Plan a corporate AI conclave in Bengaluru for 450 guests with ₹12L budget, keynote stages, demo pods, and continental catering.',
  },
  birthday: {
    id: 'birthday',
    eventType: 'birthday',
    title: "Aria's 1st Fairytale Birthday",
    location: 'South Delhi, Delhi',
    date: '2027-03-22',
    duration: 'Evening Celebration (4 Hours)',
    guestCount: '80',
    totalBudget: '250000',
    theme: 'Pastel Lavender & Gold Whimsical Enchanted Garden',
    foodPreferences: 'Kid-Friendly Gourmet Sliders, Pasta Stations, Custom Fondant Cake',
    specialRequirements: 'Balloon sculpting artist, soft play area for toddlers, photo booth',
    rawPrompt:
      'Plan a 1st birthday party in Delhi for 80 guests with pastel fairytale theme and kid-friendly buffet.',
  },
  fest: {
    id: 'fest',
    eventType: 'college_fest',
    title: 'Horizon Cultural Odyssey 2027',
    location: 'Campus Amphitheatre, Pune',
    date: '2027-04-10',
    duration: '3-Day College Festival',
    guestCount: '1200',
    totalBudget: '1500000',
    theme: 'Neon Cyberpunk & Indie Fusion',
    foodPreferences: 'Street Food Bazaar, Food Trucks, Mocktail Bars',
    specialRequirements: 'Mainstage concert sound system, 100kW generator, artist green rooms',
    rawPrompt:
      'Plan a 3-day college cultural fest in Pune for 1200 students with concerts, food trucks, and competition stages.',
  },
};

// Safe TypeScript Type Guards
export function isEventType(val: string): val is EventType {
  return [
    'wedding',
    'birthday',
    'anniversary',
    'corporate',
    'college_fest',
    'community',
    'other',
  ].includes(val);
}

export function isRSVPStatus(val: string): val is RSVPStatus {
  return ['confirmed', 'pending', 'declined'].includes(val);
}

export function isVendorStatus(val: string): val is VendorStatus {
  return ['inquiry', 'shortlisted', 'contract_sent', 'booked', 'completed'].includes(val);
}

export function isCurrencyCode(val: string): val is CurrencyCode {
  return ['INR', 'USD', 'EUR', 'GBP'].includes(val);
}

