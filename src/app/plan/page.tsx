'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEventContext } from '@/context/EventContext';
import {
  Sparkles,
  Wallet,
  Calendar,
  Users,
  Utensils,
  Lightbulb,
  CheckCircle2,
  Printer,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { GeneratedPlanResponse, EventItem } from '@/types';

export default function PlanReviewPage() {
  const router = useRouter();
  const { createEventFromPlan, formatCurrency } = useEventContext();

  const [planData] = useState<{
    eventData: EventItem;
    plan: GeneratedPlanResponse;
  } | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('eventora_latest_plan');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error('Failed to parse plan data:', e);
        }
      }
    }
    return null;
  });

  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (planData) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  }, [planData]);

  if (!planData) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <Sparkles className="w-12 h-12 text-violet-500 mb-3 animate-pulse" />
        <h2 className="text-xl font-bold mb-2">No Generated Plan Found</h2>
        <p className="text-xs text-slate-500 mb-4">Launch our AI Event Generator wizard to create a new blueprint.</p>
        <Link
          href="/create"
          className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs"
        >
          Go to Event Wizard
        </Link>
      </div>
    );
  }

  const { eventData, plan } = planData;

  const handleSaveToWorkspace = () => {
    setSaving(true);
    // Create in global context
    createEventFromPlan(eventData, plan);
    // Trigger big confetti
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 },
    });
    setTimeout(() => {
      setSaving(false);
      router.push('/dashboard');
    }, 600);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const text = `EVENTORA AI MASTER PLAN: ${eventData.title}\nBudget: ₹${eventData.totalBudget.toLocaleString(
      'en-IN'
    )}\nLocation: ${eventData.location}\nDate: ${eventData.date}\nGuests: ${
      eventData.guestCount
    }\n\nSummary:\n${plan.event_summary}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full print:p-0 print:bg-white print:text-black">
      {/* Top Banner & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 print:hidden">
        <div>
          <div className="flex items-center space-x-2 text-xs text-violet-600 dark:text-violet-400 font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Master Event Blueprint</span>
            <span className="text-slate-400">•</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                plan.isDemoMode
                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                  : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              }`}
            >
              {plan.isDemoMode ? '⚡ Demo Mode (Curated Intelligence)' : '✨ Live Gemini Model Synthesis'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {eventData.title}
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>
          <button
            onClick={handleCopySummary}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Share'}</span>
          </button>
          <button
            onClick={handleSaveToWorkspace}
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 text-white text-xs font-bold shadow-lg shadow-violet-500/25 flex items-center space-x-1.5 transition-all hover:scale-105"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{saving ? 'Activating Workspace...' : 'Save & Open in Dashboard'}</span>
          </button>
        </div>
      </div>

      {/* Printable Title Block */}
      <div className="hidden print:block mb-6 border-b pb-4">
        <h1 className="text-2xl font-bold">{eventData.title}</h1>
        <p className="text-sm text-gray-600">
          {eventData.location} • {eventData.date} • {eventData.guestCount} Guests • Budget: ₹
          {eventData.totalBudget.toLocaleString('en-IN')}
        </p>
      </div>

      {/* Executive Summary Card */}
      <div className="p-6 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 mb-6">
        <div className="flex items-center space-x-2 text-violet-600 dark:text-violet-400 font-bold text-xs mb-2">
          <Sparkles className="w-4 h-4" />
          <span>Executive Event Overview</span>
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">{plan.event_summary}</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          <div>
            <span className="text-slate-400 text-[11px] block">Location</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{eventData.location}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">Event Date</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {new Date(eventData.date).toLocaleDateString()}
            </span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">Guests</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{eventData.guestCount} Attendees</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">Total Budget</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(eventData.totalBudget)}
            </span>
          </div>
        </div>
      </div>

      {/* Budget Breakdown Table */}
      <div className="p-6 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 font-bold text-sm text-slate-900 dark:text-white">
            <Wallet className="w-4 h-4 text-violet-500" />
            <span>AI Budget Distribution</span>
          </div>
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
            Total: {formatCurrency(plan.budget.total)}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold">
                <th className="pb-2.5">Category</th>
                <th className="pb-2.5">Scope Description</th>
                <th className="pb-2.5 text-right">Allocation</th>
                <th className="pb-2.5 text-right">% of Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {plan.budget.categories.map((cat, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                  <td className="py-2.5 font-bold text-slate-800 dark:text-slate-200">{cat.name}</td>
                  <td className="py-2.5 text-slate-500 dark:text-slate-400 max-w-xs">{cat.description || '-'}</td>
                  <td className="py-2.5 font-bold text-slate-900 dark:text-white text-right">
                    {formatCurrency(cat.estimated_cost)}
                  </td>
                  <td className="py-2.5 text-slate-500 dark:text-slate-400 text-right">
                    {cat.percentage ? `${cat.percentage}%` : `${Math.round((cat.estimated_cost / plan.budget.total) * 100)}%`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommended Timeline Milestones */}
      <div className="p-6 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 mb-6">
        <div className="flex items-center space-x-2 font-bold text-sm text-slate-900 dark:text-white mb-4">
          <Calendar className="w-4 h-4 text-pink-500" />
          <span>Recommended Phased Timeline</span>
        </div>

        <div className="space-y-3">
          {plan.timeline.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-slate-900 dark:text-white">{item.task}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold ${
                      item.priority === 'high'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                    }`}
                  >
                    {item.priority}
                  </span>
                </div>
                {item.description && <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.description}</p>}
              </div>
              <div className="text-right text-[11px] text-slate-400 flex-shrink-0">
                <span>Deadline: {new Date(item.deadline).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Required Vendors Specifications */}
      <div className="p-6 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 mb-6">
        <div className="flex items-center space-x-2 font-bold text-sm text-slate-900 dark:text-white mb-4">
          <Users className="w-4 h-4 text-emerald-500" />
          <span>Vendors to Hire & Interview Checklists</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plan.vendors_required.map((v, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white text-sm">{v.category}</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  ~{formatCurrency(v.estimated_budget)}
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-[11px]">{v.specs}</p>

              {v.key_questions_to_ask && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <span className="text-[10px] uppercase font-bold text-violet-500 block mb-1">
                    Questions to ask before booking:
                  </span>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                    {v.key_questions_to_ask.map((q, qIdx) => (
                      <li key={qIdx}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Food Recommendations */}
      {plan.food_recommendations && (
        <div className="p-6 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 mb-6">
          <div className="flex items-center space-x-2 font-bold text-sm text-slate-900 dark:text-white mb-4">
            <Utensils className="w-4 h-4 text-amber-500" />
            <span>Catering & Menu Recommendations</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plan.food_recommendations.map((menu, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-xs"
              >
                <div className="font-bold text-slate-900 dark:text-white mb-2">{menu.course}</div>
                <ul className="space-y-1 mb-2 text-slate-600 dark:text-slate-300">
                  {menu.items.map((item, iIdx) => (
                    <li key={iIdx} className="flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">{menu.highlight}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Creative Ideas */}
      <div className="p-6 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 mb-6">
        <div className="flex items-center space-x-2 font-bold text-sm text-slate-900 dark:text-white mb-4">
          <Lightbulb className="w-4 h-4 text-purple-500" />
          <span>Curated Creative Ideas</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {plan.creative_ideas.map((idea, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-xs"
            >
              <div className="font-bold text-slate-900 dark:text-white mb-1">{idea.title}</div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{idea.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations & Reminders */}
      <div className="p-6 rounded-2xl bg-violet-50/60 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-900/40 text-xs">
        <div className="font-bold text-slate-900 dark:text-white text-sm mb-2">Important Reminders & Director Tips</div>
        <ul className="space-y-1.5 text-slate-600 dark:text-slate-300">
          {plan.recommendations.map((rec, idx) => (
            <li key={idx} className="flex items-start space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-violet-500 flex-shrink-0 mt-0.5" />
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Floating Bottom Bar for Action */}
      <div className="sticky bottom-4 mt-8 p-3 rounded-2xl glass-card border border-violet-500/30 shadow-2xl flex items-center justify-between print:hidden">
        <Link
          href="/create"
          className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center space-x-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Edit Criteria</span>
        </Link>
        <button
          onClick={handleSaveToWorkspace}
          disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 text-white text-xs font-bold shadow-xl shadow-purple-500/25 flex items-center space-x-2 transition-all hover:scale-105"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{saving ? 'Activating...' : 'Save & Open in Dashboard'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

