# Eventora AI — GenAI-Powered Smart Event Planning Assistant

> A modern, production-quality web application built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS**, **Recharts**, **Framer Motion**, **Google Gemini AI**, and **Supabase (PostgreSQL)**.

---

## 🌟 Overview & Core Concept

**Eventora AI** is an intelligent 24/7 event planning operating system. Users describe their event in natural language (for example: *"I want to organize a Bengali wedding in Kolkata for 300 guests with a budget of ₹8 lakh. I prefer traditional decorations, Bengali cuisine, and a 2-day celebration"*), and the AI transforms the prompt into an actionable, structured event master plan:

1. **Executive Event Summary** & Cultural Thematic Vision
2. **Category-Wise Budget Distribution** (Venue, Catering, Decor, Photography, Music, Invitations, Contingency)
3. **6-Month Chronological Timeline** (6M, 3M, 1M, 2W, 1W, Event Day)
4. **Required Vendors Hub** with budgets, booking windows, and **AI Interview Checklists**
5. **Catering & Menu Recommendations** (Welcome canapés, main banquet, artisanal desserts)
6. **Creative Ideas Studio** (Decor, entertainment, gifts, photography concepts)
7. **24/7 Conversational Planning Assistant** with live event context memory
8. **Smart Budget Optimizer** suggesting concrete cost-saving alternatives
9. **Guest & RSVP Management** with table assignments and dietary tracking
10. **AI Invitation Generator** in multiple cultural and modern tones

---

## 🚀 Technology Stack

- **Framework:** Next.js 16 (React 19, TypeScript, App Router)
- **Styling:** Tailwind CSS (Soft lavender, violet, gradients, glassmorphism, Dark/Light modes)
- **Charts & Visualizations:** Recharts (Interactive Pie & Bar charts)
- **Icons & Polish:** Lucide React & Canvas-Confetti
- **Generative AI:** Google Gemini API (`@google/genai`)
- **Database & Auth:** Supabase PostgreSQL with Row Level Security (RLS) policies
- **Local Persistence:** Dual-engine architecture with reactive local-storage fallback for offline/demo mode

---

## 📁 Project Structure

```
d:\event planner
├── src
│   ├── app
│   │   ├── api
│   │   │   └── gemini
│   │   │       ├── generate-plan/route.ts  # Structured JSON GenAI Event Plan
│   │   │       ├── chat/route.ts           # Context-Aware Conversational Assistant
│   │   │       └── invitation/route.ts     # Personalized Card & WhatsApp Invites
│   │   ├── auth/page.tsx                   # Auth & Instant Demo Switcher
│   │   ├── budget/page.tsx                 # Recharts Budget & Expense Tracker
│   │   ├── chat/page.tsx                   # 24/7 AI Event Assistant
│   │   ├── create/page.tsx                 # AI Event Creation Wizard
│   │   ├── dashboard/page.tsx              # Central Management Dashboard
│   │   ├── guests/page.tsx                 # Guest List & RSVP Manager
│   │   ├── ideas/page.tsx                  # Creative Ideation Studio
│   │   ├── plan/page.tsx                   # AI Blueprint Review & PDF Export
│   │   ├── settings/page.tsx               # Gemini Key, Currency, Reset & Supabase
│   │   ├── timeline/page.tsx               # 6-Month Phased Milestones & Calendar
│   │   ├── vendors/page.tsx                # Vendor Hub & AI Checklists
│   │   ├── layout.tsx                      # Root Layout & EventProvider
│   │   ├── page.tsx                        # Landing Page
│   │   └── globals.css                     # Tailwind CSS & Theme Tokens
│   ├── components
│   │   ├── Navbar.tsx                      # Brand, Event Switcher, Currency, Theme
│   │   ├── Footer.tsx                      # Tech Stack & Quick Links
│   │   ├── ExpenseModal.tsx                # Expense Entry Modal
│   │   ├── TaskModal.tsx                   # Timeline Milestone Modal
│   │   ├── VendorModal.tsx                 # Vendor Contract Modal
│   │   ├── GuestModal.tsx                  # Guest & RSVP Entry Modal
│   │   ├── AiOptimizerModal.tsx            # AI Budget Cost-Cutting Engine
│   │   └── InvitationModal.tsx             # Multi-Tone Invitation Generator
│   ├── context
│   │   └── EventContext.tsx                # Reactive Global State Store & CRUD
│   ├── lib
│   │   ├── gemini.ts                       # Gemini API & Curated Intelligence
│   │   ├── mockData.ts                     # Pre-seeded Realistic Events
│   │   └── supabase.ts                     # Supabase Client Wrapper
│   └── types
│       └── index.ts                        # TypeScript Schemas & Interfaces
├── supabase
│   └── schema.sql                          # Full SQL Migration & RLS Policies
├── test-endpoints.mjs                      # Automated Server Verification Test
└── package.json
```

---

## 🛠️ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables (Optional)
Create `.env.local`:
```env
# Google Gemini API Key (optional for live AI synthesis)
GEMINI_API_KEY="your-gemini-api-key"

# Supabase PostgreSQL Database (optional for cloud database sync)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

> **Demo Mode Guarantee:** If an API key is not provided, Eventora AI operates in clearly labeled **Demo Mode (Curated Intelligence)** with authentic, mathematically calibrated sample data. You can also paste your Gemini API key anytime right inside the **Settings** page!

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 🧪 Testing

Run the automated endpoint verification test suite:
```bash
node test-endpoints.mjs
```
Expected output:
- `✓ [GET /] Status: 200`
- `✓ [POST /api/gemini/generate-plan] Status: 200`
- `✓ [POST /api/gemini/chat] Status: 200`
- `✓ [POST /api/gemini/invitation] Status: 200`
