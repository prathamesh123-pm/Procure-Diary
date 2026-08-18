import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, title?: string, duration?: number) => void;
  showSuccess: (message?: string, title?: string) => void;
  showError: (message?: string, title?: string) => void;
  showDeleteSuccess: (recordName?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'success', title?: string, duration: number = 3500) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newToast: ToastMessage = { id, type, message, title, duration };

      setToasts(prev => [...prev, newToast]);

      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast]
  );

  const showSuccess = useCallback(
    (message: string = 'Record deleted successfully.', title?: string) => {
      showToast(message, 'success', title);
    },
    [showToast]
  );

  const showError = useCallback(
    (message: string = 'Action could not be completed.', title?: string) => {
      showToast(message, 'error', title);
    },
    [showToast]
  );

  const showDeleteSuccess = useCallback(
    (recordName?: string) => {
      const msg = recordName
        ? `"${recordName}" deleted successfully.`
        : 'Record deleted successfully.';
      showToast(msg, 'success', 'Deleted');
    },
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showDeleteSuccess }}>
      {children}

      {/* Floating Toast Notification Container */}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-3"
      >
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl shadow-xl border backdrop-blur-md transition-all animate-in slide-in-from-bottom-5 duration-200 ${
              toast.type === 'success'
                ? 'bg-emerald-900/95 text-white border-emerald-700/80 shadow-emerald-950/40'
                : toast.type === 'error'
                ? 'bg-red-900/95 text-white border-red-700/80 shadow-red-950/40'
                : toast.type === 'warning'
                ? 'bg-amber-900/95 text-white border-amber-700/80 shadow-amber-950/40'
                : 'bg-slate-900/95 text-white border-slate-700/80 shadow-slate-950/40'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400" />}
              {toast.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-400" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-blue-400" />}
            </div>

            <div className="flex-1 min-w-0">
              {toast.title && <h5 className="font-bold text-xs leading-tight mb-0.5">{toast.title}</h5>}
              <p className="text-xs text-slate-100 leading-snug">{toast.message}</p>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer shrink-0 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
