'use client';

import React, { useState } from 'react';
import { useEventContext } from '@/context/EventContext';
import {
  Wallet,
  TrendingUp,
  Plus,
  Trash2,
  Sparkles,
  PieChart as PieChartIcon,
  AlertTriangle,
  Receipt,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { ExpenseModal } from '@/components/ExpenseModal';
import { AiOptimizerModal } from '@/components/AiOptimizerModal';

export default function BudgetPage() {
  const {
    currentEvent,
    budgetCategories,
    expenses,
    formatCurrency,
    totalSpent,
    remainingBudget,
    budgetProgressPercentage,
    deleteExpense,
    addBudgetCategory,
  } = useEventContext();

  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [optimizerModalOpen, setOptimizerModalOpen] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');

  // New Category State
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatAmount, setNewCatAmount] = useState('');

  if (!currentEvent) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <p className="text-sm text-slate-500">Please select or create an event first.</p>
      </div>
    );
  }

  // Calculate spending per category
  const categoryAnalytics = budgetCategories.map((cat) => {
    const spent = expenses
      .filter((e) => e.categoryId === cat.id || e.categoryName.toLowerCase() === cat.name.toLowerCase())
      .reduce((sum, e) => sum + e.amount, 0);
    const remaining = Math.max(0, cat.allocatedAmount - spent);
    const percent = cat.allocatedAmount > 0 ? Math.round((spent / cat.allocatedAmount) * 100) : 0;
    return {
      id: cat.id,
      name: cat.name,
      allocated: cat.allocatedAmount,
      spent,
      remaining,
      percent,
      color: cat.color || '#8b5cf6',
      isOverBudget: spent > cat.allocatedAmount,
    };
  });

  // Filtered expenses list
  const filteredExpenses = expenses.filter((e) => {
    if (activeCategoryFilter === 'all') return true;
    return e.categoryId === activeCategoryFilter || e.categoryName === activeCategoryFilter;
  });

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName || !newCatAmount) return;
    addBudgetCategory(newCatName, Number(newCatAmount));
    setNewCatName('');
    setNewCatAmount('');
    setShowAddCategory(false);
  };

  return (
    <div className="flex-1 bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center space-x-2 text-xs text-violet-600 dark:text-violet-400 font-bold mb-1">
            <Wallet className="w-3.5 h-3.5" />
            <span>Smart Budget & Spending Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Budget Planner: {currentEvent.title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time expense ledger, allocations & AI cost optimization
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setOptimizerModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 text-xs font-semibold shadow-sm transition-all flex items-center space-x-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-500" />
            <span>AI Optimize Budget</span>
          </button>
          <button
            onClick={() => setExpenseModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-md shadow-violet-500/25 flex items-center space-x-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Expense</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="p-5 rounded-2xl glass-card border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-600 dark:text-slate-200 font-bold uppercase tracking-wider">
            Total Planned Budget
          </span>
          <div className="text-3xl font-black text-slate-950 dark:text-white mt-1">
            {formatCurrency(currentEvent.totalBudget)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">100% Target Cap</div>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-600 dark:text-slate-200 font-bold uppercase tracking-wider">
            Total Actual Outlay
          </span>
          <div className="text-3xl font-black text-pink-600 dark:text-pink-400 mt-1">
            {formatCurrency(totalSpent)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
            {budgetProgressPercentage}% committed across {expenses.length} records
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-600 dark:text-slate-200 font-bold uppercase tracking-wider">
            Remaining Uncommitted Budget
          </span>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(remainingBudget)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
            {Math.max(0, 100 - budgetProgressPercentage)}% available for pending contracts
          </div>
        </div>
      </div>

      {/* Recharts Analytics: Pie Chart & Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recharts Pie Chart: Category Allocations */}
        <div className="p-6 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Budget Allocation Breakdown</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Target share by department</p>
            </div>
            <PieChartIcon className="w-4 h-4 text-violet-500" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryAnalytics}
                  dataKey="allocated"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={45}
                  paddingAngle={3}
                >
                  {categoryAnalytics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: unknown) => [formatCurrency(Number(value) || 0), 'Budget']}
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#27272a',
                    borderRadius: '0.75rem',
                    fontSize: '11px',
                    color: '#ffffff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Mini Legend */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
            {categoryAnalytics.map((c) => (
              <div key={c.id} className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                <span className="text-slate-600 dark:text-slate-300 font-medium">{c.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recharts Bar Chart: Allocated vs Spent */}
        <div className="p-6 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Allocated vs Actual Spent</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Track variance per category</p>
            </div>
            <TrendingUp className="w-4 h-4 text-pink-500" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryAnalytics} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-25} textAnchor="end" />
                <YAxis tick={{ fontSize: 9 }} tickFormatter={(val) => `₹${val / 1000}k`} />
                <Tooltip
                  formatter={(val: unknown, name: unknown) => [formatCurrency(Number(val) || 0), String(name)]}
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#27272a',
                    borderRadius: '0.75rem',
                    fontSize: '11px',
                    color: '#ffffff',
                  }}
                />
                <Bar dataKey="allocated" name="Allocated Budget" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="spent" name="Spent So Far" fill="#ec4899" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[11px] text-slate-400 text-center pt-2 border-t border-slate-100 dark:border-slate-800/80">
            Purple bars represent target allocation; Pink bars represent actual recorded advances & balances.
          </div>
        </div>
      </div>

      {/* Category Progress Bars Grid */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">Departmental Budget Health</h3>
          <button
            onClick={() => setShowAddCategory(!showAddCategory)}
            className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Custom Category</span>
          </button>
        </div>

        {/* Add Category Form Inline */}
        {showAddCategory && (
          <form
            onSubmit={handleCreateCategory}
            className="mb-4 p-4 rounded-xl bg-violet-50/50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-800 flex flex-wrap items-center gap-3 text-xs animate-in fade-in"
          >
            <input
              type="text"
              required
              placeholder="Category Name (e.g. Fireworks / Special Permits)"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none flex-1 min-w-[180px]"
            />
            <input
              type="number"
              required
              min="1000"
              placeholder="Allocated Budget (₹)"
              value={newCatAmount}
              onChange={(e) => setNewCatAmount(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none w-36"
            />
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-semibold"
            >
              Save Category
            </button>
            <button
              type="button"
              onClick={() => setShowAddCategory(false)}
              className="px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryAnalytics.map((cat) => (
            <div
              key={cat.id}
              className={`p-4 rounded-xl border glass-card text-xs transition-all ${
                cat.isOverBudget
                  ? 'border-rose-400 dark:border-rose-700 bg-rose-50/20'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span>{cat.name}</span>
                </span>
                <span
                  className={`font-semibold ${
                    cat.isOverBudget
                      ? 'text-rose-600 dark:text-rose-400 font-bold'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {cat.percent}% committed
                </span>
              </div>

              <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1.5">
                <span>Spent: {formatCurrency(cat.spent)}</span>
                <span>Budget: {formatCurrency(cat.allocated)}</span>
              </div>

              <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    cat.isOverBudget ? 'bg-rose-500' : 'bg-violet-600'
                  }`}
                  style={{ width: `${Math.min(100, cat.percent)}%` }}
                />
              </div>

              {cat.isOverBudget && (
                <div className="mt-2 text-[10px] text-rose-600 dark:text-rose-400 flex items-center space-x-1 font-semibold">
                  <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                  <span>Exceeded target budget by {formatCurrency(cat.spent - cat.allocated)}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Expense Management Ledger Table */}
      <div className="p-6 rounded-2xl glass-card border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Expense Outlay Records</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Detailed transaction ledger of all vendor payments and disbursements
            </p>
          </div>

          {/* Filter by Category */}
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400">Filter:</span>
            <select
              value={activeCategoryFilter}
              onChange={(e) => setActiveCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-medium outline-none"
            >
              <option value="all">All Categories ({expenses.length})</option>
              {budgetCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            <Receipt className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <span>No expense transactions recorded in this category yet.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold">
                  <th className="pb-2.5">Date</th>
                  <th className="pb-2.5">Title & Notes</th>
                  <th className="pb-2.5">Category</th>
                  <th className="pb-2.5 text-right">Amount</th>
                  <th className="pb-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                    <td className="py-3 text-slate-500 dark:text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      {new Date(exp.paidDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 max-w-xs">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{exp.title}</div>
                      {exp.notes && (
                        <div className="text-[11px] text-slate-400 truncate max-w-sm">{exp.notes}</div>
                      )}
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-md font-semibold text-[10px] bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300">
                        {exp.categoryName}
                      </span>
                    </td>
                    <td className="py-3 font-bold text-slate-900 dark:text-white text-right">
                      {formatCurrency(exp.amount)}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => deleteExpense(exp.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete expense entry"
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

      {/* Modals */}
      <ExpenseModal isOpen={expenseModalOpen} onClose={() => setExpenseModalOpen(false)} />
      <AiOptimizerModal isOpen={optimizerModalOpen} onClose={() => setOptimizerModalOpen(false)} />
    </div>
  );
}
