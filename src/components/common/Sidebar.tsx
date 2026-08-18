import React from 'react';
import {
  LayoutDashboard,
  PhoneCall,
  PhoneIncoming,
  Users,
  Route,
  ClipboardList,
  CalendarCheck,
  BarChart3,
  ShieldCheck,
  Sparkles,
  Database,
  X,
  FileSpreadsheet,
  Calendar,
  Calculator,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab?: (tab: string) => void;
  onSelectTab?: (tab: string) => void;
  isOpen: boolean;
  onClose?: () => void;
  isDesktop?: boolean;
  onOpenAI?: () => void;
  onOpenSync?: () => void;
  onOpenNewCall?: () => void;
  onOpenVoiceRecord?: () => void;
  onOpenAIAssistant?: () => void;
  onOpenRateCalc?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onSelectTab,
  isOpen,
  onClose,
  isDesktop = false,
  onOpenAI,
  onOpenSync,
  onOpenNewCall,
  onOpenVoiceRecord,
  onOpenAIAssistant,
  onOpenRateCalc,
}) => {
  const triggerSelectTab = onSelectTab || setActiveTab || (() => {});
  const triggerOpenAI = onOpenAI || onOpenAIAssistant || (() => {});
  const triggerOpenSync = onOpenSync || (() => {});
  const triggerOpenRateCalc = onOpenRateCalc || (() => {});
  const { t, language } = useLanguage();
  const { isAdmin } = useAuth();

  const mainNav = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { id: 'plan', label: language === 'mr' ? 'दैनिक दौरा नियोजन' : 'Daily Tour Diary', icon: Calendar },
    { id: 'calls', label: t('nav.calls'), icon: PhoneCall },
    { id: 'incoming', label: t('nav.incoming'), icon: PhoneIncoming },
    { id: 'farmers', label: t('nav.farmers'), icon: Users },
    { id: 'routes', label: t('nav.routes'), icon: Route },
    { id: 'tasks', label: t('nav.tasks'), icon: ClipboardList },
    { id: 'followups', label: t('nav.followups'), icon: CalendarCheck },
    { id: 'reports', label: t('nav.reports'), icon: BarChart3 },
  ];

  const adminNav = [
    { id: 'users', label: t('nav.users'), icon: ShieldCheck },
  ];

  const handleNavClick = (id: string) => {
    triggerSelectTab(id);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="md:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 transition-opacity"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-6 md:hidden">
            <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
              {language === 'mr' ? 'दुग्ध मेनू' : 'Operations Menu'}
            </span>
            <button
              onClick={onClose}
              className="p-1 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-1">
            <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {language === 'mr' ? 'मुख्य ऑपरेशन्स' : 'Core Modules'}
            </div>
            {mainNav.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* AI & Tools Section */}
          <div className="mt-6 space-y-1">
            <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {language === 'mr' ? 'स्मार्ट टूल्स' : 'Intelligence & Data'}
            </div>
            <button
              onClick={() => {
                triggerOpenAI();
                if (onClose) onClose();
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-emerald-500/10 to-teal-500/10 dark:from-emerald-950/40 dark:to-teal-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50 hover:bg-emerald-100/60 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{t('nav.ai_assistant')}</span>
            </button>

            <button
              onClick={() => {
                triggerOpenRateCalc();
                if (onClose) onClose();
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-amber-500/10 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/50 hover:bg-amber-100/60 transition-all cursor-pointer"
            >
              <Calculator className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>{language === 'mr' ? 'दूध दर व फॅट कॅल्क्युलेटर' : 'Rate & Fat Calculator'}</span>
            </button>

            <button
              onClick={() => {
                triggerOpenSync();
                if (onClose) onClose();
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <Database className="w-4 h-4 text-slate-500" />
              <span>{language === 'mr' ? 'क्लाउड बॅकअप / सिंक' : 'Cloud Backup & Sync'}</span>
            </button>
          </div>

          {/* Admin Access Section */}
          {isAdmin && (
            <div className="mt-6 space-y-1">
              <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {language === 'mr' ? 'प्रशासन नियंत्रण' : 'Admin Control'}
              </div>
              {adminNav.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info in sidebar */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex flex-col gap-0.5">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {language === 'mr' ? 'प्रोक्युअर डायरी – एक्झिक्युटिव्ह CRM' : 'Procure Diary – Executive CRM'}
            </span>
            <span>{language === 'mr' ? 'स्थानिक व क्लाउड सिंक सक्षम • PWA' : 'Field Operations Diary • Offline Ready'}</span>
          </div>
        </div>
      </aside>
    </>
  );
};
