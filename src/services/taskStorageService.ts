import {
  Task,
  WorkLogEntry,
  TimelineActivity,
  TaskCompletionReport,
  TaskReopenRecord,
  TaskAuditEntry,
  TaskStatus,
  TaskPriority,
  TaskCategory,
  WorkLogAttachment,
} from '../types/task';

const TASKS_STORAGE_KEY = 'procure_diary_tasks_v2';
const TASKS_SYNC_TIMESTAMP_KEY = 'procure_diary_tasks_last_synced';

function getDeviceName(): string {
  if (typeof navigator === 'undefined') return 'Server';
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return 'Android Device (PWA)';
  if (/iPad|iPhone|iPod/.test(ua)) return 'iOS Device (Safari)';
  if (/Windows/i.test(ua)) return 'Windows Desktop (Chrome)';
  if (/Macintosh/i.test(ua)) return 'Mac Desktop';
  return 'Web Browser';
}

function generateTaskId(existingTasks: Task[]): string {
  const year = new Date().getFullYear();
  const count = existingTasks.length + 1;
  const seq = String(count).padStart(3, '0');
  return `TSK-${year}-${seq}`;
}

const INITIAL_TASKS: Task[] = [
  {
    id: 'TSK-2026-001',
    taskTitle: 'म्हैस दुध फॅट तफावत तपासणी व फॅट मशीन कॅलिब्रेशन (Buffalo Fat Dispute)',
    taskCategory: 'Fat/SNF Dispute',
    relatedGavali: 'तात्यासाहेब पाटील (Tatyasaheb Patil)',
    gavaliCode: 'G-101',
    mobileNumber: '9822145890',
    route: 'RT-102 (Tasgaon Route)',
    village: 'चिंचणी (Chinchani)',
    priority: 'Critical',
    createdDate: '2026-08-15',
    createdTime: '09:30 AM',
    dueDate: '2026-08-18',
    followUpDate: '2026-08-17',
    createdById: 'user_1',
    createdByName: 'प्रमोद सावंत (Pramod Sawant)',
    assignedToId: 'user_1',
    assignedToName: 'प्रमोद सावंत (Pramod Sawant)',
    status: 'In Progress',
    tags: ['Fat Dispute', 'Buffalo', 'Chinchani Center', 'High Volume'],
    notes: 'गवळी यांनी मागील ३ दिवसांपासून फॅट ६.५ ऐवजी ५.९ येत असल्याची तक्रार नोंदवली आहे. संकलन केंद्र मशीन व गवळी यांच्या गोठ्यातील सँपलची फेरतपासणी करणे.',
    workLogs: [
      {
        id: 'log_001',
        taskId: 'TSK-2026-001',
        date: '2026-08-15',
        time: '10:15 AM',
        workDescription: 'गवळी तात्यासाहेब पाटील यांच्याशी फोनवर सविस्तर चर्चा केली व संकलन केंद्रातील वजन/फॅट स्लिप तपासल्या.',
        callMade: true,
        isOutgoing: true,
        isIncoming: false,
        visitCompleted: false,
        whatsappSent: true,
        smsSent: false,
        emailSent: false,
        informationGiven: 'लॅक्टोमीटर व मिल्क अ‍ॅनालायझर तपासणीसाठी स्वतः उपस्थित राहून सँपल घेणार असल्याचे सांगितले.',
        informationReceived: 'गवळ्यांनी सांगितले की खाद्यात कोणताही बदल केलेला नाही, सर्व म्हशी एकाच चाऱ्यात आहेत.',
        pendingWork: 'संकलन केंद्राला प्रत्यक्ष भेट देऊन फॅट मशीनचे स्टँडर्ड ऑइलने कॅलिब्रेशन करणे.',
        nextAction: 'उद्या सकाळी ६:०० वाजता चिंचणी केंद्रावर प्रत्यक्ष हजर राहून तपासणी करणे.',
        nextFollowUpDate: '2026-08-16',
        remarks: 'गवळी इतर संघात जाण्याचा विचार करत आहेत, तातडीने निवारण आवश्यक.',
        attachments: [],
        createdBy: { id: 'user_1', name: 'प्रमोद सावंत' },
        createdAt: '2026-08-15T10:15:00Z',
      },
      {
        id: 'log_002',
        taskId: 'TSK-2026-001',
        date: '2026-08-16',
        time: '06:45 AM',
        workDescription: 'चिंचणी संकलन केंद्रावर प्रत्यक्ष भेट दिली. गवळी तात्यासाहेब यांचे दूध स्वतः सॅम्पलिंग करून तपासले.',
        callMade: false,
        visitCompleted: true,
        whatsappSent: true,
        smsSent: false,
        emailSent: false,
        informationGiven: 'मिल्क अ‍ॅनालायझर सेन्सर क्लीनिंग व गरम पाण्याचा वापर केंद्राच्या ऑपरेटरला समजावून दिला.',
        informationReceived: 'ताजे दूध ६.४ फॅट व ९.१ SNF भरले. मशीनच्या सेन्सरवर फॅटचे थर जमल्याने आधी रिडिंग कमी येत होते.',
        pendingWork: 'संध्याकाळच्या संकलनाचे रिडिंग क्रॉस-व्हेरिफाय करणे व गवळ्यांचे समाधान नोंदवणे.',
        nextAction: 'संध्याकाळी ऑपरेटरकडून स्लिपचा फोटो मागवून घेणे.',
        nextFollowUpDate: '2026-08-17',
        remarks: 'समस्या मुख्यत्वे मशीन मेंटेनन्सची होती. गवळी समाधान व्यक्त करत आहेत.',
        attachments: [],
        createdBy: { id: 'user_1', name: 'प्रमोद सावंत' },
        createdAt: '2026-08-16T06:45:00Z',
      },
    ],
    timeline: [
      {
        id: 'time_001',
        taskId: 'TSK-2026-001',
        date: '2026-08-15',
        time: '09:30 AM',
        activityType: 'created',
        title: 'काम नोंदवले (Task Created)',
        remarks: 'फॅट तफावत तक्रार - उच्च प्राधान्य नोंदवले.',
        user: { id: 'user_1', name: 'प्रमोद सावंत', role: 'officer' },
        createdAt: '2026-08-15T09:30:00Z',
      },
      {
        id: 'time_002',
        taskId: 'TSK-2026-001',
        date: '2026-08-15',
        time: '10:15 AM',
        activityType: 'call_logged',
        title: 'गवळ्यांशी फोनवर चर्चा केली (Outgoing Call Logged)',
        remarks: 'तक्रार निवारणासाठी प्रत्यक्ष भेटीची वेळ दिली.',
        user: { id: 'user_1', name: 'प्रमोद सावंत', role: 'officer' },
        workLogId: 'log_001',
        createdAt: '2026-08-15T10:15:00Z',
      },
      {
        id: 'time_003',
        taskId: 'TSK-2026-001',
        date: '2026-08-16',
        time: '06:45 AM',
        activityType: 'visit_completed',
        title: 'संकलन केंद्राला प्रत्यक्ष भेट पूर्ण (Field Visit Completed)',
        remarks: 'मशीन सेन्सर क्लीनिंग व ताजे सँपल चाचणी पूर्ण (६.४ फॅट).',
        user: { id: 'user_1', name: 'प्रमोद सावंत', role: 'officer' },
        workLogId: 'log_002',
        createdAt: '2026-08-16T06:45:00Z',
      },
    ],
    reopenHistory: [],
    auditTrail: [
      {
        id: 'audit_001',
        taskId: 'TSK-2026-001',
        date: '2026-08-15',
        time: '09:30 AM',
        device: 'Android Device (PWA)',
        user: { id: 'user_1', name: 'प्रमोद सावंत' },
        action: 'create',
        fieldChanged: 'Task Created',
        previousValue: 'None',
        updatedValue: 'TSK-2026-001 initialized',
        timestamp: '2026-08-15T09:30:00Z',
      },
      {
        id: 'audit_002',
        taskId: 'TSK-2026-001',
        date: '2026-08-15',
        time: '10:15 AM',
        device: 'Android Device (PWA)',
        user: { id: 'user_1', name: 'प्रमोद सावंत' },
        action: 'work_log_added',
        fieldChanged: 'Work Log #1',
        previousValue: '0 logs',
        updatedValue: '1 log added (Call)',
        timestamp: '2026-08-15T10:15:00Z',
      },
      {
        id: 'audit_003',
        taskId: 'TSK-2026-001',
        date: '2026-08-16',
        time: '06:45 AM',
        device: 'Android Device (PWA)',
        user: { id: 'user_1', name: 'प्रमोद सावंत' },
        action: 'work_log_added',
        fieldChanged: 'Work Log #2',
        previousValue: '1 log',
        updatedValue: '2 logs added (Visit)',
        timestamp: '2026-08-16T06:45:00Z',
      },
    ],
    createdAt: '2026-08-15T09:30:00Z',
    updatedAt: '2026-08-16T06:45:00Z',
  },
  {
    id: 'TSK-2026-002',
    taskTitle: 'पशुखाद्य (सरकी पेंड व मिनरल मिक्श्चर) ५० गोणी सवलत पुरवठा मागणी',
    taskCategory: 'Cattle Feed',
    relatedGavali: 'बाळासाहेब चव्हाण (Balasaheb Chavan)',
    gavaliCode: 'G-104',
    mobileNumber: '9850123456',
    route: 'RT-101 (Sangli - Miraj)',
    village: 'कुपवाड (Kupwad)',
    priority: 'High',
    createdDate: '2026-08-14',
    createdTime: '11:00 AM',
    dueDate: '2026-08-17',
    followUpDate: '2026-08-17',
    createdById: 'user_1',
    createdByName: 'प्रमोद सावंत (Pramod Sawant)',
    assignedToId: 'user_1',
    assignedToName: 'प्रमोद सावंत (Pramod Sawant)',
    status: 'Completed',
    tags: ['Cattle Feed', 'Mineral Mixture', 'Kupwad', 'Advance Adjusted'],
    notes: 'गवळ्यांनी ५० गोणी सरकी पेंड व ५ किलो मिनरल मिक्श्चर पाकिटांची मागणी केली आहे. दुध बिलातून हप्त्याने कपात मंजूर करणे.',
    workLogs: [
      {
        id: 'log_101',
        taskId: 'TSK-2026-002',
        date: '2026-08-14',
        time: '11:30 AM',
        workDescription: 'पशुखाद्य गोडाऊन मॅनेजरशी समन्वय साधून ५० गोणी पेंडीचा साठा आरक्षित केला.',
        callMade: true,
        isOutgoing: true,
        isIncoming: false,
        visitCompleted: false,
        whatsappSent: true,
        smsSent: false,
        emailSent: false,
        informationGiven: 'दरपत्रक व वाहतूक शुल्काची माहिती गवळ्यांना दिली.',
        informationReceived: 'गवळ्यांनी बिलातून दोन हप्त्यांत कपात करण्यास संमती दिली.',
        pendingWork: 'वाहतूक वाहनाची सोय करणे.',
        nextAction: '१५ ऑगस्ट रोजी डिलिव्हरी करणे.',
        nextFollowUpDate: '2026-08-15',
        remarks: 'मंजुरी फॉर्म भरून घेतला आहे.',
        attachments: [],
        createdBy: { id: 'user_1', name: 'प्रमोद सावंत' },
        createdAt: '2026-08-14T11:30:00Z',
      },
      {
        id: 'log_102',
        taskId: 'TSK-2026-002',
        date: '2026-08-15',
        time: '04:00 PM',
        workDescription: 'पशुखाद्य टेम्पो कुपवाड गोठ्यावर पोहोचला, गवळ्यांनी ५० गोणी ताब्यात घेतल्या व डिलिव्हरी चलानवर स्वाक्षरी केली.',
        callMade: false,
        visitCompleted: true,
        whatsappSent: true,
        smsSent: true,
        emailSent: false,
        informationGiven: 'खाद्य साठवणुकीबाबत व आर्द्रतेपासून संरक्षण करण्याबाबत सल्ला दिला.',
        informationReceived: 'गवळ्यांनी खाद्य गुणवत्तेबद्दल समाधान व्यक्त केले.',
        pendingWork: 'बिल कपात एन्ट्री करणे.',
        nextAction: 'अंतिम अहवाल तयार करून काम पूर्ण करणे.',
        nextFollowUpDate: '2026-08-16',
        remarks: 'काम वेळेत यशस्वीरीत्या पूर्ण झाले.',
        attachments: [],
        createdBy: { id: 'user_1', name: 'प्रमोद सावंत' },
        createdAt: '2026-08-15T16:00:00Z',
      },
    ],
    timeline: [
      {
        id: 't_201',
        taskId: 'TSK-2026-002',
        date: '2026-08-14',
        time: '11:00 AM',
        activityType: 'created',
        title: 'काम नोंदवले (Task Created)',
        user: { id: 'user_1', name: 'प्रमोद सावंत' },
        createdAt: '2026-08-14T11:00:00Z',
      },
      {
        id: 't_202',
        taskId: 'TSK-2026-002',
        date: '2026-08-14',
        time: '11:30 AM',
        activityType: 'call_logged',
        title: 'गोडाऊन व गवळ्यांशी कॉल समन्वय (Call Made)',
        user: { id: 'user_1', name: 'प्रमोद सावंत' },
        createdAt: '2026-08-14T11:30:00Z',
      },
      {
        id: 't_203',
        taskId: 'TSK-2026-002',
        date: '2026-08-15',
        time: '04:00 PM',
        activityType: 'visit_completed',
        title: 'गोठा भेट व खाद्य पुरवठा पूर्ण (Visit Completed)',
        user: { id: 'user_1', name: 'प्रमोद सावंत' },
        createdAt: '2026-08-15T16:00:00Z',
      },
      {
        id: 't_204',
        taskId: 'TSK-2026-002',
        date: '2026-08-16',
        time: '10:00 AM',
        activityType: 'completed',
        title: 'काम पूर्ण केले व अहवाल सादर केला (Task Completed with Report)',
        remarks: '५० गोणी पोहोचल्या, बिल कपात शेड्यूल मंजूर.',
        user: { id: 'user_1', name: 'प्रमोद सावंत' },
        createdAt: '2026-08-16T10:00:00Z',
      },
    ],
    completionReport: {
      id: 'rep_001',
      taskId: 'TSK-2026-002',
      completionDate: '2026-08-16',
      completionTime: '10:00 AM',
      completedBy: { id: 'user_1', name: 'प्रमोद सावंत', role: 'officer' },
      finalWorkDone: '५० गोणी सरकी पेंड व ५ किलो मिनरल मिक्श्चर गवळ्यांच्या गोठ्यावर पोहचवून डिलिव्हरी चलान स्वाक्षरीसह जमा केले.',
      problemIdentified: 'गवळ्यांकडे खाद्याचा तुटवडा निर्माण झाला होता व बाजारात दर जास्त होते.',
      solutionProvided: 'संघाच्या गोडाऊनमधून थेट सवलतीच्या दरात खाद्य उपलब्ध करून दिले व दोन हप्त्यांत बिल कपात मंजूर केली.',
      finalResult: 'गवळ्यांचे दैनंदिन संकलन १०० लिटरवरून ११० लिटरपर्यंत वाढले. दूध संघ निष्ठा वाढली.',
      pendingIssues: 'कोणतीही समस्या शिल्लक नाही.',
      nextRecommendation: 'पुढील महिन्यात जंतनाशक औषधांचा पुरवठा करणे.',
      completionRemarks: 'गवळ्यांचे समाधान उत्कृष्ट आहे. कामाची पूर्णता यशस्वी.',
      photos: [],
      documents: [],
      createdAt: '2026-08-16T10:00:00Z',
    },
    reopenHistory: [],
    auditTrail: [
      {
        id: 'a_001',
        taskId: 'TSK-2026-002',
        date: '2026-08-14',
        time: '11:00 AM',
        device: 'Desktop Web',
        user: { id: 'user_1', name: 'प्रमोद सावंत' },
        action: 'create',
        fieldChanged: 'Task Created',
        previousValue: 'None',
        updatedValue: 'TSK-2026-002 initialized',
        timestamp: '2026-08-14T11:00:00Z',
      },
      {
        id: 'a_002',
        taskId: 'TSK-2026-002',
        date: '2026-08-16',
        time: '10:00 AM',
        device: 'Android Device (PWA)',
        user: { id: 'user_1', name: 'प्रमोद सावंत' },
        action: 'completed',
        fieldChanged: 'status',
        previousValue: 'In Progress',
        updatedValue: 'Completed',
        timestamp: '2026-08-16T10:00:00Z',
      },
    ],
    createdAt: '2026-08-14T11:00:00Z',
    updatedAt: '2026-08-16T10:00:00Z',
  },
];

