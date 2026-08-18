import React, { useState, useEffect } from 'react';
import {
  PhoneIncoming,
  Search,
  Plus,
  PhoneCall,
  MessageCircle,
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  HelpCircle,
  Trash2,
} from 'lucide-react';
import { CallRecord, Farmer } from '../../types';
import { StorageService } from '../../services/storageService';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';
import { CallFormModal } from './CallFormModal';

interface IncomingCallViewProps {
  onSelectFarmer?: (farmer: Farmer) => void;
}

export const IncomingCallView: React.FC<IncomingCallViewProps> = ({ onSelectFarmer }) => {
  const { language, t } = useLanguage();
  const { showDeleteSuccess, showError } = useToast();
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Delete State
  const [callToDelete, setCallToDelete] = useState<CallRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = () => {
    const all = StorageService.getCalls().filter(c => c.type === 'incoming');
    setCalls(all);
    setFarmers(StorageService.getFarmers());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('dairy_storage_updated', loadData);
    return () => window.removeEventListener('dairy_storage_updated', loadData);
  }, []);

  const handleConfirmDelete = async () => {
    if (!callToDelete) return;
    setIsDeleting(true);
    try {
      StorageService.deleteCall(callToDelete.id);
      showDeleteSuccess(`${callToDelete.farmerName} (${callToDelete.callPurpose})`);
      setCallToDelete(null);
    } catch (err: any) {
      showError(err?.message || 'Failed to delete incoming call');
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = calls.filter(c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.farmerName.toLowerCase().includes(q) ||
      c.farmerCode.toLowerCase().includes(q) ||
      c.mobileNumber.includes(q) ||
      c.callPurpose.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4 pb-20 md:pb-6 animate-in fade-in">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white rounded-2xl p-4 sm:p-5 shadow-lg shadow-blue-900/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <PhoneIncoming className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-base sm:text-lg font-bold">
              {language === 'mr' ? 'इनकमिंग शेतकरी कॉल हेल्पडेस्क' : 'Inbound Farmer Call Desk'}
            </h2>
          </div>
          <p className="text-xs text-blue-100">
            {language === 'mr'
              ? 'शेतकऱ्यांनी केलेले सर्व चौकशी, बिल तक्रार व सल्ला कॉल येथे नोंदवले जातात'
              : 'Log and resolve all inbound farmer inquiries, milk rate queries and complaints'}
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-white hover:bg-blue-50 text-blue-800 font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{language === 'mr' ? 'इनकमिंग कॉल नोंदवा' : 'Log Inbound Call'}</span>
        </button>
      </div>

      {/* Quick Search */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={language === 'mr' ? 'इनकमिंग कॉल शोधा (शेतकरी नाव, फोन, विषय...)' : 'Search incoming call logs...'}
            className="w-full text-xs pl-8.5 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Incoming Call Cards List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            {language === 'mr' ? 'कोणतेही इनकमिंग कॉल सापडले नाहीत.' : 'No inbound call records found.'}
          </div>
        ) : (
          filtered.map(call => (
            <div key={call.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                  <PhoneIncoming className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{call.farmerName}</span>
                    <span className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded text-slate-600 dark:text-slate-300 font-mono">
                      {call.farmerCode}
                    </span>
                    <span className="text-xs text-slate-400">
                      {call.date} {call.time}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300">
                    <strong className="text-blue-700 dark:text-blue-400">[{call.callPurpose}]: </strong>
                    {call.discussion}
                  </p>

                  <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-0.5">
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      {call.callStatus}
                    </span>
                    <span>• Route: {call.route}</span>
                    <span>• Officer: {call.officerName}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <a
                  href={`tel:${call.mobileNumber}`}
                  className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 hover:bg-emerald-100 transition-colors"
                  title={language === 'mr' ? 'कॉल करा' : 'Call'}
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                </a>
                <a
                  href={`https://wa.me/91${call.mobileNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-green-50 dark:bg-green-950 text-green-600 hover:bg-green-100 transition-colors"
                  title="WhatsApp"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                </a>

                {/* Delete Button */}
                <button
                  onClick={() => setCallToDelete(call)}
                  aria-label="Delete Incoming Call"
                  className="p-2 rounded-xl bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/80 transition-all cursor-pointer shadow-2xs min-h-[36px] min-w-[36px] flex items-center justify-center active:scale-95"
                  title={language === 'mr' ? 'इनकमिंग कॉल नोंद हटवा' : 'Delete Incoming Call'}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <CallFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialType="incoming"
        onCallSaved={() => loadData()}
      />

      {/* Standardized Delete Confirmation Dialog */}
      {callToDelete && (
        <DeleteConfirmModal
          isOpen={Boolean(callToDelete)}
          onClose={() => setCallToDelete(null)}
          onConfirm={handleConfirmDelete}
          isDeleting={isDeleting}
          itemType={language === 'mr' ? 'इनकमिंग कॉल नोंद' : 'Inbound Call Record'}
          itemName={`${callToDelete.farmerName} - ${callToDelete.callPurpose}`}
          itemCode={callToDelete.date}
          title={language === 'mr' ? 'हा इनकमिंग कॉल रेकॉर्ड नक्की हटवायचा आहे का?' : 'Delete this inbound call record?'}
        />
      )}
    </div>
  );
};
