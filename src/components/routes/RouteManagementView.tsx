import React, { useState, useEffect } from 'react';
import {
  Route,
  MapPin,
  Users,
  Milk,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Sparkles,
  Building,
  ChevronRight,
  X,
} from 'lucide-react';
import { RouteItem, Farmer, CallRecord } from '../../types';
import { StorageService } from '../../services/storageService';
import { GeminiService, AIRouteAnalysisResponse } from '../../services/geminiService';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';

export const RouteManagementView: React.FC = () => {
  const { language, t } = useLanguage();
  const { showDeleteSuccess, showError } = useToast();
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [calls, setCalls] = useState<CallRecord[]>([]);

  // Route Add/Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<RouteItem | null>(null);
  const [routeNumber, setRouteNumber] = useState('');
  const [routeName, setRouteName] = useState('');
  const [villagesText, setVillagesText] = useState('');
  const [assignedOfficer, setAssignedOfficer] = useState('');
  const [centerCount, setCenterCount] = useState(6);

  // AI Route Analysis State
  const [analyzingRoute, setAnalyzingRoute] = useState<string | null>(null);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<AIRouteAnalysisResponse | null>(null);

  // Delete State
  const [routeToDelete, setRouteToDelete] = useState<RouteItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = () => {
    setRoutes(StorageService.getRoutes());
    setFarmers(StorageService.getFarmers());
    setCalls(StorageService.getCalls());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('dairy_storage_updated', loadData);
    return () => window.removeEventListener('dairy_storage_updated', loadData);
  }, []);

  const handleOpenAdd = () => {
    setEditingRoute(null);
    setRouteNumber(`RT-${Math.floor(100 + Math.random() * 900)}`);
    setRouteName('');
    setVillagesText('वाळवा, इस्लामपूर, बोरगाव');
    setAssignedOfficer('सचिन पाटील');
    setCenterCount(6);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (r: RouteItem) => {
    setEditingRoute(r);
    setRouteNumber(r.routeNumber);
    setRouteName(r.routeName);
    const villages = r.villages || (r.village ? r.village.split(',').map(v => v.trim()) : []);
    setVillagesText(villages.join(', '));
    setAssignedOfficer(r.assignedOfficer || 'सचिन पाटील');
    setCenterCount(r.centerCount || 6);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!routeToDelete) return;
    setIsDeleting(true);
    try {
      StorageService.deleteRoute(routeToDelete.id);
      showDeleteSuccess(routeToDelete.routeName);
      setRouteToDelete(null);
    } catch (err: any) {
      showError(err?.message || 'Failed to delete route');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!routeName.trim()) return;

    const vList = villagesText.split(',').map(v => v.trim()).filter(Boolean);

    const saved: RouteItem = {
      id: editingRoute ? editingRoute.id : `ROUTE-${Date.now()}`,
      routeNumber: routeNumber.trim(),
      routeName: routeName.trim(),
      villages: vList.length > 0 ? vList : ['Sangli'],
      assignedOfficer: assignedOfficer.trim() || 'Officer',
      centerCount: Number(centerCount) || 5,
    };

    StorageService.saveRoute(saved);
    setIsModalOpen(false);
  };

  const handleAnalyzeRoute = async (r: RouteItem) => {
    const routeFarmers = farmers.filter(f => f.route === r.routeNumber || f.route === r.routeName);
    const totalMilk = routeFarmers.reduce((acc, curr) => acc + (curr.dailyMilkQuantity || 0), 0);
    const routeCalls = calls.filter(c => c.route === r.routeNumber || c.route.includes(r.routeNumber));

    setAnalyzingRoute(r.routeName);
    try {
      const res = await GeminiService.analyzeRoute(
        r.routeName,
        routeFarmers.length,
        totalMilk,
        routeCalls,
        language
      );
      setAiAnalysisResult(res);
    } catch (err) {
      console.error('Route AI error:', err);
    }
  };

  return (
    <div className="space-y-4 pb-20 md:pb-6 animate-in fade-in">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
            <Route className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {t('route.title')}
            </h2>
            <p className="text-xs text-slate-500">
              {routes.length} {language === 'mr' ? 'संकलन रूट्स व कव्हरेज गावे' : 'milk collection routes'}
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{t('route.add_new')}</span>
        </button>
      </div>

      {/* AI Route Insights Box */}
      {aiAnalysisResult && (
        <div className="p-4 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl shadow-md border border-emerald-500/30 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-sm text-amber-300">
                AI Route Intelligence: {analyzingRoute}
              </h3>
            </div>
            <button
              onClick={() => setAiAnalysisResult(null)}
              className="text-xs text-slate-300 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-200">{aiAnalysisResult.routeSummary}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
            <div className="p-3 bg-white/10 rounded-xl">
              <span className="font-bold text-emerald-300 block mb-1">💡 संकलन वाढीच्या टिप्स (Tips):</span>
              <ul className="list-disc list-inside space-y-1 text-slate-200">
                {aiAnalysisResult.milkProcurementTips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
            <div className="p-3 bg-white/10 rounded-xl">
              <span className="font-bold text-amber-300 block mb-1">🚀 वाढीच्या संधी (Growth):</span>
              <ul className="list-disc list-inside space-y-1 text-slate-200">
                {aiAnalysisResult.growthOpportunities.map((op, i) => (
                  <li key={i}>{op}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Routes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {routes.map(r => {
          const routeFarmers = farmers.filter(f => f.route === r.routeNumber || f.route === r.routeName);
          const totalMilk = routeFarmers.reduce((acc, curr) => acc + (curr.dailyMilkQuantity || 0), 0);
          const routeCalls = calls.filter(c => c.route === r.routeNumber || c.route.includes(r.routeNumber));

          return (
            <div
              key={r.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 hover:border-emerald-300 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2 py-0.5 text-xs font-mono font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded">
                    {r.routeNumber}
                  </span>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white mt-1">
                    {r.routeName}
                  </h3>
                  <p className="text-xs text-slate-500">
                    👤 Officer: <strong className="text-slate-700 dark:text-slate-300">{r.assignedOfficer}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(r)}
                    aria-label="Edit Route"
                    className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer transition-all active:scale-95"
                    title={language === 'mr' ? 'रूट संपादित करा' : 'Edit Route'}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setRouteToDelete(r)}
                    aria-label="Delete Route"
                    className="p-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-800/80 rounded-xl min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-xs"
                    title={language === 'mr' ? 'रूट डिलीट करा' : 'Delete Route'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl text-center text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block">{language === 'mr' ? 'शेतकरी' : 'Farmers'}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{routeFarmers.length}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">{language === 'mr' ? 'दैनिक दूध' : 'Milk'}</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{totalMilk} L</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">{language === 'mr' ? 'एकूण कॉल' : 'Calls'}</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{routeCalls.length}</span>
                </div>
              </div>

              {/* Villages tags */}
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400 font-medium">{language === 'mr' ? 'गावे / केंद्र:' : 'Villages Covered:'}</span>
                <div className="flex flex-wrap gap-1">
                  {(r.villages || (r.village ? r.village.split(',').map(v => v.trim()) : ['Sangli'])).map((v, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] rounded-md font-medium"
                    >
                      {v}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {r.centerCount || 6} {language === 'mr' ? 'संकलन केंद्रे' : 'Centers'}
                </span>
                <button
                  onClick={() => handleAnalyzeRoute(r)}
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{language === 'mr' ? 'AI सल्ला' : 'AI Route Insights'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Route Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {editingRoute ? (language === 'mr' ? 'रूट संपादित करा' : 'Edit Route') : (language === 'mr' ? 'नवीन संकलन रूट' : 'New Milk Route')}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRoute} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">{t('route.number')}</label>
                <input
                  type="text"
                  value={routeNumber}
                  onChange={e => setRouteNumber(e.target.value)}
                  placeholder="RT-101"
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">{t('route.name')}</label>
                <input
                  type="text"
                  value={routeName}
                  onChange={e => setRouteName(e.target.value)}
                  placeholder="उदा. वाळवा - इस्लामपूर रूट"
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">{t('route.officer')}</label>
                <input
                  type="text"
                  value={assignedOfficer}
                  onChange={e => setAssignedOfficer(e.target.value)}
                  placeholder="सचिन पाटील"
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">{t('route.villages')}</label>
                <textarea
                  value={villagesText}
                  onChange={e => setVillagesText(e.target.value)}
                  placeholder="वाळवा, इस्लामपूर, बोरगाव, कामेरी"
                  rows={2}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 resize-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">{language === 'mr' ? 'संकलन केंद्रांची संख्या' : 'Collection Centers Count'}</label>
                <input
                  type="number"
                  value={centerCount}
                  onChange={e => setCenterCount(Number(e.target.value))}
                  min={1}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-lg cursor-pointer"
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
      {routeToDelete && (
        <DeleteConfirmModal
          isOpen={Boolean(routeToDelete)}
          onClose={() => setRouteToDelete(null)}
          onConfirm={handleConfirmDelete}
          isDeleting={isDeleting}
          itemType={language === 'mr' ? 'दूध संकलन रूट' : 'Milk Collection Route'}
          itemName={routeToDelete.routeName}
          itemCode={routeToDelete.routeNumber}
          title={language === 'mr' ? 'हा संकलन रूट डिलीट करायचा आहे का?' : 'Delete this collection route?'}
          dependentItems={[
            {
              label: language === 'mr' ? 'जोडलेले गवळी / शेतकरी' : 'Linked Farmers / Gavali',
              count: StorageService.getRouteDependencies(routeToDelete.routeNumber).farmersCount,
            },
            {
              label: language === 'mr' ? 'नोंदवलेले कॉल्स' : 'Logged Calls',
              count: StorageService.getRouteDependencies(routeToDelete.routeNumber).callsCount,
            },
            {
              label: language === 'mr' ? 'थकीत कार्ये (Tasks)' : 'Active Tasks',
              count: StorageService.getRouteDependencies(routeToDelete.routeNumber).tasksCount,
            },
          ]}
        />
      )}
    </div>
  );
};
