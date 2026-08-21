import { CloudBackupSnapshot } from '../types';
import { StorageService } from './storageService';
import { ActivityService, getDeviceInfo } from './activityService';
import { CallTrackerService } from './callTrackerService';
import { DailyReportService } from './dailyReportService';
import { DownloadService } from './downloadService';
import { TaskStorageService } from './taskStorageService';

const STORAGE_KEY_BACKUPS = 'dairy_db_backups';
const STORAGE_KEY_LAST_AUTO_BACKUP = 'dairy_db_last_auto_backup';

export class BackupService {
  static getBackups(): CloudBackupSnapshot[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_BACKUPS);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error('Error loading backups:', e);
    }
    return [];
  }

  /**
   * Create a comprehensive system snapshot
   */
  static createBackupSnapshot(backupType: 'auto' | 'scheduled' | 'manual' = 'manual'): CloudBackupSnapshot {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let currentUser: any = { id: 'USR-ADMIN-1', name: 'प्रमोद सावंत (Pramod Sawant)' };
    try {
      const saved = localStorage.getItem('dairy_current_user');
      if (saved) currentUser = JSON.parse(saved);
    } catch {}

    const farmers = StorageService.getFarmers();
    const calls = StorageService.getCalls();
    const incomingCalls = StorageService.getIncomingCalls();
    const tasks = TaskStorageService.getTasks();
    const followUps = StorageService.getFollowUps();
    const routes = StorageService.getRoutes();
    const users = StorageService.getUsers();
    const activities = ActivityService.getActivities();
    const callHistory = CallTrackerService.getCallHistory();
    const dailyReports = DailyReportService.getDailyReports();
    const downloads = DownloadService.getDownloads();
    const plans = StorageService.getDailyPlans();

    const dataPayload = {
      farmers,
      calls,
      incomingCalls,
      tasks,
      followUps,
      routes,
      users,
      activities,
      callHistory,
      dailyReports,
      plans,
      downloads,
    };

    const jsonStr = JSON.stringify(dataPayload);
    const sizeBytes = new Blob([jsonStr]).size;

    const snapshot: CloudBackupSnapshot = {
      id: `BK-${Date.now()}`,
      timestamp: now.toISOString(),
      date: dateStr,
      time: timeStr,
      version: '2.0-cloud',
      userId: currentUser.id,
      userName: currentUser.name,
      deviceName: getDeviceInfo().deviceName,
      itemCounts: {
        farmers: farmers.length,
        calls: calls.length + callHistory.length,
        tasks: tasks.length,
        routes: routes.length,
        activities: activities.length,
        reports: dailyReports.length,
      },
      data: dataPayload,
      sizeBytes,
      backupType,
    };

    // Save locally
    const backups = BackupService.getBackups();
    backups.unshift(snapshot);
    if (backups.length > 30) backups.pop(); // keep last 30 snapshots
    localStorage.setItem(STORAGE_KEY_BACKUPS, JSON.stringify(backups));
    localStorage.setItem(STORAGE_KEY_LAST_AUTO_BACKUP, now.toISOString());

    // Save to Download Center
    DownloadService.addDownload({
      name: `System_Cloud_Backup_${snapshot.date}_${snapshot.time.replace(':', '-')}.json`,
      type: 'backup',
      size: `${Math.round(sizeBytes / 1024)} KB`,
      category: 'सिस्टीम क्लाउड बॅकअप (System Backup)',
      generatedBy: currentUser.name,
      recordCount: farmers.length + calls.length + tasks.length,
    });

    // Track activity
    ActivityService.trackActivity({
      activityType: 'backup_completed',
      title: `${backupType === 'auto' ? 'स्वयंचलित (Auto)' : backupType === 'scheduled' ? 'नियोजित (Scheduled)' : 'मॅन्युअल (Manual)'} क्लाउड बॅकअप पूर्ण`,
      description: `एकूण नोंदी: ${farmers.length} गवळी, ${calls.length} कॉल्स, ${tasks.length} कामे | आकार: ${Math.round(sizeBytes / 1024)} KB`,
      entityType: 'backup',
      entityId: snapshot.id,
      details: { sizeBytes, backupType, itemCounts: snapshot.itemCounts },
    });

    // Send to backend server
    if (navigator.onLine) {
      fetch('/api/backup/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(snapshot),
      }).catch(() => {});
    }

    window.dispatchEvent(new CustomEvent('dairy_backup_completed', { detail: snapshot }));
    return snapshot;
  }

  /**
   * Check and run automatic background daily backup
   */
  static checkAndTriggerAutoBackup(): void {
    const last = localStorage.getItem(STORAGE_KEY_LAST_AUTO_BACKUP);
    if (!last) {
      BackupService.createBackupSnapshot('auto');
      return;
    }

    const lastTime = new Date(last).getTime();
    const now = Date.now();
    // If more than 12 hours since last backup
    if (now - lastTime > 12 * 60 * 60 * 1000) {
      BackupService.createBackupSnapshot('scheduled');
    }
  }

  /**
   * Restore all system data from snapshot
   */
  static restoreFromSnapshot(snapshot: CloudBackupSnapshot): boolean {
    try {
      if (!snapshot.data) return false;
      const d = snapshot.data;

      if (d.farmers) localStorage.setItem('dairy_db_farmers', JSON.stringify(d.farmers));
      if (d.routes) localStorage.setItem('dairy_db_routes', JSON.stringify(d.routes));
      if (d.calls) localStorage.setItem('dairy_db_calls', JSON.stringify(d.calls));
      if (d.incomingCalls) localStorage.setItem('dairy_db_incoming_calls', JSON.stringify(d.incomingCalls));
      if (d.tasks) {
        localStorage.setItem('dairy_db_tasks', JSON.stringify(d.tasks));
        localStorage.setItem('dairy_executive_tasks', JSON.stringify(d.tasks));
      }
      if (d.followUps) localStorage.setItem('dairy_db_followups', JSON.stringify(d.followUps));
      if (d.users) localStorage.setItem('dairy_db_users', JSON.stringify(d.users));
      if (d.activities) localStorage.setItem('dairy_db_activities', JSON.stringify(d.activities));
      if (d.callHistory) localStorage.setItem('dairy_db_call_history', JSON.stringify(d.callHistory));
      if (d.dailyReports) localStorage.setItem('dairy_db_daily_reports', JSON.stringify(d.dailyReports));
      if (d.plans) localStorage.setItem('dairy_db_daily_plans', JSON.stringify(d.plans));
      if (d.downloads) localStorage.setItem('dairy_db_downloads', JSON.stringify(d.downloads));

      ActivityService.trackActivity({
        activityType: 'data_restored',
        title: `सिस्टीम डेटा यशस्वीरीत्या रिस्टोअर झाला`,
        description: `बॅकअप तारीख: ${snapshot.date} ${snapshot.time} | रिस्टोअर केले: ${snapshot.itemCounts?.farmers || 0} शेतकरी`,
        entityType: 'backup',
        entityId: snapshot.id,
      });

      window.dispatchEvent(new CustomEvent('dairy_data_restored', { detail: snapshot }));
      return true;
    } catch (e) {
      console.error('Failed to restore from snapshot:', e);
      return false;
    }
  }

  /**
   * Download JSON file of snapshot
   */
  static downloadSnapshotFile(snapshot: CloudBackupSnapshot): void {
    const jsonStr = JSON.stringify(snapshot, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Dairy_Cloud_Backup_${snapshot.date}_${snapshot.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
