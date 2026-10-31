'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  ArrowRight,
  Wallet,
  Calendar,
  Users,
  ChevronRight,
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [promptInput, setPromptInput] = useState(
    'I want to organize a Bengali wedding in Kolkata for 300 guests with a budget of ₹8 lakh. I prefer traditional decorations, Bengali cuisine, and a 2-day celebration.'
  );

  const samplePrompts = [
    {
      label: 'Bengali Royal Wedding (Kolkata)',
      text: 'I want to organize a Bengali wedding in Kolkata for 300 guests with a budget of ₹8 lakh. I prefer traditional decorations, Bengali cuisine, and a 2-day celebration.',
    },
    {
      label: 'Corporate AI Summit (Bengaluru)',
      text: 'Organize a premier single-day AI Developer Summit in Bengaluru for 450 tech professionals with a budget of ₹12 lakh, keynotes, live demo pods, and continental catering.',
    },
    {
      label: '1st Birthday Fairytale (Delhi)',
      text: 'Plan a magical fairytale theme 1st birthday party in South Delhi for 80 guests with ₹2.5 lakh budget, balloon artistry, magician, and dessert bar.',
    },
    {
      label: 'Silver Jubilee Anniversary (Mumbai)',
      text: 'Plan a 25th Silver Jubilee wedding anniversary in Mumbai for 150 guests with ₹5 lakh budget, sunset rooftop venue, live acoustic ghazals, and gourmet buffet.',
    },
  ];

  const handleLaunchWizard = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('eventora_prefilled_prompt', promptInput);
    }
    router.push('/create');
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-slate-100 overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-100px] left-1/4 w-[500px] h-[500px] bg-violet-600/15 dark:bg-violet-600/20 blur-[130px] rounded-full" />
        <div className="absolute top-[-50px] right-1/4 w-[450px] h-[450px] bg-pink-500/15 dark:bg-pink-500/20 blur-[140px] rounded-full" />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center">
        {/* Top Announcement Pill */}
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-violet-100 dark:bg-violet-950/60 border border-violet-200 dark:border-violet-800/80 text-violet-700 dark:text-violet-300 text-xs font-semibold mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
          <span>GENAI-POWERED SMART EVENT PLANNING ASSISTANT</span>
          <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
          <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">24/7 Intelligent Director</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-5xl mx-auto leading-[1.15] mb-6 text-slate-950 dark:text-white">
          Turn Any Event Dream into a{' '}
          <span className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-500 dark:from-violet-400 dark:via-fuchsia-400 dark:to-pink-400 bg-clip-text text-transparent">
            Flawless Master Plan
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg lg:text-xl text-slate-700 dark:text-slate-200 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
          From grand Indian weddings and tech summits to milestone birthdays — Eventora AI transforms your natural
          language vision into tailored budgets, 6-month timelines, vendor checklists, and 24/7 conversational advice.
        </p>

        {/* Natural Language Prompt Tryout Box */}
        <div className="max-w-3xl mx-auto mb-6 p-2 rounded-2xl glass-card shadow-2xl border border-slate-200 dark:border-slate-800 text-left">
          <div className="p-3">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-medium">
              <span className="flex items-center space-x-1.5 text-violet-600 dark:text-violet-400 font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Express AI Event Prompt</span>
              </span>
              <span>Try natural language in any detail</span>
            </div>
            <textarea
              rows={3}
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder="Describe your event (e.g. Wedding, Birthday, Budget, Location, Guests, Food preferences...)"
              className="w-full text-sm bg-transparent outline-none resize-none text-slate-900 dark:text-white placeholder-slate-400 font-normal"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-2 bg-slate-50/80 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800/80">
            <div className="text-[11px] text-slate-500 dark:text-slate-400 pl-2">
              ⚡ Analyzed by Gemini AI into structured budgets, timelines & vendors
            </div>
            <button
              onClick={handleLaunchWizard}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 text-white text-xs font-bold shadow-lg shadow-violet-500/25 flex items-center justify-center space-x-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Generate Event Plan with AI</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sample Prompt Chips */}
        <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-center gap-2 mb-12">
          <span className="text-xs text-slate-400 font-medium mr-1">Quick ideas:</span>
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => setPromptInput(p.text)}
              className="text-[11px] px-3 py-1 rounded-full bg-white dark:bg-slate-800 hover:bg-violet-50 dark:hover:bg-violet-950/40 text-slate-600 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 border border-slate-200 dark:border-slate-700 transition-colors shadow-sm"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Primary CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <Link
            href="/dashboard"
            className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold shadow-xl shadow-violet-500/25 flex items-center space-x-2 transition-all"
          >
            <span>Explore Active Dashboard</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
          <Link
            href="/create"
            className="px-6 py-3 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-semibold border border-slate-200 dark:border-slate-800 shadow-sm transition-all"
          >
            Open Plan Wizard
          </Link>
        </div>

        {/* Product UI Preview Mockup */}
        <div className="relative max-w-5xl mx-auto rounded-2xl glass-card p-3 sm:p-5 shadow-2xl border border-slate-200 dark:border-slate-800 text-left">
          {/* Mock Window Top Bar */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-slate-800 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="ml-2 font-mono text-[11px] text-slate-400">eventora.ai/dashboard/bengali-wedding</span>
            </div>
            <div className="flex items-center space-x-2 text-[11px] text-emerald-500 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>AI Director Live</span>
            </div>
          </div>

          {/* Mock Dashboard Body */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Metric 1 */}
            <div className="p-4 rounded-xl bg-violet-50/50 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/40">
              <span className="text-[11px] font-semibold text-violet-600 dark:text-violet-400">Total Event Budget</span>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">₹8,00,000</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-2">
                ₹1,70,000 paid advances • ₹6,30,000 remaining
              </div>
            </div>

            {/* Metric 2 */}
            <div className="p-4 rounded-xl bg-pink-50/50 dark:bg-pink-950/20 border border-pink-100 dark:border-pink-900/40">
              <span className="text-[11px] font-semibold text-pink-600 dark:text-pink-400">Timeline Milestones</span>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">37% Done</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-2">
                3 of 8 critical deliverables completed
              </div>
            </div>

            {/* Metric 3 */}
            <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Vendor Commitments</span>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">4 Booked</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-2">
                Venue, Caterer, Photo & Decor locked
              </div>
            </div>
          </div>

          {/* Quick AI Tip Ribbon */}
          <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-violet-600/10 via-purple-600/10 to-pink-500/10 border border-violet-500/20 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs">
              <Sparkles className="w-4 h-4 text-violet-500" />
              <span className="text-slate-700 dark:text-slate-300 font-medium">
                <strong>Eventora AI Suggestion:</strong> Replaced exotic blooms with local marigolds — saved ₹28,000 in
                decor budget.
              </span>
            </div>
            <Link
              href="/budget"
              className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline flex items-center space-x-1"
            >
              <span>View Budget</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4 Pillars Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-slate-200 dark:border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 mb-2">
            The Eventora AI Advantage
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Everything You Need to Orchestrate Extraordinary Events
          </h3>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-3">
            Traditional spreadsheets create anxiety. Eventora AI gives you an autonomous production team in your pocket.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pillar 1 */}
          <div className="p-6 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 hover:border-violet-500/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">GenAI Event Architect</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Describe in plain English or regional terms. Gemini analyzes cultural nuances, dietary preferences, and
              budget scales into an exhaustive production blueprint.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="p-6 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 hover:border-pink-500/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Wallet className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">Dynamic Budget Manager</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Category allocations across venue, catering, decor, and photography with real expense tracking. Features an
              AI Budget Optimizer that surfaces 15-20% cost savings.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="p-6 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 hover:border-purple-500/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Calendar className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">6-Month Phased Timeline</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Automated milestone countdowns from 6 months before to event morning. Interactive task calendars, priority
              badges, and completion celebration streaks.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="p-6 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">Vendor OS & AI Checklists</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Manage quotes, advance deposits, and contracts. Equipped with GenAI interview checklists of questions to
              ask before signing any vendor.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full bg-slate-100/50 dark:bg-slate-900/30 rounded-3xl my-8 border border-slate-200 dark:border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400">
            Frictionless Process
          </span>
          <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">How Eventora AI Works</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="p-6 rounded-2xl glass-card text-center relative">
            <div className="w-10 h-10 rounded-full bg-violet-600 text-white font-bold flex items-center justify-center mx-auto mb-4 text-sm shadow-lg shadow-violet-500/30">
              1
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-base mb-2">Input Your Vision</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Specify your budget, guest scale, event date, and cultural cuisine or simply paste a natural language story.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-card text-center relative">
            <div className="w-10 h-10 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center mx-auto mb-4 text-sm shadow-lg shadow-purple-500/30">
              2
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-base mb-2">Gemini Synthesizes</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              In seconds, GenAI computes category budgets, structures chronologically phased tasks, and formulates vendor specs.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-card text-center relative">
            <div className="w-10 h-10 rounded-full bg-pink-600 text-white font-bold flex items-center justify-center mx-auto mb-4 text-sm shadow-lg shadow-pink-500/30">
              3
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-base mb-2">Execute & Chat 24/7</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Log payments, check off milestones, generate custom WhatsApp invites, and ask the AI assistant questions anytime.
            </p>
          </div>
        </div>
      </section>

      {/* Social Proof & Metrics */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl glass-card">
            <div className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-transparent">
              15,000+
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Events Planned</div>
          </div>
          <div className="p-6 rounded-2xl glass-card">
            <div className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-transparent">
              ₹42 Cr+
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Budgets Optimized</div>
          </div>
          <div className="p-6 rounded-2xl glass-card">
            <div className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-transparent">
              99.4%
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">On-Time Execution</div>
          </div>
          <div className="p-6 rounded-2xl glass-card">
            <div className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-transparent">
              24/7
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">AI Director Availability</div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full text-center">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-tr from-violet-900/60 via-purple-900/40 to-pink-900/40 border border-violet-500/30 glass-card relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/20 blur-3xl rounded-full pointer-events-none" />
          <h3 className="text-2xl sm:text-4xl font-extrabold text-white mb-4">
            Ready to Plan Your Next Unforgettable Event?
          </h3>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto mb-8">
            Experience the future of event management. Free to use with sample curated intelligence or connect your
            Gemini API key for real-time model synthesis.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/create"
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white font-bold text-sm shadow-xl shadow-purple-500/30 transition-all flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch Eventora AI Planner</span>
            </Link>
            <Link
              href="/dashboard"
              className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-all"
            >
              Explore Sample Bengali Wedding
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
