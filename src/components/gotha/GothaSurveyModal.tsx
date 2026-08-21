import React, { useState, useRef } from 'react';
import {
  X,
  Camera,
  MapPin,
  Save,
  CheckCircle2,
  AlertCircle,
  FileSignature,
  Building,
  Milk,
  ShieldCheck,
} from 'lucide-react';
import { CattleShedSurvey, Farmer } from '../../types';
import { MPOStorageService } from '../../services/mpoStorageService';
import { StorageService } from '../../services/storageService';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';

interface GothaSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  surveyToEdit?: CattleShedSurvey | null;
  onSaved: () => void;
}

export const GothaSurveyModal: React.FC<GothaSurveyModalProps> = ({
  isOpen,
  onClose,
  surveyToEdit,
  onSaved,
}) => {
  const { currentUser } = useAuth();
  const { language } = useLanguage();
  const isMr = language === 'mr';
  const { showToast } = useToast();

  const farmers = StorageService.getFarmers();
  const routes = StorageService.getRoutes();

  // Producer Selection
  const [selectedProducerCode, setSelectedProducerCode] = useState(surveyToEdit?.producerCode || '');
  const [producerName, setProducerName] = useState(surveyToEdit?.producerName || '');
  const [mobileNumber, setMobileNumber] = useState(surveyToEdit?.mobileNumber || '');
  const [village, setVillage] = useState(surveyToEdit?.village || '');
  const [route, setRoute] = useState(surveyToEdit?.route || 'RT-101');

  // Shed Details
  const [shedType, setShedType] = useState<CattleShedSurvey['shedType']>(
    surveyToEdit?.shedType || 'Semi-Covered Modern'
  );
  const [floorType, setFloorType] = useState<CattleShedSurvey['floorType']>(
    surveyToEdit?.floorType || 'Concrete with Grooves'
  );
  const [waterSource, setWaterSource] = useState<CattleShedSurvey['waterSource']>(
    surveyToEdit?.waterSource || 'Borewell'
  );
  const [milkingMethod, setMilkingMethod] = useState<CattleShedSurvey['milkingMethod']>(
    surveyToEdit?.milkingMethod || 'Single Bucket Machine'
  );
  const [dungManagement, setDungManagement] = useState<CattleShedSurvey['dungManagement']>(
    surveyToEdit?.dungManagement || 'Biogas Plant'
  );
  const [cleanlinessRating, setCleanlinessRating] = useState<1 | 2 | 3 | 4 | 5>(
    surveyToEdit?.cleanlinessRating || 4
  );

  // Cows Breakdown
  const [hf, setHf] = useState(surveyToEdit?.cowsCount?.hf || 0);
  const [jersey, setJersey] = useState(surveyToEdit?.cowsCount?.jersey || 0);
  const [gir, setGir] = useState(surveyToEdit?.cowsCount?.gir || 0);
  const [desi, setDesi] = useState(surveyToEdit?.cowsCount?.desi || 0);
  const [cowCalves, setCowCalves] = useState(surveyToEdit?.cowsCount?.calves || 0);

  // Buffaloes Breakdown
  const [murrah, setMurrah] = useState(surveyToEdit?.buffaloesCount?.murrah || 0);
  const [jafrabadi, setJafrabadi] = useState(surveyToEdit?.buffaloesCount?.jafrabadi || 0);
  const [pandharpuri, setPandharpuri] = useState(surveyToEdit?.buffaloesCount?.pandharpuri || 0);
  const [localBuff, setLocalBuff] = useState(surveyToEdit?.buffaloesCount?.local || 0);
  const [buffCalves, setBuffCalves] = useState(surveyToEdit?.buffaloesCount?.calves || 0);

  // Production
  const [milkingCattle, setMilkingCattle] = useState(surveyToEdit?.milkingCattleCount || 6);
  const [dailyCowYield, setDailyCowYield] = useState(surveyToEdit?.dailyCowYield || 80);
  const [dailyBuffaloYield, setDailyBuffaloYield] = useState(surveyToEdit?.dailyBuffaloYield || 30);

  // Health & Vaccinations
  const [fmdVaccinated, setFmdVaccinated] = useState(surveyToEdit?.fmdVaccinated ?? true);
  const [lumpyVaccinated, setLumpyVaccinated] = useState(surveyToEdit?.lumpyVaccinated ?? true);
  const [brucellosisVaccinated, setBrucellosisVaccinated] = useState(surveyToEdit?.brucellosisVaccinated ?? false);
  const [dewormingDone, setDewormingDone] = useState(surveyToEdit?.dewormingDone ?? true);
  const [cattleInsuranceCount, setCattleInsuranceCount] = useState(surveyToEdit?.cattleInsuranceCount || 4);

  // GPS & Photo
  const [latitude, setLatitude] = useState(surveyToEdit?.gpsLocation?.latitude || 16.8834);
  const [longitude, setLongitude] = useState(surveyToEdit?.gpsLocation?.longitude || 74.4995);
  const [isGettingGps, setIsGettingGps] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(surveyToEdit?.photoUrl || '');
  const [photoTimestamp, setPhotoTimestamp] = useState(surveyToEdit?.photoTimestamp || '');
  const [signatureName, setSignatureName] = useState(surveyToEdit?.digitalSignature || currentUser?.name || '');

  // Remarks
  const [remarks, setRemarks] = useState(surveyToEdit?.remarks || '');
  const [recommendations, setRecommendations] = useState(surveyToEdit?.recommendations || '');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleProducerChange = (code: string) => {
    setSelectedProducerCode(code);
    const farmer = farmers.find(f => f.farmerCode === code);
    if (farmer) {
      setProducerName(farmer.farmerName);
      setMobileNumber(farmer.mobileNumber);
      setVillage(farmer.village);
      setRoute(farmer.route || 'RT-101');
      if (farmer.milkType === 'Cow' || farmer.milkType === 'Both') setHf(2);
      if (farmer.milkType === 'Buffalo' || farmer.milkType === 'Both') setMurrah(2);
    }
  };

  const handleCaptureGps = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser', 'error');
      return;
    }
    setIsGettingGps(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setIsGettingGps(false);
        showToast(isMr ? 'GPS लोकेशन यशस्वीरीत्या टॅग केले' : 'GPS coordinates captured', 'success');
      },
      err => {
        setIsGettingGps(false);
        showToast(isMr ? 'GPS मिळवण्यात अडचण, डीफॉल्ट लोकेशन वापरले' : 'GPS error, default applied', 'warning');
      },
      { timeout: 8000 }
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoUrl(reader.result as string);
        setPhotoTimestamp(new Date().toLocaleString('en-IN'));
      };
      reader.readAsDataURL(file);
    }
  };

  const totalCattle = hf + jersey + gir + desi + cowCalves + murrah + jafrabadi + pandharpuri + localBuff + buffCalves;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!producerName.trim()) {
      showToast(isMr ? 'कृपया उत्पादकाचे नाव निवडा/टाका' : 'Please specify producer name', 'error');
      return;
    }

    const surveyObj: CattleShedSurvey = {
      id: surveyToEdit?.id || `GOTH-${Date.now()}`,
      surveyNumber: surveyToEdit?.surveyNumber || `GOTH-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      producerCode: selectedProducerCode || `P-${Date.now().toString().slice(-4)}`,
      producerName,
      mobileNumber,
      village: village || 'कवठेपिरान',
      route,
      shedType,
      floorType,
      waterSource,
      milkingMethod,
      cowsCount: { hf, jersey, gir, desi, calves: cowCalves },
      buffaloesCount: { murrah, jafrabadi, pandharpuri, local: localBuff, calves: buffCalves },
      totalCattle,
      milkingCattleCount: Number(milkingCattle) || 0,
      dailyCowYield: Number(dailyCowYield) || 0,
      dailyBuffaloYield: Number(dailyBuffaloYield) || 0,
      dungManagement,
      cleanlinessRating,
      fmdVaccinated,
      lumpyVaccinated,
      brucellosisVaccinated,
      dewormingDone,
      cattleInsuranceCount: Number(cattleInsuranceCount) || 0,
      gpsLocation: {
        latitude,
        longitude,
        accuracy: 5,
        address: `${village}, सांगली`,
      },
      photoUrl,
      photoTimestamp,
      remarks,
      recommendations,
      officerId: currentUser?.id || 'USR-ADMIN-1',
      officerName: currentUser?.name || 'प्रमोद सावंत (MPO)',
      digitalSignature: signatureName,
      surveyDate: surveyToEdit?.surveyDate || new Date().toISOString().split('T')[0],
      createdAt: surveyToEdit?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    MPOStorageService.saveGothaSurvey(surveyObj);
    showToast(isMr ? 'गोठा सर्वेक्षण माहिती यशस्वीरीत्या सेव्ह झाली' : 'Gotha survey saved successfully', 'success');
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[94vh] overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-amber-700 to-amber-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <Building className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">
                {surveyToEdit ? (isMr ? 'गोठा सर्वेक्षण संपादन' : 'Edit Gotha Survey') : (isMr ? 'नवीन गोठा सर्वेक्षण (Cattle Shed Survey)' : 'New Cattle Shed Survey')}
              </h3>
              <p className="text-xs text-amber-200">
                {isMr ? '३६०° गोठा तपासणी, जनावरांची संख्या, लसीकरण, GPS व फोटो' : '360° Shed Inspection, Animal Count, Vaccination & GPS'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-amber-200 hover:text-white hover:bg-white/10 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5 text-xs sm:text-sm">
          {/* Section 1: Producer Identification */}
          <div className="bg-amber-50/50 dark:bg-amber-950/20 p-3.5 rounded-xl border border-amber-200/60 dark:border-amber-900/40 space-y-3">
            <h4 className="font-bold text-amber-900 dark:text-amber-300 text-xs sm:text-sm flex items-center gap-1.5">
              <Milk className="w-4 h-4" />
              <span>१. गवळी / उत्पादक माहिती (Producer Details)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isMr ? 'गवळी निवडा (Select Producer)' : 'Select Producer'}
                </label>
                <select
                  value={selectedProducerCode}
                  onChange={e => handleProducerChange(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="">-- {isMr ? 'उत्पादक निवडा किंवा नवीन टाका' : 'Choose or Type'} --</option>
                  {farmers.map(f => (
                    <option key={f.id} value={f.farmerCode}>
                      {f.farmerCode} - {f.farmerName} ({f.village})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isMr ? 'उत्पादक नाव (Producer Name)' : 'Name'} *
                </label>
                <input
                  type="text"
                  value={producerName}
                  onChange={e => setProducerName(e.target.value)}
                  required
                  placeholder="उदा. आनंदराव पाटील"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isMr ? 'मोबाईल नंबर (Mobile)' : 'Mobile'}
                </label>
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={e => setMobileNumber(e.target.value)}
                  placeholder="9822000000"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isMr ? 'गाव (Village)' : 'Village'}
                </label>
                <input
                  type="text"
                  value={village}
                  onChange={e => setVillage(e.target.value)}
                  placeholder="उदा. कवठेपिरान"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isMr ? 'रूट (Route)' : 'Route'}
                </label>
                <select
                  value={route}
                  onChange={e => setRoute(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  {routes.map(r => (
                    <option key={r.id} value={r.routeNumber}>
                      {r.routeNumber} - {r.routeName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Shed Infrastructure */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-sm flex items-center gap-1.5">
              <Building className="w-4 h-4 text-amber-600" />
              <span>२. गोठा पायाभूत सुविधा व यंत्रसामग्री (Infrastructure)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">{isMr ? 'गोठ्याचा प्रकार' : 'Shed Type'}</label>
                <select
                  value={shedType}
                  onChange={e => setShedType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="Semi-Covered Modern">आधुनिक अर्ध-बंदिस्त (Semi-Covered Modern)</option>
                  <option value="Open Shed">मुक्त संचार गोठा (Open Shed)</option>
                  <option value="Closed Shed">बंदिस्त गोठा (Closed Shed)</option>
                  <option value="Traditional">पारंपारिक (Traditional)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">{isMr ? 'तळ रचना (Floor)' : 'Floor Type'}</label>
                <select
                  value={floorType}
                  onChange={e => setFloorType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="Concrete with Grooves">ग्रूव्ह असलेले काँक्रीट (Concrete with Grooves)</option>
                  <option value="Rubber Matting">रबर मॅट अंथरुण (Rubber Matting)</option>
                  <option value="Paver Blocks">पेव्हर ब्लॉक (Paver Blocks)</option>
                  <option value="Mud/Kaccha">कच्ची माती (Mud/Kaccha)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">{isMr ? 'दूध काढणी पद्धत' : 'Milking Method'}</label>
                <select
                  value={milkingMethod}
                  onChange={e => setMilkingMethod(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="Single Bucket Machine">सिंगल बकेट मिलकिंग मशीन (Single Machine)</option>
                  <option value="Pipe Milking System">पाईपलाईन मिलकिंग सिस्टीम (Pipeline Machine)</option>
                  <option value="Manual Hand Milking">हाताने दूध काढणी (Manual Hand)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">{isMr ? 'पाण्याचा स्त्रोत' : 'Water Source'}</label>
                <select
                  value={waterSource}
                  onChange={e => setWaterSource(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="Borewell">बोअरवेल (Borewell)</option>
                  <option value="Well">विहीर (Well)</option>
                  <option value="Canal">कालवा / नदी (Canal/River)</option>
                  <option value="Tap Connection">नळ जोडणी (Tap)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">{isMr ? 'शेण-मूत्र व्यवस्थापन' : 'Dung Management'}</label>
                <select
                  value={dungManagement}
                  onChange={e => setDungManagement(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="Biogas Plant">बायोगॅस प्रकल्प (Biogas Plant)</option>
                  <option value="Compost Pit">कंपोस्ट खत खड्डा (Compost Pit)</option>
                  <option value="Slurry Tank">स्लरी टँक (Slurry Tank)</option>
                  <option value="Open Heap">उघडा ढीग (Open Heap)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">{isMr ? 'स्वच्छता दर्जा (Cleanliness)' : 'Cleanliness Rating'}</label>
                <div className="flex items-center gap-2 pt-1.5">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setCleanlinessRating(star as any)}
                      className={`px-3 py-1.5 rounded-lg font-black text-xs cursor-pointer ${
                        cleanlinessRating >= star
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600'
                      }`}
                    >
                      ★ {star}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Animals Breakdown & Yield */}
          <div className="bg-blue-50/50 dark:bg-blue-950/20 p-3.5 rounded-xl border border-blue-200/60 dark:border-blue-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-blue-900 dark:text-blue-300 text-xs sm:text-sm flex items-center gap-1.5">
                <Milk className="w-4 h-4" />
                <span>३. जनावरांची संख्या व दूध उत्पादन (Livestock & Yield)</span>
              </h4>
              <span className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-xs font-black font-mono">
                {isMr ? `एकूण जनावरे: ${totalCattle}` : `Total Cattle: ${totalCattle}`}
              </span>
            </div>

            {/* Cows */}
            <div>
              <span className="text-xs font-black text-blue-800 dark:text-blue-300 block mb-1.5">
                {isMr ? 'गाय संख्या तपशील (Cows Breakdown):' : 'Cow Breeds:'}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <div>
                  <label className="text-[11px] text-slate-600 dark:text-slate-400 block font-semibold">HF (होल्स्टिन)</label>
                  <input type="number" min="0" value={hf} onChange={e => setHf(Number(e.target.value))} className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border rounded-lg font-mono" />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 dark:text-slate-400 block font-semibold">Jersey (जर्सी)</label>
                  <input type="number" min="0" value={jersey} onChange={e => setJersey(Number(e.target.value))} className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border rounded-lg font-mono" />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 dark:text-slate-400 block font-semibold">Gir (गीर)</label>
                  <input type="number" min="0" value={gir} onChange={e => setGir(Number(e.target.value))} className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border rounded-lg font-mono" />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 dark:text-slate-400 block font-semibold">Desi (देशी/खिलार)</label>
                  <input type="number" min="0" value={desi} onChange={e => setDesi(Number(e.target.value))} className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border rounded-lg font-mono" />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 dark:text-slate-400 block font-semibold">Calves (वासरे)</label>
                  <input type="number" min="0" value={cowCalves} onChange={e => setCowCalves(Number(e.target.value))} className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border rounded-lg font-mono" />
                </div>
              </div>
            </div>

            {/* Buffaloes */}
            <div>
              <span className="text-xs font-black text-purple-800 dark:text-purple-300 block mb-1.5">
                {isMr ? 'म्हशी संख्या तपशील (Buffaloes Breakdown):' : 'Buffalo Breeds:'}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <div>
                  <label className="text-[11px] text-slate-600 dark:text-slate-400 block font-semibold">Murrah (मुऱ्हा)</label>
                  <input type="number" min="0" value={murrah} onChange={e => setMurrah(Number(e.target.value))} className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border rounded-lg font-mono" />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 dark:text-slate-400 block font-semibold">Jafrabadi (जाफराबादी)</label>
                  <input type="number" min="0" value={jafrabadi} onChange={e => setJafrabadi(Number(e.target.value))} className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border rounded-lg font-mono" />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 dark:text-slate-400 block font-semibold">Pandharpuri (पंढरपुरी)</label>
                  <input type="number" min="0" value={pandharpuri} onChange={e => setPandharpuri(Number(e.target.value))} className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border rounded-lg font-mono" />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 dark:text-slate-400 block font-semibold">Local (स्थानिक)</label>
                  <input type="number" min="0" value={localBuff} onChange={e => setLocalBuff(Number(e.target.value))} className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border rounded-lg font-mono" />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 dark:text-slate-400 block font-semibold">Calves (रेडे/पारडे)</label>
                  <input type="number" min="0" value={buffCalves} onChange={e => setBuffCalves(Number(e.target.value))} className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border rounded-lg font-mono" />
                </div>
              </div>
            </div>

            {/* Yields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-blue-200 dark:border-blue-900">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">{isMr ? 'दुभती जनावरे संख्या' : 'Milking Animals'}</label>
                <input type="number" value={milkingCattle} onChange={e => setMilkingCattle(Number(e.target.value))} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border rounded-xl font-mono" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">{isMr ? 'दैनिक गाय दूध (Liters)' : 'Daily Cow Milk (L)'}</label>
                <input type="number" value={dailyCowYield} onChange={e => setDailyCowYield(Number(e.target.value))} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border rounded-xl font-mono text-blue-600 font-bold" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">{isMr ? 'दैनिक म्हैस दूध (Liters)' : 'Daily Buff Milk (L)'}</label>
                <input type="number" value={dailyBuffaloYield} onChange={e => setDailyBuffaloYield(Number(e.target.value))} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border rounded-xl font-mono text-purple-600 font-bold" />
              </div>
            </div>
          </div>

          {/* Section 4: Health, Vaccination & Insurance */}
          <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-3.5 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40 space-y-3">
            <h4 className="font-bold text-emerald-900 dark:text-emerald-300 text-xs sm:text-sm flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>४. जनावरांचे आरोग्य, लसीकरण व विमा (Health & Insurance)</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <label className="flex items-center gap-2 p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                <input type="checkbox" checked={fmdVaccinated} onChange={e => setFmdVaccinated(e.target.checked)} className="w-4 h-4 text-emerald-600 rounded" />
                <span className="font-semibold text-xs">{isMr ? 'लाळ-खुरकूत (FMD)' : 'FMD Vaccine'}</span>
              </label>
              <label className="flex items-center gap-2 p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                <input type="checkbox" checked={lumpyVaccinated} onChange={e => setLumpyVaccinated(e.target.checked)} className="w-4 h-4 text-emerald-600 rounded" />
                <span className="font-semibold text-xs">{isMr ? 'लम्पी लस (Lumpy)' : 'Lumpy Vaccine'}</span>
              </label>
              <label className="flex items-center gap-2 p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                <input type="checkbox" checked={brucellosisVaccinated} onChange={e => setBrucellosisVaccinated(e.target.checked)} className="w-4 h-4 text-emerald-600 rounded" />
                <span className="font-semibold text-xs">{isMr ? 'ब्रुसेलोसिस (Brucella)' : 'Brucella Vaccine'}</span>
              </label>
              <label className="flex items-center gap-2 p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                <input type="checkbox" checked={dewormingDone} onChange={e => setDewormingDone(e.target.checked)} className="w-4 h-4 text-emerald-600 rounded" />
                <span className="font-semibold text-xs">{isMr ? 'जंतनिर्मूलन (Deworming)' : 'Deworming'}</span>
              </label>
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">{isMr ? 'विमा उतरवलेली जनावरे संख्या' : 'Insured Animals'}</label>
              <input type="number" value={cattleInsuranceCount} onChange={e => setCattleInsuranceCount(Number(e.target.value))} className="w-full sm:w-48 px-3 py-2 bg-white dark:bg-slate-800 border rounded-xl font-mono" />
            </div>
          </div>

          {/* Section 5: GPS Location, Photo & Signature */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-sm flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-rose-500" />
              <span>५. GPS लोकेशन व गोठा फोटो (Location & Photo Geotag)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* GPS */}
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">{isMr ? 'GPS अक्षांश-रेखांश' : 'GPS Coordinates'}</span>
                  <button
                    type="button"
                    onClick={handleCaptureGps}
                    disabled={isGettingGps}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{isGettingGps ? (isMr ? 'मिळवत आहे...' : 'Getting...') : (isMr ? 'लाइव्ह GPS घ्या' : 'Get GPS')}</span>
                  </button>
                </div>
                <div className="font-mono text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 p-2 rounded-lg">
                  Lat: {latitude.toFixed(6)}, Long: {longitude.toFixed(6)}
                </div>
              </div>

              {/* Photo */}
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">{isMr ? 'गोठा फोटो अपलोड' : 'Shed Photo'}</span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{isMr ? 'फोटो घ्या / निवडा' : 'Take Photo'}</span>
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} className="hidden" />
                </div>
                {photoUrl ? (
                  <div className="relative">
                    <img src={photoUrl} alt="Shed" className="w-full h-24 object-cover rounded-lg border" />
                    <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
                      {photoTimestamp}
                    </span>
                  </div>
                ) : (
                  <div className="h-16 flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-lg text-slate-400 text-xs">
                    {isMr ? 'कोणताही फोटो जोडलेला नाही' : 'No photo uploaded'}
                  </div>
                )}
              </div>
            </div>

            {/* Remarks & Sign */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">{isMr ? 'अधिकारी शेरा व शिफारस' : 'Remarks & Recommendations'}</label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  placeholder={isMr ? 'गोठा स्थिती व सुधारणा शिफारसी...' : 'Shed observations...'}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">{isMr ? 'डिजिटल स्वाक्षरी नाव (MPO Signature)' : 'Digital Signature'}</label>
                <input
                  type="text"
                  value={signatureName}
                  onChange={e => setSignatureName(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border rounded-xl font-serif italic font-bold"
                />
              </div>
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
              className="px-5 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isMr ? 'गोठा सर्वेक्षण जतन करा' : 'Save Gotha Survey'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
