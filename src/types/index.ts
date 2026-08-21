export type UserRole = 'admin' | 'manager' | 'officer' | 'supervisor' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  mobileNumber?: string;
  role: UserRole;
  assignedRoutes: string[]; // Route IDs or numbers
  status?: 'active' | 'disabled';
  isActive?: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface RouteItem {
  id: string;
  routeNumber: string;
  routeName: string;
  village?: string;
  villages?: string[];
  area?: string;
  description?: string;
  status?: 'active' | 'inactive';
  centerCount?: number;
  assignedOfficer?: string;
  assignedOfficerId?: string;
  morningPickupTime?: string;
  eveningPickupTime?: string;
  targetDailyLitres?: number;
  createdAt?: string;
}

export type MilkType = 'Cow' | 'Buffalo' | 'Both';
export type FarmerStatus = 'Active' | 'Irregular' | 'Stopped' | 'At Risk' | 'New Lead';
export type SupplierType = 'Gavali' | 'Farmer' | 'Collection Center' | 'Bulk Supplier';

export interface Farmer {
  id: string;
  farmerCode: string; // e.g. G-101 / F-101
  farmerName: string;
  mobileNumber: string;
  alternateNumber?: string;
  village: string;
  route: string; // Route number e.g. RT-101
  routeGroupName?: string; // Group / Cluster name e.g. "Sangli North Cluster"
  linkCenter?: string; // Link Center e.g. "Sangli Main Link Center"
  collectionCenter: string;
  milkType: MilkType;
  supplierType?: SupplierType;
  dailyMilkQuantity: number; // in Liters (Total)
  morningMilkQty?: number;
  eveningMilkQty?: number;
  cowLitres?: number;
  cowMorningQty?: number;
  cowEveningQty?: number;
  cowFat?: number;
  cowSNF?: number;
  cowRate?: number;
  cowCattleCount?: number;
  buffaloLitres?: number;
  buffaloMorningQty?: number;
  buffaloEveningQty?: number;
  buffaloFat?: number;
  buffaloSNF?: number;
  buffaloRate?: number;
  buffaloCattleCount?: number;
  avgFat?: number;
  avgSNF?: number;
  currentRate?: number; // per liter
  advanceBalance?: number; // Advance taken / उचल
  cattleCount?: number;
  competitorName?: string; // If selling partially elsewhere
  riskLevel?: 'Low' | 'Medium' | 'High' | 'Lost';
  status: FarmerStatus;
  remarks?: string;
  isFavorite?: boolean;
  address?: string;
  // FSSAI & Regulatory Licenses / शासकीय परवाने
  fssaiNumber?: string; // e.g. 11524036000123
  fssaiExpiryDate?: string;
  fssaiStatus?: 'Active' | 'Pending' | 'Expiring Soon' | 'Not Applied';
  inaphTagNumbers?: string[]; // पशु कानपट्टी / INAPH Ear Tags
  cleanMilkCert?: boolean; // स्वच्छ दूध उत्पादन प्रमाणपत्र
  vaccinationStatus?: 'Fully Vaccinated' | 'Partially Vaccinated' | 'Due for FMD' | 'Due for Lumpy';
  // Bank & KYC details
  bankName?: string;
  bankAccountNumber?: string;
  ifscCode?: string;
  aadhaarNumber?: string;
  panNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export type Gavali = Farmer; // Semantic alias for Milk Procurement Executive CRM

export type CallDirection = 'outgoing' | 'incoming' | 'field_visit';

export type CallStatus =
  | 'Completed'
  | 'Answered'
  | 'Not Received'
  | 'Not Answered'
  | 'Switched Off'
  | 'Busy'
  | 'Out of Coverage'
  | 'Call Back Later'
  | 'Follow-up Required'
  | 'Invalid Number'
  | 'Wrong Number'
  | 'Visit Completed'
  | 'Other';

export type CallPurpose =
  | 'Milk Collection'
  | 'Rate Information'
  | 'Milk Rate Inquiry'
  | 'Fat/SNF Problem'
  | 'Complaint'
  | 'Payment'
  | 'Payment Inquiry'
  | 'Advance / Loan'
  | 'Cattle Feed Requirement'
  | 'Veterinary Support'
  | 'General Follow-up'
  | 'Field Visit'
  | 'Shed Inspection'
  | 'Chilling Center Audit'
  | 'Competitor Poaching Risk'
  | 'New Gavali Lead'
  | 'Collection Increase'
  | 'Sample Testing'
  | 'Other';

export type PriorityLevel = 'Urgent' | 'High' | 'Medium' | 'Low';
export type Priority = PriorityLevel;

export interface CallAttachment {
  id: string;
  name: string;
  type: 'image' | 'audio' | 'document';
  url: string;
  size?: number;
  duration?: number; // for audio voice notes
  createdAt: string;
}

export interface CallRecord {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  type: CallDirection;
  farmerCode: string;
  farmerName: string;
  mobileNumber: string;
  alternateNumber?: string;
  route: string;
  village: string;
  callPurpose: string;
  callStatus: string;
  discussion: string;
  informationGiven?: string;
  pendingWork?: string;
  hasPendingWork?: boolean;
  followUpDate?: string; // YYYY-MM-DD
  followUpNotes?: string;
  priority?: PriorityLevel;
  officerId: string;
  officerName: string;
  callDuration?: number; // in seconds
  voiceNoteUrl?: string;
  voiceNoteDuration?: number;
  audioUrl?: string;
  audioBase64?: string;
  attachments?: CallAttachment[];
  aiSummary?: string;
  rateDiscussed?: number;
  fatSnfDiscussed?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IncomingCallRecord {
  id: string;
  date: string;
  time: string;
  farmerCode: string;
  farmerName: string;
  mobileNumber: string;
  route: string;
  subject: string;
  discussion: string;
  workRequested?: string;
  actionTaken?: string;
  pendingWork?: string;
  followUpDate?: string;
  officerId: string;
  officerName: string;
  createdAt: string;
}

export * from './task';

export type LegacyTaskStatus = 'Pending' | 'In Progress' | 'Completed' | 'Closed' | 'Cancelled';

export interface PendingTask {
  id: string;
  workName: string;
  description: string;
  assignedToId: string;
  assignedToName: string;
  farmerCode?: string;
  farmerName?: string;
  farmerMobile?: string;
  route: string;
  dueDate: string;
  priority: PriorityLevel;
  status: any;
  completionDate?: string;
  remarks?: string;
  sourceCallId?: string;
  category?: string;
  createdAt?: string;
  createdDate?: string;
  updatedAt?: string;
}

export type FollowUpStatus = 'pending' | 'completed' | 'rescheduled' | 'cancelled';

export interface FollowUpItem {
  id: string;
  callId?: string;
  farmerCode?: string;
  farmerName: string;
  mobileNumber: string;
  route: string;
  village?: string;
  scheduledDate: string; // YYYY-MM-DD
  reason: string;
  priority?: PriorityLevel;
  officerId?: string;
  officerName?: string;
  status: FollowUpStatus;
  completedAt?: string;
  rescheduledTo?: string;
  notes?: string;
  createdAt?: string;
}

export interface ExecutiveDailyPlan {
  id: string;
  date: string; // YYYY-MM-DD
  officerId: string;
  routesToVisit: string[];
  targetLitres: number;
  callsPlanned: number;
  visitsPlanned: number;
  priorityTasks: string[];
  fieldNotes?: string;
  eveningSummary?: string;
  status: 'planned' | 'in_progress' | 'completed';
  createdAt: string;
}

export interface RateCalculation {
  milkType: 'Cow' | 'Buffalo';
  fat: number;
  snf: number;
  baseRate: number;
  calculatedRatePerLitre: number;
  dailyLitres: number;
  dailyTotalPayout: number;
  tsValue: number; // Total Solids = Fat + SNF
}

export interface LoginHistoryEntry {
  id: string;
  userId: string;
  userName: string;
  role: UserRole;
  timestamp: string;
  ipAddress?: string;
  device?: string;
  status: 'success' | 'failed';
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'followup' | 'task' | 'alert' | 'system' | 'backup' | 'sync';
  targetDate?: string;
  read: boolean;
  createdAt: string;
}

export type ActivityType =
  | 'login'
  | 'logout'
  | 'working_hours'
  | 'supplier_added'
  | 'producer_added'
  | 'link_center_added'
  | 'cattle_shed_added'
  | 'checklist_submitted'
  | 'inspection_completed'
  | 'report_created'
  | 'pdf_downloaded'
  | 'excel_exported'
  | 'word_exported'
  | 'csv_exported'
  | 'image_uploaded'
  | 'image_deleted'
  | 'info_edited'
  | 'info_deleted'
  | 'search_performed'
  | 'filter_used'
  | 'print_activity'
  | 'whatsapp_shared'
  | 'gps_visit'
  | 'call_logged'
  | 'call_tracked'
  | 'backup_completed'
  | 'sync_completed'
  | 'data_restored'
  | 'other';

export interface ActivityLog {
  id: string;
  timestamp: string;
  date: string;
  time: string;
  userId: string;
  userName: string;
  userRole?: UserRole;
  userEmail?: string;
  userMobile?: string;
  activityType: ActivityType;
  title: string;
  description: string;
  entityType?: 'farmer' | 'call' | 'task' | 'route' | 'report' | 'user' | 'backup' | 'inspection' | 'shed' | 'center';
  entityId?: string;
  entityName?: string;
  details?: Record<string, any>;
  gpsLocation?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    address?: string;
  };
  deviceName: string;
  osVersion: string;
  browser: string;
  internetStatus: 'online' | 'offline';
  lastSyncTime: string;
  ipAddress?: string;
}

export interface CallHistoryEntry {
  id: string;
  contactName: string;
  mobileNumber: string;
  farmerCode?: string;
  callType: 'incoming' | 'outgoing' | 'missed';
  startTime: string;
  endTime: string;
  duration: number; // seconds
  date: string;
  time: string;
  route?: string;
  village?: string;
  purpose?: string;
  notes?: string;
  audioRecordingUrl?: string;
  gpsLocation?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  officerId: string;
  officerName: string;
  syncedToCloud: boolean;
  createdAt: string;
}

export interface DailyWorkReport {
  id: string;
  date: string;
  generatedAt: string;
  userId: string;
  userName: string;
  employeeId: string;
  department: string;
  mobileNumber: string;
  loginTime: string;
  logoutTime?: string;
  totalWorkingHours: string;
  workSummary: {
    totalSuppliersAdded: number;
    totalProducersAdded: number;
    totalLinkCentersAdded: number;
    totalCattleShedsAdded: number;
    totalChecklistsSubmitted: number;
    totalReportsGenerated: number;
    totalImagesUploaded: number;
    totalCallsMade: number;
    totalIncomingReceived: number;
    totalWhatsAppReportsShared: number;
    totalVisitsCompleted: number;
    totalMilkProcuredLiters?: number;
  };
  callDetails: (CallRecord | CallHistoryEntry)[];
  reportGenerationHistory: { reportName: string; type: string; time: string }[];
  gpsVisitHistory: { locationName: string; time: string; coords?: string; purpose?: string }[];
  completedTasks: { title: string; gavali: string; route: string; outcome?: string }[];
  pendingTasks: { title: string; gavali: string; route: string; dueDate?: string; priority?: string }[];
  manualRemarks: string;
  overallPerformanceSummary: string;
  digitalSignature: {
    signedBy: string;
    signedAt: string;
    designation: string;
  };
}

export interface DownloadItem {
  id: string;
  name: string;
  type: 'pdf' | 'excel' | 'word' | 'csv' | 'image' | 'backup';
  size: string;
  date: string;
  time: string;
  url?: string;
  dataUri?: string;
  category: string;
  generatedBy: string;
  recordCount?: number;
}

export interface CloudBackupSnapshot {
  id: string;
  timestamp: string;
  date: string;
  time: string;
  version: string;
  userId: string;
  userName: string;
  deviceName: string;
  itemCounts: {
    farmers: number;
    calls: number;
    tasks: number;
    routes: number;
    activities: number;
    reports: number;
  };
  data: {
    farmers: Farmer[];
    calls: CallRecord[];
    incomingCalls: any[];
    tasks: any[];
    followUps: FollowUpItem[];
    routes: RouteItem[];
    users: User[];
    activities: ActivityLog[];
    callHistory: CallHistoryEntry[];
    dailyReports: DailyWorkReport[];
    plans: ExecutiveDailyPlan[];
    downloads?: DownloadItem[];
  };
  sizeBytes: number;
  backupType: 'auto' | 'scheduled' | 'manual';
}

export * from './rateChart';

// ==========================================
// Producer Communication & Call Tracking Types
// ==========================================

export type ProducerCommunicationSubject =
  | 'Rate Information'
  | 'Rate Change'
  | 'FSSAI License Reminder'
  | 'Document Verification'
  | 'Milk Quality Notice'
  | 'Collection Timing'
  | 'Meeting Information'
  | 'Payment Information'
  | 'Other';

export type ProducerCallStatus =
  | 'Call Completed'
  | 'Call Not Answered'
  | 'Busy'
  | 'Switched Off'
  | 'Wrong Number'
  | 'Number Not Reachable'
  | 'Call Back Required'
  | 'Follow-up Required'
  | 'Information Delivered Successfully';

export interface ProducerCommunicationRecord {
  id: string;
  campaignId?: string;
  producerCode: string;
  producerName: string;
  mobileNumber: string;
  alternateNumber?: string;
  village: string;
  route: string;
  linkCenter: string;
  collectionCenter: string;
  milkType: MilkType;
  subject: ProducerCommunicationSubject | string;
  status: ProducerCallStatus | string;
  callDate: string; // YYYY-MM-DD
  callTime: string; // HH:mm
  callDuration: number; // in seconds
  remarks: string;
  followUpDate?: string; // YYYY-MM-DD
  channel?: 'Call' | 'WhatsApp' | 'SMS';
  officerId: string;
  officerName: string;
  syncedToCloud?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommunicationCampaign {
  id: string;
  title: string;
  subject: ProducerCommunicationSubject | string;
  date: string; // YYYY-MM-DD
  targetRoutes: string[]; // 'all' or list of routes
  notes?: string;
  broadcastTemplate?: string;
  createdById: string;
  createdByName: string;
  status: 'active' | 'completed' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface ProducerCommunicationSummary {
  totalProducers: number;
  callsCompleted: number;
  informationDelivered: number;
  notAnswered: number;
  busy: number;
  switchedOff: number;
  followUpPending: number;
  remainingCalls: number;
  wrongOrUnreachable: number;
  callBackRequired: number;
  completionPercentage: number;
}

// ==========================================
// Producer Survey & Survey Dashboard Types
// ==========================================

export type SurveyStatus = 'Completed' | 'Pending' | 'Revisit Required';
export type DeviceInstallStatus = 'Installed' | 'Pending' | 'Not Required';

export interface ProducerSurvey {
  id: string;
  producerId?: string;
  producerCode: string;
  producerName: string;
  mobileNumber: string;
  alternateNumber?: string;
  village: string;
  taluka: string;
  district: string;
  fullAddress: string;
  latitude?: number;
  longitude?: number;
  gpsAccuracy?: number;
  route: string;
  linkCenter: string;
  collectionCenter: string;
  milkType: MilkType;
  surveyDate: string; // YYYY-MM-DD
  surveyedBy: string; // Officer Name
  surveyedById?: string; // Officer ID
  surveyStatus: SurveyStatus;
  deviceStatus: DeviceInstallStatus;
  deviceInstallationDate?: string; // YYYY-MM-DD
  deviceSerialNumber?: string;
  deviceModel?: string;
  dailyMilkPotential?: number; // in Litres
  cattleCount?: number;
  surveyRemarks: string;
  photoUrl?: string; // Base64 or image URL
  photoTimestamp?: string;
  documents?: {
    id: string;
    name: string;
    type: 'Aadhaar' | '7/12 Extract' | 'Bank Passbook' | 'FSSAI' | 'Other';
    fileUrl?: string;
    uploadedAt: string;
  }[];
  isActiveProducer: boolean;
  syncedToCloud: boolean;
  cloudSyncTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SurveyDashboardMetrics {
  totalProducers: number;
  totalSurveysCompleted: number;
  totalSurveysPending: number;
  totalSurveysRevisit: number;
  totalDeviceInstalled: number;
  totalDevicePending: number;
  totalDeviceNotRequired: number;
  totalActiveProducers: number;
  totalInactiveProducers: number;
  completionRate: number;
}

export * from './mpo';

