import React, { useState, useEffect, useMemo } from 'react';
import {
  Phone,
  PhoneCall,
  MessageSquare,
  Send,
  Calendar,
  Clock,
  Search,
  Filter,
  Download,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  AlertCircle,
  XCircle,
  PhoneOff,
  PhoneForwarded,
  RefreshCw,
  Plus,
  Edit3,
  Trash2,
  History,
  Eye,
  Check,
  ChevronDown,
  Sparkles,
  Share2,
  Users,
  Building2,
  MapPin,
  Flame,
  FileCode,
  SlidersHorizontal,
  Info,
} from 'lucide-react';
import {
  Farmer,
  ProducerCommunicationRecord,
  ProducerCommunicationSubject,
  ProducerCallStatus,
  CommunicationCampaign,
} from '../../types';
import {
  ProducerCommunicationService,
  PRODUCER_COMMUNICATION_SUBJECTS,
  PRODUCER_CALL_STATUSES,
} from '../../services/producerCommunicationService';
import { StorageService } from '../../services/storageService';

interface ProducerCommunicationViewProps {
  currentUser?: {
    id: string;
    name: string;
    role: string;
  };
  isAdmin?: boolean;
}

export const ProducerCommunicationView: React.FC<ProducerCommunicationViewProps> = ({
  currentUser = { id: 'USR-ADMIN-1', name: 'प्रमोद सावंत (Admin)', role: 'admin' },
  isAdmin = true,
}) => {
  // State: Data
  const [producers, setProducers] = useState<Farmer[]>([]);
  const [calls, setCalls] = useState<ProducerCommunicationRecord[]>([]);
  const [campaigns, setCampaigns] = useState<CommunicationCampaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('CMP-2026-001');

  // State: Controls & Filters
  const [selectedSubject, setSelectedSubject] = useState<ProducerCommunicationSubject>('Rate Information');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedRoute, setSelectedRoute] = useState<string>('all');
  const [selectedLinkCenter, setSelectedLinkCenter] = useState<string>('all');
  const [selectedMilkType, setSelectedMilkType] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Drawers
  const [showLogCallModal, setShowLogCallModal] = useState<boolean>(false);
  const [selectedProducerForCall, setSelectedProducerForCall] = useState<Farmer | null>(null);
  const [existingCallRecord, setExistingCallRecord] = useState<ProducerCommunicationRecord | null>(null);

  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [historyProducer, setHistoryProducer] = useState<Farmer | null>(null);
  const [producerHistoryList, setProducerHistoryList] = useState<ProducerCommunicationRecord[]>([]);

  const [showCampaignModal, setShowCampaignModal] = useState<boolean>(false);
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);
  const [showTemplateDrawer, setShowTemplateDrawer] = useState<boolean>(false);

  // Quick Notification Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Call Logging Form State
  const [callStatus, setCallStatus] = useState<ProducerCallStatus>('Call Completed');
  const [callDate, setCallDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [callTime, setCallTime] = useState<string>(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [callDuration, setCallDuration] = useState<number>(60);
  const [callRemarks, setCallRemarks] = useState<string>('');
  const [followUpDate, setFollowUpDate] = useState<string>('');
  const [callChannel, setCallChannel] = useState<'Call' | 'WhatsApp' | 'SMS' | 'Visit'>('Call');
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);

  // New Campaign Form State
  const [campaignTitle, setCampaignTitle] = useState<string>('');
  const [campaignSubject, setCampaignSubject] = useState<ProducerCommunicationSubject>('Rate Information');
  const [campaignDate, setCampaignDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [campaignRoutes, setCampaignRoutes] = useState<string[]>(['all']);
  const [campaignNotes, setCampaignNotes] = useState<string>('');
  const [campaignTemplate, setCampaignTemplate] = useState<string>('');

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load Data
  const loadData = () => {
    const pList = ProducerCommunicationService.getProducers();
    const cList = ProducerCommunicationService.getCalls();
    const campList = ProducerCommunicationService.getCampaigns();

    setProducers(pList);
    setCalls(cList);
    setCampaigns(campList);

    if (campList.length > 0 && !selectedCampaignId) {
      setSelectedCampaignId(campList[0].id);
      setSelectedSubject(campList[0].subject);
      setSelectedDate(campList[0].date);
    }
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener('dairy_producer_communication_updated', handleUpdate);
    window.addEventListener('dairy_storage_updated', handleUpdate);

    return () => {
      window.removeEventListener('dairy_producer_communication_updated', handleUpdate);
      window.removeEventListener('dairy_storage_updated', handleUpdate);
    };
  }, []);

  // Timer Effect
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Extract unique routes & link centers for filter dropdowns
  const availableRoutes = useMemo(() => {
    const set = new Set(producers.map(p => p.route).filter(Boolean));
    return Array.from(set).sort();
  }, [producers]);

  const availableLinkCenters = useMemo(() => {
    const set = new Set(producers.map(p => p.linkCenter).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, [producers]);

  // Current Subject Object
  const currentSubjectObj = useMemo(() => {
    return PRODUCER_COMMUNICATION_SUBJECTS.find(s => s.id === selectedSubject) || PRODUCER_COMMUNICATION_SUBJECTS[0];
  }, [selectedSubject]);

  // Filter producers based on current selections
  const filteredProducerItems = useMemo(() => {
    return producers
      .filter(p => {
        // Route filter
        if (selectedRoute !== 'all' && p.route !== selectedRoute) return false;
        // Link center filter
        if (selectedLinkCenter !== 'all' && p.linkCenter !== selectedLinkCenter) return false;
        // Milk type filter
        if (selectedMilkType !== 'all' && p.milkType !== selectedMilkType) return false;
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchCode = p.farmerCode?.toLowerCase().includes(q);
          const matchName = p.farmerName?.toLowerCase().includes(q);
          const matchMobile = p.mobileNumber?.includes(q);
          const matchVillage = p.village?.toLowerCase().includes(q);
          const matchCenter = p.collectionCenter?.toLowerCase().includes(q);
          if (!matchCode && !matchName && !matchMobile && !matchVillage && !matchCenter) return false;
        }

        // Status Filter
        if (selectedStatusFilter !== 'all') {
          const call = calls.find(c => c.producerCode === p.farmerCode && c.subject === selectedSubject);
          const currentStatus = call?.status || 'Pending';
          if (selectedStatusFilter === 'Pending') {
            if (call) return false;
          } else if (selectedStatusFilter === 'Completed_All') {
            if (currentStatus !== 'Call Completed' && currentStatus !== 'Information Delivered Successfully') return false;
          } else if (selectedStatusFilter === 'FollowUp_All') {
            if (currentStatus !== 'Follow-up Required' && currentStatus !== 'Call Back Required' && !call?.followUpDate) return false;
          } else if (currentStatus !== selectedStatusFilter) {
            return false;
          }
        }

        return true;
      })
      .map(p => {
        // Find most relevant call for this producer & subject
        const call = calls.find(c => c.producerCode === p.farmerCode && c.subject === selectedSubject);
        return {
          producer: p,
          call,
        };
      });
  }, [producers, calls, selectedSubject, selectedRoute, selectedLinkCenter, selectedMilkType, searchQuery, selectedStatusFilter]);

  // Summary Metrics calculated for the active subject
  const summaryMetrics = useMemo(() => {
    const relevantCalls = calls.filter(c => c.subject === selectedSubject);
    return ProducerCommunicationService.getSummary(relevantCalls, producers.length);
  }, [calls, selectedSubject, producers]);

  // Open Log Call Modal
  const handleOpenLogCall = (producer: Farmer, existing?: ProducerCommunicationRecord) => {
    setSelectedProducerForCall(producer);
    setExistingCallRecord(existing || null);

    if (existing) {
      setCallStatus(existing.status);
      setCallDate(existing.callDate);
      setCallTime(existing.callTime);
      setCallDuration(existing.callDuration);
      setCallRemarks(existing.remarks || '');
      setFollowUpDate(existing.followUpDate || '');
      setCallChannel(existing.channel);
    } else {
      setCallStatus('Call Completed');
      setCallDate(selectedDate || new Date().toISOString().split('T')[0]);
      setCallTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setCallDuration(60);
      setCallRemarks('');
      setFollowUpDate('');
      setCallChannel('Call');
    }

    setIsTimerRunning(false);
    setTimerSeconds(0);
    setShowLogCallModal(true);
  };

  // Save Call Record
  const handleSaveCallRecord = async () => {
    if (!selectedProducerForCall) return;

    const duration = isTimerRunning ? timerSeconds : callDuration;

    await ProducerCommunicationService.saveCall({
      id: existingCallRecord?.id,
      campaignId: selectedCampaignId,
      producerCode: selectedProducerForCall.farmerCode,
      producerName: selectedProducerForCall.farmerName,
      mobileNumber: selectedProducerForCall.mobileNumber,
      alternateNumber: selectedProducerForCall.alternateNumber || '',
      village: selectedProducerForCall.village,
      route: selectedProducerForCall.route,
      linkCenter: selectedProducerForCall.linkCenter || 'Sangli Main Link Center',
      collectionCenter: selectedProducerForCall.collectionCenter,
      milkType: selectedProducerForCall.milkType,
      subject: selectedSubject,
      status: callStatus,
      callDate,
      callTime,
      callDuration: duration,
      remarks: callRemarks,
      followUpDate:
        callStatus === 'Follow-up Required' || callStatus === 'Call Back Required' || followUpDate ? followUpDate : '',
      channel: callChannel,
      officerId: currentUser.id,
      officerName: currentUser.name,
    });

    setIsTimerRunning(false);
    setShowLogCallModal(false);
    showToast(`कॉल नोंद यशस्वीरित्या सेव्ह झाली! (${selectedProducerForCall.farmerName})`, 'success');
  };

  // Open Producer History Modal
  const handleOpenHistory = (producer: Farmer) => {
    setHistoryProducer(producer);
    const hist = ProducerCommunicationService.getProducerHistory(producer.farmerCode);
    setProducerHistoryList(hist);
    setShowHistoryModal(true);
  };

  // Save New Campaign
  const handleSaveCampaign = async () => {
    if (!campaignTitle.trim()) {
      showToast('कृपया मोहिमेचे नाव प्रविष्ट करा', 'error');
      return;
    }

    const newCamp = await ProducerCommunicationService.saveCampaign({
      title: campaignTitle,
      subject: campaignSubject,
      date: campaignDate,
      targetRoutes: campaignRoutes,
      notes: campaignNotes,
      broadcastTemplate: campaignTemplate,
      createdById: currentUser.id,
      createdByName: currentUser.name,
    });

    setSelectedCampaignId(newCamp.id);
    setSelectedSubject(newCamp.subject);
    setSelectedDate(newCamp.date);
    setShowCampaignModal(false);
    showToast('नवीन संपर्क मोहीम तयार झाली!', 'success');
  };

  // Pre-fill campaign creation modal with current subject default
  const handleOpenNewCampaignModal = () => {
    const today = new Date().toISOString().split('T')[0];
    setCampaignTitle(`${currentSubjectObj.labelEn} Campaign - ${today}`);
    setCampaignSubject(selectedSubject);
    setCampaignDate(today);
    setCampaignRoutes(['all']);
    setCampaignNotes(currentSubjectObj.descriptionMr);
    setCampaignTemplate(currentSubjectObj.defaultTemplateMr);
    setShowCampaignModal(true);
  };

  // Export handlers
  const handleExportPDF = () => {
    ProducerCommunicationService.exportReportToPDF({
      subject: selectedSubject,
      date: selectedDate,
      userName: currentUser.name,
      summary: summaryMetrics,
      records: filteredProducerItems,
    });
    setShowExportMenu(false);
    showToast('PDF अहवाल डाऊनलोड झाला!', 'success');
  };

  const handleExportExcel = () => {
    ProducerCommunicationService.exportReportToExcel({
      subject: selectedSubject,
      date: selectedDate,
      userName: currentUser.name,
      summary: summaryMetrics,
      records: filteredProducerItems,
    });
    setShowExportMenu(false);
    showToast('Excel अहवाल डाऊनलोड झाला!', 'success');
  };

  const handleExportCSV = () => {
    ProducerCommunicationService.exportReportToCSV({
      subject: selectedSubject,
      date: selectedDate,
      userName: currentUser.name,
      records: filteredProducerItems,
    });
    setShowExportMenu(false);
    showToast('CSV अहवाल डाऊनलोड झाला!', 'success');
  };

  const handleExportWord = () => {
    ProducerCommunicationService.exportReportToWord({
      subject: selectedSubject,
      date: selectedDate,
      userName: currentUser.name,
      summary: summaryMetrics,
      records: filteredProducerItems,
    });
    setShowExportMenu(false);
    showToast('Word डॉक्युमेंट डाऊनलोड झाले!', 'success');
  };

  // Quick Remarks Suggestions
  const quickRemarksOptions = [
    'नवीन दूध दर मान्य केले व वाढीव पुरवठा करणार.',
    'FSSAI परवाना नूतनीकरण कागदपत्रे उद्या देणार.',
    'कागदपत्रे व बँक पासबुक पडताळणी पूर्ण झाली.',
    'फॅट व SNF सुधारणेसाठी पशुखाद्य मार्गदर्शन केले.',
    'उद्या सकाळी प्रत्यक्ष संकलन केंद्रावर भेट देणार.',
    'पेमेंट बँक खात्यात जमा झाल्याची खात्री केली.',
    'मोबाईल बंद / नॉट रिचेबल होता.',
    'नंबर व्यस्त होता, व्हॉट्सॲपवर माहिती पाठवली.',
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          id="producer-comm-toast"
          className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-sm font-medium transition-all transform animate-in fade-in slide-in-from-top-4 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-600 text-white'
              : toastMessage.type === 'error'
              ? 'bg-rose-600 text-white'
              : 'bg-slate-800 text-white'
          }`}
        >
          {toastMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Banner & Title Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shadow-xs">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  उत्पादक संपर्क व कॉल ट्रॅकिंग (Producer Communication & Call Module)
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  दूध दर, FSSAI परवाना, गुणवत्ता सूचना व अधिकृत माहिती सर्व गवळी व उत्पादकांना एकाच दिवशी देणे व ट्रॅकिंग करणे
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              id="btn-new-campaign"
              onClick={handleOpenNewCampaignModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl text-sm font-semibold shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>नवीन मोहीम (New Campaign)</span>
            </button>

            <button
              id="btn-view-template"
              onClick={() => setShowTemplateDrawer(!showTemplateDrawer)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-medium transition-colors cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>मेसेज टेम्पलेट (Template)</span>
            </button>

            {/* Export Dropdown */}
            <div className="relative">
              <button
                id="btn-export-reports-dropdown"
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-sm font-medium shadow-xs transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>अहवाल डाऊनलोड (Export)</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-75" />
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-30 py-2 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    अहवाल फॉरमॅट्स (Report Formats)
                  </div>
                  <button
                    onClick={handleExportPDF}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-left transition-colors"
                  >
                    <FileText className="w-4 h-4 text-rose-500" />
                    <div>
                      <div className="font-medium">PDF अहवाल (A4 Letterhead)</div>
                      <div className="text-xs text-slate-400">मराठी युनिकोड सपोर्टसह प्रिंट रेडी</div>
                    </div>
                  </button>
                  <button
                    onClick={handleExportExcel}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-left transition-colors"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                    <div>
                      <div className="font-medium">Excel वर्कबुक (.xlsx)</div>
                      <div className="text-xs text-slate-400">समरी कार्ड व संपूर्ण डेटाशीट</div>
                    </div>
                  </button>
                  <button
                    onClick={handleExportCSV}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-left transition-colors"
                  >
                    <FileCode className="w-4 h-4 text-blue-500" />
                    <div>
                      <div className="font-medium">CSV डेटा फाइल (.csv)</div>
                      <div className="text-xs text-slate-400">UTF-8 BOM फॉरमॅट</div>
                    </div>
                  </button>
                  <button
                    onClick={handleExportWord}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-left transition-colors"
                  >
                    <FileText className="w-4 h-4 text-indigo-500" />
                    <div>
                      <div className="font-medium">Word डॉक्युमेंट (.doc)</div>
                      <div className="text-xs text-slate-400">ऑफिशियल ऑफिस लेटरहेड</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            <button
              id="btn-refresh-data"
              onClick={() => {
                loadData();
                showToast('डेटा रीलोड झाला', 'info');
              }}
              title="डेटा रीफ्रेश करा"
              className="p-2.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Active Communication Subject & Campaign Bar */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Subject Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>संपर्क विषय (Communication Subject)</span>
            </label>
            <div className="relative">
              <select
                id="select-communication-subject"
                value={selectedSubject}
                onChange={e => {
                  const newSub = e.target.value as ProducerCommunicationSubject;
                  setSelectedSubject(newSub);
                  // Also see if there's an active campaign for this subject
                  const matchingCamp = campaigns.find(c => c.subject === newSub);
                  if (matchingCamp) {
                    setSelectedCampaignId(matchingCamp.id);
                    setSelectedDate(matchingCamp.date);
                  }
                }}
                className="w-full appearance-none bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
              >
                {PRODUCER_COMMUNICATION_SUBJECTS.map(subj => (
                  <option key={subj.id} value={subj.id}>
                    {subj.labelMr}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Campaign Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              <span>निवडलेली मोहीम (Active Campaign)</span>
            </label>
            <div className="relative">
              <select
                id="select-communication-campaign"
                value={selectedCampaignId}
                onChange={e => {
                  const camp = campaigns.find(c => c.id === e.target.value);
                  if (camp) {
                    setSelectedCampaignId(camp.id);
                    setSelectedSubject(camp.subject);
                    setSelectedDate(camp.date);
                  }
                }}
                className="w-full appearance-none bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
              >
                {campaigns.map(camp => (
                  <option key={camp.id} value={camp.id}>
                    {camp.title} ({camp.date})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Date Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-500" />
              <span>कॉल / मोहीम दिनांक (Date)</span>
            </label>
            <input
              id="input-communication-date"
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Broadcast Template Preview Banner */}
        {showTemplateDrawer && (
          <div className="mt-5 p-4 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>व्हॉट्सॲप / एसएमएस अधिकृत संदेश टेम्पलेट ({currentSubjectObj.labelEn}):</span>
              </span>
              <button
                onClick={() => setShowTemplateDrawer(false)}
                className="text-xs text-emerald-700 dark:text-emerald-400 hover:underline"
              >
                बंद करा (Close)
              </button>
            </div>
            <p className="text-slate-700 dark:text-slate-300 font-sans leading-relaxed bg-white dark:bg-slate-900 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900">
              {currentSubjectObj.defaultTemplateMr}
            </p>
            <div className="text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              <Info className="w-3.5 h-3.5" />
              <span>प्रत्येक उत्पादकाचा व्हॉट्सॲप मेसेज पाठवताना त्यांचे नाव व तारीख आपोआप समाविष्ट होते.</span>
            </div>
          </div>
        )}
      </div>

      {/* Live Summary Dashboard KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3.5">
        {/* Card 1: Total Producers */}
        <div
          onClick={() => setSelectedStatusFilter('all')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedStatusFilter === 'all'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-400'
              : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs opacity-75 mb-1 font-medium">
            <span>एकूण उत्पादक</span>
            <Users className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold">{summaryMetrics.totalProducers}</div>
          <div className="text-[11px] opacity-70 mt-1">सर्व नोंदणीकृत गवळी</div>
        </div>

        {/* Card 2: Calls Completed */}
        <div
          onClick={() => setSelectedStatusFilter('Completed_All')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedStatusFilter === 'Completed_All'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-300'
              : 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 border-slate-200 dark:border-slate-800 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs opacity-75 mb-1 font-medium">
            <span>कॉल पूर्ण</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold">{summaryMetrics.callsCompleted}</div>
          <div className="text-[11px] opacity-70 mt-1">{summaryMetrics.completionPercentage}% संपर्क पूर्ण</div>
        </div>

        {/* Card 3: Info Delivered */}
        <div
          onClick={() => setSelectedStatusFilter('Information Delivered Successfully')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedStatusFilter === 'Information Delivered Successfully'
              ? 'bg-teal-600 text-white border-teal-600 shadow-md ring-2 ring-teal-300'
              : 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 border-slate-200 dark:border-slate-800 hover:border-teal-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs opacity-75 mb-1 font-medium">
            <span>माहिती दिली</span>
            <Sparkles className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-2xl font-bold">{summaryMetrics.informationDelivered}</div>
          <div className="text-[11px] opacity-70 mt-1">माहिती यशस्वी पोहोचली</div>
        </div>

        {/* Card 4: Not Answered */}
        <div
          onClick={() => setSelectedStatusFilter('Call Not Answered')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedStatusFilter === 'Call Not Answered'
              ? 'bg-amber-600 text-white border-amber-600 shadow-md ring-2 ring-amber-300'
              : 'bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-400 border-slate-200 dark:border-slate-800 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs opacity-75 mb-1 font-medium">
            <span>उचलला नाही</span>
            <PhoneOff className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold">{summaryMetrics.notAnswered}</div>
          <div className="text-[11px] opacity-70 mt-1">Not Answered</div>
        </div>

        {/* Card 5: Busy */}
        <div
          onClick={() => setSelectedStatusFilter('Busy')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedStatusFilter === 'Busy'
              ? 'bg-orange-600 text-white border-orange-600 shadow-md ring-2 ring-orange-300'
              : 'bg-white dark:bg-slate-900 text-orange-700 dark:text-orange-400 border-slate-200 dark:border-slate-800 hover:border-orange-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs opacity-75 mb-1 font-medium">
            <span>व्यस्त (Busy)</span>
            <PhoneForwarded className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl font-bold">{summaryMetrics.busy}</div>
          <div className="text-[11px] opacity-70 mt-1">मोबाईल व्यस्त</div>
        </div>

        {/* Card 6: Switched Off */}
        <div
          onClick={() => setSelectedStatusFilter('Switched Off')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedStatusFilter === 'Switched Off'
              ? 'bg-rose-600 text-white border-rose-600 shadow-md ring-2 ring-rose-300'
              : 'bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-400 border-slate-200 dark:border-slate-800 hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs opacity-75 mb-1 font-medium">
            <span>मोबाईल बंद</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold">{summaryMetrics.switchedOff}</div>
          <div className="text-[11px] opacity-70 mt-1">Switched Off</div>
        </div>

        {/* Card 7: Follow-up Pending */}
        <div
          onClick={() => setSelectedStatusFilter('FollowUp_All')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedStatusFilter === 'FollowUp_All'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-300'
              : 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 border-slate-200 dark:border-slate-800 hover:border-indigo-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs opacity-75 mb-1 font-medium">
            <span>फॉलो-अप आवश्यक</span>
            <Calendar className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold">{summaryMetrics.followUpPending}</div>
          <div className="text-[11px] opacity-70 mt-1">पुन्हा संपर्क करणे</div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              id="input-search-producer"
              type="text"
              placeholder="उत्पादकाचे नाव, कोड, मोबाईल किंवा गाव शोधा..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-slate-400 hover:text-slate-600 absolute right-3 top-2.5"
              >
                ✕
              </button>
            )}
          </div>

          {/* Route Filter */}
          <div className="relative">
            <select
              id="filter-route"
              value={selectedRoute}
              onChange={e => setSelectedRoute(e.target.value)}
              className="w-full appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
            >
              <option value="all">सर्व रूट्स (All Routes)</option>
              {availableRoutes.map(r => (
                <option key={r} value={r}>
                  रूट: {r}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
          </div>

          {/* Milk Type Filter */}
          <div className="relative">
            <select
              id="filter-milk-type"
              value={selectedMilkType}
              onChange={e => setSelectedMilkType(e.target.value)}
              className="w-full appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
            >
              <option value="all">सर्व दूध प्रकार (All Milk)</option>
              <option value="Cow">गाय दूध (Cow)</option>
              <option value="Buffalo">म्हैस दूध (Buffalo)</option>
              <option value="Both">दोन्ही (Cow & Buffalo)</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              id="filter-status"
              value={selectedStatusFilter}
              onChange={e => setSelectedStatusFilter(e.target.value)}
              className="w-full appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
            >
              <option value="all">सर्व कॉल स्थिती (All Status)</option>
              <option value="Pending">कॉल प्रलंबित (Pending Only)</option>
              <option value="Call Completed">कॉल पूर्ण (Completed)</option>
              <option value="Information Delivered Successfully">माहिती दिली (Info Delivered)</option>
              <option value="Call Not Answered">उचलला नाही (Not Answered)</option>
              <option value="Busy">व्यस्त (Busy)</option>
              <option value="Switched Off">मोबाईल बंद (Switched Off)</option>
              <option value="Follow-up Required">फॉलो-अप आवश्यक</option>
              <option value="Call Back Required">पुन्हा कॉल आवश्यक</option>
              <option value="Wrong Number">चुकीचा नंबर</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Active filter counter */}
        <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div>
            दाखवत आहे: <strong className="text-slate-800 dark:text-slate-200">{filteredProducerItems.length}</strong> पैकी{' '}
            <strong>{producers.length}</strong> उत्पादक
          </div>
          {(selectedRoute !== 'all' ||
            selectedMilkType !== 'all' ||
            selectedStatusFilter !== 'all' ||
            searchQuery.trim() !== '') && (
            <button
              onClick={() => {
                setSelectedRoute('all');
                setSelectedMilkType('all');
                setSelectedStatusFilter('all');
                setSearchQuery('');
              }}
              className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium hover:underline cursor-pointer"
            >
              सर्व फिल्टर्स रीसेट करा (Reset Filters)
            </button>
          )}
        </div>
      </div>

      {/* Main Producer List & Call Register Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table id="table-producer-communication" className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700 text-xs">
                <th className="py-3.5 px-3 text-center w-12">#</th>
                <th className="py-3.5 px-3">उत्पादकाचे नाव व कोड (Producer)</th>
                <th className="py-3.5 px-3">मोबाईल नंबर (Mobile)</th>
                <th className="py-3.5 px-3">गाव व रूट (Village / Route)</th>
                <th className="py-3.5 px-3">लिंक व संकलन केंद्र (Centers)</th>
                <th className="py-3.5 px-3 text-center">प्रकार</th>
                <th className="py-3.5 px-3">कॉल स्थिती (Call Status)</th>
                <th className="py-3.5 px-3">नोंदी व शेरा (Remarks)</th>
                <th className="py-3.5 px-3 text-center">क्विक ॲक्शन (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredProducerItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-medium">कोणताही उत्पादक सापडला नाही</p>
                    <p className="text-xs text-slate-400 mt-0.5">कृपया सर्च अथवा फिल्टर्स बदलून पहा</p>
                  </td>
                </tr>
              ) : (
                filteredProducerItems.map((item, idx) => {
                  const p = item.producer;
                  const c = item.call;
                  const statusObj = PRODUCER_CALL_STATUSES.find(st => st.id === c?.status);

                  return (
                    <tr
                      key={p.farmerCode}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Sr No */}
                      <td className="py-3 px-3 text-center text-xs text-slate-400 font-mono">{idx + 1}</td>

                      {/* Name and Code */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                          {p.farmerName}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono mt-0.5">
                          <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">
                            {p.farmerCode}
                          </span>
                          {p.supplierType && <span className="text-[11px]">({p.supplierType})</span>}
                        </div>
                      </td>

                      {/* Mobile */}
                      <td className="py-3 px-3">
                        <a
                          href={`tel:${p.mobileNumber}`}
                          className="inline-flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 font-mono"
                        >
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{p.mobileNumber}</span>
                        </a>
                        {p.alternateNumber && (
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">Alt: {p.alternateNumber}</div>
                        )}
                      </td>

                      {/* Village and Route */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1 text-slate-800 dark:text-slate-200 font-medium">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{p.village}</span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5 font-mono">रूट: {p.route}</div>
                      </td>

                      {/* Link Center & Collection Center */}
                      <td className="py-3 px-3">
                        <div className="text-xs text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          <span>{p.linkCenter || 'Sangli Main Link Center'}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{p.collectionCenter}</div>
                      </td>

                      {/* Milk Type */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 text-[11px] font-semibold rounded-full ${
                            p.milkType === 'Cow'
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                              : p.milkType === 'Buffalo'
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                              : 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                          }`}
                        >
                          {p.milkType === 'Cow' ? 'गाय (Cow)' : p.milkType === 'Buffalo' ? 'म्हैस (Buff)' : 'दोन्ही (Both)'}
                        </span>
                      </td>

                      {/* Call Status */}
                      <td className="py-3 px-3">
                        {c ? (
                          <div className="space-y-1">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border ${
                                statusObj?.badgeBg || 'bg-slate-100'
                              } ${statusObj?.badgeText || 'text-slate-800'}`}
                            >
                              <Check className="w-3 h-3" />
                              <span>{statusObj?.labelMr || c.status}</span>
                            </span>
                            <div className="text-[11px] text-slate-400 flex items-center gap-2">
                              <span>{c.callDate}</span>
                              <span>•</span>
                              <span>{c.callTime}</span>
                              {c.callDuration > 0 && (
                                <>
                                  <span>•</span>
                                  <span>
                                    {Math.floor(c.callDuration / 60)}m {c.callDuration % 60}s
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleOpenLogCall(p)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40 rounded-lg transition-colors cursor-pointer"
                          >
                            <Phone className="w-3 h-3" />
                            <span>कॉल प्रलंबित (Log Call)</span>
                          </button>
                        )}
                      </td>

                      {/* Remarks & Follow-up */}
                      <td className="py-3 px-3 max-w-[200px]">
                        {c?.remarks ? (
                          <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2" title={c.remarks}>
                            {c.remarks}
                          </p>
                        ) : (
                          <span className="text-xs text-slate-400 italic">नोंद नाही</span>
                        )}
                        {c?.followUpDate && (
                          <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1 mt-1">
                            <Calendar className="w-3 h-3" />
                            <span>फॉलो-अप: {c.followUpDate}</span>
                          </div>
                        )}
                      </td>

                      {/* Quick Actions */}
                      <td className="py-3 px-3 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Direct Phone Call */}
                          <a
                            href={`tel:${p.mobileNumber}`}
                            onClick={() => {
                              // Suggest opening log modal on click
                              setTimeout(() => handleOpenLogCall(p, c), 600);
                            }}
                            title="थेट फोन कॉल करा"
                            className="p-1.5 text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/80 rounded-lg transition-colors"
                          >
                            <Phone className="w-4 h-4" />
                          </a>

                          {/* Direct WhatsApp Broadcast */}
                          <a
                            href={ProducerCommunicationService.generateWhatsAppUrl(p, selectedSubject)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => {
                              // If no call record yet, pre-log as Delivered/WhatsApp
                              if (!c) {
                                setTimeout(() => handleOpenLogCall(p, c), 600);
                              }
                            }}
                            title="व्हॉट्सॲपवर माहिती पाठवा"
                            className="p-1.5 text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:hover:bg-teal-900/80 rounded-lg transition-colors"
                          >
                            <Send className="w-4 h-4" />
                          </a>

                          {/* Edit / Log Call Dialog */}
                          <button
                            onClick={() => handleOpenLogCall(p, c)}
                            title={c ? 'कॉल नोंद संपादित करा' : 'कॉल नोंद करा'}
                            className="p-1.5 text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Call History */}
                          <button
                            onClick={() => handleOpenHistory(p)}
                            title="या उत्पादकाचा पूर्वीचा संपर्क इतिहास पहा"
                            className="p-1.5 text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 rounded-lg transition-colors cursor-pointer"
                          >
                            <History className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: Log or Edit Producer Call Record                                  */}
      {/* ========================================================================= */}
      {showLogCallModal && selectedProducerForCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-xl w-full p-6 space-y-5 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <PhoneCall className="w-5 h-5 text-emerald-600" />
                  <span>कॉल नोंद (Log Producer Call)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  उत्पादक: <strong className="text-slate-800 dark:text-slate-200">{selectedProducerForCall.farmerName}</strong> (
                  {selectedProducerForCall.farmerCode}) • {selectedProducerForCall.village}
                </p>
              </div>
              <button
                onClick={() => setShowLogCallModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg p-1"
              >
                ✕
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Subject (Read-only or select) */}
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">विषय (Subject)</label>
                <input
                  type="text"
                  readOnly
                  value={selectedSubject}
                  className="w-full mt-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-700 dark:text-slate-300 font-medium"
                />
              </div>

              {/* Status Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  कॉल स्थिती (Call Status) *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1.5">
                  {PRODUCER_CALL_STATUSES.map(st => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setCallStatus(st.id)}
                      className={`px-3 py-2 text-xs font-medium rounded-xl border text-left transition-all cursor-pointer ${
                        callStatus === st.id
                          ? `${st.badgeBg} ${st.badgeText} border-emerald-500 ring-2 ring-emerald-500/20 font-bold shadow-xs`
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {st.labelMr}
                    </button>
                  ))}
                </div>
              </div>

              {/* Channel Selector */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['Call', 'WhatsApp', 'SMS', 'Visit'] as const).map(ch => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => setCallChannel(ch)}
                    className={`py-2 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
                      callChannel === ch
                        ? 'bg-slate-900 text-white border-slate-900 font-bold'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {ch === 'Call' ? '📞 फोन कॉल' : ch === 'WhatsApp' ? '💬 व्हॉट्सॲप' : ch === 'SMS' ? '📱 एसएमएस' : '🏠 प्रत्यक्ष भेट'}
                  </button>
                ))}
              </div>

              {/* Date, Time & Duration Stepper / Timer */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">तारीख (Date)</label>
                  <input
                    type="date"
                    value={callDate}
                    onChange={e => setCallDate(e.target.value)}
                    className="w-full mt-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">वेळ (Time)</label>
                  <input
                    type="time"
                    value={callTime}
                    onChange={e => setCallTime(e.target.value)}
                    className="w-full mt-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center justify-between">
                    <span>कालावधी (Duration)</span>
                    <button
                      type="button"
                      onClick={() => setIsTimerRunning(!isTimerRunning)}
                      className="text-[11px] text-emerald-600 font-bold underline"
                    >
                      {isTimerRunning ? 'स्टॉप (Stop)' : 'टायमर (Timer)'}
                    </button>
                  </label>
                  <div className="relative mt-1">
                    {isTimerRunning ? (
                      <div className="w-full bg-emerald-50 text-emerald-800 font-mono font-bold px-3 py-2 rounded-xl border border-emerald-300 text-center animate-pulse text-sm">
                        ⏱️ {Math.floor(timerSeconds / 60)}m {timerSeconds % 60}s
                      </div>
                    ) : (
                      <input
                        type="number"
                        min="0"
                        step="10"
                        value={callDuration}
                        onChange={e => setCallDuration(Number(e.target.value))}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white"
                        placeholder="सेकंद (Sec)"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Remarks / Conversation Summary */}
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  कॉल नोंद व शेरा (Remarks / Notes)
                </label>
                <textarea
                  rows={3}
                  value={callRemarks}
                  onChange={e => setCallRemarks(e.target.value)}
                  placeholder="झालेली चर्चा, शेतकऱ्याचा प्रतिसाद, दूध पुरवठा संमती इत्यादी नोंदवा..."
                  className="w-full mt-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />

                {/* Quick chip suggestions */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {quickRemarksOptions.map((opt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCallRemarks(prev => (prev ? `${prev} | ${opt}` : opt))}
                      className="text-[11px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-md transition-colors cursor-pointer"
                    >
                      + {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Follow-up Date (Optional / If needed) */}
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                  <span>पुढील फॉलो-अप दिनांक (Follow-up Date - Optional)</span>
                </label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={e => setFollowUpDate(e.target.value)}
                  className="w-full mt-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowLogCallModal(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium transition-colors cursor-pointer"
              >
                रद्द करा (Cancel)
              </button>
              <button
                type="button"
                onClick={handleSaveCallRecord}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-xs transition-all cursor-pointer flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>कॉल नोंद सेव्ह करा (Save Call)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Producer Communication History                                     */}
      {/* ========================================================================= */}
      {showHistoryModal && historyProducer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-5 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-600" />
                  <span>संपर्क इतिहास (Communication History)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  उत्पादक: <strong className="text-slate-800 dark:text-slate-200">{historyProducer.farmerName}</strong> (
                  {historyProducer.farmerCode}) • {historyProducer.village} • {historyProducer.mobileNumber}
                </p>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg p-1"
              >
                ✕
              </button>
            </div>

            {producerHistoryList.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <PhoneCall className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="font-medium">कोणताही पूर्वीचा संपर्क इतिहास नाही</p>
              </div>
            ) : (
              <div className="space-y-3">
                {producerHistoryList.map(rec => {
                  const statusObj = PRODUCER_CALL_STATUSES.find(st => st.id === rec.status);
                  return (
                    <div
                      key={rec.id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white text-sm">
                            {rec.subject}
                          </span>
                          <div className="text-xs text-slate-400 mt-0.5">
                            {rec.callDate} • {rec.callTime} • अधिकारी: {rec.officerName}
                          </div>
                        </div>
                        <span
                          className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-lg border ${
                            statusObj?.badgeBg || 'bg-slate-100'
                          } ${statusObj?.badgeText || 'text-slate-800'}`}
                        >
                          {statusObj?.labelMr || rec.status}
                        </span>
                      </div>
                      {rec.remarks && (
                        <p className="text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                          {rec.remarks}
                        </p>
                      )}
                      {rec.followUpDate && (
                        <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                          फॉलो-अप तारीख: {rec.followUpDate}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium"
              >
                बंद करा (Close)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Create New Communication Campaign                                  */}
      {/* ========================================================================= */}
      {showCampaignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-xl w-full p-6 space-y-5 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-emerald-600" />
                  <span>नवीन संपर्क मोहीम तयार करा (New Campaign)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  एकाच दिवशी सर्व उत्पादकांना अधिकृत माहिती देणे व संपर्क ट्रॅक करणे
                </p>
              </div>
              <button
                onClick={() => setShowCampaignModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Campaign Title */}
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  मोहिमेचे शीर्षक (Campaign Title) *
                </label>
                <input
                  type="text"
                  value={campaignTitle}
                  onChange={e => setCampaignTitle(e.target.value)}
                  placeholder="उदा. नवीन दूध दर सुधारणा मोहीम - ऑगस्ट २०२६"
                  className="w-full mt-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Subject & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">विषय (Subject)</label>
                  <select
                    value={campaignSubject}
                    onChange={e => {
                      const newSub = e.target.value as ProducerCommunicationSubject;
                      setCampaignSubject(newSub);
                      const subObj = PRODUCER_COMMUNICATION_SUBJECTS.find(s => s.id === newSub);
                      if (subObj) {
                        setCampaignTemplate(subObj.defaultTemplateMr);
                        setCampaignNotes(subObj.descriptionMr);
                      }
                    }}
                    className="w-full mt-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white"
                  >
                    {PRODUCER_COMMUNICATION_SUBJECTS.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.labelMr}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">मोहीम दिनांक (Date)</label>
                  <input
                    type="date"
                    value={campaignDate}
                    onChange={e => setCampaignDate(e.target.value)}
                    className="w-full mt-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* WhatsApp Broadcast Template */}
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  व्हॉट्सॲप / एसएमएस मेसेज टेम्पलेट (Broadcast Message Template)
                </label>
                <textarea
                  rows={4}
                  value={campaignTemplate}
                  onChange={e => setCampaignTemplate(e.target.value)}
                  placeholder="मेसेज मसुदा..."
                  className="w-full mt-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-sans"
                />
                <div className="text-[11px] text-slate-400 mt-1">
                  उपलब्ध टॅग्स: <code>&#123;नाव&#125;</code>, <code>&#123;तारीख&#125;</code>, <code>&#123;डेअरी नाव&#125;</code>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  अधिकारी सूचना / उद्दिष्टे (Notes)
                </label>
                <input
                  type="text"
                  value={campaignNotes}
                  onChange={e => setCampaignNotes(e.target.value)}
                  placeholder="उदा. आज संध्याकाळपर्यंत सर्व गवळी उत्पादकांशी संपर्क पूर्ण करणे."
                  className="w-full mt-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowCampaignModal(false)}
                className="px-4 py-2.5 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-xl text-sm font-medium"
              >
                रद्द करा (Cancel)
              </button>
              <button
                type="button"
                onClick={handleSaveCampaign}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-xs"
              >
                मोहीम सुरू करा (Start Campaign)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
