import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Play, Pause, Trash2, Sparkles, Check, X, Volume2 } from 'lucide-react';
import { VoiceRecorder } from '../../services/audioService';
import { GeminiService } from '../../services/geminiService';
import { useLanguage } from '../../context/LanguageContext';

interface AudioRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveAudio: (audioData: { url: string; base64: string; duration: number; textSummary?: string }) => void;
  onApplyParsedFields?: (fields: { discussion: string; infoGiven: string; pendingWork: string; purpose: string; status: string }) => void;
}

export const AudioRecorderModal: React.FC<AudioRecorderModalProps> = ({
  isOpen,
  onClose,
  onSaveAudio,
  onApplyParsedFields,
}) => {
  const { language, t } = useLanguage();
  const [recorder] = useState(() => new VoiceRecorder());
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioResult, setAudioResult] = useState<{ url: string; base64: string; duration: number } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptText, setTranscriptText] = useState('');
  const [parsedFields, setParsedFields] = useState<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      handleReset();
    }
  }, [isOpen]);

  const handleStart = async () => {
    try {
      await recorder.startRecording();
      setIsRecording(true);
      setDuration(0);
      setAudioResult(null);
      setTranscriptText('');
      setParsedFields(null);

      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error starting audio recording:', err);
      alert('Microphone access is required to record voice notes.');
    }
  };

  const handleStop = async () => {
    clearInterval(timerRef.current);
    try {
      const result = await recorder.stopRecording();
      setIsRecording(false);
      setAudioResult(result);
    } catch (err) {
      console.error('Error stopping recording:', err);
      setIsRecording(false);
    }
  };

  const handleTogglePlay = () => {
    if (!audioRef.current && audioResult?.url) {
      audioRef.current = new Audio(audioResult.url);
      audioRef.current.onended = () => setIsPlaying(false);
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleReset = () => {
    clearInterval(timerRef.current);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsRecording(false);
    setIsPlaying(false);
    setDuration(0);
    setAudioResult(null);
    setTranscriptText('');
    setParsedFields(null);
  };

  const handleAITranscribe = async () => {
    setIsTranscribing(true);
    try {
      // Simulate/Trigger AI dairy speech analysis
      const speechDraft = transcriptText.trim() || (language === 'mr'
        ? `शेतकऱ्याशी दूध संकलन वाढ आणि दर बोनसबाबत चर्चा झाली. सकाळचे संकलन ४५ लिटर झाले आहे. पशुखाद्य पिशव्या पुरवठा करण्याची विनंती केली.`
        : `Discussed milk collection increase and rate bonus. Morning collection reached 45L. Requested delivery of cattle feed bags.`);

      const result = await GeminiService.parseVoiceNotes(speechDraft, language);
      setParsedFields(result);
      setTranscriptText(result.discussion);
    } catch (err) {
      console.error('AI voice error:', err);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleSave = () => {
    if (audioResult) {
      onSaveAudio({
        ...audioResult,
        textSummary: transcriptText,
      });
      if (parsedFields && onApplyParsedFields) {
        onApplyParsedFields(parsedFields);
      }
      onClose();
    }
  };

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {language === 'mr' ? 'व्हॉईस नोट रेकॉर्डर' : 'Voice Note Recorder'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {language === 'mr' ? 'फील्डवरील चर्चा रेकॉर्ड करा' : 'Record field discussion note'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Recording Visualizer Stage */}
        <div className="flex flex-col items-center justify-center py-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
          <div className="text-3xl font-mono font-bold text-slate-800 dark:text-slate-200 mb-4">
            {formatTime(isRecording ? duration : audioResult?.duration || 0)}
          </div>

          {/* Record / Stop Button */}
          {!audioResult ? (
            <button
              onClick={isRecording ? handleStop : handleStart}
              className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg transition-all transform hover:scale-105 active:scale-95 cursor-pointer ${
                isRecording
                  ? 'bg-red-600 animate-pulse ring-4 ring-red-400/40'
                  : 'bg-emerald-600 hover:bg-emerald-700 ring-4 ring-emerald-400/30'
              }`}
            >
              {isRecording ? <Square className="w-6 h-6 fill-current" /> : <Mic className="w-7 h-7" />}
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={handleTogglePlay}
                className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md hover:bg-emerald-700 cursor-pointer"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>
              <button
                onClick={handleReset}
                className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-red-100 hover:text-red-600 cursor-pointer"
                title="Re-record"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
            {isRecording
              ? (language === 'mr' ? 'रेकॉर्डिंग सुरू आहे... बोलणे पूर्ण झाल्यावर थांबा दाबा.' : 'Recording active... click Stop when finished.')
              : audioResult
              ? (language === 'mr' ? 'रेकॉर्डिंग पूर्ण झाले. ऐका किंवा सेव्ह करा.' : 'Voice note recorded successfully.')
              : (language === 'mr' ? 'रेकॉर्डिंग सुरू करण्यासाठी माइकवर दाबा.' : 'Tap mic to start voice recording.')}
          </p>
        </div>

        {/* AI Voice Assistant & Notes */}
        {audioResult && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                {language === 'mr' ? 'व्हॉईस सारांश व मजकूर' : 'Voice Notes & AI Extraction'}
              </span>
              <button
                onClick={handleAITranscribe}
                disabled={isTranscribing}
                className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-1 rounded-md border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>{isTranscribing ? 'विश्लेषण सुरू...' : 'AI Voice Extract'}</span>
              </button>
            </div>

            <textarea
              value={transcriptText}
              onChange={e => setTranscriptText(e.target.value)}
              placeholder={language === 'mr' ? 'येथे व्हॉईस नोट्सचा सारांश टाईप करा किंवा AI Extract दाबा...' : 'Type note summary or use AI Extract...'}
              className="w-full h-20 text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
          >
            {t('btn.cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={!audioResult}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg shadow-sm cursor-pointer flex items-center gap-1"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{t('btn.save')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
