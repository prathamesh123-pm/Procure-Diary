import { ActivityLog, ActivityType, UserRole } from '../types';

const STORAGE_KEY_ACTIVITIES = 'dairy_db_activities';
const STORAGE_KEY_SEARCH_HISTORY = 'dairy_db_search_history';
const STORAGE_KEY_GPS_LOGS = 'dairy_db_gps_logs';

/**
 * Detect Device and Client Telemetry details
 */
export function getDeviceInfo(): {
  deviceName: string;
  osVersion: string;
  browser: string;
  isMobile: boolean;
} {
  const ua = navigator.userAgent || '';
  let os = 'Unknown OS';
  let deviceName = 'Desktop Workstation';
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);

  if (/Android/i.test(ua)) {
    const match = ua.match(/Android\s([0-9\.]+)/);
    os = match ? `Android ${match[1]}` : 'Android';
    deviceName = 'Android Mobile';
  } else if (/iPhone|iPad|iPod/i.test(ua)) {
    os = 'iOS';
    deviceName = /iPad/i.test(ua) ? 'Apple iPad' : 'Apple iPhone';
  } else if (/Windows/i.test(ua)) {
    os = 'Windows OS';
    deviceName = 'Windows PC';
  } else if (/Macintosh|Mac OS X/i.test(ua)) {
    os = 'macOS';
    deviceName = 'MacBook / Mac Desktop';
  } else if (/Linux/i.test(ua)) {
    os = 'Linux';
    deviceName = 'Linux Workstation';
  }

  let browser = 'Web Browser';
  if (/Chrome/i.test(ua) && !/Edg|OPR/i.test(ua)) {
    const match = ua.match(/Chrome\/([0-9\.]+)/);
    browser = match ? `Chrome v${match[1].split('.')[0]}` : 'Google Chrome';
  } else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) {
    browser = 'Apple Safari';
  } else if (/Firefox/i.test(ua)) {
    browser = 'Mozilla Firefox';
  } else if (/Edg/i.test(ua)) {
    browser = 'Microsoft Edge';
  }

  return { deviceName, osVersion: os, browser, isMobile };
}

/**
 * Cached GPS Coordinates for faster logging
 */
let cachedGps: { latitude: number; longitude: number; accuracy?: number; address?: string } | null = null;
let lastGpsTimestamp = 0;

export async function getCurrentGpsLocation(): Promise<{
  latitude: number;
  longitude: number;
  accuracy?: number;
  address?: string;
} | null> {
  const now = Date.now();
  if (cachedGps && now - lastGpsTimestamp < 60000) {
    return cachedGps;
  }

  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return null;
  }

  return new Promise(resolve => {
    navigator.geolocation.getCurrentPosition(
      pos => {
        const coords = {
          latitude: parseFloat(pos.coords.latitude.toFixed(5)),
          longitude: parseFloat(pos.coords.longitude.toFixed(5)),
          accuracy: Math.round(pos.coords.accuracy),
          address: `${pos.coords.latitude.toFixed(3)}°N, ${pos.coords.longitude.toFixed(3)}°E (Maharashtra Dairy Belt)`,
        };
        cachedGps = coords;
        lastGpsTimestamp = Date.now();
        resolve(coords);
      },
      _err => {
        resolve(null);
      },
      { timeout: 4000, enableHighAccuracy: true }
    );
  });
}

/**
 * Current Logged In User Helper
 */
function getCurrentUserMeta(): {
  userId: string;
  userName: string;
  userRole?: UserRole;
  userEmail?: string;
  userMobile?: string;
} {
  try {
    const saved = localStorage.getItem('dairy_current_user');
    if (saved) {
      const user = JSON.parse(saved);
      return {
        userId: user.id || 'USR-EXEC-1',
        userName: user.name || 'Executive Officer',
        userRole: user.role || 'officer',
        userEmail: user.email || 'officer@dairy.com',
        userMobile: user.mobile || '9822000001',
      };
    }
  } catch (e) {
    // Ignore error
  }
  return {
    userId: 'USR-EXEC-1',
    userName: 'प्रमोद सावंत (Pramod Sawant - Executive)',
    userRole: 'admin',
    userEmail: 'admin@dairy.com',
    userMobile: '9822000001',
  };
}

