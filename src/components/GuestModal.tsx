'use client';

import React, { useState } from 'react';
import { useEventContext } from '@/context/EventContext';
import { Modal } from '@/components/ui/Modal';
import { X, UserPlus } from 'lucide-react';
import { RSVPStatus } from '@/types';

interface GuestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuestModal: React.FC<GuestModalProps> = ({ isOpen, onClose }) => {
  const { addGuest } = useEventContext();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [rsvpStatus, setRsvpStatus] = useState<RSVPStatus>('confirmed');
  const [dietaryPreference, setDietaryPreference] = useState('Standard');
  const [plusOnes, setPlusOnes] = useState('0');
  const [tableAssigned, setTableAssigned] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Please enter the guest or family name.');
      return;
    }

    addGuest({
      name: name.trim(),
      email,
      phone,
      rsvpStatus,
      dietaryPreference,
      plusOnes: Math.max(0, Number(plusOnes) || 0),
      tableAssigned,
    });

    setName('');
    setEmail('');
    setPhone('');
    setTableAssigned('');
    setFormError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      titleId="guest-modal-title"
      maxWidth="max-w-md"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close dialog"
        className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-center space-x-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-lg shadow-violet-500/30">
          <UserPlus className="w-5 h-5" />
        </div>
        <div>
          <h3 id="guest-modal-title" className="text-lg font-bold text-slate-900 dark:text-white">Add Guest / RSVP</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Manage invitations and dietary needs</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {formError && (
          <div role="alert" className="p-2.5 rounded-xl text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
            {formError}
          </div>
        )}
        <div>
            <label htmlFor="guest-name" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Guest Name *
            </label>
            <input
              id="guest-name"
              type="text"
              required
              placeholder="e.g. Sagnik Roy & Family"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="guest-rsvp-status" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                RSVP Status *
              </label>
              <select
                id="guest-rsvp-status"
                value={rsvpStatus}
                onChange={(e) => setRsvpStatus(e.target.value as RSVPStatus)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white outline-none"
              >
                <option value="confirmed">✅ Confirmed Attending</option>
                <option value="pending">⏳ Awaiting Reply</option>
                <option value="declined">❌ Declined / Regrets</option>
              </select>
            </div>

            <div>
              <label htmlFor="guest-plus-ones" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Additional Guests (Plus Ones)
              </label>
              <input
                id="guest-plus-ones"
                type="number"
                min="0"
                max="10"
                value={plusOnes}
                onChange={(e) => setPlusOnes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="guest-phone" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number
              </label>
              <input
                id="guest-phone"
                type="tel"
                placeholder="+91 98300 00000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white outline-none"
              />
            </div>

            <div>
              <label htmlFor="guest-dietary" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Dietary Preference
              </label>
              <select
                id="guest-dietary"
                value={dietaryPreference}
                onChange={(e) => setDietaryPreference(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white outline-none"
              >
                <option value="Standard">Standard / Non-Veg</option>
                <option value="Pure Vegetarian">Pure Vegetarian</option>
                <option value="Jain (No Onion/Garlic)">Jain (No Onion/Garlic)</option>
                <option value="Vegan">Vegan</option>
                <option value="Halal">Halal</option>
                <option value="Gluten Free">Gluten Free</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="guest-table" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Table / Zone Assignment (Optional)
            </label>
            <input
              id="guest-table"
              type="text"
              placeholder="e.g. VIP Table 1, Bride's Friends, Family Stage Left"
              value={tableAssigned}
              onChange={(e) => setTableAssigned(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white outline-none"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 text-white font-semibold shadow-lg shadow-violet-500/25"
            >
              Save Guest
            </button>
          </div>
        </form>
    </Modal>
  );
};

