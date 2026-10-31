'use client';

import React, { useState } from 'react';
import { useEventContext } from '@/context/EventContext';
import { Modal } from '@/components/ui/Modal';
import { X, Users } from 'lucide-react';
import { VendorCategory, VendorStatus } from '@/types';

interface VendorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VendorModal: React.FC<VendorModalProps> = ({ isOpen, onClose }) => {
  const { addVendor } = useEventContext();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<VendorCategory>('Venue');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [quotedPrice, setQuotedPrice] = useState('');
  const [advancePaid, setAdvancePaid] = useState('');
  const [status, setStatus] = useState<VendorStatus>('inquiry');
  const [rating, setRating] = useState('5');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      alert('Please enter a vendor name.');
      return;
    }

    addVendor({
      name,
      category,
      contactPerson,
      phone,
      email,
      quotedPrice: Number(quotedPrice) || 0,
      advancePaid: Number(advancePaid) || 0,
      status,
      rating: Number(rating) || 5,
      notes,
      checklist: [
        `Confirm availability for ${category} on scheduled date`,
        'Verify cancellation and refund terms in written contract',
        'Review past client testimonials and recent portfolio work',
      ],
    });

    setName('');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setQuotedPrice('');
    setAdvancePaid('');
    setNotes('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      titleId="vendor-modal-title"
      maxWidth="max-w-lg"
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

      <div className="flex items-center space-x-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-lg shadow-violet-500/30">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <h3 id="vendor-modal-title" className="text-lg font-bold text-slate-900 dark:text-white">Add Vendor Partner</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Track quotes, contracts, and advances</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="vendor-name" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Vendor / Business Name *
              </label>
              <input
                id="vendor-name"
                type="text"
                required
                placeholder="e.g. Grand Heritage Palace"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white outline-none"
              />
            </div>

            <div>
              <label htmlFor="vendor-category" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category *
              </label>
              <select
                id="vendor-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as VendorCategory)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white outline-none"
              >
                <option value="Venue">Venue</option>
                <option value="Catering">Catering</option>
                <option value="Decoration">Decoration</option>
                <option value="Photography">Photography</option>
                <option value="Makeup & Styling">Makeup & Styling</option>
                <option value="DJ & Music">DJ & Music</option>
                <option value="Florist">Florist</option>
                <option value="Transportation">Transportation</option>
                <option value="Event Coordinator">Event Coordinator</option>
                <option value="Invitations & Favors">Invitations & Favors</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="vendor-contact-person" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Contact Person
              </label>
              <input
                id="vendor-contact-person"
                type="text"
                placeholder="Manager name"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white outline-none"
              />
            </div>
            <div>
              <label htmlFor="vendor-phone" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number
              </label>
              <input
                id="vendor-phone"
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white outline-none"
              />
            </div>
            <div>
              <label htmlFor="vendor-email" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email
              </label>
              <input
                id="vendor-email"
                type="email"
                placeholder="vendor@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="vendor-quoted-price" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Quoted Total Price (₹)
              </label>
              <input
                id="vendor-quoted-price"
                type="number"
                min="0"
                placeholder="e.g. 150000"
                value={quotedPrice}
                onChange={(e) => setQuotedPrice(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white outline-none"
              />
            </div>

            <div>
              <label htmlFor="vendor-advance-paid" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Advance Paid (₹)
              </label>
              <input
                id="vendor-advance-paid"
                type="number"
                min="0"
                placeholder="e.g. 50000"
                value={advancePaid}
                onChange={(e) => setAdvancePaid(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="vendor-status" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Booking Status *
              </label>
              <select
                id="vendor-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as VendorStatus)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white outline-none"
              >
                <option value="inquiry">💬 Inquiry / Contacted</option>
                <option value="shortlisted">⭐ Shortlisted</option>
                <option value="contract_sent">📄 Contract Sent</option>
                <option value="booked">✅ Booked & Confirmed</option>
                <option value="completed">🎉 Service Completed</option>
              </select>
            </div>

            <div>
              <label htmlFor="vendor-rating" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Rating
              </label>
              <select
                id="vendor-rating"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white outline-none"
              >
                <option value="5">⭐⭐⭐⭐⭐ Exceptional (5/5)</option>
                <option value="4">⭐⭐⭐⭐ Very Good (4/5)</option>
                <option value="3">⭐⭐⭐ Average (3/5)</option>
                <option value="2">⭐⭐ Fair (2/5)</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="vendor-notes" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Deliverables & Contract Notes
            </label>
            <textarea
              id="vendor-notes"
              rows={2}
              placeholder="e.g. Covers 2 days, includes generator backup and green room"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
              Add Vendor
            </button>
          </div>
        </form>
    </Modal>
  );
};

