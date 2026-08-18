import React, { useState, useEffect } from 'react';
import {
  Calendar,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Share2,
  FileText,
  Clock,
  MapPin,
  Sparkles,
  Award,
  Milestone,
  Check,
  TrendingUp,
  AlertCircle,
  PhoneCall,
  Save,
  Route as RouteIcon,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { StorageService } from '../../services/storageService';
import { ExecutiveDailyPlan } from '../../types';

export const DailyWorkPlanView: React.FC = () => {
  const { language } = useLanguage();
  const todayStr = new Date().toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [routes, setRoutes] = useState<string[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<string>('RT-101 (Sangli - Miraj Line)');
  
  // Daily Target State
  const [targetLitres, setTargetLitres] = useState<number>(1200);
  const [targetCalls, setTargetCalls] = useState<number>(15);
  const [targetVisits, setTargetVisits] = useState<number>(4);
  const [executiveNotes, setExecutiveNotes] = useState<string>('');

  // Daily Schedule & Checklists
  const [checklist, setChecklist] = useState<Array<{ id: string; time: string; text: string; completed: boolean; category: string }>>([
    { id: '1', time: '05:30 AM', text: 'सकाळचे संकलन केंद्र तपासणी व फॅट/SNF कॅलिब्रेशन (Morning Center Audit)', completed: true, category: 'Morning' },
    { id: '2', time: '07:00 AM', text: 'अनियमित गवळी संपर्क व थेट गोठा तपासणी (Irregular Gavali Visit)', completed: false, category: 'Morning' },
    { id: '3', time: '11:00 AM', text: 'पशुखाद्य मागणी नोंद व उचल (Advance) वाटप चर्चा (Cattle Feed & Advance)', completed: false, category: 'Afternoon' },
    { id: '4', time: '02:30 PM', text: 'नवीन गवळी जोडणी व दर कोटेशन सादरीकरण (New Gavali Acquisition)', completed: false, category: 'Afternoon' },
    { id: '5', time: '05:00 PM', text: 'संध्याकाळचे संकलन केंद्र वजन व सँपलिंग फेरपडताळणी (Evening Audit)', completed: false, category: 'Evening' },
    { id: '6', time: '07:30 PM', text: 'दैनिक संकलन ताळेबंद व फॉलो-अप शेरे नोंदणी (Daily Procurement Ledger & Diary)', completed: false, category: 'Evening' },
  ]);

  const [newItemText, setNewItemText] = useState('');
  const [newItemTime, setNewItemTime] = useState('10:00 AM');
  const [isSaved, setIsSaved] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  useEffect(() => {
    const loadedRoutes = StorageService.getRoutes();
    if (loadedRoutes.length > 0) {
      setRoutes(loadedRoutes.map(r => `${r.routeNumber || r.id} (${r.routeName})`));
      setSelectedRoute(`${loadedRoutes[0].routeNumber || loadedRoutes[0].id} (${loadedRoutes[0].routeName})`);
    } else {
      setRoutes(['RT-101 (Sangli - Miraj)', 'RT-102 (Tasgaon - Islampur)', 'RT-103 (Walwa - Karad)']);
    }

    // Load existing plan from localStorage if any
    const savedPlanJson = localStorage.getItem(`executive_plan_${selectedDate}`);
    if (savedPlanJson) {
      try {
        const p = JSON.parse(savedPlanJson);
        if (p.targetLitres) setTargetLitres(p.targetLitres);
        if (p.targetCalls) setTargetCalls(p.targetCalls);
        if (p.targetVisits) setTargetVisits(p.targetVisits);
        if (p.notes) setExecutiveNotes(p.notes);
        if (p.checklist) setChecklist(p.checklist);
        if (p.route) setSelectedRoute(p.route);
      } catch (e) {
        console.error(e);
      }
    }
  }, [selectedDate]);

  const toggleChecklist = (id: string) => {
    setChecklist(prev =>
      prev.map(item => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const handleAddChecklistItem = () => {
    if (!newItemText.trim()) return;
    const newItem = {
      id: Date.now().toString(),
      time: newItemTime || '10:00 AM',
      text: newItemText.trim(),
      completed: false,
      category: 'Custom',
    };
    setChecklist(prev => [...prev, newItem]);
    setNewItemText('');
  };

  const handleDeleteItem = (id: string) => {
    setChecklist(prev => prev.filter(item => item.id !== id));
  };

  const handleSavePlan = () => {
    const planData = {
      date: selectedDate,
      route: selectedRoute,
      targetLitres,
      targetCalls,
      targetVisits,
      notes: executiveNotes,
      checklist,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(`executive_plan_${selectedDate}`, JSON.stringify(planData));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  // Completion calculation
  const completedCount = checklist.filter(c => c.completed).length;
  const progressPercent = checklist.length > 0 ? Math.round((completedCount / checklist.length) * 100) : 0;

  // WhatsApp Summary text
  const generateDiaryShareText = () => {
    const isMr = language === 'mr';
    const text = isMr
      ? `📋 *दूध संकलन अधिकारी - दैनिक कार्य व दौरा अहवाल*
📅 तारीख: ${selectedDate}
📍 मार्ग (Route): ${selectedRoute}
--------------------------------
🎯 *दैनिक उद्दिष्टे:*
• संकलन टार्गेट: ${targetLitres} Ltr
• शेतकरी / गवळी कॉल टार्गेट: ${targetCalls}
• गोठा भेटी: ${targetVisits}
• कार्य प्रगती: ${completedCount}/${checklist.length} (${progressPercent}%) पूर्ण

📝 *महत्वाचे शेरे व निरीक्षणे:*
${executiveNotes || 'सर्व संकलन सुरळीत पार पडले.'}

- प्रोक्युअर डायरी CRM (Procure Diary)`
      : `📋 *Milk Procurement Executive - Daily Field Diary*
📅 Date: ${selectedDate}
📍 Route: ${selectedRoute}
--------------------------------
🎯 *Daily Targets:*
• Collection Target: ${targetLitres} Ltr
• Call Targets: ${targetCalls}
• Shed Visits: ${targetVisits}
• Progress: ${completedCount}/${checklist.length} tasks (${progressPercent}%)

📝 *Executive Observations & Notes:*
${executiveNotes || 'Field collection running normal.'}

- Procure Diary CRM`;
    return text;
  };

  const handleCopySummary = () => {
    navigator.clipboard.writeText(generateDiaryShareText());
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Banner & Date Selector */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-900 rounded-3xl p-5 sm:p-7 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
              <Milestone className="w-4 h-4" />
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-400/30 text-emerald-100 border border-emerald-300/30">
              {language === 'mr' ? 'अधिकारी दैनंदिनी' : 'Field Tour Diary'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            {language === 'mr' ? 'दैनिक कार्य व दौरा नियोजन' : 'Daily Field Work & Tour Planner'}
          </h2>
          <p className="text-xs text-emerald-100/90 font-medium">
            {language === 'mr'
              ? 'संकलन उद्दिष्टे, मार्ग भेटी, चेकलिस्ट व दैनिक शेरे व्यवस्थापन'
              : 'Procurement Targets, Route Audits, Checklists & Daily Field Observations'}
          </p>
        </div>

        {/* Date Selector & Save Actions */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-2 rounded-2xl border border-white/20">
            <Calendar className="w-4 h-4 text-emerald-200" />
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={handleSavePlan}
            className="px-4 py-2 bg-white hover:bg-emerald-50 text-emerald-900 font-bold rounded-2xl text-xs flex items-center gap-1.5 shadow-md shadow-black/10 transition-all cursor-pointer"
          >
            {isSaved ? <Check className="w-4 h-4 text-emerald-600" /> : <Save className="w-4 h-4" />}
            <span>{isSaved ? (language === 'mr' ? 'सेव्ह झाले!' : 'Saved!') : (language === 'mr' ? 'डायरी सेव्ह करा' : 'Save Diary')}</span>
          </button>
        </div>
      </div>

      {/* Target Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Planned Route */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold flex items-center gap-1.5">
              <RouteIcon className="w-4 h-4 text-emerald-600" />
              <span>{language === 'mr' ? 'नियोजित मार्ग (Route)' : 'Planned Route'}</span>
            </span>
          </div>
          <select
            value={selectedRoute}
            onChange={e => setSelectedRoute(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200"
          >
            {routes.map((r, i) => (
              <option key={i} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Target Litres */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>{language === 'mr' ? 'दैनिक संकलन टार्गेट' : 'Procure Target (L)'}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={targetLitres}
              onChange={e => setTargetLitres(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-base font-black text-emerald-600 dark:text-emerald-400"
            />
            <span className="font-bold text-xs text-slate-500">Ltr</span>
          </div>
        </div>

        {/* Target Calls */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold flex items-center gap-1.5">
              <PhoneCall className="w-4 h-4 text-blue-600" />
              <span>{language === 'mr' ? 'कॉल उद्दिष्ट (Calls)' : 'Call Targets'}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={targetCalls}
              onChange={e => setTargetCalls(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-base font-black text-blue-600 dark:text-blue-400"
            />
            <span className="font-bold text-xs text-slate-500">Calls</span>
          </div>
        </div>

        {/* Task Progress % */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-amber-600" />
              <span>{language === 'mr' ? 'दैनिक कार्य प्रगती' : 'Task Progress'}</span>
            </span>
            <span className="text-xs font-black text-slate-800 dark:text-slate-200">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 text-right">
            {completedCount} of {checklist.length} {language === 'mr' ? 'पूर्ण' : 'completed'}
          </p>
        </div>
      </div>

      {/* Main Checklist & Field Notes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Daily Operations Checklist */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-base text-slate-900 dark:text-white">
                {language === 'mr' ? 'दैनिक दौरा व तपासणी चेकलिस्ट' : 'Daily Tour & Field Checklist'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'mr' ? 'सकाळ, दुपार व संध्याकाळच्या कामांची अचूक नोंद' : 'Chronological shift operations & center audits'}
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-xl">
              {completedCount}/{checklist.length} Done
            </span>
          </div>

          {/* Checklist Items */}
          <div className="space-y-2.5">
            {checklist.map(item => (
              <div
                key={item.id}
                onClick={() => toggleChecklist(item.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 group ${
                  item.completed
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-emerald-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    className="mt-0.5 text-emerald-600 dark:text-emerald-400 shrink-0"
                  >
                    {item.completed ? (
                      <CheckCircle2 className="w-5 h-5 fill-emerald-600 text-white dark:fill-emerald-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-400 group-hover:text-emerald-500" />
                    )}
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{item.time}</span>
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">{item.category}</span>
                    </div>
                    <p
                      className={`text-xs font-bold leading-relaxed ${
                        item.completed
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {item.text}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    handleDeleteItem(item.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 rounded-lg transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add New Checklist Item */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-2">
            <input
              type="text"
              placeholder="09:00 AM"
              value={newItemTime}
              onChange={e => setNewItemTime(e.target.value)}
              className="w-full sm:w-28 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold"
            />
            <input
              type="text"
              placeholder={language === 'mr' ? 'नवीन कार्य / तपासणी नोंद जोडा...' : 'Add new tour task / audit step...'}
              value={newItemText}
              onChange={e => setNewItemText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddChecklistItem()}
              className="w-full flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
            />
            <button
              type="button"
              onClick={handleAddChecklistItem}
              className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'mr' ? 'जोडा' : 'Add'}</span>
            </button>
          </div>
        </div>

        {/* Right Col: Field Notes & Observations Diary */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div>
              <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>{language === 'mr' ? 'अधिकारी शेरे व निरीक्षणे' : 'Field Observations & Diary'}</span>
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'mr'
                  ? 'गवळी वाटाघाटी, फॅट तक्रारी व पशुखाद्य वितरणाचे शेरे'
                  : 'Gavali disputes, competitor movements & rate feedback'}
              </p>
            </div>

            <textarea
              rows={8}
              value={executiveNotes}
              onChange={e => setExecutiveNotes(e.target.value)}
              placeholder={
                language === 'mr'
                  ? 'उदा: आज आरटी-१०१ मार्गावर ३ गवळी भेटले. बाळू पाटील यांनी फॅट दराबद्दल समाधान व्यक्त केले. १० गोणी सुग्रास पशुखाद्य मागणी नोंदवली...'
                  : 'E.g., Visited 3 major suppliers on RT-101. Competitor offering +0.50 rate at Islampur. Advised mineral mixture for fat boost...'
              }
              className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs leading-relaxed text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Quick Share Actions */}
          <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={handleCopySummary}
              className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {copiedSummary ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              <span>{copiedSummary ? (language === 'mr' ? 'कॉपी झाले!' : 'Copied Summary!') : (language === 'mr' ? 'दौरा शेरे कॉपी करा' : 'Copy Field Summary')}</span>
            </button>

            <a
              href={`https://wa.me/?text=${encodeURIComponent(generateDiaryShareText())}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-green-600/20 transition-all text-center"
            >
              <span>{language === 'mr' ? 'WhatsApp वर शेरे पाठवा' : 'Share Diary to WhatsApp'}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
