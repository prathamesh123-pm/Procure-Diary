import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Calendar,
  Share2,
  Trash2,
  Edit2,
  MapPin,
} from 'lucide-react';
import { InspectionRecord } from '../../types';
import { MPOStorageService } from '../../services/mpoStorageService';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { InspectionFormModal } from './InspectionFormModal';

export const InspectionAuditView: React.FC = () => {
  const { language } = useLanguage();
  const isMr = language === 'mr';
  const { showToast } = useToast();

  const [inspections, setInspections] = useState<InspectionRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInspection, setEditingInspection] = useState<InspectionRecord | null>(null);

  const loadData = () => {
    setInspections(MPOStorageService.getInspections());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('dairy_mpo_updated', loadData);
    return () => window.removeEventListener('dairy_mpo_updated', loadData);
  }, []);

  const handleOpenAdd = () => {
    setEditingInspection(null);
    setIsModalOpen(true);
  };

  const handleEdit = (insp: InspectionRecord) => {
    setEditingInspection(insp);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, num?: string) => {
    if (window.confirm(isMr ? `तपासणी '${num || id}' अहवाल हटवायचा आहे का?` : `Delete inspection ${num || id}?`)) {
      MPOStorageService.deleteInspection(id);
      showToast(isMr ? 'तपासणी अहवाल हटवला' : 'Inspection deleted', 'success');
      loadData();
    }
  };

  const handleShareWhatsApp = (insp: InspectionRecord) => {
    const inspNum = insp.inspectionNumber || insp.referenceCode || insp.id;
    const inspDate = insp.inspectionDate || insp.date || '-';
    const status = insp.complianceStatus || insp.overallResult || 'Completed';
    const items = insp.checklistItems || (insp.items || []).map(i => ({ item: i.parameter, status: i.status, remarks: i.remarks }));
    const actReq = insp.actionRequired || insp.actionPlan || '-';
    const officer = insp.officerName || insp.inspectorName || 'MPO Officer';

    const text = `🔍 *गुणवत्ता व फील्ड तपासणी अहवाल (Inspection Audit)*\n` +
      `📋 *क्रमांक:* ${inspNum} | दिनांक: ${inspDate}\n` +
      `🏢 *ठिकाण/केंद्र:* ${insp.targetName} (${insp.targetCode || '-'})\n` +
      `📍 *गाव/रूट:* ${insp.village} (${insp.route})\n` +
      `🔬 *प्रकार:* ${insp.inspectionType}\n` +
      `📊 *निष्कर्ष:* ${status}\n\n` +
      `📝 *चेकलिस्ट तपशील:*\n` +
      items.map(c => `• ${c.item}: ${c.status === 'Pass' ? '✅ Pass' : '⚠️ ' + c.status} (${c.remarks || '-'})`).join('\n') +
      `\n\n📌 *दुरुस्ती सूचना:* ${actReq}\n` +
      `📅 *पुनर्तपासणी तारीख:* ${insp.followUpDate || insp.correctiveDeadline || 'लागू नाही'}\n` +
      `👨‍💼 *तपासणी अधिकारी:* ${officer}\n\n` +
      `_डेअरी गुणवत्ता नियंत्रण विभाग._`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const filteredInspections = inspections.filter(insp => {
    const inspNum = insp.inspectionNumber || insp.referenceCode || '';
    const status = insp.complianceStatus || insp.overallResult || '';
    const matchSearch =
      insp.targetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inspNum.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insp.village.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = selectedType === 'all' || insp.inspectionType === selectedType;
    const matchStatus = selectedStatus === 'all' || status === selectedStatus;
    return matchSearch && matchType && matchStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-300 rounded-xl">
            <ClipboardCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">
              {isMr ? 'फील्ड तपासणी व गुणवत्ता ऑडिट (Field Inspection & Audit)' : 'Field Inspections & Quality Audits'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {isMr ? 'दूध भेसळ तपासणी, चिलिंग सेंटर (BMC), वजनकाटा व साधनसामग्री ऑडिट' : 'Milk quality, chilling center, weighing calibration & equipment audits'}
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{isMr ? '+ नवीन तपासणी ऑडिट' : '+ New Inspection'}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">{isMr ? 'एकूण तपासण्या' : 'Total Audits'}</span>
            <ClipboardCheck className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-black text-slate-800 dark:text-white">{inspections.length}</p>
          <p className="text-[11px] text-teal-600 mt-1 font-semibold">{isMr ? 'सर्व ऑडिट्स' : 'all recorded audits'}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">{isMr ? 'समाधानकारक (Pass)' : 'Compliant'}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-600">
            {inspections.filter(i => (i.complianceStatus === 'Compliant' || i.overallResult === 'Passed')).length}
          </p>
          <p className="text-[11px] text-emerald-600 mt-1 font-semibold">{isMr ? 'मानकांचे पालन' : 'passed standards'}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">{isMr ? 'असमाधानकारक / कृती आवश्यक' : 'Action Required'}</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-600">
            {inspections.filter(i => (i.complianceStatus === 'Action Required' || i.complianceStatus === 'Non-Compliant' || i.overallResult === 'Action Required')).length}
          </p>
          <p className="text-[11px] text-amber-600 mt-1 font-semibold">{isMr ? 'त्रुटी दुरुस्ती आवश्यक' : 'attention needed'}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder={isMr ? 'शोध (नाव, क्रमांक, गाव)...' : 'Search audit, name, village...'}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm"
            >
              <option value="all">{isMr ? 'सर्व प्रकार (All Types)' : 'All Types'}</option>
              <option value="Milk Quality">Milk Quality</option>
              <option value="Chilling Center">Chilling Center</option>
              <option value="Link Center">Link Center</option>
              <option value="Dairy Equipment">Dairy Equipment</option>
            </select>

            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm"
            >
              <option value="all">{isMr ? 'सर्व स्थिती' : 'All Status'}</option>
              <option value="Compliant">Compliant</option>
              <option value="Action Required">Action Required</option>
              <option value="Non-Compliant">Non-Compliant</option>
            </select>
          </div>
        </div>

        {/* Inspection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredInspections.map(insp => {
            const inspNum = insp.inspectionNumber || insp.referenceCode || insp.id;
            const inspDate = insp.inspectionDate || insp.date || '';
            const status = insp.complianceStatus || (insp.overallResult === 'Passed' ? 'Compliant' : insp.overallResult || 'Compliant');
            const items = insp.checklistItems || (insp.items || []).map(i => ({ item: i.parameter, status: i.status, remarks: i.remarks }));
            const actReq = insp.actionRequired || insp.actionPlan;
            const officer = insp.officerName || insp.inspectorName || 'MPO Officer';

            return (
              <div
                key={insp.id}
                className="p-4 bg-slate-50/70 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 hover:border-teal-400 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top header */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 bg-teal-100 dark:bg-teal-900/50 text-teal-900 dark:text-teal-200 text-xs font-mono font-bold rounded-md">
                          {inspNum}
                        </span>
                        <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-xs font-bold rounded-md">
                          {insp.inspectionType}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base mt-1">
                        {insp.targetName}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{insp.village} ({insp.route})</span>
                        <span className="text-slate-300">•</span>
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{inspDate}</span>
                      </p>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        status === 'Compliant' || status === 'Passed'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                          : status === 'Non-Compliant' || status === 'Critical Non-Compliance'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                      }`}
                    >
                      {status}
                    </span>
                  </div>

                  {/* Checklist Summary */}
                  {items.length > 0 && (
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 my-2 space-y-1.5 text-xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Checklist Summary</span>
                      {items.map((c, i) => (
                        <div key={i} className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-700 dark:text-slate-300">{c.item}</span>
                          <span
                            className={`font-mono font-bold ${
                              c.status === 'Pass'
                                ? 'text-emerald-600'
                                : c.status === 'Fail'
                                ? 'text-rose-600'
                                : 'text-amber-600'
                            }`}
                          >
                            {c.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Corrective Action */}
                  {actReq && (
                    <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 rounded-lg text-xs text-amber-900 dark:text-amber-300 space-y-0.5">
                      <span className="font-bold text-[10px] uppercase block">Action Required:</span>
                      <span>{actReq}</span>
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-serif italic">
                    {isMr ? 'ऑडिटर:' : 'Auditor:'} {officer}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleShareWhatsApp(insp)}
                      className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg cursor-pointer"
                      title="Share Audit via WhatsApp"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(insp)}
                      className="p-1.5 text-slate-600 hover:text-teal-700 dark:text-slate-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(insp.id, inspNum)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      <InspectionFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        inspectionToEdit={editingInspection}
        onSaved={loadData}
      />
    </div>
  );
};
