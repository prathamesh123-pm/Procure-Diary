import React from 'react';
import {
  X,
  MapPin,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Clock,
  Building2,
  Route,
  Milk,
  FileText,
  Camera,
  Calendar,
  User,
  Navigation,
  Share2,
  Download,
  Trash2,
  Edit,
} from 'lucide-react';
import { ProducerSurvey } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

interface SurveyDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  survey: ProducerSurvey | null;
  onEdit?: (survey: ProducerSurvey) => void;
  onDelete?: (id: string) => void;
}

export const SurveyDetailModal: React.FC<SurveyDetailModalProps> = ({
  isOpen,
  onClose,
  survey,
  onEdit,
  onDelete,
}) => {
  const { language } = useLanguage();
  const isMr = language === 'mr';
  const { isAdmin, isSupervisor } = useAuth();

  if (!isOpen || !survey) return null;

  const handleOpenGoogleMaps = () => {
    if (survey.latitude && survey.longitude) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${survey.latitude},${survey.longitude}`,
        '_blank'
      );
    } else {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${survey.fullAddress || survey.village}, Sangli, Maharashtra`
        )}`,
        '_blank'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl border border-emerald-100 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-emerald-700 to-teal-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <Milk className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg leading-tight">
                  {survey.producerName}
                </h3>
                <span className="px-2 py-0.5 text-xs font-mono font-bold bg-white/20 rounded">
                  {survey.producerCode}
                </span>
              </div>
              <p className="text-xs text-emerald-200">
                {survey.village} ({survey.taluka}, {survey.district}) | रूट: {survey.route}
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

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs sm:text-sm">
          {/* Status Badges Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">{isMr ? 'सर्वेक्षण स्थिती' : 'Survey Status'}</span>
              <span
                className={`font-black text-xs sm:text-sm inline-flex items-center gap-1 mt-0.5 ${
                  survey.surveyStatus === 'Completed'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : survey.surveyStatus === 'Pending'
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {survey.surveyStatus === 'Completed' ? '✅ ' : survey.surveyStatus === 'Pending' ? '⏳ ' : '🔄 '}
                {survey.surveyStatus}
              </span>
            </div>

            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">{isMr ? 'डिव्हाइस स्थिती' : 'Device Status'}</span>
              <span
                className={`font-black text-xs sm:text-sm inline-flex items-center gap-1 mt-0.5 ${
                  survey.deviceStatus === 'Installed'
                    ? 'text-teal-600 dark:text-teal-400'
                    : survey.deviceStatus === 'Pending'
                    ? 'text-orange-600 dark:text-orange-400'
                    : 'text-slate-500'
                }`}
              >
                {survey.deviceStatus === 'Installed' ? '📶 ' : survey.deviceStatus === 'Pending' ? '⏳ ' : '❌ '}
                {survey.deviceStatus}
              </span>
            </div>

            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">{isMr ? 'दूध प्रकार' : 'Milk Type'}</span>
              <span className="font-black text-slate-900 dark:text-white text-xs sm:text-sm mt-0.5 block">
                {survey.milkType === 'Cow' ? '🐄 Cow' : survey.milkType === 'Buffalo' ? '🐃 Buffalo' : '🐄+🐃 Both'}
              </span>
            </div>

            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">{isMr ? 'दैनिक क्षमता' : 'Daily Potential'}</span>
              <span className="font-black text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm mt-0.5 block">
                {survey.dailyMilkPotential || 0} Ltr / day
              </span>
            </div>
          </div>

          {/* Photo & GPS Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Photo */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 mb-2">
                <Camera className="w-4 h-4 text-emerald-600" />
                <span>{isMr ? 'गोठा / उत्पादक फोटो' : 'Farm & Producer Photo'}</span>
              </div>
              {survey.photoUrl ? (
                <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                  <img src={survey.photoUrl} alt="Producer Farm" className="w-full h-44 object-cover" />
                </div>
              ) : (
                <div className="h-44 bg-slate-100 dark:bg-slate-800 rounded-lg flex flex-col items-center justify-center text-slate-400">
                  <Camera className="w-8 h-8 mb-1" />
                  <span className="text-xs">{isMr ? 'फोटो उपलब्ध नाही' : 'No photo uploaded'}</span>
                </div>
              )}
            </div>

            {/* GPS & Address Card */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>{isMr ? 'भौगोलिक स्थान व पत्ता' : 'GPS Coordinates & Location'}</span>
                </div>
                <button
                  onClick={handleOpenGoogleMaps}
                  className="text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{isMr ? 'मॅप उघडा' : 'Open Maps'}</span>
                </button>
              </div>

              <div className="space-y-1 text-xs">
                <p className="text-slate-700 dark:text-slate-300 font-medium">
                  <strong>{isMr ? 'पत्ता:' : 'Address:'}</strong> {survey.fullAddress || `${survey.village}, Taluka ${survey.taluka}, Sangli`}
                </p>
                <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 font-mono text-[11px]">
                  {survey.latitude && survey.longitude ? (
                    <div>
                      <p className="text-emerald-700 dark:text-emerald-300 font-bold">
                        📍 Latitude: {survey.latitude}
                      </p>
                      <p className="text-emerald-700 dark:text-emerald-300 font-bold">
                        📍 Longitude: {survey.longitude}
                      </p>
                      {survey.gpsAccuracy && <p className="text-slate-400">GPS Accuracy: ±{survey.gpsAccuracy}m</p>}
                    </div>
                  ) : (
                    <p className="text-slate-400">{isMr ? 'GPS को-ऑर्डिनेट्स उपलब्ध नाहीत' : 'Coordinates not recorded'}</p>
                  )}
                </div>
              </div>

              {/* Online Device Details */}
              {survey.deviceStatus === 'Installed' && (
                <div className="p-2.5 bg-teal-50/80 dark:bg-teal-950/40 rounded-xl border border-teal-200 dark:border-teal-900/60 space-y-1 text-xs">
                  <div className="flex items-center justify-between font-bold text-teal-900 dark:text-teal-300">
                    <span>📶 {isMr ? 'डिव्हाइस सिरीयल:' : 'Device Serial:'} {survey.deviceSerialNumber || 'MILK-IOT-9921'}</span>
                    <span className="text-[10px] bg-teal-100 dark:bg-teal-900 px-1.5 py-0.5 rounded">Active Sync</span>
                  </div>
                  <p className="text-[11px] text-teal-800 dark:text-teal-300 truncate">
                    {survey.deviceModel || 'SmartFAT Digital Analyzer + Cloud DPU'}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {isMr ? 'इन्स्टॉलेशन दिनांक:' : 'Install Date:'} {survey.deviceInstallationDate || survey.surveyDate}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Details Grid */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block">{isMr ? 'मोबाईल नंबर' : 'Primary Mobile'}</span>
              <a href={`tel:${survey.mobileNumber}`} className="font-bold text-emerald-600 hover:underline">
                📞 {survey.mobileNumber}
              </a>
            </div>
            {survey.alternateNumber && (
              <div>
                <span className="text-slate-400 block">{isMr ? 'पर्यायी मोबाईल' : 'Alternate Mobile'}</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{survey.alternateNumber}</span>
              </div>
            )}
            <div>
              <span className="text-slate-400 block">{isMr ? 'रूट व संकलन केंद्र' : 'Route & Center'}</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {survey.route} - {survey.collectionCenter}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">{isMr ? 'लिंक केंद्र' : 'Link Center'}</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{survey.linkCenter}</span>
            </div>
            <div>
              <span className="text-slate-400 block">{isMr ? 'सर्वेक्षण दिनांक' : 'Survey Date'}</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{survey.surveyDate}</span>
            </div>
            <div>
              <span className="text-slate-400 block">{isMr ? 'सर्वेक्षक अधिकारी' : 'Surveyed By'}</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{survey.surveyedBy}</span>
            </div>
          </div>

          {/* Remarks */}
          {survey.surveyRemarks && (
            <div className="p-3 bg-amber-50/80 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/60 text-xs">
              <span className="font-bold text-amber-900 dark:text-amber-300 block mb-1">
                📝 {isMr ? 'सर्वेक्षण शेरा व निरीक्षण:' : 'Survey Remarks & Field Notes:'}
              </span>
              <p className="text-slate-700 dark:text-slate-300">{survey.surveyRemarks}</p>
            </div>
          )}

          {/* Attached Documents */}
          {survey.documents && survey.documents.length > 0 && (
            <div className="space-y-2">
              <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                📎 {isMr ? 'जोडलेले दस्तऐवज (Attached Documents):' : 'Attached KYC Documents:'}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {survey.documents.map(doc => (
                  <div
                    key={doc.id}
                    className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div className="truncate">
                        <p className="font-bold text-slate-800 dark:text-slate-200">{doc.type}</p>
                        <p className="text-[10px] text-slate-400 truncate">{doc.name}</p>
                      </div>
                    </div>
                    {doc.fileUrl && (
                      <a
                        href={doc.fileUrl}
                        download={doc.name}
                        className="px-2 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded font-semibold text-[10px] hover:bg-emerald-200 cursor-pointer"
                      >
                        {isMr ? 'डाउनलोड' : 'Download'}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>{isMr ? 'क्लाउडवर सुरक्षित सेव्ह आहे' : 'Firestore Cloud Synced'}</span>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(survey.id)}
                className="px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 font-semibold hover:bg-red-50 dark:hover:bg-red-950/40 text-xs flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isMr ? 'हटवा' : 'Delete'}</span>
              </button>
            )}

            {(isAdmin || isSupervisor) && onEdit && (
              <button
                type="button"
                onClick={() => onEdit(survey)}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>{isMr ? 'संपादन करा' : 'Edit Survey'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs hover:bg-slate-300 dark:hover:bg-slate-700 cursor-pointer"
            >
              {isMr ? 'बंद करा' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
