import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Plus,
  Search,
  TrendingUp,
  Award,
  AlertTriangle,
  FileSpreadsheet,
  Edit2,
  Trash2,
  Share2,
  CheckCircle2,
  ArrowRightLeft,
  Building,
  DollarSign,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { CompetitorDairy } from '../../types';
import { MPOStorageService } from '../../services/mpoStorageService';
import { CompetitorFormModal } from './CompetitorFormModal';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';

export const CompetitorManagementView: React.FC = () => {
  const { language } = useLanguage();
  const isMr = language === 'mr';
  const { showToast } = useToast();

  const [competitors, setCompetitors] = useState<CompetitorDairy[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedThreat, setSelectedThreat] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompetitor, setEditingCompetitor] = useState<CompetitorDairy | null>(null);

  const loadData = () => {
    setCompetitors(MPOStorageService.getCompetitors());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('dairy_mpo_updated', loadData);
    return () => window.removeEventListener('dairy_mpo_updated', loadData);
  }, []);

  const handleOpenAdd = () => {
    setEditingCompetitor(null);
    setIsModalOpen(true);
  };

  const handleEdit = (comp: CompetitorDairy) => {
    setEditingCompetitor(comp);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(isMr ? `तुम्हाला '${name}' स्पर्धक माहिती हटवायची आहे का?` : `Delete competitor ${name}?`)) {
      MPOStorageService.deleteCompetitor(id);
      showToast(isMr ? 'स्पर्धक माहिती हटवली' : 'Competitor deleted', 'success');
      loadData();
    }
  };

  const handleShareIntelligence = (comp: CompetitorDairy) => {
    const text = `🚨 *स्पर्धक डेअरी माहिती (Competitor Dairy Intel)*\n` +
      `🏢 *डेअरी:* ${comp.dairyName}\n` +
      `⚠️ *धोका पातळी:* ${comp.threatLevel}\n` +
      `🥛 *गाय दर:* ${comp.cowRatePerFatSnf}\n` +
      `🥛 *म्हैस दर:* ${comp.buffaloRatePerFatSnf}\n` +
      `💰 *पेमेंट:* ${comp.paymentCycle}\n` +
      `🎁 *योजना/बोनस:* ${comp.incentivesOffered}\n` +
      `🌾 *पशुखाद्य:* ${comp.cattleFeedCredit}\n` +
      `⚠️ *त्यांची कमतरता:* ${comp.keyWeaknesses}\n` +
      `🎯 *आपली प्रति-रणनीती:* ${comp.ourCounterStrategy}\n\n` +
      `_दूध संकलन अधिकारी (MPO) फील्ड अहवाल._`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const filteredCompetitors = competitors.filter(c => {
    const matchSearch =
      c.dairyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.operatingVillages.some(v => v.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchThreat = selectedThreat === 'all' || c.threatLevel === selectedThreat;
    return matchSearch && matchThreat;
  });

  const getThreatBadge = (level: CompetitorDairy['threatLevel']) => {
    switch (level) {
      case 'Critical':
        return <span className="px-2.5 py-0.5 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 font-black text-xs rounded-md">Critical Risk</span>;
      case 'High':
        return <span className="px-2.5 py-0.5 bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 font-bold text-xs rounded-md">High Threat</span>;
      case 'Medium':
        return <span className="px-2.5 py-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-bold text-xs rounded-md">Medium Threat</span>;
      default:
        return <span className="px-2.5 py-0.5 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 font-medium text-xs rounded-md">Low Threat</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-300 rounded-xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">
              {isMr ? 'स्पर्धक डेअरी माहिती व विश्लेषण' : 'Competitor Dairy Intelligence'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {isMr ? 'इतर डेअरींचे दर, बोनस, पशुखाद्य सवलती, कमतरता व शेतकरी टिकवून ठेवण्याची रणनीती' : 'Competitor rate analysis, bonus schemes, feed subsidies & counter-strategies'}
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{isMr ? '+ नवीन स्पर्धक डेअरी' : '+ Add Competitor'}</span>
        </button>
      </div>

      {/* Benchmark Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-4 sm:p-5 rounded-2xl shadow-md border border-blue-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-emerald-500 text-white text-[11px] font-bold rounded-md uppercase">Our Dairy Benchmark</span>
            <span className="text-xs text-blue-200">{isMr ? 'आपले चालू खरेदी दर व सुविधा' : 'Our Current Baseline'}</span>
          </div>
          <h3 className="text-lg font-bold text-white">
            {isMr ? 'आपली डेअरी: १० दिवसांचे वेळेवर थेट बँक पेमेंट' : 'Our Dairy: 10-Day Direct Bank Payment'}
          </h3>
          <p className="text-xs text-blue-200">
            {isMr ? 'गाय: ₹३८.५० @ ३.५/८.५ | म्हैस: ₹५४.०० @ ६.०/९.० | मोफत पशुवैद्यकीय सहाय्य व घरपोच पशुखाद्य' : 'Cow: ₹38.50 @ 3.5/8.5 | Buffalo: ₹54.00 @ 6.0/9.0 | Free Vet Support'}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3.5 py-2 bg-white/10 rounded-xl text-center backdrop-blur-xs">
            <span className="text-[10px] text-blue-200 block uppercase">Competitors Tracked</span>
            <span className="text-xl font-black text-white">{competitors.length}</span>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder={isMr ? 'शोध (डेअरी नाव किंवा गाव)...' : 'Search dairy or village...'}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedThreat}
              onChange={e => setSelectedThreat(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm"
            >
              <option value="all">{isMr ? 'सर्व धोका पातळी (All Threats)' : 'All Threats'}</option>
              <option value="Critical">Critical Risk</option>
              <option value="High">High Threat</option>
              <option value="Medium">Medium Threat</option>
              <option value="Low">Low Threat</option>
            </select>
          </div>
        </div>

        {/* Competitor Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCompetitors.map(comp => (
            <div
              key={comp.id}
              className="p-4 bg-slate-50/70 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 hover:border-rose-300 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      {comp.dairyName}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isMr ? 'सक्रिय गावे:' : 'Villages:'} {comp.operatingVillages.slice(0, 3).join(', ')}
                      {comp.operatingVillages.length > 3 ? ` +${comp.operatingVillages.length - 3}` : ''}
                    </p>
                  </div>
                  {getThreatBadge(comp.threatLevel)}
                </div>

                {/* Rate Grid */}
                <div className="grid grid-cols-2 gap-2 my-2.5 py-2 border-y border-slate-200 dark:border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">{isMr ? 'गाय दूध खरेदी दर' : 'Cow Rate'}</span>
                    <span className="font-bold text-blue-700 dark:text-blue-400">{comp.cowRatePerFatSnf}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">{isMr ? 'म्हैस दूध खरेदी दर' : 'Buffalo Rate'}</span>
                    <span className="font-bold text-purple-700 dark:text-purple-400">{comp.buffaloRatePerFatSnf}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">{isMr ? 'पेमेंट सायकल' : 'Payment'}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{comp.paymentCycle}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">{isMr ? 'संकलन केंद्रे' : 'Centers'}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{comp.activeCollectionCentersCount} Centers</span>
                  </div>
                </div>

                {/* Details list */}
                <div className="space-y-1.5 text-xs">
                  <div className="p-2 bg-amber-50/80 dark:bg-amber-950/30 rounded-lg text-amber-900 dark:text-amber-300">
                    <span className="font-bold block text-[10px] uppercase">{isMr ? 'योजना / बोनस / सवलत:' : 'Incentives / Feed:'}</span>
                    <span>{comp.incentivesOffered}</span>
                  </div>

                  <div className="p-2 bg-red-50/80 dark:bg-red-950/30 rounded-lg text-red-900 dark:text-red-300">
                    <span className="font-bold block text-[10px] uppercase">{isMr ? 'त्यांची मुख्य कमतरता:' : 'Weakness:'}</span>
                    <span>{comp.keyWeaknesses}</span>
                  </div>

                  <div className="p-2 bg-emerald-50/80 dark:bg-emerald-950/30 rounded-lg text-emerald-900 dark:text-emerald-300">
                    <span className="font-bold block text-[10px] uppercase">{isMr ? 'आपली प्रति-रणनीती:' : 'Counter Strategy:'}</span>
                    <span>{comp.ourCounterStrategy}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">
                  {isMr ? 'अपडेट:' : 'Updated:'} {comp.lastUpdatedDate}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleShareIntelligence(comp)}
                    className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg cursor-pointer"
                    title="Share Intel"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(comp)}
                    className="p-1.5 text-slate-600 hover:text-rose-600 dark:text-slate-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(comp.id, comp.dairyName)}
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
      <CompetitorFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        competitorToEdit={editingCompetitor}
        onSaved={loadData}
      />
    </div>
  );
};
