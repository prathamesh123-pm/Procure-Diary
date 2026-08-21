import React, { useState } from 'react';
import { X, Building2, Save, AlertTriangle, ShieldAlert, Award, TrendingUp } from 'lucide-react';
import { CompetitorDairy } from '../../types';
import { MPOStorageService } from '../../services/mpoStorageService';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';

interface CompetitorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  competitorToEdit?: CompetitorDairy | null;
  onSaved: () => void;
}

export const CompetitorFormModal: React.FC<CompetitorFormModalProps> = ({
  isOpen,
  onClose,
  competitorToEdit,
  onSaved,
}) => {
  const { currentUser } = useAuth();
  const { language } = useLanguage();
  const isMr = language === 'mr';
  const { showToast } = useToast();

  const [dairyName, setDairyName] = useState(competitorToEdit?.dairyName || '');
  const [operatingVillages, setOperatingVillages] = useState(competitorToEdit?.operatingVillages?.join(', ') || '');
  const [routes, setRoutes] = useState(competitorToEdit?.routes?.join(', ') || 'RT-101, RT-104');
  const [cowRate, setCowRate] = useState(competitorToEdit?.cowRatePerFatSnf || '₹38.00 @ 3.5/8.5');
  const [buffaloRate, setBuffaloRate] = useState(competitorToEdit?.buffaloRatePerFatSnf || '₹53.00 @ 6.0/9.0');
  const [paymentCycle, setPaymentCycle] = useState<CompetitorDairy['paymentCycle']>(
    competitorToEdit?.paymentCycle || '10 Days'
  );
  const [incentivesOffered, setIncentivesOffered] = useState(
    competitorToEdit?.incentivesOffered || 'दिवाळी बोनस ₹२.००/लिटर'
  );
  const [cattleFeedCredit, setCattleFeedCredit] = useState(
    competitorToEdit?.cattleFeedCredit || '३० दिवस दूध बिल कपात सवलत'
  );
  const [activeCentersCount, setActiveCentersCount] = useState(competitorToEdit?.activeCollectionCentersCount || 5);
  const [threatLevel, setThreatLevel] = useState<CompetitorDairy['threatLevel']>(
    competitorToEdit?.threatLevel || 'Medium'
  );
  const [keyWeaknesses, setKeyWeaknesses] = useState(
    competitorToEdit?.keyWeaknesses || 'कडक गुणवत्ता तपासणी, उशिरा पेमेंट'
  );
  const [ourCounterStrategy, setOurCounterStrategy] = useState(
    competitorToEdit?.ourCounterStrategy || '१० दिवसांचे वेळेवर थेट बँक पेमेंट व बोनस अग्रिम'
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dairyName.trim()) {
      showToast(isMr ? 'कृपया स्पर्धक डेअरीचे नाव टाका' : 'Please enter competitor dairy name', 'error');
      return;
    }

    const compObj: CompetitorDairy = {
      id: competitorToEdit?.id || `COMP-${Date.now()}`,
      dairyName,
      operatingVillages: operatingVillages.split(',').map(s => s.trim()).filter(Boolean),
      routes: routes.split(',').map(s => s.trim()).filter(Boolean),
      cowRatePerFatSnf: cowRate,
      buffaloRatePerFatSnf: buffaloRate,
      paymentCycle,
      incentivesOffered,
      cattleFeedCredit,
      activeCollectionCentersCount: Number(activeCentersCount) || 0,
      threatLevel,
      keyWeaknesses,
      ourCounterStrategy,
      lastUpdatedDate: new Date().toISOString().split('T')[0],
      updatedBy: currentUser?.name || 'प्रमोद सावंत',
      createdAt: competitorToEdit?.createdAt || new Date().toISOString(),
    };

    MPOStorageService.saveCompetitor(compObj);
    showToast(isMr ? 'स्पर्धक डेअरी माहिती जतन झाली' : 'Competitor info saved', 'success');
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-red-700 to-rose-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <ShieldAlert className="w-5 h-5 text-rose-200" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">
                {competitorToEdit ? (isMr ? 'स्पर्धक डेअरी माहिती संपादन' : 'Edit Competitor Dairy') : (isMr ? 'नवीन स्पर्धक डेअरी नोंदवा' : 'Add Competitor Dairy')}
              </h3>
              <p className="text-xs text-rose-200">
                {isMr ? 'दर, योजना, कमतरता व ग्राहक टिकवून ठेवण्याची रणनीती' : 'Rates, Schemes, Weaknesses & Counter-Strategy'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-rose-200 hover:text-white hover:bg-white/10 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Dairy Name */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isMr ? 'स्पर्धक डेअरी नाव (Competitor Dairy Name)' : 'Dairy Name'} *
              </label>
              <input
                type="text"
                value={dairyName}
                onChange={e => setDairyName(e.target.value)}
                required
                placeholder="उदा. गोकुळ दूध संघ, चितळे डेअरी, अमूल"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
              />
            </div>

            {/* Threat Level */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isMr ? 'स्पर्धा धोका पातळी (Threat Level)' : 'Threat Level'}
              </label>
              <select
                value={threatLevel}
                onChange={e => setThreatLevel(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
              >
                <option value="Critical">अत्यंत गंभीर (Critical Risk)</option>
                <option value="High">जास्त स्पर्धा (High Threat)</option>
                <option value="Medium">मध्यम (Medium Threat)</option>
                <option value="Low">कमी (Low Threat)</option>
              </select>
            </div>

            {/* Rates */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isMr ? 'गाय दूध खरेदी दर (Cow Rate @ Fat/SNF)' : 'Cow Milk Rate'}
              </label>
              <input
                type="text"
                value={cowRate}
                onChange={e => setCowRate(e.target.value)}
                placeholder="₹38.00 @ 3.5/8.5"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-blue-600 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isMr ? 'म्हैस दूध खरेदी दर (Buffalo Rate @ Fat/SNF)' : 'Buffalo Milk Rate'}
              </label>
              <input
                type="text"
                value={buffaloRate}
                onChange={e => setBuffaloRate(e.target.value)}
                placeholder="₹53.00 @ 6.0/9.0"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-purple-600 font-bold"
              />
            </div>

            {/* Payment Cycle & Centers */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isMr ? 'पेमेंट कालावधी (Payment Cycle)' : 'Payment Cycle'}
              </label>
              <select
                value={paymentCycle}
                onChange={e => setPaymentCycle(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              >
                <option value="10 Days">१० दिवसांचे पेमेंट (10 Days)</option>
                <option value="Weekly">साप्ताहिक (Weekly)</option>
                <option value="15 Days">१५ दिवसांचे (15 Days)</option>
                <option value="Monthly">मासिक (Monthly)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isMr ? 'परिसरातील सक्रिय केंद्रे संख्या' : 'Active Collection Centers'}
              </label>
              <input
                type="number"
                value={activeCentersCount}
                onChange={e => setActiveCentersCount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
              />
            </div>

            {/* Operating Villages */}
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isMr ? 'कार्यक्षेत्र गावे (Operating Villages - स्वल्पविरामाने वेगळे करा)' : 'Operating Villages'}
              </label>
              <input
                type="text"
                value={operatingVillages}
                onChange={e => setOperatingVillages(e.target.value)}
                placeholder="कवठेपिरान, बहे, ताकारी, भिलवडी"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>

            {/* Incentives & Feed */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isMr ? 'दिल्या जाणाऱ्या सवलती व बोनस (Incentives)' : 'Incentives / Bonus'}
              </label>
              <textarea
                rows={2}
                value={incentivesOffered}
                onChange={e => setIncentivesOffered(e.target.value)}
                placeholder="दिवाळी बोनस ₹२.००/लिटर, मोफत पशुवैद्यकीय औषधे"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isMr ? 'पशुखाद्य सवलत / उधारी धोरण (Feed Credit)' : 'Feed Credit Policy'}
              </label>
              <textarea
                rows={2}
                value={cattleFeedCredit}
                onChange={e => setCattleFeedCredit(e.target.value)}
                placeholder="पशुखाद्य १ महिना बिल कपात सवलत"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>

            {/* Weaknesses & Our Strategy */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isMr ? 'त्यांची मुख्य कमतरता (Competitor Weaknesses)' : 'Key Weaknesses'}
              </label>
              <textarea
                rows={2}
                value={keyWeaknesses}
                onChange={e => setKeyWeaknesses(e.target.value)}
                placeholder="पेमेंट उशिरा होणे, फॅट कपात जास्त करणे"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isMr ? 'आपली प्रति-रणनीती (Our Counter Strategy)' : 'Our Counter Strategy'}
              </label>
              <textarea
                rows={2}
                value={ourCounterStrategy}
                onChange={e => setOurCounterStrategy(e.target.value)}
                placeholder="१० दिवसांचे थेट बँक पेमेंट व उत्पादकांना घरपोच पशुखाद्य"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
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
              className="px-5 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isMr ? 'माहिती जतन करा' : 'Save Competitor'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
