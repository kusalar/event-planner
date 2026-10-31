'use client';

import React, { useState } from 'react';
import { useEventContext } from '@/context/EventContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  Settings,
  Key,
  Database,
  Moon,
  Sun,
  Save,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Zap,
  Download,
  LogOut,
  UserCheck,
  ShieldCheck,
} from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';
import { CurrencyCode } from '@/types';

export default function SettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isDemoMode, signOut } = useAuth();
  const {
    currentEvent,
    updateEvent,
    userProfile,
    setCurrency,
    theme,
    setTheme,
    geminiApiKey,
    setCustomGeminiKey,
    resetToSampleData,
  } = useEventContext();

  // Event Edit State
  const [title, setTitle] = useState(currentEvent?.title || '');
  const [date, setDate] = useState(currentEvent?.date || '');
  const [location, setLocation] = useState(currentEvent?.location || '');
  const [guestCount, setGuestCount] = useState(String(currentEvent?.guestCount || 300));
  const [totalBudget, setTotalBudget] = useState(String(currentEvent?.totalBudget || 800000));
  const [eventSaveSuccess, setEventSaveSuccess] = useState(false);

  // Gemini Key state
  const [keyInput, setKeyInput] = useState(geminiApiKey || '');
  const [keyTesting, setKeyTesting] = useState(false);
  const [keyStatus, setKeyStatus] = useState<string | null>(null);

  const handleSaveEventDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEvent) return;
    updateEvent(currentEvent.id, {
      title,
      date,
      location,
      guestCount: Number(guestCount),
      totalBudget: Number(totalBudget),
    });
    setEventSaveSuccess(true);
    setTimeout(() => setEventSaveSuccess(false), 2500);
  };

  const [keyErrorDetail, setKeyErrorDetail] = useState<string | null>(null);

  const handleTestAndSaveKey = async () => {
    setKeyTesting(true);
    setKeyStatus(null);
    setKeyErrorDetail(null);
    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ sender: 'user', content: 'Hello' }],
          eventContext: { title: 'Test Event' },
          customApiKey: keyInput.trim(),
        }),
      });
      const data = await res.json();
      if (data.isLiveModel) {
        setCustomGeminiKey(keyInput.trim());
        setKeyStatus('valid');
      } else if (data.keyError) {
        setKeyErrorDetail(data.keyError);
        setKeyStatus('invalid');
      } else {
        setCustomGeminiKey(keyInput.trim());
        setKeyStatus('saved_demo');
      }
    } catch {
      setKeyStatus('error');
    } finally {
      setKeyTesting(false);
    }
  };

  const handleExportJson = () => {
    if (!currentEvent) return;
    const blob = new Blob([JSON.stringify(currentEvent, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eventora_${currentEvent.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!currentEvent) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <p className="text-sm text-slate-500">Please select an event first.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-8">
      {/* Top Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs text-violet-600 dark:text-violet-400 font-bold mb-1">
          <Settings className="w-3.5 h-3.5" />
          <span>System & Event Preferences</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Eventora AI Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Configure GenAI model keys, currency, event parameters, and database sync
        </p>
      </div>

      {/* 1. Gemini API Key Configuration Card */}
      <div className="p-6 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 text-xs">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-pink-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/25">
            <Key className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span>Google Gemini AI API Key</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  geminiApiKey
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                }`}
              >
                {geminiApiKey ? 'Live Key Saved' : 'Demo Mode Active'}
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Eventora AI connects directly to Gemini 2.5 Flash for conversational intelligence and event generation.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Enter Your Gemini API Key
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="password"
                placeholder="AIzaSy..."
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white outline-none font-mono text-xs"
              />
              <button
                type="button"
                onClick={handleTestAndSaveKey}
                disabled={keyTesting}
                className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold transition-all flex items-center justify-center space-x-1.5 shadow-md shadow-violet-500/25 flex-shrink-0"
              >
                {keyTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>{keyTesting ? 'Testing...' : 'Save & Verify Key'}</span>
              </button>
            </div>
          </div>

          {keyStatus === 'valid' && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Key verified! Live Gemini 2.5 API is now active across all event planning features.</span>
            </div>
          )}

          {keyStatus === 'saved_demo' && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 flex items-center space-x-2">
              <Zap className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>Empty key entered. Operating in Curated Domain Intelligence Demo Mode.</span>
            </div>
          )}

          {keyStatus === 'invalid' && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>The API key could not be verified with Gemini ({keyErrorDetail || 'Check key and billing quota'}). Retaining Curated Demo Mode.</span>
            </div>
          )}

          {keyStatus === 'error' && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>Network error while contacting Gemini API endpoint. Retaining Curated Demo Mode.</span>
            </div>
          )}

          <p className="text-[11px] text-slate-400">
            Note: If an API key is not supplied, Eventora AI operates in full <strong>Demo Mode</strong> with realistic
            curated sample intelligence for weddings, corporate events, and birthdays.
          </p>
        </div>
      </div>

      {/* 2. Active Event Parameters Editor */}
      <div className="p-6 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 text-xs">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Active Event Details</h3>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4">
          Edit parameters for {currentEvent.title}
        </p>

        <form onSubmit={handleSaveEventDetails} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Event Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Event Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Location *</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Guests *</label>
              <input
                type="number"
                required
                min="10"
                value={guestCount}
                onChange={(e) => setGuestCount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Total Budget (₹) *
              </label>
              <input
                type="number"
                required
                min="10000"
                value={totalBudget}
                onChange={(e) => setTotalBudget(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            {eventSaveSuccess ? (
              <span className="text-emerald-600 font-semibold flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Saved successfully!</span>
              </span>
            ) : (
              <span />
            )}
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold shadow-md shadow-violet-500/25 transition-all"
            >
              Update Event
            </button>
          </div>
        </form>
      </div>

      {/* 3. Regional Currency & Theme Preferences */}
      <div className="p-6 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 text-xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white">Appearance & Regional Settings</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Preferred Currency</label>
            <select
              value={userProfile.currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none"
            >
              <option value="INR">₹ Indian Rupee (INR) - Default</option>
              <option value="USD">$ US Dollar (USD)</option>
              <option value="EUR">€ Euro (EUR)</option>
              <option value="GBP">£ British Pound (GBP)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Theme Display</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex-1 py-2 rounded-xl font-semibold flex items-center justify-center space-x-1.5 border transition-all ${
                  theme === 'light'
                    ? 'bg-violet-50 border-violet-500 text-violet-700 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Light</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex-1 py-2 rounded-xl font-semibold flex items-center justify-center space-x-1.5 border transition-all ${
                  theme === 'dark'
                    ? 'bg-violet-950/60 border-violet-500 text-violet-300 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600'
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-violet-400" />
                <span>Dark</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. User Account & Authentication Status */}
      <div className="p-6 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 text-xs space-y-4">
        <div className="flex items-center space-x-3 mb-2">
          <ShieldCheck className="w-5 h-5 text-violet-500" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Account & Authentication</h3>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
          <div>
            <div className="font-bold text-sm text-slate-900 dark:text-white">
              {isAuthenticated ? userProfile.name : isDemoMode ? 'Demo Sandbox Guest' : 'Anonymous Guest'}
            </div>
            <div className="text-slate-500 text-xs mt-0.5">
              {isAuthenticated ? user?.email : isDemoMode ? 'Operating in isolated offline demo mode' : 'Not signed in'}
            </div>
            <div className="mt-2">
              {isAuthenticated ? (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80">
                  ✓ Supabase Authenticated (Row Level Security Active)
                </span>
              ) : isDemoMode ? (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/80">
                  ⚡ Demo Sandbox Active
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  Unauthenticated
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={async () => {
                  await signOut();
                  router.push('/auth');
                }}
                className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 font-bold text-xs flex items-center space-x-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => router.push('/auth')}
                className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs flex items-center space-x-1.5 transition-all shadow-md shadow-violet-500/20"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Sign In to Account</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 5. Supabase DB & SQL Migration Info */}
      <div className="p-6 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 text-xs">
        <div className="flex items-center space-x-3 mb-2">
          <Database className="w-5 h-5 text-emerald-500" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Database & Supabase Connection</h3>
        </div>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
          Status: {isSupabaseConfigured ? '🟢 Connected to Live Supabase' : '💾 Persistent Local State Engine Active'}
        </p>
        <p className="text-slate-500 dark:text-slate-400 text-[11px] mb-3">
          The full SQL migration script is located at <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">supabase/schema.sql</code>.
          Simply paste it into your Supabase SQL editor to create the PostgreSQL tables and RLS security policies.
        </p>
      </div>

      {/* 5. Danger Zone & Reset */}
      <div className="p-6 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10 text-xs space-y-4">
        <h3 className="font-bold text-sm text-rose-600 dark:text-rose-400">Data Management & Reset</h3>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-semibold text-slate-800 dark:text-slate-200">Export Event Plan</div>
            <div className="text-[11px] text-slate-500">Download active event blueprint as a JSON backup file</div>
          </div>
          <button
            onClick={handleExportJson}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-rose-200/50 dark:border-rose-900/40">
          <div>
            <div className="font-semibold text-slate-800 dark:text-slate-200">Reset to Sample Datasets</div>
            <div className="text-[11px] text-slate-500">Restore the curated Bengali Wedding and Tech Conclave plans</div>
          </div>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to reset all data back to the default curated sample datasets?')) {
                resetToSampleData();
                alert('Reset complete!');
              }
            }}
            className="px-3.5 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/60 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>
    </div>
  );
}

