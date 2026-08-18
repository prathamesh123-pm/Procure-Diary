import React from 'react';
import {
  AlertTriangle,
  Trash2,
  X,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title?: string;
  itemName?: string;
  itemCode?: string;
  itemType?: string;
  warningMessage?: string;
  dependentItems?: { label: string; count: number }[];
  isDeleting?: boolean;
  confirmText?: string;
  cancelText?: string;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  itemCode,
  itemType,
  warningMessage,
  dependentItems = [],
  isDeleting = false,
  confirmText,
  cancelText,
}) => {
  const { language } = useLanguage();
  const isMr = language === 'mr';

  if (!isOpen) return null;

  const defaultTitle = isMr
    ? 'तुम्हाला हा रेकॉर्ड नक्की डिलीट करायचा आहे का?'
    : 'Are you sure you want to delete this record?';

  const defaultSubtext = isMr
    ? 'हा रेकॉर्ड कायमस्वरूपी काढून टाकला जाईल आणि हा बदल पूर्ववत करता येणार नाही.'
    : 'This record will be permanently deleted and this action cannot be undone.';

  const hasDependencies = dependentItems.some(d => d.count > 0);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in"
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-red-100 dark:border-red-950/80 space-y-4 animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header with Danger Icon */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 ring-4 ring-red-50 dark:ring-red-900/30">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                {itemType || (isMr ? 'डिलीट पुष्टीकरण' : 'Delete Confirmation')}
              </span>
              <h3 id="delete-dialog-title" className="font-bold text-base text-slate-900 dark:text-white leading-snug">
                {title || defaultTitle}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer transition-colors"
            title={isMr ? 'बंद करा' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Item details card */}
        {(itemName || itemCode) && (
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="font-black text-sm text-slate-900 dark:text-white line-clamp-1">
                {itemName}
              </span>
              {itemCode && (
                <span className="px-2 py-0.5 text-xs font-mono font-bold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-md shrink-0">
                  {itemCode}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">{defaultSubtext}</p>
          </div>
        )}

        {/* Warning about dependent data */}
        {hasDependencies && (
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>
                {isMr
                  ? 'सावधान: या रेकॉर्डशी संबंधित इतर माहिती जोडलेली आहे!'
                  : 'Warning: Linked dependent data detected!'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {dependentItems.map(
                (dep, idx) =>
                  dep.count > 0 && (
                    <div
                      key={idx}
                      className="px-2.5 py-1.5 bg-white/80 dark:bg-slate-900/60 rounded-xl border border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between"
                    >
                      <span className="text-slate-600 dark:text-slate-400 text-[11px]">{dep.label}:</span>
                      <strong className="text-amber-900 dark:text-amber-200 font-bold">{dep.count}</strong>
                    </div>
                  )
              )}
            </div>
            <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-tight">
              {isMr
                ? 'हा रेकॉर्ड डिलीट केल्यास वरील संबंधित नोंदी देखील अद्ययावत किंवा काढून टाकल्या जातील.'
                : 'Deleting this record may affect or clear the associated records above.'}
            </p>
          </div>
        )}

        {/* Custom Warning message */}
        {warningMessage && !hasDependencies && (
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>{warningMessage}</span>
          </div>
        )}

        {/* Action Buttons: Cancel and Delete */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2.5 min-h-[44px] min-w-[80px] rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-all cursor-pointer disabled:opacity-50"
          >
            {cancelText || (isMr ? 'रद्द करा (Cancel)' : 'Cancel')}
          </button>

          <button
            type="button"
            onClick={async () => {
              await onConfirm();
            }}
            disabled={isDeleting}
            className="px-5 py-2.5 min-h-[44px] rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 shadow-md shadow-red-600/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{isMr ? 'हटवत आहे...' : 'Deleting...'}</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>{confirmText || (isMr ? 'नक्की डिलीट करा (Delete)' : 'Delete Record')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
