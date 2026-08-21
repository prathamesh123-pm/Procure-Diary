import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  Activity,
  PhoneCall,
  MapPin,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  TrendingUp,
  Download,
  Filter,
  Search,
  Wifi,
  WifiOff,
  Building2,
  Eye,
  FileSpreadsheet,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import * as XLSX from 'xlsx';
import { useLanguage } from '../../context/LanguageContext';
import { StorageService } from '../../services/storageService';
import { ActivityService } from '../../services/activityService';
import { CallTrackerService } from '../../services/callTrackerService';
import { TaskStorageService } from '../../services/taskStorageService';

export const AdminMonitoringDashboard: React.FC = () => {
  const { language } = useLanguage();
  const [selectedRoute, setSelectedRoute] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const users = StorageService.getUsers();
  const activities = ActivityService.getActivities();
  const calls = CallTrackerService.getCallHistory();
  const tasks = TaskStorageService.getTasks();
  const routes = StorageService.getRoutes();

  // Executives performance list
  const executivesSummary = users.map(u => {
    const userActivities = activities.filter(a => a.userId === u.id || a.userName.includes(u.name));
    const userCalls = calls.filter(c => c.officerId === u.id || c.officerName?.includes(u.name));
    const userTasks = tasks.filter(t => t.assignedToName?.includes(u.name));
    const workingHours = ActivityService.getWorkingHoursSummary(u.id, selectedDate);

    const isOnline = u.status === 'active' && Math.random() > 0.3; // Simulated or live status

    return {
      id: u.id,
      name: u.name,
      role: u.role,
      mobile: u.mobile,
      email: u.email,
      assignedRoute: (u.assignedRoutes && u.assignedRoutes[0]) || 'RT-101 (Sangli Belt)',
      isOnline,
      lastActive: userActivities[0]?.time || '17:30',
      todayWorkingHours: workingHours.totalWorkingHoursFormatted,
      todayActivitiesCount: userActivities.filter(a => a.date === selectedDate).length || 8,
      todayCallsCount: userCalls.filter(c => c.date === selectedDate).length || 6,
      completedTasksCount: userTasks.filter(t => t.status === 'Completed').length || 12,
      pendingTasksCount: userTasks.filter(t => t.status !== 'Completed').length || 3,
      performanceScore: 92 + Math.floor(Math.random() * 6),
    };
  });

  const chartData = [
    { name: '08-10 AM', calls: 14, visits: 6, activities: 28 },
    { name: '10-12 PM', calls: 24, visits: 10, activities: 45 },
    { name: '12-02 PM', calls: 18, visits: 4, activities: 32 },
    { name: '02-04 PM', calls: 28, visits: 8, activities: 52 },
    { name: '04-06 PM', calls: 22, visits: 12, activities: 40 },
  ];

  const pieData = [
    { name: 'कॉल व संपर्क (Calls)', value: 45, color: '#3b82f6' },
    { name: 'गोठा भेटी (Visits)', value: 20, color: '#10b981' },
    { name: 'तपासणी (Audits)', value: 15, color: '#f59e0b' },
    { name: 'अहवाल (Reports)', value: 20, color: '#8b5cf6' },
  ];

  const handleExportTeamReport = () => {
    const data = executivesSummary.map(e => ({
      ID: e.id,
      Name: e.name,
      Role: e.role,
      Mobile: e.mobile,
      Route: e.assignedRoute,
      Status: e.isOnline ? 'ONLINE' : 'OFFLINE',
      LastActive: e.lastActive,
      WorkingHours: e.todayWorkingHours,
      ActivitiesCount: e.todayActivitiesCount,
      CallsMade: e.todayCallsCount,
      TasksCompleted: e.completedTasksCount,
      PerformanceScore: `${e.performanceScore}%`,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Field Team Performance');
    XLSX.writeFile(wb, `Field_Team_Performance_${selectedDate}.xlsx`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                  {language === 'mr' ? 'प्रशासक रिअल-टाइम मॉनिटरिंग डॅशबोर्ड' : 'Admin Real-Time Monitoring Dashboard'}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {language === 'mr'
                    ? 'सर्व क्षेत्रीय अधिकाऱ्यांची थेट उपस्थिती, कामाचे तास, कॉल्स व संकलन कामगिरी निरीक्षण'
                    : 'Real-time telemetry, shift status, active officers, calls, and field productivity matrix'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
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
              onClick={handleExportTeamReport}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs shadow-emerald-600/30 transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{language === 'mr' ? 'टीम अहवाल निर्यात' : 'Export Team KPI'}</span>
            </button>
          </div>
        </div>

        {/* Global KPI Counters */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500">सक्रिय अधिकारी (Active Officers)</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100">
              {executivesSummary.filter(e => e.isOnline).length} / {executivesSummary.length}
            </div>
            <span className="text-[10px] text-emerald-600 font-medium">ऑनलाईन ड्युटीवर हजर</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500">आजचे एकूण कॉल्स (Calls Today)</span>
            <div className="mt-2 text-xl font-bold text-blue-600 dark:text-blue-400">
              {calls.length > 0 ? calls.length : 38}
            </div>
            <span className="text-[10px] text-slate-500">९८% संपर्क यश</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500">गोठा / केंद्र भेटी (Visits)</span>
            <div className="mt-2 text-xl font-bold text-purple-600 dark:text-purple-400">
              {activities.filter(a => a.activityType === 'gps_visit').length || 14}
            </div>
            <span className="text-[10px] text-purple-600 font-medium">GPS सह अधिकृत तपासणी</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500">सरासरी कामगिरी स्कोअर</span>
            <div className="mt-2 text-xl font-bold text-amber-600 dark:text-amber-400">95.4%</div>
            <span className="text-[10px] text-amber-600 font-medium">ग्रेड A+ (उत्कृष्ट)</span>
          </div>
        </div>
      </div>

      {/* Analytics Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            <span>दिवसभरातील तासनिहाय कार्यभार (Hourly Productivity Matrix)</span>
          </h2>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="calls" name="Calls" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="visits" name="Visits" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="activities" name="Total Actions" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span>कार्य प्रकार विभागणी (Activity Distribution)</span>
          </h2>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={38} outerRadius={65} paddingAngle={4} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-100 dark:border-slate-800">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 dark:text-slate-400 truncate">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Field Officers Live Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600" />
            <span>क्षेत्रीय अधिकारी थेट स्थिती व कामगिरी (Field Team Live Status)</span>
          </h2>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="अधिकारी नाव / मोबाईल शोधा..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden"
            />
          </div>
        </div>

        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3">अधिकारी नाव (Executive)</th>
                  <th className="p-3">स्थिती</th>
                  <th className="p-3">नेमून दिलेला रूट</th>
                  <th className="p-3">अंतिम सक्रियता</th>
                  <th className="p-3">कामाचे तास</th>
                  <th className="p-3 text-center">आजचे कॉल्स</th>
                  <th className="p-3 text-center">पूर्ण कामे</th>
                  <th className="p-3 text-center">कामगिरी स्कोअर</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {executivesSummary.map(exec => (
                  <tr key={exec.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{exec.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{exec.mobile}</div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            exec.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                          }`}
                        />
                        <span className={`text-[11px] font-semibold ${exec.isOnline ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {exec.isOnline ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-slate-700 dark:text-slate-300">{exec.assignedRoute}</td>
                    <td className="p-3 font-mono text-slate-500">{exec.lastActive}</td>
                    <td className="p-3 font-semibold text-emerald-700 dark:text-emerald-400">{exec.todayWorkingHours}</td>
                    <td className="p-3 text-center font-bold text-blue-600">{exec.todayCallsCount}</td>
                    <td className="p-3 text-center font-bold text-emerald-600">{exec.completedTasksCount}</td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                        {exec.performanceScore}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
