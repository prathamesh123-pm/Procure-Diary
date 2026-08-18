export type TaskStatus =
  | 'New'
  | 'Assigned'
  | 'In Progress'
  | 'Waiting for Response'
  | 'Follow-up Required'
  | 'Visit Required'
  | 'On Hold'
  | 'Completed'
  | 'Closed'
  | 'Cancelled'
  | 'Reopened';

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export type TaskCategory =
  | 'Milk Collection'
  | 'Rate Inquiry'
  | 'Fat/SNF Dispute'
  | 'Payment Issue'
  | 'Advance Request'
  | 'Cattle Feed'
  | 'Veterinary / Mineral'
  | 'New Gavali Lead'
  | 'Poaching Risk'
  | 'Route Chilling Audit'
  | 'Equipment / Testing'
  | 'General';

export interface WorkLogAttachment {
  id: string;
  name: string;
  type: 'photo' | 'document' | 'pdf' | 'voice_note';
  url: string; // Base64 data URL or external URL
  size?: number;
  duration?: number; // In seconds for voice notes
  uploadedAt: string;
}

export interface WorkLogEntry {
  id: string;
  taskId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  workDescription: string;
  callMade: boolean;
  isIncoming?: boolean;
  isOutgoing?: boolean;
  visitCompleted: boolean;
  whatsappSent: boolean;
  smsSent: boolean;
  emailSent: boolean;
  informationGiven?: string;
  informationReceived?: string;
  pendingWork?: string;
  nextAction?: string;
  nextFollowUpDate?: string;
  remarks?: string;
  attachments?: WorkLogAttachment[];
  createdBy: {
    id: string;
    name: string;
    role?: string;
  };
  createdAt: string;
}

export type TimelineActivityType =
  | 'created'
  | 'assigned'
  | 'status_changed'
  | 'call_logged'
  | 'visit_completed'
  | 'work_log_added'
  | 'info_updated'
  | 'followup_scheduled'
  | 'completed'
  | 'reopened'
  | 'cancelled'
  | 'attachment_added';

export interface TimelineActivity {
  id: string;
  taskId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  activityType: TimelineActivityType;
  title: string;
  remarks?: string;
  user: {
    id: string;
    name: string;
    role?: string;
  };
  previousStatus?: TaskStatus;
  newStatus?: TaskStatus;
  workLogId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface TaskCompletionReport {
  id: string;
  taskId: string;
  completionDate: string; // YYYY-MM-DD
  completionTime: string; // HH:mm
  completedBy: {
    id: string;
    name: string;
    role?: string;
  };
  finalWorkDone: string;
  problemIdentified: string;
  solutionProvided: string;
  finalResult: string;
  pendingIssues?: string;
  nextRecommendation?: string;
  completionRemarks?: string;
  photos?: WorkLogAttachment[];
  documents?: WorkLogAttachment[];
  voiceNote?: WorkLogAttachment;
  createdAt: string;
}

export interface TaskReopenRecord {
  id: string;
  taskId: string;
  reopenDate: string; // YYYY-MM-DD
  reopenTime: string; // HH:mm
  reopenedBy: {
    id: string;
    name: string;
    role?: string;
  };
  reason: string;
  initialPlan?: string;
  targetDate?: string;
  createdAt: string;
}

export interface TaskAuditEntry {
  id: string;
  taskId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  device: string; // e.g. 'Chrome on Android' / 'Desktop Web'
  user: {
    id: string;
    name: string;
    role?: string;
  };
  action: 'create' | 'update' | 'status_change' | 'work_log_added' | 'completed' | 'reopened';
  fieldChanged?: string;
  previousValue?: string;
  updatedValue?: string;
  timestamp: string;
}

export interface Task {
  id: string; // Auto-generated Task ID e.g. TSK-2026-001
  taskTitle: string;
  taskCategory: TaskCategory;
  relatedGavali: string; // Gavali Name
  gavaliCode: string; // e.g. G-101
  mobileNumber: string;
  route: string;
  village: string;
  priority: TaskPriority;
  createdDate: string; // YYYY-MM-DD
  createdTime: string; // HH:mm
  dueDate: string; // YYYY-MM-DD
  followUpDate?: string; // YYYY-MM-DD
  createdById: string;
  createdByName: string;
  assignedToId: string;
  assignedToName: string;
  status: TaskStatus;
  tags: string[];
  notes: string;
  workLogs: WorkLogEntry[]; // Arranged in chronological order, permanent
  timeline: TimelineActivity[]; // Permanent history
  completionReport?: TaskCompletionReport; // Present once completed
  reopenHistory: TaskReopenRecord[]; // Preserved reopen records
  auditTrail: TaskAuditEntry[]; // Permanent audit log
  createdAt: string;
  updatedAt: string;
  isSynced?: boolean;
}
