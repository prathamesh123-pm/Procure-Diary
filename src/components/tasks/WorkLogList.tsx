import React, { useState } from 'react';
import {
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  MapPin,
  MessageCircle,
  Mail,
  FileText,
  Calendar,
  Clock,
  User,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  Play,
  Volume2,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  FileSpreadsheet,
} from 'lucide-react';
import { WorkLogEntry, WorkLogAttachment } from '../../types/task';
import { useLanguage } from '../../context/LanguageContext';

interface WorkLogListProps {
  workLogs: WorkLogEntry[];
  onAddLogClick?: () => void;
  readOnly?: boolean;
}

export const WorkLogList: React.FC<WorkLogListProps> = ({ workLogs, onAddLogClick, readOnly = false }) => {
  const { language } = useLanguage();
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  if (workLogs.length === 0) {
    return (
      <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-8 text-center border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
        <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
          <FileText className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
          {language === 'mr' ? 'अद्याप कोणतीही रोजनिशी नोंद केलेली नाही' : 'No Work Logs Added Yet'}
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          {language === 'mr'
            ? 'या कामावर केलेला प्रत्येक कॉल, गोठा भेट, व्हॉट्सअ‍ॅप संदेश व घेतलेली माहिती कायमस्वरूपी नोंदवण्यासाठी खालील बटनावर क्लिक करा.'
            : 'Every action performed on this task should be recorded permanently in this chronological work log.'}
        </p>
        {!readOnly && onAddLogClick && (
          <button
            onClick={onAddLogClick}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer inline-flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4" />
            <span>{language === 'mr' ? 'नवीन काम नोंदवा (Add Work Log)' : 'Add First Work Log'}</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <span>{language === 'mr' ? 'एकूण रोजनिशी नोंदी:' : 'Total Work Log Entries:'}</span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
            {workLogs.length}
          </span>
        </div>
        {!readOnly && onAddLogClick && (
          <button
            onClick={onAddLogClick}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{language === 'mr' ? '+ नवीन नोंद' : '+ Add Log'}</span>
          </button>
        )}
      </div>

      <div className="space-y-3">
        {workLogs.map((log, index) => {
          const isExpanded = expandedLogId === log.id || expandedLogId === null; // Default expanded

          return (
            <div
              key={log.id}
              className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-emerald-500/40 transition-all space-y-3"
            >
              {/* Log Header */}
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px] flex items-center justify-center">
                    #{index + 1}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{log.date}</span>
                    <Clock className="w-3.5 h-3.5 text-slate-400 ml-1" />
                    <span>{log.time}</span>
                  </div>

                  {/* Channel Badges */}
                  <div className="flex items-center gap-1 flex-wrap">
                    {log.callMade && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        {log.isIncoming ? (
                          <PhoneIncoming className="w-3 h-3 text-blue-500" />
                        ) : (
                          <PhoneOutgoing className="w-3 h-3 text-blue-500" />
                        )}
                        <span>{log.isIncoming ? 'इनकमिंग कॉल' : 'आउटगोइंग कॉल'}</span>
                      </span>
                    )}

                    {log.visitCompleted && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <MapPin className="w-3 h-3 text-emerald-500" />
                        <span>{language === 'mr' ? 'प्रत्यक्ष गोठा/केंद्र भेट' : 'Field Visit'}</span>
                      </span>
                    )}

                    {log.whatsappSent && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-green-50 dark:bg-green-950/70 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800">
                        <MessageCircle className="w-3 h-3 text-green-600" />
                        <span>WhatsApp</span>
                      </span>
                    )}

                    {log.smsSent && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        <Mail className="w-3 h-3 text-purple-600" />
                        <span>SMS</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                  <User className="w-3.5 h-3.5" />
                  <span className="font-medium truncate max-w-32">{log.createdBy.name}</span>
                </div>
              </div>

              {/* Work Done Description */}
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 leading-relaxed whitespace-pre-wrap">
                  {log.workDescription}
                </p>
              </div>

              {/* Information Given & Received Cards */}
              {(log.informationGiven || log.informationReceived) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                  {log.informationGiven && (
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 space-y-1">
                      <div className="font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        <span>{language === 'mr' ? 'दिलेली माहिती / सूचना:' : 'Information Given:'}</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 text-[11.5px] leading-normal">
                        {log.informationGiven}
                      </p>
                    </div>
                  )}

                  {log.informationReceived && (
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 space-y-1">
                      <div className="font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>{language === 'mr' ? 'मिळालेली माहिती / गवळ्यांचे म्हणणे:' : 'Information Received:'}</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 text-[11.5px] leading-normal">
                        {log.informationReceived}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Pending Work & Next Action */}
              {(log.pendingWork || log.nextAction || log.nextFollowUpDate) && (
                <div className="p-2.5 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/60 text-xs space-y-1.5">
                  <div className="flex items-center gap-4 flex-wrap text-[11.5px]">
                    {log.pendingWork && (
                      <div>
                        <strong className="text-amber-900 dark:text-amber-300">
                          {language === 'mr' ? 'बाकी काम: ' : 'Pending Work: '}
                        </strong>
                        <span className="text-slate-800 dark:text-slate-200">{log.pendingWork}</span>
                      </div>
                    )}

                    {log.nextAction && (
                      <div>
                        <strong className="text-amber-900 dark:text-amber-300">
                          {language === 'mr' ? 'पुढील कृती: ' : 'Next Action: '}
                        </strong>
                        <span className="text-slate-800 dark:text-slate-200">{log.nextAction}</span>
                      </div>
                    )}

                    {log.nextFollowUpDate && (
                      <div className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {language === 'mr' ? `पुढील फॉलो-अप: ${log.nextFollowUpDate}` : `Follow-up: ${log.nextFollowUpDate}`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Attachments Preview (Photos, Docs, Voice Notes) */}
              {log.attachments && log.attachments.length > 0 && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Paperclip className="w-3 h-3" />
                    <span>{language === 'mr' ? 'जोडलेली कागदपत्रे / फोटो / व्हॉईस नोट्स:' : 'Attachments:'}</span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {log.attachments.map(att => (
                      <div
                        key={att.id}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs border border-slate-200 dark:border-slate-700"
                      >
                        {att.type === 'photo' && <ImageIcon className="w-3.5 h-3.5 text-blue-500" />}
                        {att.type === 'voice_note' && <Volume2 className="w-3.5 h-3.5 text-red-500" />}
                        {att.type === 'document' && <FileText className="w-3.5 h-3.5 text-emerald-500" />}
                        {att.type === 'pdf' && <FileSpreadsheet className="w-3.5 h-3.5 text-amber-500" />}
                        <span className="truncate max-w-40 font-medium">{att.name}</span>
                        {att.url && (
                          <a
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-emerald-600 hover:underline font-bold"
                          >
                            View
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {log.remarks && (
                <div className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                  <span>{language === 'mr' ? 'शेरा: ' : 'Remarks: '}</span>
                  <span>{log.remarks}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
