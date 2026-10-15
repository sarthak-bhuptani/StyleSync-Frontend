import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNavigation } from './MobileNavigation';
import { FloatingStylistOrb } from './FloatingStylistOrb';
import { Toast } from '../common/Toast';
import { InstallPrompt } from '../common/InstallPrompt';
import { useWardrobe } from '../../context/WardrobeContext';

export const AppLayout = () => {
  const { toastMessage, clearToast } = useWardrobe();
  const location = useLocation();
  const isChatRoute = location.pathname === '/assistant';

  return (
    <div className="flex min-h-screen bg-[#F6F4EE] text-[#1A1D1A] font-sans antialiased selection:bg-[#1E2E22]/15 selection:text-[#1E2E22]">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 ${isChatRoute ? 'pb-0 h-[100dvh] overflow-hidden' : 'pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] lg:pb-6'}`}>
        <main className={`flex-1 flex flex-col min-h-0 ${isChatRoute ? 'p-0 pb-0 overflow-hidden max-w-none' : 'p-3.5 sm:p-6 lg:p-8 max-w-7xl'} w-full mx-auto animate-fade-in`}>
          <Outlet />
        </main>
      </div>

      {/* Floating Corner + Button with Quick Modules List (hidden in chat) */}
      {!isChatRoute && <FloatingStylistOrb />}

      {/* 5-Tab Mobile Bottom Navigation Bar (hidden in full chat view) */}
      {!isChatRoute && <MobileNavigation />}

      {/* PWA Home Screen Install Banner */}
      <InstallPrompt />

      {/* Global Toast Notification Popup */}
      {toastMessage && (
        <Toast
          message={toastMessage.message}
          type={toastMessage.type}
          onClose={clearToast}
        />
      )}
    </div>
  );
};

export default AppLayout;
