import React, { useState, useEffect } from 'react';
import {
  Building,
  Milk,
  Plus,
  Search,
  Filter,
  MapPin,
  Camera,
  Star,
  ShieldCheck,
  FileSpreadsheet,
  FileText,
  Share2,
  Trash2,
  Edit2,
  Calendar,
  Phone,
  User,
  Activity,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { CattleShedSurvey } from '../../types';
import { MPOStorageService } from '../../services/mpoStorageService';
import { GothaSurveyModal } from './GothaSurveyModal';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';

export const GothaSurveyView: React.FC = () => {
  const { language } = useLanguage();
  const isMr = language === 'mr';
  const { showToast } = useToast();

  const [surveys, setSurveys] = useState<CattleShedSurvey[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoute, setSelectedRoute] = useState('all');
  const [selectedShedType, setSelectedShedType] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSurvey, setEditingSurvey] = useState<CattleShedSurvey | null>(null);

  const loadData = () => {
    setSurveys(MPOStorageService.getGothaSurveys());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('dairy_mpo_updated', loadData);
    return () => window.removeEventListener('dairy_mpo_updated', loadData);
  }, []);

  const handleOpenAdd = () => {
    setEditingSurvey(null);
    setIsModalOpen(true);
  };

  const handleEdit = (survey: CattleShedSurvey) => {
    setEditingSurvey(survey);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(isMr ? `तुम्हाला '${name}' यांचे गोठा सर्वेक्षण हटवायचे आहे का?` : `Delete gotha survey for ${name}?`)) {
      MPOStorageService.deleteGothaSurvey(id);
      showToast(isMr ? 'गोठा सर्वेक्षण हटवले' : 'Survey deleted', 'success');
      loadData();
    }
  };

  const handleShareWhatsApp = (survey: CattleShedSurvey) => {
    const text = `🐄 *गोठा सर्वेक्षण अहवाल (Cattle Shed Report)*\n` +
      `📅 *दिनांक:* ${survey.surveyDate}\n` +
      `👤 *उत्पादक:* ${survey.producerName} (${survey.producerCode})\n` +
      `📍 *गाव:* ${survey.village} | रूट: ${survey.route}\n` +
      `🏠 *गोठा प्रकार:* ${survey.shedType} | तळ: ${survey.floorType}\n` +
      `🥛 *एकूण जनावरे:* ${survey.totalCattle} (दुभती: ${survey.milkingCattleCount})\n` +
      `🥛 *दैनिक दूध उत्पादन:* गाय: ${survey.dailyCowYield}L, म्हैस: ${survey.dailyBuffaloYield}L\n` +
      `⭐ *स्वच्छता स्टार:* ${survey.cleanlinessRating}/5\n` +
      `💉 *लसीकरण:* FMD: ${survey.fmdVaccinated ? 'होय' : 'नाही'}, लम्पी: ${survey.lumpyVaccinated ? 'होय' : 'नाही'}\n` +
      `👨‍💼 *सर्वेक्षक अधिकारी:* ${survey.officerName}\n\n` +
      `_डेअरी व्यवस्थापन सिस्टीमद्वारे प्रमाणित._`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Metrics
  const totalCattleSum = surveys.reduce((acc, s) => acc + (s.totalCattle || 0), 0);
  const totalDailyCowMilkSum = surveys.reduce((acc, s) => acc + (s.dailyCowYield || 0), 0);
  const totalDailyBuffMilkSum = surveys.reduce((acc, s) => acc + (s.dailyBuffaloYield || 0), 0);
  const modernShedsCount = surveys.filter(s => s.shedType.includes('Modern') || s.shedType.includes('Open')).length;

  const filteredSurveys = surveys.filter(s => {
    const matchSearch =
      s.producerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.producerCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.village.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRoute = selectedRoute === 'all' || s.route === selectedRoute;
    const matchType = selectedShedType === 'all' || s.shedType === selectedShedType;
    return matchSearch && matchRoute && matchType;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 rounded-xl">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">
              {isMr ? 'गोठा सर्वेक्षण व्यवस्थापन (Cattle Shed Survey)' : 'Cattle Shed Survey Management'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {isMr ? 'उत्पादकांच्या गोठ्याची पाहणी, जनावरांची संख्या, लसीकरण, दूध क्षमता व GPS वॉटरमार्क' : 'Shed inspections, animal breakdown, yield potential & GPS geotagging'}
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{isMr ? '+ नवीन गोठा सर्वेक्षण' : '+ Add Gotha Survey'}</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">{isMr ? 'एकूण गोठे सर्वेक्षण' : 'Total Sheds'}</span>
            <Building className="w-4 h-4 text-amber-700" />
          </div>
          <p className="text-2xl font-black text-slate-800 dark:text-white">{surveys.length}</p>
          <p className="text-[11px] text-amber-700 mt-1 font-semibold">{isMr ? 'पूर्ण तपासण्या' : 'inspections done'}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">{isMr ? 'एकूण जनावरे संख्या' : 'Total Cattle'}</span>
            <Milk className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-800 dark:text-white">{totalCattleSum}</p>
          <p className="text-[11px] text-blue-600 mt-1 font-semibold">{isMr ? 'गाय व म्हैस मिळून' : 'cows & buffaloes'}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">{isMr ? 'गाय दूध क्षमता' : 'Cow Milk Potential'}</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-800 dark:text-white">{totalDailyCowMilkSum} L</p>
          <p className="text-[11px] text-emerald-600 mt-1 font-semibold">{isMr ? 'दैनिक उत्पादन' : 'daily yield'}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">{isMr ? 'म्हैस दूध क्षमता' : 'Buff Milk Potential'}</span>
            <Activity className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-slate-800 dark:text-white">{totalDailyBuffMilkSum} L</p>
          <p className="text-[11px] text-purple-600 mt-1 font-semibold">{isMr ? 'दैनिक उत्पादन' : 'daily yield'}</p>
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
              placeholder={isMr ? 'शोध (नाव, कोड, गाव)...' : 'Search producer, code, village...'}
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
              value={selectedShedType}
              onChange={e => setSelectedShedType(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm"
            >
              <option value="all">{isMr ? 'सर्व गोठा प्रकार' : 'All Shed Types'}</option>
              <option value="Semi-Covered Modern">आधुनिक अर्ध-बंदिस्त</option>
              <option value="Open Shed">मुक्त संचार गोठा</option>
              <option value="Closed Shed">बंदिस्त गोठा</option>
              <option value="Traditional">पारंपारिक</option>
            </select>
          </div>
        </div>

        {/* Survey Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSurveys.map(survey => (
            <div
              key={survey.id}
              className="p-4 bg-slate-50/70 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 hover:border-amber-400 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200 text-[10px] font-mono font-black rounded-md">
                        {survey.surveyNumber}
                      </span>
                      <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-[10px] font-bold rounded-md">
                        {survey.route}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base mt-1">
                      {survey.producerName} ({survey.producerCode})
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{survey.village}</span>
                      <span className="text-slate-300">•</span>
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{survey.surveyDate}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 px-2 py-1 rounded-lg border border-amber-200 dark:border-amber-800">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span className="text-xs font-bold text-amber-800 dark:text-amber-300">{survey.cleanlinessRating}/5</span>
                  </div>
                </div>

                {/* Main details grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-2.5 py-2 border-y border-slate-200 dark:border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">{isMr ? 'गोठा रचना' : 'Shed Type'}</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{survey.shedType}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">{isMr ? 'एकूण जनावरे' : 'Cattle Count'}</span>
                    <span className="font-bold text-blue-700 dark:text-blue-400">{survey.totalCattle} (दुभती: {survey.milkingCattleCount})</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">{isMr ? 'गाय दूध' : 'Cow Yield'}</span>
                    <span className="font-bold text-emerald-600">{survey.dailyCowYield} L/day</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">{isMr ? 'म्हैस दूध' : 'Buff Yield'}</span>
                    <span className="font-bold text-purple-600">{survey.dailyBuffaloYield} L/day</span>
                  </div>
                </div>

                {/* Additional tags */}
                <div className="flex items-center gap-2 flex-wrap text-[11px] mb-2">
                  <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 rounded text-slate-700 dark:text-slate-300">
                    {survey.milkingMethod}
                  </span>
                  <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 rounded text-slate-700 dark:text-slate-300">
                    {survey.waterSource}
                  </span>
                  {survey.fmdVaccinated && (
                    <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded font-medium flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      FMD Ok
                    </span>
                  )}
                  {survey.lumpyVaccinated && (
                    <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded font-medium flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Lumpy Ok
                    </span>
                  )}
                </div>

                {survey.remarks && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 italic bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-700/50">
                    "{survey.remarks}"
                  </p>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="text-[11px] text-slate-500 font-serif italic">
                  {isMr ? 'सर्वेक्षक:' : 'By:'} {survey.officerName}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleShareWhatsApp(survey)}
                    className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg cursor-pointer"
                    title="Share via WhatsApp"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(survey)}
                    className="p-1.5 text-slate-600 hover:text-amber-700 dark:text-slate-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(survey.id, survey.producerName)}
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
      <GothaSurveyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        surveyToEdit={editingSurvey}
        onSaved={loadData}
      />
    </div>
  );
};
