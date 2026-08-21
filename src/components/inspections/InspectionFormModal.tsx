import React, { useState } from 'react';
import { X, ClipboardCheck, Save, CheckCircle2, AlertTriangle, ShieldCheck, MapPin } from 'lucide-react';
import { InspectionRecord } from '../../types';
import { MPOStorageService } from '../../services/mpoStorageService';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';

interface InspectionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  inspectionToEdit?: InspectionRecord | null;
  onSaved: () => void;
}

export const InspectionFormModal: React.FC<InspectionFormModalProps> = ({
  isOpen,
  onClose,
  inspectionToEdit,
  onSaved,
}) => {
  const { currentUser } = useAuth();
  const { language } = useLanguage();
  const isMr = language === 'mr';
  const { showToast } = useToast();

  const [inspectionType, setInspectionType] = useState<InspectionRecord['inspectionType']>(
    inspectionToEdit?.inspectionType || 'Milk Quality'
  );
  const [targetName, setTargetName] = useState(inspectionToEdit?.targetName || 'कवठेपिरान संकलन केंद्र');
  const [targetCode, setTargetCode] = useState(inspectionToEdit?.targetCode || 'CC-101');
  const [village, setVillage] = useState(inspectionToEdit?.village || 'कवठेपिरान');
  const [route, setRoute] = useState(inspectionToEdit?.route || 'RT-101');
  const [overallRating, setOverallRating] = useState(inspectionToEdit?.overallRating || 4);
  const [complianceStatus, setComplianceStatus] = useState<InspectionRecord['complianceStatus']>(
    inspectionToEdit?.complianceStatus || 'Compliant'
  );
  const [actionRequired, setActionRequired] = useState(
    inspectionToEdit?.actionRequired || 'नियमित स्वच्छता समाधानकारक, कॅन धुलाईमध्ये आणखी सुधारणा करावी.'
  );
  const [followUpDate, setFollowUpDate] = useState(
    inspectionToEdit?.followUpDate ||
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  // Default checklist items based on type
  const getChecklistForType = (type: InspectionRecord['inspectionType']) => {
    switch (type) {
      case 'Milk Quality':
        return [
          { item: 'दुधाचे तापमान (४°C पेक्षा कमी)', status: 'Pass' as const, remarks: '३.८°C नोंदवले' },
          { item: 'भेसळ तपासणी (युरिया, स्टार्च, डिटर्जंट)', status: 'Pass' as const, remarks: 'सर्व चाचण्या निगेटिव्ह (शुद्ध)' },
          { item: 'MBRT दर्जा चाचणी', status: 'Pass' as const, remarks: '४ तास ५० मिनिटे (उत्कृष्ट दर्जा)' },
          { item: 'फॅट व SNF कॅलिब्रेशन पडताळणी', status: 'Pass' as const, remarks: 'अचूक' },
        ];
      case 'Chilling Center':
        return [
          { item: 'BMC चिलिंग तापमान व कॉम्प्रेसर कार्यक्षमता', status: 'Pass' as const, remarks: '३.५°C चालू' },
          { item: 'जनरेटर (DG Set) बॅकअप व डिझेल उपलब्धता', status: 'Pass' as const, remarks: 'बॅकअप तयार' },
          { item: 'CIP ऑटोमॅटिक क्लिनिंग व सॅनिटायझेशन', status: 'Pass' as const, remarks: 'दैनिक क्लिनिंग पूर्ण' },
          { item: 'दूध साठवणूक टँकर स्वच्छतेची तपासणी', status: 'Pass' as const, remarks: 'योग्य' },
        ];
      case 'Link Center':
        return [
          { item: 'वजनकाटा (Weighing Scale) स्टॅम्पिंग व अचूकता', status: 'Pass' as const, remarks: 'वजनमाप अधिकृत शिक्का वैध' },
          { item: 'मिल्क ॲनालायझर व स्टरर स्वच्छता', status: 'Pass' as const, remarks: 'दैनिक क्लीनरने स्वच्छता आवश्यक' },
          { item: 'दूध कॅन व भांडी निर्जंतुकीकरण', status: 'Pass' as const, remarks: 'गरम पाण्याने धुणे सुरू' },
          { item: 'रजिस्टर व डिजिटल डेटा सिंक', status: 'Pass' as const, remarks: 'अद्ययावत' },
        ];
      default:
        return [
          { item: 'ऑनलाइन दूध संकलन युनिट (DPU/PC) स्थिती', status: 'Pass' as const, remarks: 'सुरू' },
          { item: 'थर्मल पावती प्रिंटर व पेपर रोल', status: 'Pass' as const, remarks: 'योग्य' },
          { item: 'बॅटरी / UPS पॉवर बॅकअप', status: 'Pass' as const, remarks: '२ तास बॅकअप' },
          { item: 'इंटरनेट कनेक्टिव्हिटी व सिम डेटा', status: 'Pass' as const, remarks: '4G सिंक सुरू' },
        ];
    }
  };

  const [checklist, setChecklist] = useState(inspectionToEdit?.checklistItems || getChecklistForType(inspectionType));

  const handleTypeChange = (newType: InspectionRecord['inspectionType']) => {
    setInspectionType(newType);
    setChecklist(getChecklistForType(newType));
  };

  const handleChecklistStatusChange = (index: number, newStatus: 'Pass' | 'Fail' | 'Needs Improvement') => {
    const updated = [...checklist];
    updated[index] = { ...updated[index], status: newStatus };
    setChecklist(updated);

    // Auto-calculate compliance status
    const fails = updated.filter(i => i.status === 'Fail').length;
    const needsImp = updated.filter(i => i.status === 'Needs Improvement').length;
    if (fails > 0) {
      setComplianceStatus('Non-Compliant');
      setOverallRating(2);
    } else if (needsImp > 0) {
      setComplianceStatus('Action Required');
      setOverallRating(3);
    } else {
      setComplianceStatus('Compliant');
      setOverallRating(5);
    }
  };

  const handleRemarkChange = (index: number, remarks: string) => {
    const updated = [...checklist];
    updated[index] = { ...updated[index], remarks };
    setChecklist(updated);
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const inspObj: InspectionRecord = {
      id: inspectionToEdit?.id || `INSP-${Date.now()}`,
      inspectionNumber: inspectionToEdit?.inspectionNumber || `INSP-${Math.floor(1000 + Math.random() * 9000)}`,
      inspectionType,
      targetName,
      targetCode,
      village,
      route,
      officerId: currentUser?.id || 'USR-ADMIN-1',
      officerName: currentUser?.name || 'प्रमोद सावंत (MPO)',
      inspectionDate: new Date().toISOString().split('T')[0],
      checklistItems: checklist,
      overallRating,
      complianceStatus,
      actionRequired,
      followUpDate,
      latitude: 16.8524,
      longitude: 74.5815,
      createdAt: inspectionToEdit?.createdAt || new Date().toISOString(),
    };

    MPOStorageService.saveInspection(inspObj);
    showToast(isMr ? 'तपासणी व गुणवत्ता ऑडिट अहवाल जतन झाला' : 'Inspection saved', 'success');
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
              <ClipboardCheck className="w-5 h-5 text-teal-200" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">
                {inspectionToEdit ? (isMr ? 'तपासणी अहवाल संपादन' : 'Edit Inspection Audit') : (isMr ? 'नवीन फील्ड तपासणी व गुणवत्ता ऑडिट' : 'New Field Inspection & Quality Audit')}
              </h3>
              <p className="text-xs text-teal-200">
                {isMr ? 'दूध गुणवत्ता, चिलिंग सेंटर, वजनकाटा व साधनसामग्री तपासणी' : 'Milk quality, chilling centers, weighing calibration & equipment'}
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
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isMr ? 'तपासणी प्रकार (Inspection Type)' : 'Inspection Type'} *
              </label>
              <select
                value={inspectionType}
                onChange={e => handleTypeChange(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
              >
                <option value="Milk Quality">दूध गुणवत्ता व भेसळ तपासणी (Milk Quality)</option>
                <option value="Chilling Center">चिलिंग सेंटर व BMC तपासणी (Chilling Center)</option>
                <option value="Link Center">लिंक संकलन केंद्र पाहणी (Link Center)</option>
                <option value="Dairy Equipment">डेअरी उपकरणे व वजनकाटा (Dairy Equipment)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isMr ? 'केंद्राचे / ठिकाणाचे नाव' : 'Target / Center Name'} *
              </label>
              <input
                type="text"
                value={targetName}
                onChange={e => setTargetName(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isMr ? 'गाव व रूट' : 'Village & Route'}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={village}
                  onChange={e => setVillage(e.target.value)}
                  placeholder="गाव"
                  className="w-1/2 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
                <input
                  type="text"
                  value={route}
                  onChange={e => setRoute(e.target.value)}
                  placeholder="रूट (RT-101)"
                  className="w-1/2 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isMr ? 'अनुपालन निष्कर्ष (Compliance Status)' : 'Compliance Status'}
              </label>
              <select
                value={complianceStatus}
                onChange={e => setComplianceStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
              >
                <option value="Compliant">सर्व निकष पूर्ण (Compliant)</option>
                <option value="Action Required">सुधारणा आवश्यक (Action Required)</option>
                <option value="Non-Compliant">असमाधानकारक (Non-Compliant)</option>
              </select>
            </div>
          </div>

          {/* Interactive Checklist */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-sm flex items-center gap-1.5">
                <ClipboardCheck className="w-4 h-4 text-teal-600" />
                <span>{isMr ? 'ऑडिट चेकलिस्ट व गुणांकन' : 'Inspection Checklist Items'}</span>
              </h4>
              <span className="text-xs font-bold text-teal-600">
                {checklist.filter(c => c.status === 'Pass').length}/{checklist.length} Passed
              </span>
            </div>

            <div className="space-y-2">
              {checklist.map((item, idx) => (
                <div key={idx} className="p-2.5 bg-white dark:bg-slate-800 rounded-lg border text-xs space-y-1.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{item.item}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleChecklistStatusChange(idx, 'Pass')}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-all ${
                          item.status === 'Pass' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        Pass
                      </button>
                      <button
                        type="button"
                        onClick={() => handleChecklistStatusChange(idx, 'Needs Improvement')}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-all ${
                          item.status === 'Needs Improvement' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        Improve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleChecklistStatusChange(idx, 'Fail')}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-all ${
                          item.status === 'Fail' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        Fail
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={item.remarks}
                    onChange={e => handleRemarkChange(idx, e.target.value)}
                    placeholder="शेरा किंवा मोजमाप..."
                    className="w-full px-2.5 py-1 bg-slate-50 dark:bg-slate-900 border rounded text-[11px]"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Action Required & Follow-up */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isMr ? 'दुरुस्ती कृती योजना (Action Required)' : 'Action Required / CAPA'}
              </label>
              <textarea
                rows={2}
                value={actionRequired}
                onChange={e => setActionRequired(e.target.value)}
                placeholder="तातडीने करावयाची सुधारणा..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isMr ? 'पुनर्तपासणी तारीख (Follow-up Date)' : 'Follow-up Date'}
              </label>
              <input
                type="date"
                value={followUpDate}
                onChange={e => setFollowUpDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono"
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
              className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isMr ? 'तपासणी अहवाल जतन करा' : 'Save Inspection'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
