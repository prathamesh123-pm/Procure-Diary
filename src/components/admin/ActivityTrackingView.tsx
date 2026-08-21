import React, { useState, useEffect } from 'react';
import {
  Activity,
  Search,
  Filter,
  Download,
  Calendar,
  Smartphone,
  Globe,
  MapPin,
  Clock,
  Shield,
  User,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Trash2,
  History,
  Wifi,
  WifiOff,
  RotateCw,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useLanguage } from '../../context/LanguageContext';
import { ActivityLog, ActivityType } from '../../types';
import { ActivityService } from '../../services/activityService';
import { PDFService } from '../../services/pdfService';

export const ActivityTrackingView: React.FC = () => {
  const { language } = useLanguage();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const loadData = () => {
    setIsRefreshing(true);
    const list = ActivityService.getActivities();
    setActivities(list);
    setSearchHistory(ActivityService.getSearchHistory());
    setTimeout(() => setIsRefreshing(false), 200);
  };

  useEffect(() => {
    loadData();
    const handleActivityLogged = () => loadData();
    window.addEventListener('dairy_activity_logged', handleActivityLogged);
    return () => window.removeEventListener('dairy_activity_logged', handleActivityLogged);
  }, []);

  const handleSearchSubmit = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      ActivityService.addSearchHistory(query);
      setSearchHistory(ActivityService.getSearchHistory());
      ActivityService.trackActivity({
        activityType: 'search_performed',
        title: `शोध घेतला (Search): "${query}"`,
        description: `अ‍ॅक्टिव्हिटी लॉग शोध क्वेरी`,
        details: { query },
      });
    }
  };

  const filteredActivities = activities.filter(a => {
    if (selectedType !== 'all' && a.activityType !== selectedType) return false;
    if (selectedDate && a.date !== selectedDate) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = a.title.toLowerCase().includes(q);
      const matchDesc = a.description.toLowerCase().includes(q);
      const matchUser = a.userName.toLowerCase().includes(q);
      const matchDevice = a.deviceName.toLowerCase().includes(q);
      const matchEntity = (a.entityName || '').toLowerCase().includes(q);
      return matchTitle || matchDesc || matchUser || matchDevice || matchEntity;
    }
    return true;
  });

  const handleExportExcel = () => {
    const data = filteredActivities.map(a => ({
      ID: a.id,
      Date: a.date,
      Time: a.time,
      User: a.userName,
      Role: a.userRole || 'officer',
      ActivityType: a.activityType,
      Title: a.title,
      Description: a.description,
      Device: a.deviceName,
      OS: a.osVersion,
      Browser: a.browser,
      Network: a.internetStatus,
      GPS: a.gpsLocation ? `${a.gpsLocation.latitude}, ${a.gpsLocation.longitude}` : 'N/A',
      IPAddress: a.ipAddress || '127.0.0.1',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Activity Audit Log');
    XLSX.writeFile(wb, `Dairy_Activity_Log_${new Date().toISOString().split('T')[0]}.xlsx`);

    ActivityService.trackActivity({
      activityType: 'excel_exported',
      title: 'अ‍ॅक्टिव्हिटी लॉग एक्सेल फाईल निर्यात केली',
      description: `${filteredActivities.length} नोंदी एक्सेलमध्ये डाऊनलोड केल्या.`,
    });
  };

  const getActivityBadgeColor = (type: ActivityType) => {
    switch (type) {
      case 'login':
      case 'logout':
        return 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'supplier_added':
      case 'producer_added':
      case 'link_center_added':
      case 'cattle_shed_added':
        return 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'call_logged':
      case 'call_tracked':
        return 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'pdf_downloaded':
      case 'excel_exported':
      case 'report_created':
        return 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'gps_visit':
        return 'bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800';
      case 'whatsapp_shared':
        return 'bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800';
      case 'backup_completed':
      case 'sync_completed':
        return 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                  {language === 'mr' ? 'स्वयंचलित कार्य व कृती ट्रॅकिंग (Auto Activity Log)' : 'Auto Activity Tracking System'}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {language === 'mr'
                    ? 'वापरकर्त्याच्या प्रत्येक कृतीची अचूक वेळ, डिव्हाइस, GPS व नेटवर्क स्थितीसह स्वयंचलित नोंद'
                    : 'Automated real-time audit trail capturing all user actions, devices, GPS, and sync telemetry'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={loadData}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              title="Refresh Activity Log"
            >
              <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs shadow-emerald-600/30 transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{language === 'mr' ? 'एक्सेल निर्यात' : 'Export Excel'}</span>
            </button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={language === 'mr' ? 'कृती, अधिकारी, गवळी शोधा...' : 'Search activity, user, gavali...'}
              value={searchQuery}
              onChange={e => handleSearchSubmit(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Activity Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={e => {
                setSelectedType(e.target.value);
                ActivityService.trackActivity({
                  activityType: 'filter_used',
                  title: `फिल्टर वापरला: ${e.target.value}`,
                  description: `प्रकारानुसार अ‍ॅक्टिव्हिटी फिल्टर`,
                });
              }}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden"
            >
              <option value="all">सर्व कृती (All Activities)</option>
              <option value="login">लॉगिन / लॉगआउट (Login/Logout)</option>
              <option value="supplier_added">नवीन गवळी / उत्पादक नोंद</option>
              <option value="call_logged">कॉल व संपर्क (Calls)</option>
              <option value="gps_visit">GPS गोठा / केंद्र भेट</option>
              <option value="pdf_downloaded">अहवाल डाउनलोड (PDF/Excel)</option>
              <option value="whatsapp_shared">व्हॉट्सअ‍ॅप शेअर (WhatsApp)</option>
              <option value="checklist_submitted">चेकलिस्ट / तपासणी</option>
              <option value="backup_completed">क्लाउड बॅकअप / सिंक</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden"
            />
            {selectedDate && (
              <button onClick={() => setSelectedDate('')} className="text-slate-400 hover:text-slate-600 text-xs">
                ✕
              </button>
            )}
          </div>

          {/* Results Counter */}
          <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-xs text-purple-800 dark:text-purple-300 font-semibold">
            <span>नोंदी संख्या:</span>
            <span className="font-bold">{filteredActivities.length}</span>
          </div>
        </div>

        {/* Search History Chips */}
        {searchHistory.length > 0 && (
          <div className="mt-3 flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mr-1">
              <History className="w-3 h-3" />
              {language === 'mr' ? 'शोध इतिहास:' : 'Search History:'}
            </span>
            {searchHistory.slice(0, 6).map((item, idx) => (
              <button
                key={idx}
                onClick={() => setSearchQuery(item)}
                className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[11px] text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              >
                {item}
              </button>
            ))}
            <button
              onClick={() => {
                ActivityService.clearSearchHistory();
                setSearchHistory([]);
              }}
              className="text-[10px] text-slate-400 hover:text-red-500 ml-1 underline cursor-pointer"
            >
              साफ करा
            </button>
          </div>
        )}
      </div>

      {/* Activity Timeline List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-purple-600" />
          <span>कृती कालरेषा व ऑडिट इतिहास (Real-Time Audit Timeline)</span>
        </h2>

        {filteredActivities.length === 0 ? (
          <div className="p-8 text-center text-slate-400 space-y-2">
            <Activity className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
            <p className="text-xs">कोणतीही अ‍ॅक्टिव्हिटी नोंद उपलब्ध नाही.</p>
          </div>
        ) : (
          <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
            {filteredActivities.map((act) => (
              <div key={act.id} className="relative group">
                {/* Timeline Node */}
                <div className="absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full bg-white dark:bg-slate-900 border-2 border-purple-500 shrink-0 group-hover:scale-125 transition-transform" />

                <div className="bg-slate-50 dark:bg-slate-800/40 hover:bg-purple-50/40 dark:hover:bg-purple-950/20 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 transition-all space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getActivityBadgeColor(act.activityType)}`}>
                        {act.activityType.toUpperCase().replace('_', ' ')}
                      </span>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">{act.title}</h3>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 shrink-0">
                      <span>{act.date}</span>
                      <span>•</span>
                      <span>{act.time}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300">{act.description}</p>

                  {/* Metadata Chips: User, Device, GPS, Network */}
                  <div className="flex items-center gap-3 pt-1 text-[10px] text-slate-500 dark:text-slate-400 flex-wrap border-t border-slate-200/60 dark:border-slate-800/60">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      <b>{act.userName}</b>
                    </span>

                    <span className="flex items-center gap-1">
                      <Smartphone className="w-3 h-3 text-slate-400" />
                      <span>{act.deviceName} ({act.osVersion})</span>
                    </span>

                    {act.gpsLocation && (
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <MapPin className="w-3 h-3" />
                        <span>GPS: {act.gpsLocation.address || `${act.gpsLocation.latitude}, ${act.gpsLocation.longitude}`}</span>
                      </span>
                    )}

                    <span className="flex items-center gap-1">
                      {act.internetStatus === 'online' ? (
                        <Wifi className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <WifiOff className="w-3 h-3 text-amber-500" />
                      )}
                      <span>{act.internetStatus.toUpperCase()}</span>
                    </span>

                    {act.ipAddress && (
                      <span className="font-mono text-slate-400">IP: {act.ipAddress}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
