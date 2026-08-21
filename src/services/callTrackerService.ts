import { CallHistoryEntry } from '../types';
import { ActivityService, getCurrentGpsLocation } from './activityService';

const STORAGE_KEY_CALL_HISTORY = 'dairy_db_call_history';

const INITIAL_CALL_HISTORY: CallHistoryEntry[] = [
  {
    id: 'CH-101',
    contactName: 'तानाजी विठ्ठल पाटील (Tanaji Patil)',
    mobileNumber: '9822012345',
    farmerCode: 'F-101',
    callType: 'outgoing',
    startTime: '09:15:00',
    endTime: '09:18:45',
    duration: 225, // 3m 45s
    date: new Date().toISOString().split('T')[0],
    time: '09:15',
    route: 'RT-101',
    village: 'Madhavnagar',
    purpose: 'दूध संकलन व फॅट वाढवणे चर्चा',
    notes: 'गाईच्या दुधाचे फॅट ३.८ वरून ३.९ झाले. समाधान व्यक्त केले.',
    gpsLocation: {
      latitude: 16.8524,
      longitude: 74.5815,
      address: 'Madhavnagar Dairy Line',
    },
    officerId: 'USR-ADMIN-1',
    officerName: 'प्रमोद सावंत (Pramod Sawant)',
    syncedToCloud: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'CH-102',
    contactName: 'सुभाष रघुनाथ शिंदे (Subhash Shinde)',
    mobileNumber: '9850123456',
    farmerCode: 'F-102',
    callType: 'incoming',
    startTime: '10:02:10',
    endTime: '10:07:30',
    duration: 320, // 5m 20s
    date: new Date().toISOString().split('T')[0],
    time: '10:02',
    route: 'RT-101',
    village: 'Budhgaon',
    purpose: 'म्हैस फॅट दर व उचल (Advance) चौकशी',
    notes: '२ म्हशी खरेदीसाठी रु. ५०,००० उचल मंजूर झाल्याची माहिती दिली.',
    gpsLocation: {
      latitude: 16.8821,
      longitude: 74.612,
      address: 'Budhgaon Main Road',
    },
    officerId: 'USR-ADMIN-1',
    officerName: 'प्रमोद सावंत (Pramod Sawant)',
    syncedToCloud: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'CH-103',
    contactName: 'बाळासाहेब आप्पासाहेब चव्हाण (Balasaheb Chavan)',
    mobileNumber: '9890378901',
    farmerCode: 'F-107',
    callType: 'missed',
    startTime: '11:20:00',
    endTime: '11:20:40',
    duration: 0,
    date: new Date().toISOString().split('T')[0],
    time: '11:20',
    route: 'RT-105',
    village: 'Savlaj',
    purpose: 'सायलेज खड्डा तपासणीसाठी कॉल केला',
    notes: 'कॉल उचलला नाही. संध्याकाळी ४:३० वाजता पुन्हा कॉल करण्याचे नियोजित केले.',
    officerId: 'USR-ADMIN-1',
    officerName: 'प्रमोद सावंत (Pramod Sawant)',
    syncedToCloud: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'CH-104',
    contactName: 'आनंदराव कृष्णा कदम (Anandrao Kadam)',
    mobileNumber: '9422045678',
    farmerCode: 'F-104',
    callType: 'outgoing',
    startTime: '12:05:00',
    endTime: '12:08:15',
    duration: 195,
    date: new Date().toISOString().split('T')[0],
    time: '12:05',
    route: 'RT-102',
    village: 'Walwa',
    purpose: 'पशुखाद्य मागणी व दूध वाढ पाठपुरावा',
    notes: '२ गोणी सरकी पेंड व १ गोणी मिनरल मिक्स्चर केंद्रावर पाठवले.',
    officerId: 'USR-ADMIN-1',
    officerName: 'प्रमोद सावंत (Pramod Sawant)',
    syncedToCloud: true,
    createdAt: new Date().toISOString(),
  },
];

export class CallTrackerService {
  static getCallHistory(): CallHistoryEntry[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_CALL_HISTORY);
      if (raw) {
        return JSON.parse(raw);
      }
      localStorage.setItem(STORAGE_KEY_CALL_HISTORY, JSON.stringify(INITIAL_CALL_HISTORY));
      return INITIAL_CALL_HISTORY;
    } catch {
      return INITIAL_CALL_HISTORY;
    }
  }

  static async recordCall(entry: Partial<CallHistoryEntry>): Promise<CallHistoryEntry> {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let currentUser: any = { id: 'USR-ADMIN-1', name: 'प्रमोद सावंत (Pramod Sawant)' };
    try {
      const savedUser = localStorage.getItem('dairy_current_user');
      if (savedUser) currentUser = JSON.parse(savedUser);
    } catch {}

    const gps = entry.gpsLocation || (await getCurrentGpsLocation()) || undefined;

    const fullEntry: CallHistoryEntry = {
      id: entry.id || `CH-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      contactName: entry.contactName || 'दूध उत्पादक (Farmer)',
      mobileNumber: entry.mobileNumber || '9822000000',
      farmerCode: entry.farmerCode || '',
      callType: entry.callType || 'outgoing',
      startTime: entry.startTime || now.toLocaleTimeString(),
      endTime: entry.endTime || now.toLocaleTimeString(),
      duration: entry.duration || 0,
      date: entry.date || dateStr,
      time: entry.time || timeStr,
      route: entry.route || 'RT-101',
      village: entry.village || '',
      purpose: entry.purpose || 'दूध संकलन संपर्क',
      notes: entry.notes || '',
      audioRecordingUrl: entry.audioRecordingUrl,
      gpsLocation: gps,
      officerId: currentUser.id,
      officerName: currentUser.name,
      syncedToCloud: navigator.onLine,
      createdAt: now.toISOString(),
    };

    const list = CallTrackerService.getCallHistory();
    list.unshift(fullEntry);
    localStorage.setItem(STORAGE_KEY_CALL_HISTORY, JSON.stringify(list));

    // Auto-track activity in Activity Log
    ActivityService.trackActivity({
      activityType: 'call_logged',
      title: `${fullEntry.callType === 'incoming' ? 'इनकमिंग' : fullEntry.callType === 'missed' ? 'मिस्ड' : 'आउटगोइंग'} कॉल: ${fullEntry.contactName}`,
      description: `मोबाईल: ${fullEntry.mobileNumber} | वेळ: ${Math.round(fullEntry.duration / 60)} मि. | विषय: ${fullEntry.purpose}`,
      entityType: 'call',
      entityId: fullEntry.id,
      entityName: fullEntry.contactName,
      customGps: fullEntry.gpsLocation,
      details: {
        mobileNumber: fullEntry.mobileNumber,
        callType: fullEntry.callType,
        duration: fullEntry.duration,
        purpose: fullEntry.purpose,
      },
    });

    // Notify UI
    window.dispatchEvent(new CustomEvent('dairy_call_tracked', { detail: fullEntry }));

    // Send to server
    if (navigator.onLine) {
      fetch('/api/calls/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullEntry),
      }).catch(() => {});
    }

    return fullEntry;
  }

  static deleteCall(id: string): void {
    const list = CallTrackerService.getCallHistory().filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEY_CALL_HISTORY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('dairy_call_tracked'));
  }
}
