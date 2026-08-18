import React, { useState, useEffect } from 'react';
import {
  Farmer,
  CallRecord,
  PendingTask,
  FollowUpItem,
} from '../../types';
import { StorageService } from '../../services/storageService';
import { useLanguage } from '../../context/LanguageContext';
import {
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  Clock,
  Calendar,
  MessageCircle,
  QrCode,
  Edit2,
  X,
  Play,
  Pause,
  AlertCircle,
  Milk,
  MapPin,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Tag,
  CreditCard,
  Building,
  TrendingUp,
  FileText,
  Activity,
  Layers,
  Award,
} from 'lucide-react';
import { FarmerQRModal } from './FarmerQRModal';

interface FarmerHistoryModalProps {
  farmer: Farmer | null;
  isOpen: boolean;
  onClose: () => void;
  onNewCallForFarmer: (farmer: Farmer) => void;
  onEditFarmer: (farmer: Farmer) => void;
}

export const FarmerHistoryModal: React.FC<FarmerHistoryModalProps> = ({
  farmer,
  isOpen,
  onClose,
  onNewCallForFarmer,
  onEditFarmer,
}) => {
  const { language, t } = useLanguage();
  const isMr = language === 'mr';

  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [tasks, setTasks] = useState<PendingTask[]>([]);
  const [followUps, setFollowUps] = useState<FollowUpItem[]>([]);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'calls' | 'tasks' | 'followups'>('overview');
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (farmer && isOpen) {
      const allCalls = StorageService.getCalls().filter(
        c => c.farmerCode === farmer.farmerCode || c.mobileNumber === farmer.mobileNumber
      );
      const allTasks = StorageService.getTasks().filter(
        t => t.farmerCode === farmer.farmerCode || t.farmerName === farmer.farmerName
      );
      const allFollowUps = StorageService.getFollowUps().filter(
        f => f.farmerCode === farmer.farmerCode || f.mobileNumber === farmer.mobileNumber
      );

      setCalls(allCalls);
      setTasks(allTasks);
      setFollowUps(allFollowUps);
    }
  }, [farmer, isOpen]);

  if (!isOpen || !farmer) return null;

  const handleToggleAudio = (call: CallRecord) => {
    if (playingAudioId === call.id) {
      audioPlayer?.pause();
      setPlayingAudioId(null);
      return;
    }

    audioPlayer?.pause();

    if (call.audioUrl || call.audioBase64) {
      const player = new Audio(call.audioUrl || call.audioBase64);
      player.onended = () => setPlayingAudioId(null);
      player.play();
      setAudioPlayer(player);
      setPlayingAudioId(call.id);
    }
  };

  const tenDayEstimate = (farmer.dailyMilkQuantity * (farmer.currentRate || 39.5) * 10).toFixed(0);
  const monthlyEstimate = (farmer.dailyMilkQuantity * (farmer.currentRate || 39.5) * 30).toFixed(0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 my-auto max-h-[92vh] overflow-y-auto">
        {/* Header with Farmer Profile Info */}
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white">
                {farmer.farmerName}
              </h3>
              <span className="px-2 py-0.5 text-xs font-mono font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-md">
                {farmer.farmerCode}
              </span>
              <span
                className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full ${
                  farmer.status === 'Active'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : farmer.status === 'Irregular'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                }`}
              >
                {farmer.status}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
              <span className="flex items-center gap-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {farmer.village} • {farmer.route}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-medium">
                <Milk className="w-3.5 h-3.5 text-emerald-600" />
                {farmer.milkType === 'Cow' ? (isMr ? 'गाय दूध' : 'Cow Milk') : farmer.milkType === 'Buffalo' ? (isMr ? 'म्हैस दूध' : 'Buffalo Milk') : (isMr ? 'दोन्ही' : 'Both')} ({farmer.dailyMilkQuantity} L/day)
              </span>
              <span>•</span>
              <span className="font-medium text-slate-600 dark:text-slate-400">
                🏢 {farmer.collectionCenter}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsQRModalOpen(true)}
              className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300 cursor-pointer transition-colors"
              title="Show QR Pass"
            >
              <QrCode className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEditFarmer(farmer)}
              className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300 cursor-pointer transition-colors"
              title="Edit Profile"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Communication Bar */}
        <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/50 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
              📞 {farmer.mobileNumber}
            </span>
            {farmer.alternateNumber && (
              <span className="text-[11px] text-slate-400 font-mono">
                / {farmer.alternateNumber}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${farmer.mobileNumber}`}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-xs"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>{isMr ? 'कॉल करा' : 'Call'}</span>
            </a>

            <a
              href={`https://wa.me/91${farmer.mobileNumber}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-xs"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>

            <button
              onClick={() => onNewCallForFarmer(farmer)}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 font-bold text-xs rounded-xl hover:bg-emerald-50 cursor-pointer"
            >
              + {isMr ? 'नोंद जोडा' : 'Log Visit/Note'}
            </button>
          </div>
        </div>

        {/* Tabs: Overview, Calls, Tasks, Followups */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-semibold overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            📋 {isMr ? 'गवळी तपशील व परवाने' : 'Dossier & FSSAI'}
          </button>
          <button
            onClick={() => setActiveTab('calls')}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'calls'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            📞 {isMr ? 'कॉल व भेट इतिहास' : 'Calls & Visits'} ({calls.length})
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'tasks'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            ✅ {isMr ? 'प्रलंबित कामे' : 'Tasks'} ({tasks.length})
          </button>
          <button
            onClick={() => setActiveTab('followups')}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'followups'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            📅 {isMr ? 'फॉलो-अप' : 'Follow-ups'} ({followUps.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="max-h-80 overflow-y-auto space-y-3 pr-1 text-xs">
          {/* TAB 1: OVERVIEW & FSSAI / MILK DOSSIER (User Requested: दुधाची, एफएसएस परवानांची इतर सगळी माहिती) */}
          {activeTab === 'overview' && (
            <div className="space-y-3.5">
              {/* Milk Production & Quality Card */}
              <div className="p-3.5 bg-gradient-to-br from-emerald-50/70 via-white to-emerald-50/30 dark:from-slate-800/80 dark:via-slate-800 dark:to-slate-800/60 rounded-2xl border border-emerald-100 dark:border-slate-700 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Milk className="w-4 h-4 text-emerald-600" />
                    <span>{isMr ? 'दूध संकलन व गुणवत्ता तपशील' : 'Milk Collection & Quality Parameters'}</span>
                  </h4>
                  <span className="text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded">
                    {farmer.milkType} Milk
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block">{isMr ? 'दैनिक संकलन' : 'Daily Volume'}</span>
                    <span className="font-black text-slate-900 dark:text-white text-sm">{farmer.dailyMilkQuantity} L</span>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block">{isMr ? 'सकाळ / संध्याकाळ' : 'Morn / Eve'}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {farmer.morningMilkQty || Math.round(farmer.dailyMilkQuantity * 0.55)}L / {farmer.eveningMilkQty || Math.round(farmer.dailyMilkQuantity * 0.45)}L
                    </span>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block">{isMr ? 'सरासरी FAT & SNF' : 'Avg FAT / SNF'}</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {farmer.avgFat || 3.8}% F | {farmer.avgSNF || 8.5}% S
                    </span>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block">{isMr ? 'खरेदी दर' : 'Procure Rate'}</span>
                    <span className="font-black text-emerald-700 dark:text-emerald-300">₹{farmer.currentRate || 39.5}/L</span>
                  </div>
                </div>

                {/* Estimated Payouts */}
                <div className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-700 text-xs">
                  <span className="text-slate-500 font-medium">{isMr ? 'अंदाजे १० दिवसांचे बिल:' : '10-Day Est. Payout:'} <strong className="text-amber-600 dark:text-amber-400 font-bold">₹{Number(tenDayEstimate).toLocaleString('en-IN')}</strong></span>
                  <span className="text-slate-500 font-medium">{isMr ? 'मासिक अंदाज:' : 'Monthly Est:'} <strong className="text-emerald-600 dark:text-emerald-400 font-bold">₹{Number(monthlyEstimate).toLocaleString('en-IN')}</strong></span>
                </div>
              </div>

              {/* FSSAI & Regulatory Licensing Section (User Requested: एफएसएस परवानांची इतर सगळी माहिती) */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>{isMr ? 'FSSAI परवाना व शासकीय पशु नोंदणी' : 'FSSAI License & Government Registry'}</span>
                  </h4>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      farmer.fssaiStatus === 'Active'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        : farmer.fssaiStatus === 'Expiring Soon'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {farmer.fssaiStatus || 'Active'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                    <span className="text-[10px] text-slate-400 block">{isMr ? 'FSSAI नोंदणी क्रमांक' : 'FSSAI Reg Number'}</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {farmer.fssaiNumber || (isMr ? 'नोंदणी उपलब्ध नाही' : 'Not Registered')}
                    </span>
                    {farmer.fssaiExpiryDate && (
                      <span className="text-[10px] text-slate-500 block">
                        {isMr ? 'वैधता:' : 'Valid Upto:'} {farmer.fssaiExpiryDate}
                      </span>
                    )}
                  </div>

                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                    <span className="text-[10px] text-slate-400 block">{isMr ? 'पशुधन व लसीकरण' : 'Livestock & Vaccination'}</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {farmer.cattleCount || 4} {isMr ? 'जनावरे' : 'Cattle'} • {farmer.vaccinationStatus || 'Fully Vaccinated'}
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">
                      {farmer.cleanMilkCert ? `✨ ${isMr ? 'स्वच्छ दूध उत्पादन प्रमाणित (CMP)' : 'Clean Milk Certified'}` : `⚠️ ${isMr ? 'स्वच्छ दूध प्रमाणपत्र प्रलंबित' : 'CMP Pending'}`}
                    </span>
                  </div>
                </div>

                {/* INAPH Ear Tags */}
                {farmer.inaphTagNumbers && farmer.inaphTagNumbers.length > 0 && (
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold text-purple-600 flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {isMr ? 'INAPH पशु कानपट्ट्या:' : 'INAPH Tags:'}
                    </span>
                    {farmer.inaphTagNumbers.map((tag, idx) => (
                      <span key={idx} className="font-mono font-bold bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded text-[10px]">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Bank & Financial Advance Card */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-purple-600" />
                    <span>{isMr ? 'बँक खाते व उचल / अ‍ॅडव्हान्स शिल्लक' : 'Bank Account & Advance Balance'}</span>
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block">{isMr ? 'बँक' : 'Bank'}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{farmer.bankName || 'Sangli DCC Bank'}</span>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block">{isMr ? 'खाते / IFSC' : 'A/C & IFSC'}</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {farmer.bankAccountNumber || '••••4589'} ({farmer.ifscCode || 'MAHB0000123'})
                    </span>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block">{isMr ? 'उचल शिल्लक' : 'Advance Loan'}</span>
                    <span className="font-black text-amber-600 dark:text-amber-400">
                      ₹{(farmer.advanceBalance || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CALLS */}
          {activeTab === 'calls' && (
            calls.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                {isMr ? 'या गवळ्यासाठी कोणताही कॉल इतिहास नोंदवलेला नाही.' : 'No calls recorded yet for this producer.'}
              </div>
            ) : (
              calls.map(call => (
                <div
                  key={call.id}
                  className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {call.date} {call.time}
                      </span>
                      <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        {call.callPurpose}
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {call.callStatus}
                    </span>
                  </div>

                  <p className="text-slate-700 dark:text-slate-300">
                    {call.discussion}
                  </p>

                  {call.aiSummary && (
                    <div className="flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-xl">
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      <span>{call.aiSummary}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>Officer: {call.officerName}</span>
                    {(call.audioUrl || call.audioBase64) && (
                      <button
                        onClick={() => handleToggleAudio(call)}
                        className="text-red-600 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        {playingAudioId === call.id ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        <span>{playingAudioId === call.id ? 'Pause Voice' : 'Play Voice'}</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )
          )}

          {/* TAB 3: TASKS */}
          {activeTab === 'tasks' && (
            tasks.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                {isMr ? 'कोणतीही प्रलंबित कामे नाहीत.' : 'No active tasks.'}
              </div>
            ) : (
              tasks.map(t => (
                <div key={t.id} className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">{t.workName}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                      {t.status}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">{t.description}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>Due: {t.dueDate}</span>
                    <span>Assigned: {t.assignedToName}</span>
                  </div>
                </div>
              ))
            )
          )}

          {/* TAB 4: FOLLOWUPS */}
          {activeTab === 'followups' && (
            followUps.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                {isMr ? 'कोणतेही फॉलो-अप वेळापत्रक नाही.' : 'No follow-up items scheduled.'}
              </div>
            ) : (
              followUps.map(f => (
                <div key={f.id} className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-700 dark:text-amber-400">📅 {f.scheduledDate}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      {f.status}
                    </span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300">{f.reason}</p>
                </div>
              ))
            )
          )}
        </div>
      </div>

      <FarmerQRModal
        farmer={farmer}
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
      />
    </div>
  );
};
