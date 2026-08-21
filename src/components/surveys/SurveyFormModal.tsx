import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Camera,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileText,
  Smartphone,
  Calendar,
  User,
  Milk,
  Route,
  Navigation,
  Compass,
  Building2,
  Hash,
  FileSpreadsheet,
  Trash2,
} from 'lucide-react';
import { ProducerSurvey, SurveyStatus, DeviceInstallStatus, MilkType, Farmer } from '../../types';
import { SurveyService } from '../../services/surveyService';
import { StorageService } from '../../services/storageService';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface SurveyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  surveyToEdit?: ProducerSurvey | null;
  farmerPrepopulate?: Farmer | null;
  onSaved: (savedSurvey: ProducerSurvey) => void;
}

export const SurveyFormModal: React.FC<SurveyFormModalProps> = ({
  isOpen,
  onClose,
  surveyToEdit,
  farmerPrepopulate,
  onSaved,
}) => {
  const { language } = useLanguage();
  const isMr = language === 'mr';
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState<Partial<ProducerSurvey>>({
    producerCode: '',
    producerName: '',
    mobileNumber: '',
    alternateNumber: '',
    village: '',
    taluka: 'Miraj',
    district: 'Sangli',
    fullAddress: '',
    latitude: undefined,
    longitude: undefined,
    gpsAccuracy: undefined,
    route: 'RT-101',
    linkCenter: 'Sangli Main Link Center',
    collectionCenter: '',
    milkType: 'Cow',
    surveyDate: new Date().toISOString().split('T')[0],
    surveyedBy: currentUser?.name || 'Ramesh Patil',
    surveyedById: currentUser?.id || 'USR-OFFICER-1',
    surveyStatus: 'Completed',
    deviceStatus: 'Installed',
    deviceInstallationDate: new Date().toISOString().split('T')[0],
    deviceSerialNumber: '',
    deviceModel: 'SmartFAT Digital Analyzer + Direct Cloud Sync DPU',
    dailyMilkPotential: 25,
    cattleCount: 4,
    surveyRemarks: '',
    photoUrl: '',
    documents: [],
    isActiveProducer: true,
  });

  const [isFetchingGps, setIsFetchingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Available routes and link centers from storage
  const routes = StorageService.getRoutes();
  const allFarmers = StorageService.getFarmers();

  useEffect(() => {
    if (surveyToEdit) {
      setFormData({ ...surveyToEdit });
    } else if (farmerPrepopulate) {
      const generated = SurveyService.createSurveyFromFarmer(
        farmerPrepopulate,
        currentUser?.name || 'संकलन अधिकारी',
        currentUser?.id
      );
      setFormData(generated);
    } else {
      // Default reset
      setFormData({
        id: `SURV-${Date.now()}`,
        producerCode: `P-${Math.floor(100 + Math.random() * 900)}`,
        producerName: '',
        mobileNumber: '',
        alternateNumber: '',
        village: '',
        taluka: 'Miraj',
        district: 'Sangli',
        fullAddress: '',
        route: routes[0]?.routeNumber || 'RT-101',
        linkCenter: routes[0]?.routeName || 'Sangli Main Link Center',
        collectionCenter: '',
        milkType: 'Cow',
        surveyDate: new Date().toISOString().split('T')[0],
        surveyedBy: currentUser?.name || 'संकलन अधिकारी',
        surveyedById: currentUser?.id || 'USR-OFFICER-1',
        surveyStatus: 'Completed',
        deviceStatus: 'Installed',
        deviceInstallationDate: new Date().toISOString().split('T')[0],
        deviceSerialNumber: `MILK-IOT-${Math.floor(1000 + Math.random() * 9000)}`,
        deviceModel: 'SmartFAT Digital Analyzer + Direct Cloud Sync DPU',
        dailyMilkPotential: 25,
        cattleCount: 4,
        surveyRemarks: '',
        photoUrl: '',
        documents: [],
        isActiveProducer: true,
        syncedToCloud: true,
      });
    }
  }, [surveyToEdit, farmerPrepopulate, isOpen, currentUser]);

  if (!isOpen) return null;

  const handleFetchGps = async () => {
    setIsFetchingGps(true);
    setGpsError(null);
    try {
      const loc = await SurveyService.getCurrentGpsLocation();
      setFormData(prev => ({
        ...prev,
        latitude: loc.latitude,
        longitude: loc.longitude,
        gpsAccuracy: loc.accuracy,
      }));
      showToast(isMr ? '✅ GPS स्थान यशस्वीरीत्या नोंदवले गेले' : '✅ GPS Coordinates Captured', 'success');
    } catch (err: any) {
      console.error('GPS fetch error:', err);
      setGpsError(err.message || 'Location access denied or unavailable');
      showToast(isMr ? 'GPS स्थान मिळवता आले नाही' : 'GPS capture failed', 'error');
    } finally {
      setIsFetchingGps(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          photoUrl: reader.result as string,
          photoTimestamp: new Date().toISOString(),
        }));
        showToast(isMr ? 'फोटो अपलोड झाला' : 'Photo uploaded', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddDocument = (e: React.ChangeEvent<HTMLInputElement>, docType: 'Aadhaar' | '7/12 Extract' | 'Bank Passbook' | 'FSSAI' | 'Other') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newDoc = {
          id: `DOC-${Date.now()}`,
          name: file.name,
          type: docType,
          fileUrl: reader.result as string,
          uploadedAt: new Date().toISOString(),
        };
        setFormData(prev => ({
          ...prev,
          documents: [...(prev.documents || []), newDoc],
        }));
        showToast(`${docType} ${isMr ? 'दस्तऐवज जोडले' : 'Document attached'}`, 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveDoc = (docId: string) => {
    setFormData(prev => ({
      ...prev,
      documents: (prev.documents || []).filter(d => d.id !== docId),
    }));
  };

  const handleFarmerSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCode = e.target.value;
    const farmer = allFarmers.find(f => f.farmerCode === selectedCode);
    if (farmer) {
      setFormData(prev => ({
        ...prev,
        producerId: farmer.id,
        producerCode: farmer.farmerCode,
        producerName: farmer.farmerName,
        mobileNumber: farmer.mobileNumber,
        alternateNumber: farmer.alternateNumber || '',
        village: farmer.village,
        route: farmer.route,
        linkCenter: farmer.linkCenter || `${farmer.route} Link Center`,
        collectionCenter: farmer.collectionCenter,
        milkType: farmer.milkType,
        dailyMilkPotential: farmer.dailyMilkQuantity,
        cattleCount: farmer.cattleCount,
        fullAddress: farmer.address || `${farmer.village}, Taluka ${prev.taluka || 'Miraj'}, Sangli`,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.producerName || !formData.mobileNumber || !formData.village) {
      showToast(isMr ? 'कृपया सर्व आवश्यक माहिती भरा' : 'Please fill required fields (Name, Mobile, Village)', 'error');
      return;
    }

    const payload: ProducerSurvey = {
      id: formData.id || `SURV-${Date.now()}`,
      producerId: formData.producerId,
      producerCode: formData.producerCode || `P-${Math.floor(100 + Math.random() * 900)}`,
      producerName: formData.producerName,
      mobileNumber: formData.mobileNumber,
      alternateNumber: formData.alternateNumber || '',
      village: formData.village,
      taluka: formData.taluka || 'Miraj',
      district: formData.district || 'Sangli',
      fullAddress: formData.fullAddress || `${formData.village}, ${formData.taluka || 'Miraj'}, Sangli`,
      latitude: formData.latitude,
      longitude: formData.longitude,
      gpsAccuracy: formData.gpsAccuracy,
      route: formData.route || 'RT-101',
      linkCenter: formData.linkCenter || 'Sangli Main Link Center',
      collectionCenter: formData.collectionCenter || `${formData.village} Dairy Center`,
      milkType: (formData.milkType as MilkType) || 'Cow',
      surveyDate: formData.surveyDate || new Date().toISOString().split('T')[0],
      surveyedBy: formData.surveyedBy || currentUser?.name || 'Ramesh Patil',
      surveyedById: formData.surveyedById || currentUser?.id || 'USR-OFFICER-1',
      surveyStatus: (formData.surveyStatus as SurveyStatus) || 'Completed',
      deviceStatus: (formData.deviceStatus as DeviceInstallStatus) || 'Installed',
      deviceInstallationDate: formData.deviceInstallationDate,
      deviceSerialNumber: formData.deviceSerialNumber,
      deviceModel: formData.deviceModel,
      dailyMilkPotential: Number(formData.dailyMilkPotential) || 20,
      cattleCount: Number(formData.cattleCount) || 3,
      surveyRemarks: formData.surveyRemarks || '',
      photoUrl: formData.photoUrl,
      photoTimestamp: formData.photoTimestamp,
      documents: formData.documents || [],
      isActiveProducer: Boolean(formData.isActiveProducer),
      syncedToCloud: true,
      cloudSyncTime: new Date().toISOString(),
      createdAt: formData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = SurveyService.saveSurvey(payload);
    showToast(
      isMr
        ? '✅ उत्पादक सर्वेक्षण यशस्वीरीत्या सेव्ह झाले व क्लाउडवर सिंक झाले!'
        : '✅ Producer survey permanently saved and synced to cloud!',
      'success'
    );
    onSaved(saved);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl border border-emerald-100 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-emerald-700 to-teal-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <FileSpreadsheet className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg leading-tight">
                {surveyToEdit
                  ? isMr
                    ? 'दूध उत्पादक सर्वेक्षण संपादन (Edit Survey)'
                    : 'Edit Producer Survey'
                  : isMr
                  ? 'नवीन दूध उत्पादक सर्वेक्षण नोंदणी (New Survey)'
                  : 'New Producer Survey Registration'}
              </h3>
              <p className="text-xs text-emerald-200">
                {isMr
                  ? 'सर्व माहिती कायमस्वरूपी क्लाउड स्टोरेजवर सुरक्षित जतन होईल'
                  : 'All information will be permanently saved and synced to Firestore Cloud'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5 text-xs sm:text-sm">
          {/* Quick Prepopulate Selector */}
          {!surveyToEdit && (
            <div className="bg-emerald-50 dark:bg-emerald-950/30 p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 font-semibold">
                <User className="w-4 h-4 text-emerald-600" />
                <span>{isMr ? 'विद्यमान गवळ्यांच्या यादीतून निवडा:' : 'Quick Select from Existing Producers:'}</span>
              </div>
              <select
                onChange={handleFarmerSelect}
                className="w-full sm:w-72 bg-white dark:bg-slate-800 border border-emerald-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">-- {isMr ? 'नवीन उत्पादक किंवा विद्यमान निवडा' : 'Select Producer (Optional)'} --</option>
                {allFarmers.map(f => (
                  <option key={f.id} value={f.farmerCode}>
                    [{f.farmerCode}] {f.farmerName} - {f.village} ({f.route})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Section 1: Producer Demographics */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1.5 text-xs sm:text-sm uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              <User className="w-4 h-4" />
              <span>{isMr ? '१. उत्पादक मूलभूत माहिती (Producer Profile)' : '1. Producer Profile & Contacts'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                  {isMr ? 'उत्पादक कोड (Producer Code) *' : 'Producer Code *'}
                </label>
                <div className="relative">
                  <Hash className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={formData.producerCode || ''}
                    onChange={e => setFormData({ ...formData, producerCode: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 font-bold"
                    placeholder="उदा. F-101"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                  {isMr ? 'उत्पादकाचे संपूर्ण नाव (Producer Name) *' : 'Producer Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.producerName || ''}
                  onChange={e => setFormData({ ...formData, producerName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 font-semibold"
                  placeholder={isMr ? 'उदा. तानाजी विठ्ठल पाटील' : 'e.g. Tanaji Vitthal Patil'}
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                  {isMr ? 'मोबाईल नंबर (Primary Mobile) *' : 'Mobile Number *'}
                </label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={formData.mobileNumber || ''}
                    onChange={e => setFormData({ ...formData, mobileNumber: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    placeholder="98XXXXXXXX"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                  {isMr ? 'पर्यायी मोबाईल (Alternate Number)' : 'Alternate Mobile'}
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={formData.alternateNumber || ''}
                  onChange={e => setFormData({ ...formData, alternateNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  placeholder="94XXXXXXXX"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                  {isMr ? 'उत्पादक स्थिती (Active/Inactive)' : 'Producer Status'}
                </label>
                <select
                  value={formData.isActiveProducer ? 'true' : 'false'}
                  onChange={e => setFormData({ ...formData, isActiveProducer: e.target.value === 'true' })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 font-semibold"
                >
                  <option value="true">{isMr ? '🟢 सक्रिय उत्पादक (Active)' : '🟢 Active Producer'}</option>
                  <option value="false">{isMr ? '🔴 निष्क्रिय उत्पादक (Inactive)' : '🔴 Inactive Producer'}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Geographic & Location Details */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1.5 text-xs sm:text-sm uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              <MapPin className="w-4 h-4" />
              <span>{isMr ? '२. भौगोलिक पत्ता व GPS स्थान (Geographic & GPS Location)' : '2. Location & GPS Coordinates'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                  {isMr ? 'गाव (Village) *' : 'Village *'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.village || ''}
                  onChange={e => setFormData({ ...formData, village: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  placeholder={isMr ? 'उदा. माधवनगर' : 'e.g. Madhavnagar'}
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                  {isMr ? 'तालुका (Taluka)' : 'Taluka'}
                </label>
                <input
                  type="text"
                  value={formData.taluka || ''}
                  onChange={e => setFormData({ ...formData, taluka: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  placeholder="उदा. मिरज / वाळवा"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                  {isMr ? 'जिल्हा (District)' : 'District'}
                </label>
                <input
                  type="text"
                  value={formData.district || 'Sangli'}
                  onChange={e => setFormData({ ...formData, district: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  placeholder="सांगली (Sangli)"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                  {isMr ? 'संपूर्ण पत्ता / लँडमार्क (Full Address)' : 'Full Address & Landmarks'}
                </label>
                <input
                  type="text"
                  value={formData.fullAddress || ''}
                  onChange={e => setFormData({ ...formData, fullAddress: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  placeholder={isMr ? 'उदा. मारुती मंदिराशेजारी, मुख्य रस्ता, माधवनगर' : 'Address details'}
                />
              </div>

              {/* GPS Auto Tagging Section */}
              <div className="sm:col-span-3 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                    <Navigation className="w-4 h-4 text-emerald-600 animate-pulse" />
                    <span>{isMr ? 'थेट GPS स्थान रेकॉर्ड करा (Live Geolocation)' : 'Live GPS Geolocation Tagging'}</span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {formData.latitude && formData.longitude ? (
                      <span className="font-mono text-emerald-700 dark:text-emerald-300 font-semibold">
                        📍 Lat: {formData.latitude}, Long: {formData.longitude}{' '}
                        {formData.gpsAccuracy ? `(±${formData.gpsAccuracy}m accuracy)` : ''}
                      </span>
                    ) : (
                      <span>{isMr ? 'अद्याप GPS स्थान जोडले नाही.' : 'No GPS coordinates attached.'}</span>
                    )}
                  </div>
                  {gpsError && <p className="text-xs text-red-500">{gpsError}</p>}
                </div>

                <button
                  type="button"
                  onClick={handleFetchGps}
                  disabled={isFetchingGps}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  <Compass className={`w-4 h-4 ${isFetchingGps ? 'animate-spin' : ''}`} />
                  <span>{isFetchingGps ? (isMr ? 'स्थान शोधत आहे...' : 'Capturing...') : isMr ? 'थेट GPS स्थान घ्या' : 'Capture Live GPS'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Route, Link Center, Milk Potential */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1.5 text-xs sm:text-sm uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              <Route className="w-4 h-4" />
              <span>{isMr ? '३. संकलन मार्ग व केंद्र (Route & Collection Logistics)' : '3. Route, Link Center & Logistics'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                  {isMr ? 'संकलन रूट (Route) *' : 'Route *'}
                </label>
                <select
                  value={formData.route || ''}
                  onChange={e => {
                    const sel = routes.find(r => r.routeNumber === e.target.value);
                    setFormData({
                      ...formData,
                      route: e.target.value,
                      linkCenter: sel?.routeName || formData.linkCenter,
                    });
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 font-semibold"
                >
                  {routes.map(r => (
                    <option key={r.id} value={r.routeNumber}>
                      {r.routeNumber} - {r.routeName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                  {isMr ? 'लिंक केंद्र (Link Center)' : 'Link Center'}
                </label>
                <input
                  type="text"
                  value={formData.linkCenter || ''}
                  onChange={e => setFormData({ ...formData, linkCenter: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  placeholder="उदा. सांगली मुख्य लिंक केंद्र"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                  {isMr ? 'संकलन केंद्र (Collection Center)' : 'Collection Center'}
                </label>
                <input
                  type="text"
                  value={formData.collectionCenter || ''}
                  onChange={e => setFormData({ ...formData, collectionCenter: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  placeholder="उदा. माधवनगर केंद्र १"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                  {isMr ? 'दूध प्रकार (Milk Type)' : 'Milk Type'}
                </label>
                <select
                  value={formData.milkType || 'Cow'}
                  onChange={e => setFormData({ ...formData, milkType: e.target.value as MilkType })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 font-bold"
                >
                  <option value="Cow">🐄 {isMr ? 'गायीचे दूध (Cow)' : 'Cow'}</option>
                  <option value="Buffalo">🐃 {isMr ? 'म्हशीचे दूध (Buffalo)' : 'Buffalo'}</option>
                  <option value="Both">🐄+🐃 {isMr ? 'दोन्ही (Cow & Buffalo)' : 'Both'}</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                  {isMr ? 'दैनिक दूध क्षमता (Litres/Day)' : 'Daily Milk Potential (L)'}
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.dailyMilkPotential || ''}
                  onChange={e => setFormData({ ...formData, dailyMilkPotential: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-700 dark:text-emerald-300"
                  placeholder="उदा. 45"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                  {isMr ? 'एकूण दुभती जनावरे संख्या (Cattle Count)' : 'Total Cattle Count'}
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.cattleCount || ''}
                  onChange={e => setFormData({ ...formData, cattleCount: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 font-bold"
                  placeholder="उदा. 6"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Survey & Online Device Installation Status */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1.5 text-xs sm:text-sm uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              <Smartphone className="w-4 h-4" />
              <span>{isMr ? '४. सर्वेक्षण व ऑनलाइन संकलन डिव्हाइस स्थिती (Device & Survey Status)' : '4. Survey Status & Online Milk Device'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                  {isMr ? 'सर्वेक्षण दिनांक (Survey Date)' : 'Survey Date'}
                </label>
                <input
                  type="date"
                  value={formData.surveyDate || ''}
                  onChange={e => setFormData({ ...formData, surveyDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                  {isMr ? 'सर्वेक्षक अधिकारी (Surveyed By)' : 'Surveyed By'}
                </label>
                <input
                  type="text"
                  value={formData.surveyedBy || ''}
                  onChange={e => setFormData({ ...formData, surveyedBy: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                  {isMr ? 'सर्वेक्षण स्थिती (Survey Status) *' : 'Survey Status *'}
                </label>
                <select
                  value={formData.surveyStatus || 'Completed'}
                  onChange={e => setFormData({ ...formData, surveyStatus: e.target.value as SurveyStatus })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 font-bold"
                >
                  <option value="Completed">✅ {isMr ? 'पूर्ण (Completed)' : 'Completed'}</option>
                  <option value="Pending">⏳ {isMr ? 'प्रलंबित (Pending)' : 'Pending'}</option>
                  <option value="Revisit Required">🔄 {isMr ? 'पुन्हा भेट आवश्यक (Revisit Required)' : 'Revisit Required'}</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                  {isMr ? 'ऑनलाइन दूध संकलन डिव्हाइस स्थिती *' : 'Online Milk Device Status *'}
                </label>
                <select
                  value={formData.deviceStatus || 'Installed'}
                  onChange={e => setFormData({ ...formData, deviceStatus: e.target.value as DeviceInstallStatus })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 font-bold"
                >
                  <option value="Installed">📶 {isMr ? 'इन्स्टॉल झाले आहे (Installed)' : 'Installed'}</option>
                  <option value="Pending">⏳ {isMr ? 'इन्स्टॉलेशन प्रलंबित (Pending)' : 'Pending'}</option>
                  <option value="Not Required">❌ {isMr ? 'आवश्यक नाही (Not Required)' : 'Not Required'}</option>
                </select>
              </div>

              {formData.deviceStatus === 'Installed' && (
                <>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                      {isMr ? 'डिव्हाइस इन्स्टॉलेशन दिनांक' : 'Device Install Date'}
                    </label>
                    <input
                      type="date"
                      value={formData.deviceInstallationDate || ''}
                      onChange={e => setFormData({ ...formData, deviceInstallationDate: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                      {isMr ? 'डिव्हाइस सिरीयल नंबर (Serial No)' : 'Device Serial Number'}
                    </label>
                    <input
                      type="text"
                      value={formData.deviceSerialNumber || ''}
                      onChange={e => setFormData({ ...formData, deviceSerialNumber: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono"
                      placeholder="उदा. MILK-IOT-9921"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                      {isMr ? 'डिव्हाइस मॉडेल / हार्डवेअर तपशील' : 'Device Hardware & Analyzer Model'}
                    </label>
                    <input
                      type="text"
                      value={formData.deviceModel || ''}
                      onChange={e => setFormData({ ...formData, deviceModel: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
                      placeholder="उदा. SmartFAT Digital Milk Analyzer + Auto Stirrer + Weight Scale DPU"
                    />
                  </div>
                </>
              )}

              <div className="sm:col-span-3">
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                  {isMr ? 'सर्वेक्षण शेरा व नोंदी (Survey Remarks)' : 'Survey Remarks & Observations'}
                </label>
                <textarea
                  rows={2}
                  value={formData.surveyRemarks || ''}
                  onChange={e => setFormData({ ...formData, surveyRemarks: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  placeholder={isMr ? 'उदा. गोठा स्वच्छ आहे, सौर ऊर्जा बॅकअप उपलब्ध आहे...' : 'Observations during farm visit...'}
                />
              </div>
            </div>
          </div>

          {/* Section 5: Photo Upload & Required Documents */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1.5 text-xs sm:text-sm uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              <Camera className="w-4 h-4" />
              <span>{isMr ? '५. फोटो व आवश्यक दस्तऐवज (Photo & Documents Upload)' : '5. Farm Photo & KYC Verification Documents'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Photo Upload Card */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-emerald-600" />
                    {isMr ? 'गोठा / उत्पादक फोटो (Farm Photo)' : 'Producer / Farm Photo'}
                  </span>
                  {formData.photoUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, photoUrl: '' })}
                      className="text-red-500 hover:text-red-700 text-xs font-semibold"
                    >
                      {isMr ? 'काढून टाका' : 'Remove'}
                    </button>
                  )}
                </div>

                {formData.photoUrl ? (
                  <div className="relative rounded-lg overflow-hidden border border-emerald-300 dark:border-slate-700 max-h-48 flex items-center justify-center bg-black/5">
                    <img src={formData.photoUrl} alt="Survey Photo" className="max-h-48 w-full object-cover" />
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 cursor-pointer hover:border-emerald-500 transition-colors">
                    <Upload className="w-6 h-6 text-slate-400 mb-1" />
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {isMr ? 'कॅमेरामधून फोटो घ्या किंवा निवडा' : 'Click to take photo / upload'}
                    </span>
                    <span className="text-[10px] text-slate-400">JPG, PNG (Auto-compressed)</span>
                    <input type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                )}
              </div>

              {/* KYC Documents Card */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    {isMr ? 'आवश्यक दस्तऐवज (KYC Documents)' : 'Required KYC Documents'}
                  </span>
                </div>

                {/* Upload Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center justify-center gap-1.5 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-emerald-600" />
                    <span>+ {isMr ? 'आधार कार्ड' : 'Aadhaar'}</span>
                    <input type="file" onChange={e => handleAddDocument(e, 'Aadhaar')} className="hidden" />
                  </label>

                  <label className="flex items-center justify-center gap-1.5 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-emerald-600" />
                    <span>+ {isMr ? '७/१२ उतारा' : '7/12'}</span>
                    <input type="file" onChange={e => handleAddDocument(e, '7/12 Extract')} className="hidden" />
                  </label>

                  <label className="flex items-center justify-center gap-1.5 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-emerald-600" />
                    <span>+ {isMr ? 'पासबुक' : 'Passbook'}</span>
                    <input type="file" onChange={e => handleAddDocument(e, 'Bank Passbook')} className="hidden" />
                  </label>

                  <label className="flex items-center justify-center gap-1.5 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-emerald-600" />
                    <span>+ {isMr ? 'FSSAI परवाना' : 'FSSAI'}</span>
                    <input type="file" onChange={e => handleAddDocument(e, 'FSSAI')} className="hidden" />
                  </label>
                </div>

                {/* Uploaded Documents List */}
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {(formData.documents || []).length === 0 ? (
                    <p className="text-[11px] text-slate-400 text-center py-2">
                      {isMr ? 'अद्याप कोणतेही दस्तऐवज जोडलेले नाहीत' : 'No documents attached yet'}
                    </p>
                  ) : (
                    formData.documents?.map(doc => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-1.5 px-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs"
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="font-semibold">{doc.type}:</span>
                          <span className="text-slate-500 truncate">{doc.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveDoc(doc.id)}
                          className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Modal Actions Footer */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3 sticky bottom-0 bg-white dark:bg-slate-900 pb-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {isMr ? 'रद्द करा' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isMr ? 'कायमस्वरूपी सेव्ह करा (Save & Sync)' : 'Save & Sync to Cloud'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
