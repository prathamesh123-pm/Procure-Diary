import React, { useState, useEffect } from 'react';
import {
  Calculator,
  X,
  Milk,
  TrendingUp,
  Percent,
  Share2,
  Check,
  RefreshCw,
  Coins,
  Scale,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Sliders,
  ChevronDown,
  ChevronUp,
  Info,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Minus,
  Building2,
  Layers,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { RateChartService } from '../../services/rateChartService';
import { RateChartRule } from '../../types/rateChart';

interface RateCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RateCalculatorModal: React.FC<RateCalculatorModalProps> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const isMr = language === 'mr';

  const [activeMasterChart, setActiveMasterChart] = useState<RateChartRule>(() => RateChartService.getActiveRateChart());

  // State: Milk Category
  const [milkType, setMilkType] = useState<'Cow' | 'Buffalo'>('Cow');

  // State: Core Quality Parameters
  const [fat, setFat] = useState<number>(() => RateChartService.getActiveRateChart().cowRateConfig.baseFat);
  const [snf, setSnf] = useState<number>(() => RateChartService.getActiveRateChart().cowRateConfig.baseSnf);
  const [dailyLitres, setDailyLitres] = useState<number>(100);

  // State: Rate Structure & Incentives
  const [baseRate, setBaseRate] = useState<number>(() => RateChartService.getActiveRateChart().cowRateConfig.baseRate);
  const [incentivePerLitre, setIncentivePerLitre] = useState<number>(() => RateChartService.getActiveRateChart().cowRateConfig.incentivePerLitre);
  const [baseFat, setBaseFat] = useState<number>(() => RateChartService.getActiveRateChart().cowRateConfig.baseFat);
  const [baseSnf, setBaseSnf] = useState<number>(() => RateChartService.getActiveRateChart().cowRateConfig.baseSnf);

  // State: Point Step Increments & Reverse Deductions (per 0.1% change)
  const [fatIncrPoint, setFatIncrPoint] = useState<number>(() => RateChartService.getActiveRateChart().cowRateConfig.fatIncrStep);
  const [fatDecrPoint, setFatDecrPoint] = useState<number>(() => RateChartService.getActiveRateChart().cowRateConfig.fatDecrStep);
  const [snfIncrPoint, setSnfIncrPoint] = useState<number>(() => RateChartService.getActiveRateChart().cowRateConfig.snfIncrStep);
  const [snfDecrPoint, setSnfDecrPoint] = useState<number>(() => RateChartService.getActiveRateChart().cowRateConfig.snfDecrStep);

  // Toggle for Advanced Point Rule Settings
  const [showAdvancedRules, setShowAdvancedRules] = useState<boolean>(true);
  const [showSensitivityMatrix, setShowSensitivityMatrix] = useState<boolean>(false);

  // State: Competitor Comparison
  const [showCompetitorCompare, setShowCompetitorCompare] = useState<boolean>(false);
  const [competitorCompareMode, setCompetitorCompareMode] = useState<'formula' | 'flat'>('formula');
  const [competitorFlatRate, setCompetitorFlatRate] = useState<number>(37.5);

  // Competitor Formula Parameters
  const [compBaseRate, setCompBaseRate] = useState<number>(() => RateChartService.getActiveRateChart().competitorConfig?.cowBaseRate || 37.0);
  const [compIncentive, setCompIncentive] = useState<number>(() => RateChartService.getActiveRateChart().competitorConfig?.cowIncentive || 0.5);
  const [compBaseFat, setCompBaseFat] = useState<number>(() => RateChartService.getActiveRateChart().competitorConfig?.cowBaseFat || 3.5);
  const [compBaseSnf, setCompBaseSnf] = useState<number>(() => RateChartService.getActiveRateChart().competitorConfig?.cowBaseSnf || 8.5);
  const [compFatIncrPoint, setCompFatIncrPoint] = useState<number>(0.25);
  const [compFatDecrPoint, setCompFatDecrPoint] = useState<number>(0.40);
  const [compSnfIncrPoint, setCompSnfIncrPoint] = useState<number>(0.20);
  const [compSnfDecrPoint, setCompSnfDecrPoint] = useState<number>(0.35);

  // Copy Status
  const [copiedQuote, setCopiedQuote] = useState<boolean>(false);

  // Sync with Master Rate Chart on open and whenever rate chart updates
  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail) {
        setActiveMasterChart(e.detail);
        applyChartToState(e.detail, milkType);
      }
    };

    if (isOpen) {
      const current = RateChartService.getActiveRateChart();
      setActiveMasterChart(current);
      applyChartToState(current, milkType);
    }

    window.addEventListener('dairy_rate_chart_updated', handleUpdate);
    return () => window.removeEventListener('dairy_rate_chart_updated', handleUpdate);
  }, [isOpen, milkType]);

  const applyChartToState = (chart: RateChartRule, type: 'Cow' | 'Buffalo') => {
    const cfg = type === 'Cow' ? chart.cowRateConfig : chart.buffaloRateConfig;
    setBaseFat(cfg.baseFat);
    setBaseSnf(cfg.baseSnf);
    setBaseRate(cfg.baseRate);
    setIncentivePerLitre(cfg.incentivePerLitre);
    setFatIncrPoint(cfg.fatIncrStep);
    setFatDecrPoint(cfg.fatDecrStep);
    setSnfIncrPoint(cfg.snfIncrStep);
    setSnfDecrPoint(cfg.snfDecrStep);
    setFat(cfg.baseFat);
    setSnf(cfg.baseSnf);

    if (type === 'Cow') {
      setCompetitorFlatRate(chart.competitorConfig?.cowBaseRate || 37.5);
      setCompBaseRate(chart.competitorConfig?.cowBaseRate || 37.0);
      setCompIncentive(chart.competitorConfig?.cowIncentive || 0.5);
      setCompBaseFat(chart.competitorConfig?.cowBaseFat || 3.5);
      setCompBaseSnf(chart.competitorConfig?.cowBaseSnf || 8.5);
      setCompFatIncrPoint(0.25);
      setCompFatDecrPoint(0.40);
      setCompSnfIncrPoint(0.20);
      setCompSnfDecrPoint(0.35);
    } else {
      setCompetitorFlatRate(chart.competitorConfig?.buffaloBaseRate || 66.0);
      setCompBaseRate(chart.competitorConfig?.buffaloBaseRate || 66.0);
      setCompIncentive(chart.competitorConfig?.buffaloIncentive || 1.0);
      setCompBaseFat(chart.competitorConfig?.buffaloBaseFat || 6.0);
      setCompBaseSnf(chart.competitorConfig?.buffaloBaseSnf || 9.0);
      setCompFatIncrPoint(0.45);
      setCompFatDecrPoint(0.65);
      setCompSnfIncrPoint(0.30);
      setCompSnfDecrPoint(0.45);
    }
  };

  // Handle Milk Type Switch with Standard Defaults
  const handleTypeSwitch = (type: 'Cow' | 'Buffalo') => {
    setMilkType(type);
    applyChartToState(activeMasterChart, type);
  };

  // Reset to Default Preset
  const handleResetToStandard = () => {
    handleTypeSwitch(milkType);
  };

  // Calculations: Fat & SNF Point Steps & Differences
  // 1 point = 0.1% change
  const fatDiffPoints = Math.round((fat - baseFat) * 10);
  const snfDiffPoints = Math.round((snf - baseSnf) * 10);

  // Fat Adjustment: If >= 0, multiply with fatIncrPoint; If < 0, multiply with fatDecrPoint
  const fatAdjustment = fatDiffPoints >= 0 
    ? Number((fatDiffPoints * fatIncrPoint).toFixed(3))
    : Number((fatDiffPoints * fatDecrPoint).toFixed(3));

  // SNF Adjustment: If >= 0, multiply with snfIncrPoint; If < 0, multiply with snfDecrPoint
  const snfAdjustment = snfDiffPoints >= 0 
    ? Number((snfDiffPoints * snfIncrPoint).toFixed(3))
    : Number((snfDiffPoints * snfDecrPoint).toFixed(3));

  const rawRatePerLitre = Math.max(10, baseRate + fatAdjustment + snfAdjustment);
  const finalRatePerLitre = Number((rawRatePerLitre + incentivePerLitre).toFixed(2));

  // Total Solids (TS)
  const totalSolids = Number((fat + snf).toFixed(2));
  const tsRate = totalSolids > 0 ? Number(((finalRatePerLitre / totalSolids) * 10).toFixed(2)) : 0;

  // Payout Forecasts
  const dailyPayout = Number((finalRatePerLitre * dailyLitres).toFixed(2));
  const tenDayBill = Number((dailyPayout * 10).toFixed(2)); // Standard 10-Day payment cycle in Dairy Industry
  const monthlyPayout = Number((dailyPayout * 30).toFixed(2));

  // Competitor Rate Calculations
  let compRatePerLitre = competitorFlatRate;
  if (competitorCompareMode === 'formula') {
    const compFatDiff = Math.round((fat - compBaseFat) * 10);
    const compSnfDiff = Math.round((snf - compBaseSnf) * 10);

    const compFatAdj = compFatDiff >= 0 
      ? Number((compFatDiff * compFatIncrPoint).toFixed(3))
      : Number((compFatDiff * compFatDecrPoint).toFixed(3));

    const compSnfAdj = compSnfDiff >= 0 
      ? Number((compSnfDiff * compSnfIncrPoint).toFixed(3))
      : Number((compSnfDiff * compSnfDecrPoint).toFixed(3));

    compRatePerLitre = Math.max(10, Number((compBaseRate + compIncentive + compFatAdj + compSnfAdj).toFixed(2)));
  }

  const rateDiffPerLitre = Number((finalRatePerLitre - compRatePerLitre).toFixed(2));
  const compDailyPayout = Number((compRatePerLitre * dailyLitres).toFixed(2));
  const dailyBenefit = Number((dailyPayout - compDailyPayout).toFixed(2));
  const tenDayBenefit = Number((dailyBenefit * 10).toFixed(2));
  const monthlyBenefit = Number((dailyBenefit * 30).toFixed(2));

  // Quick Step Stepper Helper
  const stepFat = (delta: number) => {
    const minLimit = milkType === 'Cow' ? 2.0 : 4.5;
    const maxLimit = milkType === 'Cow' ? 6.5 : 11.0;
    setFat(prev => Number(Math.min(maxLimit, Math.max(minLimit, prev + delta)).toFixed(1)));
  };

  const stepSnf = (delta: number) => {
    const minLimit = milkType === 'Cow' ? 7.0 : 7.5;
    const maxLimit = milkType === 'Cow' ? 10.5 : 11.5;
    setSnf(prev => Number(Math.min(maxLimit, Math.max(minLimit, prev + delta)).toFixed(1)));
  };

  // Direct Point Variation Handlers
  const handleFatPointsChange = (points: number) => {
    const targetFat = Number((baseFat + points / 10).toFixed(1));
    const minLimit = milkType === 'Cow' ? 2.0 : 4.5;
    const maxLimit = milkType === 'Cow' ? 6.5 : 11.0;
    setFat(Number(Math.min(maxLimit, Math.max(minLimit, targetFat)).toFixed(1)));
  };

  const handleSnfPointsChange = (points: number) => {
    const targetSnf = Number((baseSnf + points / 10).toFixed(1));
    const minLimit = milkType === 'Cow' ? 7.0 : 7.5;
    const maxLimit = milkType === 'Cow' ? 10.5 : 11.5;
    setSnf(Number(Math.min(maxLimit, Math.max(minLimit, targetSnf)).toFixed(1)));
  };

  // Base Quality Payout (at 0 point variations)
  const baseOnlyRate = Number((baseRate + incentivePerLitre).toFixed(2));
  const baseDailyPayout = Number((baseOnlyRate * dailyLitres).toFixed(2));
  const baseTenDayPayout = Number((baseDailyPayout * 10).toFixed(2));
  const netQualityPriceDelta = Number((fatAdjustment + snfAdjustment).toFixed(2));
  const netQualityTenDayImpact = Number(((dailyPayout - baseDailyPayout) * 10).toFixed(2));

  // WhatsApp Quotation Generator
  const getWhatsAppQuotation = () => {
    const text = isMr
      ? `🥛 *दूध दर व फॅट-एस.एन.एफ. गणना तपशील*
----------------------------------------
🐄 *प्रकार:* ${milkType === 'Cow' ? 'गाय दूध (Cow Milk)' : 'म्हैस दूध (Buffalo Milk)'}
• *फॅट (Fat):* ${fat.toFixed(1)}% (बेस: ${baseFat.toFixed(1)}%, ${fatDiffPoints >= 0 ? `+${fatDiffPoints} पॉईंट वाढ` : `${fatDiffPoints} पॉईंट कट`})
• *एस.एन.एफ. (SNF):* ${snf.toFixed(1)}% (बेस: ${baseSnf.toFixed(1)}%, ${snfDiffPoints >= 0 ? `+${snfDiffPoints} पॉईंट वाढ` : `${snfDiffPoints} पॉईंट कट`})
• *एकूण घनता (Total Solids):* ${totalSolids}% (TS Rate: ₹${tsRate}/TS)
----------------------------------------
📊 *दर संरचना (Rate Structure):*
• बेस दर: ₹${baseRate.toFixed(2)}/Ltr
• फॅट फरक (${fatDiffPoints >= 0 ? `+₹${fatIncrPoint}/पॉईंट` : `-₹${fatDecrPoint}/रिव्हर्स कट`}): ${fatAdjustment >= 0 ? `+₹${fatAdjustment.toFixed(2)}` : `-₹${Math.abs(fatAdjustment).toFixed(2)}`}
• SNF फरक (${snfDiffPoints >= 0 ? `+₹${snfIncrPoint}/पॉईंट` : `-₹${snfDecrPoint}/रिव्हर्स कट`}): ${snfAdjustment >= 0 ? `+₹${snfAdjustment.toFixed(2)}` : `-₹${Math.abs(snfAdjustment).toFixed(2)}`}
• विशेष इन्सेंटिव्ह: +₹${incentivePerLitre.toFixed(2)}/Ltr
----------------------------------------
💰 *अंतिम लागू दर: ₹${finalRatePerLitre.toFixed(2)} / लिटर*
📦 *दैनिक संकलन:* ${dailyLitres} लिटर
💵 *दैनिक बिल:* ₹${dailyPayout.toLocaleString('en-IN')}
🏆 *१० दिवसांचे बिल:* ₹${tenDayBill.toLocaleString('en-IN')}
📅 *मासिक उत्पन्न:* ₹${monthlyPayout.toLocaleString('en-IN')}
${showCompetitorCompare ? `----------------------------------------
📈 *इतर डेअरीशी तुलना फायदा:*
• इतर डेअरी दर: ₹${compRatePerLitre.toFixed(2)}/Ltr
• आपला वाढीव दर फरक: +₹${rateDiffPerLitre.toFixed(2)}/Ltr
• १० दिवसांचा जादा नफा: +₹${tenDayBenefit.toLocaleString('en-IN')}
• मासिक जादा नफा: +₹${monthlyBenefit.toLocaleString('en-IN')}` : ''}
----------------------------------------
वेळेवर १० दिवसांचे थेट खात्यात पेमेंट व खात्रीशीर सेवा.
- *दूध संकलन अधिकारी (Procure Diary CRM)*`
      : `🥛 *Milk Procurement Rate Calculation Slip*
----------------------------------------
🐄 *Type:* ${milkType === 'Cow' ? 'Cow Milk' : 'Buffalo Milk'}
• *Fat:* ${fat.toFixed(1)}% (Base: ${baseFat.toFixed(1)}%, ${fatDiffPoints >= 0 ? `+${fatDiffPoints} pts bonus` : `${fatDiffPoints} pts reverse cut`})
• *SNF:* ${snf.toFixed(1)}% (Base: ${baseSnf.toFixed(1)}%, ${snfDiffPoints >= 0 ? `+${snfDiffPoints} pts bonus` : `${snfDiffPoints} pts reverse cut`})
• *Total Solids (TS):* ${totalSolids}% (TS Rate: ₹${tsRate}/TS)
----------------------------------------
📊 *Rate Breakdown:*
• Base Rate: ₹${baseRate.toFixed(2)}/Ltr
• Fat Adjustment (${fatDiffPoints >= 0 ? `+₹${fatIncrPoint}/pt` : `-₹${fatDecrPoint}/cut`}): ${fatAdjustment >= 0 ? `+₹${fatAdjustment.toFixed(2)}` : `-₹${Math.abs(fatAdjustment).toFixed(2)}`}
• SNF Adjustment (${snfDiffPoints >= 0 ? `+₹${snfIncrPoint}/pt` : `-₹${snfDecrPoint}/cut`}): ${snfAdjustment >= 0 ? `+₹${snfAdjustment.toFixed(2)}` : `-₹${Math.abs(snfAdjustment).toFixed(2)}`}
• Bonus / Incentive: +₹${incentivePerLitre.toFixed(2)}/Ltr
----------------------------------------
💰 *Final Milk Rate: ₹${finalRatePerLitre.toFixed(2)} / Litre*
📦 *Daily Volume:* ${dailyLitres} Liters
💵 *Daily Payout:* ₹${dailyPayout.toLocaleString('en-IN')}
🏆 *10-Day Payout:* ₹${tenDayBill.toLocaleString('en-IN')}
📅 *Monthly Projected:* ₹${monthlyPayout.toLocaleString('en-IN')}
${showCompetitorCompare ? `----------------------------------------
📈 *Competitor Comparative Gain:*
• Competitor Rate: ₹${compRatePerLitre.toFixed(2)}/Ltr
• Rate Advantage: +₹${rateDiffPerLitre.toFixed(2)}/Ltr
• 10-Day Extra Gain: +₹${tenDayBenefit.toLocaleString('en-IN')}
• Monthly Extra Gain: +₹${monthlyBenefit.toLocaleString('en-IN')}` : ''}
----------------------------------------
Guaranteed 10-day payment cycle & on-farm field support.
- *Milk Procurement Executive (Procure Diary CRM)*`;
    return text;
  };

  const handleCopyQuote = () => {
    navigator.clipboard.writeText(getWhatsAppQuotation());
    setCopiedQuote(true);
    setTimeout(() => setCopiedQuote(false), 2500);
  };

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Guard: Do not render anything when modal is closed
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[95vh] flex flex-col transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner border border-white/20">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg leading-tight flex items-center gap-2">
                <span>{isMr ? 'दूध दर व फॅट-SNF कॅल्क्युलेटर' : 'Milk Rate & Fat/SNF Calculator'}</span>
                <span className="text-[10px] uppercase font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full shadow-xs">
                  {milkType === 'Cow' ? (isMr ? 'गाय' : 'Cow') : (isMr ? 'म्हैस' : 'Buffalo')}
                </span>
              </h3>
              <p className="text-xs text-emerald-100 font-medium">
                {isMr
                  ? 'पॉईंट वाढ, रिव्हर्स कट व १० दिवसांचे बिल अंदाज'
                  : 'Point Step Increments, Reverse Deductions & 10-Day Payout'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleResetToStandard}
              title={isMr ? 'प्रमाणित दर रीसेट करा' : 'Reset to standard'}
              className="p-2 rounded-xl hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-3 sm:p-5 overflow-y-auto space-y-4 text-xs text-slate-800 dark:text-slate-200">
          {/* Milk Type Toggle & Quick Volume Presets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Milk Type Toggle */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/60">
              <button
                type="button"
                onClick={() => handleTypeSwitch('Cow')}
                className={`py-2 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  milkType === 'Cow'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Milk className="w-4 h-4" />
                <span>{isMr ? 'गाय दूध (Cow 3.5/8.5)' : 'Cow (3.5/8.5)'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeSwitch('Buffalo')}
                className={`py-2 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  milkType === 'Buffalo'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Milk className="w-4 h-4" />
                <span>{isMr ? 'म्हैस दूध (Buffalo 6.0/9.0)' : 'Buffalo (6.0/9.0)'}</span>
              </button>
            </div>

            {/* Daily Volume Selector */}
            <div className="p-1.5 bg-slate-100 dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-2 px-3">
              <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px] whitespace-nowrap">
                {isMr ? 'दैनिक दूध:' : 'Daily Milk:'}
              </span>
              <div className="flex items-center gap-1.5">
                {[25, 50, 100, 200].map(vol => (
                  <button
                    key={vol}
                    type="button"
                    onClick={() => setDailyLitres(vol)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                      dailyLitres === vol
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {vol}L
                  </button>
                ))}
                <div className="relative w-18">
                  <input
                    type="number"
                    min="1"
                    value={dailyLitres}
                    onChange={e => setDailyLitres(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full px-1.5 py-1 text-right rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: Quality Parameters (Fat & SNF Interactive Cards with Point Variation Inputs) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* FAT CARD */}
            <div className={`p-3.5 rounded-2xl border space-y-3 shadow-xs transition-all ${
              fatDiffPoints < 0 
                ? 'bg-rose-50/50 dark:bg-slate-800/90 border-rose-200 dark:border-rose-900/60'
                : fatDiffPoints > 0
                ? 'bg-emerald-50/60 dark:bg-slate-800/90 border-emerald-200 dark:border-emerald-900/60'
                : 'bg-slate-50/70 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-xs">
                  <Percent className="w-4 h-4 text-emerald-600" />
                  <span>{isMr ? 'फॅट प्रमाण (Fat %)' : 'Fat Percentage'}</span>
                </span>
                
                {/* Fat % Value and Steppers */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => stepFat(-0.1)}
                    className="w-6 h-6 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-black flex items-center justify-center hover:bg-slate-200 cursor-pointer shadow-2xs"
                    title="-0.1% Fat"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-base font-black text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded-lg border border-emerald-300 dark:border-emerald-800 shadow-xs min-w-16 text-center">
                    {fat.toFixed(1)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => stepFat(0.1)}
                    className="w-6 h-6 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-black flex items-center justify-center hover:bg-slate-200 cursor-pointer shadow-2xs"
                    title="+0.1% Fat"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Direct Point Variation Input & Quick Points Control */}
              <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  <Sliders className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{isMr ? 'फॅट पॉईंट फरक:' : 'Fat Point Variation:'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="1"
                    min="-30"
                    max="30"
                    value={fatDiffPoints}
                    onChange={e => handleFatPointsChange(parseInt(e.target.value) || 0)}
                    className={`w-16 px-1.5 py-0.5 text-center font-black rounded-lg border text-xs ${
                      fatDiffPoints < 0 
                        ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                        : fatDiffPoints > 0
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                    }`}
                  />
                  <span className="text-[10px] font-bold text-slate-500">{isMr ? 'पॉईंट' : 'pts'}</span>
                </div>
              </div>

              {/* Quick Point Variation Presets */}
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-slate-500 block">
                  {isMr ? 'त्वरित पॉईंट फरक निवडा:' : 'Quick Point Variations:'}
                </span>
                <div className="flex flex-wrap gap-1">
                  {[-5, -3, -2, -1, 0, 1, 2, 3, 5].map(pt => (
                    <button
                      key={pt}
                      type="button"
                      onClick={() => handleFatPointsChange(pt)}
                      className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                        fatDiffPoints === pt
                          ? pt < 0 
                            ? 'bg-rose-600 text-white shadow-xs'
                            : pt > 0
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 shadow-xs'
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {pt === 0 ? (isMr ? 'बेस' : 'Base') : pt > 0 ? `+${pt}` : `${pt}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fat Range Slider */}
              <input
                type="range"
                min={milkType === 'Cow' ? 2.5 : 4.5}
                max={milkType === 'Cow' ? 5.5 : 10.0}
                step="0.1"
                value={fat}
                onChange={e => setFat(parseFloat(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />

              <div className="flex justify-between items-center text-[10px] text-slate-500">
                <span>{isMr ? 'किमान' : 'Min'}: {milkType === 'Cow' ? '2.5%' : '4.5%'}</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                  {isMr ? 'बेस प्रमाण' : 'Base'}: {baseFat.toFixed(1)}%
                </span>
                <span>{isMr ? 'कमाल' : 'Max'}: {milkType === 'Cow' ? '5.5%' : '10.0%'}</span>
              </div>

              {/* Point Indicator Pill with Calculated Price Difference */}
              <div className={`p-2.5 rounded-xl text-[11px] font-semibold flex items-center justify-between ${
                fatDiffPoints >= 0
                  ? 'bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800'
                  : 'bg-rose-100/70 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300/60 dark:border-rose-800'
              }`}>
                <div className="flex items-center gap-1.5">
                  {fatDiffPoints >= 0 ? (
                    <ArrowUpRight className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <div>
                    <span className="block font-bold">
                      {fatDiffPoints === 0
                        ? (isMr ? 'बेस फॅटवर बरोबर (० पॉईंट फरक)' : 'Exact Base Fat (0 pts)')
                        : fatDiffPoints > 0
                        ? `+${fatDiffPoints} ${isMr ? 'पॉईंट फॅट वाढ (+ बोनस)' : 'pts Fat Bonus'} (+${(fat - baseFat).toFixed(1)}%)`
                        : `${fatDiffPoints} ${isMr ? 'पॉईंट फॅट रिव्हर्स कट (- दंड)' : 'pts Reverse Cut'} (${(fat - baseFat).toFixed(1)}%)`}
                    </span>
                    <span className="text-[10px] opacity-80 block">
                      {fatDiffPoints >= 0 
                        ? `${fatDiffPoints} pts × ₹${fatIncrPoint.toFixed(2)}/pt`
                        : `${Math.abs(fatDiffPoints)} pts reverse × ₹${fatDecrPoint.toFixed(2)}/pt`}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black block">
                    {fatAdjustment >= 0 ? `+₹${fatAdjustment.toFixed(2)}` : `-₹${Math.abs(fatAdjustment).toFixed(2)}`} /L
                  </span>
                  <span className="text-[9px] opacity-80 block">
                    {fatAdjustment >= 0 ? (isMr ? 'दर वाढ' : 'Price Add') : (isMr ? 'रिव्हर्स वजा' : 'Reverse Cut')}
                  </span>
                </div>
              </div>
            </div>

            {/* SNF CARD */}
            <div className={`p-3.5 rounded-2xl border space-y-3 shadow-xs transition-all ${
              snfDiffPoints < 0 
                ? 'bg-rose-50/50 dark:bg-slate-800/90 border-rose-200 dark:border-rose-900/60'
                : snfDiffPoints > 0
                ? 'bg-blue-50/60 dark:bg-slate-800/90 border-blue-200 dark:border-blue-900/60'
                : 'bg-slate-50/70 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-xs">
                  <Scale className="w-4 h-4 text-blue-600" />
                  <span>{isMr ? 'एस.एन.एफ. प्रमाण (SNF %)' : 'SNF Percentage'}</span>
                </span>
                
                {/* SNF % Value and Steppers */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => stepSnf(-0.1)}
                    className="w-6 h-6 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-black flex items-center justify-center hover:bg-slate-200 cursor-pointer shadow-2xs"
                    title="-0.1% SNF"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-base font-black text-blue-700 dark:text-blue-400 bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded-lg border border-blue-300 dark:border-blue-800 shadow-xs min-w-16 text-center">
                    {snf.toFixed(1)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => stepSnf(0.1)}
                    className="w-6 h-6 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-black flex items-center justify-center hover:bg-slate-200 cursor-pointer shadow-2xs"
                    title="+0.1% SNF"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Direct Point Variation Input & Quick Points Control */}
              <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  <Sliders className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>{isMr ? 'SNF पॉईंट फरक:' : 'SNF Point Variation:'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="1"
                    min="-30"
                    max="30"
                    value={snfDiffPoints}
                    onChange={e => handleSnfPointsChange(parseInt(e.target.value) || 0)}
                    className={`w-16 px-1.5 py-0.5 text-center font-black rounded-lg border text-xs ${
                      snfDiffPoints < 0 
                        ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                        : snfDiffPoints > 0
                        ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                    }`}
                  />
                  <span className="text-[10px] font-bold text-slate-500">{isMr ? 'पॉईंट' : 'pts'}</span>
                </div>
              </div>

              {/* Quick Point Variation Presets */}
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-slate-500 block">
                  {isMr ? 'त्वरित पॉईंट फरक निवडा:' : 'Quick Point Variations:'}
                </span>
                <div className="flex flex-wrap gap-1">
                  {[-5, -3, -2, -1, 0, 1, 2, 3, 5].map(pt => (
                    <button
                      key={pt}
                      type="button"
                      onClick={() => handleSnfPointsChange(pt)}
                      className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                        snfDiffPoints === pt
                          ? pt < 0 
                            ? 'bg-rose-600 text-white shadow-xs'
                            : pt > 0
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 shadow-xs'
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {pt === 0 ? (isMr ? 'बेस' : 'Base') : pt > 0 ? `+${pt}` : `${pt}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* SNF Range Slider */}
              <input
                type="range"
                min={milkType === 'Cow' ? 7.5 : 8.0}
                max={milkType === 'Cow' ? 9.5 : 10.5}
                step="0.1"
                value={snf}
                onChange={e => setSnf(parseFloat(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />

              <div className="flex justify-between items-center text-[10px] text-slate-500">
                <span>{isMr ? 'किमान' : 'Min'}: {milkType === 'Cow' ? '7.5%' : '8.0%'}</span>
                <span className="font-semibold text-blue-700 dark:text-blue-400">
                  {isMr ? 'बेस प्रमाण' : 'Base'}: {baseSnf.toFixed(1)}%
                </span>
                <span>{isMr ? 'कमाल' : 'Max'}: {milkType === 'Cow' ? '9.5%' : '10.5%'}</span>
              </div>

              {/* SNF Point Indicator Pill with Calculated Price Difference */}
              <div className={`p-2.5 rounded-xl text-[11px] font-semibold flex items-center justify-between ${
                snfDiffPoints >= 0
                  ? 'bg-blue-100/70 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-300/60 dark:border-blue-800'
                  : 'bg-rose-100/70 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300/60 dark:border-rose-800'
              }`}>
                <div className="flex items-center gap-1.5">
                  {snfDiffPoints >= 0 ? (
                    <ArrowUpRight className="w-4 h-4 text-blue-600 shrink-0" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <div>
                    <span className="block font-bold">
                      {snfDiffPoints === 0
                        ? (isMr ? 'बेस SNF वर बरोबर (० पॉईंट फरक)' : 'Exact Base SNF (0 pts)')
                        : snfDiffPoints > 0
                        ? `+${snfDiffPoints} ${isMr ? 'पॉईंट SNF वाढ (+ बोनस)' : 'pts SNF Bonus'} (+${(snf - baseSnf).toFixed(1)}%)`
                        : `${snfDiffPoints} ${isMr ? 'पॉईंट SNF रिव्हर्स कट (- दंड)' : 'pts Reverse Cut'} (${(snf - baseSnf).toFixed(1)}%)`}
                    </span>
                    <span className="text-[10px] opacity-80 block">
                      {snfDiffPoints >= 0 
                        ? `${snfDiffPoints} pts × ₹${snfIncrPoint.toFixed(2)}/pt`
                        : `${Math.abs(snfDiffPoints)} pts reverse × ₹${snfDecrPoint.toFixed(2)}/pt`}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black block">
                    {snfAdjustment >= 0 ? `+₹${snfAdjustment.toFixed(2)}` : `-₹${Math.abs(snfAdjustment).toFixed(2)}`} /L
                  </span>
                  <span className="text-[9px] opacity-80 block">
                    {snfAdjustment >= 0 ? (isMr ? 'दर वाढ' : 'Price Add') : (isMr ? 'रिव्हर्स वजा' : 'Reverse Cut')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Point Step & Reverse Deduction Parameters (User Requested: पॉईंट वाढ व रिव्हर्स कट सेटिंग्ज) */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                  {isMr ? 'पॉईंट दर व रिव्हर्स कट संरचना (Point Step & Reverse Cuts)' : 'Point Step & Reverse Cut Rules'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowAdvancedRules(!showAdvancedRules)}
                className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>{showAdvancedRules ? (isMr ? 'लपवा' : 'Hide') : (isMr ? 'बदला / पहा' : 'Edit / View')}</span>
                {showAdvancedRules ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {showAdvancedRules && (
              <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-700/60">
                {/* 4-Box Grid: Fat Increment, Fat Reverse Cut, SNF Increment, SNF Reverse Cut */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {/* 1. Fat Point Increase */}
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/50 space-y-1">
                    <label className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 block">
                      {isMr ? '📈 पॉईंट फॅट वाढ' : 'Fat Point Incr.'}
                    </label>
                    <span className="text-[9px] text-slate-400 block">
                      {isMr ? 'दर ०.१% फॅट वाढीस (+)' : 'per 0.1% Fat up'}
                    </span>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs font-bold text-slate-500">₹</span>
                      <input
                        type="number"
                        step="0.05"
                        min="0"
                        value={fatIncrPoint}
                        onChange={e => setFatIncrPoint(parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 rounded-lg bg-emerald-50/50 dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 font-bold text-xs text-emerald-900 dark:text-emerald-200"
                      />
                    </div>
                  </div>

                  {/* 2. Fat Reverse Deduction */}
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800/50 space-y-1">
                    <label className="text-[10px] font-bold text-rose-700 dark:text-rose-400 block">
                      {isMr ? '📉 रिव्हर्स फॅट कट' : 'Fat Reverse Cut'}
                    </label>
                    <span className="text-[9px] text-slate-400 block">
                      {isMr ? 'दर ०.१% फॅट कमीस (-)' : 'per 0.1% Fat down'}
                    </span>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs font-bold text-slate-500">₹</span>
                      <input
                        type="number"
                        step="0.05"
                        min="0"
                        value={fatDecrPoint}
                        onChange={e => setFatDecrPoint(parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 rounded-lg bg-rose-50/50 dark:bg-slate-800 border border-rose-300 dark:border-rose-700 font-bold text-xs text-rose-900 dark:text-rose-200"
                      />
                    </div>
                  </div>

                  {/* 3. SNF Point Increase */}
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800/50 space-y-1">
                    <label className="text-[10px] font-bold text-blue-700 dark:text-blue-400 block">
                      {isMr ? '📈 पॉईंट SNF वाढ' : 'SNF Point Incr.'}
                    </label>
                    <span className="text-[9px] text-slate-400 block">
                      {isMr ? 'दर ०.१% SNF वाढीस (+)' : 'per 0.1% SNF up'}
                    </span>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs font-bold text-slate-500">₹</span>
                      <input
                        type="number"
                        step="0.05"
                        min="0"
                        value={snfIncrPoint}
                        onChange={e => setSnfIncrPoint(parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 rounded-lg bg-blue-50/50 dark:bg-slate-800 border border-blue-300 dark:border-blue-700 font-bold text-xs text-blue-900 dark:text-blue-200"
                      />
                    </div>
                  </div>

                  {/* 4. SNF Reverse Deduction */}
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800/50 space-y-1">
                    <label className="text-[10px] font-bold text-rose-700 dark:text-rose-400 block">
                      {isMr ? '📉 रिव्हर्स SNF कट' : 'SNF Reverse Cut'}
                    </label>
                    <span className="text-[9px] text-slate-400 block">
                      {isMr ? 'दर ०.१% SNF कमीस (-)' : 'per 0.1% SNF down'}
                    </span>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs font-bold text-slate-500">₹</span>
                      <input
                        type="number"
                        step="0.05"
                        min="0"
                        value={snfDecrPoint}
                        onChange={e => setSnfDecrPoint(parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 rounded-lg bg-rose-50/50 dark:bg-slate-800 border border-rose-300 dark:border-rose-700 font-bold text-xs text-rose-900 dark:text-rose-200"
                      />
                    </div>
                  </div>
                </div>

                {/* Base Rate, Base Standards & Incentive */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      {isMr ? 'बेस दर (₹/Ltr)' : 'Base Rate (₹/L)'}
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={baseRate}
                      onChange={e => setBaseRate(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      {isMr ? 'इन्सेंटिव्ह (₹/Ltr)' : 'Incentive (₹/L)'}
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      value={incentivePerLitre}
                      onChange={e => setIncentivePerLitre(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-xs text-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      {isMr ? 'बेस फॅट प्रमाण %' : 'Base Fat %'}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={baseFat}
                      onChange={e => setBaseFat(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      {isMr ? 'बेस SNF प्रमाण %' : 'Base SNF %'}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={baseSnf}
                      onChange={e => setBaseSnf(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-xs"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Point Variation Price Difference & Payout Impact Breakdown */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                  {isMr ? 'पॉईंट फरक व निव्वळ दर/बिल परिणाम (Price Difference & Impact)' : 'Quality Price Difference & Payout Impact'}
                </span>
              </div>
              <span className={`text-[11px] font-black px-2 py-0.5 rounded-lg ${
                netQualityPriceDelta > 0
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                  : netQualityPriceDelta < 0
                  ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}>
                {netQualityPriceDelta > 0 
                  ? `+₹${netQualityPriceDelta.toFixed(2)}/L ${isMr ? 'वाढीव बोनस' : 'Bonus'}`
                  : netQualityPriceDelta < 0
                  ? `-₹${Math.abs(netQualityPriceDelta).toFixed(2)}/L ${isMr ? 'रिव्हर्स कट' : 'Reverse Drop'}`
                  : (isMr ? 'बेस दर सममूल्य' : 'Base Parity')}
              </span>
            </div>

            {/* Quality Penalty / Bonus Banner */}
            {(fatDiffPoints < 0 || snfDiffPoints < 0) && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-[11px] space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    {isMr ? '⚠️ रिव्हर्स कट नुकसान सूचना (Reverse Point Deduction Warning)' : '⚠️ Reverse Point Deduction Warning'}
                  </span>
                </div>
                <p className="leading-relaxed">
                  {isMr
                    ? `दूध गुणवत्ता बेस प्रमाणापेक्षा कमी असल्याने प्रति लिटर ₹${Math.abs(netQualityPriceDelta).toFixed(2)} चा रिव्हर्स कट लागला आहे. यामुळे १० दिवसांच्या बिलात ₹${Math.abs(netQualityTenDayImpact).toLocaleString('en-IN')} चे थेट नुकसान होत आहे.`
                    : `Milk quality is below base standard, resulting in a ₹${Math.abs(netQualityPriceDelta).toFixed(2)}/L reverse cut. This leads to a payout loss of ₹${Math.abs(netQualityTenDayImpact).toLocaleString('en-IN')} for the 10-day billing cycle.`}
                </p>
                <div className="pt-1 flex items-center justify-between text-[10px] text-amber-700 dark:text-amber-300 font-semibold border-t border-amber-200 dark:border-amber-800/40">
                  <span>{isMr ? '💡 टीप: फक्त +२ पॉईंट वाढल्यास १० दिवसांत' : '💡 Tip: Recover +2 points to gain'}</span>
                  <strong className="text-emerald-700 dark:text-emerald-400 font-black">
                    +₹{Number(((fatIncrPoint * 2 * dailyLitres * 10)).toFixed(0)).toLocaleString('en-IN')} {isMr ? 'जादा नफा!' : 'Extra Payout!'}
                  </strong>
                </div>
              </div>
            )}

            {fatDiffPoints >= 0 && snfDiffPoints >= 0 && (fatDiffPoints > 0 || snfDiffPoints > 0) && (
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200 text-[11px] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-bold">
                    {isMr ? 'उत्कृष्ट गुणवत्ता बोनस लागू!' : 'Quality Bonus Reward Applied!'}
                  </span>
                </div>
                <span className="font-black text-emerald-700 dark:text-emerald-300">
                  +₹{netQualityTenDayImpact.toLocaleString('en-IN')} {isMr ? '१० दिवसांचा जादा नफा' : '10-Day Extra Gain'}
                </span>
              </div>
            )}

            {/* Price Difference Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 text-[10px]">
                    <th className="pb-1.5 font-bold">{isMr ? 'घटक' : 'Parameter'}</th>
                    <th className="pb-1.5 font-bold">{isMr ? 'सध्याचे प्रमाण' : 'Actual'}</th>
                    <th className="pb-1.5 font-bold">{isMr ? 'पॉईंट फरक' : 'Point Diff.'}</th>
                    <th className="pb-1.5 font-bold">{isMr ? 'लागू दर पायरी' : 'Applied Step'}</th>
                    <th className="pb-1.5 font-bold text-right">{isMr ? 'दर फरक (₹/L)' : 'Price Diff.'}</th>
                    <th className="pb-1.5 font-bold text-right">{isMr ? '१० दिवसांचे बिल फरक' : '10-Day Impact'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 dark:divide-slate-700/60">
                  {/* Fat Row */}
                  <tr>
                    <td className="py-2 font-bold flex items-center gap-1">
                      <Percent className="w-3 h-3 text-emerald-600" />
                      <span>{isMr ? 'फॅट (Fat)' : 'Fat'}</span>
                    </td>
                    <td className="py-2 font-semibold">{fat.toFixed(1)}%</td>
                    <td className="py-2">
                      <span className={`font-bold ${fatDiffPoints >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {fatDiffPoints >= 0 ? `+${fatDiffPoints}` : `${fatDiffPoints}`} pts
                      </span>
                    </td>
                    <td className="py-2 text-[10px] text-slate-500">
                      {fatDiffPoints >= 0 ? `₹${fatIncrPoint.toFixed(2)} / pt bonus` : `₹${fatDecrPoint.toFixed(2)} / pt cut`}
                    </td>
                    <td className={`py-2 text-right font-black ${fatAdjustment >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {fatAdjustment >= 0 ? `+₹${fatAdjustment.toFixed(2)}` : `-₹${Math.abs(fatAdjustment).toFixed(2)}`}
                    </td>
                    <td className={`py-2 text-right font-bold ${fatAdjustment >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {fatAdjustment >= 0 
                        ? `+₹${(fatAdjustment * dailyLitres * 10).toLocaleString('en-IN', { maximumFractionDigits: 0 })}` 
                        : `-₹${Math.abs(fatAdjustment * dailyLitres * 10).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                    </td>
                  </tr>

                  {/* SNF Row */}
                  <tr>
                    <td className="py-2 font-bold flex items-center gap-1">
                      <Scale className="w-3 h-3 text-blue-600" />
                      <span>{isMr ? 'एस.एन.एफ. (SNF)' : 'SNF'}</span>
                    </td>
                    <td className="py-2 font-semibold">{snf.toFixed(1)}%</td>
                    <td className="py-2">
                      <span className={`font-bold ${snfDiffPoints >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
                        {snfDiffPoints >= 0 ? `+${snfDiffPoints}` : `${snfDiffPoints}`} pts
                      </span>
                    </td>
                    <td className="py-2 text-[10px] text-slate-500">
                      {snfDiffPoints >= 0 ? `₹${snfIncrPoint.toFixed(2)} / pt bonus` : `₹${snfDecrPoint.toFixed(2)} / pt cut`}
                    </td>
                    <td className={`py-2 text-right font-black ${snfAdjustment >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
                      {snfAdjustment >= 0 ? `+₹${snfAdjustment.toFixed(2)}` : `-₹${Math.abs(snfAdjustment).toFixed(2)}`}
                    </td>
                    <td className={`py-2 text-right font-bold ${snfAdjustment >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
                      {snfAdjustment >= 0 
                        ? `+₹${(snfAdjustment * dailyLitres * 10).toLocaleString('en-IN', { maximumFractionDigits: 0 })}` 
                        : `-₹${Math.abs(snfAdjustment * dailyLitres * 10).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                    </td>
                  </tr>

                  {/* Incentive Row */}
                  <tr>
                    <td className="py-2 font-bold flex items-center gap-1 text-amber-600">
                      <Sparkles className="w-3 h-3" />
                      <span>{isMr ? 'विशेष इन्सेंटिव्ह' : 'Incentive'}</span>
                    </td>
                    <td className="py-2 font-semibold">-</td>
                    <td className="py-2 text-slate-400">-</td>
                    <td className="py-2 text-[10px] text-slate-500">{isMr ? 'निश्चित प्रति लिटर' : 'Flat per litre'}</td>
                    <td className="py-2 text-right font-black text-amber-600">+₹{incentivePerLitre.toFixed(2)}</td>
                    <td className="py-2 text-right font-bold text-amber-600">
                      +₹{(incentivePerLitre * dailyLitres * 10).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Point Sensitivity Matrix Toggle & Content */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setShowSensitivityMatrix(!showSensitivityMatrix)}
                className="w-full py-1.5 px-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-between text-[11px] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isMr ? '📊 सर्व पॉईंट फरक (-५ ते +५ पॉईंट) दर व बिल सारणी पहा' : '📊 View Point Sensitivity Matrix (-5 to +5 pts)'}</span>
                </div>
                {showSensitivityMatrix ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showSensitivityMatrix && (
                <div className="mt-2.5 space-y-2">
                  <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                    <table className="w-full text-center text-[10px]">
                      <thead className="bg-slate-100 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          <th className="p-1.5">{isMr ? 'पॉईंट फरक' : 'Point Shift'}</th>
                          <th className="p-1.5">{isMr ? 'फॅट %' : 'Fat %'}</th>
                          <th className="p-1.5">{isMr ? 'लागू दर' : 'Rate (₹/L)'}</th>
                          <th className="p-1.5">{isMr ? 'दर फरक' : 'Rate Diff'}</th>
                          <th className="p-1.5 font-black">{isMr ? '१० दिवसांचे बिल' : '10-Day Bill'}</th>
                          <th className="p-1.5">{isMr ? 'निवड करा' : 'Apply'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/50 dark:divide-slate-700/50 bg-white dark:bg-slate-900">
                        {[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map(pt => {
                          const simFat = Number((baseFat + pt / 10).toFixed(1));
                          const simFatAdj = pt >= 0 ? pt * fatIncrPoint : pt * fatDecrPoint;
                          const simSnfAdj = snfAdjustment; // keeping current SNF for matrix
                          const simRate = Number((baseRate + incentivePerLitre + simFatAdj + simSnfAdj).toFixed(2));
                          const simTenDayBill = Number((simRate * dailyLitres * 10).toFixed(0));
                          const simTenDayImpact = Number(((simRate - baseOnlyRate) * dailyLitres * 10).toFixed(0));
                          const isCurrent = fatDiffPoints === pt;

                          return (
                            <tr
                              key={pt}
                              className={`transition-colors ${
                                isCurrent
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 font-bold text-emerald-900 dark:text-emerald-200'
                                  : pt < 0
                                  ? 'hover:bg-rose-50/40 dark:hover:bg-rose-950/20 text-slate-700 dark:text-slate-300'
                                  : pt === 0
                                  ? 'bg-slate-50 dark:bg-slate-800/40 font-semibold'
                                  : 'hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              <td className="p-1.5 font-bold">
                                {pt === 0 ? (isMr ? 'बेस (०)' : 'Base (0)') : pt > 0 ? `+${pt} pts` : `${pt} pts`}
                              </td>
                              <td className="p-1.5">{simFat.toFixed(1)}%</td>
                              <td className="p-1.5 font-black">₹{simRate.toFixed(2)}</td>
                              <td className={`p-1.5 font-bold ${pt >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {pt >= 0 ? `+₹${simFatAdj.toFixed(2)}` : `-₹${Math.abs(simFatAdj).toFixed(2)}`}
                              </td>
                              <td className="p-1.5 font-black">
                                ₹{simTenDayBill.toLocaleString('en-IN')}
                                {simTenDayImpact !== 0 && (
                                  <span className={`block text-[9px] font-normal ${simTenDayImpact > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    ({simTenDayImpact > 0 ? `+₹${simTenDayImpact}` : `-₹${Math.abs(simTenDayImpact)}`})
                                  </span>
                                )}
                              </td>
                              <td className="p-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleFatPointsChange(pt)}
                                  disabled={isCurrent}
                                  className={`px-2 py-0.5 rounded-md text-[9px] font-bold cursor-pointer transition-colors ${
                                    isCurrent
                                    ? 'bg-emerald-600 text-white cursor-default'
                                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                                  }`}
                                >
                                  {isCurrent ? (isMr ? 'लागू आहे' : 'Active') : (isMr ? 'लागू करा' : 'Select')}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Calculated Procurement Rate & Payout Highlight Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-tr from-emerald-700 via-emerald-800 to-teal-900 text-white shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-500/40 pb-3">
              <div>
                <span className="text-emerald-200 text-[10px] font-bold block uppercase tracking-wider">
                  {isMr ? 'गणना केलेला एकूण दूध खरेदी दर' : 'Calculated Final Procurement Rate'}
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black tracking-tight">₹{finalRatePerLitre.toFixed(2)}</span>
                  <span className="text-emerald-200 font-bold text-xs">/ {isMr ? 'लिटर (Incentive सह)' : 'Litre (incl. incentive)'}</span>
                </div>
              </div>

              <div className="flex items-center sm:flex-col sm:items-end justify-between text-left sm:text-right gap-1 bg-white/10 sm:bg-transparent p-2 sm:p-0 rounded-xl">
                <span className="text-emerald-200 text-[11px] font-medium">
                  {isMr ? 'एकूण घनता (TS):' : 'Total Solids:'} <strong className="text-white">{totalSolids}%</strong> ({fat.toFixed(1)}F + {snf.toFixed(1)}S)
                </span>
                <span className="text-xs font-black text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-lg border border-amber-300/30">
                  TS Rate: ₹{tsRate}/TS
                </span>
              </div>
            </div>

            {/* Formula Step-by-Step Breakdown Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div className="p-2 rounded-xl bg-white/10 backdrop-blur-xs">
                <span className="text-emerald-200 text-[10px] block">{isMr ? 'बेस दर' : 'Base Rate'}</span>
                <span className="font-bold">₹{baseRate.toFixed(2)}</span>
              </div>
              <div className="p-2 rounded-xl bg-white/10 backdrop-blur-xs">
                <span className="text-emerald-200 text-[10px] block">{isMr ? 'फॅट फरक' : 'Fat Diff.'}</span>
                <span className={`font-bold ${fatAdjustment >= 0 ? 'text-emerald-200' : 'text-rose-200'}`}>
                  {fatAdjustment >= 0 ? `+₹${fatAdjustment.toFixed(2)}` : `-₹${Math.abs(fatAdjustment).toFixed(2)}`}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-white/10 backdrop-blur-xs">
                <span className="text-emerald-200 text-[10px] block">{isMr ? 'SNF फरक' : 'SNF Diff.'}</span>
                <span className={`font-bold ${snfAdjustment >= 0 ? 'text-emerald-200' : 'text-rose-200'}`}>
                  {snfAdjustment >= 0 ? `+₹${snfAdjustment.toFixed(2)}` : `-₹${Math.abs(snfAdjustment).toFixed(2)}`}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-white/10 backdrop-blur-xs">
                <span className="text-emerald-200 text-[10px] block">{isMr ? 'इन्सेंटिव्ह' : 'Incentive'}</span>
                <span className="font-bold text-amber-300">+₹{incentivePerLitre.toFixed(2)}</span>
              </div>
            </div>

            {/* Payout Forecast Grid: Daily, 10-Day, Monthly with Base Comparison */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-xs">
                <span className="text-[10px] text-emerald-200 block">
                  {isMr ? 'दैनिक रक्कम' : 'Daily Payout'}
                </span>
                <span className="text-sm sm:text-base font-black">₹{dailyPayout.toLocaleString('en-IN')}</span>
                <span className="text-[9px] text-emerald-300 block">{dailyLitres} Ltr/day</span>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-400/20 border border-amber-300/40 backdrop-blur-xs shadow-xs">
                <span className="text-[10px] text-amber-200 block font-black">
                  ⭐ {isMr ? '१० दिवसांचे बिल' : '10-Day Payout'}
                </span>
                <span className="text-sm sm:text-base font-black text-amber-300">₹{tenDayBill.toLocaleString('en-IN')}</span>
                <span className="text-[9px] text-amber-200/80 block">{dailyLitres * 10} Ltr</span>
              </div>

              <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-xs">
                <span className="text-[10px] text-emerald-200 block">
                  {isMr ? 'मासिक उत्पन्न' : 'Monthly Est.'}
                </span>
                <span className="text-sm sm:text-base font-black">₹{monthlyPayout.toLocaleString('en-IN')}</span>
                <span className="text-[9px] text-emerald-300 block">{dailyLitres * 30} Ltr</span>
              </div>
            </div>

            {/* Payout Comparison against Standard Base Quality */}
            <div className="p-2.5 rounded-xl bg-black/20 text-[11px] flex items-center justify-between">
              <span className="text-emerald-100">
                {isMr ? 'प्रमाणित बेस गुणवत्तेवर १० दिवसांचे बिल:' : 'Standard Base Quality 10-Day Bill:'} <strong>₹{baseTenDayPayout.toLocaleString('en-IN')}</strong>
              </span>
              <span className={`font-black ${netQualityTenDayImpact >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                {netQualityTenDayImpact >= 0 
                  ? `+₹${netQualityTenDayImpact.toLocaleString('en-IN')} ${isMr ? 'जादा फायदा' : 'Gain'}`
                  : `-₹${Math.abs(netQualityTenDayImpact).toLocaleString('en-IN')} ${isMr ? 'नुकसान' : 'Loss'}`}
              </span>
            </div>
          </div>

          {/* Section 4: Competitor Price Difference Analysis (User Requested: Compare यामध्ये फॅट-SNF पॉईंट वाढ व रिव्हर्स कट तुलना) */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-600" />
                <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                  {isMr ? 'इतर खरेदीदार / खाजगी डेअरी तुलना (Competitor Analysis)' : 'Competitor Price Difference Analysis'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowCompetitorCompare(!showCompetitorCompare)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  showCompetitorCompare
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
                }`}
              >
                {showCompetitorCompare ? (isMr ? 'तुलना लपवा' : 'Hide Comparison') : (isMr ? 'तुलना करा (Compare)' : 'Compare')}
              </button>
            </div>

            {showCompetitorCompare && (
              <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                {/* Comparison Mode Toggle: Formula vs Flat */}
                <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 pl-2">
                    {isMr ? 'तुलना पद्धत:' : 'Compare Mode:'}
                  </span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setCompetitorCompareMode('formula')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                        competitorCompareMode === 'formula'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      {isMr ? 'पूर्ण चार्ट फॉर्म्युला' : 'Chart Formula'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setCompetitorCompareMode('flat')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                        competitorCompareMode === 'flat'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      {isMr ? 'थेट दर (Flat Rate)' : 'Flat Rate'}
                    </button>
                  </div>
                </div>

                {/* Formula Config Fields */}
                {competitorCompareMode === 'formula' ? (
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2.5">
                    <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 block">
                      {isMr ? 'इतर डेअरीची दर संरचना (Competitor Rate Chart):' : 'Competitor Chart Parameters:'}
                    </span>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">
                          {isMr ? 'बेस दर' : 'Base Rate'}
                        </span>
                        <input
                          type="number"
                          step="0.5"
                          value={compBaseRate}
                          onChange={e => setCompBaseRate(parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">
                          {isMr ? 'इन्सेंटिव्ह' : 'Incentive'}
                        </span>
                        <input
                          type="number"
                          step="0.25"
                          value={compIncentive}
                          onChange={e => setCompIncentive(parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">
                          {isMr ? 'फॅट वाढ पॉईंट' : 'Fat Incr Pt'}
                        </span>
                        <input
                          type="number"
                          step="0.05"
                          value={compFatIncrPoint}
                          onChange={e => setCompFatIncrPoint(parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">
                          {isMr ? 'फॅट रिव्हर्स कट' : 'Fat Decr Cut'}
                        </span>
                        <input
                          type="number"
                          step="0.05"
                          value={compFatDecrPoint}
                          onChange={e => setCompFatDecrPoint(parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs text-rose-500"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">
                          {isMr ? 'SNF वाढ पॉईंट' : 'SNF Incr Pt'}
                        </span>
                        <input
                          type="number"
                          step="0.05"
                          value={compSnfIncrPoint}
                          onChange={e => setCompSnfIncrPoint(parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">
                          {isMr ? 'SNF रिव्हर्स कट' : 'SNF Decr Cut'}
                        </span>
                        <input
                          type="number"
                          step="0.05"
                          value={compSnfDecrPoint}
                          onChange={e => setCompSnfDecrPoint(parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs text-rose-500"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">
                          {isMr ? 'बेस फॅट %' : 'Base Fat'}
                        </span>
                        <input
                          type="number"
                          step="0.1"
                          value={compBaseFat}
                          onChange={e => setCompBaseFat(parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">
                          {isMr ? 'बेस SNF %' : 'Base SNF'}
                        </span>
                        <input
                          type="number"
                          step="0.1"
                          value={compBaseSnf}
                          onChange={e => setCompBaseSnf(parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold block mb-1">
                        {isMr ? 'इतर डेअरीचा थेट लागू दर (₹/Ltr)' : 'Competitor Flat Milk Rate (₹/L)'}
                      </label>
                      <input
                        type="number"
                        step="0.25"
                        value={competitorFlatRate}
                        onChange={e => setCompetitorFlatRate(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-sm"
                      />
                    </div>
                  </div>
                )}

                {/* Comparative Gain Breakdown */}
                <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 border border-emerald-500/30 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">
                        {isMr ? 'इतर डेअरीचा दर' : 'Competitor Rate'}
                      </span>
                      <span className="text-base font-bold text-slate-700 dark:text-slate-300">
                        ₹{compRatePerLitre.toFixed(2)}/L
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">
                        {isMr ? 'आपला दर फायदा (प्रति लिटर)' : 'Rate Advantage'}
                      </span>
                      <span className={`text-lg font-black ${rateDiffPerLitre >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {rateDiffPerLitre >= 0 ? `+₹${rateDiffPerLitre.toFixed(2)}/L` : `-₹${Math.abs(rateDiffPerLitre).toFixed(2)}/L`}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-emerald-500/20 text-center">
                    <div className="p-2 rounded-xl bg-white/60 dark:bg-slate-900/60">
                      <span className="text-[10px] text-slate-500 block font-semibold">
                        {isMr ? '१० दिवसांचा जादा नफा' : '10-Day Extra Gain'}
                      </span>
                      <span className={`text-sm font-black ${tenDayBenefit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                        {tenDayBenefit >= 0 ? `+₹${tenDayBenefit.toLocaleString('en-IN')}` : `-₹${Math.abs(tenDayBenefit).toLocaleString('en-IN')}`}
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-white/60 dark:bg-slate-900/60">
                      <span className="text-[10px] text-slate-500 block font-semibold">
                        {isMr ? 'मासिक जादा नफा' : 'Monthly Extra Gain'}
                      </span>
                      <span className={`text-sm font-black ${monthlyBenefit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                        {monthlyBenefit >= 0 ? `+₹${monthlyBenefit.toLocaleString('en-IN')}` : `-₹${Math.abs(monthlyBenefit).toLocaleString('en-IN')}`}
                      </span>
                    </div>
                  </div>

                  {tenDayBenefit > 0 && (
                    <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 text-[11px] flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        {isMr
                          ? `गवळ्याला आपल्याकडे १० दिवसांच्या प्रत्येक बिलात ₹${tenDayBenefit.toLocaleString('en-IN')} चा थेट जादा फायदा होतो. ही अचूक आकडेवारी वाटाघाटीत सांगा!`
                          : `Farmer earns ₹${tenDayBenefit.toLocaleString('en-IN')} extra in every 10-day payment cycle with us!`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer / Actions */}
        <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-800/90 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2.5 shrink-0 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold flex items-center gap-1.5 transition-colors cursor-pointer text-xs"
            >
              <X className="w-4 h-4 text-slate-500" />
              <span>{isMr ? 'बंद करा (Close)' : 'Close'}</span>
            </button>
            <button
              type="button"
              onClick={handleCopyQuote}
              className="px-3.5 sm:px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold flex items-center gap-1.5 border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer text-xs"
            >
              {copiedQuote ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              <span>{copiedQuote ? (isMr ? 'कॉपी झाले!' : 'Copied!') : (isMr ? 'तपशील कॉपी' : 'Copy Slip')}</span>
            </button>
          </div>

          <a
            href={`https://wa.me/?text=${encodeURIComponent(getWhatsAppQuotation())}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 sm:px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-2 shadow-md shadow-emerald-600/25 transition-all cursor-pointer text-xs ml-auto"
          >
            <span>{isMr ? 'गवळ्याला व्हॉट्सॲपवर पाठवा' : 'Share on WhatsApp'}</span>
          </a>
        </div>
      </div>
    </div>
  );
};
