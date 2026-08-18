import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  Calendar,
  FileSpreadsheet,
  FileText,
  Filter,
  Download,
  Printer,
  PhoneCall,
  PhoneIncoming,
  CheckCircle2,
  AlertCircle,
  Clock,
  TrendingUp,
  Milk,
  Route,
  CheckSquare,
  Activity,
  ShieldCheck,
  Tag,
  CreditCard,
  Users,
  Building,
  Sparkles,
  SlidersHorizontal,
  ChevronRight,
  Layers,
  Award,
} from 'lucide-react';
import { CallRecord, RouteItem, Farmer } from '../../types';
import { Task } from '../../types/task';
import { StorageService } from '../../services/storageService';
import { TaskStorageService } from '../../services/taskStorageService';
import { PDFService } from '../../services/pdfService';
import { ExcelService } from '../../services/excelService';
import { TaskExportService } from '../../services/taskExportService';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { TaskAnalyticsDashboard } from './TaskAnalyticsDashboard';
import { CustomReportGeneratorModal, ReportCategory } from './CustomReportGeneratorModal';

export const ReportsAnalyticsView: React.FC = () => {
  const { language, t } = useLanguage();
  const { currentUser } = useAuth();
  const isMr = language === 'mr';

  const [reportTab, setReportTab] = useState<'tasks' | 'calls' | 'farmers' | 'routes'>('tasks');

  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  // Filter States
  const [dateRange, setDateRange] = useState<'today' | '7days' | '15days' | 'month' | 'last_month' | 'custom'>('7days');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedRoute, setSelectedRoute] = useState('all');
  const [selectedPurpose, setSelectedPurpose] = useState('all');
  const [farmerMilkTypeFilter, setFarmerMilkTypeFilter] = useState<'all' | 'Cow' | 'Buffalo'>('all');

  // Custom Report Generator Modal State
  const [isGeneratorModalOpen, setIsGeneratorModalOpen] = useState(false);
  const [generatorCategory, setGeneratorCategory] = useState<ReportCategory>('calls');

  const loadData = () => {
    setCalls(StorageService.getCalls());
    setRoutes(StorageService.getRoutes());
    setFarmers(StorageService.getFarmers());
    setTasks(TaskStorageService.getTasks());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('dairy_storage_updated', loadData);
    window.addEventListener('procure_tasks_updated', loadData);
    return () => {
      window.removeEventListener('dairy_storage_updated', loadData);
      window.removeEventListener('procure_tasks_updated', loadData);
    };
  }, []);

  const handleDateRangePreset = (preset: 'today' | '7days' | '15days' | 'month' | 'last_month') => {
    setDateRange(preset);
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    if (preset === 'today') {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === '7days') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      setStartDate(d.toISOString().split('T')[0]);
      setEndDate(todayStr);
    } else if (preset === '15days') {
      const d = new Date();
      d.setDate(d.getDate() - 15);
      setStartDate(d.toISOString().split('T')[0]);
      setEndDate(todayStr);
    } else if (preset === 'month') {
      const d = new Date(today.getFullYear(), today.getMonth(), 1);
      setStartDate(d.toISOString().split('T')[0]);
      setEndDate(todayStr);
    } else if (preset === 'last_month') {
      const firstDay = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth(), 0);
      setStartDate(firstDay.toISOString().split('T')[0]);
      setEndDate(lastDay.toISOString().split('T')[0]);
    }
  };

  const filteredCalls = useMemo(() => {
    return calls.filter(c => {
      if (startDate && c.date < startDate) return false;
      if (endDate && c.date > endDate) return false;
      if (selectedRoute !== 'all' && c.route !== selectedRoute) return false;
      if (selectedPurpose !== 'all' && c.callPurpose !== selectedPurpose) return false;
      return true;
    });
  }, [calls, startDate, endDate, selectedRoute, selectedPurpose]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (startDate && t.createdDate < startDate) return false;
      if (endDate && t.createdDate > endDate) return false;
      if (selectedRoute !== 'all' && !t.route.includes(selectedRoute)) return false;
      return true;
    });
  }, [tasks, startDate, endDate, selectedRoute]);

  const filteredFarmers = useMemo(() => {
    return farmers.filter(f => {
      if (selectedRoute !== 'all' && f.route !== selectedRoute) return false;
      if (farmerMilkTypeFilter !== 'all' && f.milkType !== farmerMilkTypeFilter) return false;
      return true;
    });
  }, [farmers, selectedRoute, farmerMilkTypeFilter]);

  const stats = useMemo(() => {
    const total = filteredCalls.length;
    const answered = filteredCalls.filter(c => c.callStatus === 'Answered' || c.callStatus === 'Completed').length;
    const notAnswered = filteredCalls.filter(
      c => c.callStatus === 'Not Answered' || c.callStatus === 'Not Received' || c.callStatus === 'Busy' || c.callStatus === 'Switched Off'
    ).length;
    const incoming = filteredCalls.filter(c => c.type === 'incoming').length;
    const outgoing = filteredCalls.filter(c => c.type === 'outgoing').length;
    const totalFarmers = filteredFarmers.length;
    const totalMilk = filteredFarmers.reduce((a, b) => a + (b.dailyMilkQuantity || 0), 0);

    return {
      total,
      answered,
      notAnswered,
      incoming,
      outgoing,
      totalFarmers,
      totalMilk,
      responseRate: total > 0 ? Math.round((answered / total) * 100) : 0,
    };
  }, [filteredCalls, filteredFarmers]);

  const handlePrint = () => {
    window.print();
  };

  const handleOpenGenerator = (cat: ReportCategory) => {
    setGeneratorCategory(cat);
    setIsGeneratorModalOpen(true);
  };

  const handleQuickExportPDF = () => {
    const routeLabel = selectedRoute === 'all' ? (isMr ? 'सर्व रूट्स (All Routes)' : 'All Routes') : selectedRoute;
    const dateRangeLabel = `${startDate} ${isMr ? 'ते' : 'to'} ${endDate}`;

    if (reportTab === 'calls') {
      PDFService.generateCustomPDFReport({
        category: 'calls',
        title: isMr ? 'दैनिक कॉल रोजनिशी व गवळी संवाद अहवाल' : 'Procure Diary Field Call Diary & Communication Report',
        startDate,
        endDate,
        dateRangeLabel,
        routeFilter: routeLabel,
        officerName: currentUser?.name || 'Milk Procurement Executive',
        calls: filteredCalls,
      });
    } else if (reportTab === 'farmers') {
      PDFService.generateCustomPDFReport({
        category: 'farmers',
        title: isMr ? 'गवळी मास्टर डिरेक्टरी व FSSAI परवाना नोंदवही' : 'Gavali Master Directory & FSSAI Registry',
        routeFilter: routeLabel,
        officerName: currentUser?.name || 'Milk Procurement Executive',
        farmers: filteredFarmers,
        orientation: 'landscape',
      });
    } else if (reportTab === 'tasks') {
      PDFService.generateCustomPDFReport({
        category: 'tasks',
        title: isMr ? 'कार्यपूर्तता व तक्रार निवारण अहवाल' : 'Field Tasks & Action Items Dossier',
        startDate,
        endDate,
        dateRangeLabel,
        routeFilter: routeLabel,
        officerName: currentUser?.name || 'Milk Procurement Executive',
        tasks: filteredTasks,
      });
    } else {
      PDFService.generateCustomPDFReport({
        category: 'routes',
        title: isMr ? 'रूटनिहाय संकलन व कार्यक्षमता सारांश' : 'Route-wise Milk Procurement & Efficiency Audit',
        routeFilter: routeLabel,
        officerName: currentUser?.name || 'Milk Procurement Executive',
        farmers: filteredFarmers,
        routes,
      });
    }
  };

  const handleExportExcel = () => {
    if (reportTab === 'tasks') {
      TaskExportService.exportTasksToExcel(filteredTasks);
    } else if (reportTab === 'calls') {
      ExcelService.exportCallsToExcel(
        filteredCalls,
        `Procure_Diary_Calls_${selectedRoute}_${startDate}_to_${endDate}.xlsx`
      );
    } else if (reportTab === 'farmers') {
      ExcelService.exportFarmersToExcel(
        filteredFarmers,
        `Procure_Diary_Gavali_${selectedRoute}.xlsx`
      );
    } else {
      ExcelService.exportMasterWorkbook(filteredCalls, filteredFarmers, [], [], routes);
    }
  };

  return (
    <div className="space-y-4 pb-20 md:pb-6 animate-in fade-in print-area">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/30">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {isMr ? 'अहवाल व विश्लेषण केंद्र (Reports & PDF Generation)' : 'Procurement Reports & PDF Generation'}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Official ISO/FSSAI
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {isMr
                ? 'कालावधी व रूट निवडून अधिकृत A4 PDF अहवाल तयार करा व प्रिंट काढा'
                : 'Select date ranges & routes to generate cleanly formatted, verified PDF documents'}
            </p>
          </div>
        </div>

        {/* Top Action Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Custom PDF Generator Wizard Launcher */}
          <button
            type="button"
            onClick={() => handleOpenGenerator(reportTab === 'farmers' ? 'farmers' : reportTab === 'tasks' ? 'tasks' : 'calls')}
            className="px-4 py-2.5 bg-linear-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>{isMr ? 'सानुकूल अहवाल जनरेटर (Custom PDF)' : 'Custom PDF Generator'}</span>
          </button>

          <button
            type="button"
            onClick={handleQuickExportPDF}
            className="px-3.5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-2xl shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            title="Download Clean PDF with current active filters"
          >
            <FileText className="w-4 h-4" />
            <span>{isMr ? 'थेट PDF डाऊनलोड' : 'Export PDF'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportExcel}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold text-xs rounded-2xl shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>{isMr ? 'एक्सेल (XLSX)' : 'Excel'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl cursor-pointer active:scale-95 transition-all"
            title="Print View"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Official Print Header (Visible ONLY during print) */}
      <div className="hidden print:block border-b-2 border-emerald-600 pb-3 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-slate-900">
              {isMr ? 'प्रोक्युअर डायरी - दूध संकलन व क्षेत्रीय अधिकारी रोजनिशी अहवाल' : 'PROCURE DIARY – MILK PROCUREMENT EXECUTIVE CRM'}
            </h1>
            <p className="text-xs text-slate-600">
              {isMr ? 'दैनिक दुग्ध संकलन, गवळी संपर्क, FSSAI परवाने व कार्यपूर्तता अधिकृत नोंद' : 'Official Milk Procurement, Farmer Calls, FSSAI Verification & Field Audit Report'}
            </p>
          </div>
          <div className="text-right text-xs text-slate-600">
            <p><strong>{isMr ? 'दिनांक:' : 'Date:'}</strong> {new Date().toLocaleDateString()}</p>
            <p><strong>{isMr ? 'अधिकारी:' : 'Officer:'}</strong> {currentUser?.name || 'Field Officer'}</p>
            <p><strong>{isMr ? 'कालावधी:' : 'Range:'}</strong> {startDate} to {endDate}</p>
            <p><strong>{isMr ? 'रूट:' : 'Route:'}</strong> {selectedRoute === 'all' ? (isMr ? 'सर्व रूट्स' : 'All Routes') : selectedRoute}</p>
          </div>
        </div>
      </div>

      {/* Interactive Date Range & Route Selection Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              {isMr ? 'अहवाल फिल्टर व कालावधी निवड (Filter Criteria)' : 'Report Date Range & Route Filters'}
            </h3>
          </div>

          {/* Preset date buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: 'today', mr: 'आज', en: 'Today' },
              { id: '7days', mr: 'मागील ७ दिवस', en: 'Last 7 Days' },
              { id: '15days', mr: '१५ दिवस', en: '15 Days' },
              { id: 'month', mr: 'चालू महिना', en: 'This Month' },
              { id: 'last_month', mr: 'मागील महिना', en: 'Last Month' },
            ].map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleDateRangePreset(p.id as any)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                  dateRange === p.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {isMr ? p.mr : p.en}
              </button>
            ))}
          </div>
        </div>

        {/* Date From & To, Route, and Purpose Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-slate-500 dark:text-slate-400 mb-1 font-semibold flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isMr ? 'दिनांक पासून (From Date):' : 'From Date:'}</span>
            </label>
            <input
              type="date"
              value={startDate}
              onChange={e => {
                setStartDate(e.target.value);
                setDateRange('custom');
              }}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white font-mono font-semibold"
            />
          </div>

          <div>
            <label className="block text-slate-500 dark:text-slate-400 mb-1 font-semibold flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isMr ? 'दिनांक पर्यंत (To Date):' : 'To Date:'}</span>
            </label>
            <input
              type="date"
              value={endDate}
              onChange={e => {
                setEndDate(e.target.value);
                setDateRange('custom');
              }}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white font-mono font-semibold"
            />
          </div>

          <div>
            <label className="block text-slate-500 dark:text-slate-400 mb-1 font-semibold flex items-center gap-1">
              <Route className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isMr ? 'रूट निवडा (Select Route):' : 'Route Selection:'}</span>
            </label>
            <select
              value={selectedRoute}
              onChange={e => setSelectedRoute(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white font-semibold"
            >
              <option value="all">{isMr ? '🌟 सर्व रूट्स एकत्रित (All Routes)' : '🌟 All Routes'}</option>
              {routes.map(r => (
                <option key={r.id} value={r.routeNumber}>
                  📍 {r.routeNumber} - {r.routeName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-500 dark:text-slate-400 mb-1 font-semibold flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isMr ? 'उद्देश / प्रकार (Purpose / Milk):' : 'Purpose / Type:'}</span>
            </label>
            {reportTab === 'farmers' ? (
              <select
                value={farmerMilkTypeFilter}
                onChange={e => setFarmerMilkTypeFilter(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white font-semibold"
              >
                <option value="all">{isMr ? 'सर्व प्रकार (All Types)' : 'All Types'}</option>
                <option value="Cow">{isMr ? 'गाय दूध (Cow Milk)' : 'Cow Milk'}</option>
                <option value="Buffalo">{isMr ? 'म्हैस दूध (Buffalo Milk)' : 'Buffalo Milk'}</option>
              </select>
            ) : (
              <select
                value={selectedPurpose}
                onChange={e => setSelectedPurpose(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white font-semibold"
              >
                <option value="all">{isMr ? 'सर्व उद्देश (All Purposes)' : 'All Purposes'}</option>
                <option value="Milk Rate Inquiry">Milk Rate Inquiry</option>
                <option value="Fat/SNF Problem">Fat/SNF Problem</option>
                <option value="Payment Inquiry">Payment Inquiry</option>
                <option value="Cattle Feed Requirement">Cattle Feed</option>
                <option value="Veterinary Support">Veterinary Support</option>
                <option value="General Follow-up">General Follow-up</option>
              </select>
            )}
          </div>
        </div>

        {/* Live Matching Records Status Ribbon */}
        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/60 flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-300">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              {isMr ? 'निवडलेल्या निकषांनुसार उपलब्ध माहिती:' : 'Matching Records for active filters:'}{' '}
              <strong>{filteredCalls.length} {isMr ? 'कॉल नोंदी' : 'Calls'}</strong> •{' '}
              <strong>{filteredTasks.length} {isMr ? 'कामे' : 'Tasks'}</strong> •{' '}
              <strong>{filteredFarmers.length} {isMr ? 'गवळी' : 'Producers'}</strong> (
              <strong className="text-blue-600">{filteredFarmers.reduce((s, f) => s + f.dailyMilkQuantity, 0)} L/day</strong>)
            </span>
          </div>

          <button
            type="button"
            onClick={handleQuickExportPDF}
            className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 underline hover:text-emerald-900 cursor-pointer flex items-center gap-1"
          >
            <span>{isMr ? 'या फिल्टरनुसार PDF डाऊनलोड करा' : 'Export this selection to PDF'}</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs no-print">
        <button
          type="button"
          onClick={() => setReportTab('tasks')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            reportTab === 'tasks'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>{isMr ? '१. कार्यपूर्तता विश्लेषण' : '1. Task Lifecycle & Trends'}</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-bold">
            {filteredTasks.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setReportTab('calls')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            reportTab === 'calls'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <PhoneCall className="w-4 h-4" />
          <span>{isMr ? '२. कॉल रोजनिशी अहवाल' : '2. Field Call Register'}</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-bold">
            {filteredCalls.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setReportTab('farmers')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            reportTab === 'farmers'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{isMr ? '३. गवळी व FSSAI परवाना नोंद' : '3. Gavali & FSSAI Directory'}</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-bold">
            {filteredFarmers.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Task Analytics Dashboard */}
      {reportTab === 'tasks' && <TaskAnalyticsDashboard tasks={filteredTasks} />}

      {/* Tab 2: Call Reports & Route Density */}
      {reportTab === 'calls' && (
        <div className="space-y-4">
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:grid-cols-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1 print:border-slate-300">
              <span className="text-[11px] font-medium text-slate-400 block">{isMr ? 'एकूण कॉल नोंदी' : 'Total Calls'}</span>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{stats.total}</div>
              <span className="text-[10px] text-emerald-600 font-bold">{stats.incoming} Inbound • {stats.outgoing} Outbound</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1 print:border-slate-300">
              <span className="text-[11px] font-medium text-slate-400 block">{isMr ? 'उत्तर दिलेले कॉल' : 'Answered / Completed'}</span>
              <div className="text-xl sm:text-2xl font-black text-emerald-600">{stats.answered}</div>
              <span className="text-[10px] text-slate-400 font-bold">{stats.responseRate}% Success Rate</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1 print:border-slate-300">
              <span className="text-[11px] font-medium text-slate-400 block">{isMr ? 'अनुत्तरित / व्यस्त' : 'Unanswered / Busy'}</span>
              <div className="text-xl sm:text-2xl font-black text-amber-600">{stats.notAnswered}</div>
              <span className="text-[10px] text-amber-600 font-bold">{isMr ? 'पुन्हा संपर्क आवश्यक' : 'Follow-up Needed'}</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1 print:border-slate-300">
              <span className="text-[11px] font-medium text-slate-400 block">{isMr ? 'दैनिक संकलन' : 'Total Milk Daily'}</span>
              <div className="text-xl sm:text-2xl font-black text-blue-600">{stats.totalMilk} L</div>
              <span className="text-[10px] text-blue-600 font-bold">{stats.totalFarmers} Active Farmers</span>
            </div>
          </div>

          {/* Filtered Records Data Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden print:border-slate-300">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {isMr ? 'तपशीलवार कॉल रेकॉर्ड्स व रोजनिशी' : 'Detailed Field Call Log Records'} ({filteredCalls.length})
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                {startDate} {isMr ? 'ते' : 'to'} {endDate}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">{isMr ? 'दिनांक व वेळ' : 'Date & Time'}</th>
                    <th className="p-3">{isMr ? 'गवळी नाव व कोड' : 'Gavali & Code'}</th>
                    <th className="p-3">{isMr ? 'मोबाईल' : 'Mobile'}</th>
                    <th className="p-3">{isMr ? 'रूट / गाव' : 'Route / Village'}</th>
                    <th className="p-3">{isMr ? 'कॉल उद्देश' : 'Call Purpose'}</th>
                    <th className="p-3">{isMr ? 'चर्चा सारांश' : 'Discussion Summary'}</th>
                    <th className="p-3">{isMr ? 'स्थिती' : 'Status'}</th>
                    <th className="p-3">{isMr ? 'फॉलो-अप' : 'Follow-up'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {filteredCalls.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400">
                        {isMr ? 'निवडलेल्या फिल्टरनुसार कोणत्याही नोंदी सापडल्या नाहीत.' : 'No call records match the selected filters.'}
                      </td>
                    </tr>
                  ) : (
                    filteredCalls.map((c, idx) => (
                      <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-bold text-slate-400">{idx + 1}</td>
                        <td className="p-3 whitespace-nowrap text-slate-600 dark:text-slate-300 font-mono">
                          {c.date} <span className="text-slate-400 text-[10px] block">{c.time} ({c.type === 'incoming' ? 'IN' : 'OUT'})</span>
                        </td>
                        <td className="p-3">
                          <span className="font-bold text-slate-900 dark:text-white block">{c.farmerName}</span>
                          <span className="text-[10px] text-emerald-600 font-mono font-bold">{c.farmerCode}</span>
                        </td>
                        <td className="p-3 font-mono">{c.mobileNumber}</td>
                        <td className="p-3 whitespace-nowrap">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 block">{c.route}</span>
                          <span className="text-[10px] text-slate-400">{c.village}</span>
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800">
                            {c.callPurpose}
                          </span>
                        </td>
                        <td className="p-3 max-w-xs">{c.discussion}</td>
                        <td className="p-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              c.callStatus === 'Completed' || c.callStatus === 'Answered'
                                ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            {c.callStatus}
                          </span>
                        </td>
                        <td className="p-3 whitespace-nowrap font-mono text-[11px] text-amber-600 dark:text-amber-400">
                          {c.followUpDate || '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Gavali Master & FSSAI Registry Report */}
      {reportTab === 'farmers' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden print:border-slate-300">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{isMr ? 'गवळी मास्टर, दुग्ध संकलन व FSSAI परवाना नोंदवही' : 'Gavali Master Directory & FSSAI Registry'}</span>
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                {filteredFarmers.length} {isMr ? 'गवळी उत्पादक' : 'Producers'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">{isMr ? 'कोड' : 'Code'}</th>
                    <th className="p-3">{isMr ? 'गवळ्याचे नाव' : 'Gavali Name'}</th>
                    <th className="p-3">{isMr ? 'मोबाईल' : 'Mobile'}</th>
                    <th className="p-3">{isMr ? 'रूट व गाव' : 'Route & Village'}</th>
                    <th className="p-3">{isMr ? 'दूध प्रकार व संकलन' : 'Milk & Volume'}</th>
                    <th className="p-3">{isMr ? 'सकाळ / संध्याकाळ' : 'Morn / Eve'}</th>
                    <th className="p-3">{isMr ? 'FAT / SNF' : 'FAT / SNF'}</th>
                    <th className="p-3">{isMr ? 'दर (₹/L)' : 'Rate'}</th>
                    <th className="p-3">{isMr ? '१० दिवसांचे बिल' : '10-Day Est.'}</th>
                    <th className="p-3">{isMr ? 'FSSAI परवाना क्र. व स्थिती' : 'FSSAI License'}</th>
                    <th className="p-3">{isMr ? 'स्थिती' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {filteredFarmers.map((f, idx) => {
                    const tenDayEst = (f.dailyMilkQuantity * (f.currentRate || 39.5) * 10).toFixed(0);
                    return (
                      <tr key={f.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-bold text-slate-400">{idx + 1}</td>
                        <td className="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">{f.farmerCode}</td>
                        <td className="p-3 font-bold text-slate-900 dark:text-white">{f.farmerName}</td>
                        <td className="p-3 font-mono">{f.mobileNumber}</td>
                        <td className="p-3 whitespace-nowrap">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 block">{f.route}</span>
                          <span className="text-[10px] text-slate-400">{f.village}</span>
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span className="font-bold text-slate-900 dark:text-white">{f.dailyMilkQuantity} L/day</span>
                          <span className="text-[10px] text-slate-400 block">{f.milkType}</span>
                        </td>
                        <td className="p-3 whitespace-nowrap text-slate-600 dark:text-slate-400">
                          {f.morningMilkQty || Math.round(f.dailyMilkQuantity * 0.55)}L / {f.eveningMilkQty || Math.round(f.dailyMilkQuantity * 0.45)}L
                        </td>
                        <td className="p-3 whitespace-nowrap font-bold text-emerald-600 dark:text-emerald-400">
                          {f.avgFat || 3.8}% F | {f.avgSNF || 8.5}% S
                        </td>
                        <td className="p-3 whitespace-nowrap font-bold text-slate-900 dark:text-white">
                          ₹{f.currentRate || 39.5}
                        </td>
                        <td className="p-3 whitespace-nowrap font-bold text-amber-600 dark:text-amber-400">
                          ₹{Number(tenDayEst).toLocaleString('en-IN')}
                        </td>
                        <td className="p-3">
                          <span className="font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200 block">
                            {f.fssaiNumber || (isMr ? 'नोंदणी नाही' : 'Not Registered')}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full inline-block mt-0.5 ${
                              f.fssaiStatus === 'Active'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            {f.fssaiStatus || 'Active'}
                          </span>
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              f.status === 'Active'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            {f.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Official Signatures Block (Visible in Print Only) */}
      <div className="hidden print:block mt-12 pt-6 border-t border-slate-300">
        <div className="grid grid-cols-3 gap-8 text-center text-xs text-slate-700">
          <div>
            <div className="border-b border-slate-400 mb-2 h-10" />
            <p className="font-bold">{isMr ? 'दूध संकलन अधिकारी स्वाक्षरी' : 'Procurement Executive Signature'}</p>
            <p className="text-[10px] text-slate-500">{currentUser?.name || 'Field Officer'}</p>
          </div>
          <div>
            <div className="border-b border-slate-400 mb-2 h-10" />
            <p className="font-bold">{isMr ? 'रूट सुपरवायझर तपासणी' : 'Route Supervisor / Incharge'}</p>
            <p className="text-[10px] text-slate-500">{isMr ? 'क्षेत्रीय तपासणी व मंजुरी' : 'Field Inspection & Verification'}</p>
          </div>
          <div>
            <div className="border-b border-slate-400 mb-2 h-10" />
            <p className="font-bold">{isMr ? 'डेअरी व्यवस्थापक / प्रमुख' : 'Dairy Plant Head / Reviewer'}</p>
            <p className="text-[10px] text-slate-500">{isMr ? 'अंतिम मंजुरी शिक्का' : 'Final Audit & Record Seal'}</p>
          </div>
        </div>
      </div>

      {/* Reusable Custom Report Generator Modal */}
      <CustomReportGeneratorModal
        isOpen={isGeneratorModalOpen}
        onClose={() => setIsGeneratorModalOpen(false)}
        initialCategory={generatorCategory}
        initialRoute={selectedRoute}
        initialStartDate={startDate}
        initialEndDate={endDate}
        calls={calls}
        farmers={farmers}
        routes={routes}
        tasks={tasks}
      />
    </div>
  );
};
