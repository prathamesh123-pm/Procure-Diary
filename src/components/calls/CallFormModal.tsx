import React, { useState, useEffect } from 'react';
import {
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  Sparkles,
  Mic,
  Calendar,
  Clock,
  User,
  Users,
  CheckCircle2,
  X,
  Volume2,
  AlertCircle,
  MessageSquare,
  FileText,
  Search,
} from 'lucide-react';
import { CallRecord, CallPurpose, CallStatus, Priority, Farmer } from '../../types';
import { StorageService } from '../../services/storageService';
import { GeminiService } from '../../services/geminiService';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { AudioRecorderModal } from '../common/AudioRecorderModal';

interface CallFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: 'outgoing' | 'incoming';
  selectedFarmer?: Farmer | null;
  onCallSaved: (call: CallRecord) => void;
}

export const CallFormModal: React.FC<CallFormModalProps> = ({
  isOpen,
  onClose,
  initialType = 'outgoing',
  selectedFarmer = null,
  onCallSaved,
}) => {
  const { language, t } = useLanguage();
  const { currentUser } = useAuth();

  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);

  // Form states
  const [callType, setCallType] = useState<'outgoing' | 'incoming'>(initialType);
  const [farmerCode, setFarmerCode] = useState('');
  const [farmerName, setFarmerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [alternateNumber, setAlternateNumber] = useState('');
  const [village, setVillage] = useState('');
  const [route, setRoute] = useState('RT-101');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(() => new Date().toTimeString().slice(0, 5));
  const [callDuration, setCallDuration] = useState(45);
  const [callPurpose, setCallPurpose] = useState<CallPurpose>('Milk Collection');
  const [callStatus, setCallStatus] = useState<CallStatus>('Completed');
  const [discussion, setDiscussion] = useState('');
  const [informationGiven, setInformationGiven] = useState('');
  const [hasPendingWork, setHasPendingWork] = useState(false);
  const [pendingWork, setPendingWork] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpNotes, setFollowUpNotes] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');

  // AI & Voice State
  const [isAISummarizing, setIsAISummarizing] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const [audioBase64, setAudioBase64] = useState('');

  // Farmer Search Dropdown state
  const [farmerSearch, setFarmerSearch] = useState('');
  const [showFarmerDropdown, setShowFarmerDropdown] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fList = StorageService.getFarmers();
      const rList = StorageService.getRoutes();
      setFarmers(fList);
      setRoutes(rList);
      setCallType(initialType);

      if (selectedFarmer) {
        populateFarmer(selectedFarmer);
      } else {
        resetForm();
      }
    }
  }, [isOpen, selectedFarmer, initialType]);

  const populateFarmer = (f: Farmer) => {
    setFarmerCode(f.farmerCode);
    setFarmerName(f.farmerName);
    setMobileNumber(f.mobileNumber);
    setAlternateNumber(f.alternateNumber || '');
    setVillage(f.village);
    setRoute(f.route);
    setFarmerSearch(`${f.farmerCode} - ${f.farmerName}`);
    setShowFarmerDropdown(false);
  };

  const resetForm = () => {
    setFarmerCode('');
    setFarmerName('');
    setMobileNumber('');
    setAlternateNumber('');
    setVillage('');
    setRoute(routes[0]?.routeNumber || 'RT-101');
    setDate(new Date().toISOString().split('T')[0]);
    setTime(new Date().toTimeString().slice(0, 5));
    setCallDuration(60);
    setCallPurpose('Milk Collection');
    setCallStatus('Completed');
    setDiscussion('');
    setInformationGiven('');
    setHasPendingWork(false);
    setPendingWork('');
    setFollowUpDate('');
    setFollowUpNotes('');
    setPriority('Medium');
    setAiSummary('');
    setAudioUrl('');
    setAudioBase64('');
    setFarmerSearch('');
  };

  const handleFarmerSearchChange = (val: string) => {
    setFarmerSearch(val);
    setShowFarmerDropdown(true);

    // Auto match exact code or mobile
    const match = farmers.find(
      f =>
        f.farmerCode.toLowerCase() === val.trim().toLowerCase() ||
        f.mobileNumber === val.trim()
    );
    if (match) {
      populateFarmer(match);
    }
  };

  const filteredFarmers = farmers.filter(
    f =>
      f.farmerName.toLowerCase().includes(farmerSearch.toLowerCase()) ||
      f.farmerCode.toLowerCase().includes(farmerSearch.toLowerCase()) ||
      f.mobileNumber.includes(farmerSearch) ||
      f.route.toLowerCase().includes(farmerSearch.toLowerCase()) ||
      f.village.toLowerCase().includes(farmerSearch.toLowerCase())
  );

  const handleAISummarize = async () => {
    if (!discussion.trim()) {
      alert(language === 'mr' ? 'कृपया आधी चर्चेचा तपशील प्रविष्ट करा.' : 'Please enter discussion details first.');
      return;
    }

    setIsAISummarizing(true);
    try {
      const res = await GeminiService.summarizeCall(
        farmerName || 'Farmer',
        callPurpose,
        callStatus,
        discussion,
        language
      );
      setAiSummary(res.summary);
      if (res.priority) setPriority(res.priority);
      if (res.suggestedFollowUpDays && !followUpDate) {
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + res.suggestedFollowUpDays);
        setFollowUpDate(nextDate.toISOString().split('T')[0]);
      }
    } catch (err) {
      console.error('AI error:', err);
    } finally {
      setIsAISummarizing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!farmerName.trim() || !mobileNumber.trim()) {
      alert(language === 'mr' ? 'कृपया शेतकऱ्याचे नाव आणि मोबाईल नंबर भरा.' : 'Please provide farmer name and mobile.');
      return;
    }

    const newCall: CallRecord = {
      id: `CALL-${Date.now()}`,
      farmerCode: farmerCode.trim() || `F-${Date.now().toString().slice(-4)}`,
      farmerName: farmerName.trim(),
      mobileNumber: mobileNumber.trim(),
      alternateNumber: alternateNumber.trim(),
      village: village.trim() || 'Sangli',
      route,
      date,
      time,
      callDuration: Number(callDuration) || 30,
      callPurpose,
      callStatus,
      discussion: discussion.trim() || (language === 'mr' ? 'सकारात्मक चर्चा झाली.' : 'Positive discussion.'),
      informationGiven: informationGiven.trim(),
      hasPendingWork: !!hasPendingWork || !!pendingWork.trim(),
      pendingWork: pendingWork.trim(),
      followUpDate: followUpDate || undefined,
      followUpNotes: followUpNotes.trim(),
      priority,
      officerId: currentUser?.id || 'OFF-101',
      officerName: currentUser?.name || 'Field Officer',
      type: callType,
      audioUrl: audioUrl || undefined,
      audioBase64: audioBase64 || undefined,
      aiSummary: aiSummary || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    StorageService.saveCall(newCall);
    onCallSaved(newCall);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-white ${
                callType === 'incoming' ? 'bg-blue-600' : 'bg-emerald-600'
              }`}
            >
              {callType === 'incoming' ? <PhoneIncoming className="w-5 h-5" /> : <PhoneOutgoing className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {callType === 'incoming'
                  ? (language === 'mr' ? 'इनकमिंग शेतकरी कॉल नोंदवा' : 'Log Incoming Farmer Call')
                  : (language === 'mr' ? 'नवीन आउटगोइंग कॉल नोंदवा' : 'Record Outgoing Call')}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'mr' ? 'कॉल संभाषण, दर माहिती व फॉलो-अप नोंद' : 'Record farmer conversation details & action points'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Call Type Toggle & Voice Assistant Trigger */}
        <div className="flex items-center justify-between gap-2 bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCallType('outgoing')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                callType === 'outgoing'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              📞 {language === 'mr' ? 'आउटगोइंग कॉल' : 'Outgoing'}
            </button>
            <button
              type="button"
              onClick={() => setCallType('incoming')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                callType === 'incoming'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              📥 {language === 'mr' ? 'इनकमिंग कॉल' : 'Incoming'}
            </button>
          </div>

          {/* Voice Note Recording button */}
          <button
            type="button"
            onClick={() => setIsAudioModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/60 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            <Mic className="w-3.5 h-3.5 text-red-600 animate-pulse" />
            <span>{audioUrl ? (language === 'mr' ? 'व्हॉईस जोडली ✓' : 'Voice Attached ✓') : (language === 'mr' ? 'व्हॉईस रेकॉर्ड' : 'Record Voice')}</span>
          </button>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Farmer Auto-Search Section */}
          <div className="relative">
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              {language === 'mr' ? 'शेतकरी शोधा / कोड / नाव / मोबाईल' : 'Search Farmer / Code / Name / Mobile'} *
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={farmerSearch}
                onChange={e => handleFarmerSearchChange(e.target.value)}
                onFocus={() => setShowFarmerDropdown(true)}
                placeholder={language === 'mr' ? 'नाव किंवा कोड टाईप करा (उदा. F-101, बाळू पाटील, 9822...)' : 'Type farmer code or name...'}
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500/20"
                required
              />
            </div>

            {/* Dropdown Suggestions */}
            {showFarmerDropdown && farmerSearch && filteredFarmers.length > 0 && (
              <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {filteredFarmers.map(f => (
                  <div
                    key={f.id}
                    onClick={() => populateFarmer(f)}
                    className="p-2.5 hover:bg-emerald-50 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{f.farmerName}</span>
                      <span className="ml-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        ({f.farmerCode})
                      </span>
                      <p className="text-[10px] text-slate-400">
                        {f.village} • {f.route} • {f.milkType} ({f.dailyMilkQuantity}L)
                      </p>
                    </div>
                    <span className="font-mono text-[11px] text-slate-600 dark:text-slate-300">
                      {f.mobileNumber}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Farmer Details (3 columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">{t('farmer.code')}</label>
              <input
                type="text"
                value={farmerCode}
                onChange={e => setFarmerCode(e.target.value)}
                placeholder="F-101"
                className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">{t('farmer.mobile')} *</label>
              <input
                type="tel"
                value={mobileNumber}
                onChange={e => setMobileNumber(e.target.value)}
                placeholder="9822XXXXXX"
                className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">{t('farmer.route')}</label>
              <select
                value={route}
                onChange={e => setRoute(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                {routes.map(r => (
                  <option key={r.id} value={r.routeNumber}>
                    {r.routeNumber} - {r.routeName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Purpose & Status Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">{t('call.purpose')} *</label>
              <select
                value={callPurpose}
                onChange={e => setCallPurpose(e.target.value as CallPurpose)}
                className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
              >
                <option value="Milk Collection">{language === 'mr' ? 'दूध संकलन' : 'Milk Collection'}</option>
                <option value="Rate Information">{language === 'mr' ? 'दर माहिती व फॅट' : 'Rate Info'}</option>
                <option value="Payment">{language === 'mr' ? 'बिल व पेमेंट' : 'Payment'}</option>
                <option value="Advance">{language === 'mr' ? 'ऍडव्हान्स मागणी' : 'Advance'}</option>
                <option value="RT">{language === 'mr' ? 'RT / बँक ट्रान्सफर' : 'RT'}</option>
                <option value="Complaint">{language === 'mr' ? 'तक्रार निवारण' : 'Complaint'}</option>
                <option value="Milk Quality">{language === 'mr' ? 'दूध गुणवत्ता / टेस्ट' : 'Milk Quality'}</option>
                <option value="Visit">{language === 'mr' ? 'गोठा प्रत्यक्ष भेट' : 'Field Visit'}</option>
                <option value="New Producer">{language === 'mr' ? 'नवीन दूध उत्पादक' : 'New Producer'}</option>
                <option value="Collection Increase">{language === 'mr' ? 'संकलन वाढ चर्चा' : 'Collection Increase'}</option>
                <option value="Animal Information">{language === 'mr' ? 'जनावरांची माहिती' : 'Animal Information'}</option>
                <option value="Other">{language === 'mr' ? 'इतर' : 'Other'}</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">{t('call.status')} *</label>
              <select
                value={callStatus}
                onChange={e => setCallStatus(e.target.value as CallStatus)}
                className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
              >
                <option value="Completed">{language === 'mr' ? 'कॉल झाला (Completed)' : 'Completed'}</option>
                <option value="Not Received">{language === 'mr' ? 'कॉल उचलला नाही (Not Received)' : 'Not Received'}</option>
                <option value="Switched Off">{language === 'mr' ? 'फोन बंद (Switched Off)' : 'Switched Off'}</option>
                <option value="Busy">{language === 'mr' ? 'कॉल व्यस्त (Busy)' : 'Busy'}</option>
                <option value="Out of Coverage">{language === 'mr' ? 'कव्हरेज क्षेत्राबाहेर (Out of Coverage)' : 'Out of Coverage'}</option>
                <option value="Call Back Later">{language === 'mr' ? 'नंतर कॉल करा (Call Back)' : 'Call Back Later'}</option>
                <option value="Follow-up Required">{language === 'mr' ? 'फॉलो-अप आवश्यक (Follow-up)' : 'Follow-up Required'}</option>
                <option value="Invalid Number">{language === 'mr' ? 'अवैध नंबर (Invalid Number)' : 'Invalid Number'}</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">{language === 'mr' ? 'कालावधी (सेकंद)' : 'Duration (Sec)'}</label>
              <input
                type="number"
                value={callDuration}
                onChange={e => setCallDuration(Number(e.target.value))}
                min={0}
                className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Discussion & Information Provided */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">{t('call.discussion')} *</label>
                <button
                  type="button"
                  onClick={handleAISummarize}
                  disabled={isAISummarizing}
                  className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span>{isAISummarizing ? 'AI विश्लेषण...' : 'AI Call Summary'}</span>
                </button>
              </div>
              <textarea
                value={discussion}
                onChange={e => setDiscussion(e.target.value)}
                placeholder={language === 'mr' ? 'शेतकऱ्याशी काय चर्चा झाली? उदा. फॅट वाढीबाबत मार्गदर्शन केले, म्हशीचे दूध दर स्पष्ट केले...' : 'Enter call conversation details...'}
                rows={3}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
                required
              />
            </div>

            {/* AI Summary Highlight Box */}
            {aiSummary && (
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold text-[11px] text-emerald-900 dark:text-emerald-300">
                    {language === 'mr' ? 'AI निर्मित कॉल सारांश:' : 'AI Call Executive Summary:'}
                  </span>
                  <p className="text-xs text-emerald-800 dark:text-emerald-200">{aiSummary}</p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">{t('call.info_given')}</label>
              <input
                type="text"
                value={informationGiven}
                onChange={e => setInformationGiven(e.target.value)}
                placeholder={language === 'mr' ? 'उदा. दर तक्ता पाठवला, पशुवैद्यकीय भेटीची वेळ दिली...' : 'e.g. Rate chart shared, veterinarian visit scheduled...'}
                className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Pending Task & Follow-up Section */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasPendingWork}
                  onChange={e => setHasPendingWork(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {language === 'mr' ? 'या कॉलनंतर काही काम प्रलंबित आहे का? (Pending Task)' : 'Create Pending Field Task / Complaint'}
                </span>
              </label>
            </div>

            {hasPendingWork && (
              <div className="animate-in fade-in space-y-2">
                <input
                  type="text"
                  value={pendingWork}
                  onChange={e => setPendingWork(e.target.value)}
                  placeholder={language === 'mr' ? 'प्रलंबित कामाचा तपशील (उदा. २ गोणी सुग्रास पशुखाद्य पाठवणे)' : 'Pending task description...'}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            )}

            {/* Follow-up Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">{t('call.followup_date')}</label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={e => setFollowUpDate(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">{language === 'mr' ? 'प्राधान्य (Priority)' : 'Priority'}</label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as Priority)}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High (महत्वाचे)</option>
                  <option value="Urgent">Urgent (तातडीचे)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold rounded-xl cursor-pointer"
            >
              {t('btn.cancel')}
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/30 flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{t('btn.save')}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Audio Recorder Nested Modal */}
      <AudioRecorderModal
        isOpen={isAudioModalOpen}
        onClose={() => setIsAudioModalOpen(false)}
        onSaveAudio={data => {
          setAudioUrl(data.url);
          setAudioBase64(data.base64);
          if (data.textSummary && !discussion) {
            setDiscussion(data.textSummary);
          }
        }}
        onApplyParsedFields={parsed => {
          if (parsed.discussion) setDiscussion(parsed.discussion);
          if (parsed.infoGiven) setInformationGiven(parsed.infoGiven);
          if (parsed.pendingWork) {
            setHasPendingWork(true);
            setPendingWork(parsed.pendingWork);
          }
          if (parsed.purpose) setCallPurpose(parsed.purpose as CallPurpose);
          if (parsed.status) setCallStatus(parsed.status as CallStatus);
        }}
      />
    </div>
  );
};
