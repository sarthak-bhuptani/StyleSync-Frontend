import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNavigation } from './MobileNavigation';
import { FloatingAIChatWidget } from '../common/FloatingAIChatWidget';
import { Toast } from '../common/Toast';
import { InstallPrompt } from '../common/InstallPrompt';
import { useWardrobe } from '../../context/WardrobeContext';

export const AppLayout = () => {
  const { toastMessage } = useWardrobe();

  return (
    <div className="flex min-h-screen bg-[#FAFAF9] text-slate-800 font-sans antialiased">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] lg:pb-8">
        <Header />
        
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          <Outlet />
        </main>
      </div>

      {/* Floating Corner AI Chat Trigger */}
      <FloatingAIChatWidget />

      {/* 5-Tab Mobile Bottom Navigation Bar with Integrated Center Action Button */}
      <MobileNavigation />

      {/* PWA Home Screen Install Banner */}
      <InstallPrompt />

      {/* Global Toast */}
      {toastMessage && <Toast message={toastMessage.message} type={toastMessage.type} />}
    </div>
  );
};

export default AppLayout;
