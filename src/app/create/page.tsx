'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEventContext } from '@/context/EventContext';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { EventType } from '@/types';
import { EVENT_PRESETS, EventPreset } from '@/data/eventPresets';

export default function CreateEventPage() {
  const router = useRouter();
  const { userProfile, geminiApiKey } = useEventContext();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingStepText, setLoadingStepText] = useState('');

  // Read any prefilled prompt passed from Landing Page
  const [prefilledData] = useState(() => {
    if (typeof window !== 'undefined') {
      const prefilled = sessionStorage.getItem('eventora_prefilled_prompt');
      if (prefilled) {
        const lower = prefilled.toLowerCase();
        if (lower.includes('bengali') || lower.includes('wedding')) {
          return {
            rawPrompt: prefilled,
            eventType: 'wedding' as EventType,
            title: 'Bengali Royal Wedding',
            location: 'Kolkata, West Bengal',
            guestCount: '300',
            totalBudget: '800000',
            duration: '2-Day Celebration',
          };
        } else if (lower.includes('tech') || lower.includes('summit')) {
          return {
            rawPrompt: prefilled,
            eventType: 'corporate' as EventType,
            title: 'Annual Tech Innovation Summit',
            location: 'Bengaluru, Karnataka',
            guestCount: '400',
            totalBudget: '1000000',
            duration: 'Full Day (9 AM - 6 PM)',
          };
        }
        return { rawPrompt: prefilled };
      }
    }
    return null;
  });

  // Form Fields
  const [eventType, setEventType] = useState<EventType>(prefilledData?.eventType || 'wedding');
  const [title, setTitle] = useState(prefilledData?.title || '');
  const [date, setDate] = useState('2027-02-14');
  const [duration, setDuration] = useState(prefilledData?.duration || '2-Day Celebration');
  const [location, setLocation] = useState(prefilledData?.location || 'Kolkata, West Bengal');
  const [guestCount, setGuestCount] = useState(prefilledData?.guestCount || '300');
  const [totalBudget, setTotalBudget] = useState(prefilledData?.totalBudget || '800000');
  const [theme, setTheme] = useState('Traditional Rajbari Heritage with Terracotta & Marigold');
  const [foodPreferences, setFoodPreferences] = useState('Authentic Bengali Feast (Bhetki Paturi, Kosha Mangsho, Mishti Doi)');
  const [specialRequirements, setSpecialRequirements] = useState('Eco-friendly earthen pottery, live Shehnai and Baul ensemble');
  const [rawPrompt, setRawPrompt] = useState(prefilledData?.rawPrompt || '');

  // Quick Preset Templates
  const handleApplyPreset = (presetType: EventPreset['id']) => {
    const preset = EVENT_PRESETS[presetType];
    if (!preset) return;

    setEventType(preset.eventType);
    setTitle(preset.title);
    setLocation(preset.location);
    setDate(preset.date);
    setDuration(preset.duration);
    setGuestCount(preset.guestCount);
    setTotalBudget(preset.totalBudget);
    setTheme(preset.theme);
    setFoodPreferences(preset.foodPreferences);
    setSpecialRequirements(preset.specialRequirements);
    setRawPrompt(preset.rawPrompt);
  };

  const handleGeneratePlan = async () => {
    if (!title || !location || !totalBudget || !guestCount) {
      alert('Please fill in the required fields (Title, Location, Guests, Budget).');
      return;
    }

    setLoading(true);

    // Step-by-step visual animation ticker
    const steps = [
      'Analyzing cultural traditions & event parameters...',
      'Calculating category-wise budget allocations...',
      'Structuring 6-month chronological timeline...',
      'Synthesizing required vendor specifications...',
      'Curating personalized menu & decor recommendations...',
      'Finalizing executive event blueprint...',
    ];

    let currentStepIdx = 0;
    setLoadingStepText(steps[0]);
    const interval = setInterval(() => {
      currentStepIdx++;
      if (currentStepIdx < steps.length) {
        setLoadingStepText(steps[currentStepIdx]);
      }
    }, 900);

    try {
      const response = await fetch('/api/gemini/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType,
          title,
          date,
          duration,
          location,
          guestCount: Number(guestCount),
          totalBudget: Number(totalBudget),
          theme,
          foodPreferences,
          specialRequirements,
          rawPrompt,
          customApiKey: geminiApiKey,
        }),
      });

      const planData = await response.json();
      clearInterval(interval);

      // Save plan and input data in session storage for the /plan review page
      sessionStorage.setItem(
        'eventora_latest_plan',
        JSON.stringify({
          eventData: {
            title,
            eventType,
            date,
            duration,
            location,
            guestCount: Number(guestCount),
            totalBudget: Number(totalBudget),
            currency: userProfile.currency || 'INR',
            theme,
            foodPreferences,
            specialRequirements,
            rawPrompt,
            aiSummary: planData.event_summary,
          },
          plan: planData,
        })
      );

      router.push('/plan');
    } catch (e) {
      clearInterval(interval);
      console.error('Plan generation error:', e);
      alert('Encountered an issue generating plan. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full">
      {/* Top Banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 text-xs font-semibold mb-3 border border-violet-200 dark:border-violet-800">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Event Creation Studio</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          Create Your Personalized Event Plan
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-xl mx-auto">
          Input your event criteria or natural language description. Gemini AI will architect a full budget breakdown,
          timeline, and vendor strategy.
        </p>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
          <span className="text-[11px] text-slate-400 font-semibold mr-1">Quick Presets:</span>
          <button
            onClick={() => handleApplyPreset('wedding')}
            className="text-[11px] px-3 py-1 rounded-full bg-white dark:bg-slate-800 hover:bg-violet-50 dark:hover:bg-violet-950/40 text-violet-600 dark:text-violet-300 border border-violet-200 dark:border-slate-700 font-medium transition-colors"
          >
            💍 Bengali Wedding (Kolkata)
          </button>
          <button
            onClick={() => handleApplyPreset('corporate')}
            className="text-[11px] px-3 py-1 rounded-full bg-white dark:bg-slate-800 hover:bg-violet-50 dark:hover:bg-violet-950/40 text-pink-600 dark:text-pink-300 border border-pink-200 dark:border-slate-700 font-medium transition-colors"
          >
            🏢 Tech Conclave (Bengaluru)
          </button>
          <button
            onClick={() => handleApplyPreset('birthday')}
            className="text-[11px] px-3 py-1 rounded-full bg-white dark:bg-slate-800 hover:bg-violet-50 dark:hover:bg-violet-950/40 text-amber-600 dark:text-amber-300 border border-amber-200 dark:border-slate-700 font-medium transition-colors"
          >
            🎂 1st Birthday (Delhi)
          </button>
          <button
            onClick={() => handleApplyPreset('fest')}
            className="text-[11px] px-3 py-1 rounded-full bg-white dark:bg-slate-800 hover:bg-violet-50 dark:hover:bg-violet-950/40 text-emerald-600 dark:text-emerald-300 border border-emerald-200 dark:border-slate-700 font-medium transition-colors"
          >
            🎉 College Fest (Mumbai)
          </button>
        </div>
      </div>

      {/* Main Wizard Form Card */}
      <div className="rounded-2xl glass-card p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 relative">
        {loading ? (
          <div className="py-16 text-center space-y-6">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-violet-500/20 animate-ping" />
              <div className="w-20 h-20 rounded-full border-4 border-t-violet-600 border-r-pink-500 border-b-purple-500 border-l-transparent animate-spin flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-violet-500 animate-pulse" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Eventora AI is Synthesizing</h3>
              <p className="text-xs text-violet-600 dark:text-violet-400 font-semibold mt-1 transition-all">
                {loadingStepText}
              </p>
            </div>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
              Generating tailored budget allocations, milestone timelines, menu suggestions, and vendor specifications...
            </p>
          </div>
        ) : (
          <div className="space-y-6 text-xs">
            {/* Step Navigation Pill Indicator */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300">
                Step {step} of 3: {step === 1 ? 'Event Essentials' : step === 2 ? 'Scale & Budget' : 'Theme & Vision'}
              </span>
              <div className="flex space-x-1.5">
                {[1, 2, 3].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStep(s)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                      step === s
                        ? 'bg-violet-600 text-white shadow-md shadow-violet-500/25'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 1: Essentials */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Event Type *</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {[
                      { id: 'wedding', label: '💍 Wedding' },
                      { id: 'birthday', label: '🎂 Birthday' },
                      { id: 'anniversary', label: '🥂 Anniversary' },
                      { id: 'corporate', label: '🏢 Corporate Summit' },
                      { id: 'college_fest', label: '🎓 College Fest' },
                      { id: 'community', label: '🤝 Community Gathering' },
                    ].map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setEventType(type.id as EventType)}
                        className={`py-2.5 px-3 rounded-xl border text-left font-medium transition-all ${
                          eventType === type.id
                            ? 'bg-violet-50 dark:bg-violet-950/60 border-violet-500 text-violet-700 dark:text-violet-300 font-bold shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Event Name / Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aditi & Rohan's Royal Bengali Wedding"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Event Date *</label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Duration *</label>
                    <input
                      type="text"
                      placeholder="e.g. 2-Day Celebration / 6 Hours"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Event Location / City *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kolkata, West Bengal"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Scale & Budget */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Estimated Guest Count *
                    </label>
                    <input
                      type="number"
                      required
                      min="5"
                      placeholder="e.g. 300"
                      value={guestCount}
                      onChange={(e) => setGuestCount(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white outline-none"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Directly influences catering and venue dimensions.</p>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Total Estimated Budget (₹ INR) *
                    </label>
                    <input
                      type="number"
                      required
                      min="10000"
                      placeholder="e.g. 800000"
                      value={totalBudget}
                      onChange={(e) => setTotalBudget(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white outline-none"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      AI will distribute this proportionally across 7+ categories.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Food & Catering Preferences
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Authentic Bengali Feast (Bhetki Paturi, Kosha Mangsho, Mishti Doi)"
                    value={foodPreferences}
                    onChange={(e) => setFoodPreferences(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Theme & Vision */}
            {step === 3 && (
              <div className="space-y-4 animate-in fade-in">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Decoration Theme & Aesthetic Preferences
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Traditional Rajbari Royalty with Terracotta & Marigold"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Special Requirements & Entertainment
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Eco-friendly pottery, live Shehnai + Baul artists, drone videography"
                    value={specialRequirements}
                    onChange={(e) => setSpecialRequirements(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Natural Language Requirements / Story (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe your event vision freely (e.g. 'I want to organize a Bengali wedding in Kolkata for 300 guests with a budget of ₹8 lakh. I prefer traditional decorations, Bengali cuisine, and a 2-day celebration.')"
                    value={rawPrompt}
                    onChange={(e) => setRawPrompt(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>
            )}

            {/* Bottom Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold flex items-center space-x-1.5 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold flex items-center space-x-1.5 shadow-lg shadow-violet-500/25 transition-all"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleGeneratePlan}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 text-white font-bold flex items-center space-x-2 shadow-xl shadow-purple-500/30 transition-all hover:scale-105"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Full Event Plan with AI</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

