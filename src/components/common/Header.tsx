import React, { useState, useEffect } from 'react';
import {
  Milk,
  Languages,
  Moon,
  Sun,
  Cloud,
  CheckCircle2,
  Bell,
  User,
  LogOut,
  Sparkles,
  Wifi,
  WifiOff,
  Menu,
  Calculator,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storageService';

interface HeaderProps {
  onOpenAI?: () => void;
  onOpenSync?: () => void;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  onToggleSidebar?: () => void;
  onOpenSidebar?: () => void;
  onOpenNewCall?: () => void;
  onOpenVoiceRecord?: () => void;
  onOpenSyncModal?: () => void;
  onOpenAIAssistant?: () => void;
  onOpenRateCalc?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAI,
  onOpenSync,
  activeTab = 'dashboard',
  setActiveTab,
  onToggleSidebar,
  onOpenSidebar,
  onOpenNewCall,
  onOpenVoiceRecord,
  onOpenSyncModal,
  onOpenAIAssistant,
  onOpenRateCalc,
}) => {
  const triggerOpenAI = onOpenAI || onOpenAIAssistant || (() => {});
  const triggerOpenSync = onOpenSync || onOpenSyncModal || (() => {});
  const triggerOpenRateCalc = onOpenRateCalc || (() => {});
  const triggerToggleSidebar = onToggleSidebar || onOpenSidebar;
  const navigateTab = (tab: string) => {
    if (setActiveTab) setActiveTab(tab);
  };
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { currentUser, logout, isAdmin, isSupervisor } = useAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [followUpDueCount, setFollowUpDueCount] = useState(0);
  const [pendingTaskCount, setPendingTaskCount] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const updateCounts = () => {
      const today = new Date().toISOString().split('T')[0];
      const followUps = StorageService.getFollowUps().filter(
        f => f.status === 'pending' && f.scheduledDate <= today
      );
      const tasks = StorageService.getTasks().filter(
        t => t.status === 'Pending' || t.status === 'In Progress'
      );
      setFollowUpDueCount(followUps.length);
      setPendingTaskCount(tasks.length);
    };

    updateCounts();
    window.addEventListener('dairy_storage_updated', updateCounts);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('dairy_storage_updated', updateCounts);
    };
  }, []);

  const totalAlerts = followUpDueCount + pendingTaskCount;

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-emerald-100 dark:border-slate-800 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2">
        {/* Left: Mobile Menu Toggle & Brand */}
        <div className="flex items-center gap-2 sm:gap-3">
          {triggerToggleSidebar && (
            <button
              onClick={triggerToggleSidebar}
              className="md:hidden p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              title="Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div
            onClick={() => navigateTab('dashboard')}
            className="flex items-center gap-2 cursor-pointer group select-none"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
              <Milk className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-tight">
                  {language === 'mr' ? 'प्रोक्युअर डायरी' : 'Procure Diary'}
                </h1>
                <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded">
                  CRM
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 leading-none">
                {language === 'mr' ? 'दूध संकलन अधिकारी कार्यव्यवस्थापन' : 'Procurement Executive Field CRM'}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Actions (Language, Theme, AI, Sync, Notifications, User) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Rate Calculator Button */}
          <button
            onClick={triggerOpenRateCalc}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300/40 dark:border-amber-700/40 text-xs font-semibold rounded-lg shadow-2xs transition-all cursor-pointer"
            title="Milk Rate & Fat Calculator"
          >
            <Calculator className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="hidden sm:inline">{language === 'mr' ? 'दर कॅल्क्युलेटर' : 'Rate Calc'}</span>
          </button>

          {/* AI Intelligence Assistant Button */}
          <button
            onClick={triggerOpenAI}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-medium rounded-lg shadow-sm shadow-emerald-500/20 transition-all hover:scale-102 cursor-pointer"
            title="AI Dairy Intelligence"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden md:inline font-semibold">{t('nav.ai_assistant')}</span>
          </button>

          {/* Cloud Sync Status Pill */}
          <button
            onClick={triggerOpenSync}
            className={`flex items-center gap-1 px-2 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
              isOnline
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
            }`}
            title="Cloud Database Sync Status"
          >
            {isOnline ? (
              <>
                <Cloud className="w-3.5 h-3.5" />
                <span className="hidden lg:inline text-[11px]">{t('common.synced')}</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden lg:inline text-[11px]">{t('common.offline')}</span>
              </>
            )}
          </button>

          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(language === 'mr' ? 'en' : 'mr')}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            title="Switch Language (मराठी / English)"
          >
            <Languages className="w-3.5 h-3.5" />
            <span>{language === 'mr' ? 'मराठी' : 'EN'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Toggle Light/Dark Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notifications Alert Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg relative cursor-pointer"
              title="Operational Alerts"
            >
              <Bell className="w-4 h-4" />
              {totalAlerts > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {totalAlerts}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {language === 'mr' ? 'दैनंदिन सूचना व अलर्ट' : 'Daily Action Alerts'}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded font-medium">
                    {totalAlerts} {language === 'mr' ? 'बाकी' : 'Due'}
                  </span>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {followUpDueCount > 0 && (
                    <div
                      onClick={() => {
                        navigateTab('followups');
                        setShowNotifications(false);
                      }}
                      className="p-3 hover:bg-amber-50 dark:hover:bg-amber-950/30 cursor-pointer transition-colors"
                    >
                      <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                        {language === 'mr'
                          ? `⚠️ आज ${followUpDueCount} शेतकऱ्यांचे फॉलो-अप घेणे बाकी आहे`
                          : `⚠️ ${followUpDueCount} Follow-ups due today`}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {language === 'mr' ? 'त्वरित कॉल करून पाठपुरावा करा.' : 'Click to review follow-up list.'}
                      </p>
                    </div>
                  )}

                  {pendingTaskCount > 0 && (
                    <div
                      onClick={() => {
                        navigateTab('tasks');
                        setShowNotifications(false);
                      }}
                      className="p-3 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 cursor-pointer transition-colors"
                    >
                      <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                        {language === 'mr'
                          ? `📋 ${pendingTaskCount} प्रलंबित तक्रारी / कामे बाकी आहेत`
                          : `📋 ${pendingTaskCount} Active pending tasks`}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {language === 'mr' ? 'पशुखाद्य, दर किंवा टेस्ट रिपोर्ट कामे.' : 'Click to inspect pending tasks.'}
                      </p>
                    </div>
                  )}

                  {totalAlerts === 0 && (
                    <div className="p-4 text-center text-xs text-slate-400">
                      {language === 'mr' ? 'सर्व कामे अद्ययावत आहेत! ✅' : 'All clear! No overdue items. ✅'}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Role Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-1.5 p-1 sm:px-2 sm:py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] font-bold">
                {currentUser?.name?.charAt(0) || 'U'}
              </div>
              <span className="hidden sm:inline text-xs font-medium max-w-24 truncate">
                {currentUser?.name?.split(' ')[0] || 'User'}
              </span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {currentUser?.name}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {currentUser?.email}
                  </p>
                  <div className="mt-1 flex items-center gap-1">
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded uppercase">
                      {currentUser?.role}
                    </span>
                  </div>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => {
                      setActiveTab('users');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span>{t('nav.users')}</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{t('btn.logout')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
