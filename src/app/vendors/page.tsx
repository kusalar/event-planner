'use client';

import React, { useState } from 'react';
import { useEventContext } from '@/context/EventContext';
import {
  Users,
  Phone,
  Mail,
  Plus,
  Trash2,
  Star,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { VendorModal } from '@/components/VendorModal';
import { VendorCategory, VendorStatus } from '@/types';

export default function VendorsPage() {
  const {
    currentEvent,
    vendors,
    deleteVendor,
    updateVendor,
    formatCurrency,
    totalVendorCommitted,
    totalVendorAdvancePaid,
  } = useEventContext();

  const [vendorModalOpen, setVendorModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [expandedChecklistVendorId, setExpandedChecklistVendorId] = useState<string | null>(null);

  if (!currentEvent) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <p className="text-sm text-slate-500">Please select or create an event first.</p>
      </div>
    );
  }

  const vendorCategories: VendorCategory[] = [
    'Venue',
    'Catering',
    'Decoration',
    'Photography',
    'Makeup & Styling',
    'DJ & Music',
    'Florist',
    'Transportation',
    'Event Coordinator',
    'Invitations & Favors',
  ];

  const filteredVendors = vendors.filter((v) => {
    if (selectedCategory !== 'all' && v.category !== selectedCategory) return false;
    if (selectedStatus !== 'all' && v.status !== selectedStatus) return false;
    return true;
  });

  const remainingBalanceTotal = Math.max(0, totalVendorCommitted - totalVendorAdvancePaid);

  return (
    <div className="flex-1 bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center space-x-2 text-xs text-violet-600 dark:text-violet-400 font-bold mb-1">
            <Users className="w-3.5 h-3.5" />
            <span>Vendor Operations & Contracts OS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Vendor Management: {currentEvent.title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track quotes, advances, contracts, and AI-curated negotiation questions
          </p>
        </div>

        <button
          onClick={() => setVendorModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-md shadow-violet-500/25 flex items-center space-x-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Vendor Partner</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="p-5 rounded-2xl glass-card border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-600 dark:text-slate-200 font-bold uppercase tracking-wider">
            Total Quoted Commitments
          </span>
          <div className="text-3xl font-black text-violet-600 dark:text-white mt-1">
            {formatCurrency(totalVendorCommitted)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">Across {vendors.length} vendor partners</div>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-600 dark:text-slate-200 font-bold uppercase tracking-wider">
            Advances Paid
          </span>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(totalVendorAdvancePaid)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
            {totalVendorCommitted > 0
              ? `${Math.round((totalVendorAdvancePaid / totalVendorCommitted) * 100)}% secured deposits`
              : '0% deposits'}
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-600 dark:text-slate-200 font-bold uppercase tracking-wider">
            Outstanding Balances Due
          </span>
          <div className="text-3xl font-black text-pink-600 dark:text-pink-400 mt-1">
            {formatCurrency(remainingBalanceTotal)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">Payable upon delivery & event day wrap-up</div>
        </div>
      </div>

      {/* Category & Status Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              selectedCategory === 'all'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
            }`}
          >
            All Categories ({vendors.length})
          </button>
          {vendorCategories.map((cat) => {
            const count = vendors.filter((v) => v.category === cat).length;
            if (count === 0 && selectedCategory !== cat) return null;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-medium outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="booked">Booked & Confirmed</option>
            <option value="contract_sent">Contract Sent</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="inquiry">Inquiry</option>
          </select>
        </div>
      </div>

      {/* Vendor Cards Grid */}
      {filteredVendors.length === 0 ? (
        <div className="py-16 text-center text-xs text-slate-400 glass-card rounded-2xl border border-slate-200 dark:border-slate-800">
          <Users className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
          <p className="font-semibold text-slate-600 dark:text-slate-300 text-sm">No vendors found in this category.</p>
          <p className="mt-1">Click &quot;Add Vendor Partner&quot; to log quotes and contracts.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredVendors.map((vendor) => {
            const balance = Math.max(0, vendor.quotedPrice - vendor.advancePaid);
            const isChecklistOpen = expandedChecklistVendorId === vendor.id;

            return (
              <div
                key={vendor.id}
                className="p-5 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:border-violet-500/40 transition-all text-xs"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="px-2 py-0.5 rounded-md font-semibold text-[10px] bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300">
                        {vendor.category}
                      </span>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white mt-1">{vendor.name}</h3>
                      {vendor.contactPerson && (
                        <span className="text-[11px] text-slate-400 block">Contact: {vendor.contactPerson}</span>
                      )}
                    </div>

                    {/* Status Pill & Rating */}
                    <div className="text-right">
                      <select
                        value={vendor.status}
                        onChange={(e) => updateVendor(vendor.id, { status: e.target.value as VendorStatus })}
                        className={`text-[10px] font-bold uppercase rounded-lg px-2 py-1 outline-none border cursor-pointer ${
                          vendor.status === 'booked'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                            : vendor.status === 'contract_sent'
                            ? 'bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800'
                            : vendor.status === 'shortlisted'
                            ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                            : 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                        }`}
                      >
                        <option value="inquiry">Inquiry</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="contract_sent">Contract Sent</option>
                        <option value="booked">Booked</option>
                        <option value="completed">Completed</option>
                      </select>

                      <div className="flex items-center justify-end space-x-0.5 text-amber-400 mt-1">
                        {Array.from({ length: vendor.rating || 5 }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="flex flex-wrap items-center gap-3 my-3 text-[11px] text-slate-500 dark:text-slate-400">
                    {vendor.phone && (
                      <a
                        href={`tel:${vendor.phone}`}
                        className="flex items-center space-x-1 text-violet-600 dark:text-violet-400 hover:underline"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{vendor.phone}</span>
                      </a>
                    )}
                    {vendor.email && (
                      <a
                        href={`mailto:${vendor.email}`}
                        className="flex items-center space-x-1 text-slate-500 hover:underline"
                      >
                        <Mail className="w-3 h-3" />
                        <span>{vendor.email}</span>
                      </a>
                    )}
                  </div>

                  {vendor.notes && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50/70 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 mb-3">
                      {vendor.notes}
                    </p>
                  )}
                </div>

                <div>
                  {/* Financial Metrics */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800 text-[11px] mb-3">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Quoted</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {formatCurrency(vendor.quotedPrice)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Advance Paid</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(vendor.advancePaid)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Balance Due</span>
                      <span className="font-bold text-pink-600 dark:text-pink-400">{formatCurrency(balance)}</span>
                    </div>
                  </div>

                  {/* AI Checklist Accordion Button */}
                  {vendor.checklist && vendor.checklist.length > 0 && (
                    <div className="border-t border-slate-100 dark:border-slate-800/80 pt-2 mb-2">
                      <button
                        onClick={() =>
                          setExpandedChecklistVendorId(isChecklistOpen ? null : vendor.id)
                        }
                        className="text-[11px] font-semibold text-violet-600 dark:text-violet-400 flex items-center justify-between w-full hover:underline"
                      >
                        <span className="flex items-center space-x-1">
                          <Sparkles className="w-3 h-3" />
                          <span>AI Vendor Requirement Checklist ({vendor.checklist.length})</span>
                        </span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform ${isChecklistOpen ? 'rotate-180' : ''}`}
                        />
                      </button>

                      {isChecklistOpen && (
                        <ul className="mt-2 space-y-1 text-[11px] text-slate-500 dark:text-slate-400 list-disc list-inside bg-violet-50/40 dark:bg-violet-950/20 p-2.5 rounded-lg border border-violet-100 dark:border-violet-900/40">
                          {vendor.checklist.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <span className="text-[10px] text-slate-400">
                      Payment Status: {balance === 0 && vendor.quotedPrice > 0 ? 'Fully Paid' : 'Pending Clearance'}
                    </span>
                    <button
                      onClick={() => deleteVendor(vendor.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
                      title="Remove vendor"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Vendor Modal */}
      <VendorModal isOpen={vendorModalOpen} onClose={() => setVendorModalOpen(false)} />
    </div>
  );
}

