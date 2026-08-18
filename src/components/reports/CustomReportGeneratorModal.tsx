import React, { useState, useMemo } from 'react';
import {
  FileText,
  Calendar,
  Route,
  Filter,
  Download,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  X,
  Sparkles,
  Milk,
  PhoneCall,
  Activity,
  ShieldCheck,
  Building,
  User,
  Sliders,
  CheckSquare,
  ChevronRight,
  Eye,
  Info,
  Clock,
} from 'lucide-react';
import { CallRecord, Farmer, RouteItem } from '../../types';
import { Task } from '../../types/task';
import { PDFService, CustomPDFReportOptions } from '../../services/pdfService';
import { ExcelService } from '../../services/excelService';
import { TaskExportService } from '../../services/taskExportService';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

export type ReportCategory = 'calls' | 'tasks' | 'farmers' | 'routes' | 'master_audit';

interface CustomReportGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: ReportCategory;
  initialRoute?: string;
  initialStartDate?: string;
  initialEndDate?: string;
  calls: CallRecord[];
  farmers: Farmer[];
  routes: RouteItem[];
  tasks: Task[];
}

export const CustomReportGeneratorModal: React.FC<CustomReportGeneratorModalProps> = ({
  isOpen,
  onClose,
  initialCategory = 'calls',
  initialRoute = 'all',
  initialStartDate,
  initialEndDate,
  calls,
  farmers,
  routes,
  tasks,
}) => {
  const { language, t } = useLanguage();
  const { currentUser } = useAuth();
  const isMr = language === 'mr';

  // Report Category State
  const [category, setCategory] = useState<ReportCategory>(initialCategory);

  // Date Range State
  const [datePreset, setDatePreset] = useState<'today' | 'yesterday' | '7days' | '15days' | 'month' | 'last_month' | 'custom'>('7days');
  const [startDate, setStartDate] = useState<string>(() => {
    if (initialStartDate) return initialStartDate;
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => {
    if (initialEndDate) return initialEndDate;
    return new Date().toISOString().split('T')[0];
  });

  // Route State
  const [selectedRoute, setSelectedRoute] = useState<string>(initialRoute || 'all');

  // Additional Granular Filters
  const [selectedMilkType, setSelectedMilkType] = useState<'all' | 'Cow' | 'Buffalo'>('all');
  const [selectedCallPurpose, setSelectedCallPurpose] = useState<string>('all');
  const [selectedCallStatus, setSelectedCallStatus] = useState<string>('all');
  const [selectedTaskStatus, setSelectedTaskStatus] = useState<string>('all');
  const [selectedTaskPriority, setSelectedTaskPriority] = useState<string>('all');

  // Document Customization Options
  const [customTitle, setCustomTitle] = useState<string>('');
  const [includeSummaryCards, setIncludeSummaryCards] = useState<boolean>(true);
  const [includeSignatures, setIncludeSignatures] = useState<boolean>(true);
  const [includeFSSAI, setIncludeFSSAI] = useState<boolean>(true);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Quick Date Preset Handler
  const handleDatePresetChange = (preset: 'today' | 'yesterday' | '7days' | '15days' | 'month' | 'last_month' | 'custom') => {
    setDatePreset(preset);
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    if (preset === 'today') {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === 'yesterday') {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      const yStr = y.toISOString().split('T')[0];
      setStartDate(yStr);
      setEndDate(yStr);
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

  // Filtered Datasets based on selected criteria
  const filteredCalls = useMemo(() => {
    return calls.filter(c => {
      if (startDate && c.date < startDate) return false;
      if (endDate && c.date > endDate) return false;
      if (selectedRoute !== 'all' && c.route !== selectedRoute) return false;
      if (selectedCallPurpose !== 'all' && c.callPurpose !== selectedCallPurpose) return false;
      if (selectedCallStatus !== 'all' && c.callStatus !== selectedCallStatus) return false;
      return true;
    });
  }, [calls, startDate, endDate, selectedRoute, selectedCallPurpose, selectedCallStatus]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (startDate && t.createdDate < startDate) return false;
      if (endDate && t.createdDate > endDate) return false;
      if (selectedRoute !== 'all' && !t.route.includes(selectedRoute)) return false;
      if (selectedTaskStatus !== 'all' && t.status !== selectedTaskStatus) return false;
      if (selectedTaskPriority !== 'all' && t.priority !== selectedTaskPriority) return false;
      return true;
    });
  }, [tasks, startDate, endDate, selectedRoute, selectedTaskStatus, selectedTaskPriority]);

  const filteredFarmers = useMemo(() => {
    return farmers.filter(f => {
      if (selectedRoute !== 'all' && f.route !== selectedRoute) return false;
      if (selectedMilkType !== 'all' && f.milkType !== selectedMilkType) return false;
      return true;
    });
  }, [farmers, selectedRoute, selectedMilkType]);

  // Aggregate Metrics for Live Preview Strip
  const previewMetrics = useMemo(() => {
    const totalMilk = filteredFarmers.reduce((sum, f) => sum + (f.dailyMilkQuantity || 0), 0);
    const tenDayPayout = filteredFarmers.reduce(
      (sum, f) => sum + (f.dailyMilkQuantity || 0) * (f.currentRate || 39.5) * 10,
      0
    );
    const answeredCalls = filteredCalls.filter(c => c.callStatus === 'Answered' || c.callStatus === 'Completed').length;
    const completedTasks = filteredTasks.filter(t => t.status === 'Completed').length;

    return {
      totalMilk,
      tenDayPayout,
      totalCalls: filteredCalls.length,
      answeredCalls,
      totalTasks: filteredTasks.length,
      completedTasks,
      totalFarmers: filteredFarmers.length,
    };
  }, [filteredCalls, filteredTasks, filteredFarmers]);

  if (!isOpen) return null;

  const handleExportPDF = () => {
    setIsGenerating(true);
    try {
      const routeLabel =
        selectedRoute === 'all'
          ? isMr
            ? 'सर्व रूट्स (All Routes)'
            : 'All Routes'
          : selectedRoute;

      const dateRangeLabel = `${startDate} ${isMr ? 'ते' : 'to'} ${endDate}`;

      const options: CustomPDFReportOptions = {
        category,
        title:
          customTitle.trim() ||
          (category === 'calls'
            ? isMr
              ? 'दैनिक कॉल रोजनिशी व गवळी संवाद अहवाल'
              : 'Procurement Field Call Diary & Gavali Communication Report'
            : category === 'tasks'
            ? isMr
              ? 'कार्यपूर्तता व तक्रार निवारण तपशील अहवाल'
              : 'Field Task Lifecycle & Action Items Dossier'
            : category === 'farmers'
            ? isMr
              ? 'गवळी मास्टर डिरेक्टरी व FSSAI परवाना नोंदवही'
              : 'Gavali Master Directory & FSSAI Compliance Register'
            : category === 'routes'
            ? isMr
              ? 'रूटनिहाय दुग्ध संकलन व कार्यक्षमता सारांश'
              : 'Route-wise Milk Procurement & Efficiency Audit'
            : isMr
            ? 'समग्र डेअरी ऑपरेशन्स व क्षेत्रीय ऑडिट अहवाल'
            : 'Comprehensive Field Audit & Procurement Operations Report'),
        dairyName: 'Procure Diary – Milk Procurement Executive CRM',
        reportDate: new Date().toISOString().split('T')[0],
        startDate,
        endDate,
        dateRangeLabel,
        routeFilter: routeLabel,
        officerName: currentUser?.name || 'Milk Procurement Executive',
        orientation,
        includeSummaryCards,
        includeSignatures,
        includeFSSAI,
        calls: filteredCalls,
        tasks: filteredTasks,
        farmers: filteredFarmers,
        routes,
      };

      PDFService.generateCustomPDFReport(options);
      onClose();
    } catch (error) {
      console.error('Error generating PDF report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportExcel = () => {
    if (category === 'calls') {
      ExcelService.exportCallsToExcel(
        filteredCalls,
        `Procure_Diary_Calls_${selectedRoute}_${startDate}_to_${endDate}.xlsx`
      );
    } else if (category === 'tasks') {
      TaskExportService.exportTasksToExcel(filteredTasks);
    } else if (category === 'farmers') {
      ExcelService.exportFarmersToExcel(
        filteredFarmers,
        `Procure_Diary_Gavali_${selectedRoute}.xlsx`
      );
    } else {
      ExcelService.exportMasterWorkbook(
        filteredCalls,
        filteredFarmers,
        [],
        [],
        routes
      );
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{isMr ? 'सानुकूल अहवाल निर्मिती व PDF निर्यात' : 'Custom Report Generator & PDF Export'}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  A4 Ready
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                {isMr
                  ? 'दिनांक कालावधी, रूट व निकष निवडून स्वच्छ व अधिकृत PDF अहवाल डाऊनलोड करा'
                  : 'Select custom date ranges, routes & filters to generate a cleanly formatted PDF'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-slate-800 dark:text-slate-200">
          {/* Step 1: Select Report Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center">1</span>
              <span>{isMr ? 'अहवालाचा प्रकार निवडा (Select Report Category):' : 'Select Report Category:'}</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
              {/* Category 1: Calls */}
              <button
                type="button"
                onClick={() => setCategory('calls')}
                className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                  category === 'calls'
                    ? 'border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/40 ring-2 ring-emerald-600/30'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <PhoneCall className={`w-4 h-4 ${category === 'calls' ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {filteredCalls.length}
                  </span>
                </div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                  {isMr ? 'कॉल रोजनिशी' : 'Call Diary'}
                </h4>
                <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">
                  {isMr ? 'कॉल इतिहास, उद्देश, चर्चा व फॉलो-अप' : 'Communication logs, purposes & follow-ups'}
                </p>
              </button>

              {/* Category 2: Tasks */}
              <button
                type="button"
                onClick={() => setCategory('tasks')}
                className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                  category === 'tasks'
                    ? 'border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/40 ring-2 ring-emerald-600/30'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Activity className={`w-4 h-4 ${category === 'tasks' ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {filteredTasks.length}
                  </span>
                </div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                  {isMr ? 'कार्यपूर्तता अहवाल' : 'Tasks & Actions'}
                </h4>
                <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">
                  {isMr ? 'तक्रारी, कामे, रोजनिशी व निकाल' : 'Field tasks, complaints & resolution logs'}
                </p>
              </button>

              {/* Category 3: Farmers */}
              <button
                type="button"
                onClick={() => setCategory('farmers')}
                className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                  category === 'farmers'
                    ? 'border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/40 ring-2 ring-emerald-600/30'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <ShieldCheck className={`w-4 h-4 ${category === 'farmers' ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {filteredFarmers.length}
                  </span>
                </div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                  {isMr ? 'गवळी व FSSAI नोंद' : 'Gavali & FSSAI'}
                </h4>
                <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">
                  {isMr ? 'दूध प्रमाण, फॅट, दर, १०-दिवसीय बिल' : 'Milk volumes, Fat/SNF, Rates & FSSAI'}
                </p>
              </button>

              {/* Category 4: Route Performance */}
              <button
                type="button"
                onClick={() => setCategory('routes')}
                className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                  category === 'routes'
                    ? 'border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/40 ring-2 ring-emerald-600/30'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Route className={`w-4 h-4 ${category === 'routes' ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {routes.length}
                  </span>
                </div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                  {isMr ? 'रूटनिहाय संकलन' : 'Route Summary'}
                </h4>
                <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">
                  {isMr ? 'रूटनुसार लिटर, सरासरी दर व गवळी' : 'Route milk totals, averages & density'}
                </p>
              </button>

              {/* Category 5: Master Audit Dossier */}
              <button
                type="button"
                onClick={() => setCategory('master_audit')}
                className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                  category === 'master_audit'
                    ? 'border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/40 ring-2 ring-emerald-600/30'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Building className={`w-4 h-4 ${category === 'master_audit' ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                    Full
                  </span>
                </div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                  {isMr ? 'समग्र ऑडिट अहवाल' : 'Master Audit'}
                </h4>
                <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">
                  {isMr ? 'सर्व विभाग एकत्रित अधिकृत नोंदवही' : 'All-in-one comprehensive field dossier'}
                </p>
              </button>
            </div>
          </div>

          {/* Step 2: Date Range & Route Selection */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Date Range Block */}
            <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>{isMr ? 'दिनांक कालावधी (Date Range):' : 'Date Range Selection:'}</span>
              </label>

              {/* Date Presets Chips */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { id: 'today', mr: 'आज', en: 'Today' },
                  { id: 'yesterday', mr: 'काल', en: 'Yesterday' },
                  { id: '7days', mr: 'मागील ७ दिवस', en: 'Last 7 Days' },
                  { id: '15days', mr: '१५ दिवस', en: '15 Days' },
                  { id: 'month', mr: 'चालू महिना', en: 'This Month' },
                  { id: 'last_month', mr: 'मागील महिना', en: 'Last Month' },
                  { id: 'custom', mr: 'सानुकूल (Custom)', en: 'Custom' },
                ].map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleDatePresetChange(p.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                      datePreset === p.id
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {isMr ? p.mr : p.en}
                  </button>
                ))}
              </div>

              {/* Date From & To Inputs */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                    {isMr ? 'दिनांक पासून (From Date):' : 'From Date:'}
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => {
                      setStartDate(e.target.value);
                      setDatePreset('custom');
                    }}
                    className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                    {isMr ? 'दिनांक पर्यंत (To Date):' : 'To Date:'}
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => {
                      setEndDate(e.target.value);
                      setDatePreset('custom');
                    }}
                    className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Route Selection Block */}
            <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Route className="w-4 h-4 text-emerald-600" />
                <span>{isMr ? 'रूट निवड (Route Selection):' : 'Route Selection:'}</span>
              </label>

              <div>
                <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                  {isMr ? 'लक्ष्य रूट निवडा (Select Target Route):' : 'Select Target Route:'}
                </label>
                <select
                  value={selectedRoute}
                  onChange={e => setSelectedRoute(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                >
                  <option value="all">
                    {isMr ? '🌟 सर्व रूट्स एकत्रित (All Routes - Complete Dairy)' : '🌟 All Routes - Complete Dairy'}
                  </option>
                  {routes.map(r => (
                    <option key={r.id} value={r.routeNumber}>
                      📍 {r.routeNumber} - {r.routeName} ({r.totalFarmers || 0} गवळी)
                    </option>
                  ))}
                </select>
              </div>

              {/* Granular Secondary Filters dependent on Category */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                {category === 'farmers' && (
                  <div>
                    <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                      {isMr ? 'दूध प्रकार (Milk Type):' : 'Milk Type:'}
                    </label>
                    <select
                      value={selectedMilkType}
                      onChange={e => setSelectedMilkType(e.target.value as any)}
                      className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="all">{isMr ? 'सर्व प्रकार (All)' : 'All'}</option>
                      <option value="Cow">{isMr ? 'गाय दूध (Cow)' : 'Cow'}</option>
                      <option value="Buffalo">{isMr ? 'म्हैस दूध (Buffalo)' : 'Buffalo'}</option>
                    </select>
                  </div>
                )}

                {category === 'calls' && (
                  <div>
                    <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                      {isMr ? 'कॉल उद्देश (Purpose):' : 'Call Purpose:'}
                    </label>
                    <select
                      value={selectedCallPurpose}
                      onChange={e => setSelectedCallPurpose(e.target.value)}
                      className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="all">{isMr ? 'सर्व उद्देश (All)' : 'All'}</option>
                      <option value="Milk Rate Inquiry">Milk Rate Inquiry</option>
                      <option value="Fat/SNF Problem">Fat/SNF Problem</option>
                      <option value="Payment Inquiry">Payment Inquiry</option>
                      <option value="Cattle Feed Requirement">Cattle Feed</option>
                      <option value="Veterinary Support">Veterinary Support</option>
                      <option value="General Follow-up">General Follow-up</option>
                    </select>
                  </div>
                )}

                {category === 'tasks' && (
                  <div>
                    <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                      {isMr ? 'काम स्थिती (Task Status):' : 'Task Status:'}
                    </label>
                    <select
                      value={selectedTaskStatus}
                      onChange={e => setSelectedTaskStatus(e.target.value)}
                      className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="all">{isMr ? 'सर्व स्थिती (All)' : 'All'}</option>
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                )}

                {/* Page Orientation */}
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                    {isMr ? 'मांडणी (Layout Orientation):' : 'PDF Orientation:'}
                  </label>
                  <select
                    value={orientation}
                    onChange={e => setOrientation(e.target.value as any)}
                    className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="portrait">{isMr ? 'उभी मांडणी (Portrait - A4)' : 'Portrait (A4)'}</option>
                    <option value="landscape">{isMr ? 'आडवी मांडणी (Landscape - A4)' : 'Landscape (A4)'}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Document Layout & Signature Options */}
          <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-emerald-600" />
                <span>{isMr ? 'अहवाल स्वरूप व अधिकृत स्वाक्षरी पर्याय:' : 'Formatting & Official Verification Options:'}</span>
              </label>

              <div className="flex items-center gap-4 flex-wrap text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeSummaryCards}
                    onChange={e => setIncludeSummaryCards(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span>{isMr ? 'KPI आकडेवारी बॉक्स' : 'Summary KPI Cards'}</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeSignatures}
                    onChange={e => setIncludeSignatures(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span>{isMr ? 'अधिकृत स्वाक्षरी शिक्के' : 'Officer Signatures'}</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeFSSAI}
                    onChange={e => setIncludeFSSAI(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span>{isMr ? 'FSSAI परवाना नोंद' : 'FSSAI Details'}</span>
                </label>
              </div>
            </div>

            {/* Custom Report Title Input */}
            <div>
              <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                {isMr ? 'अहवालाचे सानुकूल शीर्षक (पर्यायी - Custom Title):' : 'Custom Report Title (Optional):'}
              </label>
              <input
                type="text"
                value={customTitle}
                onChange={e => setCustomTitle(e.target.value)}
                placeholder={
                  isMr
                    ? 'उदा. सांगली पूर्व रूट - दैनिक संकलन व कार्यपूर्तता अहवाल'
                    : 'e.g., Sangli East Route - Field Procurement Audit Dossier'
                }
                className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Live Preview Summary Strip */}
          <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                  {isMr ? 'निवडलेल्या निकषांनुसार थेट डेटा पूर्वावलोकन:' : 'Live Filtered Records Summary:'}
                </h4>
              </div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                <span>{isMr ? 'कालावधी:' : 'Period:'} <strong>{startDate} to {endDate}</strong></span> •{' '}
                <span>{isMr ? 'रूट:' : 'Route:'} <strong>{selectedRoute === 'all' ? (isMr ? 'सर्व रूट्स' : 'All Routes') : selectedRoute}</strong></span>
              </p>
            </div>

            {/* Metrics Chips */}
            <div className="flex items-center gap-2 flex-wrap">
              {category === 'calls' && (
                <>
                  <div className="bg-white dark:bg-slate-850 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 text-center">
                    <span className="text-[10px] text-slate-500 block">{isMr ? 'एकूण कॉल' : 'Calls'}</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white">{previewMetrics.totalCalls}</span>
                  </div>
                  <div className="bg-white dark:bg-slate-850 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 text-center">
                    <span className="text-[10px] text-slate-500 block">{isMr ? 'उत्तरित' : 'Answered'}</span>
                    <span className="text-sm font-black text-emerald-600">{previewMetrics.answeredCalls}</span>
                  </div>
                </>
              )}

              {category === 'tasks' && (
                <>
                  <div className="bg-white dark:bg-slate-850 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 text-center">
                    <span className="text-[10px] text-slate-500 block">{isMr ? 'एकूण कामे' : 'Tasks'}</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white">{previewMetrics.totalTasks}</span>
                  </div>
                  <div className="bg-white dark:bg-slate-850 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 text-center">
                    <span className="text-[10px] text-slate-500 block">{isMr ? 'पूर्ण कामे' : 'Done'}</span>
                    <span className="text-sm font-black text-emerald-600">{previewMetrics.completedTasks}</span>
                  </div>
                </>
              )}

              {(category === 'farmers' || category === 'routes' || category === 'master_audit') && (
                <>
                  <div className="bg-white dark:bg-slate-850 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 text-center">
                    <span className="text-[10px] text-slate-500 block">{isMr ? 'गवळी' : 'Producers'}</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white">{previewMetrics.totalFarmers}</span>
                  </div>
                  <div className="bg-white dark:bg-slate-850 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 text-center">
                    <span className="text-[10px] text-slate-500 block">{isMr ? 'दैनिक संकलन' : 'Daily Milk'}</span>
                    <span className="text-sm font-black text-blue-600">{previewMetrics.totalMilk} L</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{isMr ? 'अहवाल थेट PDF किंवा एक्सेल फाईल म्हणून सेव्ह होईल' : 'Report will be generated directly with verified formatting'}</span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs cursor-pointer"
            >
              {isMr ? 'रद्द करा' : 'Cancel'}
            </button>

            <button
              type="button"
              onClick={handleExportExcel}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>{isMr ? 'एक्सेल (XLSX)' : 'Export XLSX'}</span>
            </button>

            <button
              type="button"
              disabled={isGenerating}
              onClick={handleExportPDF}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/30 active:scale-95 transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{isMr ? 'PDF तयार होत आहे...' : 'Generating PDF...'}</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>{isMr ? 'अधिकृत PDF डाऊनलोड करा' : 'Download Clean PDF'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
