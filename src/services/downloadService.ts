import { DownloadItem } from '../types';
import { ActivityService } from './activityService';

const STORAGE_KEY_DOWNLOADS = 'dairy_db_downloads';

const INITIAL_DOWNLOADS: DownloadItem[] = [
  {
    id: 'DL-001',
    name: 'Daily_Work_Report_Pramod_Sawant_2026-08-20.pdf',
    type: 'pdf',
    size: '184 KB',
    date: new Date().toISOString().split('T')[0],
    time: '18:30',
    category: 'दैनिक कार्य अहवाल (Daily Report)',
    generatedBy: 'प्रमोद सावंत (Pramod Sawant)',
    recordCount: 14,
  },
  {
    id: 'DL-002',
    name: 'Milk_Collection_Routes_Master_Summary.xlsx',
    type: 'excel',
    size: '72 KB',
    date: new Date().toISOString().split('T')[0],
    time: '14:20',
    category: 'रूट व गवळी विश्लेषण (Routes Master)',
    generatedBy: 'प्रमोद सावंत (Pramod Sawant)',
    recordCount: 5,
  },
  {
    id: 'DL-003',
    name: 'Gavali_Audit_Inspection_Report.doc',
    type: 'word',
    size: '56 KB',
    date: new Date().toISOString().split('T')[0],
    time: '11:15',
    category: 'गोठा तपासणी अहवाल (Inspection)',
    generatedBy: 'प्रमोद सावंत (Pramod Sawant)',
    recordCount: 8,
  },
  {
    id: 'DL-004',
    name: 'Cloud_Backup_Snapshot_2026-08-20.json',
    type: 'backup',
    size: '240 KB',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    category: 'सिस्टीम क्लाउड बॅकअप (System Backup)',
    generatedBy: 'Auto Backup System',
    recordCount: 128,
  },
];

export class DownloadService {
  static getDownloads(): DownloadItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_DOWNLOADS);
      if (raw) {
        return JSON.parse(raw);
      }
      localStorage.setItem(STORAGE_KEY_DOWNLOADS, JSON.stringify(INITIAL_DOWNLOADS));
      return INITIAL_DOWNLOADS;
    } catch {
      return INITIAL_DOWNLOADS;
    }
  }

  static addDownload(item: Omit<DownloadItem, 'id' | 'date' | 'time'> & { id?: string }): DownloadItem {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newItem: DownloadItem = {
      id: item.id || `DL-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      name: item.name,
      type: item.type,
      size: item.size || '120 KB',
      date: dateStr,
      time: timeStr,
      url: item.url,
      dataUri: item.dataUri,
      category: item.category || 'अहवाल (Report)',
      generatedBy: item.generatedBy || 'Executive Officer',
      recordCount: item.recordCount,
    };

    const list = DownloadService.getDownloads();
    list.unshift(newItem);
    if (list.length > 500) list.pop();
    localStorage.setItem(STORAGE_KEY_DOWNLOADS, JSON.stringify(list));

    // Log Activity
    ActivityService.trackActivity({
      activityType:
        newItem.type === 'pdf'
          ? 'pdf_downloaded'
          : newItem.type === 'excel'
          ? 'excel_exported'
          : newItem.type === 'word'
          ? 'word_exported'
          : newItem.type === 'csv'
          ? 'csv_exported'
          : 'report_created',
      title: `फाईल डाउनलोड सेंटरमध्ये जोडली: ${newItem.name}`,
      description: `प्रकार: ${newItem.type.toUpperCase()} | आकार: ${newItem.size} | प्रवर्ग: ${newItem.category}`,
      entityType: 'report',
      entityName: newItem.name,
      details: { fileName: newItem.name, fileType: newItem.type, size: newItem.size },
    });

    window.dispatchEvent(new CustomEvent('dairy_download_added', { detail: newItem }));
    return newItem;
  }

  static deleteDownload(id: string): void {
    const list = DownloadService.getDownloads().filter(d => d.id !== id);
    localStorage.setItem(STORAGE_KEY_DOWNLOADS, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('dairy_download_added'));
  }
}
