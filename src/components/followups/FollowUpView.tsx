import React, { useState, useEffect, useMemo } from 'react';
import {
  CalendarCheck,
  PhoneCall,
  MessageCircle,
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Plus,
  Search,
  Filter,
  ArrowRight,
  RotateCcw,
  X,
} from 'lucide-react';
import { FollowUpItem, Priority, FollowUpStatus, Farmer } from '../../types';
import { StorageService } from '../../services/storageService';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';
import { Trash2 } from 'lucide-react';

export const FollowUpView: React.FC = () => {
  const { language, t } = useLanguage();
  const { showDeleteSuccess, showError } = useToast();
  const [followUps, setFollowUps] = useState<FollowUpItem[]>([]);
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [activeTab, setActiveTab] = useState<'today' | 'tomorrow' | 'overdue' | 'all' | 'completed'>('today');
  const [searchQuery, setSearchQuery] = useState('');

  // Reschedule state
  const [reschedulingItem, setReschedulingItem] = useState<FollowUpItem | null>(null);
  const [newScheduleDate, setNewScheduleDate] = useState('');

  // Delete State
  const [itemToDelete, setItemToDelete] = useState<FollowUpItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // New Follow-up Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [farmerCode, setFarmerCode] = useState('');
  const [farmerName, setFarmerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [route, setRoute] = useState('RT-101');
  const [scheduledDate, setScheduledDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [priority, setPriority] = useState<Priority>('High');

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const loadData = () => {
    setFollowUps(StorageService.getFollowUps());
    setFarmers(StorageService.getFarmers());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('dairy_storage_updated', loadData);
    return () => window.removeEventListener('dairy_storage_updated', loadData);
  }, []);

  const counts = useMemo(() => {
    const todayCount = followUps.filter(f => f.status === 'pending' && f.scheduledDate === todayStr).length;
    const tomorrowCount = followUps.filter(f => f.status === 'pending' && f.scheduledDate === tomorrowStr).length;
    const overdueCount = followUps.filter(f => f.status === 'pending' && f.scheduledDate < todayStr).length;
    const completedCount = followUps.filter(f => f.status === 'completed').length;
    const allPendingCount = followUps.filter(f => f.status === 'pending').length;
    return { todayCount, tomorrowCount, overdueCount, completedCount, allPendingCount };
  }, [followUps, todayStr, tomorrowStr]);

  const filteredItems = useMemo(() => {
    return followUps.filter(f => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          f.farmerName.toLowerCase().includes(q) ||
          f.mobileNumber.includes(q) ||
          f.route.toLowerCase().includes(q) ||
          f.reason.toLowerCase().includes(q);
        if (!match) return false;
      }

      if (activeTab === 'today') {
        return f.status === 'pending' && f.scheduledDate === todayStr;
      }
      if (activeTab === 'tomorrow') {
        return f.status === 'pending' && f.scheduledDate === tomorrowStr;
      }
      if (activeTab === 'overdue') {
        return f.status === 'pending' && f.scheduledDate < todayStr;
      }
      if (activeTab === 'completed') {
        return f.status === 'completed';
      }
      if (activeTab === 'all') {
        return f.status === 'pending';
      }
      return true;
    });
  }, [followUps, activeTab, todayStr, tomorrowStr, searchQuery]);

  const handleComplete = (id: string) => {
    StorageService.completeFollowUp(id);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      StorageService.deleteFollowUp(itemToDelete.id);
      showDeleteSuccess(`${itemToDelete.farmerName} (${itemToDelete.reason})`);
      setItemToDelete(null);
    } catch (err: any) {
      showError(err?.message || 'Failed to delete follow-up item');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenReschedule = (item: FollowUpItem) => {
    setReschedulingItem(item);
    const d = new Date();
    d.setDate(d.getDate() + 2);
    setNewScheduleDate(d.toISOString().split('T')[0]);
  };

  const handleSaveReschedule = () => {
    if (reschedulingItem && newScheduleDate) {
      StorageService.rescheduleFollowUp(reschedulingItem.id, newScheduleDate);
      setReschedulingItem(null);
    }
  };

  const handleFarmerSelect = (code: string) => {
    setFarmerCode(code);
    const f = farmers.find(item => item.farmerCode === code);
    if (f) {
      setFarmerName(f.farmerName);
      setMobileNumber(f.mobileNumber);
      setRoute(f.route);
    }
  };

  const handleSaveNewFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmerName.trim() || !mobileNumber.trim()) return;

    const item: FollowUpItem = {
      id: `FOLLOW-${Date.now()}`,
      callId: `CALL-${Date.now()}`,
      farmerCode: farmerCode || undefined,
      farmerName: farmerName.trim(),
      mobileNumber: mobileNumber.trim(),
      route,
      village: 'Registered Area',
      scheduledDate,
      reason: reason.trim() || (language === 'mr' ? 'नियमित दुग्ध संकलन व दर विचारणा' : 'Routine rate & collection inquiry'),
      priority,
      officerId: 'USR-OFFICER-1',
      officerName: 'सचिन पाटील',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    StorageService.saveFollowUp(item);
    setIsAddModalOpen(false);
    setFarmerName('');
    setMobileNumber('');
    setReason('');
  };

  return (
    <div className="space-y-4 pb-20 md:pb-6 animate-in fade-in">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {t('followup.title')}
            </h2>
            <p className="text-xs text-slate-500">
              {counts.allPendingCount} {language === 'mr' ? 'एकूण फॉलो-अप वेळापत्रक' : 'active follow-up appointments'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{t('followup.add_new')}</span>
        </button>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('today')}
          className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === 'today'
              ? 'bg-amber-600 text-white shadow-xs font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <span>{t('followup.today')}</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'today' ? 'bg-amber-800 text-white' : 'bg-amber-100 text-amber-800 dark:bg-amber-950'}`}>
            {counts.todayCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('tomorrow')}
          className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === 'tomorrow'
              ? 'bg-amber-600 text-white shadow-xs font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <span>{t('followup.tomorrow')}</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800">
            {counts.tomorrowCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('overdue')}
          className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === 'overdue'
              ? 'bg-red-600 text-white shadow-xs font-bold'
              : 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40'
          }`}
        >
          <span>{t('followup.overdue')}</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-100 text-red-800 dark:bg-red-950">
            {counts.overdueCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === 'all'
              ? 'bg-emerald-600 text-white shadow-xs font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <span>{t('followup.upcoming')}</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800">
            {counts.allPendingCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === 'completed'
              ? 'bg-green-700 text-white shadow-xs font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <span>{language === 'mr' ? 'पूर्ण झालेले' : 'Completed'}</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800">
            {counts.completedCount}
          </span>
        </button>
      </div>

      {/* Follow-up Cards List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            {t('common.no_records')}
          </div>
        ) : (
          filteredItems.map(item => {
            const isOverdue = item.status === 'pending' && item.scheduledDate < todayStr;
            const isCompleted = item.status === 'completed';

            return (
              <div
                key={item.id}
                className={`p-4 bg-white dark:bg-slate-900 rounded-2xl border shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isCompleted
                    ? 'border-slate-200/60 opacity-70'
                    : isOverdue
                    ? 'border-red-300 dark:border-red-800 bg-red-50/20'
                    : 'border-slate-200/80 dark:border-slate-800'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {item.farmerName}
                    </span>
                    {item.farmerCode && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600">
                        {item.farmerCode}
                      </span>
                    )}
                    <span className="text-xs text-slate-400">
                      • {item.route}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isOverdue
                          ? 'bg-red-600 text-white'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      📅 {item.scheduledDate} {isOverdue ? '(Overdue)' : ''}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300">
                    <strong className="text-slate-800 dark:text-slate-200">{language === 'mr' ? 'कारण / विषय:' : 'Topic:'} </strong>
                    {item.reason}
                  </p>

                  <div className="text-xs font-mono text-slate-500 pt-0.5">
                    📞 {item.mobileNumber}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <a
                    href={`tel:${item.mobileNumber}`}
                    className="p-2 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 hover:bg-emerald-100 rounded-xl"
                    title="Call"
                  >
                    <PhoneCall className="w-4 h-4" />
                  </a>

                  <a
                    href={`https://wa.me/91${item.mobileNumber}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-green-50 dark:bg-green-950 text-green-600 hover:bg-green-100 rounded-xl"
                    title="WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>

                  {!isCompleted && (
                    <>
                      <button
                        onClick={() => handleOpenReschedule(item)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-1 cursor-pointer"
                        title={language === 'mr' ? 'तारीख बदला' : 'Reschedule'}
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>{language === 'mr' ? 'तारीख बदला' : 'Reschedule'}</span>
                      </button>

                      <button
                        onClick={() => handleComplete(item.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{language === 'mr' ? 'पूर्ण झाले' : 'Done'}</span>
                      </button>
                    </>
                  )}

                  {/* Delete Button */}
                  <button
                    onClick={() => setItemToDelete(item)}
                    aria-label="Delete Follow-up"
                    className="p-2 rounded-xl bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/80 transition-all cursor-pointer shadow-2xs min-h-[36px] min-w-[36px] flex items-center justify-center active:scale-95"
                    title={language === 'mr' ? 'फॉलो-अप हटवा' : 'Delete Follow-up'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reschedule Modal */}
      {reschedulingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {language === 'mr' ? 'फॉलो-अप तारीख पुढे ढकला' : 'Reschedule Follow-up'}
              </h3>
              <button onClick={() => setReschedulingItem(null)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600 dark:text-slate-400">
                {reschedulingItem.farmerName} ({reschedulingItem.mobileNumber})
              </p>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">{language === 'mr' ? 'नवीन फॉलो-अप दिनांक:' : 'New Schedule Date:'}</label>
                <input
                  type="date"
                  value={newScheduleDate}
                  onChange={e => setNewScheduleDate(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              {/* Quick Date jump chips */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() + 1);
                    setNewScheduleDate(d.toISOString().split('T')[0]);
                  }}
                  className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-[11px] font-semibold"
                >
                  +1 Day
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() + 3);
                    setNewScheduleDate(d.toISOString().split('T')[0]);
                  }}
                  className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-[11px] font-semibold"
                >
                  +3 Days
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() + 7);
                    setNewScheduleDate(d.toISOString().split('T')[0]);
                  }}
                  className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-[11px] font-semibold"
                >
                  +1 Week
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setReschedulingItem(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                {t('btn.cancel')}
              </button>
              <button
                onClick={handleSaveReschedule}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg cursor-pointer"
              >
                {language === 'mr' ? 'अपडेट करा' : 'Update Date'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Follow-up Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {t('followup.add_new')}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewFollowUp} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">{t('farmer.code')}</label>
                <select
                  value={farmerCode}
                  onChange={e => handleFarmerSelect(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="">-- {language === 'mr' ? 'शेतकरी निवडा' : 'Select Farmer'} --</option>
                  {farmers.map(f => (
                    <option key={f.id} value={f.farmerCode}>
                      {f.farmerCode} - {f.farmerName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">{t('farmer.name')} *</label>
                  <input
                    type="text"
                    value={farmerName}
                    onChange={e => setFarmerName(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">{t('farmer.mobile')} *</label>
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={e => setMobileNumber(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">{language === 'mr' ? 'फॉलो-अप तारीख' : 'Schedule Date'}</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={e => setScheduledDate(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">{language === 'mr' ? 'प्राधान्य' : 'Priority'}</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as Priority)}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">{language === 'mr' ? 'फॉलो-अपचे कारण' : 'Reason / Topic'}</label>
                <textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder={language === 'mr' ? 'उदा. फॅट वाढीबाबत पुन्हा संपर्क करणे...' : 'Reason for follow-up call...'}
                  rows={2}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  {t('btn.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer"
                >
                  {t('btn.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Standardized Delete Confirmation Dialog */}
      {itemToDelete && (
        <DeleteConfirmModal
          isOpen={Boolean(itemToDelete)}
          onClose={() => setItemToDelete(null)}
          onConfirm={handleConfirmDelete}
          isDeleting={isDeleting}
          itemType={language === 'mr' ? 'फॉलो-अप नोंद' : 'Follow-up Task'}
          itemName={itemToDelete.farmerName}
          itemCode={itemToDelete.scheduledDate}
          warningMessage={itemToDelete.reason}
          title={language === 'mr' ? 'हा फॉलो-अप रेकॉर्ड नक्की डिलीट करायचा आहे का?' : 'Delete this follow-up item?'}
        />
      )}
    </div>
  );
};
