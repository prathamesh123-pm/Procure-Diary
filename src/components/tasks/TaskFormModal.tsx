import React, { useState, useEffect } from 'react';
import { ClipboardList, X, CheckCircle2, User, Calendar, AlertCircle } from 'lucide-react';
import { PendingTask, Priority, TaskStatus, Farmer, RouteItem } from '../../types';
import { StorageService } from '../../services/storageService';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: PendingTask | null;
  onSaved: (task: PendingTask) => void;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  taskToEdit,
  onSaved,
}) => {
  const { language, t } = useLanguage();
  const { currentUser } = useAuth();
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [routes, setRoutes] = useState<RouteItem[]>([]);

  const [workName, setWorkName] = useState('');
  const [farmerCode, setFarmerCode] = useState('');
  const [farmerName, setFarmerName] = useState('');
  const [route, setRoute] = useState('RT-101');
  const [assignedToName, setAssignedToName] = useState('सचिन पाटील');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [priority, setPriority] = useState<Priority>('High');
  const [status, setStatus] = useState<TaskStatus>('Pending');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFarmers(StorageService.getFarmers());
      setRoutes(StorageService.getRoutes());

      if (taskToEdit) {
        setWorkName(taskToEdit.workName);
        setFarmerCode(taskToEdit.farmerCode || '');
        setFarmerName(taskToEdit.farmerName || '');
        setRoute(taskToEdit.route);
        setAssignedToName(taskToEdit.assignedToName);
        setDueDate(taskToEdit.dueDate);
        setPriority(taskToEdit.priority);
        setStatus(taskToEdit.status);
        setDescription(taskToEdit.description);
      } else {
        setWorkName('');
        setFarmerCode('');
        setFarmerName('');
        setRoute(routes[0]?.routeNumber || 'RT-101');
        setAssignedToName(currentUser?.name || 'सचिन पाटील');
        const next = new Date();
        next.setDate(next.getDate() + 2);
        setDueDate(next.toISOString().split('T')[0]);
        setPriority('High');
        setStatus('Pending');
        setDescription('');
      }
    }
  }, [isOpen, taskToEdit]);

  const handleFarmerChange = (code: string) => {
    setFarmerCode(code);
    const f = farmers.find(item => item.farmerCode === code);
    if (f) {
      setFarmerName(f.farmerName);
      setRoute(f.route);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workName.trim()) return;

    const task: PendingTask = {
      id: taskToEdit ? taskToEdit.id : `TASK-${Date.now()}`,
      workName: workName.trim(),
      farmerCode: farmerCode || undefined,
      farmerName: farmerName || undefined,
      route,
      assignedToId: 'OFF-101',
      assignedToName: assignedToName.trim(),
      createdDate: taskToEdit ? taskToEdit.createdDate : new Date().toISOString().split('T')[0],
      dueDate,
      priority,
      status,
      description: description.trim(),
    };

    StorageService.saveTask(task);
    onSaved(task);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
              <ClipboardList className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {taskToEdit ? (language === 'mr' ? 'काम संपादित करा' : 'Edit Task') : (language === 'mr' ? 'नवीन प्रलंबित काम / तक्रार' : 'New Field Task')}
              </h3>
              <p className="text-[11px] text-slate-500">
                {language === 'mr' ? 'शेतकरी तक्रार, पशुखाद्य पुरवठा किंवा कागदपत्र काम' : 'Field work order & complaints tracking'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">{t('task.name')} *</label>
            <input
              type="text"
              value={workName}
              onChange={e => setWorkName(e.target.value)}
              placeholder={language === 'mr' ? 'उदा. ५ गोणी सुग्रास पशुखाद्य पोहोचवणे' : 'e.g. Deliver 5 bags cattle feed'}
              className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-slate-900 dark:text-white"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">{t('task.farmer')}</label>
              <select
                value={farmerCode}
                onChange={e => handleFarmerChange(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="">{language === 'mr' ? '-- शेतकरी निवडा (ऐच्छिक) --' : '-- Select Farmer (Optional) --'}</option>
                {farmers.map(f => (
                  <option key={f.id} value={f.farmerCode}>
                    {f.farmerCode} - {f.farmerName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">{t('task.route')}</label>
              <select
                value={route}
                onChange={e => setRoute(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                {routes.map(r => (
                  <option key={r.id} value={r.routeNumber}>
                    {r.routeNumber} - {r.routeName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">{t('task.assigned_to')}</label>
              <input
                type="text"
                value={assignedToName}
                onChange={e => setAssignedToName(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">{t('task.due_date')}</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">{t('task.priority')}</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as Priority)}
                className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 mb-1">{t('task.status')}</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as TaskStatus)}
              className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
            >
              <option value="Pending">Pending (प्रलंबित)</option>
              <option value="In Progress">In Progress (प्रगतीपथावर)</option>
              <option value="Completed">Completed (पूर्ण झाले)</option>
              <option value="Cancelled">Cancelled (रद्द)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 mb-1">{language === 'mr' ? 'तपशीलवार वर्णन' : 'Description'}</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              placeholder={language === 'mr' ? 'कामाचे सविस्तर वर्णन व सूचना...' : 'Task instructions...'}
              className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              {t('btn.cancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer"
            >
              {t('btn.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
