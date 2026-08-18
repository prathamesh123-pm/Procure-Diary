import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Calendar,
  PhoneCall,
  Users,
  Route,
  ClipboardList,
  CalendarCheck,
  BarChart3,
  Plus,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { StorageService } from '../../services/storageService';

interface BottomNavProps {
  activeTab: string;
  setActiveTab?: (tab: string) => void;
  onSelectTab?: (tab: string) => void;
  onQuickNewCall?: () => void;
  onOpenNewCall?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  onSelectTab,
  onQuickNewCall,
  onOpenNewCall,
}) => {
  const triggerSelectTab = onSelectTab || setActiveTab || (() => {});
  const triggerQuickNewCall = onQuickNewCall || onOpenNewCall || (() => {});
  const { language, t } = useLanguage();
  const [taskCount, setTaskCount] = useState(0);
  const [followUpCount, setFollowUpCount] = useState(0);

  useEffect(() => {
    const updateBadges = () => {
      const today = new Date().toISOString().split('T')[0];
      const tasks = StorageService.getTasks().filter(
        t => t.status === 'Pending' || t.status === 'In Progress'
      );
      const followUps = StorageService.getFollowUps().filter(
        f => f.status === 'pending' && f.scheduledDate <= today
      );
      setTaskCount(tasks.length);
      setFollowUpCount(followUps.length);
    };

    updateBadges();
    window.addEventListener('dairy_storage_updated', updateBadges);
    return () => window.removeEventListener('dairy_storage_updated', updateBadges);
  }, []);

  const navItems = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { id: 'plan', label: language === 'mr' ? 'दौरा नियोजन' : 'Tour Diary', icon: Calendar },
    { id: 'calls', label: t('nav.calls'), icon: PhoneCall },
    { id: 'farmers', label: t('nav.farmers'), icon: Users },
    { id: 'followups', label: t('nav.followups'), icon: CalendarCheck, badge: followUpCount },
    { id: 'tasks', label: t('nav.tasks'), icon: ClipboardList, badge: taskCount },
    { id: 'reports', label: t('nav.reports'), icon: BarChart3 },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-t border-slate-200 dark:border-slate-800 pb-safe">
      <div className="flex items-center justify-around px-1 py-1.5 relative overflow-x-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => triggerSelectTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all relative cursor-pointer min-w-11 shrink-0 ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-4.5 h-4.5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1 -right-2 min-w-3.5 h-3.5 px-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[9.5px] tracking-tight mt-0.5 max-w-13 truncate">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
