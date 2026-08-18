import React, { useState, useEffect, useMemo } from 'react';
import {
  ClipboardList,
  Search,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Sparkles,
  Trash2,
  Edit2,
  Filter,
  User,
  Calendar,
  X,
} from 'lucide-react';
import { PendingTask, TaskStatus, Priority } from '../../types';
import { StorageService } from '../../services/storageService';
import { GeminiService, AIPendingTaskAnalysis } from '../../services/geminiService';
import { useLanguage } from '../../context/LanguageContext';
import { TaskFormModal } from './TaskFormModal';

export const PendingWorkView: React.FC = () => {
  const { language, t } = useLanguage();
  const [tasks, setTasks] = useState<PendingTask[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('active');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<PendingTask | null>(null);

  // AI Task Bottleneck Analysis
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIPendingTaskAnalysis | null>(null);

  const loadData = () => {
    setTasks(StorageService.getTasks());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('dairy_storage_updated', loadData);
    return () => window.removeEventListener('dairy_storage_updated', loadData);
  }, []);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          t.workName.toLowerCase().includes(q) ||
          (t.farmerName && t.farmerName.toLowerCase().includes(q)) ||
          (t.farmerCode && t.farmerCode.toLowerCase().includes(q)) ||
          t.assignedToName.toLowerCase().includes(q) ||
          t.route.toLowerCase().includes(q);
        if (!match) return false;
      }

      if (selectedStatus === 'active') {
        if (t.status === 'Completed' || t.status === 'Cancelled') return false;
      } else if (selectedStatus !== 'all') {
        if (t.status !== selectedStatus) return false;
      }

      if (selectedPriority !== 'all' && t.priority !== selectedPriority) return false;

      return true;
    });
  }, [tasks, searchQuery, selectedStatus, selectedPriority]);

  const handleUpdateStatus = (id: string, newStatus: TaskStatus) => {
    StorageService.updateTaskStatus(id, newStatus);
  };

  const handleDelete = (id: string) => {
    if (confirm(language === 'mr' ? 'हे काम नक्की काढून टाकायचे आहे का?' : 'Delete this task?')) {
      StorageService.deleteTask(id);
    }
  };

  const handleAIAnalyzeTasks = async () => {
    setIsAnalyzing(true);
    try {
      const res = await GeminiService.analyzeTasks(filteredTasks, language);
      setAiAnalysis(res);
    } catch (err) {
      console.error('Task AI error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-4 pb-20 md:pb-6 animate-in fade-in">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {t('task.title')}
            </h2>
            <p className="text-xs text-slate-500">
              {filteredTasks.length} {language === 'mr' ? 'प्रलंबित कामे व शेतकरी तक्रारी' : 'field tasks & complaints'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditingTask(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{t('task.add_new')}</span>
          </button>

          <button
            onClick={handleAIAnalyzeTasks}
            disabled={isAnalyzing}
            className="px-3 py-2 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 dark:from-emerald-950/40 dark:to-teal-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isAnalyzing ? 'विश्लेषण...' : (language === 'mr' ? 'AI विश्लेषण' : 'AI Analysis')}</span>
          </button>
        </div>
      </div>

      {/* AI Task Bottlenecks Analysis Box */}
      {aiAnalysis && (
        <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl shadow-md border border-indigo-500/30 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <h3 className="font-bold text-sm text-indigo-300">
                AI Task Risk Assessment & Recommendations
              </h3>
            </div>
            <button onClick={() => setAiAnalysis(null)} className="text-xs text-slate-400 hover:text-white cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-white/10 rounded-xl space-y-1">
              <span className="font-bold text-indigo-300 block">📋 तातडीच्या उपाययोजना (Action Plan):</span>
              <ul className="list-disc list-inside space-y-1 text-slate-200">
                {aiAnalysis.recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
            <div className="p-3 bg-white/10 rounded-xl space-y-1">
              <span className="font-bold text-amber-300 block">⚠️ मुख्य अडचणी (Bottlenecks):</span>
              <ul className="list-disc list-inside space-y-1 text-slate-200">
                {aiAnalysis.bottlenecks.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t('task.search')}
              className="w-full text-xs pl-8.5 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
            >
              <option value="active">{language === 'mr' ? 'सक्रिय कामे (Pending + In Progress)' : 'Active Tasks'}</option>
              <option value="all">{language === 'mr' ? 'सर्व स्थिती' : 'All Status'}</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div>
            <select
              value={selectedPriority}
              onChange={e => setSelectedPriority(e.target.value)}
              className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="all">{language === 'mr' ? 'सर्व प्राधान्य (All Priority)' : 'All Priorities'}</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task Cards List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            {t('common.no_records')}
          </div>
        ) : (
          filteredTasks.map(task => {
            const isCompleted = task.status === 'Completed';
            const isUrgent = task.priority === 'Urgent' || task.priority === 'High';

            return (
              <div
                key={task.id}
                className={`p-4 bg-white dark:bg-slate-900 rounded-2xl border shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isCompleted
                    ? 'border-slate-200/60 dark:border-slate-800 opacity-75'
                    : isUrgent
                    ? 'border-red-200 dark:border-red-900/60 bg-red-50/20'
                    : 'border-slate-200/80 dark:border-slate-800'
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-bold text-sm ${isCompleted ? 'line-through text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                      {task.workName}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        task.priority === 'Urgent'
                          ? 'bg-red-600 text-white'
                          : task.priority === 'High'
                          ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {task.priority}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        task.status === 'Completed'
                          ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300'
                          : task.status === 'In Progress'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>

                  {task.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {task.description}
                    </p>
                  )}

                  <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                    {task.farmerName && (
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        👨‍🌾 {task.farmerCode ? `[${task.farmerCode}] ` : ''}{task.farmerName}
                      </span>
                    )}
                    <span>📍 {task.route}</span>
                    <span>👤 {task.assignedToName}</span>
                    <span className="font-semibold text-red-600 dark:text-red-400">
                      📅 Due: {task.dueDate}
                    </span>
                  </div>
                </div>

                {/* Quick Status Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {task.status !== 'Completed' ? (
                    <button
                      onClick={() => handleUpdateStatus(task.id, 'Completed')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{language === 'mr' ? 'पूर्ण झाले' : 'Complete'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpdateStatus(task.id, 'In Progress')}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-xl cursor-pointer hover:bg-slate-200"
                    >
                      {language === 'mr' ? 'पुन्हा उघडा' : 'Re-open'}
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setEditingTask(task);
                      setIsModalOpen(true);
                    }}
                    className="p-2 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(task.id)}
                    className="p-2 text-slate-400 hover:text-red-600 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <TaskFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        taskToEdit={editingTask}
        onSaved={() => loadData()}
      />
    </div>
  );
};
