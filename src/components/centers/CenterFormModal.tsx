import React, { useState } from 'react';
import { X, Building2, Milk, MapPin, Phone, User, Calendar, ShieldCheck, AlertCircle, Save, Smartphone } from 'lucide-react';
import { LinkCenter, CollectionCenter } from '../../types';
import { MPOStorageService } from '../../services/mpoStorageService';
import { StorageService } from '../../services/storageService';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';

interface CenterFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'link' | 'collection';
  centerToEdit?: LinkCenter | CollectionCenter | null;
  onSaved: () => void;
}

export const CenterFormModal: React.FC<CenterFormModalProps> = ({
  isOpen,
  onClose,
  type,
  centerToEdit,
  onSaved,
}) => {
  const { language } = useLanguage();
  const isMr = language === 'mr';
  const { showToast } = useToast();
  const availableRoutes = StorageService.getRoutes();
  const linkCenters = MPOStorageService.getLinkCenters();

  // Common Form States
  const [centerCode, setCenterCode] = useState(
    centerToEdit?.centerCode || (type === 'link' ? `LC-${Date.now().toString().slice(-3)}` : `CC-${Date.now().toString().slice(-3)}`)
  );
  const [centerName, setCenterName] = useState(centerToEdit?.centerName || '');
  const [inchargeName, setInchargeName] = useState(
    type === 'link' ? (centerToEdit as LinkCenter)?.inchargeName || '' : (centerToEdit as CollectionCenter)?.secretaryName || ''
  );
  const [mobileNumber, setMobileNumber] = useState(
    type === 'link' ? (centerToEdit as LinkCenter)?.mobileNumber || '' : (centerToEdit as CollectionCenter)?.secretaryMobile || ''
  );
  const [village, setVillage] = useState((centerToEdit as CollectionCenter)?.village || '');
  const [taluka, setTaluka] = useState(centerToEdit?.taluka || 'Miraj');
  const [route, setRoute] = useState((centerToEdit as CollectionCenter)?.route || 'RT-101');
  const [linkCenterId, setLinkCenterId] = useState((centerToEdit as CollectionCenter)?.linkCenterId || 'LC-01');
  const [address, setAddress] = useState((centerToEdit as LinkCenter)?.address || '');
  const [chillingCapacity, setChillingCapacity] = useState((centerToEdit as LinkCenter)?.chillingCapacityLiters || 5000);
  const [morningTiming, setMorningTiming] = useState((centerToEdit as CollectionCenter)?.morningTiming || '06:00 AM - 08:30 AM');
  const [eveningTiming, setEveningTiming] = useState((centerToEdit as CollectionCenter)?.eveningTiming || '05:30 PM - 08:00 PM');
  const [hasElectronicAnalyzer, setHasElectronicAnalyzer] = useState((centerToEdit as CollectionCenter)?.hasElectronicAnalyzer ?? true);
  const [analyzerSerialNumber, setAnalyzerSerialNumber] = useState((centerToEdit as CollectionCenter)?.analyzerSerialNumber || '');
  const [fssaiNumber, setFssaiNumber] = useState(centerToEdit?.fssaiNumber || '');
  const [fssaiExpiryDate, setFssaiExpiryDate] = useState(centerToEdit?.fssaiExpiryDate || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!centerName.trim()) {
      showToast(isMr ? 'कृपया केंद्राचे नाव टाका' : 'Please enter center name', 'error');
      return;
    }

    if (type === 'link') {
      const linkObj: LinkCenter = {
        id: centerToEdit?.id || `LC-${Date.now()}`,
        centerCode,
        centerName,
        inchargeName,
        mobileNumber,
        taluka,
        district: 'Sangli',
        address,
        assignedRouteIds: ['RT-101', 'RT-102'],
        chillingCapacityLiters: Number(chillingCapacity) || 5000,
        dailyAverageCollection: (centerToEdit as LinkCenter)?.dailyAverageCollection || 4500,
        equipmentStatus: 'Operational',
        status: 'Active',
        fssaiNumber,
        fssaiExpiryDate,
        createdAt: centerToEdit?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      MPOStorageService.saveLinkCenter(linkObj);
      showToast(isMr ? 'लिंक केंद्र सेव्ह झाले' : 'Link center saved', 'success');
    } else {
      const selectedLC = linkCenters.find(l => l.id === linkCenterId);
      const collObj: CollectionCenter = {
        id: centerToEdit?.id || `CC-${Date.now()}`,
        centerCode,
        centerName,
        village: village || centerName,
        taluka,
        route,
        linkCenterId,
        linkCenterName: selectedLC ? selectedLC.centerName : 'सांगली मुख्य लिंक केंद्र',
        secretaryName: inchargeName,
        secretaryMobile: mobileNumber,
        morningTiming,
        eveningTiming,
        dailyAverageCowLiters: (centerToEdit as CollectionCenter)?.dailyAverageCowLiters || 800,
        dailyAverageBuffaloLiters: (centerToEdit as CollectionCenter)?.dailyAverageBuffaloLiters || 400,
        totalProducersCount: (centerToEdit as CollectionCenter)?.totalProducersCount || 25,
        hasElectronicAnalyzer,
        analyzerSerialNumber,
        hasDPU: true,
        status: 'Active',
        fssaiNumber,
        fssaiExpiryDate,
        createdAt: centerToEdit?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      MPOStorageService.saveCollectionCenter(collObj);
      showToast(isMr ? 'दूध संकलन केंद्र सेव्ह झाले' : 'Collection center saved', 'success');
    }

    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-teal-700 to-emerald-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              {type === 'link' ? <Building2 className="w-5 h-5 text-teal-200" /> : <Milk className="w-5 h-5 text-emerald-200" />}
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">
                {type === 'link'
                  ? centerToEdit ? (isMr ? 'लिंक केंद्र संपादन' : 'Edit Link Center') : (isMr ? 'नवीन लिंक केंद्र नोंदवा' : 'Add Link Center')
                  : centerToEdit ? (isMr ? 'संकलन केंद्र संपादन' : 'Edit Collection Center') : (isMr ? 'नवीन दूध संकलन केंद्र नोंदवा' : 'Add Collection Center')}
              </h3>
              <p className="text-xs text-teal-200">
                {type === 'link' ? (isMr ? 'मुख्य हब, चिलिंग क्षमता व अधिकारी' : 'Main Hub, Chilling Capacity & In-charge') : (isMr ? 'गाव संकलन केंद्र, सचिव व विश्लेषक यंत्र' : 'Village Center, Secretary & Analyzer')}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-teal-200 hover:text-white hover:bg-white/10 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Center Code */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isMr ? 'केंद्र कोड (Center Code)' : 'Center Code'} *
              </label>
              <input
                type="text"
                value={centerCode}
                onChange={e => setCenterCode(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold"
              />
            </div>

            {/* Center Name */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isMr ? 'केंद्राचे नाव (Center Name)' : 'Center Name'} *
              </label>
              <input
                type="text"
                value={centerName}
                onChange={e => setCenterName(e.target.value)}
                placeholder={type === 'link' ? 'सांगली मुख्य लिंक केंद्र' : 'कवठेपिरान दूध संकलन केंद्र'}
                required
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>

            {/* Incharge / Secretary */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {type === 'link' ? (isMr ? 'केंद्र प्रमुख नाव (In-charge)' : 'In-charge Name') : (isMr ? 'सचिव / ऑपरेटर नाव (Secretary)' : 'Secretary Name')}
              </label>
              <input
                type="text"
                value={inchargeName}
                onChange={e => setInchargeName(e.target.value)}
                placeholder="उदा. संजय पाटील"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isMr ? 'मोबाईल नंबर (Contact Mobile)' : 'Mobile Number'}
              </label>
              <input
                type="tel"
                value={mobileNumber}
                onChange={e => setMobileNumber(e.target.value)}
                placeholder="9822000000"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
              />
            </div>

            {/* Taluka */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isMr ? 'तालुका (Taluka)' : 'Taluka'}
              </label>
              <select
                value={taluka}
                onChange={e => setTaluka(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              >
                <option value="Miraj">मिरज (Miraj)</option>
                <option value="Walwa">वाळवा / इस्लामपूर (Walwa)</option>
                <option value="Tasgaon">तासगाव (Tasgaon)</option>
                <option value="Kadegaon">कडेगाव (Kadegaon)</option>
                <option value="Shirala">शिराळा (Shirala)</option>
                <option value="Khanapur">खानापूर (Khanapur)</option>
                <option value="Palus">पलूस (Palus)</option>
                <option value="Jat">जत (Jat)</option>
              </select>
            </div>

            {/* If Collection Center: Route & Village & Link Center */}
            {type === 'collection' && (
              <>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isMr ? 'गाव (Village)' : 'Village'}
                  </label>
                  <input
                    type="text"
                    value={village}
                    onChange={e => setVillage(e.target.value)}
                    placeholder="उदा. कवठेपिरान"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isMr ? 'संलग्न रूट (Assigned Route)' : 'Route'}
                  </label>
                  <select
                    value={route}
                    onChange={e => setRoute(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    {availableRoutes.map(r => (
                      <option key={r.id} value={r.routeNumber}>
                        {r.routeNumber} - {r.routeName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isMr ? 'संलग्न मुख्य लिंक केंद्र (Link Center)' : 'Parent Link Center'}
                  </label>
                  <select
                    value={linkCenterId}
                    onChange={e => setLinkCenterId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    {linkCenters.map(lc => (
                      <option key={lc.id} value={lc.id}>
                        {lc.centerCode} - {lc.centerName}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* If Link Center: Chilling capacity & Address */}
            {type === 'link' && (
              <>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isMr ? 'बीएमसी चिलिंग क्षमता (Liters)' : 'Chilling Capacity (Ltr)'}
                  </label>
                  <input
                    type="number"
                    value={chillingCapacity}
                    onChange={e => setChillingCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isMr ? 'पत्ता व स्थान (Address)' : 'Address'}
                  </label>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </>
            )}

            {/* Collection timings for collection center */}
            {type === 'collection' && (
              <>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isMr ? 'सकाळची वेळ (Morning Timing)' : 'Morning Timing'}
                  </label>
                  <input
                    type="text"
                    value={morningTiming}
                    onChange={e => setMorningTiming(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isMr ? 'संध्याकाळची वेळ (Evening Timing)' : 'Evening Timing'}
                  </label>
                  <input
                    type="text"
                    value={eveningTiming}
                    onChange={e => setEveningTiming(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isMr ? 'इलेक्ट्रॉनिक विश्लेषक सिरीयल (Analyzer Sr.)' : 'Analyzer Serial'}
                  </label>
                  <input
                    type="text"
                    value={analyzerSerialNumber}
                    onChange={e => setAnalyzerSerialNumber(e.target.value)}
                    placeholder="MILK-SCAN-XXXX"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>
              </>
            )}

            {/* FSSAI Registration */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isMr ? 'FSSAI परवाना क्रमांक (FSSAI No.)' : 'FSSAI License No.'}
              </label>
              <input
                type="text"
                value={fssaiNumber}
                onChange={e => setFssaiNumber(e.target.value)}
                placeholder="11524036000XXX"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isMr ? 'FSSAI समाप्ती दिनांक (Expiry Date)' : 'FSSAI Expiry Date'}
              </label>
              <input
                type="date"
                value={fssaiExpiryDate}
                onChange={e => setFssaiExpiryDate(e.target.value)}
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
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isMr ? 'जतन करा' : 'Save Center'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
