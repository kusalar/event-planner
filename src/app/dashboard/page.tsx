'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useEventContext } from '@/context/EventContext';
import {
  Sparkles,
  Wallet,
  CheckCircle2,
  Users,
  MessageSquare,
  Plus,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  ChevronRight,
  MapPin,
  CalendarDays,
  CheckSquare,
  Gift,
} from 'lucide-react';
import { ExpenseModal } from '@/components/ExpenseModal';
import { TaskModal } from '@/components/TaskModal';
import { VendorModal } from '@/components/VendorModal';
import { AiOptimizerModal } from '@/components/AiOptimizerModal';
import { InvitationModal } from '@/components/InvitationModal';

export default function DashboardPage() {
  const {
    currentEvent,
    events,
    userProfile,
    formatCurrency,
    totalSpent,
    remainingBudget,
    budgetProgressPercentage,
    taskCompletionPercentage,
    completedTasksCount,
    totalTasksCount,
    bookedVendorsCount,
    timelineTasks,
    vendors,
    budgetCategories,
    isLiveAiAvailable,
  } = useEventContext();

  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [vendorModalOpen, setVendorModalOpen] = useState(false);
  const [optimizerModalOpen, setOptimizerModalOpen] = useState(false);
  const [invitationModalOpen, setInvitationModalOpen] = useState(false);
  const [greeting] = useState(() => {
    if (typeof window === 'undefined') return 'Welcome';
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  });

  const [daysRemaining] = useState(() => {
    if (typeof window === 'undefined' || !currentEvent?.date) return 106;
    const eventDateObj = new Date(currentEvent.date);
    const now = new Date();
    const diffTime = eventDateObj.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  });

  if (!currentEvent) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <Sparkles className="w-12 h-12 text-violet-500 mb-3 animate-bounce" />
        <h2 className="text-xl font-bold mb-2">No Active Event Selected</h2>
        <p className="text-xs text-slate-500 mb-4">Create your first event using our AI Event Generator wizard.</p>
        <Link
          href="/create"
          className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs"
        >
          Plan an Event with AI
        </Link>
      </div>
    );
  }

  const pendingTasks = timelineTasks.filter((t) => !t.isCompleted).slice(0, 4);

  return (
    <div className="flex-1 bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* Top Welcome & Event Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center space-x-2 text-xs text-violet-600 dark:text-violet-400 font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {greeting}, {userProfile.name}
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500 dark:text-slate-400 font-normal">
              Managing {events.length} active event{events.length > 1 ? 's' : ''}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>{currentEvent.title}</span>
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-2">
            <span className="flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-violet-500" />
              <span>{currentEvent.location}</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <CalendarDays className="w-3.5 h-3.5 text-pink-500" />
              <span>
                {new Date(currentEvent.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}{' '}
                ({daysRemaining} days to go)
              </span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <Users className="w-3.5 h-3.5 text-emerald-500" />
              <span>{currentEvent.guestCount} Guests</span>
            </span>
          </div>
        </div>

        {/* Quick Top Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setExpenseModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-md shadow-violet-500/20 flex items-center space-x-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Expense</span>
          </button>
          <button
            onClick={() => setTaskModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-all flex items-center space-x-1.5"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Add Milestone</span>
          </button>
          <Link
            href="/create"
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-all flex items-center space-x-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-500" />
            <span>New Plan</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid (4 Metrics Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Metric 1: Total Budget */}
        <div className="p-5 rounded-2xl glass-card border border-slate-200 dark:border-slate-800/80 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-200 mb-2 font-semibold">
            <span>Total Planned Budget</span>
            <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-300 flex items-center justify-center font-bold">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-950 dark:text-white tracking-tight mt-1">
            {formatCurrency(currentEvent.totalBudget)}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 font-medium">
            <span>Allocated in {budgetCategories.length} categories</span>
            <Link href="/budget" className="text-violet-600 dark:text-violet-400 font-bold hover:underline">
              Manage →
            </Link>
          </div>
        </div>

        {/* Metric 2: Actual Spent & Progress */}
        <div className="p-5 rounded-2xl glass-card border border-slate-200 dark:border-slate-800/80 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-200 mb-2 font-semibold">
            <span>Expenses Committed</span>
            <div className="w-8 h-8 rounded-xl bg-pink-100 dark:bg-pink-900/50 text-pink-600 dark:text-pink-300 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-rose-600 dark:text-rose-300 tracking-tight mt-1">
            {formatCurrency(totalSpent)}
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300 font-medium mb-1.5">
              <span>{budgetProgressPercentage}% of total budget</span>
              <span>Rem: {formatCurrency(remainingBudget)}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  budgetProgressPercentage > 90
                    ? 'bg-rose-500'
                    : budgetProgressPercentage > 75
                    ? 'bg-amber-500'
                    : 'bg-gradient-to-r from-violet-600 to-pink-500'
                }`}
                style={{ width: `${Math.min(100, budgetProgressPercentage)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Metric 3: Timeline Progress */}
        <div className="p-5 rounded-2xl glass-card border border-slate-200 dark:border-slate-800/80 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-200 mb-2 font-semibold">
            <span>Task Completion</span>
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-violet-600 dark:text-violet-300 tracking-tight mt-1">
            {taskCompletionPercentage}%
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300 font-medium mb-1.5">
              <span>
                {completedTasksCount} of {totalTasksCount} milestones completed
              </span>
              <Link href="/timeline" className="text-violet-600 dark:text-violet-400 font-bold hover:underline">
                View →
              </Link>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${Math.min(100, taskCompletionPercentage)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Metric 4: Booked Vendors */}
        <div className="p-5 rounded-2xl glass-card border border-slate-200 dark:border-slate-800/80 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-200 mb-2 font-semibold">
            <span>Vendor Bookings</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-300 tracking-tight mt-1">
            {bookedVendorsCount}{' '}
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">/ {vendors.length} Total</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 font-medium">
            <span>
              {vendors.filter((v) => v.status === 'inquiry').length} inquiry pending
            </span>
            <Link href="/vendors" className="text-violet-600 dark:text-violet-400 font-bold hover:underline">
              Vendor OS →
            </Link>
          </div>
        </div>
      </div>

      {/* AI Intelligence Spotlight Banner */}
      <div className="mb-8 p-5 rounded-2xl bg-gradient-to-r from-violet-600/10 via-purple-600/10 to-pink-500/10 border border-violet-500/25 glass-card relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-pink-500 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm text-slate-900 dark:text-white">Eventora AI Director Insights</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 font-semibold">
                  {isLiveAiAvailable ? 'Active Gemini Model' : 'Curated Intelligence'}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {currentEvent.aiSummary}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 flex-shrink-0">
            <button
              onClick={() => setOptimizerModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 text-xs font-semibold shadow-sm transition-all flex items-center space-x-1.5"
            >
              <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />
              <span>Optimize Budget</span>
            </button>
            <button
              onClick={() => setInvitationModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-md shadow-violet-500/25 transition-all flex items-center space-x-1.5"
            >
              <Gift className="w-3.5 h-3.5" />
              <span>AI Invitations</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Split Grid: Upcoming Critical Milestones & Key Vendors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left 2 Cols: Critical Milestones */}
        <div className="lg:col-span-2 p-6 rounded-2xl glass-card border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Upcoming Critical Milestones</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Scheduled chronologically based on event date</p>
            </div>
            <Link
              href="/timeline"
              className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline flex items-center space-x-1"
            >
              <span>Full Timeline</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {pendingTasks.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                🎉 All scheduled timeline tasks for this event are complete!
              </div>
            ) : (
              pendingTasks.map((t) => (
                <div
                  key={t.id}
                  className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40 hover:bg-violet-50/50 dark:hover:bg-violet-950/20 transition-all flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-start space-x-3">
                    <span
                      className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                        t.priority === 'high' ? 'bg-rose-500' : t.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                    />
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{t.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Category: {t.category} • Deadline: {new Date(t.deadline).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                      t.priority === 'high'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                    }`}
                  >
                    {t.priority}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right 1 Col: Quick AI Assistant Prompt */}
        <div className="p-6 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-violet-600 dark:text-violet-400 font-bold text-xs mb-2">
              <MessageSquare className="w-4 h-4" />
              <span>24/7 AI Planning Concierge</span>
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
              Have questions about your event?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              Your AI assistant is pre-loaded with every detail of {currentEvent.title}. Ask for cost reductions, decor
              ideas, or catering menus.
            </p>

            <div className="space-y-2 mb-4">
              <Link
                href="/chat"
                className="block p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-violet-50 dark:hover:bg-violet-950/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 transition-colors"
              >
                💡 &quot;How can I reduce expenses by 15%?&quot;
              </Link>
              <Link
                href="/chat"
                className="block p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-violet-50 dark:hover:bg-violet-950/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 transition-colors"
              >
                🎨 &quot;Suggest a decoration theme for my venue&quot;
              </Link>
            </div>
          </div>

          <Link
            href="/chat"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 text-white font-bold text-xs shadow-md shadow-violet-500/20 text-center flex items-center justify-center space-x-2 transition-all"
          >
            <span>Open AI Chat Assistant</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Modals */}
      <ExpenseModal isOpen={expenseModalOpen} onClose={() => setExpenseModalOpen(false)} />
      <TaskModal isOpen={taskModalOpen} onClose={() => setTaskModalOpen(false)} />
      <VendorModal isOpen={vendorModalOpen} onClose={() => setVendorModalOpen(false)} />
      <AiOptimizerModal isOpen={optimizerModalOpen} onClose={() => setOptimizerModalOpen(false)} />
      <InvitationModal isOpen={invitationModalOpen} onClose={() => setInvitationModalOpen(false)} />
    </div>
  );
}

