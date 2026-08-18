import React, { useState, useRef } from 'react';
import {
  X,
  Award,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  Mic,
  Square,
  Paperclip,
  Image as ImageIcon,
  FileText,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { Task, TaskCompletionReport, WorkLogAttachment } from '../../types/task';
import { TaskStorageService } from '../../services/taskStorageService';
import { useLanguage } from '../../context/LanguageContext';

interface CompleteTaskModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedTask: Task) => void;
}

export const CompleteTaskModal: React.FC<CompleteTaskModalProps> = ({ task, isOpen, onClose, onSuccess }) => {
  const { language } = useLanguage();
  const now = new Date();
  const defaultDate = now.toISOString().split('T')[0];
  const defaultTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const [completionDate, setCompletionDate] = useState(defaultDate);
  const [completionTime, setCompletionTime] = useState(defaultTime);
  const [finalWorkDone, setFinalWorkDone] = useState('');
  const [problemIdentified, setProblemIdentified] = useState('');
  const [solutionProvided, setSolutionProvided] = useState('');
  const [finalResult, setFinalResult] = useState('');
  const [pendingIssues, setPendingIssues] = useState('');
  const [nextRecommendation, setNextRecommendation] = useState('');
  const [completionRemarks, setCompletionRemarks] = useState('');

  const [photos, setPhotos] = useState<WorkLogAttachment[]>([]);
  const [documents, setDocuments] = useState<WorkLogAttachment[]>([]);
  const [voiceNote, setVoiceNote] = useState<WorkLogAttachment | undefined>(undefined);

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'document') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const newAttachment: WorkLogAttachment = {
        id: `att_${Date.now()}`,
        name: file.name,
        type,
        url: reader.result as string,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      };
      if (type === 'photo') {
        setPhotos(prev => [...prev, newAttachment]);
      } else {
        setDocuments(prev => [...prev, newAttachment]);
      }
    };
    reader.readAsDataURL(file);
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          setVoiceNote({
            id: `att_comp_voice_${Date.now()}`,
            name: `Completion_Audio_Report_${completionDate}.webm`,
            type: 'voice_note',
            url: base64data,
            duration: 20,
            uploadedAt: new Date().toISOString(),
          });
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      alert(language === 'mr' ? 'मायक्रोफोन उपलब्ध नाही.' : 'Microphone unavailable.');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!finalWorkDone.trim() || !problemIdentified.trim() || !solutionProvided.trim() || !finalResult.trim()) {
      setError(
        language === 'mr'
          ? 'कृपया अंतिम काम, समस्येचा शोध, दिलेला तोडगा व अंतिम निकाल हे सर्व आवश्यक रकाने भरा.'
          : 'Please complete all required fields (Final Work Done, Problem Identified, Solution Provided, Final Result).'
      );
      return;
    }

    setIsSaving(true);
    try {
      const currentUser = { id: 'user_1', name: 'प्रमोद सावंत (Pramod Sawant)', role: 'officer' };

      const updatedTask = TaskStorageService.completeTask(
        task.id,
        {
          completionDate,
          completionTime,
          completedBy: currentUser,
          finalWorkDone: finalWorkDone.trim(),
          problemIdentified: problemIdentified.trim(),
          solutionProvided: solutionProvided.trim(),
          finalResult: finalResult.trim(),
          pendingIssues: pendingIssues.trim() || undefined,
          nextRecommendation: nextRecommendation.trim() || undefined,
          completionRemarks: completionRemarks.trim() || undefined,
          photos,
          documents,
          voiceNote,
        },
        currentUser
      );

      onSuccess(updatedTask);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to complete task');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold">
                {language === 'mr' ? 'काम पूर्णता अहवाल (Task Completion Report)' : 'Official Completion Report'}
              </h3>
              <p className="text-xs text-emerald-100 font-medium">
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto grow">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {language === 'mr'
                ? 'कामाची अधिकृत पूर्णता करण्यासाठी हा अहवाल भरणे बंधनकारक आहे. हा अहवाल कायमस्वरूपी सेव्ह राहील.'
                : 'Filing this completion report is mandatory before closing the task. This record is permanently archived.'}
            </span>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'mr' ? 'पूर्ण झाल्याची तारीख' : 'Completion Date'} *
              </label>
              <input
                type="date"
                value={completionDate}
                onChange={e => setCompletionDate(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'mr' ? 'पूर्ण झाल्याची वेळ' : 'Completion Time'} *
              </label>
              <input
                type="text"
                value={completionTime}
                onChange={e => setCompletionTime(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Problem Identified */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {language === 'mr' ? '१. समस्येचा शोध / मूळ कारण (Problem Identified)' : '1. Problem Identified'} *
            </label>
            <textarea
              rows={2}
              value={problemIdentified}
              onChange={e => setProblemIdentified(e.target.value)}
              placeholder={
                language === 'mr'
                  ? 'उदा. मिल्क अ‍ॅनालायझर सेन्सरवर फॅटचा थर जमा झाल्यामुळे रिडिंग कमी येत होते...'
                  : 'Root cause or core problem...'
              }
              required
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Solution Provided */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {language === 'mr' ? '२. दिलेला तोडगा / केलेली कारवाई (Solution Provided)' : '2. Solution Provided'} *
            </label>
            <textarea
              rows={2}
              value={solutionProvided}
              onChange={e => setSolutionProvided(e.target.value)}
              placeholder={
                language === 'mr'
                  ? 'उदा. सेन्सर क्लीनिंग व गरम पाण्याने वॉश करून स्टँडर्ड ऑइलने कॅलिब्रेशन केले...'
                  : 'Actions taken to solve the issue...'
              }
              required
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Final Work Done */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {language === 'mr' ? '३. प्रत्यक्ष अंतिम काम (Final Work Done)' : '3. Final Work Done'} *
            </label>
            <textarea
              rows={2}
              value={finalWorkDone}
              onChange={e => setFinalWorkDone(e.target.value)}
              placeholder={
                language === 'mr'
                  ? 'उदा. प्रत्यक्ष गोठा भेट देऊन गवळ्यांच्या उपस्थितीत सँपल फेरचाचणी केली व समाधान केले...'
                  : 'Final execution summary...'
              }
              required
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Final Result */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {language === 'mr' ? '४. अंतिम निकाल / निष्पत्ती (Final Result)' : '4. Final Result'} *
            </label>
            <input
              type="text"
              value={finalResult}
              onChange={e => setFinalResult(e.target.value)}
              placeholder={
                language === 'mr'
                  ? 'उदा. गवळ्यांचे समाधान झाले, १००% दुध संकलन पूर्ववत सुरू राहिले.'
                  : 'Final outcome...'
              }
              required
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Pending Issues & Recommendations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'mr' ? 'शिल्लक मुद्दे (Pending Issues if any)' : 'Pending Issues'}
              </label>
              <input
                type="text"
                value={pendingIssues}
                onChange={e => setPendingIssues(e.target.value)}
                placeholder={language === 'mr' ? 'काही बाकी आहे का?' : 'None or remaining items'}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'mr' ? 'पुढील शिफारसी (Next Recommendation)' : 'Recommendation'}
              </label>
              <input
                type="text"
                value={nextRecommendation}
                onChange={e => setNextRecommendation(e.target.value)}
                placeholder={language === 'mr' ? 'भविष्यातील नियोजन' : 'Future recommendations'}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Media Attachments & Voice Note */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Paperclip className="w-3.5 h-3.5 text-emerald-600" />
                <span>{language === 'mr' ? 'पूर्णता पुरावे (Photos / Documents / Voice Note):' : 'Proof of Completion:'}</span>
              </span>

              {!isRecording ? (
                <button
                  type="button"
                  onClick={startVoiceRecording}
                  className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 text-[11px] font-bold rounded-lg border border-red-200 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>{language === 'mr' ? 'व्हॉईस अहवाल' : 'Record Voice'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopVoiceRecording}
                  className="px-2.5 py-1 bg-red-600 animate-pulse text-white text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>{language === 'mr' ? 'थांबवा' : 'Stop'}</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <label className="px-2.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-600 transition-all flex items-center gap-1 cursor-pointer shadow-2xs">
                <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
                <span>+ फोटो (Photo)</span>
                <input type="file" accept="image/*" onChange={e => handleFileUpload(e, 'photo')} className="hidden" />
              </label>

              <label className="px-2.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-600 transition-all flex items-center gap-1 cursor-pointer shadow-2xs">
                <FileText className="w-3.5 h-3.5 text-amber-500" />
                <span>+ कागदपत्र (Doc)</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  onChange={e => handleFileUpload(e, 'document')}
                  className="hidden"
                />
              </label>
            </div>

            {/* List attached */}
            {(photos.length > 0 || documents.length > 0 || voiceNote) && (
              <div className="pt-1.5 space-y-1">
                {photos.map(p => (
                  <div key={p.id} className="text-xs text-blue-600 flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" />
                    <span>{p.name}</span>
                  </div>
                ))}
                {documents.map(d => (
                  <div key={d.id} className="text-xs text-amber-600 flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    <span>{d.name}</span>
                  </div>
                ))}
                {voiceNote && (
                  <div className="text-xs text-red-600 flex items-center gap-1">
                    <Mic className="w-3 h-3" />
                    <span>{voiceNote.name}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {language === 'mr' ? 'पूर्णता शेरा (Completion Remarks)' : 'Completion Remarks'}
            </label>
            <input
              type="text"
              value={completionRemarks}
              onChange={e => setCompletionRemarks(e.target.value)}
              placeholder={language === 'mr' ? 'कामाचा अंतिम शेरा...' : 'Final comments...'}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Footer Actions */}
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
              disabled={isSaving}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSaving ? 'नोंदवत आहे...' : language === 'mr' ? 'काम पूर्ण करा व अहवाल सेव्ह करा' : 'Complete Task & Seal Report'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
