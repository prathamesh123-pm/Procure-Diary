import React, { useState, useEffect } from 'react';
import {
  Building2,
  Milk,
  Plus,
  Search,
  Filter,
  Phone,
  MessageSquare,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  FileSpreadsheet,
  Edit2,
  Trash2,
  CheckCircle2,
  RefreshCw,
  Cpu,
  Clock,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { LinkCenter, CollectionCenter } from '../../types';
import { MPOStorageService } from '../../services/mpoStorageService';
import { CenterFormModal } from './CenterFormModal';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';

export const CenterManagementView: React.FC = () => {
  const { language } = useLanguage();
  const isMr = language === 'mr';
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'link' | 'collection'>('collection');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTaluka, setSelectedTaluka] = useState('all');
  const [linkCenters, setLinkCenters] = useState<LinkCenter[]>([]);
  const [collectionCenters, setCollectionCenters] = useState<CollectionCenter[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'link' | 'collection'>('collection');
  const [editingCenter, setEditingCenter] = useState<LinkCenter | CollectionCenter | null>(null);

  const loadData = () => {
    setLinkCenters(MPOStorageService.getLinkCenters());
    setCollectionCenters(MPOStorageService.getCollectionCenters());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('dairy_mpo_updated', loadData);
    return () => window.removeEventListener('dairy_mpo_updated', loadData);
  }, []);

  const handleOpenAdd = (type: 'link' | 'collection') => {
    setModalType(type);
    setEditingCenter(null);
    setIsModalOpen(true);
  };

  const handleEdit = (center: LinkCenter | CollectionCenter, type: 'link' | 'collection') => {
    setModalType(type);
    setEditingCenter(center);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, type: 'link' | 'collection', name: string) => {
    if (window.confirm(isMr ? `तुम्हाला '${name}' केंद्र हटवायचे आहे का?` : `Do you want to delete '${name}'?`)) {
      if (type === 'link') {
        MPOStorageService.deleteLinkCenter(id);
      } else {
        MPOStorageService.deleteCollectionCenter(id);
      }
      showToast(isMr ? 'केंद्र हटवले' : 'Center deleted', 'success');
      loadData();
    }
  };

  // Metrics
  const totalChillingCapacity = linkCenters.reduce((acc, c) => acc + (c.chillingCapacityLiters || 0), 0);
  const totalProducersCovered = collectionCenters.reduce((acc, c) => acc + (c.totalProducersCount || 0), 0);
  const totalDailyCowMilk = collectionCenters.reduce((acc, c) => acc + (c.dailyAverageCowLiters || 0), 0);
  const totalDailyBuffMilk = collectionCenters.reduce((acc, c) => acc + (c.dailyAverageBuffaloLiters || 0), 0);

  // Filtered lists
  const filteredLinkCenters = linkCenters.filter(c => {
    const matchSearch =
      c.centerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.centerCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.inchargeName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTaluka = selectedTaluka === 'all' || c.taluka === selectedTaluka;
    return matchSearch && matchTaluka;
  });

  const filteredCollectionCenters = collectionCenters.filter(c => {
    const matchSearch =
      c.centerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.centerCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.secretaryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.village.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.route.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTaluka = selectedTaluka === 'all' || c.taluka === selectedTaluka;
    return matchSearch && matchTaluka;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 rounded-xl">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">
                {isMr ? 'दूध संकलन व लिंक केंद्र व्यवस्थापन' : 'Center & Hub Management'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                {isMr ? 'बीएमसी चिलिंग हब, गावनिहाय दूध संकलन केंद्रे, सचिव व गुणवत्ता विश्लेषक यंत्रे' : 'BMC chilling hubs, village milk collection centers & analyzer devices'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleOpenAdd('link')}
            className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{isMr ? '+ नवीन लिंक केंद्र' : '+ Add Link Hub'}</span>
          </button>
          <button
            onClick={() => handleOpenAdd('collection')}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{isMr ? '+ नवीन संकलन केंद्र' : '+ Add Collection Center'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">{isMr ? 'मुख्य लिंक केंद्रे' : 'Link Hubs'}</span>
            <Building2 className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-black text-slate-800 dark:text-white">{linkCenters.length}</p>
          <p className="text-[11px] text-teal-600 mt-1 font-semibold">
            {totalChillingCapacity.toLocaleString('en-IN')} Ltr {isMr ? 'क्षमता' : 'capacity'}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">{isMr ? 'संकलन केंद्रे' : 'Collection Centers'}</span>
            <Milk className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-800 dark:text-white">{collectionCenters.length}</p>
          <p className="text-[11px] text-emerald-600 mt-1 font-semibold">
            {totalProducersCovered} {isMr ? 'उत्पादक जोडलेले' : 'producers linked'}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">{isMr ? 'दैनिक गाय संकलन' : 'Daily Cow Milk'}</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-800 dark:text-white">{totalDailyCowMilk.toLocaleString('en-IN')} L</p>
          <p className="text-[11px] text-blue-600 mt-1 font-semibold">{isMr ? 'सरासरी आवक' : 'daily average'}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">{isMr ? 'दैनिक म्हैस संकलन' : 'Daily Buff Milk'}</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-slate-800 dark:text-white">{totalDailyBuffMilk.toLocaleString('en-IN')} L</p>
          <p className="text-[11px] text-purple-600 mt-1 font-semibold">{isMr ? 'सरासरी आवक' : 'daily average'}</p>
        </div>
      </div>

      {/* Tabs & Search Filter */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-900 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('collection')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'collection'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Milk className="w-4 h-4" />
              <span>{isMr ? 'दूध संकलन केंद्रे' : 'Collection Centers'} ({collectionCenters.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('link')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'link'
                  ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>{isMr ? 'मुख्य लिंक केंद्रे (Hubs)' : 'Link Centers'} ({linkCenters.length})</span>
            </button>
          </div>

          {/* Search & Filters */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder={isMr ? 'शोध (नाव, कोड, सचिव, गाव)...' : 'Search name, code, secretary...'}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm"
              />
            </div>
            <select
              value={selectedTaluka}
              onChange={e => setSelectedTaluka(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm"
            >
              <option value="all">{isMr ? 'सर्व तालुके' : 'All Talukas'}</option>
              <option value="Miraj">मिरज (Miraj)</option>
              <option value="Walwa">वाळवा (Walwa)</option>
              <option value="Kadegaon">कडेगाव (Kadegaon)</option>
            </select>
          </div>
        </div>

        {/* List Content */}
        {activeTab === 'collection' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredCollectionCenters.map(cc => (
              <div
                key={cc.id}
                className="p-4 bg-slate-50/70 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 hover:border-emerald-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-[10px] font-mono font-black rounded-md">
                        {cc.centerCode}
                      </span>
                      <span className="ml-1.5 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-[10px] font-bold rounded-md">
                        {cc.route}
                      </span>
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base mt-1">
                        {cc.centerName}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{cc.village}, ता. {cc.taluka}</span>
                      </p>
                    </div>
                    <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[11px] font-bold rounded-full">
                      {cc.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 my-2.5 py-2 border-y border-slate-200 dark:border-slate-800 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block">{isMr ? 'दैनिक गाय दूध' : 'Cow Milk'}</span>
                      <span className="font-bold text-blue-700 dark:text-blue-400">{cc.dailyAverageCowLiters} Ltr</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">{isMr ? 'दैनिक म्हैस दूध' : 'Buffalo Milk'}</span>
                      <span className="font-bold text-purple-700 dark:text-purple-400">{cc.dailyAverageBuffaloLiters} Ltr</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">{isMr ? 'एकूण गवळी' : 'Producers'}</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{cc.totalProducersCount}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">{isMr ? 'विश्लेषक यंत्र' : 'Analyzer'}</span>
                      <span className="font-bold text-emerald-600 flex items-center gap-0.5">
                        <Cpu className="w-3 h-3" />
                        <span>{cc.hasElectronicAnalyzer ? 'Active' : 'Manual'}</span>
                      </span>
                    </div>
                  </div>

                  {/* Secretary & Timing */}
                  <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                    <p className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{isMr ? 'सचिव:' : 'Secretary:'}</span>
                      <span>{cc.secretaryName}</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-[11px]">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{cc.morningTiming} | {cc.eveningTiming}</span>
                    </p>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {cc.secretaryMobile && (
                      <>
                        <a
                          href={`tel:${cc.secretaryMobile}`}
                          className="p-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100"
                          title="Call Secretary"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href={`https://wa.me/91${cc.secretaryMobile.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100"
                          title="WhatsApp"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </a>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(cc, 'collection')}
                      className="p-1.5 text-slate-600 hover:text-emerald-600 dark:text-slate-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(cc.id, 'collection', cc.centerName)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredLinkCenters.map(lc => (
              <div
                key={lc.id}
                className="p-4 bg-slate-50/70 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 hover:border-teal-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="px-2 py-0.5 bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-300 text-[10px] font-mono font-black rounded-md">
                        {lc.centerCode}
                      </span>
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base mt-1">
                        {lc.centerName}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{lc.address}</span>
                      </p>
                    </div>
                    <span className="px-2 py-0.5 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 text-[11px] font-bold rounded-full">
                      {lc.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 my-2.5 py-2 border-y border-slate-200 dark:border-slate-800 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block">{isMr ? 'बीएमसी चिलिंग क्षमता' : 'Chilling Capacity'}</span>
                      <span className="font-bold text-teal-700 dark:text-teal-400">{lc.chillingCapacityLiters.toLocaleString('en-IN')} Ltr</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">{isMr ? 'दैनिक सरासरी आवक' : 'Daily Collection'}</span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">{lc.dailyAverageCollection.toLocaleString('en-IN')} Ltr</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                    <p className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{isMr ? 'केंद्र प्रमुख:' : 'In-charge:'}</span>
                      <span>{lc.inchargeName}</span>
                    </p>
                    {lc.fssaiNumber && (
                      <p className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                        <span>FSSAI: {lc.fssaiNumber}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {lc.mobileNumber && (
                      <>
                        <a
                          href={`tel:${lc.mobileNumber}`}
                          className="p-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href={`https://wa.me/91${lc.mobileNumber.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </a>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(lc, 'link')}
                      className="p-1.5 text-slate-600 hover:text-teal-600 dark:text-slate-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(lc.id, 'link', lc.centerName)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <CenterFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type={modalType}
        centerToEdit={editingCenter}
        onSaved={loadData}
      />
    </div>
  );
};
