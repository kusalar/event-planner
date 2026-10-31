-- EVENTORA AI: Supabase Database Schema
-- Run this in your Supabase SQL Editor to initialize your production database.

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  currency TEXT DEFAULT 'INR',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Events Table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  event_type TEXT NOT NULL,
  date DATE NOT NULL,
  duration TEXT DEFAULT '1 day',
  location TEXT NOT NULL,
  guest_count INTEGER NOT NULL,
  total_budget NUMERIC NOT NULL,
  currency TEXT DEFAULT 'INR',
  theme TEXT,
  food_preferences TEXT,
  special_requirements TEXT,
  raw_prompt TEXT,
  ai_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Budget Categories Table
CREATE TABLE IF NOT EXISTS public.budget_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  allocated_amount NUMERIC NOT NULL,
  color TEXT DEFAULT '#8b5cf6',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Expenses Table
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.budget_categories(id) ON DELETE SET NULL,
  category_name TEXT NOT NULL,
  title TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  paid_date DATE DEFAULT CURRENT_DATE,
  vendor_id UUID,
  receipt_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Timeline Tasks Table
CREATE TABLE IF NOT EXISTS public.timeline_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  phase TEXT NOT NULL, -- '6_months', '3_months', '1_month', '2_weeks', '1_week', 'event_day'
  deadline DATE NOT NULL,
  priority TEXT DEFAULT 'medium', -- 'high', 'medium', 'low'
  category TEXT DEFAULT 'general',
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Vendors Table
CREATE TABLE IF NOT EXISTS public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  quoted_price NUMERIC DEFAULT 0,
  advance_paid NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'inquiry', -- 'inquiry', 'shortlisted', 'contract_sent', 'booked', 'completed'
  rating INTEGER DEFAULT 5,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Guests Table
CREATE TABLE IF NOT EXISTS public.guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  rsvp_status TEXT DEFAULT 'pending', -- 'confirmed', 'declined', 'pending'
  dietary_preference TEXT DEFAULT 'standard',
  plus_ones INTEGER DEFAULT 0,
  table_assigned TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Ideas Table
CREATE TABLE IF NOT EXISTS public.ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- 'decor', 'menu', 'entertainment', 'gifts', 'photography'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Chat Messages Table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  sender TEXT NOT NULL, -- 'user' or 'ai'
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on ALL tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Drop any existing sample policies to ensure idempotency
DROP POLICY IF EXISTS "Users can manage own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can manage own events" ON public.events;
DROP POLICY IF EXISTS "Users can manage own budget categories" ON public.budget_categories;
DROP POLICY IF EXISTS "Users can manage own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can manage own timeline tasks" ON public.timeline_tasks;
DROP POLICY IF EXISTS "Users can manage own vendors" ON public.vendors;
DROP POLICY IF EXISTS "Users can manage own guests" ON public.guests;
DROP POLICY IF EXISTS "Users can manage own ideas" ON public.ideas;
DROP POLICY IF EXISTS "Users can manage own chat messages" ON public.chat_messages;

-- 1. Profiles Policy (Strict 1:1 user match)
CREATE POLICY "Users can manage own profile" ON public.profiles
  FOR ALL USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 2. Events Policy (Only event creator can read, insert, update, delete)
CREATE POLICY "Users can manage own events" ON public.events
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. Budget Categories Policy (Cascaded event ownership check)
CREATE POLICY "Users can manage own budget categories" ON public.budget_categories
  FOR ALL USING (event_id IN (SELECT id FROM public.events WHERE user_id = auth.uid()))
  WITH CHECK (event_id IN (SELECT id FROM public.events WHERE user_id = auth.uid()));

-- 4. Expenses Policy (Cascaded event ownership check)
CREATE POLICY "Users can manage own expenses" ON public.expenses
  FOR ALL USING (event_id IN (SELECT id FROM public.events WHERE user_id = auth.uid()))
  WITH CHECK (event_id IN (SELECT id FROM public.events WHERE user_id = auth.uid()));

-- 5. Timeline Tasks Policy (Cascaded event ownership check)
CREATE POLICY "Users can manage own timeline tasks" ON public.timeline_tasks
  FOR ALL USING (event_id IN (SELECT id FROM public.events WHERE user_id = auth.uid()))
  WITH CHECK (event_id IN (SELECT id FROM public.events WHERE user_id = auth.uid()));

-- 6. Vendors Policy (Cascaded event ownership check)
CREATE POLICY "Users can manage own vendors" ON public.vendors
  FOR ALL USING (event_id IN (SELECT id FROM public.events WHERE user_id = auth.uid()))
  WITH CHECK (event_id IN (SELECT id FROM public.events WHERE user_id = auth.uid()));

-- 7. Guests Policy (Cascaded event ownership check)
CREATE POLICY "Users can manage own guests" ON public.guests
  FOR ALL USING (event_id IN (SELECT id FROM public.events WHERE user_id = auth.uid()))
  WITH CHECK (event_id IN (SELECT id FROM public.events WHERE user_id = auth.uid()));

-- 8. Ideas Policy (Cascaded event ownership check)
CREATE POLICY "Users can manage own ideas" ON public.ideas
  FOR ALL USING (event_id IN (SELECT id FROM public.events WHERE user_id = auth.uid()))
  WITH CHECK (event_id IN (SELECT id FROM public.events WHERE user_id = auth.uid()));

-- 9. Chat Messages Policy (Cascaded event ownership check)
CREATE POLICY "Users can manage own chat messages" ON public.chat_messages
  FOR ALL USING (event_id IN (SELECT id FROM public.events WHERE user_id = auth.uid()))
  WITH CHECK (event_id IN (SELECT id FROM public.events WHERE user_id = auth.uid()));


