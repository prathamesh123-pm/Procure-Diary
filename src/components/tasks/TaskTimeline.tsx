import React from 'react';
import {
  Calendar,
  Clock,
  User,
  CheckCircle2,
  PhoneCall,
  MapPin,
  FileText,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Paperclip,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { TimelineActivity, TimelineActivityType } from '../../types/task';
import { useLanguage } from '../../context/LanguageContext';

interface TaskTimelineProps {
  timeline: TimelineActivity[];
}

export const TaskTimeline: React.FC<TaskTimelineProps> = ({ timeline }) => {
  const { language } = useLanguage();

  const getActivityIcon = (type: TimelineActivityType) => {
    switch (type) {
      case 'created':
        return <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'call_logged':
        return <PhoneCall className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'visit_completed':
        return <MapPin className="w-4 h-4 text-teal-600 dark:text-teal-400" />;
      case 'work_log_added':
        return <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
      case 'followup_scheduled':
        return <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'status_changed':
        return <Activity className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'reopened':
        return <RotateCcw className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4 text-slate-500" />;
      default:
        return <Activity className="w-4 h-4 text-slate-500" />;
    }
  };

  const getActivityColor = (type: TimelineActivityType) => {
    switch (type) {
      case 'created':
        return 'bg-blue-100 dark:bg-blue-950 border-blue-200 dark:border-blue-800';
      case 'call_logged':
        return 'bg-emerald-100 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800';
      case 'visit_completed':
        return 'bg-teal-100 dark:bg-teal-950 border-teal-200 dark:border-teal-800';
      case 'work_log_added':
        return 'bg-indigo-100 dark:bg-indigo-950 border-indigo-200 dark:border-indigo-800';
      case 'completed':
        return 'bg-emerald-200 dark:bg-emerald-900 border-emerald-400 dark:border-emerald-600';
      case 'reopened':
        return 'bg-rose-100 dark:bg-rose-950 border-rose-200 dark:border-rose-800';
      case 'status_changed':
        return 'bg-purple-100 dark:bg-purple-950 border-purple-200 dark:border-purple-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
    }
  };

  if (!timeline || timeline.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
        {language === 'mr' ? 'कोणतीही टाइमलाइन घटना उपलब्ध नाही' : 'No timeline activities recorded.'}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
        <span>{language === 'mr' ? 'कायमस्वरूपी टाइमलाइन (Task Timeline):' : 'Permanent Activity Timeline:'}</span>
        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold">
          {timeline.length} {language === 'mr' ? 'घटना' : 'events'}
        </span>
      </div>

      <div className="relative pl-6 sm:pl-8 space-y-6 before:content-[''] before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
        {timeline.map((item, idx) => {
          return (
            <div key={item.id || idx} className="relative group">
              {/* Timeline dot icon */}
              <div
                className={`absolute -left-6 sm:-left-8 top-0.5 w-6 sm:w-7 h-6 sm:h-7 rounded-full flex items-center justify-center border-2 shadow-2xs ${getActivityColor(
                  item.activityType
                )} transition-transform group-hover:scale-110`}
              >
                {getActivityIcon(item.activityType)}
              </div>

              {/* Event Content Card */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-1.5 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                    {item.title}
                  </h5>

                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1 font-medium">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {item.date}
                    </span>
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {item.time}
                    </span>
                  </div>
                </div>

                {item.remarks && (
                  <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {item.remarks}
                  </p>
                )}

                {item.previousStatus && item.newStatus && (
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    <span>{item.previousStatus}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{item.newStatus}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-[10.5px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>
                      {language === 'mr' ? 'नोंदवणारे अधिकारी: ' : 'Recorded By: '}
                      <strong className="text-slate-700 dark:text-slate-300">{item.user.name}</strong>
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">#{idx + 1}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
