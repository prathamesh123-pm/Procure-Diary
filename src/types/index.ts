export type UserRole = 'admin' | 'officer' | 'supervisor';

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
  collectionCenter: string;
  milkType: MilkType;
  supplierType?: SupplierType;
  dailyMilkQuantity: number; // in Liters (Total)
  morningMilkQty?: number;
  eveningMilkQty?: number;
  cowLitres?: number;
  buffaloLitres?: number;
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
  type: 'followup' | 'task' | 'alert' | 'system';
  targetDate?: string;
  read: boolean;
  createdAt: string;
}
