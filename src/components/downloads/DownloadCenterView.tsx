import React, { useState, useEffect } from 'react';
import {
  DownloadCloud,
  FileText,
  FileSpreadsheet,
  FileCode,
  Database,
  Search,
  Trash2,
  Download,
  Upload,
  Calendar,
  Clock,
  User,
  HardDrive,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { DownloadItem } from '../../types';
import { DownloadService } from '../../services/downloadService';
import { BackupService } from '../../services/backupService';
import { ActivityService } from '../../services/activityService';

export const DownloadCenterView: React.FC = () => {
  const { language } = useLanguage();
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [restoreSuccess, setRestoreSuccess] = useState<string | null>(null);

  const loadData = () => {
    setDownloads(DownloadService.getDownloads());
  };

  useEffect(() => {
    loadData();
    const handleDownloadAdded = () => loadData();
    window.addEventListener('dairy_download_added', handleDownloadAdded);
    return () => window.removeEventListener('dairy_download_added', handleDownloadAdded);
  }, []);

  const handleDelete = (id: string) => {
    DownloadService.deleteDownload(id);
    loadData();
  };

  const handleDownloadFile = (item: DownloadItem) => {
    ActivityService.trackActivity({
      activityType: 'report_created',
      title: `फाईल डाउनलोड केली: ${item.name}`,
      description: `प्रकार: ${item.type.toUpperCase()} | आकार: ${item.size}`,
    });

    if (item.type === 'backup') {
      const backups = BackupService.getBackups();
      const snap = backups[0];
      if (snap) {
        BackupService.downloadSnapshotFile(snap);
        return;
      }
    }

    // Default download trigger simulation
    const dummyBlob = new Blob([`Dairy Procure Report: ${item.name}\nGenerated on: ${item.date}`], {
      type: 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(dummyBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = item.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackupFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.data) {
          const success = BackupService.restoreFromSnapshot(json);
          if (success) {
            setRestoreSuccess('सिस्टीम बॅकअप यशस्वीरीत्या रिस्टोअर झाला! सर्व डेटा लोड झाला.');
            setTimeout(() => setRestoreSuccess(null), 4000);
          }
        }
      } catch (err) {
        alert('अवैध बॅकअप फाईल. कृपया वैध JSON बॅकअप निवडा.');
      }
    };
    reader.readAsText(file);
  };

  const filtered = downloads.filter(d => {
    if (filterType !== 'all' && d.type !== filterType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        d.name.toLowerCase().includes(q) ||
        (d.category || '').toLowerCase().includes(q) ||
        (d.generatedBy || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'excel':
        return <FileSpreadsheet className="w-5 h-5 text-emerald-500" />;
      case 'word':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'csv':
        return <FileCode className="w-5 h-5 text-amber-500" />;
      case 'backup':
        return <Database className="w-5 h-5 text-purple-500" />;
      default:
        return <DownloadCloud className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <DownloadCloud className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                  {language === 'mr' ? 'डाउनलोड व अहवाल केंद्र (Download Center)' : 'Download Center & Files'}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {language === 'mr'
                    ? 'सर्व तयार केलेले PDF अहवाल, एक्सेल वर्कबुक्स, वर्ड फाईल्स व सिस्टम बॅकअप'
                    : 'Access and download all generated PDFs, Excel workbooks, Word docs, and backup snapshots'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <label className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs shadow-purple-600/30 transition-all cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>{language === 'mr' ? 'बॅकअप रिस्टोअर करा' : 'Restore Backup'}</span>
              <input type="file" accept=".json" onChange={handleImportBackupFile} className="hidden" />
            </label>

            <button
              onClick={() => {
                BackupService.createBackupSnapshot('manual');
                loadData();
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs shadow-emerald-600/30 transition-all cursor-pointer"
            >
              <Database className="w-4 h-4" />
              <span>{language === 'mr' ? 'नवीन बॅकअप घ्या' : 'Backup Now'}</span>
            </button>
          </div>
        </div>

        {restoreSuccess && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{restoreSuccess}</span>
          </div>
        )}

        {/* Filters */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={language === 'mr' ? 'फाईलचे नाव किंवा प्रवर्ग शोधा...' : 'Search file name, category...'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden"
            />
          </div>

          <div>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden"
            >
              <option value="all">सर्व फाईल्स (All Files)</option>
              <option value="pdf">PDF अहवाल (.pdf)</option>
              <option value="excel">Excel वर्कबुक्स (.xlsx)</option>
              <option value="word">Word अहवाल (.doc)</option>
              <option value="csv">CSV डेटा (.csv)</option>
              <option value="backup">सिस्टम क्लाउड बॅकअप (.json)</option>
            </select>
          </div>

          <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 font-semibold">
            <span>उपलब्ध फाईल्स:</span>
            <span className="font-bold">{filtered.length}</span>
          </div>
        </div>
      </div>

      {/* Files Grid & Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-blue-600" />
          <span>डाउनलोड रिपॉझिटरी (Generated Files Repository)</span>
        </h2>

        {filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-400 space-y-2">
            <DownloadCloud className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
            <p className="text-xs">कोणतीही फाईल उपलब्ध नाही.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(item => (
              <div
                key={item.id}
                className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-2xs">
                    {getFileIcon(item.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate" title={item.name}>
                      {item.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{item.category}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/80 dark:border-slate-700/80">
                  <div className="flex items-center gap-2 font-mono">
                    <span>{item.date}</span>
                    <span>•</span>
                    <span>{item.size}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleDownloadFile(item)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/80 text-blue-700 dark:text-blue-300 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>डाउनलोड</span>
                    </button>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                      title="Delete file"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
