'use client';

import React, { useState } from 'react';
import { useEventContext } from '@/context/EventContext';
import {
  Users,
  UserCheck,
  Plus,
  Trash2,
  Copy,
  Check,
} from 'lucide-react';
import { GuestModal } from '@/components/GuestModal';
import { RSVPStatus } from '@/types';

export default function GuestsPage() {
  const { currentEvent, guests, deleteGuest, updateGuest } = useEventContext();

  const [guestModalOpen, setGuestModalOpen] = useState(false);
  const [filterRsvp, setFilterRsvp] = useState<string>('all');
  const [copiedLink, setCopiedLink] = useState(false);

  if (!currentEvent) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <p className="text-sm text-slate-500">Please select or create an event first.</p>
      </div>
    );
  }

  const confirmedGuests = guests.filter((g) => g.rsvpStatus === 'confirmed');
  const pendingGuests = guests.filter((g) => g.rsvpStatus === 'pending');
  const declinedGuests = guests.filter((g) => g.rsvpStatus === 'declined');

  const totalHeadcount = confirmedGuests.reduce((acc, g) => acc + 1 + (g.plusOnes || 0), 0);

  const filteredGuests = guests.filter((g) => {
    if (filterRsvp !== 'all' && g.rsvpStatus !== filterRsvp) return false;
    return true;
  });

  const handleCopyRsvpLink = () => {
    navigator.clipboard.writeText(
      `Hello! You're invited to ${currentEvent.title} on ${currentEvent.date}. Please reply with your RSVP confirmation and dietary preferences!`
    );
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="flex-1 bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center space-x-2 text-xs text-violet-600 dark:text-violet-400 font-bold mb-1">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Smart Guest List & RSVP Manager</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Guest List: {currentEvent.title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track RSVPs, plus-ones, meal requirements, and table assignments
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleCopyRsvpLink}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 text-xs font-semibold shadow-sm transition-all flex items-center space-x-1.5"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Copied Invite' : 'Copy RSVP Message'}</span>
          </button>
          <button
            onClick={() => setGuestModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-md shadow-violet-500/25 flex items-center space-x-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Guest</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-2xl glass-card border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-600 dark:text-slate-200 font-bold uppercase tracking-wider">
            Total Planned Capacity
          </span>
          <div className="text-3xl font-black text-violet-600 dark:text-white mt-1">
            {currentEvent.guestCount}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">Target banquet limit</div>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-600 dark:text-slate-200 font-bold uppercase tracking-wider">
            Confirmed Attending
          </span>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {totalHeadcount}{' '}
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">({confirmedGuests.length} parties)</span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">Including plus-ones</div>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-600 dark:text-slate-200 font-bold uppercase tracking-wider">
            Pending Awaiting RSVP
          </span>
          <div className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {pendingGuests.length}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">Awaiting confirmation reply</div>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-600 dark:text-slate-200 font-bold uppercase tracking-wider">
            Declined / Regrets
          </span>
          <div className="text-3xl font-black text-slate-500 dark:text-slate-300 mt-1">{declinedGuests.length}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">Unable to attend</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 mb-6 text-xs">
        <button
          onClick={() => setFilterRsvp('all')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
            filterRsvp === 'all'
              ? 'bg-violet-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
          }`}
        >
          All Guests ({guests.length})
        </button>
        <button
          onClick={() => setFilterRsvp('confirmed')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
            filterRsvp === 'confirmed'
              ? 'bg-violet-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
          }`}
        >
          Confirmed ({confirmedGuests.length})
        </button>
        <button
          onClick={() => setFilterRsvp('pending')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
            filterRsvp === 'pending'
              ? 'bg-violet-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
          }`}
        >
          Pending ({pendingGuests.length})
        </button>
        <button
          onClick={() => setFilterRsvp('declined')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
            filterRsvp === 'declined'
              ? 'bg-violet-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
          }`}
        >
          Declined ({declinedGuests.length})
        </button>
      </div>

      {/* Guest Table */}
      <div className="p-6 rounded-2xl glass-card border border-slate-200 dark:border-slate-800">
        {filteredGuests.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            <Users className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <span>No guests logged under this filter.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold">
                  <th className="pb-2.5">Guest Name</th>
                  <th className="pb-2.5">RSVP Status</th>
                  <th className="pb-2.5">Plus Ones</th>
                  <th className="pb-2.5">Dietary Preference</th>
                  <th className="pb-2.5">Table / Zone</th>
                  <th className="pb-2.5">Contact</th>
                  <th className="pb-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredGuests.map((guest) => (
                  <tr key={guest.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                    <td className="py-3 font-bold text-slate-900 dark:text-white">{guest.name}</td>
                    <td className="py-3">
                      <select
                        value={guest.rsvpStatus}
                        onChange={(e) => updateGuest(guest.id, { rsvpStatus: e.target.value as RSVPStatus })}
                        className={`text-[10px] font-bold uppercase rounded-lg px-2 py-0.5 outline-none border cursor-pointer ${
                          guest.rsvpStatus === 'confirmed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                            : guest.rsvpStatus === 'pending'
                            ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                            : 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                        }`}
                      >
                        <option value="confirmed">Confirmed</option>
                        <option value="pending">Pending</option>
                        <option value="declined">Declined</option>
                      </select>
                    </td>
                    <td className="py-3 text-slate-700 dark:text-slate-300">
                      {guest.plusOnes > 0 ? `+${guest.plusOnes} guest(s)` : 'Solo'}
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-300">{guest.dietaryPreference}</td>
                    <td className="py-3 text-slate-500 dark:text-slate-400">{guest.tableAssigned || 'Unassigned'}</td>
                    <td className="py-3 text-[11px] text-slate-400">
                      {guest.phone || guest.email || '-'}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => deleteGuest(guest.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
                        title="Remove guest"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Guest Modal */}
      <GuestModal isOpen={guestModalOpen} onClose={() => setGuestModalOpen(false)} />
    </div>
  );
}

