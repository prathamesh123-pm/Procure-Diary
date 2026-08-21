import React, { useState, useEffect } from 'react';
import {
  LifeBuoy,
  Plus,
  Search,
  CheckCircle2,
  Share2,
  Trash2,
  CheckSquare,
  Square,
  Send,
} from 'lucide-react';
import { ProducerComplaint, MPOTaskReminder, PriorityLevel } from '../../types';
import { MPOStorageService } from '../../services/mpoStorageService';
import { StorageService } from '../../services/storageService';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';

export const ComplaintTaskManagementView: React.FC = () => {
  const { currentUser } = useAuth();
  const { language } = useLanguage();
  const isMr = language === 'mr';
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'complaints' | 'tasks'>('complaints');

  // Complaints state
  const [complaints, setComplaints] = useState<ProducerComplaint[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  // Tasks state
  const [tasks, setTasks] = useState<MPOTaskReminder[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [newTaskPriority, setNewTaskPriority] = useState<MPOTaskReminder['priority']>('High');

  // Complaint Modal state
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [editingComplaint, setEditingComplaint] = useState<ProducerComplaint | null>(null);

  const farmers = StorageService.getFarmers();

  const [farmerCode, setFarmerCode] = useState('');
  const [complaintType, setComplaintType] = useState<ProducerComplaint['complaintType']>('Fat/SNF Dispute');
  const [priority, setPriority] = useState<PriorityLevel>('High');
  const [subject, setSubject] = useState('');
  const [details, setDetails] = useState('');

  const loadData = () => {
    setComplaints(MPOStorageService.getComplaints());
    setTasks(MPOStorageService.getTasks());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('dairy_mpo_updated', loadData);
    return () => window.removeEventListener('dairy_mpo_updated', loadData);
  }, []);

  const handleOpenNewComplaint = () => {
    setEditingComplaint(null);
    setFarmerCode('');
    setSubject('');
    setDetails('');
    setIsComplaintModalOpen(true);
  };

  const handleSaveComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    const farmer = farmers.find(f => f.farmerCode === farmerCode);
    if (!farmer) {
      showToast(isMr ? 'उत्पादक निवडा' : 'Select producer', 'error');
      return;
    }

    const compObj: ProducerComplaint = {
      id: editingComplaint?.id || `TKT-${Date.now()}`,
      ticketNumber: editingComplaint?.ticketNumber || `TKT-2026-${Math.floor(100 + Math.random() * 900)}`,
      producerCode: farmer.farmerCode,
      producerName: farmer.farmerName,
      mobileNumber: farmer.mobileNumber,
      village: farmer.village,
      route: farmer.route,
      collectionCenter: farmer.collectionCenter || 'मध्यवर्ती संकलन केंद्र',
      complaintType,
      priority,
      subject: subject || `${complaintType} बाबत तक्रार`,
      details,
      lodgedDate: editingComplaint?.lodgedDate || new Date().toISOString().split('T')[0],
      slaDueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      assignedOfficerId: currentUser?.id || 'USR-ADMIN-1',
      assignedOfficerName: currentUser?.name || 'प्रमोद सावंत (MPO)',
      status: editingComplaint?.status || 'Open',
      createdAt: editingComplaint?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    MPOStorageService.saveComplaint(compObj);
    showToast(isMr ? 'तक्रार नोंदवली गेली' : 'Complaint registered', 'success');
    setIsComplaintModalOpen(false);
    loadData();
  };

  const handleResolveComplaint = (comp: ProducerComplaint) => {
    const resolution = prompt(isMr ? 'तक्रार निवारणाचा शेरा टाका:' : 'Enter resolution remarks:', 'समस्या सोडवली गेली व शेतकर्‍याचे समाधान झाले.');
    if (resolution) {
      const updated: ProducerComplaint = {
        ...comp,
        status: 'Resolved',
        resolutionNotes: resolution,
        resolvedDate: new Date().toISOString().split('T')[0],
        resolvedBy: currentUser?.name || 'MPO Officer',
        producerSatisfied: true,
      };
      MPOStorageService.saveComplaint(updated);
      showToast(isMr ? 'तक्रार निवारण पूर्ण झाले' : 'Complaint resolved', 'success');
      loadData();
    }
  };

  const handleWhatsAppStatus = (comp: ProducerComplaint) => {
    const text = `🛎️ *डेअरी तक्रार निवारण अपडेट (Grievance Update)*\n` +
      `नमस्कार *${comp.producerName}*,\n` +
      `आपली तक्रार क्र. *${comp.ticketNumber}* (${comp.complaintType}) बाबत:\n` +
      `📊 *स्थिती:* ${comp.status === 'Resolved' ? '✅ निवारण पूर्ण (Resolved)' : '⏳ कार्यवाही सुरू (In Progress)'}\n` +
      `📝 *तपशील:* ${comp.details}\n` +
      (comp.resolutionNotes ? `💡 *निवारण शेरा:* ${comp.resolutionNotes}\n` : '') +
      `👨‍💼 *अधिकारी:* ${comp.assignedOfficerName}\n\n` +
      `_डेअरी शेतकरी ग्राहक सेवा विभाग._`;

    const url = `https://wa.me/91${comp.mobileNumber.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Task methods
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const taskObj: MPOTaskReminder = {
      id: `TSK-${Date.now()}`,
      officerId: currentUser?.id || 'USR-ADMIN-1',
      title: newTaskTitle,
      dueDate: newTaskDueDate,
      priority: newTaskPriority,
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };

    MPOStorageService.saveTask(taskObj);
    setNewTaskTitle('');
    showToast(isMr ? 'नवीन काम/स्मरणपत्र जोडले' : 'Task added', 'success');
    loadData();
  };

  const handleToggleTask = (task: MPOTaskReminder) => {
    const updated: MPOTaskReminder = {
      ...task,
      isCompleted: !task.isCompleted,
      completedAt: !task.isCompleted ? new Date().toISOString() : undefined,
    };
    MPOStorageService.saveTask(updated);
    loadData();
  };

  const handleDeleteTask = (id: string) => {
    MPOStorageService.deleteTask(id);
    showToast(isMr ? 'काम हटवले' : 'Task deleted', 'success');
    loadData();
  };

  const filteredComplaints = complaints.filter(c => {
    const matchSearch =
      c.producerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.producerCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = selectedStatus === 'all' || c.status === selectedStatus;
    const matchType = selectedType === 'all' || c.complaintType === selectedType;
    return matchSearch && matchStatus && matchType;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-300 rounded-xl">
            <LifeBuoy className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">
              {isMr ? 'शेतकरी तक्रारी व कार्य स्मरणपत्रे (Grievances & Tasks)' : 'Complaints, Grievances & Task Manager'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {isMr ? 'फॅट/SNF वाद, बिल तक्रार, पशुखाद्य मागणी, फॉलो-अप व दैनिक कामांची यादी' : 'Fat disputes, payment issues, feed delivery tracking, pending follow-ups & MPO tasks'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('complaints')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold cursor-pointer transition-all ${
              activeTab === 'complaints'
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            {isMr ? 'तक्रार व्यवस्थापन' : 'Complaints'} ({complaints.filter(c => c.status !== 'Resolved').length})
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold cursor-pointer transition-all ${
              activeTab === 'tasks'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            {isMr ? 'दैनिक टास्क व स्मरणपत्रे' : 'Tasks & Reminders'} ({tasks.filter(t => !t.isCompleted).length})
          </button>
        </div>
      </div>

      {activeTab === 'complaints' ? (
        /* Complaints View */
        <div className="space-y-4">
          {/* Controls */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder={isMr ? 'शोध (नाव, कोड, क्र.)...' : 'Search complaints...'}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border rounded-xl text-xs sm:text-sm"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedType}
                onChange={e => setSelectedType(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border rounded-xl text-xs sm:text-sm"
              >
                <option value="all">{isMr ? 'सर्व प्रकार' : 'All Types'}</option>
                <option value="Fat/SNF Dispute">Fat/SNF Dispute</option>
                <option value="Payment Delay">Payment Delay</option>
                <option value="Cattle Feed Delivery">Cattle Feed Delivery</option>
                <option value="Electronic Analyzer Issue">Analyzer Issue</option>
                <option value="Can Replacement">Can Replacement</option>
              </select>

              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border rounded-xl text-xs sm:text-sm font-bold"
              >
                <option value="all">{isMr ? 'सर्व स्थिती' : 'All Status'}</option>
                <option value="Open">Open</option>
                <option value="Under Investigation">Under Investigation</option>
                <option value="Resolved">Resolved</option>
              </select>

              <button
                onClick={handleOpenNewComplaint}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1 cursor-pointer shrink-0 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>{isMr ? '+ नोंदवा' : '+ Add'}</span>
              </button>
            </div>
          </div>

          {/* Complaints Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredComplaints.map(comp => (
              <div
                key={comp.id}
                className="p-4 bg-slate-50/70 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 hover:border-rose-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 bg-rose-100 dark:bg-rose-900/50 text-rose-900 dark:text-rose-200 text-xs font-mono font-bold rounded-md">
                          {comp.ticketNumber}
                        </span>
                        <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-md">
                          {comp.complaintType}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base mt-1">
                        {comp.producerName} ({comp.producerCode})
                      </h3>
                      <p className="text-xs text-slate-500">{comp.village} • {comp.mobileNumber}</p>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      comp.status === 'Resolved'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                        : comp.status === 'Under Investigation'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
                    }`}>
                      {comp.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 my-2 bg-white dark:bg-slate-800 p-2.5 rounded-lg border">
                    "{comp.details}"
                  </p>

                  {comp.resolutionNotes && (
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg text-xs text-emerald-900 dark:text-emerald-300 space-y-0.5 mb-2">
                      <span className="font-bold block text-[10px] uppercase">निवारण शेरा (Resolved on {comp.resolvedDate}):</span>
                      <span>{comp.resolutionNotes}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {isMr ? 'तारीख:' : 'Date:'} {comp.lodgedDate}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {comp.status !== 'Resolved' && (
                      <button
                        onClick={() => handleResolveComplaint(comp)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isMr ? 'निवारण करा' : 'Resolve'}</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleWhatsAppStatus(comp)}
                      className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg cursor-pointer"
                      title="Send WhatsApp Update"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Tasks View */
        <div className="space-y-4">
          {/* New Task Input */}
          <form onSubmit={handleAddTask} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
              required
              placeholder={isMr ? 'नवीन काम / स्मरणपत्र टाका (उदा. कवठेपिरान वजनकाटा कॅलिब्रेशन तपासणे)...' : 'Add task or reminder...'}
              className="flex-1 px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl text-xs sm:text-sm"
            />
            <input
              type="date"
              value={newTaskDueDate}
              onChange={e => setNewTaskDueDate(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl text-xs font-mono"
            />
            <select
              value={newTaskPriority}
              onChange={e => setNewTaskPriority(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl text-xs font-bold"
            >
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-md cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{isMr ? 'टास्क जोडा' : 'Add Task'}</span>
            </button>
          </form>

          {/* Task List */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-2.5">
            {tasks.map(task => (
              <div
                key={task.id}
                className={`p-3 rounded-xl border text-xs sm:text-sm flex items-center justify-between gap-3 transition-all ${
                  task.isCompleted
                    ? 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-60'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => handleToggleTask(task)}>
                  {task.isCompleted ? (
                    <CheckSquare className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-400 shrink-0" />
                  )}
                  <div>
                    <span className={`font-semibold ${task.isCompleted ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-100'}`}>
                      {task.title}
                    </span>
                    <span className="text-xs text-slate-400 block font-mono">
                      📅 Due: {task.dueDate} • Priority: {task.priority}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Complaint Modal */}
      {isComplaintModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-5 py-4 bg-gradient-to-r from-rose-700 to-red-800 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">
                {isMr ? 'नवीन शेतकरी तक्रार नोंदवा' : 'Register Grievance'}
              </h3>
              <button onClick={() => setIsComplaintModalOpen(false)} className="text-rose-200 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveComplaint} className="p-5 space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isMr ? 'उत्पादक शेतकरी निवडा' : 'Select Producer'} *
                </label>
                <select
                  value={farmerCode}
                  onChange={e => setFarmerCode(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                >
                  <option value="">-- {isMr ? 'उत्पादक निवडा' : 'Select'} --</option>
                  {farmers.map(f => (
                    <option key={f.id} value={f.farmerCode}>
                      {f.farmerCode} - {f.farmerName} ({f.village})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isMr ? 'तक्रार प्रकार (Category)' : 'Category'}
                </label>
                <select
                  value={complaintType}
                  onChange={e => setComplaintType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                >
                  <option value="Fat/SNF Dispute">दूध फॅट व SNF वाद (Fat/SNF Dispute)</option>
                  <option value="Payment Delay">पेमेंट उशीर / बिल कपात वाद</option>
                  <option value="Cattle Feed Delivery">पशुखाद्य पुरवठा मागणी</option>
                  <option value="Electronic Analyzer Issue">मिल्क अ‍ॅनालायझर बिघाड</option>
                  <option value="Can Replacement">दूध कॅन बदलून देणे</option>
                  <option value="Other">इतर चौकशी</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isMr ? 'तक्रार तपशील (Details)' : 'Details'} *
                </label>
                <textarea
                  rows={3}
                  value={details}
                  onChange={e => setDetails(e.target.value)}
                  required
                  placeholder="तक्रारीचे सविस्तर वर्णन..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsComplaintModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  {isMr ? 'रद्द करा' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{isMr ? 'नोंदणी करा' : 'Submit'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
