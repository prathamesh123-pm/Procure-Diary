import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Share2,
  Printer,
  Calendar,
  Clock,
  User as UserIcon,
  PhoneCall,
  CheckCircle2,
  AlertCircle,
  MapPin,
  FileSpreadsheet,
  FileCode,
  Building2,
  Sparkles,
  Save,
  Check,
  RefreshCw,
  QrCode,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { DailyWorkReport } from '../../types';
import { DailyReportService } from '../../services/dailyReportService';
import { ActivityService } from '../../services/activityService';

export const DailyWorkReportGeneratorView: React.FC = () => {
  const { language } = useLanguage();
  const { currentUser } = useAuth();

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [report, setReport] = useState<DailyWorkReport | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [remarks, setRemarks] = useState<string>('');

  const loadReport = (dateStr: string) => {
    setIsGenerating(true);
    setTimeout(() => {
      const generated = DailyReportService.compileDailyReport(dateStr, currentUser);
      setReport(generated);
      setRemarks(generated.manualRemarks || '');
      setIsGenerating(false);
    }, 250);
  };

  useEffect(() => {
    loadReport(selectedDate);
  }, [selectedDate, currentUser]);

  const handleExportPDF = () => {
    if (!report) return;
    DailyReportService.exportReportToPDF({ ...report, manualRemarks: remarks });
    ActivityService.trackActivity({
      activityType: 'pdf_downloaded',
      title: `दैनिक कार्य अहवाल PDF डाउनलोड केला: ${report.date}`,
      description: `अधिकारी: ${report.userName} | कामाचे तास: ${report.totalWorkingHours}`,
      entityType: 'report',
      entityName: `Daily_Report_${report.date}`,
    });
  };

  const handleExportExcel = () => {
    if (!report) return;
    DailyReportService.exportReportToExcel({ ...report, manualRemarks: remarks });
  };

  const handleExportCSV = () => {
    if (!report) return;
    DailyReportService.exportReportToCSV({ ...report, manualRemarks: remarks });
  };

  const handleExportWord = () => {
    if (!report) return;
    DailyReportService.exportReportToWord({ ...report, manualRemarks: remarks });
  };

  const handleSaveToCloud = () => {
    if (!report) return;
    DailyReportService.saveDailyReport({ ...report, manualRemarks: remarks });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleShareWhatsApp = () => {
    if (!report) return;
    const text = `🥛 *प्रोक्युअर डायरी - दैनिक कार्य अहवाल* 🥛
📅 *दिनांक:* ${report.date}
👤 *अधिकारी:* ${report.userName} (${report.employeeId})
⏱️ *कामाचे तास:* ${report.totalWorkingHours}

📊 *आजचे कार्य सारांश:*
• एकूण कॉल्स: ${report.workSummary.totalCallsMade}
• गोठा / केंद्र भेटी: ${report.workSummary.totalVisitsCompleted}
• नवीन उत्पादक नोंद: ${report.workSummary.totalProducersAdded}
• चेकलिस्ट तपासणी: ${report.workSummary.totalChecklistsSubmitted}
• दूध संकलन: ${report.workSummary.totalMilkProcuredLiters || 0} L

📝 *शेरा:* ${remarks || report.manualRemarks}
✅ *निष्कर्ष:* ${report.overallPerformanceSummary}`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');

    ActivityService.trackActivity({
      activityType: 'whatsapp_shared',
      title: `दैनिक अहवाल व्हॉट्सअ‍ॅपवर शेअर केला: ${report.date}`,
      description: `कार्य सारांश व्हॉट्सअ‍ॅपवर पाठवला.`,
      entityType: 'report',
      entityName: `WhatsApp_Report_${report.date}`,
    });
  };

  if (!report) {
    return (
      <div className="p-8 text-center">
        <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-500">दैनिक कार्य अहवाल तयार होत आहे...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Date Filter */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                  {language === 'mr' ? 'दैनिक कार्य अहवाल जनरेटर' : 'Daily Work Report Generator'}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {language === 'mr'
                    ? 'अधिकारी उपस्थिती, कॉल इतिहास, गोठा भेटी व संकलन सारांशाचा अधिकृत अहवाल'
                    : 'Official executive work log, shift summary, and procurement analytics'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <Calendar className="w-4 h-4 text-slate-500" />
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden"
              />
            </div>

            <button
              onClick={() => loadReport(selectedDate)}
              disabled={isGenerating}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              title="Refresh Report"
            >
              <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={handleSaveToCloud}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs shadow-emerald-600/30 transition-all cursor-pointer"
            >
              {isSaved ? <Check className="w-4 h-4 text-emerald-200" /> : <Save className="w-4 h-4" />}
              <span>{isSaved ? (language === 'mr' ? 'क्लाउडवर सेव्ह झाले!' : 'Saved to Cloud!') : language === 'mr' ? 'क्लाउड सेव्ह' : 'Save Cloud'}</span>
            </button>
          </div>
        </div>

        {/* Quick Multi-Format Export Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2.5">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1">
            {language === 'mr' ? 'एक-क्लिक डाउनलोड:' : 'One-Click Exports:'}
          </span>

          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 text-xs font-semibold transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>PDF अहवाल</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Excel (.xlsx)</span>
          </button>

          <button
            onClick={handleExportWord}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-semibold transition-all cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Word (.doc)</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-semibold transition-all cursor-pointer"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer ml-auto"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>WhatsApp शेअर</span>
          </button>
        </div>
      </div>

      {/* Official Report Document Paper Preview */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {/* Printable Official Header */}
        <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-semibold tracking-wide uppercase">
              <Building2 className="w-3 h-3" />
              <span>अधिकृत कार्य अहवाल • Daily Procurement Report</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">प्रोक्युअर डायरी - दूध संकलन व क्षेत्रीय कार्य अहवाल</h2>
            <p className="text-xs text-emerald-100">
              दिनांक: {report.date} | निर्मिती: {new Date(report.generatedAt).toLocaleString('mr-IN')}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xs border border-white/20 rounded-xl p-3 text-center shrink-0">
            <QrCode className="w-10 h-10 mx-auto text-white" />
            <span className="text-[10px] font-mono tracking-wider block mt-1 text-emerald-100">SECURE-VERIFIED</span>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-6">
          {/* 1. Officer & Login Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <UserIcon className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">अधिकारी:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{report.userName}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">कर्मचारी कोड:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{report.employeeId}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <PhoneCall className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">मोबाईल:</span>
                <span>{report.mobileNumber}</span>
              </div>
            </div>

            <div className="space-y-2 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-700 pt-2 md:pt-0 md:pl-4">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">प्रथम लॉगिन वेळ:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{report.loginTime}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">अंतिम सक्रिय वेळ:</span>
                <span>{report.logoutTime || '-'}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">एकूण कामाचे तास:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                  {report.totalWorkingHours}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Work Summary Key Metrics */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>दैनिक कार्य सारांश (Work Summary KPIs)</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">एकूण कॉल्स</span>
                <span className="text-xl font-black text-slate-900 dark:text-slate-100">{report.workSummary.totalCallsMade}</span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">गोठा भेटी</span>
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">{report.workSummary.totalVisitsCompleted}</span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">नवीन नोंद</span>
                <span className="text-xl font-black text-blue-600 dark:text-blue-400">{report.workSummary.totalProducersAdded}</span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">चेकलिस्ट</span>
                <span className="text-xl font-black text-amber-600 dark:text-amber-400">{report.workSummary.totalChecklistsSubmitted}</span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">WhatsApp शेअर</span>
                <span className="text-xl font-black text-teal-600 dark:text-teal-400">{report.workSummary.totalWhatsAppReportsShared}</span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">दूध संकलन</span>
                <span className="text-xl font-black text-purple-600 dark:text-purple-400">{report.workSummary.totalMilkProcuredLiters || 0} L</span>
              </div>
            </div>
          </div>

          {/* 3. Call Activity Table */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
              <PhoneCall className="w-4 h-4 text-emerald-600" />
              <span>कॉल व संपर्क तपशील (Call Activity Table)</span>
            </h3>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-2.5">वेळ</th>
                      <th className="p-2.5">गवळी / शेतकरी नाव</th>
                      <th className="p-2.5">मोबाईल</th>
                      <th className="p-2.5">रूट</th>
                      <th className="p-2.5">प्रकार</th>
                      <th className="p-2.5">कालावधी</th>
                      <th className="p-2.5">उद्देश व चर्चा</th>
                      <th className="p-2.5">स्थिती</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {(report.callDetails || []).length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-4 text-center text-slate-400">
                          या दिनांकास कोणतीही कॉल नोंद आढळली नाही.
                        </td>
                      </tr>
                    ) : (
                      (report.callDetails || []).map((c: any, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="p-2.5 font-mono text-slate-500">{c.time || '10:00'}</td>
                          <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-200">{c.farmerName || c.contactName || '-'}</td>
                          <td className="p-2.5 font-mono text-slate-600 dark:text-slate-400">{c.mobileNumber || '-'}</td>
                          <td className="p-2.5">{c.route || 'RT-101'}</td>
                          <td className="p-2.5">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                c.type === 'incoming'
                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                                  : c.type === 'missed'
                                  ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                              }`}
                            >
                              {c.type === 'incoming' ? 'इनकमिंग' : c.type === 'missed' ? 'मिस्ड' : 'आउटगोइंग'}
                            </span>
                          </td>
                          <td className="p-2.5 text-slate-600 dark:text-slate-400">{c.duration ? `${Math.round(c.duration / 60)} मि.` : '-'}</td>
                          <td className="p-2.5 max-w-xs truncate">{c.callPurpose || c.purpose || c.discussion || 'दूध संकलन चर्चा'}</td>
                          <td className="p-2.5 font-medium text-emerald-600">{c.callStatus || 'पूर्ण'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 4. GPS Field Visits Log */}
          {report.gpsVisitHistory && report.gpsVisitHistory.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>GPS गोठा व केंद्र भेटी (GPS Visit History)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {report.gpsVisitHistory.map((g, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="text-xs space-y-0.5 min-w-0">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">{g.locationName}</span>
                      <p className="text-slate-500 text-[11px] truncate">{g.purpose}</p>
                      <span className="text-[10px] font-mono text-slate-400 block">वेळ: {g.time} • Coords: {g.coords}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Remarks & Overall Performance */}
          <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              अधिकारी शेरा व विशेष नोंदी (Officer Remarks):
            </label>
            <textarea
              rows={2}
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              placeholder="आजच्या संकलन व क्षेत्रीय कामांविषयी शेरा लिहा..."
            />
            <div className="text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700">
              <span className="font-semibold text-slate-700 dark:text-slate-300">कामगिरी निष्कर्ष: </span>
              <span>{report.overallPerformanceSummary}</span>
            </div>
          </div>

          {/* 6. Digital Signature & Official Verification */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="w-36 h-0.5 bg-slate-400 dark:bg-slate-600 mb-2" />
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                डिजिटल स्वाक्षरी: {report.digitalSignature.signedBy}
              </p>
              <p className="text-[11px] text-slate-500">{report.digitalSignature.designation}</p>
              <p className="text-[10px] font-mono text-slate-400">Timestamp: {report.digitalSignature.signedAt}</p>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <div className="w-36 h-0.5 bg-slate-400 dark:bg-slate-600 mb-2 sm:ml-auto" />
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">डेअरी व्यवस्थापक स्वाक्षरी</p>
              <p className="text-[11px] text-slate-500">Authorized Dairy Plant Signatory</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
