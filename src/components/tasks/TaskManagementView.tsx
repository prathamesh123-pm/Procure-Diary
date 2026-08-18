import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckSquare,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Phone,
  MessageSquare,
  MapPin,
  Calendar,
  FileText,
  FileSpreadsheet,
  Layers,
  ChevronRight,
  User,
  Activity,
  History,
  TrendingUp,
  Tag,
  Share2,
} from 'lucide-react';
import { Task, TaskStatus, TaskPriority, TaskCategory, WorkLogEntry } from '../../types/task';
import { TaskStorageService } from '../../services/taskStorageService';
import { TaskExportService } from '../../services/taskExportService';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { WorkLogList } from './WorkLogList';
import { TaskTimeline } from './TaskTimeline';
import { AddWorkLogModal } from './AddWorkLogModal';
import { CompleteTaskModal } from './CompleteTaskModal';
import { ReopenTaskModal } from './ReopenTaskModal';

export const TaskManagementView: React.FC = () => {
  const { language, t } = useLanguage();
  const { currentUser } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [routeFilter, setRouteFilter] = useState<string>('all');

  // Modals
  const [isAddLogOpen, setIsAddLogOpen] = useState(false);
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  const [isReopenOpen, setIsReopenOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);

  // New Task Form State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<TaskCategory>('Fat/SNF Dispute');
  const [newGavali, setNewGavali] = useState('');
  const [newGavaliCode, setNewGavaliCode] = useState('');
  const [newMobile, setNewMobile] = useState('');
  const [newRoute, setNewRoute] = useState('RT-102 (Tasgaon Route)');
  const [newVillage, setNewVillage] = useState('चिंचणी (Chinchani)');
  const [newPriority, setNewPriority] = useState<TaskPriority>('Medium');
  const [newDueDate, setNewDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [newNotes, setNewNotes] = useState('');

  const loadTasks = () => {
    const loaded = TaskStorageService.getTasks();
    setTasks(loaded);
    if (loaded.length > 0 && !selectedTaskId) {
      setSelectedTaskId(loaded[0].id);
    }
  };

  useEffect(() => {
    loadTasks();
    window.addEventListener('procure_tasks_updated', loadTasks);
    return () => window.removeEventListener('procure_tasks_updated', loadTasks);
  }, []);

  const selectedTask = useMemo(() => {
    return tasks.find(t => t.id === selectedTaskId) || tasks[0] || null;
  }, [tasks, selectedTaskId]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          t.id.toLowerCase().includes(q) ||
          t.taskTitle.toLowerCase().includes(q) ||
          t.relatedGavali.toLowerCase().includes(q) ||
          t.gavaliCode.toLowerCase().includes(q) ||
          t.mobileNumber.includes(q) ||
          t.village.toLowerCase().includes(q) ||
          t.route.toLowerCase().includes(q);
        if (!match) return false;
      }

      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
      if (categoryFilter !== 'all' && t.taskCategory !== categoryFilter) return false;
      if (routeFilter !== 'all' && !t.route.includes(routeFilter)) return false;

      return true;
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter, categoryFilter, routeFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = tasks.length;
    const pending = tasks.filter(t => t.status === 'Pending').length;
    const inProgress = tasks.filter(t => t.status === 'In Progress').length;
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const reopened = tasks.filter(t => t.status === 'Reopened').length;
    const critical = tasks.filter(t => t.priority === 'Critical' && t.status !== 'Completed').length;

    return { total, pending, inProgress, completed, reopened, critical };
  }, [tasks]);

  const handleCreateTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !newGavali.trim()) return;

    const now = new Date();
    const createdDate = now.toISOString().split('T')[0];
    const createdTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const created = TaskStorageService.createTask({
      taskTitle: newTaskTitle.trim(),
      taskCategory: newTaskCategory,
      relatedGavali: newGavali.trim(),
      gavaliCode: newGavaliCode.trim() || 'G-NEW',
      mobileNumber: newMobile.trim() || '9876543210',
      route: newRoute,
      village: newVillage,
      priority: newPriority,
      status: 'In Progress',
      createdDate,
      createdTime,
      dueDate: newDueDate,
      createdById: currentUser?.id || 'officer_1',
      createdByName: currentUser?.name || 'Milk Procurement Officer',
      assignedToId: currentUser?.id || 'officer_1',
      assignedToName: currentUser?.name || 'Milk Procurement Officer',
      notes: newNotes.trim(),
      tags: [newTaskCategory, newRoute.split(' ')[0]],
    });

    setIsCreateTaskOpen(false);
    setSelectedTaskId(created.id);
    setNewTaskTitle('');
    setNewNotes('');
  };

  const handleExportSinglePDF = (task: Task) => {
    TaskExportService.exportTaskToPDF(task, language === 'mr' ? 'mr' : 'en');
  };

  const handleExportAllExcel = () => {
    TaskExportService.exportTasksToExcel(filteredTasks);
  };

  const getPriorityBadgeClass = (p: TaskPriority) => {
    switch (p) {
      case 'Critical':
        return 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border-red-200 dark:border-red-800';
      case 'High':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300 border-orange-200 dark:border-orange-800';
      case 'Medium':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'Low':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    }
  };

  const getStatusBadgeClass = (s: TaskStatus) => {
    switch (s) {
      case 'Completed':
        return 'bg-emerald-500 text-white shadow-xs';
      case 'In Progress':
        return 'bg-blue-600 text-white shadow-xs';
      case 'Reopened':
        return 'bg-purple-600 text-white shadow-xs';
      case 'Cancelled':
        return 'bg-slate-500 text-white shadow-xs';
      default:
        return 'bg-amber-500 text-white shadow-xs';
    }
  };

  return (
    <div className="space-y-4 pb-20 md:pb-6 animate-in fade-in">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {language === 'mr' ? 'कार्य व्यवस्थापन व कायमस्वरूपी रोजनिशी इतिहास' : 'Task Management & Permanent Work Log'}
            </h2>
            <p className="text-xs text-slate-500">
              {language === 'mr'
                ? 'गवळीनिहाय कार्ये, कॉल/व्हिजिट नोंदी, टाइमलाइन व पूर्तता अहवाल (Permanent Firestore Sync)'
                : 'Full audit history, execution timeline, completion report & verification'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportAllExcel}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Excel</span>
          </button>

          <button
            onClick={() => setIsCreateTaskOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'mr' ? 'नवीन कार्य जोडा' : 'New Task'}</span>
          </button>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        <div
          onClick={() => setStatusFilter('all')}
          className={`p-3 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm border-transparent'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
          }`}
        >
          <div className="text-[10px] opacity-75 font-bold uppercase">{language === 'mr' ? 'एकूण कार्ये' : 'Total Tasks'}</div>
          <div className="text-xl font-black mt-0.5">{stats.total}</div>
        </div>

        <div
          onClick={() => setStatusFilter('In Progress')}
          className={`p-3 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'In Progress'
              ? 'bg-blue-600 text-white shadow-sm border-transparent'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
          }`}
        >
          <div className="text-[10px] opacity-75 font-bold uppercase">{language === 'mr' ? 'प्रगतीत (In Progress)' : 'In Progress'}</div>
          <div className="text-xl font-black mt-0.5 text-blue-600 dark:text-blue-400 group-hover:text-white">
            {stats.inProgress}
          </div>
        </div>

        <div
          onClick={() => setStatusFilter('Pending')}
          className={`p-3 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'Pending'
              ? 'bg-amber-500 text-white shadow-sm border-transparent'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
          }`}
        >
          <div className="text-[10px] opacity-75 font-bold uppercase">{language === 'mr' ? 'प्रलंबित (Pending)' : 'Pending'}</div>
          <div className="text-xl font-black mt-0.5 text-amber-600 dark:text-amber-400">
            {stats.pending}
          </div>
        </div>

        <div
          onClick={() => setStatusFilter('Completed')}
          className={`p-3 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'Completed'
              ? 'bg-emerald-600 text-white shadow-sm border-transparent'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
          }`}
        >
          <div className="text-[10px] opacity-75 font-bold uppercase">{language === 'mr' ? 'पूर्ण झालेली' : 'Completed'}</div>
          <div className="text-xl font-black mt-0.5 text-emerald-600 dark:text-emerald-400">
            {stats.completed}
          </div>
        </div>

        <div
          onClick={() => setStatusFilter('Reopened')}
          className={`p-3 rounded-2xl border transition-all cursor-pointer col-span-2 sm:col-span-1 ${
            statusFilter === 'Reopened'
              ? 'bg-purple-600 text-white shadow-sm border-transparent'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
          }`}
        >
          <div className="text-[10px] opacity-75 font-bold uppercase">{language === 'mr' ? 'फेरुघडी (Reopened)' : 'Reopened'}</div>
          <div className="text-xl font-black mt-0.5 text-purple-600 dark:text-purple-400">
            {stats.reopened}
          </div>
        </div>
      </div>

      {/* Main 2-Column Cockpit Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column: Tasks List & Search (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {/* Search & Filter Bar */}
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2.5">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={language === 'mr' ? 'गवळी, कोड, कार्य नाव किंवा रूट शोधा...' : 'Search task, gavali, code, route...'}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="all">{language === 'mr' ? 'सर्व प्रवर्ग (All Categories)' : 'All Categories'}</option>
                <option value="Fat/SNF Dispute">Fat/SNF Dispute</option>
                <option value="Cattle Feed">Cattle Feed</option>
                <option value="Loan/Advance">Loan/Advance</option>
                <option value="New Gavali Onboarding">New Gavali</option>
                <option value="Payment Inquiry">Payment Inquiry</option>
                <option value="Veterinary Support">Veterinary Support</option>
                <option value="Chilling Center / Center Issue">Chilling Center</option>
              </select>

              <select
                value={priorityFilter}
                onChange={e => setPriorityFilter(e.target.value)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="all">{language === 'mr' ? 'सर्व प्राधान्य (All Priority)' : 'All Priority'}</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          {/* Tasks List */}
          <div className="space-y-2.5 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
            {filteredTasks.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-slate-400 text-xs">
                {language === 'mr' ? 'कोणतीही कार्ये सापडली नाहीत.' : 'No tasks match current filter.'}
              </div>
            ) : (
              filteredTasks.map(t => {
                const isSelected = t.id === selectedTask?.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTaskId(t.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-500 dark:border-emerald-600 shadow-sm ring-1 ring-emerald-500/20'
                        : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                          {t.id}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPriorityBadgeClass(t.priority)}`}>
                          {t.priority}
                        </span>
                      </div>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getStatusBadgeClass(t.status)}`}>
                        {t.status}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white mt-2 line-clamp-2">
                      {t.taskTitle}
                    </h4>

                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 mt-2">
                      <span className="font-semibold truncate max-w-[180px]">
                        {t.relatedGavali} <span className="text-[10px] text-slate-400 font-mono">({t.gavaliCode})</span>
                      </span>
                      <span className="text-[11px] text-slate-400 whitespace-nowrap">{t.village}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="flex items-center gap-1">
                        <Activity className="w-3 h-3 text-emerald-500" />
                        <span>{t.workLogs?.length || 0} Logs recorded</span>
                      </span>
                      <span className="flex items-center gap-1 font-mono text-[10px]">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>Due: {t.dueDate}</span>
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Selected Task Comprehensive Dossier (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {selectedTask ? (
            <div className="space-y-4">
              {/* Task Header Card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      {selectedTask.id}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getPriorityBadgeClass(selectedTask.priority)}`}>
                      {selectedTask.priority}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${getStatusBadgeClass(selectedTask.status)}`}>
                      {selectedTask.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleExportSinglePDF(selectedTask)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-red-500" />
                      <span>{language === 'mr' ? 'डोसियर PDF' : 'Dossier PDF'}</span>
                    </button>

                    {selectedTask.status !== 'Completed' ? (
                      <button
                        onClick={() => setIsCompleteOpen(true)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{language === 'mr' ? 'कार्य पूर्ण करा' : 'Complete Task'}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setIsReopenOpen(true)}
                        className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>{language === 'mr' ? 'कार्य फेरुघडा (Reopen)' : 'Reopen Task'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Title and details */}
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    {selectedTask.taskTitle}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
                    <span className="font-semibold text-emerald-600">{selectedTask.taskCategory}</span>
                    <span>•</span>
                    <span>रूट: <strong className="text-slate-700 dark:text-slate-200">{selectedTask.route}</strong></span>
                    <span>•</span>
                    <span>गाव: <strong className="text-slate-700 dark:text-slate-200">{selectedTask.village}</strong></span>
                  </div>
                </div>

                {/* Gavali Quick Card */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <User className="w-4 h-4 text-emerald-500" />
                      <span>{selectedTask.relatedGavali}</span>
                      <span className="font-mono text-[11px] text-slate-400">({selectedTask.gavaliCode})</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      मोबाईल: <strong className="font-mono text-slate-700 dark:text-slate-300">{selectedTask.mobileNumber}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${selectedTask.mobileNumber}`}
                      className="px-3 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-1 text-[11px]"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Gavali</span>
                    </a>
                    <a
                      href={`https://wa.me/91${selectedTask.mobileNumber}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-green-600 text-white font-bold flex items-center gap-1 text-[11px]"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>

                {/* Notes & Description */}
                {selectedTask.notes && (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200">
                    <strong className="block mb-0.5">{language === 'mr' ? 'कार्य प्राथमिक टिपण / माहिती:' : 'Primary Notes:'}</strong>
                    <p className="leading-relaxed">{selectedTask.notes}</p>
                  </div>
                )}

                {/* Completion Report Display if Completed */}
                {selectedTask.completionReport && (
                  <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between font-bold text-emerald-800 dark:text-emerald-300">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{language === 'mr' ? 'कार्यपूर्तता अंतिम अहवाल (Completion Report)' : 'Final Completion Report'}</span>
                      </span>
                      <span className="font-mono text-[11px]">{selectedTask.completionReport.completionDate}</span>
                    </div>
                    <div className="text-slate-700 dark:text-slate-200 space-y-1">
                      <p><strong>निवारण तपशील:</strong> {selectedTask.completionReport.resolutionSummary}</p>
                      {selectedTask.completionReport.milkVolumeImpact && (
                        <p><strong>दूध संकलन प्रभाव:</strong> {selectedTask.completionReport.milkVolumeImpact}</p>
                      )}
                      <p>
                        <strong>गवळी समाधान स्तर:</strong> {selectedTask.completionReport.gavaliSatisfactionRating} / 5 ⭐ |{' '}
                        <strong>पूर्ण करणारा अधिकारी:</strong> {selectedTask.completionReport.completedByName}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Work Log Section & Action Trigger */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-500" />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {language === 'mr' ? 'प्रत्यक्ष कृती रोजनिशी (Work Execution Logs)' : 'Work Execution Logs'}
                      </h4>
                      <span className="text-[11px] text-slate-400">
                        {selectedTask.workLogs?.length || 0} {language === 'mr' ? 'नोंदी कायमस्वरूपी संग्रहित' : 'permanent entries'}
                      </span>
                    </div>
                  </div>

                  {selectedTask.status !== 'Completed' && (
                    <button
                      onClick={() => setIsAddLogOpen(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{language === 'mr' ? 'रोजनिशी नोंद जोडा' : 'Add Work Log'}</span>
                    </button>
                  )}
                </div>

                <WorkLogList workLogs={selectedTask.workLogs || []} />
              </div>

              {/* Comprehensive Activity Timeline */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-purple-500" />
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {language === 'mr' ? 'कायमस्वरूपी टाइमलाइन व ऑडिट ट्रेल' : 'Permanent Activity Timeline & Audit Trail'}
                  </h4>
                </div>

                <TaskTimeline timeline={selectedTask.timeline || []} />
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-slate-400 text-xs">
              {language === 'mr' ? 'तपशील पाहण्यासाठी डावीकडील कार्य निवडा.' : 'Select a task on the left to view dossier.'}
            </div>
          )}
        </div>
      </div>

      {/* Modal 1: Create New Task */}
      {isCreateTaskOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              {language === 'mr' ? 'नवीन कार्य नोंदवा (Create Milk Procurement Task)' : 'Create Milk Procurement Task'}
            </h3>

            <form onSubmit={handleCreateTaskSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  {language === 'mr' ? 'कार्य शीर्षक / समस्या (Task Title) *' : 'Task Title *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. म्हैस दुध फॅट तफावत तपासणी व मशीन कॅलिब्रेशन"
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    {language === 'mr' ? 'कार्य प्रवर्ग (Category)' : 'Category'}
                  </label>
                  <select
                    value={newTaskCategory}
                    onChange={e => setNewTaskCategory(e.target.value as TaskCategory)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Fat/SNF Dispute">Fat/SNF Dispute</option>
                    <option value="Cattle Feed">Cattle Feed</option>
                    <option value="Loan/Advance">Loan/Advance</option>
                    <option value="New Gavali Onboarding">New Gavali Onboarding</option>
                    <option value="Payment Inquiry">Payment Inquiry</option>
                    <option value="Veterinary Support">Veterinary Support</option>
                    <option value="Chilling Center / Center Issue">Chilling Center</option>
                    <option value="General Follow-up">General Follow-up</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    {language === 'mr' ? 'प्राधान्य (Priority)' : 'Priority'}
                  </label>
                  <select
                    value={newPriority}
                    onChange={e => setNewPriority(e.target.value as TaskPriority)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="Critical">Critical (अतितात्काळ)</option>
                    <option value="High">High (उच्च)</option>
                    <option value="Medium">Medium (मध्यम)</option>
                    <option value="Low">Low (कमी)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    {language === 'mr' ? 'संबंधित गवळी नाव *' : 'Gavali Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. तात्यासाहेब पाटील"
                    value={newGavali}
                    onChange={e => setNewGavali(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    {language === 'mr' ? 'गवळी कोड' : 'Gavali Code'}
                  </label>
                  <input
                    type="text"
                    placeholder="G-101"
                    value={newGavaliCode}
                    onChange={e => setNewGavaliCode(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    {language === 'mr' ? 'मोबाईल नंबर' : 'Mobile Number'}
                  </label>
                  <input
                    type="tel"
                    placeholder="9822145890"
                    value={newMobile}
                    onChange={e => setNewMobile(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    {language === 'mr' ? 'रूट' : 'Route'}
                  </label>
                  <input
                    type="text"
                    value={newRoute}
                    onChange={e => setNewRoute(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    {language === 'mr' ? 'गाव' : 'Village'}
                  </label>
                  <input
                    type="text"
                    value={newVillage}
                    onChange={e => setNewVillage(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    {language === 'mr' ? 'अंतिम तारीख (Due Date)' : 'Due Date'}
                  </label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={e => setNewDueDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  {language === 'mr' ? 'तपशीलवार माहिती / टीप' : 'Detailed Notes'}
                </label>
                <textarea
                  rows={3}
                  placeholder="कार्याबाबत प्राथमिक माहिती, आवश्यक तपासणी..."
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateTaskOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  {language === 'mr' ? 'रद्द करा' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs"
                >
                  {language === 'mr' ? 'कार्य जतन करा' : 'Save Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Add Work Log Modal */}
      {isAddLogOpen && selectedTask && (
        <AddWorkLogModal
          taskId={selectedTask.id}
          taskTitle={selectedTask.taskTitle}
          onClose={() => setIsAddLogOpen(false)}
          onSuccess={() => {
            setIsAddLogOpen(false);
            loadTasks();
          }}
        />
      )}

      {/* Modal 3: Complete Task Modal */}
      {isCompleteOpen && selectedTask && (
        <CompleteTaskModal
          task={selectedTask}
          onClose={() => setIsCompleteOpen(false)}
          onSuccess={() => {
            setIsCompleteOpen(false);
            loadTasks();
          }}
        />
      )}

      {/* Modal 4: Reopen Task Modal */}
      {isReopenOpen && selectedTask && (
        <ReopenTaskModal
          task={selectedTask}
          onClose={() => setIsReopenOpen(false)}
          onSuccess={() => {
            setIsReopenOpen(false);
            loadTasks();
          }}
        />
      )}
    </div>
  );
};
