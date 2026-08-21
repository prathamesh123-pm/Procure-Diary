import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { Sidebar } from './components/common/Sidebar';
import { AudioRecorderModal } from './components/common/AudioRecorderModal';
import { CloudSyncModal } from './components/common/CloudSyncModal';
import { AIDairyAssistantModal } from './components/ai/AIDairyAssistantModal';
import { LoginView } from './components/auth/LoginView';

// Views
import { DashboardView } from './components/dashboard/DashboardView';
import { CallRegisterView } from './components/calls/CallRegisterView';
import { IncomingCallView } from './components/calls/IncomingCallView';
import { CallHistoryView } from './components/calls/CallHistoryView';
import { FarmerMasterView } from './components/farmers/FarmerMasterView';
import { RouteManagementView } from './components/routes/RouteManagementView';
import { TaskManagementView } from './components/tasks/TaskManagementView';
import { FollowUpView } from './components/followups/FollowUpView';
import { ReportsAnalyticsView } from './components/reports/ReportsAnalyticsView';
import { DailyWorkReportGeneratorView } from './components/reports/DailyWorkReportGeneratorView';
import { DownloadCenterView } from './components/downloads/DownloadCenterView';
import { ActivityTrackingView } from './components/admin/ActivityTrackingView';
import { AdminMonitoringDashboard } from './components/admin/AdminMonitoringDashboard';
import { UserManagementView } from './components/admin/UserManagementView';
import { DailyWorkPlanView } from './components/plan/DailyWorkPlanView';
import { RateCalculatorModal } from './components/calculator/RateCalculatorModal';
import { RateChartMasterView } from './components/calculator/RateChartMasterView';
import { ProducerCommunicationView } from './components/calls/ProducerCommunicationView';
import { ProducerSurveyDashboardView } from './components/surveys/ProducerSurveyDashboardView';
import { CenterManagementView } from './components/centers/CenterManagementView';
import { GothaSurveyView } from './components/gotha/GothaSurveyView';
import { DailyTourPlanView } from './components/tour/DailyTourPlanView';
import { MPOAttendanceView } from './components/attendance/MPOAttendanceView';
import { InspectionAuditView } from './components/inspections/InspectionAuditView';
import { FssaiComplianceView } from './components/fssai/FssaiComplianceView';
import { CompetitorManagementView } from './components/competitors/CompetitorManagementView';
import { NoticeBroadcastView } from './components/notices/NoticeBroadcastView';
import { ComplaintTaskManagementView } from './components/complaints/ComplaintTaskManagementView';
import { BackupService } from './services/backupService';