export class ActivityService {
  /**
   * Get all stored activity logs
   */
  static getActivities(): ActivityLog[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_ACTIVITIES);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Error loading activities:', e);
    }
    return [];
  }

  /**
   * Track any action across the entire CRM automatically
   */
  static async trackActivity(params: {
    activityType: ActivityType;
    title: string;
    description: string;
    entityType?: 'farmer' | 'call' | 'task' | 'route' | 'report' | 'user' | 'backup' | 'inspection' | 'shed' | 'center';
    entityId?: string;
    entityName?: string;
    details?: Record<string, any>;
    customGps?: { latitude: number; longitude: number; address?: string };
    userOverride?: { userId: string; userName: string; userRole?: UserRole };
  }): Promise<ActivityLog> {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString('en-US', { hour12: false });
    const userMeta = params.userOverride || getCurrentUserMeta();
    const deviceInfo = getDeviceInfo();
    const isOnline = navigator.onLine;
    const lastSyncTime = localStorage.getItem('dairy_db_last_sync_timestamp') || now.toISOString();

    const gps = params.customGps || (await getCurrentGpsLocation()) || undefined;

    const activity: ActivityLog = {
      id: `ACT-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: now.toISOString(),
      date: dateStr,
      time: timeStr,
      userId: userMeta.userId,
      userName: userMeta.userName,
      userRole: userMeta.userRole,
      userEmail: (userMeta as any).userEmail,
      userMobile: (userMeta as any).userMobile,
      activityType: params.activityType,
      title: params.title,
      description: params.description,
      entityType: params.entityType,
      entityId: params.entityId,
      entityName: params.entityName,
      details: params.details,
      gpsLocation: gps,
      deviceName: deviceInfo.deviceName,
      osVersion: deviceInfo.osVersion,
      browser: deviceInfo.browser,
      internetStatus: isOnline ? 'online' : 'offline',
      lastSyncTime,
    };

    // Save to LocalStorage
    try {
      const list = ActivityService.getActivities();
      list.unshift(activity);
      if (list.length > 2000) list.pop(); // keep last 2000 logs
      localStorage.setItem(STORAGE_KEY_ACTIVITIES, JSON.stringify(list));

      // Notify UI
      window.dispatchEvent(new CustomEvent('dairy_activity_logged', { detail: activity }));
    } catch (e) {
      console.error('Failed to save activity locally:', e);
    }

    // Attempt background sync to server
    if (isOnline) {
      fetch('/api/activities/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activity),
      }).catch(_err => {
        // Silently handled in offline/local mode
      });
    }

    return activity;
  }

  /**
   * Calculate working hours for a given user & date
   */
  static getWorkingHoursSummary(userId?: string, date?: string): {
    firstActivityTime: string;
    lastActivityTime: string;
    totalWorkingHoursFormatted: string;
    totalMinutes: number;
    activityCount: number;
  } {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const activities = ActivityService.getActivities().filter(
      a => a.date === targetDate && (!userId || a.userId === userId)
    );

    if (activities.length === 0) {
      return {
        firstActivityTime: '08:30:00',
        lastActivityTime: '17:00:00',
        totalWorkingHoursFormatted: '8 तास 30 मिनिटे (8h 30m)',
        totalMinutes: 510,
        activityCount: 0,
      };
    }

    // Sort chronologically
    const sorted = [...activities].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const first = sorted[0];
    const last = sorted[sorted.length - 1];

    const firstTime = new Date(first.timestamp).getTime();
    const lastTime = new Date(last.timestamp).getTime();
    let diffMinutes = Math.round((lastTime - firstTime) / (1000 * 60));

    // If only 1 activity or very short interval, assume standard working shift from first activity
    if (diffMinutes < 30) {
      diffMinutes = 120; // 2 hrs active session baseline
    }

    const hrs = Math.floor(diffMinutes / 60);
    const mins = diffMinutes % 60;
    const formatted = `${hrs} तास ${mins} मिनिटे (${hrs}h ${mins}m)`;

    return {
      firstActivityTime: first.time,
      lastActivityTime: last.time,
      totalWorkingHoursFormatted: formatted,
      totalMinutes: diffMinutes,
      activityCount: activities.length,
    };
  }

  /**
   * Search History tracking
   */
  static getSearchHistory(): string[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SEARCH_HISTORY);
      if (raw) return JSON.parse(raw);
    } catch {
      // Ignore
    }
    return [
      'तानाजी पाटील',
      'RT-101',
      'फॅट तक्रार (Fat Issue)',
      'Shirala',
      'Buffalo Milk',
      'उचल (Advance)',
    ];
  }

  static addSearchHistory(query: string): void {
    const clean = (query || '').trim();
    if (!clean || clean.length < 2) return;

    try {
      let list = ActivityService.getSearchHistory().filter(q => q.toLowerCase() !== clean.toLowerCase());
      list.unshift(clean);
      if (list.length > 20) list.pop();
      localStorage.setItem(STORAGE_KEY_SEARCH_HISTORY, JSON.stringify(list));
    } catch {
      // Ignore
    }
  }

  static clearSearchHistory(): void {
    localStorage.removeItem(STORAGE_KEY_SEARCH_HISTORY);
  }

  /**
   * GPS Visits Log
   */
  static logGpsVisit(locationName: string, purpose?: string, coords?: { latitude: number; longitude: number }): void {
    const now = new Date();
    ActivityService.trackActivity({
      activityType: 'gps_visit',
      title: `GPS गोठा / केंद्र भेट (Field Visit): ${locationName}`,
      description: `स्थान: ${locationName} | उद्देश: ${purpose || 'नियमित तपासणी व दूध संकलन पाहणी'}`,
      entityType: 'center',
      entityName: locationName,
      customGps: coords ? { latitude: coords.latitude, longitude: coords.longitude, address: locationName } : undefined,
      details: { locationName, purpose, time: now.toLocaleTimeString() },
    });
  }
}
