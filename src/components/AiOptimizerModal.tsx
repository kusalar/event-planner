'use client';

import React, { useState } from 'react';
import { useEventContext } from '@/context/EventContext';
import { Modal } from '@/components/ui/Modal';
import { X, Sparkles, TrendingDown, Check, ShieldAlert } from 'lucide-react';

interface AiOptimizerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiOptimizerModal: React.FC<AiOptimizerModalProps> = ({ isOpen, onClose }) => {
  const { currentEvent, budgetCategories, expenses, formatCurrency } = useEventContext();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen || !currentEvent) return null;

  // Compute category spend vs allocation
  const categoryStats = budgetCategories.map((cat) => {
    const spentInCat = expenses
      .filter((e) => e.categoryId === cat.id || e.categoryName.toLowerCase() === cat.name.toLowerCase())
      .reduce((sum, e) => sum + e.amount, 0);
    const ratio = cat.allocatedAmount > 0 ? (spentInCat / cat.allocatedAmount) * 100 : 0;
    return {
      ...cat,
      spent: spentInCat,
      ratio: Math.round(ratio),
      isHigh: ratio >= 75,
    };
  });

  const highSpendCategories = categoryStats.filter((c) => c.isHigh);

  // Dynamic tailored optimization items
  const recommendations = [
    {
      title: 'Smart Catering Optimization: Streamline Overlapping Counters',
      category: 'Catering',
      estimatedSavings: Math.round(currentEvent.totalBudget * 0.05),
      impact: 'High',
      advice: `For ${currentEvent.guestCount} guests, replace 2 niche dessert stations with a unified signature dessert counter (e.g., hot baked sweets + artisanal ice cream). This saves on redundant chef labor and specialized equipment rentals.`,
    },
    {
      title: 'Floral Design: Blend Local Seasonal Blooms with Reusable Lighting',
      category: 'Decoration',
      estimatedSavings: Math.round(currentEvent.totalBudget * 0.035),
      impact: 'Medium',
      advice: `Switch 40% of imported floral volume to locally grown seasonal marigolds, tuberoses, and fabric drapery with warm LED fairy lights. Creates a regal ambience while cutting wholesale flower transport premiums.`,
    },
    {
      title: 'Vendor Media Bundle Discount',
      category: 'Photography',
      estimatedSavings: Math.round(currentEvent.totalBudget * 0.02),
      impact: 'Medium',
      advice: 'Bundle candid photography, 4K documentary reels, and drone aerial coverage with a single studio agency rather than contracting separate freelancers to negotiate a package discount.',
    },
    {
      title: 'Eco-Friendly Digital Save-The-Dates & Web RSVP',
      category: 'Invitations',
      estimatedSavings: Math.round(currentEvent.totalBudget * 0.015),
      impact: 'Easy',
      advice: `Send interactive digital WhatsApp invitation videos with direct RSVP links to 80% of younger guests, reserving expensive physical letterpress boxed sets strictly for immediate elders and VIPs.`,
    },
  ];

  const totalPossibleSavings = recommendations.reduce((acc, curr) => acc + curr.estimatedSavings, 0);

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      titleId="ai-optimizer-modal-title"
      maxWidth="max-w-2xl"
      contentClassName="max-h-[90vh] overflow-y-auto"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close dialog"
        className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-pink-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 id="ai-optimizer-modal-title" className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Eventora AI Budget Optimizer</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800">
                Potential Savings: {formatCurrency(totalPossibleSavings)}
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Data-backed cost-reduction strategies for {currentEvent.title}
            </p>
          </div>
        </div>

        {/* High spend warnings if any */}
        {highSpendCategories.length > 0 && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-start space-x-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Watch Out:</span>{' '}
              {highSpendCategories.map((c) => `${c.name} (${c.ratio}% committed)`).join(', ')} is tracking near maximum
              capacity. Review the recommendations below to rebalance.
            </div>
          </div>
        )}

        {/* Strategy list */}
        <div className="space-y-3 my-4">
          {recommendations.map((rec, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 hover:border-violet-400 dark:hover:border-violet-600 transition-all text-xs"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded-md font-semibold text-[10px] bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300">
                    {rec.category}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">{rec.title}</span>
                </div>
                <div className="flex items-center space-x-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>Save ~{formatCurrency(rec.estimatedSavings)}</span>
                </div>
              </div>

              <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-3">{rec.advice}</p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <span className="text-[11px] text-slate-400">Impact: {rec.impact}</span>
                <button
                  onClick={() => handleCopy(`${rec.title}: ${rec.advice}`, idx)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors flex items-center space-x-1 text-[11px]"
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-500" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <span>Copy Strategy</span>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            Applying these optimizations can free up funds for photography or guest gifts.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold transition-colors shadow-lg shadow-violet-500/25"
          >
            Done
          </button>
        </div>
    </Modal>
  );
};

