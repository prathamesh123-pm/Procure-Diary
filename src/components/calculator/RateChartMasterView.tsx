import React, { useState, useEffect } from 'react';
import {
  Calculator,
  Lock,
  Unlock,
  Save,
  RotateCcw,
  History,
  AlertTriangle,
  CheckCircle2,
  Share2,
  FileSpreadsheet,
  FileText,
  Milk,
  TrendingUp,
  Percent,
  Plus,
  Trash2,
  Clock,
  User,
  ShieldCheck,
  Building2,
  ChevronRight,
  Info,
  Layers,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Eye,
  Sliders,
  DollarSign,
  Truck,
  Check,
  ArrowLeft,
  X,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import {
  RateChartRule,
  RateChartHistoryEntry,
  MilkRateParameters,
  VolumeBonusSlab,
  QualityIncentivesConfig,
  QualityDeductionsConfig,
} from '../../types/rateChart';
import { RateChartService, DEFAULT_RATE_CHART } from '../../services/rateChartService';
import { ActivityService } from '../../services/activityService';
import { ExcelService } from '../../services/excelService';

export interface RateChartMasterViewProps {
  onBack?: () => void;
  onClose?: () => void;
}

export const RateChartMasterView: React.FC<RateChartMasterViewProps> = ({ onBack, onClose }) => {
  const { language } = useLanguage();
  const { currentUser, isAdmin, isSupervisor } = useAuth();
  const isMr = language === 'mr';

  const handleGoBack = () => {
    if (onBack) {
      onBack();
    } else if (onClose) {
      onClose();
    } else {
      window.dispatchEvent(new CustomEvent('dairy_navigate_tab', { detail: 'dashboard' }));
    }
  };

  // Role permissions
  // Admin: View, Edit, Restore History
  // Manager / Supervisor: View, Edit
  // Employee / Officer: View Only
  const canEdit = isAdmin || isSupervisor;
  const canRestore = isAdmin;

  // Master Rate Chart State
  const [activeRule, setActiveRule] = useState<RateChartRule>(() => RateChartService.getActiveRateChart());
  const [editFormData, setEditFormData] = useState<RateChartRule>(() => RateChartService.getActiveRateChart());
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'cow' | 'buffalo' | 'slabs' | 'incentives' | 'deductions' | 'matrix' | 'tester'>('cow');

  // History Modal State
  const [historyList, setHistoryList] = useState<RateChartHistoryEntry[]>([]);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const [selectedHistorySnapshot, setSelectedHistorySnapshot] = useState<RateChartHistoryEntry | null>(null);

  // Edit Confirmation Modal State (Confirmation before unlocking fields)
  const [isEditConfirmModalOpen, setIsEditConfirmModalOpen] = useState<boolean>(false);

  // Save Confirmation Modal State
  const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false);
  const [changeReason, setChangeReason] = useState<string>('');
  const [pendingDiffs, setPendingDiffs] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Restore Confirmation Modal
  const [restoreTargetVersion, setRestoreTargetVersion] = useState<number | null>(null);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState<boolean>(false);

  // Live Simulator State in Rate Chart
  const [simMilkType, setSimMilkType] = useState<'Cow' | 'Buffalo'>('Cow');
  const [simFat, setSimFat] = useState<number>(3.8);
  const [simSnf, setSimSnf] = useState<number>(8.6);
  const [simLitres, setSimLitres] = useState<number>(150);

  // Load and subscribe to updates
  useEffect(() => {
    const loadRates = async () => {
      const chart = await RateChartService.init();
      setActiveRule(chart);
      setEditFormData(chart);
      setHistoryList(RateChartService.getHistory());
    };
    loadRates();

    const handleUpdate = (e: any) => {
      if (e.detail) {
        setActiveRule(e.detail);
        if (!isEditMode) {
          setEditFormData(e.detail);
        }
        setHistoryList(RateChartService.getHistory());
      }
    };

    window.addEventListener('dairy_rate_chart_updated', handleUpdate);
    return () => window.removeEventListener('dairy_rate_chart_updated', handleUpdate);
  }, [isEditMode]);

  // Escape key handler to close active modal or go back
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isEditConfirmModalOpen) {
          setIsEditConfirmModalOpen(false);
        } else if (isSaveModalOpen) {
          setIsSaveModalOpen(false);
        } else if (isHistoryModalOpen) {
          setIsHistoryModalOpen(false);
        } else if (isRestoreModalOpen) {
          setIsRestoreModalOpen(false);
        } else if (selectedHistorySnapshot) {
          setSelectedHistorySnapshot(null);
        } else if (onBack || onClose) {
          handleGoBack();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditConfirmModalOpen, isSaveModalOpen, isHistoryModalOpen, isRestoreModalOpen, selectedHistorySnapshot, onBack, onClose]);

  // Handle Edit button click -> Open Confirmation Dialog
  const handleRequestEdit = () => {
    if (!canEdit) {
      alert(isMr ? 'आपल्याला दर पत्रक बदलण्याची परवानगी नाही. (फक्त प्रशासक व व्यवस्थापक)' : 'Permission denied. Only Admin and Managers can edit the Rate Chart.');
      return;
    }
    setIsEditConfirmModalOpen(true);
  };

  // Confirm Unlock & Enter Edit Mode
  const handleConfirmStartEditing = () => {
    setIsEditConfirmModalOpen(false);
    setEditFormData(JSON.parse(JSON.stringify(activeRule)));
    setIsEditMode(true);
    setSaveSuccessMsg(null);
  };

  // Handle Cancel Edit
  const handleCancelEditing = () => {
    setEditFormData(JSON.parse(JSON.stringify(activeRule)));
    setIsEditMode(false);
  };

  // Trigger Save Process -> Open Confirmation Modal
  const handleInitiateSave = (e: React.FormEvent) => {
    e.preventDefault();
    const diffs = RateChartService.computeDiff(activeRule, editFormData);
    setPendingDiffs(diffs);
    setChangeReason(
      isMr
        ? `नियमित दर सुधारणा (${new Date().toLocaleDateString('mr-IN')})`
        : `Rate chart revision (${new Date().toLocaleDateString('en-GB')})`
    );
    setIsSaveModalOpen(true);
  };

  // Execute Confirmed Save
  const handleConfirmSave = async () => {
    if (!changeReason.trim()) {
      alert(isMr ? 'कृपया दर बदलाचे कारण लिहा.' : 'Please provide a reason for the rate update.');
      return;
    }

    setIsSaving(true);
    try {
      const updater = {
        id: currentUser?.id || 'USER-01',
        name: currentUser?.name || 'Authorized User',
        role: currentUser?.role || 'admin',
        mobile: currentUser?.mobile || currentUser?.mobileNumber || '9822000000',
        email: currentUser?.email || 'user@dairy.com',
      };

      const result = await RateChartService.saveRateChart(editFormData, updater, changeReason.trim());
      if (result.success) {
        setActiveRule(result.rateChart);
        setEditFormData(result.rateChart);
        setIsEditMode(false);
        setIsSaveModalOpen(false);
        setHistoryList(RateChartService.getHistory());
        setSaveSuccessMsg(
          isMr
            ? `दर पत्रक यशस्वीरीत्या सेव्ह झाले. (Rate Chart saved successfully - ${result.rateChart.versionTag})`
            : `Rate Chart saved successfully. (${result.rateChart.versionTag})`
        );
        setTimeout(() => setSaveSuccessMsg(null), 6000);
      }
    } catch (err: any) {
      alert((isMr ? 'दर पत्रक सेव्ह करताना त्रुटी आली: ' : 'Error saving rate chart: ') + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Open History modal
  const handleOpenHistory = () => {
    setHistoryList(RateChartService.getHistory());
    setIsHistoryModalOpen(true);
  };

  // Initiate Restore
  const handleInitiateRestore = (version: number) => {
    setRestoreTargetVersion(version);
    setIsRestoreModalOpen(true);
  };

  // Confirm Restore
  const handleConfirmRestore = async () => {
    if (!restoreTargetVersion) return;
    try {
      const adminUser = {
        id: currentUser?.id || 'ADMIN-01',
        name: currentUser?.name || 'Administrator',
        role: currentUser?.role || 'admin',
        mobile: currentUser?.mobile || '9822000000',
      };

      const res = await RateChartService.restoreVersion(restoreTargetVersion, adminUser);
      if (res.success) {
        setActiveRule(res.rateChart);
        setEditFormData(res.rateChart);
        setIsRestoreModalOpen(false);
        setIsHistoryModalOpen(false);
        setSaveSuccessMsg(
          isMr
            ? `आवृत्ती v${restoreTargetVersion} यशस्वीरीत्या पूर्ववत (Rollback) लागू केली आहे!`
            : `Version v${restoreTargetVersion} successfully restored and applied across the system!`
        );
        setTimeout(() => setSaveSuccessMsg(null), 6000);
      }
    } catch (err: any) {
      alert((isMr ? 'पूर्ववत करताना त्रुटी: ' : 'Restore error: ') + err.message);
    }
  };

  // Sub-form handlers
  const updateCowField = <K extends keyof MilkRateParameters>(key: K, value: number) => {
    setEditFormData(prev => ({
      ...prev,
      cowRateConfig: {
        ...prev.cowRateConfig,
        [key]: value,
      },
    }));
  };

  const updateBuffaloField = <K extends keyof MilkRateParameters>(key: K, value: number) => {
    setEditFormData(prev => ({
      ...prev,
      buffaloRateConfig: {
        ...prev.buffaloRateConfig,
        [key]: value,
      },
    }));
  };

  const updateIncentiveField = <K extends keyof QualityIncentivesConfig>(key: K, value: number) => {
    setEditFormData(prev => ({
      ...prev,
      qualityIncentives: {
        ...prev.qualityIncentives,
        [key]: value,
      },
    }));
  };

  const updateDeductionField = <K extends keyof QualityDeductionsConfig>(key: K, value: number) => {
    setEditFormData(prev => ({
      ...prev,
      deductions: {
        ...prev.deductions,
        [key]: value,
      },
    }));
  };

  // Slab handlers
  const handleUpdateSlab = (id: string, field: keyof VolumeBonusSlab, value: any) => {
    setEditFormData(prev => ({
      ...prev,
      volumeSlabs: prev.volumeSlabs.map(s => (s.id === id ? { ...s, [field]: value } : s)),
    }));
  };

  const handleAddSlab = () => {
    const newId = `slab-${Date.now()}`;
    const newSlab: VolumeBonusSlab = {
      id: newId,
      minLitres: 100,
      maxLitres: 500,
      bonusPerLitre: 0.5,
      slabName: isMr ? 'नवीन संकलन बोनस स्लॅब' : 'New Volume Bonus Slab',
    };
    setEditFormData(prev => ({
      ...prev,
      volumeSlabs: [...prev.volumeSlabs, newSlab],
    }));
  };

  const handleDeleteSlab = (id: string) => {
    setEditFormData(prev => ({
      ...prev,
      volumeSlabs: prev.volumeSlabs.filter(s => s.id !== id),
    }));
  };

  // Live simulation calculation based on current viewed rule
  const currentWorkingChart = isEditMode ? editFormData : activeRule;
  const simResult = RateChartService.calculateMilkRate(simMilkType, simFat, simSnf, simLitres, {
    customRateChart: currentWorkingChart,
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner & Status Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-linear-to-br from-emerald-500/10 via-purple-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <button
                type="button"
                onClick={handleGoBack}
                className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                title={isMr ? 'डॅशबोर्डवर परत जा / बंद करा' : 'Go back / Close'}
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-xs font-bold">{isMr ? 'मागे जा (Back)' : 'Back'}</span>
              </button>

              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
                    {isMr ? 'मास्टर दर पत्रक संरचना (Permanent Rate Chart)' : 'Permanent Master Rate Chart Configuration'}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>{activeRule.versionTag || `v${activeRule.version}`}</span>
                  </span>

                  {isEditMode ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 flex items-center gap-1 animate-pulse">
                      <Unlock className="w-3 h-3" />
                      <span>{isMr ? 'संपादन मोड (Editing Active)' : 'Edit Mode Active'}</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-slate-500" />
                      <span>{isMr ? 'सुरक्षित मोड (Read-Only Locked)' : 'Read-Only Locked'}</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isMr
                    ? 'येथे सेव्ह केलेले दर संपूर्ण सिस्टीम, कॅल्क्युलेटर, गोठा नोंदी, दैनिक अहवाल व पीडीएफमध्ये आपोआप कायमस्वरूपी लागू होतात.'
                    : 'Saved master milk rates, fat/SNF steps, slabs, and deductions apply permanently across all forms, calculators, and reports.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-3 font-mono flex-wrap">
              <span>
                {isMr ? 'अंतिम बदल: ' : 'Last Updated: '}
                <strong className="text-slate-700 dark:text-slate-300">
                  {new Date(activeRule.updatedAt).toLocaleDateString(isMr ? 'mr-IN' : 'en-GB')}
                </strong>
              </span>
              <span>•</span>
              <span>
                {isMr ? 'बदलणारा अधिकारी: ' : 'Updated By: '}
                <strong className="text-slate-700 dark:text-slate-300">
                  {activeRule.updatedBy?.name || 'Admin'} ({activeRule.updatedBy?.role || 'Admin'})
                </strong>
              </span>
              <span>•</span>
              <span>
                {isMr ? 'कारण: ' : 'Reason: '}
                <span className="italic text-slate-600 dark:text-slate-400">"{activeRule.changeReason || 'N/A'}"</span>
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => ExcelService.exportRateChartToExcel(activeRule, `Dairy_Rate_Chart_${activeRule.versionTag || 'v1'}.xlsx`)}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Download full rate chart in Excel with matrices and slabs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isMr ? 'एक्सेल डाउनलोड' : 'Export Excel'}</span>
            </button>

            <button
              onClick={handleOpenHistory}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <History className="w-3.5 h-3.5 text-purple-600" />
              <span>{isMr ? 'दर इतिहास व व्हर्जन (History)' : 'Version History'}</span>
            </button>

            {!isEditMode ? (
              canEdit ? (
                <button
                  id="edit-rate-chart-main-btn"
                  type="button"
                  onClick={handleRequestEdit}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/50 transition-all flex items-center gap-2 cursor-pointer active:scale-95 ring-2 ring-emerald-400/50"
                  title="Unlock Rate Chart for editing"
                >
                  <Unlock className="w-4 h-4" />
                  <span>{isMr ? '✏️ दर पत्रक एडिट करा (Edit Button)' : '✏️ Edit Rate Chart (Edit Button)'}</span>
                </button>
              ) : (
                <div className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs font-semibold flex items-center gap-1.5 border border-slate-200 dark:border-slate-700">
                  <Lock className="w-4 h-4" />
                  <span>{isMr ? 'फक्त पाहण्याची परवानगी (View Only)' : 'View Only Mode (Locked)'}</span>
                </div>
              )
            ) : (
              <div className="flex items-center gap-2.5">
                <button
                  id="cancel-rate-chart-main-btn"
                  type="button"
                  onClick={handleCancelEditing}
                  className="px-4 py-2.5 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-bold transition-all cursor-pointer border border-slate-300 dark:border-slate-700"
                >
                  {isMr ? 'रद्द करा (Cancel)' : 'Cancel'}
                </button>
                <button
                  id="save-rate-chart-main-btn"
                  type="button"
                  onClick={handleInitiateSave}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 hover:from-emerald-700 hover:to-green-800 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/40 hover:shadow-emerald-600/60 transition-all flex items-center gap-2 cursor-pointer animate-pulse active:scale-95 ring-2 ring-emerald-300/60"
                  title="Save Rate Chart Permanently"
                >
                  <Save className="w-4 h-4" />
                  <span>{isMr ? '💾 दर पत्रक सेव्ह करा (Save Button)' : '💾 Save Rate Chart (Save Button)'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Success Alert */}
        {saveSuccessMsg && (
          <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('cow')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'cow'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
          }`}
        >
          <Milk className="w-4 h-4" />
          <span>{isMr ? 'गाय दूध दर रचना (Cow Milk)' : 'Cow Milk Rates'}</span>
        </button>

        <button
          onClick={() => setActiveTab('buffalo')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'buffalo'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>{isMr ? 'म्हैस दूध दर रचना (Buffalo Milk)' : 'Buffalo Milk Rates'}</span>
        </button>

        <button
          onClick={() => setActiveTab('slabs')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'slabs'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{isMr ? 'संकलन बोनस स्लॅब (Volume Slabs)' : 'Volume Slabs'}</span>
        </button>

        <button
          onClick={() => setActiveTab('incentives')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'incentives'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>{isMr ? 'गुणवत्ता व प्रोत्साहन (Incentives)' : 'Incentives & Bonuses'}</span>
        </button>

        <button
          onClick={() => setActiveTab('deductions')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'deductions'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>{isMr ? 'कपात व वाहतूक आकार (Deductions)' : 'Deductions & Transport'}</span>
        </button>

        <button
          onClick={() => setActiveTab('matrix')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'matrix'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>{isMr ? 'दर मॅट्रिक्स तक्ता (Rate Matrix)' : 'Live Rate Matrix'}</span>
        </button>
      </div>

      {/* Main Form Content */}
      <form onSubmit={handleInitiateSave}>
        {/* TAB 1: Cow Milk Configuration */}
        {activeTab === 'cow' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <Milk className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {isMr ? 'गाय दूध दर मापदंड (Cow Milk Rate Parameters)' : 'Cow Milk Rate Parameters'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isMr ? 'गाय दुधासाठी बेस दर, बेस फॅट, बेस SNF आणि पॉइंट स्टेप्स' : 'Base rate, base fat/SNF, and point step increments'}
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-lg">
                गाय बेस दर: ₹{editFormData.cowRateConfig.baseRate.toFixed(2)}/L
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isMr ? 'बेस दर (Base Rate ₹/L)' : 'Base Rate (₹/L)'} *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.05"
                    disabled={!isEditMode}
                    value={editFormData.cowRateConfig.baseRate}
                    onChange={e => updateCowField('baseRate', parseFloat(e.target.value) || 0)}
                    className="w-full text-base font-bold pl-7 pr-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 disabled:bg-slate-100 dark:disabled:bg-slate-800/60 disabled:text-slate-600 dark:disabled:text-slate-400 focus:outline-hidden"
                  />
                  <span className="absolute left-2.5 top-2.5 text-xs font-bold text-slate-400">₹</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{isMr ? 'प्रमाणित फॅट व SNF वरील बेस दर' : 'Rate for base Fat & SNF'}</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isMr ? 'बेस फॅट (Base Fat %)' : 'Base Fat (%)'} *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    disabled={!isEditMode}
                    value={editFormData.cowRateConfig.baseFat}
                    onChange={e => updateCowField('baseFat', parseFloat(e.target.value) || 0)}
                    className="w-full text-base font-bold pr-7 pl-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 disabled:bg-slate-100 dark:disabled:bg-slate-800/60 disabled:text-slate-600 dark:disabled:text-slate-400 focus:outline-hidden"
                  />
                  <span className="absolute right-2.5 top-2.5 text-xs font-bold text-slate-400">%</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{isMr ? 'प्रमाणित गाय फॅट (उदा. 3.5%)' : 'Standard cow fat (e.g. 3.5%)'}</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isMr ? 'बेस SNF (Base SNF %)' : 'Base SNF (%)'} *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    disabled={!isEditMode}
                    value={editFormData.cowRateConfig.baseSnf}
                    onChange={e => updateCowField('baseSnf', parseFloat(e.target.value) || 0)}
                    className="w-full text-base font-bold pr-7 pl-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 disabled:bg-slate-100 dark:disabled:bg-slate-800/60 disabled:text-slate-600 dark:disabled:text-slate-400 focus:outline-hidden"
                  />
                  <span className="absolute right-2.5 top-2.5 text-xs font-bold text-slate-400">%</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{isMr ? 'प्रमाणित गाय SNF (उदा. 8.5%)' : 'Standard cow SNF (e.g. 8.5%)'}</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isMr ? 'प्रोत्साहन अनुदान (Incentive ₹/L)' : 'Govt / Dairy Incentive (₹/L)'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    disabled={!isEditMode}
                    value={editFormData.cowRateConfig.incentivePerLitre}
                    onChange={e => updateCowField('incentivePerLitre', parseFloat(e.target.value) || 0)}
                    className="w-full text-base font-bold pl-7 pr-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 disabled:bg-slate-100 dark:disabled:bg-slate-800/60 disabled:text-slate-600 dark:disabled:text-slate-400 focus:outline-hidden"
                  />
                  <span className="absolute left-2.5 top-2.5 text-xs font-bold text-slate-400">₹</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{isMr ? 'शासकीय / संघ प्रोत्साहन' : 'Incentive per litre'}</p>
              </div>
            </div>

            {/* Point Step Increments & Reverse Deductions */}
            <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 space-y-4">
              <h4 className="text-xs font-bold text-blue-900 dark:text-blue-200 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-blue-600" />
                <span>{isMr ? 'पॉइंट स्टेप वाढ व कपात दर (0.1% बदलासाठी)' : 'Point Step Increment & Deduction (per 0.1% change)'}</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    {isMr ? 'फॅट वाढ (+0.1% Fat ₹)' : 'Fat Increment (+0.1% ₹)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    disabled={!isEditMode}
                    value={editFormData.cowRateConfig.fatIncrStep}
                    onChange={e => updateCowField('fatIncrStep', parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-bold p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 disabled:bg-slate-100 dark:disabled:bg-slate-800/60 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    {isMr ? 'फॅट कपात (-0.1% Fat ₹)' : 'Fat Deduction (-0.1% ₹)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    disabled={!isEditMode}
                    value={editFormData.cowRateConfig.fatDecrStep}
                    onChange={e => updateCowField('fatDecrStep', parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-bold p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 disabled:bg-slate-100 dark:disabled:bg-slate-800/60 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    {isMr ? 'SNF वाढ (+0.1% SNF ₹)' : 'SNF Increment (+0.1% ₹)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    disabled={!isEditMode}
                    value={editFormData.cowRateConfig.snfIncrStep}
                    onChange={e => updateCowField('snfIncrStep', parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-bold p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 disabled:bg-slate-100 dark:disabled:bg-slate-800/60 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    {isMr ? 'SNF कपात (-0.1% SNF ₹)' : 'SNF Deduction (-0.1% ₹)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    disabled={!isEditMode}
                    value={editFormData.cowRateConfig.snfDecrStep}
                    onChange={e => updateCowField('snfDecrStep', parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-bold p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 disabled:bg-slate-100 dark:disabled:bg-slate-800/60 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Range & TS Parameters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {isMr ? 'किमान फॅट मर्यादा (Min Fat %)' : 'Min Fat Limit (%)'}
                </label>
                <input
                  type="number"
                  step="0.1"
                  disabled={!isEditMode}
                  value={editFormData.cowRateConfig.minFat}
                  onChange={e => updateCowField('minFat', parseFloat(e.target.value) || 0)}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 disabled:bg-slate-100 dark:disabled:bg-slate-800/60 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {isMr ? 'कमाल फॅट मर्यादा (Max Fat %)' : 'Max Fat Limit (%)'}
                </label>
                <input
                  type="number"
                  step="0.1"
                  disabled={!isEditMode}
                  value={editFormData.cowRateConfig.maxFat}
                  onChange={e => updateCowField('maxFat', parseFloat(e.target.value) || 0)}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 disabled:bg-slate-100 dark:disabled:bg-slate-800/60 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {isMr ? 'TS दर (Total Solids ₹/Kg)' : 'TS Rate (₹/Kg TS)'}
                </label>
                <input
                  type="number"
                  step="1"
                  disabled={!isEditMode}
                  value={editFormData.cowRateConfig.tsRatePerKg || 310}
                  onChange={e => updateCowField('tsRatePerKg', parseFloat(e.target.value) || 0)}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 disabled:bg-slate-100 dark:disabled:bg-slate-800/60 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {isMr ? 'फॅट दर (Fat Rate ₹/Kg)' : 'Fat Rate (₹/Kg Fat)'}
                </label>
                <input
                  type="number"
                  step="1"
                  disabled={!isEditMode}
                  value={editFormData.cowRateConfig.fatRatePerKg || 450}
                  onChange={e => updateCowField('fatRatePerKg', parseFloat(e.target.value) || 0)}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 disabled:bg-slate-100 dark:disabled:bg-slate-800/60 focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Buffalo Milk Configuration */}
        {activeTab === 'buffalo' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {isMr ? 'म्हैस दूध दर मापदंड (Buffalo Milk Rate Parameters)' : 'Buffalo Milk Rate Parameters'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isMr ? 'म्हैस दुधासाठी बेस दर, बेस फॅट, बेस SNF आणि पॉइंट स्टेप्स' : 'Base rate, base fat/SNF, and point step increments'}
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-purple-600 bg-purple-50 dark:bg-purple-950/60 px-3 py-1 rounded-lg">
                म्हैस बेस दर: ₹{editFormData.buffaloRateConfig.baseRate.toFixed(2)}/L
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isMr ? 'बेस दर (Base Rate ₹/L)' : 'Base Rate (₹/L)'} *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.05"
                    disabled={!isEditMode}
                    value={editFormData.buffaloRateConfig.baseRate}
                    onChange={e => updateBuffaloField('baseRate', parseFloat(e.target.value) || 0)}
                    className="w-full text-base font-bold pl-7 pr-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 disabled:bg-slate-100 dark:disabled:bg-slate-800/60 disabled:text-slate-600 dark:disabled:text-slate-400 focus:outline-hidden"
                  />
                  <span className="absolute left-2.5 top-2.5 text-xs font-bold text-slate-400">₹</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{isMr ? 'प्रमाणित फॅट व SNF वरील बेस दर' : 'Rate for base Fat & SNF'}</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isMr ? 'बेस फॅट (Base Fat %)' : 'Base Fat (%)'} *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    disabled={!isEditMode}
                    value={editFormData.buffaloRateConfig.baseFat}
                    onChange={e => updateBuffaloField('baseFat', parseFloat(e.target.value) || 0)}
                    className="w-full text-base font-bold pr-7 pl-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 disabled:bg-slate-100 dark:disabled:bg-slate-800/60 disabled:text-slate-600 dark:disabled:text-slate-400 focus:outline-hidden"
                  />
                  <span className="absolute right-2.5 top-2.5 text-xs font-bold text-slate-400">%</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{isMr ? 'प्रमाणित म्हैस फॅट (उदा. 6.0%)' : 'Standard buffalo fat (e.g. 6.0%)'}</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isMr ? 'बेस SNF (Base SNF %)' : 'Base SNF (%)'} *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    disabled={!isEditMode}
                    value={editFormData.buffaloRateConfig.baseSnf}
                    onChange={e => updateBuffaloField('baseSnf', parseFloat(e.target.value) || 0)}
                    className="w-full text-base font-bold pr-7 pl-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 disabled:bg-slate-100 dark:disabled:bg-slate-800/60 disabled:text-slate-600 dark:disabled:text-slate-400 focus:outline-hidden"
                  />
                  <span className="absolute right-2.5 top-2.5 text-xs font-bold text-slate-400">%</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{isMr ? 'प्रमाणित म्हैस SNF (उदा. 9.0%)' : 'Standard buffalo SNF (e.g. 9.0%)'}</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isMr ? 'प्रोत्साहन अनुदान (Incentive ₹/L)' : 'Govt / Dairy Incentive (₹/L)'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    disabled={!isEditMode}
                    value={editFormData.buffaloRateConfig.incentivePerLitre}
                    onChange={e => updateBuffaloField('incentivePerLitre', parseFloat(e.target.value) || 0)}
                    className="w-full text-base font-bold pl-7 pr-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 disabled:bg-slate-100 dark:disabled:bg-slate-800/60 disabled:text-slate-600 dark:disabled:text-slate-400 focus:outline-hidden"
                  />
                  <span className="absolute left-2.5 top-2.5 text-xs font-bold text-slate-400">₹</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{isMr ? 'शासकीय / संघ प्रोत्साहन' : 'Incentive per litre'}</p>
              </div>
            </div>

            {/* Point Step Increments & Reverse Deductions */}
            <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 space-y-4">
              <h4 className="text-xs font-bold text-purple-900 dark:text-purple-200 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-purple-600" />
                <span>{isMr ? 'पॉइंट स्टेप वाढ व कपात दर (0.1% बदलासाठी)' : 'Point Step Increment & Deduction (per 0.1% change)'}</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    {isMr ? 'फॅट वाढ (+0.1% Fat ₹)' : 'Fat Increment (+0.1% ₹)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    disabled={!isEditMode}
                    value={editFormData.buffaloRateConfig.fatIncrStep}
                    onChange={e => updateBuffaloField('fatIncrStep', parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-bold p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 disabled:bg-slate-100 dark:disabled:bg-slate-800/60 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    {isMr ? 'फॅट कपात (-0.1% Fat ₹)' : 'Fat Deduction (-0.1% ₹)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    disabled={!isEditMode}
                    value={editFormData.buffaloRateConfig.fatDecrStep}
                    onChange={e => updateBuffaloField('fatDecrStep', parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-bold p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 disabled:bg-slate-100 dark:disabled:bg-slate-800/60 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    {isMr ? 'SNF वाढ (+0.1% SNF ₹)' : 'SNF Increment (+0.1% ₹)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    disabled={!isEditMode}
                    value={editFormData.buffaloRateConfig.snfIncrStep}
                    onChange={e => updateBuffaloField('snfIncrStep', parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-bold p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 disabled:bg-slate-100 dark:disabled:bg-slate-800/60 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    {isMr ? 'SNF कपात (-0.1% SNF ₹)' : 'SNF Deduction (-0.1% ₹)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    disabled={!isEditMode}
                    value={editFormData.buffaloRateConfig.snfDecrStep}
                    onChange={e => updateBuffaloField('snfDecrStep', parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-bold p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 disabled:bg-slate-100 dark:disabled:bg-slate-800/60 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Range & TS Parameters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {isMr ? 'किमान फॅट मर्यादा (Min Fat %)' : 'Min Fat Limit (%)'}
                </label>
                <input
                  type="number"
                  step="0.1"
                  disabled={!isEditMode}
                  value={editFormData.buffaloRateConfig.minFat}
                  onChange={e => updateBuffaloField('minFat', parseFloat(e.target.value) || 0)}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 disabled:bg-slate-100 dark:disabled:bg-slate-800/60 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {isMr ? 'कमाल फॅट मर्यादा (Max Fat %)' : 'Max Fat Limit (%)'}
                </label>
                <input
                  type="number"
                  step="0.1"
                  disabled={!isEditMode}
                  value={editFormData.buffaloRateConfig.maxFat}
                  onChange={e => updateBuffaloField('maxFat', parseFloat(e.target.value) || 0)}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 disabled:bg-slate-100 dark:disabled:bg-slate-800/60 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {isMr ? 'TS दर (Total Solids ₹/Kg)' : 'TS Rate (₹/Kg TS)'}
                </label>
                <input
                  type="number"
                  step="1"
                  disabled={!isEditMode}
                  value={editFormData.buffaloRateConfig.tsRatePerKg || 420}
                  onChange={e => updateBuffaloField('tsRatePerKg', parseFloat(e.target.value) || 0)}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 disabled:bg-slate-100 dark:disabled:bg-slate-800/60 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {isMr ? 'फॅट दर (Fat Rate ₹/Kg)' : 'Fat Rate (₹/Kg Fat)'}
                </label>
                <input
                  type="number"
                  step="1"
                  disabled={!isEditMode}
                  value={editFormData.buffaloRateConfig.fatRatePerKg || 620}
                  onChange={e => updateBuffaloField('fatRatePerKg', parseFloat(e.target.value) || 0)}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 disabled:bg-slate-100 dark:disabled:bg-slate-800/60 focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Volume Slabs */}
        {activeTab === 'slabs' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {isMr ? 'संकलन बोनस स्लॅब व्यवस्थापन (Volume Slabs)' : 'Volume Bonus Slabs Management'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isMr ? 'अधिक दूध देणाऱ्या गवळी व शेतकऱ्यांना लिटर प्रमाणे थेट अतिरिक्त बोनस' : 'Per-litre volume bonuses based on daily procurement litres'}
                  </p>
                </div>
              </div>

              {isEditMode && (
                <button
                  type="button"
                  onClick={handleAddSlab}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isMr ? 'नवीन स्लॅब जोडा' : 'Add Slab'}</span>
                </button>
              )}
            </div>

            <div className="space-y-3">
              {editFormData.volumeSlabs.map((slab, index) => (
                <div
                  key={slab.id}
                  className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center">
                      #{index + 1}
                    </span>
                    <div>
                      <input
                        type="text"
                        disabled={!isEditMode}
                        value={slab.slabName}
                        onChange={e => handleUpdateSlab(slab.id, 'slabName', e.target.value)}
                        placeholder="स्लॅब नाव"
                        className="text-xs font-bold text-slate-900 dark:text-slate-100 bg-transparent border-b border-transparent focus:border-emerald-500 focus:outline-hidden"
                      />
                      <p className="text-[11px] text-slate-500">
                        {slab.minLitres} L ते {slab.maxLitres > 10000 ? 'अमर्याद' : `${slab.maxLitres} L`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">लिटर श्रेणी:</span>
                      <input
                        type="number"
                        disabled={!isEditMode}
                        value={slab.minLitres}
                        onChange={e => handleUpdateSlab(slab.id, 'minLitres', parseInt(e.target.value, 10) || 0)}
                        className="w-18 p-1.5 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-center"
                      />
                      <span className="text-xs text-slate-400">ते</span>
                      <input
                        type="number"
                        disabled={!isEditMode}
                        value={slab.maxLitres}
                        onChange={e => handleUpdateSlab(slab.id, 'maxLitres', parseInt(e.target.value, 10) || 0)}
                        className="w-22 p-1.5 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-center"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                      <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">बोनस:</span>
                      <span className="text-xs font-bold text-emerald-700">+₹</span>
                      <input
                        type="number"
                        step="0.05"
                        disabled={!isEditMode}
                        value={slab.bonusPerLitre}
                        onChange={e => handleUpdateSlab(slab.id, 'bonusPerLitre', parseFloat(e.target.value) || 0)}
                        className="w-16 p-1 rounded-md text-xs font-bold text-emerald-900 dark:text-emerald-100 bg-white dark:bg-slate-800 border border-emerald-300 text-center"
                      />
                      <span className="text-xs text-emerald-700 font-semibold">/L</span>
                    </div>

                    {isEditMode && editFormData.volumeSlabs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteSlab(slab.id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                        title="Delete slab"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: Incentives & Bonuses */}
        {activeTab === 'incentives' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {isMr ? 'गुणवत्ता व विशेष प्रोत्साहन (Quality & Special Incentives)' : 'Quality & Special Incentives'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isMr ? 'स्वच्छ दूध, शीतकरण, देशी गाय (A2), व वेळेवर डिलिव्हरीचे विशेष दर' : 'Clean milk, cooling, A2 cow milk, and on-time incentives'}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  {isMr ? 'स्वच्छ दूध बोनस (Clean Milk Bonus ₹/L)' : 'Clean Milk Bonus (₹/L)'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.05"
                    disabled={!isEditMode}
                    value={editFormData.qualityIncentives.cleanlinessBonus}
                    onChange={e => updateIncentiveField('cleanlinessBonus', parseFloat(e.target.value) || 0)}
                    className="w-full text-sm font-bold pl-7 pr-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 disabled:bg-slate-100 dark:disabled:bg-slate-800/60"
                  />
                  <span className="absolute left-2.5 top-2.5 text-xs font-bold text-slate-400">₹</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{isMr ? 'MBRT > 4 तास व स्वच्छ भांडी' : 'Low microbial count reward'}</p>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  {isMr ? 'शीतकरण/BMC बोनस (Chilling Bonus ₹/L)' : 'Chilled Milk Bonus (₹/L)'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.05"
                    disabled={!isEditMode}
                    value={editFormData.qualityIncentives.coolingChillingBonus}
                    onChange={e => updateIncentiveField('coolingChillingBonus', parseFloat(e.target.value) || 0)}
                    className="w-full text-sm font-bold pl-7 pr-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 disabled:bg-slate-100 dark:disabled:bg-slate-800/60"
                  />
                  <span className="absolute left-2.5 top-2.5 text-xs font-bold text-slate-400">₹</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{isMr ? '१० अंश से. पेक्षा कमी तापमान' : 'Cold chain chilled milk'}</p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  {isMr ? 'A2 देशी गाय प्रीमियम (A2 Organic Bonus ₹/L)' : 'A2 Desi Cow Premium (₹/L)'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.10"
                    disabled={!isEditMode}
                    value={editFormData.qualityIncentives.organicA2Bonus}
                    onChange={e => updateIncentiveField('organicA2Bonus', parseFloat(e.target.value) || 0)}
                    className="w-full text-sm font-bold pl-7 pr-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 disabled:bg-slate-100 dark:disabled:bg-slate-800/60"
                  />
                  <span className="absolute left-2.5 top-2.5 text-xs font-bold text-slate-400">₹</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{isMr ? 'प्रमाणित गिर/साहिवाल/खिल्लार गाय' : 'Certified desi A2 milk'}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  {isMr ? 'वेळेवर संकलन बोनस (Timely Delivery ₹/L)' : 'On-Time Delivery (₹/L)'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.05"
                    disabled={!isEditMode}
                    value={editFormData.qualityIncentives.timelyDeliveryBonus}
                    onChange={e => updateIncentiveField('timelyDeliveryBonus', parseFloat(e.target.value) || 0)}
                    className="w-full text-sm font-bold pl-7 pr-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 disabled:bg-slate-100 dark:disabled:bg-slate-800/60"
                  />
                  <span className="absolute left-2.5 top-2.5 text-xs font-bold text-slate-400">₹</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{isMr ? 'सकाळी ७:३० पूर्वी पोहोच' : 'Before route departure cutoff'}</p>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  {isMr ? 'सण/हंगामी विशेष बोनस (Festival Bonus ₹/L)' : 'Festival / Seasonal Bonus (₹/L)'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.10"
                    disabled={!isEditMode}
                    value={editFormData.qualityIncentives.festivalBonus}
                    onChange={e => updateIncentiveField('festivalBonus', parseFloat(e.target.value) || 0)}
                    className="w-full text-sm font-bold pl-7 pr-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 disabled:bg-slate-100 dark:disabled:bg-slate-800/60"
                  />
                  <span className="absolute left-2.5 top-2.5 text-xs font-bold text-slate-400">₹</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{isMr ? 'दिवाळी/दसरा/गणपती विशेष दर' : 'Seasonal festive top-up'}</p>
              </div>

              <div className="p-4 rounded-2xl bg-teal-50/40 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900/40">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  {isMr ? 'लसीकरण व टॅगिंग प्रोत्साहन (Tagged Herd ₹/L)' : 'INAPH Tagged & Vaccinated (₹/L)'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.05"
                    disabled={!isEditMode}
                    value={editFormData.qualityIncentives.animalCareIncentive}
                    onChange={e => updateIncentiveField('animalCareIncentive', parseFloat(e.target.value) || 0)}
                    className="w-full text-sm font-bold pl-7 pr-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 disabled:bg-slate-100 dark:disabled:bg-slate-800/60"
                  />
                  <span className="absolute left-2.5 top-2.5 text-xs font-bold text-slate-400">₹</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{isMr ? 'शतप्रतिशत लसीकरण गोठा' : 'Certified healthy herd'}</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Deductions & Transport */}
        {activeTab === 'deductions' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {isMr ? 'कपात, दंड व वाहतूक आकार (Deductions & Charges)' : 'Deductions & Transportation Charges'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isMr ? 'वाहतूक खर्च, पशुखाद्य लेव्ही, व गुणवत्ता त्रुटींसाठी दंड आकार' : 'Transport deductions, feed fund, and quality defect penalties'}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  {isMr ? 'वाहतूक कपात (Transport Charge ₹/L)' : 'Transport Deduction (₹/L)'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.05"
                    disabled={!isEditMode}
                    value={editFormData.deductions.transportChargePerLitre}
                    onChange={e => updateDeductionField('transportChargePerLitre', parseFloat(e.target.value) || 0)}
                    className="w-full text-sm font-bold pl-7 pr-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 disabled:bg-slate-100 dark:disabled:bg-slate-800/60"
                  />
                  <span className="absolute left-2.5 top-2.5 text-xs font-bold text-slate-400">₹</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{isMr ? 'रूट गाडी भाडे कपात' : 'Vehicle fuel & transport levy'}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  {isMr ? 'पशुखाद्य लेव्ही (Cattle Feed Levy ₹/L)' : 'Cattle Feed Fund Levy (₹/L)'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.05"
                    disabled={!isEditMode}
                    value={editFormData.deductions.cattleFeedLevyPerLitre}
                    onChange={e => updateDeductionField('cattleFeedLevyPerLitre', parseFloat(e.target.value) || 0)}
                    className="w-full text-sm font-bold pl-7 pr-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 disabled:bg-slate-100 dark:disabled:bg-slate-800/60"
                  />
                  <span className="absolute left-2.5 top-2.5 text-xs font-bold text-slate-400">₹</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{isMr ? 'संघ पशुखाद्य योजना निधी' : 'Feed subsidy contribution'}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  {isMr ? 'BMC शीतकरण देखभाल (Cooling Charge ₹/L)' : 'BMC Maintenance Charge (₹/L)'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.05"
                    disabled={!isEditMode}
                    value={editFormData.deductions.coolingChargePerLitre}
                    onChange={e => updateDeductionField('coolingChargePerLitre', parseFloat(e.target.value) || 0)}
                    className="w-full text-sm font-bold pl-7 pr-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 disabled:bg-slate-100 dark:disabled:bg-slate-800/60"
                  />
                  <span className="absolute left-2.5 top-2.5 text-xs font-bold text-slate-400">₹</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{isMr ? 'चिलिंग सेंटर देखभाल' : 'Bulk milk chiller overhead'}</p>
              </div>

              <div className="p-4 rounded-2xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40">
                <label className="text-xs font-bold text-red-900 dark:text-red-200 block mb-1">
                  {isMr ? 'पाणी भेसळ दंड (Water Adulteration ₹/L)' : 'Water Adulteration Penalty (₹/L)'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    disabled={!isEditMode}
                    value={editFormData.deductions.waterAdulterationPenalty}
                    onChange={e => updateDeductionField('waterAdulterationPenalty', parseFloat(e.target.value) || 0)}
                    className="w-full text-sm font-bold pl-7 pr-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-red-300 dark:border-red-700 disabled:bg-slate-100 dark:disabled:bg-slate-800/60 text-red-700"
                  />
                  <span className="absolute left-2.5 top-2.5 text-xs font-bold text-red-400">₹</span>
                </div>
                <p className="text-[11px] text-red-600 mt-1">{isMr ? 'फ्रीझिंग पॉइंट त्रुटी दंड' : 'Penalty on added water'}</p>
              </div>

              <div className="p-4 rounded-2xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40">
                <label className="text-xs font-bold text-red-900 dark:text-red-200 block mb-1">
                  {isMr ? 'जादा आम्लता दंड (High Acidity ₹/L)' : 'High Acidity Penalty (₹/L)'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.25"
                    disabled={!isEditMode}
                    value={editFormData.deductions.highAcidityDeduction}
                    onChange={e => updateDeductionField('highAcidityDeduction', parseFloat(e.target.value) || 0)}
                    className="w-full text-sm font-bold pl-7 pr-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-red-300 dark:border-red-700 disabled:bg-slate-100 dark:disabled:bg-slate-800/60 text-red-700"
                  />
                  <span className="absolute left-2.5 top-2.5 text-xs font-bold text-red-400">₹</span>
                </div>
                <p className="text-[11px] text-red-600 mt-1">{isMr ? 'आंबट दूध / COB पॉझिटिव्ह' : 'Penalty for souring milk'}</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: Live Matrix Preview */}
        {activeTab === 'matrix' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-600" />
                  <span>{isMr ? 'लाईव्ह दर मॅट्रिक्स तक्ता (Dynamic Rate Matrix Grid)' : 'Live Dynamic Rate Matrix Grid'}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  {isMr
                    ? 'विविध फॅट व SNF संयोजनांवर मिळणारा थेट प्रति लिटर दर (₹/L)'
                    : 'Instant preview of calculated ₹ per Litre for Fat vs SNF combinations'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSimMilkType('Cow')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    simMilkType === 'Cow'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {isMr ? 'गाय दर तक्ता' : 'Cow Matrix'}
                </button>
                <button
                  type="button"
                  onClick={() => setSimMilkType('Buffalo')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    simMilkType === 'Buffalo'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {isMr ? 'म्हैस दर तक्ता' : 'Buffalo Matrix'}
                </button>
              </div>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300">
                    <th className="p-2.5 font-bold border border-slate-200 dark:border-slate-700 text-center">
                      Fat \ SNF
                    </th>
                    {(simMilkType === 'Cow' ? [8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 9.0] : [8.5, 8.7, 8.8, 9.0, 9.2, 9.4, 9.5]).map(
                      snfVal => (
                        <th
                          key={snfVal}
                          className="p-2.5 font-bold border border-slate-200 dark:border-slate-700 text-center"
                        >
                          {snfVal.toFixed(1)}%
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {(simMilkType === 'Cow'
                    ? [3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 4.0, 4.2]
                    : [5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0]
                  ).map(fatVal => (
                    <tr key={fatVal} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-2.5 font-bold bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 text-center">
                        {fatVal.toFixed(1)}%
                      </td>
                      {(simMilkType === 'Cow' ? [8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 9.0] : [8.5, 8.7, 8.8, 9.0, 9.2, 9.4, 9.5]).map(
                        snfVal => {
                          const res = RateChartService.calculateMilkRate(simMilkType, fatVal, snfVal, 100, {
                            customRateChart: currentWorkingChart,
                          });
                          const isBase =
                            fatVal === (simMilkType === 'Cow' ? currentWorkingChart.cowRateConfig.baseFat : currentWorkingChart.buffaloRateConfig.baseFat) &&
                            snfVal === (simMilkType === 'Cow' ? currentWorkingChart.cowRateConfig.baseSnf : currentWorkingChart.buffaloRateConfig.baseSnf);

                          return (
                            <td
                              key={snfVal}
                              className={`p-2.5 text-center font-mono font-bold border border-slate-200 dark:border-slate-700 ${
                                isBase
                                  ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200'
                                  : 'text-slate-800 dark:text-slate-200'
                              }`}
                            >
                              ₹{res.netRatePerLitre.toFixed(2)}
                            </td>
                          );
                        }
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* BOTTOM FORM ACTION CARD (Always visible below active tab) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
              isEditMode
                ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400'
                : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
            }`}>
              {isEditMode ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>{isEditMode ? (isMr ? 'संपादन मोड सुरू आहे (Edit Mode Active)' : 'Rate Chart Editing Active') : (isMr ? 'मास्टर दर पत्रक लॉक आहे (Locked Master)' : 'Rate Chart is Read-Only')}</span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEditMode
                  ? (isMr ? 'दर बदलल्यानंतर कायमस्वरूपी सेव्ह करण्यासाठी "Save Button" दाबा.' : 'After updating values, click "Save Button" to store permanently.')
                  : (isMr ? 'दर बदलण्यासाठी "Edit Button" दाबा.' : 'To modify rates, click the "Edit Button" to unlock.')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {!isEditMode ? (
              canEdit && (
                <button
                  id="edit-rate-chart-bottom-btn"
                  type="button"
                  onClick={handleRequestEdit}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 ring-2 ring-emerald-400/40"
                >
                  <Unlock className="w-4 h-4" />
                  <span>{isMr ? '✏️ दर पत्रक एडिट करा (Edit Button)' : '✏️ Edit Rate Chart (Edit Button)'}</span>
                </button>
              )
            ) : (
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  id="cancel-rate-chart-bottom-btn"
                  type="button"
                  onClick={handleCancelEditing}
                  className="flex-1 sm:flex-initial px-4 py-3 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-bold transition-all cursor-pointer border border-slate-300 dark:border-slate-700 text-center"
                >
                  {isMr ? 'रद्द करा (Cancel)' : 'Cancel'}
                </button>
                <button
                  id="save-rate-chart-bottom-btn"
                  type="button"
                  onClick={handleInitiateSave}
                  className="flex-2 sm:flex-initial px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 hover:from-emerald-700 hover:to-green-800 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/40 transition-all flex items-center justify-center gap-2 cursor-pointer animate-pulse active:scale-95 ring-2 ring-emerald-300/60"
                >
                  <Save className="w-4 h-4" />
                  <span>{isMr ? '💾 दर पत्रक सेव्ह करा (Save Button)' : '💾 Save Rate Chart (Save Button)'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </form>

      {/* FLOATING STICKY ACTION BAR FOR EDIT & SAVE */}
      {isEditMode && (
        <div className="fixed bottom-4 left-4 right-4 md:left-72 md:right-8 z-40 bg-slate-900/95 backdrop-blur-md border-2 border-emerald-500/80 rounded-3xl p-4 shadow-2xl flex items-center justify-between gap-4 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center gap-3 text-white">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black animate-bounce shrink-0">
              <Unlock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <span>{isMr ? 'संपादन मोड सक्रिय आहे' : 'Editing Rate Chart Master'}</span>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-mono border border-amber-500/40">
                  {isMr ? 'बदल बाकी आहेत' : 'Unsaved Changes'}
                </span>
              </p>
              <p className="text-[11px] text-slate-300 hidden sm:block">
                {isMr
                  ? 'सर्व दर बदलून झाल्यावर सेव्ह बटणावर क्लिक करा.'
                  : 'Click Save Rate Chart to store permanently and apply to all modules.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              id="sticky-cancel-btn"
              type="button"
              onClick={handleCancelEditing}
              className="px-3 sm:px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-bold border border-slate-700 transition-all cursor-pointer"
            >
              {isMr ? 'रद्द करा' : 'Cancel'}
            </button>
            <button
              id="sticky-save-btn"
              type="button"
              onClick={handleInitiateSave}
              className="px-4 sm:px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-600 hover:to-green-700 text-slate-950 text-xs sm:text-sm font-black shadow-lg shadow-emerald-500/50 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <Save className="w-4 h-4 text-slate-950" />
              <span>{isMr ? '💾 सेव्ह करा (Save)' : '💾 Save Rate Chart'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Interactive Bill Simulator Bar */}
      <div className="bg-linear-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-6 shadow-xl border border-slate-700">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-800/60">
              {isMr ? 'थेट दर व बिल सिम्युलेटर' : 'Live Rate & Bill Tester'}
            </span>
            <h3 className="text-base font-bold mt-2 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-400" />
              <span>{isMr ? 'दर पत्रक चाचणी कॅल्क्युलेटर (Rate Verification)' : 'Master Rate Calculation Simulation'}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {isMr ? 'सध्याच्या दर पत्रकानुसार प्रत्यक्ष मिळणारा दर व एकूण बिलाची पडताळणी करा' : 'Verify the exact output rate and bill amount from the active rate chart'}
            </p>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] text-slate-300 block mb-1">प्रकार</label>
              <select
                value={simMilkType}
                onChange={e => setSimMilkType(e.target.value as any)}
                className="w-full text-xs font-bold p-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-hidden"
              >
                <option value="Cow">गाय (Cow)</option>
                <option value="Buffalo">म्हैस (Buffalo)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-300 block mb-1">फॅट (Fat %)</label>
              <input
                type="number"
                step="0.1"
                value={simFat}
                onChange={e => setSimFat(parseFloat(e.target.value) || 0)}
                className="w-full text-xs font-bold p-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-center focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-300 block mb-1">SNF %</label>
              <input
                type="number"
                step="0.1"
                value={simSnf}
                onChange={e => setSimSnf(parseFloat(e.target.value) || 0)}
                className="w-full text-xs font-bold p-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-center focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-300 block mb-1">लिटर (Litres)</label>
              <input
                type="number"
                step="5"
                value={simLitres}
                onChange={e => setSimLitres(parseFloat(e.target.value) || 0)}
                className="w-full text-xs font-bold p-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-center focus:outline-hidden"
              />
            </div>
          </div>

          {/* Output Display */}
          <div className="bg-emerald-950/60 border border-emerald-500/30 p-4 rounded-2xl flex items-center gap-5 shrink-0">
            <div>
              <p className="text-[10px] uppercase font-bold text-emerald-400">{isMr ? 'अंतिम दर / लिटर' : 'Net Rate / Litre'}</p>
              <p className="text-2xl font-bold font-mono text-emerald-200">₹{simResult.netRatePerLitre.toFixed(2)}</p>
              {simResult.appliedSlab && (
                <p className="text-[10px] text-emerald-400">+{simResult.appliedSlab.slabName}</p>
              )}
            </div>
            <div className="border-l border-emerald-800/60 pl-4">
              <p className="text-[10px] uppercase font-bold text-slate-400">{isMr ? 'एकूण बिल रक्कम' : 'Total Bill'}</p>
              <p className="text-xl font-bold font-mono text-white">₹{simResult.netAmount.toLocaleString('en-IN')}</p>
              <p className="text-[10px] text-slate-400">{simLitres} Litres</p>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 0: Edit Confirmation Dialog */}
      {isEditConfirmModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsEditConfirmModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {isMr ? 'दर पत्रक बदलण्यास संमती (Edit Rate Chart)' : 'Edit Rate Chart Confirmation'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isMr ? 'मास्टर दर पत्रक सध्या लॉक स्थितीत आहे.' : 'Master Rate Chart is currently in locked read-only mode.'}
                </p>
              </div>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700/80 rounded-2xl text-xs space-y-2 text-amber-950 dark:text-amber-100">
              <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-200">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span className="text-xs uppercase tracking-wider">{isMr ? 'महत्त्वाची सूचना / Warning' : 'Confirmation Required'}</span>
              </div>
              <p className="text-sm font-semibold leading-relaxed text-amber-950 dark:text-amber-100">
                "{isMr
                  ? 'Are you sure you want to edit the Rate Chart? Changes will affect future calculations and reports.'
                  : 'Are you sure you want to edit the Rate Chart? Changes will affect future calculations and reports.'}"
              </p>
              <p className="text-[11px] text-amber-800 dark:text-amber-300 pt-1 border-t border-amber-200 dark:border-amber-800">
                {isMr
                  ? 'अनलॉक केल्यानंतर आपण सर्व दर मूल्ये संपादित करू शकता. बदल सेव्ह केल्यावरच सर्व कॅल्क्युलेटर, गोठा नोंदी व अहवालांमध्ये नवीन दर लागू होतील.'
                  : 'Unlocking will make all Rate Chart fields editable. After modifying, click "Save" to commit the changes.'}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsEditConfirmModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer transition-all"
              >
                {isMr ? 'रद्द करा' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmStartEditing}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>{isMr ? 'होय, अनलॉक करा व संपादन करा' : 'Yes, Unlock & Edit'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Save Changes Confirmation Dialog */}
      {isSaveModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => !isSaving && setIsSaveModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {isMr ? 'दर पत्रक बदल निश्चित करा (Confirm Rate Chart Update)' : 'Confirm Rate Chart Update'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isMr ? 'दर पत्रकातील बदल सर्व कॅल्क्युलेटर, गोठा नोंदी व अहवालांवर कायमस्वरूपी लागू होतील.' : 'These changes will permanently update rates across the entire application.'}
                </p>
              </div>
            </div>

            {/* Mandatory Warning Quote */}
            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl text-xs text-amber-900 dark:text-amber-200 font-semibold leading-relaxed">
              "Are you sure you want to update the Rate Chart? These changes will affect all future calculations and reports."
            </div>

            {/* Diff Summary */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                {isMr ? 'बदललेले दर मापदंड (Changes Summary):' : 'Modified Parameters:'}
              </h4>
              {pendingDiffs.length === 0 ? (
                <p className="text-xs text-slate-400 italic">कोणतेही मुख्य बदल नाहीत (No major changes detected).</p>
              ) : (
                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                  {pendingDiffs.map((diff, i) => (
                    <div
                      key={i}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 flex items-center gap-2"
                    >
                      <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>{diff}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reason for Update (Mandatory) */}
            <div>
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                {isMr ? 'दर बदलाचे कारण (Reason for Update) *' : 'Reason for Update *'}
              </label>
              <textarea
                rows={2}
                required
                placeholder={isMr ? 'उदा. शासकीय दर सुधारणा ऑगस्ट 2026 / हिवाळी फॅट प्रोत्साहन वाढ' : 'E.g., Monsoon incentive hike, Govt rate revision, etc.'}
                value={changeReason}
                onChange={e => setChangeReason(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden"
              />
            </div>

            {/* Modal Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                disabled={isSaving}
                onClick={() => setIsSaveModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
              >
                {isMr ? 'रद्द करा' : 'Cancel'}
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleConfirmSave}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all flex items-center gap-2 cursor-pointer"
              >
                {isSaving ? (
                  <span>{isMr ? 'सेव्ह होत आहे...' : 'Saving...'}</span>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{isMr ? 'होय, दर पत्रक अद्ययावत करा' : 'Confirm & Save Permanently'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: History & Version Rollback Modal */}
      {isHistoryModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsHistoryModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4 max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {isMr ? 'दर पत्रक आवृत्ती इतिहास व रोलबॅक (Rate Chart History)' : 'Rate Chart Version Control & History'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isMr ? 'मागील सर्व दर बदलांचा अचूक वेळ, तारीख, अधिकारी व बदलांसह संपूर्ण इतिहास' : 'Complete audit trail of all previous rate revisions with rollback capability'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {historyList.map(entry => {
                const isCurrent = entry.version === activeRule.version;

                return (
                  <div
                    key={entry.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isCurrent
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                          {entry.versionTag || `v${entry.version}`}
                        </span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-600 text-white">
                            {isMr ? 'सध्या लागू (Active)' : 'Currently Active'}
                          </span>
                        )}
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {entry.changeReason}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {canRestore && !isCurrent && (
                          <button
                            type="button"
                            onClick={() => handleInitiateRestore(entry.version)}
                            className="px-3 py-1 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>{isMr ? 'ही आवृत्ती पूर्ववत करा (Restore)' : 'Restore'}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-2 text-xs text-slate-500 flex items-center gap-3 font-mono flex-wrap">
                      <span>{isMr ? 'दिनांक' : 'Date'}: {entry.date}</span>
                      <span>•</span>
                      <span>{isMr ? 'वेळ' : 'Time'}: {entry.time}</span>
                      <span>•</span>
                      <span>{isMr ? 'वापरकर्ता' : 'User'}: {entry.updatedBy?.name || 'Admin'} ({entry.updatedBy?.role})</span>
                    </div>

                    {/* Detailed field-by-field change table if available */}
                    {entry.detailedChanges && entry.detailedChanges.length > 0 ? (
                      <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                        <table className="w-full text-[11px] text-left">
                          <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                            <tr>
                              <th className="p-2">{isMr ? 'फिल्ड नाव (Field Name)' : 'Field Name'}</th>
                              <th className="p-2 text-rose-600 dark:text-rose-400">{isMr ? 'मागील मूल्य (Previous)' : 'Previous Value'}</th>
                              <th className="p-2 text-emerald-600 dark:text-emerald-400">{isMr ? 'नवीन मूल्य (New)' : 'New Value'}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900/50">
                            {entry.detailedChanges.map((change, cIdx) => (
                              <tr key={cIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                <td className="p-2 font-medium text-slate-800 dark:text-slate-200">{change.fieldLabel || change.fieldName}</td>
                                <td className="p-2 font-mono text-rose-600 dark:text-rose-400 font-semibold">{change.previousValue}</td>
                                <td className="p-2 font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{change.newValue}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : entry.diffSummary && entry.diffSummary.length > 0 ? (
                      <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 space-y-1">
                        {entry.diffSummary.map((diff, idx) => (
                          <div key={idx} className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                            <span>{diff}</span>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsHistoryModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
              >
                {isMr ? 'बंद करा' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Restore Confirmation Dialog */}
      {isRestoreModalOpen && restoreTargetVersion && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsRestoreModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {isMr ? 'मागील आवृत्ती पूर्ववत करा (Restore Version)' : 'Restore Previous Rate Version'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isMr
                    ? `तुम्ही आवृत्ती v${restoreTargetVersion} संपूर्ण सिस्टीममध्ये लागू करू इच्छिता का?`
                    : `Do you want to restore rate configuration from version v${restoreTargetVersion}?`}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {isMr
                ? `यामुळे सर्व कॅल्क्युलेटर, गोठा नोंदी व अहवालांमध्ये आवृत्ती v${restoreTargetVersion} ची दर रचना त्वरित लागू होईल आणि नवीन आवृत्ती क्रमांक तयार केला जाईल.`
                : `This will immediately apply the rate configuration of version v${restoreTargetVersion} across all forms, calculators, and reports.`}
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsRestoreModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
              >
                {isMr ? 'रद्द करा' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmRestore}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isMr ? 'होय, पूर्ववत करा' : 'Confirm Restore'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
