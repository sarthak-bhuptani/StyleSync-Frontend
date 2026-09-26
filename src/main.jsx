import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.jsx';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import './index.css';

// Handle dynamic Vite chunk load errors gracefully (e.g., after new deployments)
window.addEventListener('vite:preloadError', (event) => {
  console.warn('Vite preload dynamic chunk error detected. Reloading fresh page...', event);
  window.location.reload();
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 mins
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

// Register Service Worker for PWA
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        // Auto-update service worker if a new version is waiting
        reg.onupdatefound = () => {
          const installingWorker = reg.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('New StyleSync PWA version available. Auto-updating...');
              }
            };
          }
        };
      })
      .catch((err) => {
        console.warn('StyleSync PWA ServiceWorker registration failed:', err);
      });
  });
}


