import React, { useState, useEffect, useMemo } from 'react';
import {
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  Search,
  Filter,
  Plus,
  FileSpreadsheet,
  FileText,
  Calendar,
  Sparkles,
  Volume2,
  Trash2,
  Edit2,
  MessageCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  RefreshCw,
  X,
  Play,
  Pause,
} from 'lucide-react';
import { CallRecord, CallPurpose, CallStatus, Farmer } from '../../types';
import { StorageService } from '../../services/storageService';
import { ExcelService } from '../../services/excelService';
import { PDFService } from '../../services/pdfService';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';
import { CallFormModal } from './CallFormModal';

interface CallRegisterViewProps {
  onSelectFarmer?: (farmer: Farmer) => void;
}

export const CallRegisterView: React.FC<CallRegisterViewProps> = ({ onSelectFarmer }) => {
  const { language, t } = useLanguage();
  const { currentUser, isAdmin } = useAuth();
  const { showDeleteSuccess, showError } = useToast();

  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoute, setSelectedRoute] = useState('all');
  const [selectedPurpose, setSelectedPurpose] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState<'all' | 'incoming' | 'outgoing'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modals & State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inspectCall, setInspectCall] = useState<CallRecord | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);

  // Delete Modal State
  const [callToDelete, setCallToDelete] = useState<CallRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = () => {
    setCalls(StorageService.getCalls());
    setFarmers(StorageService.getFarmers());
    setRoutes(StorageService.getRoutes());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('dairy_storage_updated', loadData);
    return () => window.removeEventListener('dairy_storage_updated', loadData);
  }, []);

  // Filter logic
  const filteredCalls = useMemo(() => {
    return calls.filter(c => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          c.farmerName.toLowerCase().includes(q) ||
          c.farmerCode.toLowerCase().includes(q) ||
          c.mobileNumber.includes(q) ||
          c.village.toLowerCase().includes(q) ||
          c.discussion.toLowerCase().includes(q) ||
          c.callPurpose.toLowerCase().includes(q);
        if (!match) return false;
      }

      if (selectedRoute !== 'all' && c.route !== selectedRoute) return false;
      if (selectedPurpose !== 'all' && c.callPurpose !== selectedPurpose) return false;
      if (selectedStatus !== 'all' && c.callStatus !== selectedStatus) return false;
      if (selectedType !== 'all' && c.type !== selectedType) return false;
      if (startDate && c.date < startDate) return false;
      if (endDate && c.date > endDate) return false;

      return true;
    });
  }, [calls, searchQuery, selectedRoute, selectedPurpose, selectedStatus, selectedType, startDate, endDate]);

  const handleConfirmDelete = async () => {
    if (!callToDelete) return;
    setIsDeleting(true);
    try {
      StorageService.deleteCall(callToDelete.id);
      showDeleteSuccess(`${callToDelete.farmerName} (${callToDelete.callPurpose})`);
      setCallToDelete(null);
      if (inspectCall?.id === callToDelete.id) {
        setInspectCall(null);
      }
    } catch (err: any) {
      showError(err?.message || 'Failed to delete call record');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleAudio = (call: CallRecord) => {
    if (playingAudioId === call.id) {
      audioPlayer?.pause();
      setPlayingAudioId(null);
      return;
    }

    if (audioPlayer) {
      audioPlayer.pause();
    }

    if (call.audioUrl || call.audioBase64) {
      const player = new Audio(call.audioUrl || call.audioBase64);
      player.onended = () => setPlayingAudioId(null);
      player.play();
      setAudioPlayer(player);
      setPlayingAudioId(call.id);
    }
  };

  const handleExportExcel = () => {
    ExcelService.exportCallsToExcel(filteredCalls);
  };

  const handleExportPDF = () => {
    const routeLabel = selectedRoute === 'all' ? (language === 'mr' ? 'सर्व रूट्स' : 'All Routes') : selectedRoute;
    const dateRangeLabel = startDate && endDate ? `${startDate} to ${endDate}` : startDate ? `From ${startDate}` : endDate ? `Until ${endDate}` : 'All Time';
    PDFService.generateCustomPDFReport({
      category: 'calls',
      title: language === 'mr' ? 'दुग्ध संकलन कॉल रोजनिशी व संवाद अहवाल' : 'Procure Diary Field Call Diary & Operations Report',
      calls: filteredCalls,
      officerName: currentUser?.name || 'All Officers',
      routeFilter: routeLabel,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      dateRangeLabel,
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedRoute('all');
    setSelectedPurpose('all');
    setSelectedStatus('all');
    setSelectedType('all');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="space-y-4 pb-20 md:pb-6 animate-in fade-in">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {t('call.title')}
              </h2>
              <p className="text-xs text-slate-500">
                {filteredCalls.length} {language === 'mr' ? 'नोंदी दर्शविल्या' : 'records found'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{t('call.new_call')}</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer"
            title="Export to Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Excel</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer"
            title="Download PDF"
          >
            <FileText className="w-3.5 h-3.5 text-red-600" />
            <span className="hidden sm:inline">PDF</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
          {/* Search Box */}
          <div className="lg:col-span-2 relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={language === 'mr' ? 'शेतकरी, कोड, फोन किंवा चर्चा शोधा...' : 'Search by name, code, phone, topic...'}
              className="w-full text-xs pl-8.5 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Route Filter */}
          <div>
            <select
              value={selectedRoute}
              onChange={e => setSelectedRoute(e.target.value)}
              className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="all">{language === 'mr' ? 'सर्व रूट्स (All Routes)' : 'All Routes'}</option>
              {routes.map(r => (
                <option key={r.id} value={r.routeNumber}>
                  {r.routeNumber} - {r.routeName}
                </option>
              ))}
            </select>
          </div>

          {/* Purpose Filter */}
          <div>
            <select
              value={selectedPurpose}
              onChange={e => setSelectedPurpose(e.target.value)}
              className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="all">{language === 'mr' ? 'सर्व कारणे (All Purpose)' : 'All Purposes'}</option>
              <option value="Milk Collection">Milk Collection</option>
              <option value="Rate Information">Rate Information</option>
              <option value="Payment">Payment</option>
              <option value="Advance">Advance</option>
              <option value="RT">RT</option>
              <option value="Complaint">Complaint</option>
              <option value="Milk Quality">Milk Quality</option>
              <option value="Visit">Field Visit</option>
              <option value="New Producer">New Producer</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="all">{language === 'mr' ? 'सर्व स्थिती (All Status)' : 'All Statuses'}</option>
              <option value="Completed">Completed</option>
              <option value="Not Received">Not Received</option>
              <option value="Switched Off">Switched Off</option>
              <option value="Busy">Busy</option>
              <option value="Follow-up Required">Follow-up Required</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value as any)}
              className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="all">{language === 'mr' ? 'इन/आउट सर्व' : 'All Types'}</option>
              <option value="outgoing">Outgoing (आउटगोइंग)</option>
              <option value="incoming">Incoming (इनकमिंग)</option>
            </select>
          </div>
        </div>

        {/* Date Filter row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">{language === 'mr' ? 'दिनांक श्रेणी:' : 'Date Range:'}</span>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="p-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
            <span className="text-slate-400">ते</span>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="p-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <button
            onClick={clearFilters}
            className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-semibold cursor-pointer underline"
          >
            {language === 'mr' ? 'फिल्टर साफ करा' : 'Clear Filters'}
          </button>
        </div>
      </div>

      {/* Main Call Records List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        {filteredCalls.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs space-y-2">
            <PhoneCall className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
            <p>{t('common.no_records')}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredCalls.map(call => {
              const isIncoming = call.type === 'incoming';
              const isCompleted = call.callStatus === 'Completed';
              const matchedFarmer = farmers.find(f => f.farmerCode === call.farmerCode);
              const hasVoice = !!(call.audioUrl || call.audioBase64);

              return (
                <div
                  key={call.id}
                  className="p-3 sm:p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isIncoming
                          ? 'bg-blue-100 dark:bg-blue-950 text-blue-600'
                          : isCompleted
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-600'
                      }`}
                    >
                      {isIncoming ? <PhoneIncoming className="w-5 h-5" /> : <PhoneOutgoing className="w-5 h-5" />}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {call.farmerName}
                        </span>
                        <span className="px-1.5 py-0.2 text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded font-mono">
                          {call.farmerCode}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {call.date} • {call.time} ({call.callDuration}s)
                        </span>
                        <span className="px-1.5 py-0.2 text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded">
                          {call.route} - {call.village}
                        </span>
                      </div>

                      <div className="text-xs text-slate-700 dark:text-slate-300">
                        <span className="font-bold text-emerald-700 dark:text-emerald-400">
                          [{call.callPurpose}]
                        </span>{' '}
                        {call.discussion}
                      </div>

                      {call.informationGiven && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          💡 <strong className="text-slate-600 dark:text-slate-300">{language === 'mr' ? 'दिलेली माहिती:' : 'Info Shared:'}</strong>{' '}
                          {call.informationGiven}
                        </p>
                      )}

                      {call.aiSummary && (
                        <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-lg border border-emerald-200/50 dark:border-emerald-800/50">
                          <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span className="line-clamp-1">AI: {call.aiSummary}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2.5 text-[11px] text-slate-500 pt-0.5 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isCompleted
                              ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300'
                              : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                          }`}
                        >
                          {call.callStatus}
                        </span>

                        {call.followUpDate && (
                          <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{language === 'mr' ? 'फॉलो-अप:' : 'Follow-up:'} {call.followUpDate}</span>
                          </span>
                        )}

                        {call.hasPendingWork && (
                          <span className="text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            <span>{language === 'mr' ? 'प्रलंबित काम:' : 'Pending:'} {call.pendingWork || 'होय'}</span>
                          </span>
                        )}

                        <span className="text-slate-400">
                          👤 {call.officerName}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Right Side */}
                  <div className="flex items-center gap-1.5 self-end md:self-center shrink-0">
                    {/* Voice play button */}
                    {hasVoice && (
                      <button
                        onClick={() => handleToggleAudio(call)}
                        className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                          playingAudioId === call.id
                            ? 'bg-red-600 text-white animate-pulse'
                            : 'bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-300'
                        }`}
                        title="Play Voice Note"
                      >
                        {playingAudioId === call.id ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        <span className="text-[10px]">Voice</span>
                      </button>
                    )}

                    {/* Direct Call Button */}
                    <a
                      href={`tel:${call.mobileNumber}`}
                      className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 transition-colors"
                      title="Direct Call"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                    </a>

                    {/* WhatsApp */}
                    <a
                      href={`https://wa.me/91${call.mobileNumber}?text=${encodeURIComponent(
                        `दूध संकलन अधिकारी संपर्क संदर्भ: ${call.farmerName} (${call.route})`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-green-50 dark:bg-green-950 text-green-600 hover:bg-green-100 transition-colors"
                      title="WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </a>

                    {/* Inspect View Details Modal Button */}
                    <button
                      onClick={() => setInspectCall(call)}
                      className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                      title="View Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete button with clear styling */}
                    <button
                      onClick={() => setCallToDelete(call)}
                      aria-label="Delete Call Record"
                      className="p-2 rounded-xl bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/80 transition-all cursor-pointer shadow-2xs min-h-[36px] min-w-[36px] flex items-center justify-center active:scale-95"
                      title={language === 'mr' ? 'कॉल नोंद हटवा' : 'Delete Call Record'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* New Call Form Modal */}
      <CallFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCallSaved={() => loadData()}
      />

      {/* Inspect Call Record Details Modal */}
      {inspectCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">{inspectCall.farmerName}</h3>
                  <p className="text-[11px] text-slate-400">{inspectCall.farmerCode} • {inspectCall.route}</p>
                </div>
              </div>
              <button onClick={() => setInspectCall(null)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                <div>
                  <span className="text-slate-400 block">{language === 'mr' ? 'मोबाईल:' : 'Mobile:'}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{inspectCall.mobileNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">{language === 'mr' ? 'दिनांक व वेळ:' : 'Date & Time:'}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{inspectCall.date} {inspectCall.time}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">{language === 'mr' ? 'उद्देश:' : 'Purpose:'}</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">{inspectCall.callPurpose}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">{language === 'mr' ? 'स्थिती:' : 'Status:'}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{inspectCall.callStatus}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">{language === 'mr' ? 'चर्चेचा संपूर्ण तपशील:' : 'Discussion Details:'}</h4>
                <p className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300 leading-relaxed">
                  {inspectCall.discussion}
                </p>
              </div>

              {inspectCall.aiSummary && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <span className="font-bold text-emerald-900 dark:text-emerald-300 block mb-0.5">AI Summary</span>
                  <p className="text-emerald-800 dark:text-emerald-200">{inspectCall.aiSummary}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setCallToDelete(inspectCall)}
                className="px-3 py-1.5 bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60 border border-red-200 dark:border-red-800 font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{language === 'mr' ? 'नोंद हटवा' : 'Delete Record'}</span>
              </button>

              <button
                onClick={() => setInspectCall(null)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg cursor-pointer transition-colors shadow-xs"
              >
                {language === 'mr' ? 'पूर्ण' : 'Done'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Standardized Delete Confirmation Dialog */}
      {callToDelete && (
        <DeleteConfirmModal
          isOpen={Boolean(callToDelete)}
          onClose={() => setCallToDelete(null)}
          onConfirm={handleConfirmDelete}
          isDeleting={isDeleting}
          itemType={language === 'mr' ? 'कॉल नोंद' : 'Call Record'}
          itemName={`${callToDelete.farmerName} - ${callToDelete.callPurpose}`}
          itemCode={callToDelete.date}
          title={language === 'mr' ? 'हा कॉल रेकॉर्ड नक्की डिलीट करायचा आहे का?' : 'Delete this call record?'}
        />
      )}
    </div>
  );
};
