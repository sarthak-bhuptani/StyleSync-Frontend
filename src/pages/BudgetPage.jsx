import React, { useState, useEffect } from 'react';
import {
  Wallet,
  TrendingUp,
  CheckCircle2,
  Plus,
  Edit2,
  ThumbsUp,
  ThumbsDown,
  ShoppingBag,
  Check,
  Tag,
  SlidersHorizontal
} from 'lucide-react';
import { budgetApi } from '../api/budgetApi';
import { purchaseApi } from '../api/purchaseApi';
import { Modal } from '../components/common/Modal';
import { useWardrobe } from '../context/WardrobeContext';

const DEFAULT_BUDGET_DATA = {
  monthlyLimit: 10000,
  spentThisMonth: 0,
  currency: '₹',
  categories: [
    { name: 'Clothing', allocated: 4000, spent: 0, color: '#10B981' },
    { name: 'Shoes', allocated: 3000, spent: 0, color: '#3B82F6' },
    { name: 'Accessories', allocated: 2000, spent: 0, color: '#F59E0B' },
    { name: 'Other', allocated: 1000, spent: 0, color: '#8B5CF6' }
  ]
};

export const BudgetPage = () => {
  const { showToast } = useWardrobe();

  // Budget Data State
  const [budgetData, setBudgetData] = useState(() => {
    const saved = localStorage.getItem('stylesync_budget');
    return saved ? JSON.parse(saved) : DEFAULT_BUDGET_DATA;
  });

  // Purchases State
  const [purchases, setPurchases] = useState(() => {
    const saved = localStorage.getItem('stylesync_purchases');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const loadBudgetAndPurchases = async () => {
      try {
        const [liveBudget, livePurchases] = await Promise.all([
          budgetApi.getBudget(),
          purchaseApi.getPurchases()
        ]);
        if (liveBudget) {
          setBudgetData(prev => ({ ...prev, ...liveBudget }));
        }
        if (Array.isArray(livePurchases)) {
          setPurchases(livePurchases);
        }
      } catch (err) {
        console.warn('Could not load budget data:', err);
      }
    };
    loadBudgetAndPurchases();
  }, []);

  const [isEditLimitModalOpen, setIsEditLimitModalOpen] = useState(false);
  const [isAddPurchaseModalOpen, setIsAddPurchaseModalOpen] = useState(false);
  const [newLimit, setNewLimit] = useState(budgetData.monthlyLimit || 10000);

  const [newPurchase, setNewPurchase] = useState({
    productName: '',
    category: 'Clothing',
    brand: '',
    price: '',
    notes: '',
    image: ''
  });

  const monthlyLimit = budgetData.monthlyLimit || 10000;
  const spentThisMonth = budgetData.spentThisMonth || purchases.reduce((acc, p) => acc + (Number(p.price) || 0), 0);
  const remaining = Math.max(0, monthlyLimit - spentThisMonth);
  const percentSpent = Math.min(100, Math.round((spentThisMonth / monthlyLimit) * 100));
  const categories = budgetData.categories || [
    { name: 'Clothing', allocated: 4000, spent: 0, color: '#10B981' },
    { name: 'Shoes', allocated: 3000, spent: 0, color: '#3B82F6' },
    { name: 'Accessories', allocated: 2000, spent: 0, color: '#F59E0B' },
    { name: 'Other', allocated: 1000, spent: 0, color: '#8B5CF6' }
  ];

  const handleUpdateLimit = async (e) => {
    e.preventDefault();
    const updated = await budgetApi.updateLimit(Number(newLimit));
    setBudgetData(updated);
    setIsEditLimitModalOpen(false);
    showToast(`Updated monthly cap to ₹${Number(newLimit).toLocaleString()}`, 'success');
  };

  const handleFeedback = async (id, feedbackType) => {
    await purchaseApi.updateFeedback(id, { feedback: feedbackType });
    setPurchases(prev => prev.map(p => p.id === id ? { ...p, userFeedback: feedbackType } : p));
    showToast(
      feedbackType === 'good'
        ? 'Marked as Loved — Stylist will prioritize similar items.'
        : 'Marked as Regret — Stylist will avoid similar styles.',
      'info'
    );
  };

  const handleAddPurchase = async (e) => {
    e.preventDefault();
    if (!newPurchase.productName) return;
    const created = await purchaseApi.addPurchase({
      ...newPurchase,
      price: Number(newPurchase.price) || 1999,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      image: newPurchase.image || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&q=80'
    });
    setPurchases(prev => [created, ...prev]);
    setBudgetData(prev => ({
      ...prev,
      spentThisMonth: (prev.spentThisMonth || 0) + (Number(newPurchase.price) || 0)
    }));
    setIsAddPurchaseModalOpen(false);
    setNewPurchase({ productName: '', category: 'Clothing', brand: '', price: '', notes: '', image: '' });
    showToast('Recorded item in wardrobe ledger', 'success');
  };

  const goodPurchasesCount = purchases.filter(p => p.userFeedback === 'good').length;
  const satisfactionRate = purchases.length > 0 ? Math.round((goodPurchasesCount / purchases.length) * 100) : 100;

  return (
    <div className="space-y-4 sm:space-y-5 animate-fade-in max-w-5xl mx-auto pb-16">
      {/* Clean Compact Header */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
            Shopping Budget
          </h1>
          <p className="text-xs text-slate-500">
            Monthly limit & purchase quality tracking
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setNewLimit(monthlyLimit);
              setIsEditLimitModalOpen(true);
            }}
            className="px-3 py-1.5 bg-white hover:bg-stone-50 border border-stone-200/90 text-stone-700 text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Edit2 className="w-3 h-3 text-stone-400" />
            <span>Adjust Cap</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddPurchaseModalOpen(true)}
            className="px-3.5 py-1.5 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center gap-1 cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 text-white" />
            <span>Log Item</span>
          </button>
        </div>
      </div>

      {/* Main Budget Card */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/90 shadow-subtle space-y-3.5">

        {/* Hero Balance Summary */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
              Available to Spend
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                ₹{remaining.toLocaleString()}
              </span>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                {percentSpent <= 70 ? 'On Track' : percentSpent <= 90 ? 'Near Cap' : 'Over Limit'}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
              Cap vs Spent
            </span>
            <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">
              ₹{spentThisMonth.toLocaleString()} <span className="text-stone-400 font-normal">/ ₹{monthlyLimit.toLocaleString()}</span>
            </p>
          </div>
        </div>

        {/* Smooth Usage Progress */}
        <div className="space-y-1">
          <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                percentSpent > 90 ? 'bg-rose-500' : percentSpent > 75 ? 'bg-amber-500' : 'bg-emerald-600'
              }`}
              style={{ width: `${percentSpent}%` }}
            />
          </div>
        </div>

        {/* Short 1-Line Status */}
        <div className="p-2.5 rounded-xl bg-stone-50/80 border border-stone-200/70 flex items-center justify-between gap-2 text-xs text-stone-600">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="text-[11px] font-medium">
              {percentSpent === 0
                ? `Full ₹${monthlyLimit.toLocaleString()} budget available for planned additions.`
                : `₹${spentThisMonth.toLocaleString()} spent (${percentSpent}%) · ₹${remaining.toLocaleString()} left.`}
            </span>
          </div>
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider shrink-0">
            {budgetData.period || 'This Month'}
          </span>
        </div>
      </div>

      {/* Categories & Ledger Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Category Breakdown */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/90 shadow-subtle space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider">
              Category Caps
            </h3>
            <span className="text-[11px] text-stone-400 font-medium">
              {categories.length} Categories
            </span>
          </div>

          <div className="space-y-2">
            {categories.map((cat, idx) => {
              const catSpent = cat.spent || 0;
              const catAllocated = cat.allocated || 1;
              const catPct = Math.min(100, Math.round((catSpent / catAllocated) * 100));

              return (
                <div key={idx} className="p-2.5 rounded-xl bg-stone-50/80 border border-stone-200/70 space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-900 text-[11px]">{cat.name}</span>
                    <span className="font-semibold text-stone-600 text-[11px]">
                      ₹{catSpent.toLocaleString()} <span className="text-stone-400">/ ₹{catAllocated.toLocaleString()}</span>
                    </span>
                  </div>
                  <div className="w-full bg-stone-200/80 rounded-full h-1 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${catPct}%`,
                        backgroundColor: cat.color || '#10B981'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Purchase History & Satisfaction Ledger */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/90 shadow-subtle space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <div>
              <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider">
                Purchase History
              </h3>
              <p className="text-[10px] text-stone-400 font-medium">
                {purchases.length > 0 ? `${satisfactionRate}% Wardrobe Satisfaction` : 'Rate items to refine recommendations'}
              </p>
            </div>
            <span className="text-[11px] text-stone-400 font-medium">
              {purchases.length} Items
            </span>
          </div>

          {purchases.length === 0 ? (
            <div className="p-6 text-center rounded-2xl bg-stone-50/60 border border-dashed border-stone-200 space-y-2">
              <ShoppingBag className="w-6 h-6 text-stone-400 mx-auto" />
              <div>
                <p className="text-xs font-bold text-slate-800">No Purchases Recorded</p>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Log your buys and rate them to train your stylist.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddPurchaseModalOpen(true)}
                className="px-3 py-1 bg-stone-900 text-white text-xs font-bold rounded-xl shadow-2xs hover:bg-black transition-colors cursor-pointer"
              >
                + Log First Item
              </button>
            </div>
          ) : (
            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
              {purchases.map((purchase) => (
                <div
                  key={purchase.id}
                  className="p-2.5 bg-stone-50/90 rounded-2xl border border-stone-200/70 hover:border-stone-300 transition-all flex items-center justify-between gap-2.5"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={purchase.image || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=200&q=80'}
                      alt={purchase.productName}
                      className="w-10 h-10 rounded-xl object-cover bg-white border border-stone-200 shrink-0 shadow-2xs"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{purchase.productName}</p>
                      <p className="text-[11px] text-stone-500 font-medium">
                        ₹{Number(purchase.price || 0).toLocaleString()} · {purchase.category || 'Garment'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleFeedback(purchase.id, 'good')}
                      className={`px-2 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        purchase.userFeedback === 'good'
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-white hover:bg-emerald-50 text-stone-600 border border-stone-200/80'
                      }`}
                      title="Loved It"
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span className="text-[10px]">Loved</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleFeedback(purchase.id, 'bad')}
                      className={`px-2 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        purchase.userFeedback === 'bad'
                          ? 'bg-rose-600 text-white shadow-2xs'
                          : 'bg-white hover:bg-rose-50 text-stone-600 border border-stone-200/80'
                      }`}
                      title="Regret"
                    >
                      <ThumbsDown className="w-3 h-3" />
                      <span className="text-[10px]">Regret</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Budget Modal */}
      <Modal
        isOpen={isEditLimitModalOpen}
        onClose={() => setIsEditLimitModalOpen(false)}
        title="Adjust Monthly Shopping Cap"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleUpdateLimit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Monthly Cap (₹)
            </label>
            <input
              type="number"
              required
              step="500"
              value={newLimit}
              onChange={(e) => setNewLimit(e.target.value)}
              className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-base font-black text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Quick preset chips */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Quick Presets</span>
            <div className="flex flex-wrap gap-1.5">
              {[5000, 10000, 15000, 25000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setNewLimit(preset)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    Number(newLimit) === preset
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                  }`}
                >
                  ₹{preset.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={() => setIsEditLimitModalOpen(false)}
              className="px-3.5 py-1.5 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-2xs cursor-pointer"
            >
              Save Cap
            </button>
          </div>
        </form>
      </Modal>

      {/* Record Purchase Modal */}
      <Modal
        isOpen={isAddPurchaseModalOpen}
        onClose={() => setIsAddPurchaseModalOpen(false)}
        title="Log a Wardrobe Purchase"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAddPurchase} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Item Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Linen Blend Overshirt"
              value={newPurchase.productName}
              onChange={(e) => setNewPurchase({ ...newPurchase, productName: e.target.value })}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
              <select
                value={newPurchase.category}
                onChange={(e) => setNewPurchase({ ...newPurchase, category: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-slate-900 cursor-pointer"
              >
                <option value="Clothing">Clothing</option>
                <option value="Shoes">Shoes</option>
                <option value="Accessories">Accessories</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Price (₹)</label>
              <input
                type="number"
                required
                placeholder="2499"
                value={newPurchase.price}
                onChange={(e) => setNewPurchase({ ...newPurchase, price: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={() => setIsAddPurchaseModalOpen(false)}
              className="px-3.5 py-1.5 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-2xs cursor-pointer"
            >
              Save Item
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BudgetPage;
