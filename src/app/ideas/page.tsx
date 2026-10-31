'use client';

import React, { useState } from 'react';
import { useEventContext } from '@/context/EventContext';
import {
  Lightbulb,
  Heart,
  Copy,
  Check,
  Plus,
  Sparkles,
  Utensils,
  Camera,
  Gift,
  Music,
  Palette,
  X,
} from 'lucide-react';
import { IdeaCategory } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { InvitationModal } from '@/components/InvitationModal';

export default function IdeasStudioPage() {
  const { currentEvent, ideas, addIdea, toggleFavoriteIdea } = useEventContext();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [invitationModalOpen, setInvitationModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Custom Idea modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<IdeaCategory>('decor');

  if (!currentEvent) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <p className="text-sm text-slate-500">Please select or create an event first.</p>
      </div>
    );
  }

  const ideaCategories: Array<{ id: IdeaCategory | 'all'; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'all', label: 'All Concepts', icon: Lightbulb },
    { id: 'decor', label: 'Decor & Ambience', icon: Palette },
    { id: 'menu', label: 'Menu & Catering', icon: Utensils },
    { id: 'entertainment', label: 'Entertainment & Games', icon: Music },
    { id: 'gifts', label: 'Favors & Return Gifts', icon: Gift },
    { id: 'photography', label: 'Photography Shotlists', icon: Camera },
  ];

  const filteredIdeas = ideas.filter((i) => {
    if (activeCategory !== 'all' && i.category !== activeCategory) return false;
    return true;
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDesc) return;
    addIdea({
      title: newTitle,
      description: newDesc,
      category: newCategory,
      isFavorite: true,
      tags: ['Custom Concept'],
    });
    setNewTitle('');
    setNewDesc('');
    setShowAddModal(false);
  };

  return (
    <div className="flex-1 bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center space-x-2 text-xs text-violet-600 dark:text-violet-400 font-bold mb-1">
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Creative Ideation & Concepts Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Personalized Ideas: {currentEvent.title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Budget-aware decor, dining, entertainment, and invitation wording tailored to {currentEvent.location}
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setInvitationModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 text-xs font-semibold shadow-sm transition-all flex items-center space-x-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-500" />
            <span>AI Invitation Generator</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-md shadow-violet-500/25 flex items-center space-x-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Idea</span>
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        {ideaCategories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-500/25 font-bold'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Ideas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredIdeas.map((idea) => (
          <div
            key={idea.id}
            className="p-5 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:border-violet-500/50 transition-all text-xs"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2 py-0.5 rounded-md font-semibold text-[10px] uppercase bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300">
                  {idea.category}
                </span>
                <button
                  onClick={() => toggleFavoriteIdea(idea.id)}
                  className="p-1 text-slate-400 hover:text-pink-500 transition-colors"
                  title="Favorite concept"
                >
                  <Heart
                    className={`w-4 h-4 transition-colors ${
                      idea.isFavorite ? 'fill-pink-500 text-pink-500' : 'text-slate-400'
                    }`}
                  />
                </button>
              </div>

              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-2">{idea.title}</h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">{idea.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {idea.tags?.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-500"
                  >
                    #{t}
                  </span>
                ))}
              </div>
              <button
                onClick={() => handleCopy(`${idea.title}\n${idea.description}`, idea.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                title="Copy idea details"
              >
                {copiedId === idea.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Custom Idea Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        titleId="custom-idea-modal-title"
        maxWidth="max-w-md"
      >
        <button
          type="button"
          onClick={() => setShowAddModal(false)}
          aria-label="Close dialog"
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 id="custom-idea-modal-title" className="text-lg font-bold text-slate-900 dark:text-white mb-4">Add Custom Concept</h3>
        <form onSubmit={handleCreateIdea} className="space-y-4 text-xs">
          <div>
            <label htmlFor="custom-idea-category" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Concept Category</label>
            <select
              id="custom-idea-category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as IdeaCategory)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none"
            >
              <option value="decor">Decor & Ambience</option>
              <option value="menu">Menu & Catering</option>
              <option value="entertainment">Entertainment & Games</option>
              <option value="gifts">Favors & Return Gifts</option>
              <option value="photography">Photography Shotlists</option>
            </select>
          </div>

          <div>
            <label htmlFor="custom-idea-title" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Title *</label>
            <input
              id="custom-idea-title"
              type="text"
              required
              placeholder="e.g. Scented Tuberose Chandelier Entrance"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none"
            />
          </div>

          <div>
            <label htmlFor="custom-idea-desc" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Description *</label>
            <textarea
              id="custom-idea-desc"
              rows={3}
              required
              placeholder="Describe your creative setup, logistics, and visual aesthetic..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold shadow-md shadow-violet-500/25"
            >
              Save Concept
            </button>
          </div>
        </form>
      </Modal>

      {/* Invitation Modal */}
      <InvitationModal isOpen={invitationModalOpen} onClose={() => setInvitationModalOpen(false)} />
    </div>
  );
}

