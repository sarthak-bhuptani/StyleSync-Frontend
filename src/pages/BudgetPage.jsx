import React, { useState } from 'react';
import {
  Wallet,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  PieChart,
  Plus,
  ArrowUpRight,
  Edit2
} from 'lucide-react';
import { INITIAL_BUDGET } from '../data/mockData';
import { budgetApi } from '../api/budgetApi';
import { ProgressBar } from '../components/common/ProgressBar';
import { Modal } from '../components/common/Modal';
import { useWardrobe } from '../context/WardrobeContext';

export const BudgetPage = () => {
  const { showToast } = useWardrobe();
  const [budgetData, setBudgetData] = useState(() => {
    const saved = localStorage.getItem('stylesync_budget');
    return saved ? JSON.parse(saved) : INITIAL_BUDGET;
  });

  const [isEditLimitModalOpen, setIsEditLimitModalOpen] = useState(false);
  const [newLimit, setNewLimit] = useState(budgetData.monthlyLimit || 10000);

  const monthlyLimit = budgetData.monthlyLimit || 10000;
  const spentThisMonth = budgetData.spentThisMonth || 0;
  const remaining = Math.max(0, monthlyLimit - spentThisMonth);
  const percentSpent = Math.min(100, Math.round((spentThisMonth / monthlyLimit) * 100));
  const categories = budgetData.categories || [];
  const monthlyTrend = budgetData.monthlyTrend || [];

  const handleUpdateLimit = async (e) => {
    e.preventDefault();
    const updated = await budgetApi.updateLimit(newLimit);
    setBudgetData(updated);
    setIsEditLimitModalOpen(false);
    showToast(`Updated monthly budget to ₹${Number(newLimit).toLocaleString()}`, 'success');
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-2 border border-emerald-200/60">
            <Wallet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Shopping Allocation Guardrails</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Shopping Budget</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Keep your fashion investments disciplined without sacrificing versatility.
          </p>
        </div>

        <button
          onClick={() => setIsEditLimitModalOpen(true)}
          className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Edit2 className="w-3.5 h-3.5 text-slate-400" />
          <span>Adjust Monthly Limit</span>
        </button>
      </div>

      {/* Main Budget Status Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-subtle">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Monthly Budget</span>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              ₹{monthlyLimit.toLocaleString()}
            </p>
            <span className="text-[11px] text-slate-500">Period: {budgetData.period || 'Current Month'}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Spent This Month</span>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              ₹{spentThisMonth.toLocaleString()}
            </p>
            <span className="text-[11px] text-slate-500">{percentSpent}% of allocation</span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Remaining Budget</span>
            <p className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1">
              ₹{remaining.toLocaleString()}
            </p>
            <span className="text-[11px] text-emerald-800 font-semibold">Ready for approved buys</span>
          </div>
        </div>

        {/* Global Progress Bar */}
        <ProgressBar
          label="Total Monthly Consumption"
          value={spentThisMonth}
          max={monthlyLimit}
          displayValue={`₹${spentThisMonth.toLocaleString()} / ₹${monthlyLimit.toLocaleString()}`}
          color={percentSpent > 90 ? 'rose' : percentSpent > 75 ? 'amber' : 'emerald'}
          size="lg"
        />

        <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <span className="flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>You have <strong>₹{remaining.toLocaleString()}</strong> remaining this month.</span>
          </span>
          <span className="text-slate-400">Pacing: Optimal</span>
        </div>
      </div>

      {/* Category Breakdown & Monthly Trends 2-Col */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Categories Breakdown (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Category Spending</h3>
            <span className="text-xs text-slate-400 font-semibold">{categories.length} Active Buckets</span>
          </div>

          <div className="space-y-4">
            {categories.map((cat, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-800">{cat.name}</span>
                  <span className="text-slate-900">
                    ₹{(cat.spent || 0).toLocaleString()} / ₹{(cat.allocated || 0).toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.round(((cat.spent || 0) / Math.max(1, cat.allocated || 1)) * 100))}%`,
                      backgroundColor: cat.color || '#10B981'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6-Month Spending History Trend (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-6">
              <h3 className="text-base font-bold text-slate-900">Monthly Spending Trend</h3>
              <span className="text-xs text-slate-400 font-semibold">Active Trend</span>
            </div>

            {monthlyTrend.length > 0 ? (
              <div className="flex items-end justify-between gap-3 h-48 pt-4 px-2">
                {monthlyTrend.map((m, idx) => {
                  const heightPct = Math.round(((m.spent || 0) / 14000) * 100);
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                      <div className="text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        ₹{(m.spent || 0) / 1000}k
                      </div>
                      <div className="w-full max-w-[36px] bg-slate-100 rounded-xl overflow-hidden flex flex-col justify-end h-full">
                        <div
                          className="w-full bg-slate-900 group-hover:bg-emerald-600 rounded-xl transition-all duration-500"
                          style={{ height: `${heightPct}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-600">{m.month}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-400">
                Log purchases each month to visualize spending trends over time.
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Current month usage:</span>
            <strong className="text-slate-900 font-bold">₹{spentThisMonth.toLocaleString()} spent</strong>
          </div>
        </div>
      </div>

      {/* Edit Budget Modal */}
      <Modal
        isOpen={isEditLimitModalOpen}
        onClose={() => setIsEditLimitModalOpen(false)}
        title="Adjust Monthly Shopping Budget"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleUpdateLimit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Monthly Limit (₹)
            </label>
            <input
              type="number"
              required
              step="500"
              value={newLimit}
              onChange={(e) => setNewLimit(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-slate-900"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditLimitModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Save New Limit
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BudgetPage;
