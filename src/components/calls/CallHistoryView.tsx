import React, { useState, useEffect } from 'react';
import {
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  MapPin,
  MessageSquare,
  CheckCircle2,
  Trash2,
  FileSpreadsheet,
  FileText,
  User,
  Share2,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { CallHistoryEntry } from '../../types';
import { CallTrackerService } from '../../services/callTrackerService';
import { ActivityService } from '../../services/activityService';
import { StorageService } from '../../services/storageService';

export const CallHistoryView: React.FC = () => {
  const { language } = useLanguage();
  const [calls, setCalls] = useState<CallHistoryEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isLogModalOpen, setIsLogModalOpen] = useState<boolean>(false);

  // New call form state
  const [newCall, setNewCall] = useState({
    contactName: '',
    mobileNumber: '',
    farmerCode: '',
    callType: 'outgoing' as 'incoming' | 'outgoing' | 'missed',
    durationMinutes: 3,
    route: 'RT-101',
    village: 'Madhavnagar',
    purpose: 'दूध संकलन व फॅट वाढवणे चर्चा',
    notes: '',
  });

  const loadData = () => {
    setCalls(CallTrackerService.getCallHistory());
  };

  useEffect(() => {
    loadData();
    const handleCallTracked = () => loadData();
    window.addEventListener('dairy_call_tracked', handleCallTracked);
    return () => window.removeEventListener('dairy_call_tracked', handleCallTracked);
  }, []);

  const handleSaveCall = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCall.contactName || !newCall.mobileNumber) return;

    CallTrackerService.recordCall({
      contactName: newCall.contactName,
      mobileNumber: newCall.mobileNumber,
      farmerCode: newCall.farmerCode,
      callType: newCall.callType,
      duration: newCall.durationMinutes * 60,
      route: newCall.route,
      village: newCall.village,
      purpose: newCall.purpose,
      notes: newCall.notes,
    });

    setIsLogModalOpen(false);
    setNewCall({
      contactName: '',
      mobileNumber: '',
      farmerCode: '',
      callType: 'outgoing',
      durationMinutes: 3,
      route: 'RT-101',
      village: 'Madhavnagar',
      purpose: 'दूध संकलन व फॅट वाढवणे चर्चा',
      notes: '',
    });
    loadData();
  };

  const filteredCalls = calls.filter(c => {
    if (selectedType !== 'all' && c.callType !== selectedType) return false;
    if (selectedDate && c.date !== selectedDate) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        c.contactName.toLowerCase().includes(q) ||
        c.mobileNumber.includes(q) ||
        (c.route || '').toLowerCase().includes(q) ||
        (c.village || '').toLowerCase().includes(q) ||
        (c.purpose || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getCallTypeBadge = (type: 'incoming' | 'outgoing' | 'missed') => {
    switch (type) {
      case 'incoming':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
            <PhoneIncoming className="w-3 h-3" />
            <span>इनकमिंग</span>
          </span>
        );
      case 'missed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300">
            <PhoneMissed className="w-3 h-3" />
            <span>मिस्ड</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
            <PhoneOutgoing className="w-3 h-3" />
            <span>आउटगोइंग</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                  {language === 'mr' ? 'कॉल इतिहास व संपर्क ट्रॅकर (Call History)' : 'Call History & Communications'}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {language === 'mr'
                    ? 'सर्व गवळी व केंद्र प्रमुखांशी झालेल्या कॉल्सची अचूक वेळ, कालावधी व विषयांसह थेट नोंद'
                    : 'Track live incoming, outgoing, and missed calls directly integrated with Daily Work Reports'}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsLogModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs shadow-purple-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'mr' ? 'नवीन कॉल नोंदवा' : 'Log New Call'}</span>
          </button>
        </div>

        {/* Filters */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="गवळी नाव, मोबाईल, रूट किंवा उद्देश शोधा..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden"
            />
          </div>

          <div>
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden"
            >
              <option value="all">सर्व कॉल्स (All Calls)</option>
              <option value="outgoing">आउटगोइंग (Outgoing)</option>
              <option value="incoming">इनकमिंग (Incoming)</option>
              <option value="missed">मिस्ड कॉल्स (Missed)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden"
            />
            {selectedDate && (
              <button onClick={() => setSelectedDate('')} className="text-slate-400 hover:text-slate-600 text-xs">
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Call Log List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-purple-600" />
          <span>कॉल लॉग नोंदी (Live Call Records)</span>
        </h2>

        {filteredCalls.length === 0 ? (
          <div className="p-8 text-center text-slate-400 space-y-2">
            <PhoneCall className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
            <p className="text-xs">कोणतीही कॉल नोंद उपलब्ध नाही.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCalls.map(call => (
              <div
                key={call.id}
                className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getCallTypeBadge(call.callType)}
                    <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">{call.contactName}</h3>
                    <span className="text-[11px] font-mono text-slate-500">({call.mobileNumber})</span>
                    {call.route && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                        {call.route}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">विषय: </span>
                    {call.purpose}
                  </p>

                  {call.notes && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">"{call.notes}"</p>
                  )}

                  <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-1 font-mono">
                    <span>दिनांक: {call.date}</span>
                    <span>•</span>
                    <span>वेळ: {call.time}</span>
                    <span>•</span>
                    <span>कालावधी: {Math.round(call.duration / 60)} मि.</span>
                    {call.gpsLocation && (
                      <span className="text-emerald-600 flex items-center gap-0.5">
                        <MapPin className="w-2.5 h-2.5" />
                        <span>{call.gpsLocation.address || 'GPS Tagged'}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`tel:${call.mobileNumber}`}
                    className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold transition-colors flex items-center gap-1"
                    title="Direct Call"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>कॉल करा</span>
                  </a>

                  <a
                    href={`https://wa.me/91${call.mobileNumber.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-green-50 hover:bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-300 transition-colors"
                    title="WhatsApp Chat"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => {
                      CallTrackerService.deleteCall(call.id);
                      loadData();
                    }}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                    title="Delete call log"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Log Call Modal */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-purple-600" />
                <span>नवीन कॉल नोंद करा (Log Call)</span>
              </h3>
              <button onClick={() => setIsLogModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCall} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">गवळी / शेतकरी नाव *</label>
                <input
                  type="text"
                  required
                  placeholder="उदा. तानाजी पाटील"
                  value={newCall.contactName}
                  onChange={e => setNewCall({ ...newCall, contactName: e.target.value })}
                  className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">मोबाईल नंबर *</label>
                  <input
                    type="tel"
                    required
                    placeholder="9822000000"
                    value={newCall.mobileNumber}
                    onChange={e => setNewCall({ ...newCall, mobileNumber: e.target.value })}
                    className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">कॉल प्रकार</label>
                  <select
                    value={newCall.callType}
                    onChange={e => setNewCall({ ...newCall, callType: e.target.value as any })}
                    className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden"
                  >
                    <option value="outgoing">आउटगोइंग (Outgoing)</option>
                    <option value="incoming">इनकमिंग (Incoming)</option>
                    <option value="missed">मिस्ड कॉल (Missed)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">कालावधी (मिनिटे)</label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={newCall.durationMinutes}
                    onChange={e => setNewCall({ ...newCall, durationMinutes: parseInt(e.target.value, 10) || 0 })}
                    className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">रूट (Route)</label>
                  <input
                    type="text"
                    value={newCall.route}
                    onChange={e => setNewCall({ ...newCall, route: e.target.value })}
                    className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">कॉलचा मुख्य उद्देश</label>
                <input
                  type="text"
                  placeholder="उदा. फॅट वाढवणे / दूध संकलन चर्चा"
                  value={newCall.purpose}
                  onChange={e => setNewCall({ ...newCall, purpose: e.target.value })}
                  className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">चर्चेचे मुख्य मुद्दे व शेरा</label>
                <textarea
                  rows={2}
                  placeholder="शेतकऱ्यांशी झालेल्या चर्चेचा सारांश लिहा..."
                  value={newCall.notes}
                  onChange={e => setNewCall({ ...newCall, notes: e.target.value })}
                  className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-xs cursor-pointer"
                >
                  कॉल सेव्ह करा
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
