import React, { useState, useEffect, useMemo } from 'react';
import {
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  CheckCircle2,
  Clock,
  PhoneOff,
  Calendar,
  AlertCircle,
  TrendingUp,
  FileText,
  FileSpreadsheet,
  Plus,
  Search,
  Users,
  Route,
  Sparkles,
  ArrowUpRight,
  MessageCircle,
  MapPin,
  ChevronRight,
  Filter,
  Calculator,
  Milestone,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storageService';
import { PDFService } from '../../services/pdfService';
import { ExcelService } from '../../services/excelService';
import { CallRecord, RouteItem, PendingTask, FollowUpItem, Farmer } from '../../types';

interface DashboardViewProps {
  onNewCall?: (farmer?: Farmer) => void;
  onNewIncomingCall?: (farmer?: Farmer) => void;
  onNewFarmer?: () => void;
  onNavigateTab?: (tab: string) => void;
  onNavigate?: (tab: string) => void;
  onSelectFarmer?: (farmer: Farmer) => void;
  onOpenAI?: () => void;
  onOpenVoiceRecord?: () => void;
  onOpenAIAssistant?: () => void;
  onOpenRateCalc?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNewCall,
  onNewIncomingCall,
  onNewFarmer,
  onNavigateTab,
  onNavigate,
  onSelectFarmer,
  onOpenAI,
  onOpenVoiceRecord,
  onOpenAIAssistant,
  onOpenRateCalc,
}) => {
  const triggerNavigate = onNavigateTab || onNavigate || (() => {});
  const triggerNewCall = onNewCall || (() => {});
  const triggerNewIncomingCall = onNewIncomingCall || (() => triggerNewCall());
  const triggerNewFarmer = onNewFarmer || (() => triggerNavigate('farmers'));
  const triggerSelectFarmer = onSelectFarmer || ((farmer: Farmer) => triggerNewCall(farmer));
  const triggerOpenAI = onOpenAI || onOpenAIAssistant || (() => {});
  const triggerOpenRateCalc = onOpenRateCalc || (() => {});
  const { language, t } = useLanguage();
  const { currentUser } = useAuth();

  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [tasks, setTasks] = useState<PendingTask[]>([]);
  const [followUps, setFollowUps] = useState<FollowUpItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'today' | 'all'>('today');

  const todayStr = new Date().toISOString().split('T')[0];

  const loadData = () => {
    setCalls(StorageService.getCalls());
    setRoutes(StorageService.getRoutes());
    setFarmers(StorageService.getFarmers());
    setTasks(StorageService.getTasks());
    setFollowUps(StorageService.getFollowUps());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('dairy_storage_updated', loadData);
    return () => window.removeEventListener('dairy_storage_updated', loadData);
  }, []);

  // Filtered Calls based on Today / All
  const displayedCalls = useMemo(() => {
    let list = calls;
    if (dateFilter === 'today') {
      list = list.filter(c => c.date === todayStr);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        c =>
          c.farmerName.toLowerCase().includes(q) ||
          c.farmerCode.toLowerCase().includes(q) ||
          c.mobileNumber.includes(q) ||
          c.route.toLowerCase().includes(q) ||
          c.village.toLowerCase().includes(q) ||
          c.callPurpose.toLowerCase().includes(q)
      );
    }
    return list;
  }, [calls, dateFilter, todayStr, searchQuery]);

  // Key KPI Metrics
  const todayCalls = calls.filter(c => c.date === todayStr);
  const totalTodayCount = todayCalls.length;
  const incomingTodayCount = todayCalls.filter(c => c.type === 'incoming').length;
  const outgoingTodayCount = todayCalls.filter(c => c.type === 'outgoing').length;
  const completedTodayCount = todayCalls.filter(c => c.callStatus === 'Completed').length;
  const notReceivedCount = todayCalls.filter(
    c => c.callStatus === 'Not Received' || c.callStatus === 'Switched Off' || c.callStatus === 'Busy' || c.callStatus === 'Out of Coverage'
  ).length;

  const followUpTodayCount = followUps.filter(
    f => f.status === 'pending' && f.scheduledDate === todayStr
  ).length;

  const overdueFollowUpCount = followUps.filter(
    f => f.status === 'pending' && f.scheduledDate < todayStr
  ).length;

  const activePendingTasks = tasks.filter(t => t.status === 'Pending' || t.status === 'In Progress');

  // Route-wise stats
  const routeStats = useMemo(() => {
    return routes.map(r => {
      const routeFarmers = farmers.filter(f => f.route === r.routeNumber || f.route === r.routeName);
      const routeMilk = routeFarmers.reduce((acc, curr) => acc + (curr.dailyMilkQuantity || 0), 0);
      const routeCallsToday = todayCalls.filter(c => c.route === r.routeNumber || c.route.includes(r.routeNumber)).length;
      return {
        ...r,
        farmerCount: routeFarmers.length,
        milkVolume: routeMilk,
        callsToday: routeCallsToday,
      };
    });
  }, [routes, farmers, todayCalls]);

  // PDF & Excel Downloads
  const handleDownloadPDF = () => {
    PDFService.generateDailyCallReport({
      title: language === 'mr' ? 'दैनिक दुग्ध संकलन कॉल व फॉलो-अप अहवाल' : 'Daily Dairy Call & Follow-Up Field Report',
      calls: displayedCalls.length > 0 ? displayedCalls : todayCalls,
      pendingTasks: activePendingTasks,
      followUps,
      officerName: currentUser?.name || 'Field Officer',
    });
  };

  const handleDownloadExcel = () => {
    ExcelService.exportMasterWorkbook(calls, farmers, tasks, followUps, routes);
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 md:pb-6 animate-in fade-in">
      {/* Top Banner: Greeting, Date Selector, and Actions */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white rounded-2xl p-4 sm:p-5 shadow-lg shadow-emerald-900/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-emerald-500/30 text-emerald-200 text-[11px] font-semibold rounded-full border border-emerald-400/20">
                {new Date().toLocaleDateString('mr-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <span className="text-emerald-200 text-xs hidden sm:inline">•</span>
              <span className="text-emerald-100 text-xs font-medium">
                {currentUser?.name} ({currentUser?.role?.toUpperCase()})
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold mt-1 tracking-tight">
              {language === 'mr' ? 'दुग्ध संकलन व फॉलो-अप डॅशबोर्ड' : 'Procurement Field Operations Dashboard'}
            </h2>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => triggerNavigate('plan')}
              className="flex-1 sm:flex-none px-3 py-2 bg-emerald-800 hover:bg-emerald-700 text-emerald-100 text-xs font-bold rounded-xl border border-emerald-500/40 shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              title="Daily Field Work & Tour Planner"
            >
              <Milestone className="w-3.5 h-3.5 text-emerald-300" />
              <span>{language === 'mr' ? 'दौरा नियोजन' : 'Tour Diary'}</span>
            </button>

            <button
              onClick={triggerOpenRateCalc}
              className="flex-1 sm:flex-none px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-bold rounded-xl border border-amber-400/40 shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              title="Milk Rate & Fat Calculator"
            >
              <Calculator className="w-3.5 h-3.5 text-amber-300" />
              <span>{language === 'mr' ? 'दर कॅल्क्युलेटर' : 'Rate Calc'}</span>
            </button>

            <button
              onClick={() => triggerNewCall()}
              className="flex-1 sm:flex-none px-3 py-2 bg-white hover:bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-700" />
              <span>{t('call.new_call')}</span>
            </button>

            <button
              onClick={() => triggerNewIncomingCall()}
              className="flex-1 sm:flex-none px-3 py-2 bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-semibold rounded-xl border border-emerald-400/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <PhoneIncoming className="w-3.5 h-3.5" />
              <span>{t('call.log_incoming')}</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              className="px-3 py-2 bg-emerald-900/60 hover:bg-emerald-900 text-emerald-100 text-xs font-semibold rounded-xl border border-emerald-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Download Today PDF Report"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-300" />
              <span className="hidden md:inline">{t('dash.download_today_pdf')}</span>
            </button>

            <button
              onClick={handleDownloadExcel}
              className="px-2.5 py-2 bg-emerald-900/60 hover:bg-emerald-900 text-emerald-100 text-xs font-semibold rounded-xl border border-emerald-500/30 transition-all flex items-center gap-1 cursor-pointer"
              title="Export Master Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-300" />
            </button>
          </div>
        </div>

        {/* AI Operational Insights Bar */}
        <div
          onClick={triggerOpenAI}
          className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-400/20 flex items-center justify-between gap-3 cursor-pointer hover:bg-emerald-950/60 transition-colors group"
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-400 to-yellow-200 text-amber-950 flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <p className="text-xs text-emerald-100 truncate">
              <strong className="text-amber-300">AI Daily Focus: </strong>
              {language === 'mr'
                ? `आज वाळवा व शिराळा रूटवर ${followUpTodayCount} फॉलो-अप व ${activePendingTasks.length} पशुखाद्य कामे बाकी आहेत. त्वरित पूर्ण करा.`
                : `Focus today: ${followUpTodayCount} follow-ups & ${activePendingTasks.length} feed requests pending on Walwa & Shirala routes.`}
            </p>
          </div>
          <span className="text-xs font-bold text-amber-300 flex items-center gap-1 shrink-0 group-hover:translate-x-0.5 transition-transform">
            <span>{language === 'mr' ? 'AI सल्ला' : 'Ask AI'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* Alert Banner for Overdue Follow-ups if any */}
      {overdueFollowUpCount > 0 && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center justify-between gap-3 text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="text-xs font-bold">
              {language === 'mr'
                ? `लक्ष द्या: ${overdueFollowUpCount} फॉलो-अपची मुदत उलटून गेली आहे!`
                : `Attention: ${overdueFollowUpCount} follow-ups are overdue!`}
            </span>
          </div>
          <button
            onClick={() => triggerNavigate('followups')}
            className="px-2.5 py-1 bg-amber-200/80 hover:bg-amber-300 dark:bg-amber-900/60 dark:hover:bg-amber-800 text-amber-950 dark:text-amber-100 text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            {language === 'mr' ? 'आता पहा' : 'View Now'}
          </button>
        </div>
      )}

      {/* Main KPI Stat Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
        {/* Today Total Calls */}
        <div
          onClick={() => triggerNavigate('calls')}
          className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">{t('dash.today_total')}</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <PhoneCall className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{totalTodayCount}</span>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              IN: {incomingTodayCount} | OUT: {outgoingTodayCount}
            </span>
          </div>
        </div>

        {/* Completed Calls */}
        <div
          onClick={() => triggerNavigate('calls')}
          className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">{t('dash.completed')}</span>
            <div className="w-7 h-7 rounded-lg bg-green-50 dark:bg-green-950/80 text-green-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-green-600 dark:text-green-400">{completedTodayCount}</span>
            <span className="text-[11px] text-slate-400">
              {totalTodayCount > 0 ? Math.round((completedTodayCount / totalTodayCount) * 100) : 0}% success
            </span>
          </div>
        </div>

        {/* Follow-up Due Today */}
        <div
          onClick={() => triggerNavigate('followups')}
          className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-amber-300 dark:hover:border-amber-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">{t('dash.followup_today')}</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/80 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">{followUpTodayCount}</span>
            <span className="text-[11px] text-red-500 font-semibold">
              +{overdueFollowUpCount} {language === 'mr' ? 'थकीत' : 'overdue'}
            </span>
          </div>
        </div>

        {/* Not Received / Busy */}
        <div
          onClick={() => triggerNavigate('calls')}
          className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-red-300 dark:hover:border-red-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">{t('dash.not_received')}</span>
            <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-950/80 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <PhoneOff className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-red-600 dark:text-red-400">{notReceivedCount}</span>
            <span className="text-[11px] text-slate-400">{language === 'mr' ? 'पुन्हा करा' : 'Retry'}</span>
          </div>
        </div>

        {/* Active Pending Tasks */}
        <div
          onClick={() => triggerNavigate('tasks')}
          className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">{t('dash.pending_tasks')}</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/80 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{activePendingTasks.length}</span>
            <span className="text-[11px] text-slate-400">{language === 'mr' ? 'तक्रारी/ऑर्डर' : 'Orders'}</span>
          </div>
        </div>

        {/* Total Farmers & Milk */}
        <div
          onClick={() => triggerNavigate('farmers')}
          className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-purple-300 dark:hover:border-purple-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">{language === 'mr' ? 'एकूण शेतकरी' : 'Total Farmers'}</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/80 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">{farmers.length}</span>
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
              {farmers.reduce((acc, f) => acc + (f.dailyMilkQuantity || 0), 0)} Ltr/day
            </span>
          </div>
        </div>
      </div>

      {/* Center Layout: Route Wise Summary + Quick Search & Call Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left 2 Cols: Today's Calls List with Search */}
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                  {t('dash.recent_calls')}
                </h3>
                <p className="text-xs text-slate-500">
                  {displayedCalls.length} {language === 'mr' ? 'नोंदी सापडल्या' : 'calls recorded'}
                </p>
              </div>

              {/* Search input & Date filter toggle */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:w-56">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder={t('dash.quick_search')}
                    className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl text-xs font-semibold">
                  <button
                    onClick={() => setDateFilter('today')}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      dateFilter === 'today'
                        ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-xs'
                        : 'text-slate-500'
                    }`}
                  >
                    {language === 'mr' ? 'आज' : 'Today'}
                  </button>
                  <button
                    onClick={() => setDateFilter('all')}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      dateFilter === 'all'
                        ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-xs'
                        : 'text-slate-500'
                    }`}
                  >
                    {language === 'mr' ? 'सर्व' : 'All'}
                  </button>
                </div>
              </div>
            </div>

            {/* Calls Table List */}
            <div className="overflow-x-auto">
              {displayedCalls.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  {t('common.no_records')}
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {displayedCalls.slice(0, 8).map(call => {
                    const isIncoming = call.type === 'incoming';
                    const isCompleted = call.callStatus === 'Completed';
                    const matchedFarmer = farmers.find(f => f.farmerCode === call.farmerCode);

                    return (
                      <div
                        key={call.id}
                        className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 p-2 rounded-xl transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                              isIncoming
                                ? 'bg-blue-100 dark:bg-blue-950 text-blue-600'
                                : isCompleted
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600'
                                : 'bg-amber-100 dark:bg-amber-950 text-amber-600'
                            }`}
                          >
                            {isIncoming ? <PhoneIncoming className="w-4 h-4" /> : <PhoneOutgoing className="w-4 h-4" />}
                          </div>

                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                                {call.farmerName}
                              </span>
                              <span className="px-1.5 py-0.2 text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded">
                                {call.farmerCode}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                {call.time} • {call.route}
                              </span>
                            </div>

                            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1">
                              <strong className="text-slate-700 dark:text-slate-200">{call.callPurpose}: </strong>
                              {call.discussion}
                            </p>

                            <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-0.5">
                              <span
                                className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                  call.callStatus === 'Completed'
                                    ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300'
                                    : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                }`}
                              >
                                {call.callStatus}
                              </span>

                              {call.followUpDate && (
                                <span className="text-amber-600 dark:text-amber-400 font-medium">
                                  📅 {language === 'mr' ? 'फॉलो-अप:' : 'Follow-up:'} {call.followUpDate}
                                </span>
                              )}

                              {call.hasPendingWork && (
                                <span className="text-blue-600 dark:text-blue-400 font-medium">
                                  ⚠️ {language === 'mr' ? 'काम बाकी' : 'Task pending'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Fast Actions: Call / WhatsApp / History */}
                        <div className="flex items-center gap-1.5 self-end sm:self-center">
                          <a
                            href={`tel:${call.mobileNumber}`}
                            className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 transition-colors"
                            title="Call Mobile"
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                          </a>

                          <a
                            href={`https://wa.me/91${call.mobileNumber}?text=${encodeURIComponent(
                              language === 'mr'
                                ? `नमस्कार ${call.farmerName}, दूध संकलन अधिकारी यांच्यामार्फत संपर्क. आजचा दर, फॅट व संकलन तपशील...`
                                : `Hello ${call.farmerName}, Milk Procurement Executive contacting regarding collection and rates.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-green-50 dark:bg-green-950 text-green-600 hover:bg-green-100 transition-colors"
                            title="WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>

                          {matchedFarmer && (
                            <button
                              onClick={() => triggerSelectFarmer(matchedFarmer)}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                            >
                              {language === 'mr' ? 'इतिहास' : '360°'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {language === 'mr' ? 'सर्व नोंदी पाहण्यासाठी कॉल रजिस्टर टॅब वापरा' : 'For full records use Call Register'}
              </span>
              <button
                onClick={() => triggerNavigate('calls')}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span>{t('dash.view_all')}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Route Wise Summary & Pending Orders */}
        <div className="space-y-4">
          {/* Route Performance Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Route className="w-4 h-4 text-emerald-600" />
                <span>{t('dash.route_summary')}</span>
              </h3>
              <button
                onClick={() => triggerNavigate('routes')}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                {language === 'mr' ? 'व्यवस्थापन' : 'Manage'}
              </button>
            </div>

            <div className="space-y-2.5">
              {routeStats.slice(0, 5).map(r => (
                <div
                  key={r.id}
                  onClick={() => triggerNavigate('routes')}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {r.routeNumber} - {r.routeName.split(' ')[0]}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      {r.milkVolume} L/day
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>{r.farmerCount} {language === 'mr' ? 'शेतकरी' : 'farmers'}</span>
                    <span>{r.centerCount || 6} {language === 'mr' ? 'केंद्रे' : 'centers'}</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {r.callsToday} {language === 'mr' ? 'कॉल आज' : 'calls today'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Pending Tasks Box */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>{language === 'mr' ? 'त्वरित प्रलंबित कामे' : 'Priority Field Tasks'}</span>
              </h3>
              <button
                onClick={() => triggerNavigate('tasks')}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                {language === 'mr' ? 'सर्व पहा' : 'View All'}
              </button>
            </div>

            <div className="space-y-2">
              {activePendingTasks.slice(0, 4).map(task => (
                <div
                  key={task.id}
                  onClick={() => triggerNavigate('tasks')}
                  className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-blue-50/50 transition-colors cursor-pointer space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-44">
                      {task.workName}
                    </span>
                    <span
                      className={`px-1.5 py-0.2 text-[9px] font-bold rounded uppercase ${
                        task.priority === 'High'
                          ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>{task.farmerName || task.route}</span>
                    <span className="text-blue-600 font-semibold">{task.dueDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