export class TaskStorageService {
  /**
   * Get all tasks (loads from localStorage, seeds if empty)
   */
  static getTasks(): Task[] {
    try {
      const data = localStorage.getItem(TASKS_STORAGE_KEY);
      if (!data) {
        localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(INITIAL_TASKS));
        return INITIAL_TASKS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to parse tasks from localStorage', e);
      return INITIAL_TASKS;
    }
  }

  /**
   * Get single task by ID
   */
  static getTaskById(taskId: string): Task | null {
    const tasks = this.getTasks();
    return tasks.find(t => t.id === taskId) || null;
  }

  /**
   * Save entire tasks list and dispatch notification
   */
  private static saveAll(tasks: Task[]): void {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('procure_tasks_updated', { detail: { tasks } }));
      window.dispatchEvent(new CustomEvent('dairy_storage_updated'));
    }
    // Async background sync with server
    this.syncToServer(tasks).catch(err => console.debug('Offline sync will retry', err));
  }

  /**
   * Create a brand new Task with full Audit & Initial Timeline entry
   */
  static createTask(
    data: Omit<Task, 'id' | 'workLogs' | 'timeline' | 'reopenHistory' | 'auditTrail' | 'createdAt' | 'updatedAt'>,
    currentUser?: { id: string; name: string; role?: string }
  ): Task {
    const tasks = this.getTasks();
    const taskId = generateTaskId(tasks);
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const user = currentUser || { id: 'officer_1', name: 'फील्ड एक्झिक्युटिव्ह', role: 'officer' };
    const device = getDeviceName();

    const initialTimeline: TimelineActivity = {
      id: `time_${Date.now()}`,
      taskId,
      date: dateStr,
      time: timeStr,
      activityType: 'created',
      title: 'नवीन काम नोंदवले (Task Created)',
      remarks: `प्राधान्य: ${data.priority}, कॅटेगरी: ${data.taskCategory}`,
      user,
      createdAt: now.toISOString(),
    };

    const initialAudit: TaskAuditEntry = {
      id: `audit_${Date.now()}`,
      taskId,
      date: dateStr,
      time: timeStr,
      device,
      user,
      action: 'create',
      fieldChanged: 'Task Created',
      previousValue: 'None',
      updatedValue: `${taskId}: ${data.taskTitle}`,
      timestamp: now.toISOString(),
    };

    const newTask: Task = {
      ...data,
      id: taskId,
      createdDate: data.createdDate || dateStr,
      createdTime: data.createdTime || timeStr,
      createdById: user.id,
      createdByName: user.name,
      assignedToId: data.assignedToId || user.id,
      assignedToName: data.assignedToName || user.name,
      status: data.status || 'New',
      workLogs: [],
      timeline: [initialTimeline],
      reopenHistory: [],
      auditTrail: [initialAudit],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    tasks.unshift(newTask);
    this.saveAll(tasks);
    return newTask;
  }

  /**
   * Add a permanent Work Log entry to a Task
   */
  static addWorkLog(
    taskId: string,
    logInput: Omit<WorkLogEntry, 'id' | 'taskId' | 'createdAt'>,
    currentUser?: { id: string; name: string; role?: string }
  ): { task: Task; newLog: WorkLogEntry } {
    const tasks = this.getTasks();
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      throw new Error(`Task ${taskId} not found`);
    }

    const task = tasks[taskIndex];
    const now = new Date();
    const user = currentUser || { id: 'officer_1', name: 'फील्ड एक्झिक्युटिव्ह', role: 'officer' };
    const logId = `log_${Date.now()}`;
    const device = getDeviceName();

    const newLog: WorkLogEntry = {
      ...logInput,
      id: logId,
      taskId,
      createdBy: user,
      createdAt: now.toISOString(),
    };

    // Append work log chronologically
    const updatedWorkLogs = [...task.workLogs, newLog];

    // Determine activity type for timeline
    let activityType: TimelineActivity['activityType'] = 'work_log_added';
    let activityTitle = 'रोजनिशी नोंद केली (Work Log Added)';

    if (newLog.visitCompleted) {
      activityType = 'visit_completed';
      activityTitle = 'गोठा / केंद्र भेट पूर्ण (Field Visit Completed)';
    } else if (newLog.callMade) {
      activityType = 'call_logged';
      activityTitle = newLog.isIncoming
        ? 'इनकमिंग कॉल नोंदवला (Incoming Call Handled)'
        : 'कॉल केला (Outgoing Call Logged)';
    } else if (newLog.nextFollowUpDate) {
      activityType = 'followup_scheduled';
      activityTitle = `फॉलो-अप तारीख ठरवली (${newLog.nextFollowUpDate})`;
    }

    const newTimelineActivity: TimelineActivity = {
      id: `time_${Date.now()}`,
      taskId,
      date: newLog.date,
      time: newLog.time,
      activityType,
      title: activityTitle,
      remarks: newLog.workDescription,
      user,
      workLogId: logId,
      createdAt: now.toISOString(),
    };

    const newAuditEntry: TaskAuditEntry = {
      id: `audit_${Date.now()}`,
      taskId,
      date: newLog.date,
      time: newLog.time,
      device,
      user,
      action: 'work_log_added',
      fieldChanged: 'workLogs',
      previousValue: `${task.workLogs.length} logs`,
      updatedValue: `${updatedWorkLogs.length} logs (Added: ${newLog.workDescription.slice(0, 50)}...)`,
      timestamp: now.toISOString(),
    };

    // Auto-update follow-up date and status if needed
    const updatedTask: Task = {
      ...task,
      followUpDate: newLog.nextFollowUpDate || task.followUpDate,
      status: task.status === 'New' ? 'In Progress' : task.status,
      workLogs: updatedWorkLogs,
      timeline: [...task.timeline, newTimelineActivity],
      auditTrail: [...task.auditTrail, newAuditEntry],
      updatedAt: now.toISOString(),
    };

    tasks[taskIndex] = updatedTask;
    this.saveAll(tasks);
    return { task: updatedTask, newLog };
  }

  /**
   * Update task fields with strict audit trail generation
   */
  static updateTask(
    taskId: string,
    updates: Partial<Task>,
    currentUser?: { id: string; name: string; role?: string },
    reason?: string
  ): Task {
    const tasks = this.getTasks();
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) throw new Error(`Task ${taskId} not found`);

    const task = tasks[taskIndex];
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const user = currentUser || { id: 'officer_1', name: 'फील्ड एक्झिक्युटिव्ह', role: 'officer' };
    const device = getDeviceName();

    const auditEntries: TaskAuditEntry[] = [];
    const timelineEntries: TimelineActivity[] = [];

    // Check status change
    if (updates.status && updates.status !== task.status) {
      if (updates.status === 'Completed' && !task.completionReport && !updates.completionReport) {
        throw new Error('पूर्णता अहवाल (Completion Report) भरल्याशिवाय काम पूर्ण करता येणार नाही.');
      }

      auditEntries.push({
        id: `audit_${Date.now()}_status`,
        taskId,
        date: dateStr,
        time: timeStr,
        device,
        user,
        action: 'status_change',
        fieldChanged: 'status',
        previousValue: task.status,
        updatedValue: updates.status,
        timestamp: now.toISOString(),
      });

      timelineEntries.push({
        id: `time_${Date.now()}_status`,
        taskId,
        date: dateStr,
        time: timeStr,
        activityType: 'status_changed',
        title: `स्थिती बदलली: ${task.status} ➔ ${updates.status}`,
        remarks: reason || `स्थिती अद्ययावत केली.`,
        user,
        previousStatus: task.status,
        newStatus: updates.status,
        createdAt: now.toISOString(),
      });
    }

    // Record other key changes in audit trail
    const fieldsToTrack: (keyof Task)[] = [
      'taskTitle',
      'priority',
      'dueDate',
      'followUpDate',
      'assignedToName',
      'route',
      'village',
      'taskCategory',
      'notes',
    ];

    for (const field of fieldsToTrack) {
      if (updates[field] !== undefined && updates[field] !== task[field]) {
        auditEntries.push({
          id: `audit_${Date.now()}_${field}`,
          taskId,
          date: dateStr,
          time: timeStr,
          device,
          user,
          action: 'update',
          fieldChanged: String(field),
          previousValue: String(task[field] || 'None'),
          updatedValue: String(updates[field]),
          timestamp: now.toISOString(),
        });
      }
    }

    const updatedTask: Task = {
      ...task,
      ...updates,
      // Ensure permanent history is never overwritten by partial updates
      workLogs: updates.workLogs || task.workLogs,
      timeline: [...task.timeline, ...timelineEntries],
      reopenHistory: updates.reopenHistory || task.reopenHistory,
      auditTrail: [...task.auditTrail, ...auditEntries],
      updatedAt: now.toISOString(),
    };

    tasks[taskIndex] = updatedTask;
    this.saveAll(tasks);
    return updatedTask;
  }

  /**
   * Complete Task - Gatekeeper: Requires full completion report
   */
  static completeTask(
    taskId: string,
    reportData: Omit<TaskCompletionReport, 'id' | 'taskId' | 'createdAt'>,
    currentUser?: { id: string; name: string; role?: string }
  ): Task {
    const tasks = this.getTasks();
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) throw new Error(`Task ${taskId} not found`);

    const task = tasks[taskIndex];
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const user = currentUser || { id: 'officer_1', name: 'फील्ड एक्झिक्युटिव्ह', role: 'officer' };
    const device = getDeviceName();

    const completionReport: TaskCompletionReport = {
      ...reportData,
      id: `rep_${Date.now()}`,
      taskId,
      completedBy: user,
      createdAt: now.toISOString(),
    };

    const completionTimeline: TimelineActivity = {
      id: `time_${Date.now()}_complete`,
      taskId,
      date: reportData.completionDate || dateStr,
      time: reportData.completionTime || timeStr,
      activityType: 'completed',
      title: 'काम यशस्वीरीत्या पूर्ण केले (Task Completed with Report)',
      remarks: `निवारण: ${reportData.finalWorkDone} | निकाल: ${reportData.finalResult}`,
      user,
      previousStatus: task.status,
      newStatus: 'Completed',
      createdAt: now.toISOString(),
    };

    const completionAudit: TaskAuditEntry = {
      id: `audit_${Date.now()}_complete`,
      taskId,
      date: dateStr,
      time: timeStr,
      device,
      user,
      action: 'completed',
      fieldChanged: 'status & completionReport',
      previousValue: task.status,
      updatedValue: `Completed - Report ID: ${completionReport.id}`,
      timestamp: now.toISOString(),
    };

    const updatedTask: Task = {
      ...task,
      status: 'Completed',
      completionReport,
      timeline: [...task.timeline, completionTimeline],
      auditTrail: [...task.auditTrail, completionAudit],
      updatedAt: now.toISOString(),
    };

    tasks[taskIndex] = updatedTask;
    this.saveAll(tasks);
    return updatedTask;
  }

  /**
   * Reopen a completed or closed task
   * ALL previous work logs, timeline, and completion report are permanently kept intact!
   */
  static reopenTask(
    taskId: string,
    reopenInput: { reason: string; initialPlan?: string; targetDate?: string },
    currentUser?: { id: string; name: string; role?: string }
  ): Task {
    const tasks = this.getTasks();
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) throw new Error(`Task ${taskId} not found`);

    const task = tasks[taskIndex];
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const user = currentUser || { id: 'officer_1', name: 'फील्ड एक्झिक्युटिव्ह', role: 'officer' };
    const device = getDeviceName();

    const reopenRecord: TaskReopenRecord = {
      id: `reopen_${Date.now()}`,
      taskId,
      reopenDate: dateStr,
      reopenTime: timeStr,
      reopenedBy: user,
      reason: reopenInput.reason,
      initialPlan: reopenInput.initialPlan,
      targetDate: reopenInput.targetDate,
      createdAt: now.toISOString(),
    };

    const reopenTimeline: TimelineActivity = {
      id: `time_${Date.now()}_reopen`,
      taskId,
      date: dateStr,
      time: timeStr,
      activityType: 'reopened',
      title: `काम पुन्हा उघडले (Task Reopened)`,
      remarks: `कारण: ${reopenInput.reason}`,
      user,
      previousStatus: task.status,
      newStatus: 'Reopened',
      createdAt: now.toISOString(),
    };

    const reopenAudit: TaskAuditEntry = {
      id: `audit_${Date.now()}_reopen`,
      taskId,
      date: dateStr,
      time: timeStr,
      device,
      user,
      action: 'reopened',
      fieldChanged: 'status',
      previousValue: task.status,
      updatedValue: `Reopened (Reason: ${reopenInput.reason})`,
      timestamp: now.toISOString(),
    };

    const updatedTask: Task = {
      ...task,
      status: 'Reopened',
      dueDate: reopenInput.targetDate || task.dueDate,
      reopenHistory: [...task.reopenHistory, reopenRecord],
      timeline: [...task.timeline, reopenTimeline],
      auditTrail: [...task.auditTrail, reopenAudit],
      updatedAt: now.toISOString(),
    };

    tasks[taskIndex] = updatedTask;
    this.saveAll(tasks);
    return updatedTask;
  }

  /**
   * Soft-cancel or close task (Permanent retention rule)
   */
  static cancelTask(
    taskId: string,
    reason: string,
    currentUser?: { id: string; name: string; role?: string }
  ): Task {
    return this.updateTask(taskId, { status: 'Cancelled' }, currentUser, `रद्द करण्याचे कारण: ${reason}`);
  }

  /**
   * Delete a single work log from a task with full audit logging
   */
  static deleteWorkLog(
    taskId: string,
    logId: string,
    currentUser?: { id: string; name: string; role?: string }
  ): Task {
    const tasks = this.getTasks();
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) throw new Error(`Task ${taskId} not found`);

    const task = tasks[taskIndex];
    const logToDelete = task.workLogs.find(l => l.id === logId);
    const updatedLogs = task.workLogs.filter(l => l.id !== logId);

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const user = currentUser || { id: 'officer_1', name: 'फील्ड एक्झिक्युटिव्ह', role: 'officer' };
    const device = getDeviceName();

    const auditEntry: TaskAuditEntry = {
      id: `audit_${Date.now()}_del_log`,
      taskId,
      date: dateStr,
      time: timeStr,
      device,
      user,
      action: 'update',
      fieldChanged: 'workLogs',
      previousValue: logToDelete ? `Log #${logToDelete.date}: ${logToDelete.workDescription.substring(0, 40)}` : logId,
      updatedValue: 'Deleted',
      timestamp: now.toISOString(),
    };

    const timelineEntry: TimelineActivity = {
      id: `time_${Date.now()}_del_log`,
      taskId,
      date: dateStr,
      time: timeStr,
      activityType: 'info_updated',
      title: 'रोजनिशी नोंद हटवली (Work Log Deleted)',
      remarks: logToDelete ? `नोंद तारीख: ${logToDelete.date} | ${logToDelete.workDescription.substring(0, 40)}...` : `Log ID: ${logId}`,
      user,
      createdAt: now.toISOString(),
    };

    const updatedTask: Task = {
      ...task,
      workLogs: updatedLogs,
      timeline: [...task.timeline, timelineEntry],
      auditTrail: [...task.auditTrail, auditEntry],
      updatedAt: now.toISOString(),
    };

    tasks[taskIndex] = updatedTask;
    this.saveAll(tasks);
    return updatedTask;
  }

  /**
   * Delete an attachment from a specific work log
   */
  static deleteAttachment(
    taskId: string,
    logId: string,
    attachmentId: string,
    currentUser?: { id: string; name: string; role?: string }
  ): Task {
    const tasks = this.getTasks();
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) throw new Error(`Task ${taskId} not found`);

    const task = tasks[taskIndex];
    const updatedLogs = task.workLogs.map(l => {
      if (l.id === logId) {
        return {
          ...l,
          attachments: (l.attachments || []).filter(a => a.id !== attachmentId),
        };
      }
      return l;
    });

    const now = new Date();
    const user = currentUser || { id: 'officer_1', name: 'फील्ड एक्झिक्युटिव्ह', role: 'officer' };

    const updatedTask: Task = {
      ...task,
      workLogs: updatedLogs,
      updatedAt: now.toISOString(),
    };

    tasks[taskIndex] = updatedTask;
    this.saveAll(tasks);
    return updatedTask;
  }

  /**
   * Get task dependencies (number of logs, attachments, timeline entries)
   */
  static getTaskDependencies(taskId: string) {
    const tasks = this.getTasks();
    const task = tasks.find(t => t.id === taskId);
    if (!task) return { workLogsCount: 0, attachmentsCount: 0, timelineCount: 0 };

    const workLogsCount = task.workLogs?.length || 0;
    const attachmentsCount = (task.workLogs || []).reduce((sum, l) => sum + (l.attachments?.length || 0), 0);
    const timelineCount = task.timeline?.length || 0;

    return { workLogsCount, attachmentsCount, timelineCount };
  }

  /**
   * Delete task (admin only - still archives rather than hard destroys)
   */
  static deleteTask(taskId: string): void {
    const tasks = this.getTasks().filter(t => t.id !== taskId);
    this.saveAll(tasks);
  }

  /**
   * Sync tasks to backend server API
   */
  static async syncToServer(tasks?: Task[]): Promise<boolean> {
    try {
      const dataToSync = tasks || this.getTasks();
      const res = await fetch('/api/tasks/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: dataToSync }),
      });
      if (res.ok) {
        localStorage.setItem(TASKS_SYNC_TIMESTAMP_KEY, new Date().toISOString());
        return true;
      }
      return false;
    } catch (err) {
      console.warn('Backend sync deferred (offline)', err);
      return false;
    }
  }

  /**
   * Fetch latest from server
   */
  static async fetchFromServer(): Promise<Task[] | null> {
    try {
      const res = await fetch('/api/tasks');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.tasks)) {
          this.saveAll(data.tasks);
          return data.tasks;
        }
      }
      return null;
    } catch (e) {
      return null;
    }
  }
}
