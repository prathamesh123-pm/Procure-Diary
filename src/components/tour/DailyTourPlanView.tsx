import React, { useState, useEffect } from 'react';
import {
  Route,
  Plus,
  Search,
  Filter,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Users,
  Target,
  Edit2,
  Trash2,
  Share2,
  Check,
  X,
  FileSpreadsheet,
  AlertCircle,
  Navigation,
} from 'lucide-react';
import { TourPlanItem } from '../../types';
import { MPOStorageService } from '../../services/mpoStorageService';
import { TourPlanModal } from './TourPlanModal';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';

export const DailyTourPlanView: React.FC = () => {
  const { currentUser, isManager, isOfficer } = useAuth();
  const { language } = useLanguage();
  const isMr = language === 'mr';
  const { showToast } = useToast();

  const [tourPlans, setTourPlans] = useState<TourPlanItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoute, setSelectedRoute] = useState('all');
  const [selectedApproval, setSelectedApproval] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<TourPlanItem | null>(null);

  const loadData = () => {
    setTourPlans(MPOStorageService.getTourPlans());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('dairy_mpo_updated', loadData);
    return () => window.removeEventListener('dairy_mpo_updated', loadData);
  }, []);

  const handleOpenAdd = () => {
    setEditingPlan(null);
    setIsModalOpen(true);
  };

  const handleEdit = (plan: TourPlanItem) => {
    setEditingPlan(plan);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(isMr ? 'हे दौरा नियोजन हटवायचे आहे का?' : 'Delete this tour plan?')) {
      MPOStorageService.deleteTourPlan(id);
      showToast(isMr ? 'दौरा नियोजन हटवले' : 'Tour plan deleted', 'success');
      loadData();
    }
  };

  const handleApprove = (id: string, status: 'Approved' | 'Rejected') => {
    MPOStorageService.updateTourApproval(id, status, currentUser?.name || 'व्यवस्थापक');
    showToast(isMr ? `दौरा ${status === 'Approved' ? 'मंजूर' : 'नामंजूर'} केला` : `Tour ${status}`, 'success');
    loadData();
  };

  const handleToggleVisit = (planId: string, producerIndex: number) => {
    const plan = tourPlans.find(p => p.id === planId);
    if (!plan) return;

    const updatedProducers = [...plan.producersToVisit];
    const current = updatedProducers[producerIndex];
    const newStatus = current.status === 'Completed' ? 'Scheduled' : 'Completed';

    updatedProducers[producerIndex] = {
      ...current,
      status: newStatus,
      visitedAt: newStatus === 'Completed' ? new Date().toLocaleTimeString('en-IN') : undefined,
    };

    const completedCount = updatedProducers.filter(p => p.status === 'Completed').length;
    const completionPct = Math.round((completedCount / updatedProducers.length) * 100);

    const updatedPlan: TourPlanItem = {
      ...plan,
      producersToVisit: updatedProducers,
      actualVisitedCount: completedCount,
      completionPercentage: completionPct,
      updatedAt: new Date().toISOString(),
    };

    MPOStorageService.saveTourPlan(updatedPlan);
    showToast(
      isMr
        ? `उत्पादक भेट '${current.producerName}' ${newStatus === 'Completed' ? 'पूर्ण नोंदवली' : 'नियोजित केली'}`
        : `Visit status updated for ${current.producerName}`,
      'success'
    );
    loadData();
  };

  const handleShareTourWhatsApp = (plan: TourPlanItem) => {
    const text = `📋 *दैनिक दौरा कार्यक्रम (Daily Tour Plan - DTP)*\n` +
      `📅 *दिनांक:* ${plan.planDate}\n` +
      `👨‍💼 *अधिकारी:* ${plan.officerName}\n` +
      `🛣️ *रूट क्रमांक:* ${plan.routeNumber}\n` +
      `🎯 *संकलन लक्ष्य:* ${plan.plannedCollectionLitersTarget} लिटर\n` +
      `📍 *गावे:* ${plan.targetVillages.join(', ')}\n` +
      `🏢 *केंद्रे:* ${plan.targetCenters.join(', ')}\n\n` +
      `👥 *नियोजित उत्पादक भेटी (${plan.producersToVisit.length}):*\n` +
      plan.producersToVisit
        .map((p, i) => `${i + 1}. ${p.producerName} (${p.village}) - ${p.purpose} [${p.status === 'Completed' ? '✅ पूर्ण' : '⏳ बाकी'}]`)
        .join('\n') +
      `\n\n📌 *उद्दिष्ट:* ${plan.specialObjectives}\n` +
      `_डेअरी MPO फील्ड मॉनिटरिंग सिस्टीम._`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const filteredPlans = tourPlans.filter(p => {
    const matchSearch =
      p.officerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.routeNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.targetVillages.some(v => v.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchRoute = selectedRoute === 'all' || p.routeNumber === selectedRoute;
    const matchApproval = selectedApproval === 'all' || p.approvalStatus === selectedApproval;
    return matchSearch && matchRoute && matchApproval;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 rounded-xl">
            <Route className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">
              {isMr ? 'दैनिक दौरा नियोजन व फील्ड भेटी (Daily Tour Program - DTP)' : 'Daily Tour Planning & Field Visits'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {isMr ? 'MPO अधिकाऱ्यांचे रूटनिहाय दौरा नियोजन, उत्पादक प्रत्यक्ष भेट ट्रॅकिंग, मंजुरी व संकलन उद्दिष्टे' : 'Field tour planning, scheduled producer visits, completion check-ins & manager approvals'}
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{isMr ? '+ नवीन दौरा नियोजन (DTP)' : '+ New Tour Plan'}</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder={isMr ? 'शोध (अधिकारी, रूट, गाव)...' : 'Search officer, route, village...'}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedRoute}
              onChange={e => setSelectedRoute(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm"
            >
              <option value="all">{isMr ? 'सर्व रूट्स (All Routes)' : 'All Routes'}</option>
              <option value="RT-101">RT-101</option>
              <option value="RT-102">RT-102</option>
              <option value="RT-104">RT-104</option>
            </select>

            <select
              value={selectedApproval}
              onChange={e => setSelectedApproval(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm"
            >
              <option value="all">{isMr ? 'सर्व मंजुरी स्थिती' : 'All Approvals'}</option>
              <option value="Pending">Pending Approval</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Tour Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPlans.map(plan => (
            <div
              key={plan.id}
              className="p-4 bg-slate-50/70 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-400 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 text-xs font-mono font-bold rounded-md">
                        {plan.routeNumber}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono rounded-md flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {plan.planDate}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base mt-1">
                      {plan.officerName}
                    </h3>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      plan.approvalStatus === 'Approved'
                        ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300'
                        : plan.approvalStatus === 'Rejected'
                        ? 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300'
                        : 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300'
                    }`}
                  >
                    {plan.approvalStatus}
                  </span>
                </div>

                {/* Target details */}
                <div className="grid grid-cols-2 gap-2 my-2 py-2 border-y border-slate-200 dark:border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">{isMr ? 'लक्ष्य गावे' : 'Target Villages'}</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{plan.targetVillages.join(', ')}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">{isMr ? 'संकलन लक्ष्य' : 'Target Liters'}</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{plan.plannedCollectionLitersTarget} L</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="my-2 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">
                      {isMr ? 'भेटी प्रगती (Visits Completed)' : 'Visit Progress'}: {plan.actualVisitedCount} / {plan.producersToVisit.length}
                    </span>
                    <span className="font-mono font-bold text-indigo-600">{plan.completionPercentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 transition-all rounded-full"
                      style={{ width: `${plan.completionPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Producers checklist */}
                <div className="space-y-1.5 my-2.5 max-h-36 overflow-y-auto">
                  {plan.producersToVisit.map((pv, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleToggleVisit(plan.id, idx)}
                      className={`p-2 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-all ${
                        pv.status === 'Completed'
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={pv.status === 'Completed'}
                          readOnly
                          className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                        />
                        <div>
                          <span className={`font-bold ${pv.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                            {pv.producerName} ({pv.producerCode})
                          </span>
                          <span className="text-[10px] text-slate-500 block">{pv.village} • {pv.purpose}</span>
                        </div>
                      </div>
                      {pv.visitedAt && (
                        <span className="text-[10px] font-mono text-emerald-600 font-bold">{pv.visitedAt}</span>
                      )}
                    </div>
                  ))}
                </div>

                {plan.specialObjectives && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 italic bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-700">
                    🎯 {plan.specialObjectives}
                  </p>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                {/* Manager approval controls */}
                <div className="flex items-center gap-1.5">
                  {plan.approvalStatus === 'Pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(plan.id, 'Approved')}
                        className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3 h-3" />
                        <span>{isMr ? 'मंजूर करा' : 'Approve'}</span>
                      </button>
                      <button
                        onClick={() => handleApprove(plan.id, 'Rejected')}
                        className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                        <span>{isMr ? 'नामंजूर' : 'Reject'}</span>
                      </button>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleShareTourWhatsApp(plan)}
                    className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg cursor-pointer"
                    title="Share WhatsApp Schedule"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(plan)}
                    className="p-1.5 text-slate-600 hover:text-indigo-700 dark:text-slate-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(plan.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      <TourPlanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        planToEdit={editingPlan}
        onSaved={loadData}
      />
    </div>
  );
};
