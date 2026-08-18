import React, { useState } from 'react';
import { X, RotateCcw, AlertCircle, Calendar, CheckCircle2 } from 'lucide-react';
import { Task } from '../../types/task';
import { TaskStorageService } from '../../services/taskStorageService';
import { useLanguage } from '../../context/LanguageContext';

interface ReopenTaskModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedTask: Task) => void;
}

export const ReopenTaskModal: React.FC<ReopenTaskModalProps> = ({ task, isOpen, onClose, onSuccess }) => {
  const { language } = useLanguage();
  const [reason, setReason] = useState('');
  const [initialPlan, setInitialPlan] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError(language === 'mr' ? 'काम पुन्हा सुरू करण्याचे कारण प्रविष्ट करा.' : 'Please enter the reason for reopening.');
      return;
    }

    setIsSubmitting(true);
    try {
      const currentUser = { id: 'user_1', name: 'प्रमोद सावंत (Pramod Sawant)', role: 'officer' };
      const updatedTask = TaskStorageService.reopenTask(
        task.id,
        {
          reason: reason.trim(),
          initialPlan: initialPlan.trim() || undefined,
          targetDate: targetDate || undefined,
        },
        currentUser
      );

      onSuccess(updatedTask);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to reopen task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto">
        <div className="p-4 sm:p-5 bg-gradient-to-r from-rose-600 to-amber-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center font-bold">
              <RotateCcw className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold">
                {language === 'mr' ? 'काम पुन्हा उघडा (Reopen Task)' : 'Reopen Completed Task'}
              </h3>
              <p className="text-xs text-rose-100 font-medium">
                {task.id} • {task.taskTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-900 dark:text-rose-200">
            {language === 'mr'
              ? 'हे काम पुन्हा उघडल्यावर मागील सर्व रोजनिशी नोंदी, टाइमलाइन आणि पूर्णता अहवाल कायमस्वरूपी अबाधित राहतील व नवी रोजनिशी पुढे जोडली जाईल.'
              : 'Reopening this task preserves all prior work logs, timeline entries, and completion reports permanently.'}
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {language === 'mr' ? 'काम पुन्हा सुरू करण्याचे कारण (Reason for Reopening)' : 'Reopen Reason'} *
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder={
                language === 'mr'
                  ? 'उदा. गवळ्यांकडून फॅटबाबत पुन्हा नवी तक्रार आली किंवा पुढील पाठपुरावा आवश्यक आहे...'
                  : 'Explain why this task is being reopened...'
              }
              required
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {language === 'mr' ? 'नवे कार्य नियोजन (Initial Plan)' : 'Action Plan'}
            </label>
            <input
              type="text"
              value={initialPlan}
              onChange={e => setInitialPlan(e.target.value)}
              placeholder={language === 'mr' ? 'उदा. पुन्हा गोठ्यावर जाऊन तपासणी करणे' : 'Immediate next step'}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {language === 'mr' ? 'नवी अंतिम मुदत तारीख (New Target Date)' : 'New Target Date'}
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={e => setTargetDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
            >
              {language === 'mr' ? 'रद्द करा' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{isSubmitting ? 'प्रक्रिया सुरू...' : language === 'mr' ? 'काम पुन्हा उघडा' : 'Confirm Reopen'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
