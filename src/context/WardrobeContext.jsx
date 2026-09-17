import React, { createContext, useContext, useState, useEffect } from 'react';
import { wardrobeApi } from '../api/wardrobeApi';
import { productApi } from '../api/productApi';

const WardrobeContext = createContext(null);

export const WardrobeProvider = ({ children }) => {
  const [wardrobe, setWardrobe] = useState(() => {
    const saved = localStorage.getItem('stylesync_wardrobe');
    return saved ? JSON.parse(saved) : [];
  });
  const [analyzedProducts, setAnalyzedProducts] = useState(() => {
    const saved = localStorage.getItem('stylesync_analyzed_products');
    return saved ? JSON.parse(saved) : [];
  });
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    const loadUserData = async () => {
      const token = localStorage.getItem('stylesync_token');
      if (token) {
        try {
          const items = await wardrobeApi.getWardrobe();
          if (Array.isArray(items)) setWardrobe(items);
          const products = await productApi.getAllProducts();
          if (Array.isArray(products)) setAnalyzedProducts(products);
        } catch (err) {
          console.warn('Could not sync user wardrobe from server:', err.message);
        }
      }
    };
    loadUserData();
  }, []);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type, id: Date.now() });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const addWardrobeItem = async (item) => {
    const newItem = await wardrobeApi.addItem(item);
    setWardrobe(prev => [newItem, ...prev]);
    showToast(`Added "${newItem.name}" to your wardrobe!`, 'success');
    return newItem;
  };

  const updateWardrobeItem = async (id, updates) => {
    const updated = await wardrobeApi.updateItem(id, updates);
    setWardrobe(prev => prev.map(item => item.id === id ? updated : item));
    showToast('Wardrobe item updated', 'success');
    return updated;
  };

  const deleteWardrobeItem = async (id) => {
    await wardrobeApi.deleteItem(id);
    setWardrobe(prev => prev.filter(item => item.id !== id));
    showToast('Item removed from wardrobe', 'info');
  };

  const analyzeNewProduct = async (productData) => {
    const result = await productApi.analyzeProduct(productData);
    setAnalyzedProducts(prev => [result, ...prev]);
    return result;
  };

  return (
    <WardrobeContext.Provider
      value={{
        wardrobe,
        analyzedProducts,
        toastMessage,
        showToast,
        addWardrobeItem,
        updateWardrobeItem,
        deleteWardrobeItem,
        analyzeNewProduct,
      }}
    >
      {children}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-slide-up">
          <div className="px-4 py-2.5 bg-slate-900 text-white rounded-xl shadow-lg text-xs font-semibold flex items-center gap-2 border border-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{toastMessage.message}</span>
          </div>
        </div>
      )}
    </WardrobeContext.Provider>
  );
};

export const useWardrobe = () => {
  const context = useContext(WardrobeContext);
  if (!context) {
    throw new Error('useWardrobe must be used within a WardrobeProvider');
  }
  return context;
};