// Call Form Modal
import { CallFormModal } from './components/calls/CallFormModal';
import { Farmer } from './types';
import { WifiOff, Sparkles, Plus, Mic, Calculator } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { currentUser, isLoading } = useAuth();
  const { language, t } = useLanguage();

  // Navigation State
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Global Modals
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [callModalType, setCallModalType] = useState<'incoming' | 'outgoing'>('outgoing');
  const [selectedFarmerForCall, setSelectedFarmerForCall] = useState<Farmer | null>(null);

  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isRateCalcOpen, setIsRateCalcOpen] = useState(false);

  // Network State
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Auto-scheduled backup check
    BackupService.checkAndTriggerAutoBackup();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">डेअरी कॉल सिस्टीम सुरू होत आहे...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginView />;
  }

  const handleOpenNewCall = (type: 'incoming' | 'outgoing' = 'outgoing', farmer?: Farmer) => {
    setCallModalType(type);
    setSelectedFarmerForCall(farmer || null);
    setIsCallModalOpen(true);
  };

  const handleAudioSaved = (record: { base64: string; duration: number }) => {
    setIsAudioModalOpen(false);
    // Automatically open call modal with audio note attached
    setIsCallModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      {/* Offline Toast Banner */}
      {!isOnline && (
        <div className="bg-amber-600 text-white text-xs font-bold py-1.5 px-4 flex items-center justify-center gap-2 shadow-sm sticky top-0 z-50">
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>
            {language === 'mr'
              ? 'ऑफलाईन मोड सुरू आहे. सर्व नोंदी स्थानिक मेमरीमध्ये सुरक्षित राहतील व इंटरनेट आल्यावर क्लाउडवर सिंक होतील.'
              : 'Offline Mode Active. All records will be stored locally and synced when online.'}
          </span>
        </div>
      )}

      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onToggleSidebar={() => setIsSidebarOpen(true)}
        onOpenSidebar={() => setIsSidebarOpen(true)}
        onOpenNewCall={() => handleOpenNewCall('outgoing')}
        onOpenVoiceRecord={() => setIsAudioModalOpen(true)}
        onOpenSync={() => setIsSyncModalOpen(true)}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        onOpenAI={() => setIsAIAssistantOpen(true)}
        onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
        onOpenRateCalc={() => setIsRateCalcOpen(true)}
      />

      {/* Main Content Area with Desktop Sidebar */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto p-3 sm:p-5 gap-5">
        {/* Desktop Left Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onSelectTab={setActiveTab}
            isOpen={true}
            onClose={() => {}}
            isDesktop={true}
            onOpenSync={() => setIsSyncModalOpen(true)}
            onOpenNewCall={() => handleOpenNewCall('outgoing')}
            onOpenVoiceRecord={() => setIsAudioModalOpen(true)}
            onOpenAI={() => setIsAIAssistantOpen(true)}
            onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
            onOpenRateCalc={() => setIsRateCalcOpen(true)}
          />
        </aside>

        {/* Mobile Slide-out Drawer */}
        <div className="lg:hidden">
          <Sidebar
            activeTab={activeTab}
            setActiveTab={tab => {
              setActiveTab(tab);
              setIsSidebarOpen(false);
            }}
            onSelectTab={tab => {
              setActiveTab(tab);
              setIsSidebarOpen(false);
            }}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            onOpenSync={() => {
              setIsSidebarOpen(false);
              setIsSyncModalOpen(true);
            }}
            onOpenNewCall={() => {
              setIsSidebarOpen(false);
              handleOpenNewCall('outgoing');
            }}
            onOpenVoiceRecord={() => {
              setIsSidebarOpen(false);
              setIsAudioModalOpen(true);
            }}
            onOpenAI={() => {
              setIsSidebarOpen(false);
              setIsAIAssistantOpen(true);
            }}
            onOpenAIAssistant={() => {
              setIsSidebarOpen(false);
              setIsAIAssistantOpen(true);
            }}
            onOpenRateCalc={() => {
              setIsSidebarOpen(false);
              setIsRateCalcOpen(true);
            }}
          />
        </div>

        {/* Dynamic Main Workspace View */}
        <main className="flex-1 min-w-0">
          {activeTab === 'dashboard' && (
            <DashboardView
              onNavigateTab={setActiveTab}
              onNavigate={setActiveTab}
              onNewCall={(farmer) => handleOpenNewCall('outgoing', farmer)}
              onNewIncomingCall={(farmer) => handleOpenNewCall('incoming', farmer)}
              onNewFarmer={() => setActiveTab('farmers')}
              onSelectFarmer={(farmer) => handleOpenNewCall('outgoing', farmer)}
              onOpenVoiceRecord={() => setIsAudioModalOpen(true)}
              onOpenAI={() => setIsAIAssistantOpen(true)}
              onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
              onOpenRateCalc={() => setIsRateCalcOpen(true)}
            />
          )}

          {activeTab === 'centers' && <CenterManagementView />}

          {activeTab === 'gotha_surveys' && <GothaSurveyView />}

          {activeTab === 'daily_tour_plan' && <DailyTourPlanView />}

          {activeTab === 'mpo_attendance' && <MPOAttendanceView />}

          {activeTab === 'inspections' && <InspectionAuditView />}

          {activeTab === 'fssai_compliance' && <FssaiComplianceView />}

          {activeTab === 'competitors' && <CompetitorManagementView />}

          {activeTab === 'notices' && <NoticeBroadcastView />}

          {activeTab === 'complaints_tasks' && <ComplaintTaskManagementView />}

          {activeTab === 'daily_report' && <DailyWorkReportGeneratorView />}

          {activeTab === 'plan' && <DailyTourPlanView />}

          {activeTab === 'calls' && (
            <CallRegisterView onSelectFarmer={f => handleOpenNewCall('outgoing', f)} />
          )}

          {activeTab === 'producer_communication' && (
            <ProducerCommunicationView currentUser={currentUser || undefined} isAdmin={currentUser?.role === 'admin'} />
          )}

          {activeTab === 'incoming' && (
            <IncomingCallView onSelectFarmer={f => handleOpenNewCall('incoming', f)} />
          )}

          {activeTab === 'call_history' && <CallHistoryView />}

          {activeTab === 'farmers' && (
            <FarmerMasterView onNewCallForFarmer={f => handleOpenNewCall('outgoing', f)} />
          )}

          {activeTab === 'producer_surveys' && <ProducerSurveyDashboardView />}

          {activeTab === 'routes' && <RouteManagementView />}

          {activeTab === 'tasks' && <TaskManagementView />}

          {activeTab === 'followups' && <FollowUpView />}

          {activeTab === 'rate_chart' && (
            <RateChartMasterView onBack={() => setActiveTab('dashboard')} />
          )}

          {activeTab === 'download_center' && <DownloadCenterView />}

          {activeTab === 'reports' && <ReportsAnalyticsView />}

          {activeTab === 'activity_log' && <ActivityTrackingView />}

          {activeTab === 'admin_monitoring' && <AdminMonitoringDashboard />}

          {activeTab === 'users' && <UserManagementView />}
        </main>
      </div>

      {/* Floating Action Button for Mobile quick actions */}
      <div className="fixed bottom-20 right-4 z-40 md:hidden flex flex-col items-end gap-2.5">
        <button
          onClick={() => setIsRateCalcOpen(true)}
          className="w-11 h-11 rounded-2xl bg-amber-600 text-white shadow-xl shadow-amber-600/30 flex items-center justify-center cursor-pointer active:scale-95 transition-all"
          title="Milk Rate & Fat Calculator"
        >
          <Calculator className="w-5 h-5" />
        </button>

        <button
          onClick={() => setIsAIAssistantOpen(true)}
          className="w-11 h-11 rounded-2xl bg-slate-900 dark:bg-slate-800 text-amber-300 shadow-xl border border-amber-400/40 flex items-center justify-center cursor-pointer active:scale-95 transition-all"
          title="AI Dairy Copilot"
        >
          <Sparkles className="w-5 h-5" />
        </button>

        <button
          onClick={() => setIsAudioModalOpen(true)}
          className="w-11 h-11 rounded-2xl bg-red-600 text-white shadow-xl shadow-red-600/30 flex items-center justify-center cursor-pointer active:scale-95 transition-all"
          title="Record Voice Note"
        >
          <Mic className="w-5 h-5" />
        </button>

        <button
          onClick={() => handleOpenNewCall('outgoing')}
          className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-xl shadow-emerald-600/40 flex items-center justify-center cursor-pointer active:scale-95 transition-all"
          title="Log Call"
        >
          <Plus className="w-7 h-7 stroke-[2.5]" />
        </button>
      </div>

      {/* Bottom Navigation for Mobile */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSelectTab={setActiveTab}
        onQuickNewCall={() => handleOpenNewCall('outgoing')}
        onOpenNewCall={() => handleOpenNewCall('outgoing')}
      />

      {/* Global Modals */}
      <CallFormModal
        isOpen={isCallModalOpen}
        onClose={() => {
          setIsCallModalOpen(false);
          setSelectedFarmerForCall(null);
        }}
        initialType={callModalType}
        initialFarmer={selectedFarmerForCall}
      />

      <AudioRecorderModal
        isOpen={isAudioModalOpen}
        onClose={() => setIsAudioModalOpen(false)}
        onSaved={handleAudioSaved}
      />

      <CloudSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
      />

      <AIDairyAssistantModal
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
      />

      <RateCalculatorModal
        isOpen={isRateCalcOpen}
        onClose={() => setIsRateCalcOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <ToastProvider>
            <MainAppContent />
          </ToastProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
