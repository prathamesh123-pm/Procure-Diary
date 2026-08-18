import React, { useState, useEffect } from 'react';
import {
  Users,
  X,
  CheckCircle2,
  Milk,
  MapPin,
  Phone,
  Building,
  ShieldCheck,
  Tag,
  CreditCard,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Farmer, MilkType, FarmerStatus, RouteItem } from '../../types';
import { StorageService } from '../../services/storageService';
import { useLanguage } from '../../context/LanguageContext';

interface FarmerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  farmerToEdit?: Farmer | null;
  onSaved: (farmer: Farmer) => void;
}

export const FarmerFormModal: React.FC<FarmerFormModalProps> = ({
  isOpen,
  onClose,
  farmerToEdit,
  onSaved,
}) => {
  const { language, t } = useLanguage();
  const isMr = language === 'mr';

  const [routes, setRoutes] = useState<RouteItem[]>([]);

  // Form Fields
  const [farmerCode, setFarmerCode] = useState('');
  const [farmerName, setFarmerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [alternateNumber, setAlternateNumber] = useState('');
  const [village, setVillage] = useState('');
  const [route, setRoute] = useState('RT-101');
  const [routeGroupName, setRouteGroupName] = useState('');
  const [collectionCenter, setCollectionCenter] = useState('');
  const [milkType, setMilkType] = useState<MilkType>('Cow');
  const [dailyMilkQuantity, setDailyMilkQuantity] = useState(25);
  const [morningMilkQty, setMorningMilkQty] = useState(15);
  const [eveningMilkQty, setEveningMilkQty] = useState(10);
  const [avgFat, setAvgFat] = useState<number>(3.8);
  const [avgSNF, setAvgSNF] = useState<number>(8.5);
  const [currentRate, setCurrentRate] = useState<number>(39.5);
  const [cattleCount, setCattleCount] = useState<number>(5);
  const [advanceBalance, setAdvanceBalance] = useState<number>(0);
  const [status, setStatus] = useState<FarmerStatus>('Active');
  const [remarks, setRemarks] = useState('');
  const [address, setAddress] = useState('');

  // FSSAI & Regulatory Fields
  const [fssaiNumber, setFssaiNumber] = useState('');
  const [fssaiExpiryDate, setFssaiExpiryDate] = useState('');
  const [fssaiStatus, setFssaiStatus] = useState<'Active' | 'Pending' | 'Expiring Soon' | 'Not Applied'>('Active');
  const [inaphTags, setInaphTags] = useState('');
  const [cleanMilkCert, setCleanMilkCert] = useState(true);
  const [vaccinationStatus, setVaccinationStatus] = useState<'Fully Vaccinated' | 'Partially Vaccinated' | 'Due for FMD' | 'Due for Lumpy'>('Fully Vaccinated');

  // Bank details
  const [bankName, setBankName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');

  useEffect(() => {
    if (isOpen) {
      const r = StorageService.getRoutes();
      setRoutes(r);

      if (farmerToEdit) {
        setFarmerCode(farmerToEdit.farmerCode);
        setFarmerName(farmerToEdit.farmerName);
        setMobileNumber(farmerToEdit.mobileNumber);
        setAlternateNumber(farmerToEdit.alternateNumber || '');
        setVillage(farmerToEdit.village);
        setRoute(farmerToEdit.route);
        setRouteGroupName(farmerToEdit.routeGroupName || '');
        setCollectionCenter(farmerToEdit.collectionCenter);
        setMilkType(farmerToEdit.milkType);
        setDailyMilkQuantity(farmerToEdit.dailyMilkQuantity);
        setMorningMilkQty(farmerToEdit.morningMilkQty || Math.round(farmerToEdit.dailyMilkQuantity * 0.55));
        setEveningMilkQty(farmerToEdit.eveningMilkQty || Math.round(farmerToEdit.dailyMilkQuantity * 0.45));
        setAvgFat(farmerToEdit.avgFat || (farmerToEdit.milkType === 'Buffalo' ? 6.8 : 3.8));
        setAvgSNF(farmerToEdit.avgSNF || (farmerToEdit.milkType === 'Buffalo' ? 9.0 : 8.5));
        setCurrentRate(farmerToEdit.currentRate || (farmerToEdit.milkType === 'Buffalo' ? 68 : 39.5));
        setCattleCount(farmerToEdit.cattleCount || 4);
        setAdvanceBalance(farmerToEdit.advanceBalance || 0);
        setStatus(farmerToEdit.status);
        setRemarks(farmerToEdit.remarks || '');
        setAddress(farmerToEdit.address || '');

        // FSSAI & Regulatory
        setFssaiNumber(farmerToEdit.fssaiNumber || '');
        setFssaiExpiryDate(farmerToEdit.fssaiExpiryDate || '2027-12-31');
        setFssaiStatus(farmerToEdit.fssaiStatus || 'Active');
        setInaphTags((farmerToEdit.inaphTagNumbers || []).join(', '));
        setCleanMilkCert(farmerToEdit.cleanMilkCert ?? true);
        setVaccinationStatus(farmerToEdit.vaccinationStatus || 'Fully Vaccinated');

        // Bank
        setBankName(farmerToEdit.bankName || 'Bank of Maharashtra');
        setBankAccountNumber(farmerToEdit.bankAccountNumber || '');
        setIfscCode(farmerToEdit.ifscCode || '');
        setAadhaarNumber(farmerToEdit.aadhaarNumber || '');
      } else {
        const nextCode = `G-${Math.floor(100 + Math.random() * 900)}`;
        setFarmerCode(nextCode);
        setFarmerName('');
        setMobileNumber('');
        setAlternateNumber('');
        setVillage('');
        setRoute(r[0]?.routeNumber || 'RT-101');
        setRouteGroupName('');
        setCollectionCenter('');
        setMilkType('Cow');
        setDailyMilkQuantity(25);
        setMorningMilkQty(15);
        setEveningMilkQty(10);
        setAvgFat(3.8);
        setAvgSNF(8.5);
        setCurrentRate(39.5);
        setCattleCount(5);
        setAdvanceBalance(0);
        setStatus('Active');
        setRemarks('');
        setAddress('');

        // FSSAI defaults
        setFssaiNumber(`1152403600${Math.floor(1000 + Math.random() * 9000)}`);
        setFssaiExpiryDate('2028-06-30');
        setFssaiStatus('Active');
        setInaphTags(`100234${Math.floor(100000 + Math.random() * 900000)}, 100234${Math.floor(100000 + Math.random() * 900000)}`);
        setCleanMilkCert(true);
        setVaccinationStatus('Fully Vaccinated');

        // Bank defaults
        setBankName('Bank of Maharashtra');
        setBankAccountNumber('');
        setIfscCode('MAHB0000123');
        setAadhaarNumber('');
      }
    }
  }, [isOpen, farmerToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!farmerName.trim() || !mobileNumber.trim()) {
      alert(isMr ? 'कृपया गवळ्याचे नाव आणि मोबाईल नंबर टाका.' : 'Please enter Gavali name and mobile number.');
      return;
    }

    const tagArray = inaphTags
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const savedFarmer: Farmer = {
      id: farmerToEdit ? farmerToEdit.id : `FARMER-${Date.now()}`,
      farmerCode: farmerCode.trim() || `G-${Date.now().toString().slice(-4)}`,
      farmerName: farmerName.trim(),
      mobileNumber: mobileNumber.trim(),
      alternateNumber: alternateNumber.trim(),
      village: village.trim() || 'Sangli',
      route,
      routeGroupName: routeGroupName.trim() || undefined,
      collectionCenter: collectionCenter.trim() || `${village || 'Main'} Center`,
      milkType,
      supplierType: 'Gavali',
      dailyMilkQuantity: Number(dailyMilkQuantity) || 0,
      morningMilkQty: Number(morningMilkQty) || 0,
      eveningMilkQty: Number(eveningMilkQty) || 0,
      avgFat: Number(avgFat) || 3.8,
      avgSNF: Number(avgSNF) || 8.5,
      currentRate: Number(currentRate) || 39.5,
      cattleCount: Number(cattleCount) || 1,
      advanceBalance: Number(advanceBalance) || 0,
      status,
      remarks: remarks.trim(),
      address: address.trim(),
      isFavorite: farmerToEdit ? farmerToEdit.isFavorite : false,
      // FSSAI & Regulatory
      fssaiNumber: fssaiNumber.trim(),
      fssaiExpiryDate: fssaiExpiryDate || '2028-12-31',
      fssaiStatus,
      inaphTagNumbers: tagArray,
      cleanMilkCert,
      vaccinationStatus,
      // Bank
      bankName: bankName.trim(),
      bankAccountNumber: bankAccountNumber.trim(),
      ifscCode: ifscCode.trim(),
      aadhaarNumber: aadhaarNumber.trim(),
      createdAt: farmerToEdit ? farmerToEdit.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    StorageService.saveFarmer(savedFarmer);
    onSaved(savedFarmer);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 my-auto max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {farmerToEdit
                  ? (isMr ? 'गवळी / दूध उत्पादक माहिती संपादन' : 'Edit Gavali / Farmer Profile')
                  : (isMr ? 'नवीन गवळी / दूध उत्पादक नोंदणी' : 'Register New Gavali / Producer')}
              </h3>
              <p className="text-xs text-slate-500">
                {isMr ? 'दुधाचे संकलन, FSSAI परवाना व बँक तपशील भरा' : 'Milk volume, FSSAI license & banking details'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* SECTION 1: प्राथमिक ओळख व संपर्क (Basic Identity) */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-xs">
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isMr ? '१. वैयक्तिक व संपर्क माहिती' : '1. Personal & Contact Details'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">{t('farmer.code')} *</label>
                <input
                  type="text"
                  value={farmerCode}
                  onChange={e => setFarmerCode(e.target.value)}
                  placeholder="G-101"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">{t('farmer.name')} *</label>
                <input
                  type="text"
                  value={farmerName}
                  onChange={e => setFarmerName(e.target.value)}
                  placeholder={isMr ? 'उदा. आनंदराव यशवंत सावंत' : 'e.g. Anandrao Sawant'}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">{t('farmer.mobile')} *</label>
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={e => setMobileNumber(e.target.value)}
                  placeholder="9822XXXXXX"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">{t('farmer.alt_mobile')}</label>
                <input
                  type="tel"
                  value={alternateNumber}
                  onChange={e => setAlternateNumber(e.target.value)}
                  placeholder="9422XXXXXX"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">{t('farmer.route')} *</label>
                <select
                  value={route}
                  onChange={e => setRoute(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium cursor-pointer"
                >
                  {routes.map(r => (
                    <option key={r.id} value={r.routeNumber}>
                      {r.routeNumber} - {r.routeName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">{t('farmer.village')} *</label>
                <input
                  type="text"
                  value={village}
                  onChange={e => setVillage(e.target.value)}
                  placeholder="उदा. वाळवा"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">{t('farmer.center')}</label>
                <input
                  type="text"
                  value={collectionCenter}
                  onChange={e => setCollectionCenter(e.target.value)}
                  placeholder="उदा. वाळवा केंद्र १"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: दुधाची माहिती (Milk Production, Quality & Rate) */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-xs">
              <Milk className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isMr ? '२. दुधाची माहिती व संकलन तपशील' : '2. Milk Production & Quality'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">{t('farmer.milk_type')}</label>
                <select
                  value={milkType}
                  onChange={e => setMilkType(e.target.value as MilkType)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold cursor-pointer"
                >
                  <option value="Cow">{isMr ? 'गायीचे दूध (Cow)' : 'Cow Milk'}</option>
                  <option value="Buffalo">{isMr ? 'म्हशीचे दूध (Buffalo)' : 'Buffalo Milk'}</option>
                  <option value="Both">{isMr ? 'दोन्ही (Both)' : 'Both'}</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">{isMr ? 'दैनिक एकूण (L)' : 'Total Daily (L)'}</label>
                <input
                  type="number"
                  value={dailyMilkQuantity}
                  onChange={e => {
                    const total = Number(e.target.value);
                    setDailyMilkQuantity(total);
                    setMorningMilkQty(Math.round(total * 0.55));
                    setEveningMilkQty(Math.round(total * 0.45));
                  }}
                  min={0}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">{isMr ? 'सकाळ (L)' : 'Morning (L)'}</label>
                <input
                  type="number"
                  value={morningMilkQty}
                  onChange={e => setMorningMilkQty(Number(e.target.value))}
                  min={0}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">{isMr ? 'संध्याकाळ (L)' : 'Evening (L)'}</label>
                <input
                  type="number"
                  value={eveningMilkQty}
                  onChange={e => setEveningMilkQty(Number(e.target.value))}
                  min={0}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">{isMr ? 'सरासरी FAT %' : 'Avg FAT %'}</label>
                <input
                  type="number"
                  step="0.1"
                  value={avgFat}
                  onChange={e => setAvgFat(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">{isMr ? 'सरासरी SNF %' : 'Avg SNF %'}</label>
                <input
                  type="number"
                  step="0.1"
                  value={avgSNF}
                  onChange={e => setAvgSNF(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">{isMr ? 'चालू दर (₹/L)' : 'Rate (₹/L)'}</label>
                <input
                  type="number"
                  step="0.1"
                  value={currentRate}
                  onChange={e => setCurrentRate(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-emerald-700"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">{isMr ? 'जनावरे संख्या' : 'Cattle Count'}</label>
                <input
                  type="number"
                  value={cattleCount}
                  onChange={e => setCattleCount(Number(e.target.value))}
                  min={1}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: FSSAI परवाना व शासकीय नोंदणी (FSSAI License & Regulatory) */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>{isMr ? '३. FSSAI परवाना व शासकीय नोंदणी' : '3. FSSAI License & Animal Tags'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">{isMr ? 'FSSAI परवाना क्र.' : 'FSSAI License No.'}</label>
                <input
                  type="text"
                  value={fssaiNumber}
                  onChange={e => setFssaiNumber(e.target.value)}
                  placeholder="11524036000123"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">{isMr ? 'परवाना वैधता तारीख' : 'License Expiry'}</label>
                <input
                  type="date"
                  value={fssaiExpiryDate}
                  onChange={e => setFssaiExpiryDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">{isMr ? 'FSSAI स्थिती' : 'FSSAI Status'}</label>
                <select
                  value={fssaiStatus}
                  onChange={e => setFssaiStatus(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium cursor-pointer"
                >
                  <option value="Active">{isMr ? 'वैध (Active)' : 'Active'}</option>
                  <option value="Pending">{isMr ? 'प्रलंबित (Pending)' : 'Pending'}</option>
                  <option value="Expiring Soon">{isMr ? 'संपत आलेला (Expiring Soon)' : 'Expiring Soon'}</option>
                  <option value="Not Applied">{isMr ? 'अर्ज केलेला नाही (Not Applied)' : 'Not Applied'}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">{isMr ? 'INAPH पशु कानपट्टी टॅग क्रमांक' : 'INAPH Cattle Ear Tags'}</label>
                <input
                  type="text"
                  value={inaphTags}
                  onChange={e => setInaphTags(e.target.value)}
                  placeholder="उदा. 100234567891, 100234567892"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">{isMr ? 'लसीकरण स्थिती' : 'Vaccination Status'}</label>
                <select
                  value={vaccinationStatus}
                  onChange={e => setVaccinationStatus(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white cursor-pointer"
                >
                  <option value="Fully Vaccinated">{isMr ? 'पूर्ण लसीकरण (Fully Vaccinated)' : 'Fully Vaccinated'}</option>
                  <option value="Partially Vaccinated">{isMr ? 'अंशतः (Partially Vaccinated)' : 'Partially Vaccinated'}</option>
                  <option value="Due for FMD">{isMr ? 'खुरकूत लस बाकी (Due for FMD)' : 'Due for FMD'}</option>
                  <option value="Due for Lumpy">{isMr ? 'लंपी लस बाकी (Due for Lumpy)' : 'Due for Lumpy'}</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 4: बँक व आर्थिक तपशील (Banking & Advance) */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-xs">
              <CreditCard className="w-3.5 h-3.5 text-purple-600" />
              <span>{isMr ? '४. बँक खाते व उचल तपशील' : '4. Bank Details & Advance Loan'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">{isMr ? 'बँकेचे नाव' : 'Bank Name'}</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={e => setBankName(e.target.value)}
                  placeholder="उदा. Sangli DCC Bank"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">{isMr ? 'खाते क्रमांक' : 'Account No.'}</label>
                <input
                  type="text"
                  value={bankAccountNumber}
                  onChange={e => setBankAccountNumber(e.target.value)}
                  placeholder="60123456789"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">{isMr ? 'उचल / अ‍ॅडव्हान्स शिल्लक (₹)' : 'Advance Balance (₹)'}</label>
                <input
                  type="number"
                  value={advanceBalance}
                  onChange={e => setAdvanceBalance(Number(e.target.value))}
                  min={0}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-amber-600"
                />
              </div>
            </div>
          </div>

          {/* Status & Remarks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">{t('farmer.status')}</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as FarmerStatus)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold cursor-pointer"
              >
                <option value="Active">Active (नियमित पुरवठादार)</option>
                <option value="Irregular">Irregular (अनियमित)</option>
                <option value="Stopped">Stopped (दूध पुरवठा बंद)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">{t('farmer.remarks')}</label>
              <input
                type="text"
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                placeholder={isMr ? 'टीप किंवा विशेष सूचना...' : 'Notes or special instructions...'}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold rounded-2xl cursor-pointer"
            >
              {t('btn.cancel')}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{t('btn.save')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
