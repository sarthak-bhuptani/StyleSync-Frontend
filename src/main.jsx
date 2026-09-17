import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.jsx';
import './index.css';

// One-time purge of legacy mock data & stock photos
if (localStorage.getItem('stylesync_clean_v1') !== 'true') {
  localStorage.removeItem('stylesync_wardrobe');
  localStorage.removeItem('stylesync_analyzed_products');
  localStorage.removeItem('stylesync_purchases');
  localStorage.removeItem('stylesync_outfits');
  localStorage.removeItem('stylesync_budget');
  localStorage.removeItem('stylesync_user');
  localStorage.removeItem('stylesync_token');
  localStorage.setItem('stylesync_clean_v1', 'true');
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 mins
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
