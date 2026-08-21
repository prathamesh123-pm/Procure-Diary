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
  Calculator,
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

  // Section 1: Form Identity & Contact Fields
  const [farmerCode, setFarmerCode] = useState('');
  const [farmerName, setFarmerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [alternateNumber, setAlternateNumber] = useState('');
  const [village, setVillage] = useState('');
  const [route, setRoute] = useState('RT-101');
  const [routeGroupName, setRouteGroupName] = useState('');
  const [collectionCenter, setCollectionCenter] = useState('');

  // Section 2: Milk Type Selector ('Cow' | 'Buffalo' | 'Both')
  const [milkType, setMilkType] = useState<MilkType>('Cow');

  // Cow Milk Specific Details
  const [cowLitres, setCowLitres] = useState<number>(25);
  const [cowMorningQty, setCowMorningQty] = useState<number>(15);
  const [cowEveningQty, setCowEveningQty] = useState<number>(10);
  const [cowFat, setCowFat] = useState<number>(3.8);
  const [cowSNF, setCowSNF] = useState<number>(8.5);
  const [cowRate, setCowRate] = useState<number>(39.5);
  const [cowCattleCount, setCowCattleCount] = useState<number>(4);

  // Buffalo Milk Specific Details
  const [buffaloLitres, setBuffaloLitres] = useState<number>(20);
  const [buffaloMorningQty, setBuffaloMorningQty] = useState<number>(12);
  const [buffaloEveningQty, setBuffaloEveningQty] = useState<number>(8);
  const [buffaloFat, setBuffaloFat] = useState<number>(7.0);
  const [buffaloSNF, setBuffaloSNF] = useState<number>(9.0);
  const [buffaloRate, setBuffaloRate] = useState<number>(72.5);
  const [buffaloCattleCount, setBuffaloCattleCount] = useState<number>(3);

  // Advance & Status
  const [advanceBalance, setAdvanceBalance] = useState<number>(0);
  const [status, setStatus] = useState<FarmerStatus>('Active');
  const [remarks, setRemarks] = useState('');
  const [address, setAddress] = useState('');

  // Section 3: FSSAI & Regulatory Fields
  const [fssaiNumber, setFssaiNumber] = useState('');
  const [fssaiExpiryDate, setFssaiExpiryDate] = useState('');
  const [fssaiStatus, setFssaiStatus] = useState<'Active' | 'Pending' | 'Expiring Soon' | 'Not Applied'>('Active');
  const [inaphTags, setInaphTags] = useState('');
  const [cleanMilkCert, setCleanMilkCert] = useState(true);
  const [vaccinationStatus, setVaccinationStatus] = useState<'Fully Vaccinated' | 'Partially Vaccinated' | 'Due for FMD' | 'Due for Lumpy'>('Fully Vaccinated');

  // Section 4: Bank details
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

        // Load Cow data
        if (farmerToEdit.milkType === 'Cow') {
          const cTotal = farmerToEdit.cowLitres ?? farmerToEdit.dailyMilkQuantity ?? 25;
          setCowLitres(cTotal);
          setCowMorningQty(farmerToEdit.cowMorningQty ?? farmerToEdit.morningMilkQty ?? Math.round(cTotal * 0.55));
          setCowEveningQty(farmerToEdit.cowEveningQty ?? farmerToEdit.eveningMilkQty ?? Math.round(cTotal * 0.45));
          setCowFat(farmerToEdit.cowFat ?? farmerToEdit.avgFat ?? 3.8);
          setCowSNF(farmerToEdit.cowSNF ?? farmerToEdit.avgSNF ?? 8.5);
          setCowRate(farmerToEdit.cowRate ?? farmerToEdit.currentRate ?? 39.5);
          setCowCattleCount(farmerToEdit.cowCattleCount ?? farmerToEdit.cattleCount ?? 4);

          // Buffalo defaults
          setBuffaloLitres(farmerToEdit.buffaloLitres || 15);
          setBuffaloMorningQty(farmerToEdit.buffaloMorningQty || 9);
          setBuffaloEveningQty(farmerToEdit.buffaloEveningQty || 6);
          setBuffaloFat(farmerToEdit.buffaloFat || 7.0);
          setBuffaloSNF(farmerToEdit.buffaloSNF || 9.0);
          setBuffaloRate(farmerToEdit.buffaloRate || 72.5);
          setBuffaloCattleCount(farmerToEdit.buffaloCattleCount || 2);
        } else if (farmerToEdit.milkType === 'Buffalo') {
          const bTotal = farmerToEdit.buffaloLitres ?? farmerToEdit.dailyMilkQuantity ?? 20;
          setBuffaloLitres(bTotal);
          setBuffaloMorningQty(farmerToEdit.buffaloMorningQty ?? farmerToEdit.morningMilkQty ?? Math.round(bTotal * 0.55));
          setBuffaloEveningQty(farmerToEdit.buffaloEveningQty ?? farmerToEdit.eveningMilkQty ?? Math.round(bTotal * 0.45));
          setBuffaloFat(farmerToEdit.buffaloFat ?? farmerToEdit.avgFat ?? 7.0);
          setBuffaloSNF(farmerToEdit.buffaloSNF ?? farmerToEdit.avgSNF ?? 9.0);
          setBuffaloRate(farmerToEdit.buffaloRate ?? farmerToEdit.currentRate ?? 72.5);
          setBuffaloCattleCount(farmerToEdit.buffaloCattleCount ?? farmerToEdit.cattleCount ?? 3);

          // Cow defaults
          setCowLitres(farmerToEdit.cowLitres || 20);
          setCowMorningQty(farmerToEdit.cowMorningQty || 12);
          setCowEveningQty(farmerToEdit.cowEveningQty || 8);
          setCowFat(farmerToEdit.cowFat || 3.8);
          setCowSNF(farmerToEdit.cowSNF || 8.5);
          setCowRate(farmerToEdit.cowRate || 39.5);
          setCowCattleCount(farmerToEdit.cowCattleCount || 3);
        } else {
          // 'Both'
          const cTotal = farmerToEdit.cowLitres ?? Math.round((farmerToEdit.dailyMilkQuantity || 40) * 0.6);
          const bTotal = farmerToEdit.buffaloLitres ?? Math.round((farmerToEdit.dailyMilkQuantity || 40) * 0.4);

          setCowLitres(cTotal);
          setCowMorningQty(farmerToEdit.cowMorningQty ?? Math.round(cTotal * 0.55));
          setCowEveningQty(farmerToEdit.cowEveningQty ?? Math.round(cTotal * 0.45));
          setCowFat(farmerToEdit.cowFat ?? 3.9);
          setCowSNF(farmerToEdit.cowSNF ?? 8.6);
          setCowRate(farmerToEdit.cowRate ?? 39.7);
          setCowCattleCount(farmerToEdit.cowCattleCount ?? Math.max(1, Math.round((farmerToEdit.cattleCount || 6) * 0.6)));

          setBuffaloLitres(bTotal);
          setBuffaloMorningQty(farmerToEdit.buffaloMorningQty ?? Math.round(bTotal * 0.55));
          setBuffaloEveningQty(farmerToEdit.buffaloEveningQty ?? Math.round(bTotal * 0.45));
          setBuffaloFat(farmerToEdit.buffaloFat ?? 7.2);
          setBuffaloSNF(farmerToEdit.buffaloSNF ?? 9.0);
          setBuffaloRate(farmerToEdit.buffaloRate ?? 72.0);
          setBuffaloCattleCount(farmerToEdit.buffaloCattleCount ?? Math.max(1, Math.round((farmerToEdit.cattleCount || 6) * 0.4)));
        }

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

        // Cow defaults
        setCowLitres(25);
        setCowMorningQty(15);
        setCowEveningQty(10);
        setCowFat(3.8);
        setCowSNF(8.5);
        setCowRate(39.5);
        setCowCattleCount(4);

        // Buffalo defaults
        setBuffaloLitres(20);
        setBuffaloMorningQty(12);
        setBuffaloEveningQty(8);
        setBuffaloFat(7.0);
        setBuffaloSNF(9.0);
        setBuffaloRate(72.5);
        setBuffaloCattleCount(3);

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

  // Handle Cow Total Change
  const handleCowTotalChange = (val: number) => {
    const safe = Math.max(0, val);
    setCowLitres(safe);
    setCowMorningQty(Math.round(safe * 0.55));
    setCowEveningQty(Math.round(safe * 0.45));
  };

  // Handle Cow Shifts Change
  const handleCowMorningChange = (val: number) => {
    const m = Math.max(0, val);
    setCowMorningQty(m);
    setCowLitres(m + cowEveningQty);
  };

  const handleCowEveningChange = (val: number) => {
    const e = Math.max(0, val);
    setCowEveningQty(e);
    setCowLitres(cowMorningQty + e);
  };

  // Handle Buffalo Total Change
  const handleBuffaloTotalChange = (val: number) => {
    const safe = Math.max(0, val);
    setBuffaloLitres(safe);
    setBuffaloMorningQty(Math.round(safe * 0.55));
    setBuffaloEveningQty(Math.round(safe * 0.45));
  };

  // Handle Buffalo Shifts Change
  const handleBuffaloMorningChange = (val: number) => {
    const m = Math.max(0, val);
    setBuffaloMorningQty(m);
    setBuffaloLitres(m + buffaloEveningQty);
  };

  const handleBuffaloEveningChange = (val: number) => {
    const e = Math.max(0, val);
    setBuffaloEveningQty(e);
    setBuffaloLitres(buffaloMorningQty + e);
  };

  // Calculated Estimates
  const cowBill10 = (cowLitres * cowRate * 10);
  const cowBill30 = (cowLitres * cowRate * 30);
  const buffaloBill10 = (buffaloLitres * buffaloRate * 10);
  const buffaloBill30 = (buffaloLitres * buffaloRate * 30);

  const combinedTotalLitres = cowLitres + buffaloLitres;
  const combinedMorningLitres = cowMorningQty + buffaloMorningQty;
  const combinedEveningLitres = cowEveningQty + buffaloEveningQty;
  const combinedBill10 = cowBill10 + buffaloBill10;
  const combinedBill30 = cowBill30 + buffaloBill30;
  const combinedCattleCount = cowCattleCount + buffaloCattleCount;

  const weightedRate = combinedTotalLitres > 0
    ? (cowLitres * cowRate + buffaloLitres * buffaloRate) / combinedTotalLitres
    : 45.0;

  const weightedFat = combinedTotalLitres > 0
    ? (cowLitres * cowFat + buffaloLitres * buffaloFat) / combinedTotalLitres
    : 4.8;

  const weightedSNF = combinedTotalLitres > 0
    ? (cowLitres * cowSNF + buffaloLitres * buffaloSNF) / combinedTotalLitres
    : 8.7;

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

    let totalDaily = 0;
    let totalMorning = 0;
    let totalEvening = 0;
    let finalAvgFat = 3.8;
    let finalAvgSNF = 8.5;
    let finalRate = 39.5;
    let finalCattleCount = 4;

    if (milkType === 'Cow') {
      totalDaily = Number(cowLitres) || 0;
      totalMorning = Number(cowMorningQty) || 0;
      totalEvening = Number(cowEveningQty) || 0;
      finalAvgFat = Number(cowFat) || 3.8;
      finalAvgSNF = Number(cowSNF) || 8.5;
      finalRate = Number(cowRate) || 39.5;
      finalCattleCount = Number(cowCattleCount) || 1;
    } else if (milkType === 'Buffalo') {
      totalDaily = Number(buffaloLitres) || 0;
      totalMorning = Number(buffaloMorningQty) || 0;
      totalEvening = Number(buffaloEveningQty) || 0;
      finalAvgFat = Number(buffaloFat) || 7.0;
      finalAvgSNF = Number(buffaloSNF) || 9.0;
      finalRate = Number(buffaloRate) || 72.5;
      finalCattleCount = Number(buffaloCattleCount) || 1;
    } else {
      // Both
      totalDaily = combinedTotalLitres;
      totalMorning = combinedMorningLitres;
      totalEvening = combinedEveningLitres;
      finalAvgFat = Number(weightedFat.toFixed(1));
      finalAvgSNF = Number(weightedSNF.toFixed(1));
      finalRate = Number(weightedRate.toFixed(2));
      finalCattleCount = combinedCattleCount || 2;
    }

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
      dailyMilkQuantity: totalDaily,
      morningMilkQty: totalMorning,
      eveningMilkQty: totalEvening,
      // Detailed Cow Data
      cowLitres: milkType === 'Buffalo' ? 0 : Number(cowLitres),
      cowMorningQty: milkType === 'Buffalo' ? 0 : Number(cowMorningQty),
      cowEveningQty: milkType === 'Buffalo' ? 0 : Number(cowEveningQty),
      cowFat: Number(cowFat) || 3.8,
      cowSNF: Number(cowSNF) || 8.5,
      cowRate: Number(cowRate) || 39.5,
      cowCattleCount: Number(cowCattleCount) || 0,
      // Detailed Buffalo Data
      buffaloLitres: milkType === 'Cow' ? 0 : Number(buffaloLitres),
      buffaloMorningQty: milkType === 'Cow' ? 0 : Number(buffaloMorningQty),
      buffaloEveningQty: milkType === 'Cow' ? 0 : Number(buffaloEveningQty),
      buffaloFat: Number(buffaloFat) || 7.0,
      buffaloSNF: Number(buffaloSNF) || 9.0,
      buffaloRate: Number(buffaloRate) || 72.5,
      buffaloCattleCount: Number(buffaloCattleCount) || 0,
      // Aggregates
      avgFat: finalAvgFat,
      avgSNF: finalAvgSNF,
      currentRate: finalRate,
      cattleCount: finalCattleCount,
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
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 my-auto max-h-[92vh] overflow-y-auto">
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
                {isMr ? 'गाय, म्हैस किंवा दोन्ही दुधाचे संकलन, फॅट, दर, FSSAI परवाना व बँक तपशील भरा' : 'Cow, Buffalo & Both Milk volume, FAT, Rates, FSSAI license & banking details'}
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

          {/* SECTION 2: दुधाची माहिती व संकलन तपशील (Milk Production, Quality & Dual Cow/Buffalo Engine) */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-xs">
                <Milk className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isMr ? '२. दुधाची माहिती व संकलन तपशील' : '2. Milk Production & Quality Details'}</span>
              </h4>
              <span className="text-[11px] text-slate-500 font-medium">
                {isMr ? 'दूध प्रकार निवडून स्वतंत्र किंवा एकत्रित संकलन भरा:' : 'Select milk type to enter details:'}
              </span>
            </div>

            {/* Milk Type Segmented Selector */}
            <div className="grid grid-cols-3 gap-2 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setMilkType('Cow')}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  milkType === 'Cow'
                    ? 'bg-amber-500 text-slate-950 shadow-md scale-[1.01]'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>🐄</span>
                <span>{isMr ? 'गायीचे दूध (Cow)' : 'Cow Milk'}</span>
              </button>

              <button
                type="button"
                onClick={() => setMilkType('Buffalo')}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  milkType === 'Buffalo'
                    ? 'bg-teal-600 text-white shadow-md scale-[1.01]'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>🐃</span>
                <span>{isMr ? 'म्हशीचे दूध (Buffalo)' : 'Buffalo Milk'}</span>
              </button>

              <button
                type="button"
                onClick={() => setMilkType('Both')}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  milkType === 'Both'
                    ? 'bg-emerald-600 text-white shadow-md scale-[1.01]'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>🐄+🐃</span>
                <span>{isMr ? 'दोन्ही (Both)' : 'Both (Cow & Buffalo)'}</span>
              </button>
            </div>

            {/* DYNAMIC FORM VIEWS BASED ON SELECTION */}

            {/* 1. COW MILK VIEW */}
            {milkType === 'Cow' && (
              <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/50 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🐄</span>
                    <h5 className="font-bold text-xs text-amber-900 dark:text-amber-300">
                      {isMr ? 'गायीचे दूध संकलन, फॅट, SNF व खरेदी दर' : 'Cow Milk Volume, FAT, SNF & Rate'}
                    </h5>
                  </div>
                  <span className="text-[10px] font-bold bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded-full">
                    {isMr ? 'मानक गाय दर: ₹38.00 - ₹42.00/L' : 'Standard Cow Rate'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                      {isMr ? 'गाय दैनिक एकूण (L) *' : 'Cow Total Daily (L) *'}
                    </label>
                    <input
                      type="number"
                      value={cowLitres}
                      onChange={e => handleCowTotalChange(Number(e.target.value))}
                      min={0}
                      className="w-full p-2.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1">
                      {isMr ? '🌅 सकाळ संकलन (L)' : 'Morning (L)'}
                    </label>
                    <input
                      type="number"
                      value={cowMorningQty}
                      onChange={e => handleCowMorningChange(Number(e.target.value))}
                      min={0}
                      className="w-full p-2.5 rounded-xl border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1">
                      {isMr ? '🌆 संध्याकाळ संकलन (L)' : 'Evening (L)'}
                    </label>
                    <input
                      type="number"
                      value={cowEveningQty}
                      onChange={e => handleCowEveningChange(Number(e.target.value))}
                      min={0}
                      className="w-full p-2.5 rounded-xl border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {isMr ? 'सरासरी FAT %' : 'Avg FAT %'}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={cowFat}
                      onChange={e => setCowFat(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-400 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {isMr ? 'सरासरी SNF %' : 'Avg SNF %'}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={cowSNF}
                      onChange={e => setCowSNF(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-amber-900 dark:text-amber-300 mb-1">
                      {isMr ? 'चालू दर (₹/L) *' : 'Rate (₹/L) *'}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={cowRate}
                      onChange={e => setCowRate(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1">
                      {isMr ? 'गायींची संख्या' : 'Cow Count'}
                    </label>
                    <input
                      type="number"
                      value={cowCattleCount}
                      onChange={e => setCowCattleCount(Number(e.target.value))}
                      min={0}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Calculation Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-amber-100/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs">
                  <span className="text-amber-900 dark:text-amber-200 font-medium">
                    🌅 {cowMorningQty}L + 🌆 {cowEveningQty}L = <strong>{cowLitres} L/day</strong>
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-600 dark:text-slate-400">
                      {isMr ? '१० दिवसांचे बिल:' : '10-Day Bill:'} <strong className="text-emerald-700 dark:text-emerald-400">₹{cowBill10.toLocaleString('en-IN')}</strong>
                    </span>
                    <span className="text-slate-600 dark:text-slate-400">
                      {isMr ? 'महिना बिल:' : 'Monthly:'} <strong className="text-amber-800 dark:text-amber-300">₹{cowBill30.toLocaleString('en-IN')}</strong>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 2. BUFFALO MILK VIEW */}
            {milkType === 'Buffalo' && (
              <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200/80 dark:border-teal-900/50 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🐃</span>
                    <h5 className="font-bold text-xs text-teal-900 dark:text-teal-300">
                      {isMr ? 'म्हशीचे दूध संकलन, फॅट, SNF व खरेदी दर' : 'Buffalo Milk Volume, FAT, SNF & Rate'}
                    </h5>
                  </div>
                  <span className="text-[10px] font-bold bg-teal-200/80 dark:bg-teal-900/60 text-teal-900 dark:text-teal-200 px-2 py-0.5 rounded-full">
                    {isMr ? 'मानक म्हैस दर: ₹68.00 - ₹76.00/L' : 'Standard Buffalo Rate'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                      {isMr ? 'म्हैस दैनिक एकूण (L) *' : 'Buffalo Total Daily (L) *'}
                    </label>
                    <input
                      type="number"
                      value={buffaloLitres}
                      onChange={e => handleBuffaloTotalChange(Number(e.target.value))}
                      min={0}
                      className="w-full p-2.5 rounded-xl border border-teal-300 dark:border-teal-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1">
                      {isMr ? '🌅 सकाळ संकलन (L)' : 'Morning (L)'}
                    </label>
                    <input
                      type="number"
                      value={buffaloMorningQty}
                      onChange={e => handleBuffaloMorningChange(Number(e.target.value))}
                      min={0}
                      className="w-full p-2.5 rounded-xl border border-teal-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1">
                      {isMr ? '🌆 संध्याकाळ संकलन (L)' : 'Evening (L)'}
                    </label>
                    <input
                      type="number"
                      value={buffaloEveningQty}
                      onChange={e => handleBuffaloEveningChange(Number(e.target.value))}
                      min={0}
                      className="w-full p-2.5 rounded-xl border border-teal-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {isMr ? 'सरासरी FAT % (फॅट)' : 'Avg FAT %'}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={buffaloFat}
                      onChange={e => setBuffaloFat(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-400 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {isMr ? 'सरासरी SNF % (एसएनएफ)' : 'Avg SNF %'}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={buffaloSNF}
                      onChange={e => setBuffaloSNF(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-teal-900 dark:text-teal-300 mb-1">
                      {isMr ? 'चालू खरेदी दर (₹/L) *' : 'Rate (₹/L) *'}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={buffaloRate}
                      onChange={e => setBuffaloRate(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-teal-300 dark:border-teal-800 bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1">
                      {isMr ? 'म्हशींची संख्या' : 'Buffalo Count'}
                    </label>
                    <input
                      type="number"
                      value={buffaloCattleCount}
                      onChange={e => setBuffaloCattleCount(Number(e.target.value))}
                      min={0}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Calculation Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-teal-100/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/60 text-xs">
                  <span className="text-teal-900 dark:text-teal-200 font-medium">
                    🌅 {buffaloMorningQty}L + 🌆 {buffaloEveningQty}L = <strong>{buffaloLitres} L/day</strong>
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-600 dark:text-slate-400">
                      {isMr ? '१० दिवसांचे बिल:' : '10-Day Bill:'} <strong className="text-emerald-700 dark:text-emerald-400">₹{buffaloBill10.toLocaleString('en-IN')}</strong>
                    </span>
                    <span className="text-slate-600 dark:text-slate-400">
                      {isMr ? 'महिना बिल:' : 'Monthly:'} <strong className="text-teal-800 dark:text-teal-300">₹{buffaloBill30.toLocaleString('en-IN')}</strong>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 3. BOTH (COW & BUFFALO) VIEW - DUAL CARDS & COMBINED SUMMARY */}
            {milkType === 'Both' && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-xs font-semibold">
                    {isMr
                      ? 'गाय व म्हैस या दोन्ही दुधाची माहिती खालील दोन स्वतंत्र रकान्यांमध्ये भरा:'
                      : 'Enter Cow and Buffalo milk details separately in the two sections below:'}
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {/* Cow Subcard */}
                  <div className="p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/50 space-y-2.5">
                    <div className="flex items-center justify-between border-b border-amber-200/60 pb-1.5">
                      <h6 className="font-bold text-xs text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                        <span>🐄</span>
                        <span>{isMr ? 'गायीचे दूध तपशील (Cow Milk)' : 'Cow Milk Details'}</span>
                      </h6>
                      <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300">
                        {cowLitres} L/day
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                          {isMr ? 'दैनिक एकूण (L)' : 'Total (L)'}
                        </label>
                        <input
                          type="number"
                          value={cowLitres}
                          onChange={e => handleCowTotalChange(Number(e.target.value))}
                          min={0}
                          className="w-full p-2 rounded-xl border border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-0.5">
                          {isMr ? '🌅 सकाळ' : 'Morn'}
                        </label>
                        <input
                          type="number"
                          value={cowMorningQty}
                          onChange={e => handleCowMorningChange(Number(e.target.value))}
                          min={0}
                          className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-0.5">
                          {isMr ? '🌆 संध्याकाळ' : 'Eve'}
                        </label>
                        <input
                          type="number"
                          value={cowEveningQty}
                          onChange={e => handleCowEveningChange(Number(e.target.value))}
                          min={0}
                          className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-600 dark:text-slate-400 mb-0.5">
                          {isMr ? 'फॅट %' : 'FAT %'}
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={cowFat}
                          onChange={e => setCowFat(Number(e.target.value))}
                          className="w-full p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-400 font-bold text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-600 dark:text-slate-400 mb-0.5">
                          {isMr ? 'SNF %' : 'SNF %'}
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={cowSNF}
                          onChange={e => setCowSNF(Number(e.target.value))}
                          className="w-full p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-amber-900 dark:text-amber-300 mb-0.5">
                          {isMr ? 'दर (₹/L)' : 'Rate'}
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={cowRate}
                          onChange={e => setCowRate(Number(e.target.value))}
                          className="w-full p-1.5 rounded-lg border border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 font-bold text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-600 dark:text-slate-400 mb-0.5">
                          {isMr ? 'गाई संख्या' : 'Cows'}
                        </label>
                        <input
                          type="number"
                          value={cowCattleCount}
                          onChange={e => setCowCattleCount(Number(e.target.value))}
                          min={0}
                          className="w-full p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                        />
                      </div>
                    </div>

                    <div className="pt-1 text-[11px] text-amber-900 dark:text-amber-200 flex items-center justify-between">
                      <span>{isMr ? 'गाय १० दिवसांचे बिल:' : 'Cow 10d Bill:'}</span>
                      <strong className="text-emerald-700 dark:text-emerald-400">₹{cowBill10.toLocaleString('en-IN')}</strong>
                    </div>
                  </div>

                  {/* Buffalo Subcard */}
                  <div className="p-3.5 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200/80 dark:border-teal-900/50 space-y-2.5">
                    <div className="flex items-center justify-between border-b border-teal-200/60 pb-1.5">
                      <h6 className="font-bold text-xs text-teal-900 dark:text-teal-300 flex items-center gap-1.5">
                        <span>🐃</span>
                        <span>{isMr ? 'म्हशीचे दूध तपशील (Buffalo Milk)' : 'Buffalo Milk Details'}</span>
                      </h6>
                      <span className="text-[10px] font-bold text-teal-800 dark:text-teal-300">
                        {buffaloLitres} L/day
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                          {isMr ? 'दैनिक एकूण (L)' : 'Total (L)'}
                        </label>
                        <input
                          type="number"
                          value={buffaloLitres}
                          onChange={e => handleBuffaloTotalChange(Number(e.target.value))}
                          min={0}
                          className="w-full p-2 rounded-xl border border-teal-300 dark:border-teal-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-0.5">
                          {isMr ? '🌅 सकाळ' : 'Morn'}
                        </label>
                        <input
                          type="number"
                          value={buffaloMorningQty}
                          onChange={e => handleBuffaloMorningChange(Number(e.target.value))}
                          min={0}
                          className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-0.5">
                          {isMr ? '🌆 संध्याकाळ' : 'Eve'}
                        </label>
                        <input
                          type="number"
                          value={buffaloEveningQty}
                          onChange={e => handleBuffaloEveningChange(Number(e.target.value))}
                          min={0}
                          className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-600 dark:text-slate-400 mb-0.5">
                          {isMr ? 'फॅट %' : 'FAT %'}
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={buffaloFat}
                          onChange={e => setBuffaloFat(Number(e.target.value))}
                          className="w-full p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-400 font-bold text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-600 dark:text-slate-400 mb-0.5">
                          {isMr ? 'SNF %' : 'SNF %'}
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={buffaloSNF}
                          onChange={e => setBuffaloSNF(Number(e.target.value))}
                          className="w-full p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-teal-900 dark:text-teal-300 mb-0.5">
                          {isMr ? 'दर (₹/L)' : 'Rate'}
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={buffaloRate}
                          onChange={e => setBuffaloRate(Number(e.target.value))}
                          className="w-full p-1.5 rounded-lg border border-teal-300 dark:border-teal-800 bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 font-bold text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-600 dark:text-slate-400 mb-0.5">
                          {isMr ? 'म्हशी संख्या' : 'Buffalos'}
                        </label>
                        <input
                          type="number"
                          value={buffaloCattleCount}
                          onChange={e => setBuffaloCattleCount(Number(e.target.value))}
                          min={0}
                          className="w-full p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                        />
                      </div>
                    </div>

                    <div className="pt-1 text-[11px] text-teal-900 dark:text-teal-200 flex items-center justify-between">
                      <span>{isMr ? 'म्हैस १० दिवसांचे बिल:' : 'Buffalo 10d Bill:'}</span>
                      <strong className="text-emerald-700 dark:text-emerald-400">₹{buffaloBill10.toLocaleString('en-IN')}</strong>
                    </div>
                  </div>
                </div>

                {/* COMBINED LIVE SUMMARY FOR 'BOTH' */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-amber-50 dark:from-slate-800 dark:via-slate-800/80 dark:to-slate-800 border border-emerald-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Calculator className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{isMr ? '📊 एकत्रित संकलन व बिल सारांश (Combined Summary)' : 'Combined Totals & Estimates'}</span>
                    </span>
                    <span className="font-black text-sm text-emerald-700 dark:text-emerald-400">
                      {combinedTotalLitres} Ltr/day
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-xl border border-slate-200/60 dark:border-slate-700">
                      <span className="text-[10px] text-slate-500 block">{isMr ? '🌅 सकाळ एकूण' : 'Morning Total'}</span>
                      <span className="font-bold text-slate-900 dark:text-white">{combinedMorningLitres} L</span>
                    </div>

                    <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-xl border border-slate-200/60 dark:border-slate-700">
                      <span className="text-[10px] text-slate-500 block">{isMr ? '🌆 संध्याकाळ एकूण' : 'Evening Total'}</span>
                      <span className="font-bold text-slate-900 dark:text-white">{combinedEveningLitres} L</span>
                    </div>

                    <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-xl border border-slate-200/60 dark:border-slate-700">
                      <span className="text-[10px] text-slate-500 block">{isMr ? '१० दिवसांचे एकूण बिल' : '10-Day Bill'}</span>
                      <span className="font-black text-emerald-600 dark:text-emerald-400">₹{combinedBill10.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-xl border border-slate-200/60 dark:border-slate-700">
                      <span className="text-[10px] text-slate-500 block">{isMr ? 'सरासरी एकत्रित दर' : 'Weighted Rate'}</span>
                      <span className="font-bold text-amber-700 dark:text-amber-400">₹{weightedRate.toFixed(2)}/L</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
