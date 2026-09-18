import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings as SettingsIcon,
  ShieldCheck,
  Bell,
  Compass,
  Database,
  Moon,
  LogOut,
  Download,
  RotateCcw,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWardrobe } from '../context/WardrobeContext';

export const SettingsPage = () => {
  const { user, logout } = useAuth();
  const { wardrobe, showToast } = useWardrobe();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState({
    priceDrops: true,
    gapAlerts: true,
    budgetReminders: true,
    weeklyReport: false
  });

  const [aiPreferences, setAiPreferences] = useState({
    strictBudgetEnforcement: true,
    colorAvoidanceSensitivity: 'High',
    versatilityThreshold: 80
  });

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(
      JSON.stringify({ user, wardrobe, exportedAt: new Date().toISOString() }, null, 2)
    );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `stylesync_wardrobe_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Wardrobe data exported as JSON', 'success');
  };

  const handleResetData = () => {
    if (window.confirm('Reset all wardrobe and budget data back to pristine demo state?')) {
      localStorage.clear();
      showToast('All data reset to initial demo state. Reloading...', 'info');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-2 border border-emerald-200/60">
          <SettingsIcon className="w-3.5 h-3.5 text-emerald-600" />
          <span>System & Preferences</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Settings</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Manage your AI preferences, notifications, data export, and privacy safeguards.
        </p>
      </div>

      {/* Privacy Guarantee Banner (Highlighted Requirement) */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-floating border border-slate-800 flex items-start gap-4">
        <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 border border-emerald-500/30">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>StyleSync Privacy Promise</span>
            <span className="text-[10px] uppercase font-extrabold bg-emerald-500 text-slate-950 px-2 py-0.5 rounded">
              Zero Brand Tracking
            </span>
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            "Your photos and wardrobe data are strictly private and only used to personalize your StyleSync experience. We never sell your personal data or receive affiliate kickbacks to alter score verdicts."
          </p>
        </div>
      </div>

      {/* 1. AI Styling Engine Preferences */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-subtle space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Compass className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">AI Evaluation Behavior</h3>
        </div>

        <div className="space-y-3 text-xs">
          <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer">
            <div>
              <span className="font-bold text-slate-800 block">Strict Budget Enforcement</span>
              <span className="text-slate-500">Automatically downgrade score if an item exceeds category ceiling by &gt;20%</span>
            </div>
            <input
              type="checkbox"
              checked={aiPreferences.strictBudgetEnforcement}
              onChange={(e) => setAiPreferences({ ...aiPreferences, strictBudgetEnforcement: e.target.checked })}
              className="w-4 h-4 accent-slate-900 rounded"
            />
          </label>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <div>
              <span className="font-bold text-slate-800 block">Color Avoidance Penalty</span>
              <span className="text-slate-500">How heavily to penalize designated avoid-colors</span>
            </div>
            <select
              value={aiPreferences.colorAvoidanceSensitivity}
              onChange={(e) => setAiPreferences({ ...aiPreferences, colorAvoidanceSensitivity: e.target.value })}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-semibold"
            >
              <option value="Low">Low (-15 pts)</option>
              <option value="Medium">Medium (-25 pts)</option>
              <option value="High">High (Immediate SKIP / -40 pts)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Notifications */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-subtle space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Bell className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Notifications & Alerts</h3>
        </div>

        <div className="space-y-3 text-xs">
          <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer">
            <div>
              <span className="font-bold text-slate-800 block">Wardrobe Gap Alerts</span>
              <span className="text-slate-500">Notify when an essential pairing piece is missing from your closet</span>
            </div>
            <input
              type="checkbox"
              checked={notifications.gapAlerts}
              onChange={(e) => setNotifications({ ...notifications, gapAlerts: e.target.checked })}
              className="w-4 h-4 accent-slate-900 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer">
            <div>
              <span className="font-bold text-slate-800 block">Monthly Budget Check-in</span>
              <span className="text-slate-500">Alert when 75% of your monthly shopping limit has been spent</span>
            </div>
            <input
              type="checkbox"
              checked={notifications.budgetReminders}
              onChange={(e) => setNotifications({ ...notifications, budgetReminders: e.target.checked })}
              className="w-4 h-4 accent-slate-900 rounded"
            />
          </label>
        </div>
      </div>

      {/* 3. Data Management */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-subtle space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Database className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Data Management</h3>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={handleExportData}
            className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Wardrobe JSON</span>
          </button>

          <button
            type="button"
            onClick={handleResetData}
            className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* 4. Session & Logout */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-subtle flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Account Session</h3>
          <p className="text-xs text-slate-400">Signed in as {user?.email || 'sarthak@example.com'}</p>
        </div>

        <button
          onClick={handleLogout}
          className="px-5 py-2.5 bg-slate-900 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
};
