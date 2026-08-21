import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Users,
  CheckCircle2,
  Clock,
  RotateCcw,
  Smartphone,
  AlertTriangle,
  UserCheck,
  UserX,
  Search,
  Filter,
  Plus,
  Download,
  FileText,
  FileCode,
  MapPin,
  Route as RouteIcon,
  Building2,
  Calendar,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Sparkles,
  CloudCheck,
  Check,
  ChevronDown,
  Navigation,
} from 'lucide-react';
import { ProducerSurvey, SurveyDashboardMetrics, SurveyStatus, DeviceInstallStatus, MilkType } from '../../types';
import { SurveyService } from '../../services/surveyService';
import { SurveyReportService } from '../../services/surveyReportService';
import { StorageService } from '../../services/storageService';
import { SurveyFormModal } from './SurveyFormModal';
import { SurveyDetailModal } from './SurveyDetailModal';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const ProducerSurveyDashboardView: React.FC = () => {
  const { language } = useLanguage();
  const isMr = language === 'mr';
  const { currentUser, isAdmin, isSupervisor } = useAuth();
  const { showToast } = useToast();

  // Primary Data State
  const [surveys, setSurveys] = useState<ProducerSurvey[]>([]);
  const [metrics, setMetrics] = useState<SurveyDashboardMetrics>({
    totalProducers: 0,
    totalSurveysCompleted: 0,
    totalSurveysPending: 0,
    totalSurveysRevisit: 0,
    totalDeviceInstalled: 0,
    totalDevicePending: 0,
    totalDeviceNotRequired: 0,
    totalActiveProducers: 0,
    totalInactiveProducers: 0,
    completionRate: 0,
  });

  // Active View Tab State (All / Completed / Pending / Revisit / Device Installed / Device Pending)
  const [activeListTab, setActiveListTab] = useState<
    'all' | 'completed' | 'pending' | 'revisit' | 'device_installed' | 'device_pending'
  >('all');

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterVillage, setFilterVillage] = useState('all');
  const [filterRoute, setFilterRoute] = useState('all');
  const [filterLinkCenter, setFilterLinkCenter] = useState('all');
  const [filterCollectionCenter, setFilterCollectionCenter] = useState('all');
  const [filterSurveyStatus, setFilterSurveyStatus] = useState<string>('all');
  const [filterDeviceStatus, setFilterDeviceStatus] = useState<string>('all');
  const [filterMilkType, setFilterMilkType] = useState<string>('all');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [surveyToEdit, setSurveyToEdit] = useState<ProducerSurvey | null>(null);
  const [selectedSurveyForDetail, setSelectedSurveyForDetail] = useState<ProducerSurvey | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  // Available metadata for dropdowns
  const availableRoutes = StorageService.getRoutes();

  const loadSurveys = () => {
    const list = SurveyService.getSurveys();
    setSurveys(list);
    setMetrics(SurveyService.getMetrics(list));
  };

  useEffect(() => {
    loadSurveys();

    const handleStorageUpdate = () => loadSurveys();
    window.addEventListener('dairy_survey_updated', handleStorageUpdate);
    window.addEventListener('dairy_storage_updated', handleStorageUpdate);

    return () => {
      window.removeEventListener('dairy_survey_updated', handleStorageUpdate);
      window.removeEventListener('dairy_storage_updated', handleStorageUpdate);
    };
  }, []);

  // Unique lists for filtering dropdowns
  const uniqueVillages = Array.from(new Set(surveys.map(s => s.village).filter(Boolean))).sort();
  const uniqueLinkCenters = Array.from(new Set(surveys.map(s => s.linkCenter).filter(Boolean))).sort();
  const uniqueCollectionCenters = Array.from(new Set(surveys.map(s => s.collectionCenter).filter(Boolean))).sort();

  // Filter Computation
  const filteredSurveys = surveys.filter(item => {
    // 1. Sub-tab filter
    if (activeListTab === 'completed' && item.surveyStatus !== 'Completed') return false;
    if (activeListTab === 'pending' && item.surveyStatus !== 'Pending') return false;
    if (activeListTab === 'revisit' && item.surveyStatus !== 'Revisit Required') return false;
    if (activeListTab === 'device_installed' && item.deviceStatus !== 'Installed') return false;
    if (activeListTab === 'device_pending' && item.deviceStatus !== 'Pending') return false;

    // 2. Search query (code, name, mobile, village, address, serial)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.producerName?.toLowerCase().includes(q);
      const matchCode = item.producerCode?.toLowerCase().includes(q);
      const matchMobile = item.mobileNumber?.includes(q);
      const matchVillage = item.village?.toLowerCase().includes(q);
      const matchSerial = item.deviceSerialNumber?.toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchMobile && !matchVillage && !matchSerial) return false;
    }

    // 3. Dropdown Filters
    if (filterDate && item.surveyDate !== filterDate) return false;
    if (filterVillage !== 'all' && item.village !== filterVillage) return false;
    if (filterRoute !== 'all' && item.route !== filterRoute) return false;
    if (filterLinkCenter !== 'all' && item.linkCenter !== filterLinkCenter) return false;
    if (filterCollectionCenter !== 'all' && item.collectionCenter !== filterCollectionCenter) return false;
    if (filterSurveyStatus !== 'all' && item.surveyStatus !== filterSurveyStatus) return false;
    if (filterDeviceStatus !== 'all' && item.deviceStatus !== filterDeviceStatus) return false;
    if (filterMilkType !== 'all' && item.milkType !== filterMilkType) return false;

    return true;
  });

  const handleOpenNewSurvey = () => {
    setSurveyToEdit(null);
    setIsFormOpen(true);
  };

  const handleEditSurvey = (survey: ProducerSurvey) => {
    setSurveyToEdit(survey);
    setIsDetailOpen(false);
    setIsFormOpen(true);
  };

  const handleDeleteSurvey = (id: string) => {
    if (window.confirm(isMr ? 'हे सर्वेक्षण कायमस्वरूपी हटवायचे आहे का?' : 'Delete this survey record permanently?')) {
      SurveyService.deleteSurvey(id);
      setIsDetailOpen(false);
      showToast(isMr ? 'सर्वेक्षण हटवले गेले' : 'Survey record deleted', 'info');
    }
  };

  const handleViewDetail = (survey: ProducerSurvey) => {
    setSelectedSurveyForDetail(survey);
    setIsDetailOpen(true);
  };

  // Export Trigger Handlers
  const handleExportPDF = () => {
    SurveyReportService.exportToPDF(filteredSurveys, metrics, `${activeListTab.toUpperCase()} (${filteredSurveys.length} records)`);
    setIsExportMenuOpen(false);
    showToast(isMr ? 'PDF अहवाल तयार झाला' : 'PDF Report Generated', 'success');
  };

  const handleExportExcel = () => {
    SurveyReportService.exportToExcel(filteredSurveys, `Producer_Surveys_${activeListTab}_${new Date().toISOString().split('T')[0]}.xlsx`);
    setIsExportMenuOpen(false);
    showToast(isMr ? 'Excel अहवाल डाऊनलोड झाला' : 'Excel Report Downloaded', 'success');
  };

  const handleExportCSV = () => {
    SurveyReportService.exportToCSV(filteredSurveys, `Producer_Surveys_${activeListTab}.csv`);
    setIsExportMenuOpen(false);
    showToast(isMr ? 'CSV फाईल डाऊनलोड झाली' : 'CSV Exported', 'success');
  };

  const handleExportWord = () => {
    SurveyReportService.exportToWord(filteredSurveys, metrics, isMr ? 'दूध उत्पादक सर्वेक्षण अहवाल' : 'Producer Survey Report');
    setIsExportMenuOpen(false);
    showToast(isMr ? 'Word (.doc) दस्तऐवज डाऊनलोड झाला' : 'Word Document Exported', 'success');
  };

  return (
    <div className="space-y-5 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 rounded-2xl p-4 sm:p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-[11px] font-bold bg-emerald-500/30 border border-emerald-300/30 rounded-full text-emerald-200 uppercase tracking-wider flex items-center gap-1">
                <CloudCheck className="w-3.5 h-3.5" />
                {isMr ? 'क्लाउड सिंक सक्रिय' : 'Firebase Firestore Cloud Sync'}
              </span>
              <span className="text-xs text-emerald-200">| Live Device Sync</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
              <FileSpreadsheet className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-300" />
              <span>{isMr ? 'दूध उत्पादक (गवळी) सर्वेक्षण व डॅशबोर्ड' : 'Producer Survey & Tracking Dashboard'}</span>
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl">
              {isMr
                ? 'प्रत्येक उत्पादकाचे GPS स्थान, पत्ता, दूध क्षमता, सर्वेक्षण स्थिती आणि ऑनलाइन दूध संकलन डिव्हाइस इन्स्टॉलेशन ट्रॅकिंग.'
                : 'Centralized live tracking for producer demographics, GPS coordinates, milk potential, survey completion and online IoT milk analyzer device installations.'}
            </p>
          </div>

          {/* Action Buttons: Add Survey + Multi-format Export */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Export Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                className="px-3.5 py-2.5 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 backdrop-blur-xs transition-all cursor-pointer border border-white/20"
              >
                <Download className="w-4 h-4" />
                <span>{isMr ? 'अहवाल एक्सपोर्ट' : 'Export Reports'}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {isExportMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 animate-in fade-in zoom-in-95">
                  <button
                    onClick={handleExportPDF}
                    className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 flex items-center gap-2 cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-rose-500" />
                    <span>PDF अहवाल (.pdf)</span>
                  </button>
                  <button
                    onClick={handleExportExcel}
                    className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 flex items-center gap-2 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>Excel स्प्रेडशीट (.xlsx)</span>
                  </button>
                  <button
                    onClick={handleExportCSV}
                    className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 flex items-center gap-2 cursor-pointer"
                  >
                    <FileCode className="w-4 h-4 text-amber-500" />
                    <span>CSV डेटा (.csv)</span>
                  </button>
                  <button
                    onClick={handleExportWord}
                    className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 flex items-center gap-2 cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-blue-500" />
                    <span>Word डॉक्युमेंट (.doc)</span>
                  </button>
                </div>
              )}
            </div>

            {/* Add Survey Button */}
            <button
              onClick={handleOpenNewSurvey}
              className="px-4 py-2.5 bg-white text-emerald-900 hover:bg-emerald-50 font-black text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-black/10 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-emerald-700" />
              <span>{isMr ? '+ नवीन सर्वेक्षण' : '+ New Survey'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics Grid (7 Essential Metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* 1. Total Producers */}
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase">{isMr ? 'एकूण उत्पादक' : 'Total Producers'}</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{metrics.totalProducers}</div>
          <span className="text-[10px] text-emerald-600 font-semibold">{metrics.completionRate}% पूर्ण दर</span>
        </div>

        {/* 2. Total Surveys Completed */}
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase">{isMr ? 'सर्वेक्षण पूर्ण' : 'Surveys Done'}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{metrics.totalSurveysCompleted}</div>
          <span className="text-[10px] text-slate-400 font-medium">{isMr ? 'यशस्वी नोंदणी' : 'Verified'}</span>
        </div>

        {/* 3. Total Surveys Pending */}
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase">{isMr ? 'सर्वेक्षण प्रलंबित' : 'Pending Survey'}</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{metrics.totalSurveysPending}</div>
          <span className="text-[10px] text-slate-400 font-medium">{isMr ? 'दौरा बाकी' : 'Action Due'}</span>
        </div>

        {/* 4. Total Surveys Revisit Required */}
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase">{isMr ? 'पुन्हा भेट आवश्यक' : 'Revisit Due'}</span>
            <RotateCcw className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400">{metrics.totalSurveysRevisit}</div>
          <span className="text-[10px] text-slate-400 font-medium">{isMr ? 'तपासणी बाकी' : 'Review'}</span>
        </div>

        {/* 5. Online Milk Collection Devices Installed */}
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase">{isMr ? 'डिव्हाइस इन्स्टॉल' : 'Device Installed'}</span>
            <Smartphone className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-teal-600 dark:text-teal-400">{metrics.totalDeviceInstalled}</div>
          <span className="text-[10px] text-teal-600 font-semibold">{isMr ? 'ऑनलाइन चालू' : 'Live Sync'}</span>
        </div>

        {/* 6. Online Device Pending */}
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase">{isMr ? 'डिव्हाइस प्रलंबित' : 'Device Pending'}</span>
            <AlertTriangle className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl font-black text-orange-600 dark:text-orange-400">{metrics.totalDevicePending}</div>
          <span className="text-[10px] text-slate-400 font-medium">{isMr ? 'इन्स्टॉलेशन बाकी' : 'Hardware Queued'}</span>
        </div>

        {/* 7. Active Producers */}
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase">{isMr ? 'सक्रिय उत्पादक' : 'Active / Inactive'}</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {metrics.totalActiveProducers} <span className="text-xs text-slate-400">/ {metrics.totalInactiveProducers}</span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">{isMr ? 'चालू पुरवठादार' : 'Suppliers'}</span>
        </div>
      </div>

      {/* Sub-Tabs Selector (Separate Lists for Workflows) */}
      <div className="bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-wrap items-center gap-1.5">
        <button
          onClick={() => setActiveListTab('all')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeListTab === 'all'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>{isMr ? 'सर्व सर्वेक्षणे (All)' : 'All Records'}</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-bold">{surveys.length}</span>
        </button>

        <button
          onClick={() => setActiveListTab('completed')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeListTab === 'completed'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>{isMr ? 'पूर्ण सर्वेक्षण (Completed)' : 'Completed'}</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-bold">{metrics.totalSurveysCompleted}</span>
        </button>

        <button
          onClick={() => setActiveListTab('pending')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeListTab === 'pending'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-300" />
          <span>{isMr ? 'प्रलंबित सर्वेक्षण (Pending)' : 'Pending'}</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-bold">{metrics.totalSurveysPending}</span>
        </button>

        <button
          onClick={() => setActiveListTab('revisit')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeListTab === 'revisit'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5 text-rose-300" />
          <span>{isMr ? 'पुन्हा भेट आवश्यक (Revisit)' : 'Revisit Required'}</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-bold">{metrics.totalSurveysRevisit}</span>
        </button>

        <button
          onClick={() => setActiveListTab('device_installed')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeListTab === 'device_installed'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5 text-teal-300" />
          <span>{isMr ? 'डिव्हाइस इन्स्टॉल (Online Devices)' : 'Device Installed'}</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-bold">{metrics.totalDeviceInstalled}</span>
        </button>

        <button
          onClick={() => setActiveListTab('device_pending')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeListTab === 'device_pending'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-orange-300" />
          <span>{isMr ? 'डिव्हाइस प्रलंबित (Hardware Pending)' : 'Device Pending'}</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-bold">{metrics.totalDevicePending}</span>
        </button>
      </div>

      {/* Comprehensive Filter Bar (Date, Village, Route, Link Center, Collection Center, Survey Status, Device Status) */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
            <Filter className="w-4 h-4 text-emerald-600" />
            <span>{isMr ? 'स्मार्ट शोध व सर्वसमावेशक फिल्टर्स' : 'Smart Search & Multi-Level Filters'}</span>
          </div>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterDate('');
              setFilterVillage('all');
              setFilterRoute('all');
              setFilterLinkCenter('all');
              setFilterCollectionCenter('all');
              setFilterSurveyStatus('all');
              setFilterDeviceStatus('all');
              setFilterMilkType('all');
            }}
            className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 cursor-pointer"
          >
            {isMr ? 'सर्व फिल्टर्स रीसेट करा' : 'Reset All Filters'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2.5 text-xs">
          {/* Text Search */}
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={isMr ? 'उत्पादक नाव, कोड, मोबाईल, गाव किंवा सिरीयल नंबर शोधा...' : 'Search by Name, Code, Mobile, Village, Serial...'}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Date Filter */}
          <div>
            <input
              type="date"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-700 dark:text-slate-300 font-medium"
            />
          </div>

          {/* Village Filter */}
          <div>
            <select
              value={filterVillage}
              onChange={e => setFilterVillage(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              <option value="all">📍 {isMr ? 'सर्व गावे (All Villages)' : 'All Villages'}</option>
              {uniqueVillages.map(v => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          {/* Route Filter */}
          <div>
            <select
              value={filterRoute}
              onChange={e => setFilterRoute(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              <option value="all">🛣️ {isMr ? 'सर्व रूट्स (All Routes)' : 'All Routes'}</option>
              {availableRoutes.map(r => (
                <option key={r.id} value={r.routeNumber}>
                  {r.routeNumber} ({r.routeName.split(' ')[0]})
                </option>
              ))}
            </select>
          </div>

          {/* Link Center Filter */}
          <div>
            <select
              value={filterLinkCenter}
              onChange={e => setFilterLinkCenter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              <option value="all">🏢 {isMr ? 'सर्व लिंक केंद्रे (Link Centers)' : 'All Link Centers'}</option>
              {uniqueLinkCenters.map(lc => (
                <option key={lc} value={lc}>
                  {lc}
                </option>
              ))}
            </select>
          </div>

          {/* Collection Center Filter */}
          <div>
            <select
              value={filterCollectionCenter}
              onChange={e => setFilterCollectionCenter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              <option value="all">🥛 {isMr ? 'सर्व संकलन केंद्रे (Centers)' : 'All Collection Centers'}</option>
              {uniqueCollectionCenters.map(cc => (
                <option key={cc} value={cc}>
                  {cc}
                </option>
              ))}
            </select>
          </div>

          {/* Survey Status Filter */}
          <div>
            <select
              value={filterSurveyStatus}
              onChange={e => setFilterSurveyStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              <option value="all">📋 {isMr ? 'सर्व सर्वेक्षण स्थिती' : 'All Survey Status'}</option>
              <option value="Completed">✅ पूर्ण (Completed)</option>
              <option value="Pending">⏳ प्रलंबित (Pending)</option>
              <option value="Revisit Required">🔄 पुन्हा भेट (Revisit Required)</option>
            </select>
          </div>

          {/* Device Status Filter */}
          <div>
            <select
              value={filterDeviceStatus}
              onChange={e => setFilterDeviceStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              <option value="all">📶 {isMr ? 'सर्व डिव्हाइस स्थिती' : 'All Device Status'}</option>
              <option value="Installed">📶 इन्स्टॉल (Installed)</option>
              <option value="Pending">⏳ प्रलंबित (Pending)</option>
              <option value="Not Required">❌ आवश्यक नाही (Not Required)</option>
            </select>
          </div>

          {/* Milk Type Filter */}
          <div>
            <select
              value={filterMilkType}
              onChange={e => setFilterMilkType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              <option value="all">🥛 {isMr ? 'सर्व दूध प्रकार' : 'All Milk Types'}</option>
              <option value="Cow">🐄 गाय (Cow)</option>
              <option value="Buffalo">🐃 म्हैस (Buffalo)</option>
              <option value="Both">🐄+🐃 दोन्ही (Both)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Surveys Data Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
              {isMr ? 'उत्पादक सर्वेक्षण यादी' : 'Producer Survey Directory'}
            </span>
            <span className="px-2 py-0.5 text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-full">
              {filteredSurveys.length} {isMr ? 'नोंदी' : 'records'}
            </span>
          </div>

          <div className="text-xs text-slate-500">
            {isMr ? 'स्वयंचलित क्लाउड बॅकअप सुरक्षित' : 'Auto Cloud Synced'}
          </div>
        </div>

        {/* Table / Empty State */}
        {filteredSurveys.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-base">
              {isMr ? 'कोणतेही सर्वेक्षण सापडले नाही' : 'No matching surveys found'}
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {isMr
                ? 'निवडलेल्या फिल्टर्सनुसार कोणतीही नोंद आढळली नाही. कृपया फिल्टर्स बदला किंवा नवीन सर्वेक्षण नोंदवा.'
                : 'No survey records match your search criteria. Try adjusting the filters or register a new producer survey.'}
            </p>
            <button
              onClick={handleOpenNewSurvey}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isMr ? 'नवीन सर्वेक्षण नोंदवा' : 'Register New Survey'}</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/70 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                  <th className="py-3 px-4">{isMr ? 'कोड' : 'Code'}</th>
                  <th className="py-3 px-4">{isMr ? 'उत्पादक नाव व संपर्क' : 'Producer & Contact'}</th>
                  <th className="py-3 px-4">{isMr ? 'गाव व तालुका' : 'Village & Taluka'}</th>
                  <th className="py-3 px-4">{isMr ? 'रूट व संकलन केंद्र' : 'Route & Center'}</th>
                  <th className="py-3 px-4">{isMr ? 'दूध / क्षमता' : 'Milk / Potential'}</th>
                  <th className="py-3 px-4">{isMr ? 'सर्वेक्षण स्थिती' : 'Survey Status'}</th>
                  <th className="py-3 px-4">{isMr ? 'डिव्हाइस स्थिती' : 'Device Status'}</th>
                  <th className="py-3 px-4">{isMr ? 'GPS स्थान' : 'GPS'}</th>
                  <th className="py-3 px-4 text-right">{isMr ? 'कृती' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredSurveys.map(item => (
                  <tr
                    key={item.id}
                    className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-colors group"
                  >
                    {/* Code */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md">
                        {item.producerCode}
                      </span>
                    </td>

                    {/* Name & Mobile */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{item.producerName}</span>
                        {!item.isActiveProducer && (
                          <span className="text-[9px] bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 px-1.5 py-0.2 rounded">
                            Inactive
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <a href={`tel:${item.mobileNumber}`} className="text-emerald-600 hover:underline">
                          📞 {item.mobileNumber}
                        </a>
                        {item.alternateNumber && <span>• {item.alternateNumber}</span>}
                      </div>
                    </td>

                    {/* Village & Taluka */}
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                        {item.village}
                      </span>
                      <span className="text-[11px] text-slate-400">{item.taluka}, Sangli</span>
                    </td>

                    {/* Route & Center */}
                    <td className="py-3 px-4">
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400 block">
                        {item.route}
                      </span>
                      <span className="text-[11px] text-slate-500">{item.collectionCenter || item.linkCenter}</span>
                    </td>

                    {/* Milk Type & Litres */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {item.milkType === 'Cow' ? '🐄 Cow' : item.milkType === 'Buffalo' ? '🐃 Buffalo' : '🐄+🐃 Both'}
                      </div>
                      <div className="text-[11px] text-emerald-600 font-semibold">
                        {item.dailyMilkPotential ? `${item.dailyMilkPotential} L/day` : '-'}
                      </div>
                    </td>

                    {/* Survey Status */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          item.surveyStatus === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : item.surveyStatus === 'Pending'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {item.surveyStatus === 'Completed' ? '✅ ' : item.surveyStatus === 'Pending' ? '⏳ ' : '🔄 '}
                        {item.surveyStatus}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5">{item.surveyDate}</div>
                    </td>

                    {/* Device Status */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold ${
                          item.deviceStatus === 'Installed'
                            ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                            : item.deviceStatus === 'Pending'
                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {item.deviceStatus === 'Installed' ? '📶 ' : item.deviceStatus === 'Pending' ? '⏳ ' : '❌ '}
                        {item.deviceStatus}
                      </span>
                      {item.deviceSerialNumber && (
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {item.deviceSerialNumber}
                        </div>
                      )}
                    </td>

                    {/* GPS */}
                    <td className="py-3 px-4">
                      {item.latitude && item.longitude ? (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                        >
                          <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                          <span>View Map</span>
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-400">No GPS</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleViewDetail(item)}
                          title="View 360-degree Detail"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {(isAdmin || isSupervisor) && (
                          <button
                            onClick={() => handleEditSurvey(item)}
                            title="Edit Survey"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}

                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteSurvey(item.id)}
                            title="Delete"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Survey Registration / Edit Modal */}
      <SurveyFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        surveyToEdit={surveyToEdit}
        onSaved={saved => {
          loadSurveys();
        }}
      />

      {/* 360-View Detail Modal */}
      <SurveyDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        survey={selectedSurveyForDetail}
        onEdit={survey => handleEditSurvey(survey)}
        onDelete={id => handleDeleteSurvey(id)}
      />
    </div>
  );
};
