import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { wardrobeApi, getStoredWardrobe } from '../api/wardrobeApi';
import { productApi } from '../api/productApi';

const WardrobeContext = createContext(null);

export const WardrobeProvider = ({ children }) => {
  const [wardrobe, setWardrobe] = useState(() => getStoredWardrobe());
  const [analyzedProducts, setAnalyzedProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('stylesync_analyzed_products');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isLoading, setIsLoading] = useState(() => getStoredWardrobe().length === 0);
  const [toastMessage, setToastMessage] = useState(null);

  const refreshWardrobe = useCallback(async (forceNetwork = false) => {
    const token = localStorage.getItem('stylesync_token');
    if (!token) {
      const stored = getStoredWardrobe();
      setWardrobe(stored);
      setIsLoading(false);
      return stored;
    }

    try {
      const items = await wardrobeApi.getWardrobe(forceNetwork);
      if (Array.isArray(items)) {
        setWardrobe(items);
      }
      return items;
    } catch (err) {
      console.warn('Wardrobe refresh error:', err.message);
      return getStoredWardrobe();
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch / revalidate on mount and token changes
  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      // 1. Instant sync from local cache
      const cached = getStoredWardrobe();
      if (isMounted && cached.length > 0) {
        setWardrobe(cached);
        setIsLoading(false);
      }

      // 2. Background sync
      const token = localStorage.getItem('stylesync_token');
      if (token) {
        try {
          const [items, products] = await Promise.allSettled([
            wardrobeApi.getWardrobe(false),
            productApi.getAllProducts().catch(() => []),
          ]);

          if (isMounted) {
            if (items.status === 'fulfilled' && Array.isArray(items.value)) {
              setWardrobe(items.value);
            }
            if (products.status === 'fulfilled' && Array.isArray(products.value)) {
              setAnalyzedProducts(products.value);
            }
          }
        } catch (err) {
          console.warn('Initial wardrobe load warning:', err.message);
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      } else {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type, id: Date.now() });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const addWardrobeItem = async (item) => {
    const newItem = await wardrobeApi.addItem(item);
    // Optimistic UI state update
    setWardrobe((prev) => {
      const filtered = prev.filter((it) => it.id !== newItem.id);
      return [newItem, ...filtered];
    });
    showToast(`Added "${newItem.name}" to your wardrobe!`, 'success');
    return newItem;
  };

  const updateWardrobeItem = async (id, updates) => {
    const updated = await wardrobeApi.updateItem(id, updates);
    setWardrobe((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
    showToast('Wardrobe item updated', 'success');
    return updated;
  };

  const deleteWardrobeItem = async (id) => {
    await wardrobeApi.deleteItem(id);
    setWardrobe((prev) => prev.filter((item) => item.id !== id));
    showToast('Item removed from wardrobe', 'info');
  };

  const analyzeNewProduct = async (productData) => {
    const result = await productApi.analyzeProduct(productData);
    setAnalyzedProducts((prev) => [result, ...prev]);
    return result;
  };

  const deleteAnalyzedProduct = async (id) => {
    await productApi.deleteProduct(id);
    setAnalyzedProducts((prev) => prev.filter((p) => p.id !== id));
    showToast('Analyzed product evaluation removed', 'info');
  };

  return (
    <WardrobeContext.Provider
      value={{
        wardrobe,
        analyzedProducts,
        isLoading,
        toastMessage,
        showToast,
        refreshWardrobe,
        addWardrobeItem,
        updateWardrobeItem,
        deleteWardrobeItem,
        analyzeNewProduct,
        deleteAnalyzedProduct,
      }}
    >
      {children}
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

