import React, { useState } from 'react';
import { X, Calendar, Route, Target, Users, Plus, Trash2, Save } from 'lucide-react';
import { TourPlanItem } from '../../types';
import { MPOStorageService } from '../../services/mpoStorageService';
import { StorageService } from '../../services/storageService';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';

interface TourPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  planToEdit?: TourPlanItem | null;
  onSaved: () => void;
}

export const TourPlanModal: React.FC<TourPlanModalProps> = ({
  isOpen,
  onClose,
  planToEdit,
  onSaved,
}) => {
  const { currentUser } = useAuth();
  const { language } = useLanguage();
  const isMr = language === 'mr';
  const { showToast } = useToast();

  const availableRoutes = StorageService.getRoutes();
  const farmers = StorageService.getFarmers();

  const [planDate, setPlanDate] = useState(planToEdit?.planDate || new Date().toISOString().split('T')[0]);
  const [routeNumber, setRouteNumber] = useState(planToEdit?.routeNumber || 'RT-101');
  const [targetVillages, setTargetVillages] = useState(planToEdit?.targetVillages?.join(', ') || 'कवठेपिरान, भिलवडी');
  const [targetCenters, setTargetCenters] = useState(planToEdit?.targetCenters?.join(', ') || 'कवठेपिरान दूध संकलन केंद्र');
  const [targetLiters, setTargetLiters] = useState(planToEdit?.plannedCollectionLitersTarget || 2500);
  const [specialObjectives, setSpecialObjectives] = useState(
    planToEdit?.specialObjectives || 'दूध वाढीसाठी ५ मोठ्या उत्पादकांशी प्रत्यक्ष संवाद व गोठा पाहणी'
  );

  // Producer visits
  const [producersList, setProducersList] = useState(
    planToEdit?.producersToVisit || [
      {
        producerCode: 'G-101',
        producerName: 'आनंदराव पाटील',
        village: 'कवठेपिरान',
        purpose: 'गोठा पाहणी व दूध वाढ चर्चा',
        status: 'Scheduled' as const,
      },
    ]
  );

  const [newProducerCode, setNewProducerCode] = useState('');
  const [newPurpose, setNewPurpose] = useState('');

  if (!isOpen) return null;

  const handleAddProducer = () => {
    if (!newProducerCode) {
      showToast(isMr ? 'उत्पादक निवडा' : 'Select producer', 'warning');
      return;
    }
    const farmer = farmers.find(f => f.farmerCode === newProducerCode);
    if (farmer) {
      setProducersList(prev => [
        ...prev,
        {
          producerCode: farmer.farmerCode,
          producerName: farmer.farmerName,
          village: farmer.village,
          purpose: newPurpose || 'नियमित फील्ड भेट',
          status: 'Scheduled',
        },
      ]);
      setNewProducerCode('');
      setNewPurpose('');
    }
  };

  const handleRemoveProducer = (idx: number) => {
    setProducersList(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tourObj: TourPlanItem = {
      id: planToEdit?.id || `DTP-${Date.now()}`,
      planDate,
      officerId: currentUser?.id || 'USR-ADMIN-1',
      officerName: currentUser?.name || 'प्रमोद सावंत (MPO)',
      routeNumber,
      targetVillages: targetVillages.split(',').map(s => s.trim()).filter(Boolean),
      targetCenters: targetCenters.split(',').map(s => s.trim()).filter(Boolean),
      producersToVisit: producersList,
      plannedCollectionLitersTarget: Number(targetLiters) || 0,
      specialObjectives,
      approvalStatus: planToEdit?.approvalStatus || 'Pending',
      actualVisitedCount: producersList.filter(p => p.status === 'Completed').length,
      completionPercentage:
        producersList.length > 0
          ? Math.round((producersList.filter(p => p.status === 'Completed').length / producersList.length) * 100)
          : 0,
      createdAt: planToEdit?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    MPOStorageService.saveTourPlan(tourObj);
    showToast(isMr ? 'दैनिक दौरा नियोजन (DTP) जतन झाले' : 'Tour plan saved', 'success');
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-indigo-700 to-blue-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <Route className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">
                {planToEdit ? (isMr ? 'दौरा नियोजन संपादन (Edit DTP)' : 'Edit Tour Plan') : (isMr ? 'नवीन दैनिक दौरा नियोजन (Daily Tour Plan)' : 'New Daily Tour Plan')}
              </h3>
              <p className="text-xs text-blue-200">
                {isMr ? 'रूटनिहाय भेट, उद्दिष्टे व उत्पादक यादी' : 'Route-wise visit schedule, targets & producers'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isMr ? 'दौरा दिनांक (Plan Date)' : 'Plan Date'} *
              </label>
              <input
                type="date"
                value={planDate}
                onChange={e => setPlanDate(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isMr ? 'रूट निवडा (Route)' : 'Route'} *
              </label>
              <select
                value={routeNumber}
                onChange={e => setRouteNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
              >
                {availableRoutes.map(r => (
                  <option key={r.id} value={r.routeNumber}>
                    {r.routeNumber} - {r.routeName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isMr ? 'दूध संकलन लक्ष्य (Liters)' : 'Target Liters'}
              </label>
              <input
                type="number"
                value={targetLiters}
                onChange={e => setTargetLiters(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono font-bold text-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isMr ? 'लक्ष्य गावे (Target Villages)' : 'Target Villages'}
              </label>
              <input
                type="text"
                value={targetVillages}
                onChange={e => setTargetVillages(e.target.value)}
                placeholder="कवठेपिरान, भिलवडी, दुधगाव"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isMr ? 'भेट देण्याची केंद्रे (Target Centers)' : 'Target Centers'}
              </label>
              <input
                type="text"
                value={targetCenters}
                onChange={e => setTargetCenters(e.target.value)}
                placeholder="कवठेपिरान केंद्र, भिलवडी केंद्र"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              {isMr ? 'विशेष उद्दिष्टे व कार्य (Special Objectives)' : 'Special Objectives'}
            </label>
            <textarea
              rows={2}
              value={specialObjectives}
              onChange={e => setSpecialObjectives(e.target.value)}
              placeholder={isMr ? 'उदा. नवीन उत्पादक जोडणे, फॅट तक्रार निवारण...' : 'Specific tour objectives...'}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
            />
          </div>

          {/* Producer Visits Table */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between text-xs sm:text-sm">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-600" />
                <span>{isMr ? 'नियोजित गवळी / उत्पादक भेटी' : 'Producers to Visit'}</span>
              </span>
              <span className="text-xs text-blue-600 font-mono font-bold">({producersList.length} Scheduled)</span>
            </h4>

            {/* Add row */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <select
                value={newProducerCode}
                onChange={e => setNewProducerCode(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-800 border rounded-lg text-xs"
              >
                <option value="">-- {isMr ? 'उत्पादक निवडा' : 'Select Producer'} --</option>
                {farmers.map(f => (
                  <option key={f.id} value={f.farmerCode}>
                    {f.farmerCode} - {f.farmerName} ({f.village})
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={newPurpose}
                onChange={e => setNewPurpose(e.target.value)}
                placeholder={isMr ? 'भेटीचा हेतू...' : 'Visit purpose...'}
                className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-800 border rounded-lg text-xs"
              />
              <button
                type="button"
                onClick={handleAddProducer}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isMr ? 'जोडा' : 'Add'}</span>
              </button>
            </div>

            {/* List */}
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {producersList.map((p, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 rounded-lg border text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {p.producerName} ({p.producerCode})
                    </span>
                    <span className="text-slate-400 text-[11px] block">{p.village} • {p.purpose}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      p.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {p.status}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveProducer(idx)}
                      className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl font-bold cursor-pointer"
            >
              {isMr ? 'रद्द करा' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isMr ? 'दौरा नियोजन जतन करा' : 'Save Tour Plan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
