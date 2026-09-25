import React, { useState, useEffect } from 'react';
import {
  Clock,
  ThumbsUp,
  ThumbsDown,
  Star,
  Plus,
  ShoppingBag,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';
import { purchaseApi } from '../api/purchaseApi';
import { RecommendationBadge } from '../components/common/RecommendationBadge';
import { Modal } from '../components/common/Modal';
import { useWardrobe } from '../context/WardrobeContext';
import { EmptyState } from '../components/common/EmptyState';

export const PurchaseHistoryPage = () => {
  const { showToast } = useWardrobe();
  const [purchases, setPurchases] = useState(() => {
    const saved = localStorage.getItem('stylesync_purchases');
    return saved ? JSON.parse(saved) : [];
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    const loadPurchases = async () => {
      try {
        const list = await purchaseApi.getPurchases();
        if (Array.isArray(list)) {
          setPurchases(list);
        }
      } catch (err) {
        console.warn('Could not fetch purchases:', err);
      }
    };
    loadPurchases();
  }, []);

  const [newPurchase, setNewPurchase] = useState({
    productName: '',
    category: 'Shoes',
    price: '',
    buyWiseScore: 88,
    decision: 'BUY',
    notes: '',
    image: ''
  });

  const handleFeedback = async (id, feedbackType) => {
    const updated = await purchaseApi.updateFeedback(id, { feedback: feedbackType });
    setPurchases(prev => prev.map(p => p.id === id ? { ...p, userFeedback: feedbackType } : p));
    showToast(
      feedbackType === 'good'
        ? 'Marked as Great Purchase — AI will prioritize similar styles.'
        : 'Marked as Regret / Bad Purchase — AI will suppress similar profiles.',
      'info'
    );
  };

  const handleRating = async (id, rating) => {
    const updated = await purchaseApi.updateFeedback(id, { rating });
    setPurchases(prev => prev.map(p => p.id === id ? { ...p, userRating: rating } : p));
    showToast(`Logged ${rating}★ rating`, 'success');
  };

  const handleAddPurchase = async (e) => {
    e.preventDefault();
    if (!newPurchase.productName) return;
    const created = await purchaseApi.addPurchase({
      ...newPurchase,
      price: Number(newPurchase.price) || 2999,
      image: newPurchase.image || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&q=80'
    });
    setPurchases(prev => [created, ...prev]);
    setIsAddModalOpen(false);
    showToast('Recorded purchase outcome in your ledger', 'success');
  };

  const totalSpent = purchases.reduce((acc, curr) => acc + (curr.price || 0), 0);
  const goodPurchasesCount = purchases.filter(p => p.userFeedback === 'good' || p.userRating >= 4).length;
  const satisfactionRate = Math.round((goodPurchasesCount / Math.max(1, purchases.length)) * 100);

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-2 border border-emerald-200/60">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span>AI Preference Feedback Loop</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Purchase History</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Rate your actual purchases so StyleSync learns what you truly wear vs. what gathers dust.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 sm:px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-subtle hover:shadow transition-all flex items-center gap-2 active:scale-95 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>Record New Purchase</span>
        </button>
      </div>

      {purchases.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No purchases recorded yet"
          description="Record your recent clothing or shoe purchases to teach StyleSync which buys you love vs. regret."
          actionLabel="Record First Purchase"
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-subtle">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Fashion Spend</span>
              <p className="text-2xl font-black text-slate-900 mt-1">₹{totalSpent.toLocaleString()}</p>
              <span className="text-[11px] text-slate-500">{purchases.length} logged items</span>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-subtle">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">StyleSync Satisfaction</span>
              <p className="text-2xl font-black text-emerald-600 mt-1">{satisfactionRate}%</p>
              <span className="text-[11px] text-slate-500">{goodPurchasesCount} high-satisfaction buys</span>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-subtle">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">AI Accuracy Rating</span>
              <p className="text-2xl font-black text-slate-900 mt-1">4.8 / 5.0</p>
              <span className="text-[11px] text-emerald-600 font-semibold">Continuous learning active</span>
            </div>
          </div>

          {/* Purchases List */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900">Recorded Purchases</h3>

            <div className="space-y-3">
              {purchases.map((purchase) => (
                <div
                  key={purchase.id}
                  className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-subtle hover:shadow-card transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {purchase.image ? (
                      <img
                        src={purchase.image}
                        alt={purchase.productName}
                        className="w-16 h-16 rounded-2xl object-cover bg-slate-100 flex-shrink-0 border border-slate-100"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-slate-400 text-xs">
                        🛍️
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {purchase.category} · {purchase.date || 'Recent'}
                        </span>
                        {purchase.decision && (
                          <RecommendationBadge decision={purchase.decision} size="sm" />
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 truncate">{purchase.productName}</h4>
                      <p className="text-xs font-extrabold text-slate-900 mt-0.5">
                        {purchase.currency || '₹'}{purchase.price?.toLocaleString()}
                        {purchase.buyWiseScore && (
                          <span className="text-slate-400 font-normal ml-2">
                            StyleSync Score: <strong className="text-slate-700">{purchase.buyWiseScore}/100</strong>
                          </span>
                        )}
                      </p>
                      {purchase.notes && (
                        <p className="text-[11px] text-slate-500 italic mt-1 max-w-md">"{purchase.notes}"</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap sm:flex-col items-end gap-2.5 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleRating(purchase.id, star)}
                          className={`p-0.5 transition-colors cursor-pointer ${
                            star <= (purchase.userRating || 0)
                              ? 'text-amber-400'
                              : 'text-slate-200 hover:text-amber-300'
                          }`}
                        >
                          <Star className="w-4 h-4 fill-current" />
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleFeedback(purchase.id, 'good')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          purchase.userFeedback === 'good'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200'
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>Good Buy</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleFeedback(purchase.id, 'bad')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          purchase.userFeedback === 'bad'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200'
                        }`}
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                        <span>Regret</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Record Purchase Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Record New Purchase in History"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAddPurchase} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Product Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Uniqlo Linen Shirt"
              value={newPurchase.productName}
              onChange={(e) => setNewPurchase({ ...newPurchase, productName: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={newPurchase.category}
                onChange={(e) => setNewPurchase({ ...newPurchase, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-slate-900 cursor-pointer"
              >
                <option value="Tops">Tops</option>
                <option value="Bottoms">Bottoms</option>
                <option value="Shoes">Shoes</option>
                <option value="Outerwear">Outerwear</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Price (₹)</label>
              <input
                type="number"
                required
                placeholder="2990"
                value={newPurchase.price}
                onChange={(e) => setNewPurchase({ ...newPurchase, price: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Personal Review / Notes</label>
            <textarea
              rows="2"
              placeholder="How often did you wear it? Any fit surprises?"
              value={newPurchase.notes}
              onChange={(e) => setNewPurchase({ ...newPurchase, notes: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Save Record
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PurchaseHistoryPage;
