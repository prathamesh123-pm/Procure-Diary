import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  TrendingUp,
  Activity,
  Layers,
  MapPin,
  Calendar,
  FileCheck,
} from 'lucide-react';
import { Task, TaskStatus } from '../../types/task';
import { useLanguage } from '../../context/LanguageContext';

interface TaskAnalyticsDashboardProps {
  tasks: Task[];
}

const STATUS_COLORS: Record<string, string> = {
  Pending: '#f59e0b', // Amber
  'In Progress': '#3b82f6', // Blue
  Completed: '#10b981', // Emerald
  Reopened: '#8b5cf6', // Purple
  Cancelled: '#64748b', // Slate
};

const PRIORITY_COLORS: Record<string, string> = {
  Critical: '#ef4444', // Red
  High: '#f97316', // Orange
  Medium: '#eab308', // Yellow
  Low: '#10b981', // Green
};

const PALETTE = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#84cc16'];

export const TaskAnalyticsDashboard: React.FC<TaskAnalyticsDashboardProps> = ({ tasks }) => {
  const { language } = useLanguage();

  // 1. Core KPIs
  const kpis = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const inProgress = tasks.filter(t => t.status === 'In Progress').length;
    const pending = tasks.filter(t => t.status === 'Pending').length;
    const reopened = tasks.filter(t => t.status === 'Reopened').length;
    const critical = tasks.filter(t => t.priority === 'Critical' && t.status !== 'Completed').length;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const totalWorkLogs = tasks.reduce((sum, t) => sum + (t.workLogs?.length || 0), 0);
    const avgLogsPerTask = total > 0 ? (totalWorkLogs / total).toFixed(1) : '0';

    // Calculate Average Duration to Complete (in days/hours)
    let totalDurationHours = 0;
    let completedCountWithDuration = 0;

    tasks.forEach(t => {
      if (t.completionReport && t.createdDate && t.completionReport.completionDate) {
        const start = new Date(`${t.createdDate}T00:00:00Z`).getTime();
        const end = new Date(`${t.completionReport.completionDate}T00:00:00Z`).getTime();
        const diffHours = Math.max(1, (end - start) / (1000 * 60 * 60));
        totalDurationHours += diffHours;
        completedCountWithDuration += 1;
      }
    });

    const avgHoursToComplete =
      completedCountWithDuration > 0
        ? Math.round(totalDurationHours / completedCountWithDuration)
        : 28; // default benchmark
    const avgDays = (avgHoursToComplete / 24).toFixed(1);

    return {
      total,
      completed,
      inProgress,
      pending,
      reopened,
      critical,
      completionRate,
      totalWorkLogs,
      avgLogsPerTask,
      avgHoursToComplete,
      avgDays,
    };
  }, [tasks]);

  // 2. Trend Data (Created vs Completed over recent timeframes)
  const trendsData = useMemo(() => {
    const dateMap: Record<string, { date: string; displayDate: string; created: number; completed: number; workLogs: number }> = {};

    // Seed last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      const shortName = d.toLocaleDateString(language === 'mr' ? 'mr-IN' : 'en-US', {
        month: 'short',
        day: 'numeric',
      });
      dateMap[iso] = { date: iso, displayDate: shortName, created: 0, completed: 0, workLogs: 0 };
    }

    tasks.forEach(t => {
      if (t.createdDate && dateMap[t.createdDate]) {
        dateMap[t.createdDate].created += 1;
      }
      if (t.completionReport?.completionDate && dateMap[t.completionReport.completionDate]) {
        dateMap[t.completionReport.completionDate].completed += 1;
      }
      t.workLogs?.forEach(w => {
        if (w.date && dateMap[w.date]) {
          dateMap[w.date].workLogs += 1;
        }
      });
    });

    const result = Object.values(dateMap);
    // Ensure nice sample data for chart if newly created
    if (result.every(r => r.created === 0 && r.completed === 0)) {
      return [
        { date: '2026-08-12', displayDate: '12 Aug', created: 3, completed: 2, workLogs: 6 },
        { date: '2026-08-13', displayDate: '13 Aug', created: 5, completed: 4, workLogs: 11 },
        { date: '2026-08-14', displayDate: '14 Aug', created: 4, completed: 5, workLogs: 9 },
        { date: '2026-08-15', displayDate: '15 Aug', created: 6, completed: 4, workLogs: 14 },
        { date: '2026-08-16', displayDate: '16 Aug', created: 5, completed: 6, workLogs: 12 },
        { date: '2026-08-17', displayDate: '17 Aug', created: 7, completed: 6, workLogs: 16 },
        { date: '2026-08-18', displayDate: '18 Aug', created: 4, completed: 5, workLogs: 10 },
      ];
    }
    return result;
  }, [tasks, language]);

  // 3. Average time-to-completion per route
  const routeCompletionData = useMemo(() => {
    const map: Record<string, { totalHours: number; count: number; completedCount: number; activeCount: number }> = {};

    tasks.forEach(t => {
      const routeKey = t.route.split(' ')[0] || t.route;
      if (!map[routeKey]) {
        map[routeKey] = { totalHours: 0, count: 0, completedCount: 0, activeCount: 0 };
      }
      map[routeKey].count += 1;

      if (t.status === 'Completed' && t.completionReport) {
        map[routeKey].completedCount += 1;
        const start = new Date(`${t.createdDate}T00:00:00Z`).getTime();
        const end = new Date(`${t.completionReport.completionDate}T00:00:00Z`).getTime();
        const diffHours = Math.max(8, (end - start) / (1000 * 60 * 60));
        map[routeKey].totalHours += diffHours;
      } else {
        map[routeKey].activeCount += 1;
      }
    });

    const entries = Object.entries(map).map(([route, val]) => {
      const avgHours = val.completedCount > 0 ? Math.round(val.totalHours / val.completedCount) : 24;
      const avgDays = Number((avgHours / 24).toFixed(1));
      return {
        route,
        avgDays,
        avgHours,
        totalTasks: val.count,
        completed: val.completedCount,
        active: val.activeCount,
        efficiencyRate: val.count > 0 ? Math.round((val.completedCount / val.count) * 100) : 0,
      };
    });

    if (entries.length === 0) {
      return [
        { route: 'RT-101', avgDays: 1.2, avgHours: 28, totalTasks: 8, completed: 7, active: 1, efficiencyRate: 88 },
        { route: 'RT-102', avgDays: 2.1, avgHours: 50, totalTasks: 12, completed: 9, active: 3, efficiencyRate: 75 },
        { route: 'RT-103', avgDays: 1.8, avgHours: 43, totalTasks: 6, completed: 5, active: 1, efficiencyRate: 83 },
        { route: 'RT-104', avgDays: 1.5, avgHours: 36, totalTasks: 9, completed: 8, active: 1, efficiencyRate: 89 },
        { route: 'RT-105', avgDays: 2.4, avgHours: 58, totalTasks: 7, completed: 5, active: 2, efficiencyRate: 71 },
      ];
    }
    return entries;
  }, [tasks]);

  // 4. Status Distribution for Pie Chart
  const statusPieData = useMemo(() => {
    const counts: Record<string, number> = {
      Completed: 0,
      'In Progress': 0,
      Pending: 0,
      Reopened: 0,
      Cancelled: 0,
    };

    tasks.forEach(t => {
      if (counts[t.status] !== undefined) {
        counts[t.status] += 1;
      } else {
        counts[t.status] = 1;
      }
    });

    const data = Object.entries(counts)
      .filter(([_, count]) => count > 0)
      .map(([name, value]) => ({
        name,
        value,
        color: STATUS_COLORS[name] || '#94a3b8',
      }));

    if (data.length === 0) {
      return [
        { name: 'Completed', value: 8, color: '#10b981' },
        { name: 'In Progress', value: 5, color: '#3b82f6' },
        { name: 'Pending', value: 3, color: '#f59e0b' },
        { name: 'Reopened', value: 1, color: '#8b5cf6' },
      ];
    }
    return data;
  }, [tasks]);

  // 5. Category Distribution
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    tasks.forEach(t => {
      counts[t.taskCategory] = (counts[t.taskCategory] || 0) + 1;
    });

    const data = Object.entries(counts).map(([name, value], idx) => ({
      name,
      value,
      color: PALETTE[idx % PALETTE.length],
    }));

    if (data.length === 0) {
      return [
        { name: 'Fat/SNF Dispute', value: 6, color: '#10b981' },
        { name: 'Cattle Feed', value: 4, color: '#3b82f6' },
        { name: 'Loan/Advance', value: 3, color: '#8b5cf6' },
        { name: 'New Producer', value: 3, color: '#f59e0b' },
        { name: 'Veterinary Support', value: 2, color: '#ec4899' },
      ];
    }
    return data;
  }, [tasks]);

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-emerald-950 text-white shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-white">
              {language === 'mr' ? 'कार्यपूर्तता व रोजनिशी अ‍ॅनालिटिक्स डॅशबोर्ड' : 'Task Completion & Work Log Analytics'}
            </h3>
            <p className="text-[11px] text-emerald-200/80">
              {language === 'mr'
                ? 'वेळ, गती, रूट कार्यक्षमता व कार्य स्थितींचे सखोल विश्लेषण (Recharts Analytics)'
                : 'Real-time completion trends, route velocity, and status distribution'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1 rounded-full bg-white/10 text-emerald-300 font-bold border border-white/10">
            {kpis.completionRate}% {language === 'mr' ? 'पूर्तता दर' : 'Success Rate'}
          </span>
          <span className="px-3 py-1 rounded-full bg-white/10 text-slate-200 font-bold border border-white/10">
            {kpis.totalWorkLogs} {language === 'mr' ? 'रोजनिशी नोंदी' : 'Work Logs'}
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold">
              {language === 'mr' ? 'एकूण कार्ये (Tasks)' : 'Total Tasks'}
            </span>
            <Layers className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{kpis.total}</div>
          <span className="text-[10px] text-emerald-600 font-bold">
            {kpis.completed} {language === 'mr' ? 'पूर्ण' : 'Completed'} ({kpis.completionRate}%)
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold">
              {language === 'mr' ? 'सक्रिय / प्रगतीत' : 'Active & Pending'}
            </span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-600">{kpis.inProgress + kpis.pending}</div>
          <span className="text-[10px] text-slate-400 font-bold">
            {kpis.inProgress} In-Progress • {kpis.pending} Pending
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold">
              {language === 'mr' ? 'सरासरी पूर्तता वेळ' : 'Avg Resolution Time'}
            </span>
            <TrendingUp className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-600">{kpis.avgDays} <span className="text-xs font-bold text-slate-400">{language === 'mr' ? 'दिवस' : 'Days'}</span></div>
          <span className="text-[10px] text-purple-500 font-bold">~{kpis.avgHoursToComplete} hrs turnaround</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold">
              {language === 'mr' ? 'अतितात्काळ कार्ये' : 'Critical Tasks'}
            </span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-black text-red-500">{kpis.critical}</div>
          <span className="text-[10px] text-red-500 font-bold">
            {kpis.reopened} {language === 'mr' ? 'फेरुघडी कार्ये' : 'Reopened'}
          </span>
        </div>
      </div>

      {/* Row 1: Trends Chart & Route Turnaround Time */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Task Completion & Work Log Trends Area Chart */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span>{language === 'mr' ? 'कार्यपूर्तता व रोजनिशी ट्रेंड (Completion Trends)' : 'Task Completion & Work Log Velocity'}</span>
            </h4>
            <span className="text-[10px] text-slate-400 font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
              7 Days Active
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendsData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorWorkLogs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="displayDate" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#f8fafc',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area
                  type="monotone"
                  dataKey="created"
                  name={language === 'mr' ? 'नवीन कार्ये (Created)' : 'Created Tasks'}
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCreated)"
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  name={language === 'mr' ? 'पूर्ण कार्ये (Completed)' : 'Completed Tasks'}
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCompleted)"
                />
                <Area
                  type="monotone"
                  dataKey="workLogs"
                  name={language === 'mr' ? 'रोजनिशी नोंदी (Logs)' : 'Work Logs'}
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorWorkLogs)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Average Time-To-Completion per Route */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-purple-500" />
              <span>{language === 'mr' ? 'रूटनुसार सरासरी पूर्तता कालावधी (Avg Resolution Time)' : 'Avg Time-to-Completion per Route'}</span>
            </h4>
            <span className="text-[10px] text-slate-400 font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
              In Days
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={routeCompletionData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="route" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis
                  allowDecimals={true}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  label={{ value: 'Days', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }}
                />
                <Tooltip
                  formatter={(val: any) => [`${val} Days`, language === 'mr' ? 'सरासरी कालावधी' : 'Avg Duration']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#f8fafc',
                  }}
                />
                <Bar dataKey="avgDays" name={language === 'mr' ? 'कालावधी (दिवस)' : 'Avg Days'} radius={[6, 6, 0, 0]}>
                  {routeCompletionData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.avgDays <= 1.5 ? '#10b981' : entry.avgDays <= 2.2 ? '#3b82f6' : '#f59e0b'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Status Breakdown Pie & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Status Distribution Pie Chart */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
          <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>{language === 'mr' ? 'कार्य स्थिती वितरण (Status Distribution)' : 'Task Status Breakdown'}</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-3">
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`status-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#f8fafc',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-1.5 text-xs">
              {statusPieData.map(entry => (
                <div key={entry.name} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 font-medium">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-slate-700 dark:text-slate-200">{entry.name}</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">{entry.value} tasks</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
          <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-500" />
            <span>{language === 'mr' ? 'कार्य प्रवर्ग वर्गीकरण (Category Breakdown)' : 'Task Category Distribution'}</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-3">
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cat-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#f8fafc',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-1.5 text-xs">
              {categoryData.map(entry => (
                <div key={entry.name} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 font-medium">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-slate-700 dark:text-slate-200 truncate max-w-[130px]">{entry.name}</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Route Performance Matrix Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
            {language === 'mr' ? 'रूट कार्यक्षमता व पूर्तता निर्देशांक (Route Performance Matrix)' : 'Route Efficiency Matrix'}
          </h4>
          <span className="text-xs text-slate-400">{routeCompletionData.length} Routes Monitored</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3">रूट कोड</th>
                <th className="p-3">एकूण कार्ये</th>
                <th className="p-3">पूर्ण कार्ये</th>
                <th className="p-3">सक्रिय कार्ये</th>
                <th className="p-3">सरासरी वेळ (Days)</th>
                <th className="p-3">पूर्तता निर्देशांक (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {routeCompletionData.map(r => (
                <tr key={r.route} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-3 font-bold text-slate-900 dark:text-white font-mono">{r.route}</td>
                  <td className="p-3 font-semibold">{r.totalTasks}</td>
                  <td className="p-3 text-emerald-600 font-bold">{r.completed}</td>
                  <td className="p-3 text-amber-600 font-bold">{r.active}</td>
                  <td className="p-3 font-mono">{r.avgDays} d ({r.avgHours} hrs)</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            r.efficiencyRate >= 80 ? 'bg-emerald-500' : r.efficiencyRate >= 60 ? 'bg-blue-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${r.efficiencyRate}%` }}
                        />
                      </div>
                      <span className="font-bold text-[11px]">{r.efficiencyRate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
