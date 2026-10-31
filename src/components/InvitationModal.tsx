'use client';

import React, { useState } from 'react';
import { useEventContext } from '@/context/EventContext';
import { X, Sparkles, Copy, Check, MessageSquare, Mail, RefreshCw } from 'lucide-react';

interface InvitationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InvitationModal: React.FC<InvitationModalProps> = ({ isOpen, onClose }) => {
  const { currentEvent, geminiApiKey } = useEventContext();

  const [tone, setTone] = useState<'Traditional' | 'Royal' | 'Modern' | 'Quirky' | 'Formal'>('Traditional');
  const [hostNames, setHostNames] = useState('The Mukherjee & Sharma Families');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    whatsapp_message: string;
    card_text: string;
    subject_line: string;
  } | null>(null);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!isOpen || !currentEvent) return null;

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/gemini/invitation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: currentEvent.title,
          eventType: currentEvent.eventType,
          date: currentEvent.date,
          location: currentEvent.location,
          hostNames,
          tone,
          customApiKey: geminiApiKey,
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      console.error('Failed to generate invite:', e);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl rounded-2xl glass-card p-6 shadow-2xl relative border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-pink-500 text-white flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI Invitation Generator</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Generate personalized WhatsApp and print invitation wording for {currentEvent.title}
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Hosted By (Family / Org Name)
              </label>
              <input
                type="text"
                value={hostNames}
                onChange={(e) => setHostNames(e.target.value)}
                placeholder="e.g. The Sen & Banerjee Families"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tone & Aesthetic
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as 'Traditional' | 'Royal' | 'Modern' | 'Quirky' | 'Formal')}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white outline-none"
              >
                <option value="Traditional">🕉️ Traditional & Cultural</option>
                <option value="Royal">👑 Royal & Grand Heritage</option>
                <option value="Modern">✨ Modern Chic & Minimalist</option>
                <option value="Quirky">🎉 Fun & Quirky Celebration</option>
                <option value="Formal">🏛️ Formal Corporate / Diplomatic</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 text-white font-bold flex items-center justify-center space-x-2 shadow-lg shadow-violet-500/25 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Crafting Bespoke Invitation with AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Invitation Copy</span>
              </>
            )}
          </button>

          {/* Generated Result Preview */}
          {result && (
            <div className="space-y-4 pt-3 border-t border-slate-200 dark:border-slate-800 animate-in fade-in">
              {/* WhatsApp format */}
              <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-400 font-bold">
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp / Messenger Format</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(result.whatsapp_message, 'whatsapp')}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors flex items-center space-x-1"
                  >
                    {copiedType === 'whatsapp' ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy WhatsApp Text</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="whitespace-pre-wrap font-sans text-slate-700 dark:text-slate-300 leading-relaxed bg-white/70 dark:bg-slate-900/70 p-3 rounded-lg border border-slate-200/60 dark:border-slate-800/60">
                  {result.whatsapp_message}
                </pre>
              </div>

              {/* Card Print format */}
              <div className="p-4 rounded-xl border border-purple-200 dark:border-purple-800/60 bg-purple-50/40 dark:bg-purple-950/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2 text-purple-700 dark:text-purple-400 font-bold">
                    <Mail className="w-4 h-4" />
                    <span>Formal Card / Print Format</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(result.card_text, 'card')}
                    className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-colors flex items-center space-x-1"
                  >
                    {copiedType === 'card' ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Card Text</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-4 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/60 text-center font-serif text-slate-800 dark:text-slate-200 leading-loose">
                  {result.card_text}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

