// ==========================================
// MPO Management System Extended Types
// ==========================================

import { MilkType, PriorityLevel, UserRole } from './index';

// 1. Link Center & Collection Center
export interface LinkCenter {
  id: string;
  centerCode: string; // e.g. LC-01
  centerName: string;
  inchargeName: string;
  mobileNumber: string;
  alternateNumber?: string;
  taluka: string;
  district: string;
  address: string;
  latitude?: number;
  longitude?: number;
  assignedRouteIds: string[];
  chillingCapacityLiters: number;
  dailyAverageCollection: number;
  equipmentStatus: 'Operational' | 'Needs Maintenance' | 'Down';
  status: 'Active' | 'Inactive';
  fssaiNumber?: string;
  fssaiExpiryDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionCenter {
  id: string;
  centerCode: string; // e.g. CC-101
  centerName: string;
  village: string;
  taluka: string;
  route: string;
  linkCenterId?: string;
  linkCenterName: string;
  secretaryName: string;
  secretaryMobile: string;
  morningTiming: string; // e.g. "06:00 AM - 08:30 AM"
  eveningTiming: string; // e.g. "05:30 PM - 08:00 PM"
  dailyAverageCowLiters: number;
  dailyAverageBuffaloLiters: number;
  totalProducersCount: number;
  hasElectronicAnalyzer: boolean;
  analyzerSerialNumber?: string;
  hasDPU: boolean; // Data Processing Unit
  latitude?: number;
  longitude?: number;
  status: 'Active' | 'Inactive';
  fssaiNumber?: string;
  fssaiExpiryDate?: string;
  createdAt: string;
  updatedAt: string;
}

// 2. Cattle Shed (Gotha) Survey
export interface CattleShedSurvey {
  id: string;
  surveyNumber: string; // e.g. GOTH-2026-001
  producerId?: string;
  producerCode: string;
  producerName: string;
  mobileNumber: string;
  village: string;
  route: string;
  shedType: 'Open Shed' | 'Closed Shed' | 'Semi-Covered Modern' | 'Traditional';
  floorType: 'Concrete with Grooves' | 'Rubber Matting' | 'Mud/Kaccha' | 'Paver Blocks';
  waterSource: 'Borewell' | 'Well' | 'Canal' | 'Tap Connection';
  milkingMethod: 'Manual Hand Milking' | 'Single Bucket Machine' | 'Pipe Milking System';
  cowsCount: {
    hf: number;
    jersey: number;
    gir: number;
    desi: number;
    calves: number;
  };
  buffaloesCount: {
    murrah: number;
    jafrabadi: number;
    pandharpuri: number;
    local: number;
    calves: number;
  };
  totalCattle: number;
  milkingCattleCount: number;
  dailyCowYield: number; // in Liters
  dailyBuffaloYield: number; // in Liters
  dungManagement: 'Biogas Plant' | 'Compost Pit' | 'Open Heap' | 'Slurry Tank';
  cleanlinessRating: 1 | 2 | 3 | 4 | 5; // Stars
  fmdVaccinated: boolean;
  lumpyVaccinated: boolean;
  brucellosisVaccinated: boolean;
  dewormingDone: boolean;
  cattleInsuranceCount: number;
  gpsLocation?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    address?: string;
  };
  photoUrl?: string;
  photoTimestamp?: string;
  remarks: string;
  recommendations: string;
  officerId: string;
  officerName: string;
  digitalSignature?: string; // Base64 signature
  surveyDate: string; // YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
}

// 3. Competitor Dairy Intelligence
export interface CompetitorDairy {
  id: string;
  dairyName: string; // e.g. "Gokul Dairy", "Chitale Bandhu", "Amul", "Warana", "Sonai"
  operatingVillages: string[];
  routes: string[];
  cowRatePerFatSnf: string; // e.g. "Rs 38.50 @ 3.5/8.5"
  buffaloRatePerFatSnf: string; // e.g. "Rs 52.00 @ 6.0/9.0"
  paymentCycle: '10 Days' | 'Weekly' | '15 Days' | 'Monthly';
  incentivesOffered: string; // e.g. "Diwali bonus Rs 2/ltr, Free Cattle feed 1 bag per 1000 ltr"
  cattleFeedCredit: string; // e.g. "Feed provided on 30 days milk bill credit"
  activeCollectionCentersCount: number;
  threatLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  keyWeaknesses: string; // e.g. "Delayed payment, deduction on low SNF"
  ourCounterStrategy: string;
  notes?: string;
  lastUpdatedDate: string;
  updatedBy: string;
  createdAt: string;
}

// 4. MPO Attendance with GPS & Selfie
export interface MPOAttendance {
  id: string;
  date: string; // YYYY-MM-DD
  officerId: string;
  officerName: string;
  officerMobile: string;
  checkInTime: string; // HH:mm:ss
  checkInLatitude: number;
  checkInLongitude: number;
  checkInAccuracy?: number;
  checkInAddress: string;
  checkInSelfieUrl: string;
  checkOutTime?: string; // HH:mm:ss
  checkOutLatitude?: number;
  checkOutLongitude?: number;
  checkOutAddress?: string;
  checkOutSelfieUrl?: string;
  totalWorkingMinutes?: number;
  shiftStatus: 'Present' | 'Half Day' | 'On Tour' | 'Leave';
  daySummaryNotes?: string;
  kilometersTraveled?: number;
  syncedToCloud: boolean;
  createdAt: string;
  updatedAt: string;
}

// 5. MPO Daily Tour Plan (DTP) & Visit Planning
export interface TourPlanItem {
  id: string;
  planDate: string; // YYYY-MM-DD
  officerId: string;
  officerName: string;
  routeNumber: string;
  targetVillages: string[];
  targetCenters: string[];
  producersToVisit: {
    producerCode: string;
    producerName: string;
    village: string;
    purpose: string;
    status: 'Scheduled' | 'Completed' | 'Skipped';
    outcomeRemarks?: string;
  }[];
  plannedCollectionLitersTarget: number;
  specialObjectives: string;
  approvalStatus: 'Pending' | 'Approved' | 'Rejected';
  approvedBy?: string;
  approvalRemarks?: string;
  actualVisitedCount?: number;
  completionPercentage?: number;
  createdAt: string;
  updatedAt: string;
}

// 6. Quality & Field Inspection Checklists (4 Types)
export type InspectionType =
  | 'milk_quality'
  | 'chilling_center'
  | 'link_center'
  | 'dairy_equipment'
  | 'Milk Quality'
  | 'Chilling Center'
  | 'Link Center'
  | 'Dairy Equipment';

export interface MPOTaskReminder {
  id: string;
  officerId: string;
  title: string;
  dueDate: string;
  priority: 'High' | 'Medium' | 'Low';
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
}

export type InspectionRecord = InspectionChecklistRecord;

export interface InspectionChecklistRecord {
  id: string;
  inspectionType: InspectionType;
  referenceCode?: string; // INSP-2026-001
  inspectionNumber?: string;
  date?: string;
  inspectionDate?: string;
  time?: string;
  targetName: string; // Center / Gavali / Link Center / Unit name
  targetCode?: string;
  route: string;
  village: string;
  inspectorId?: string;
  inspectorName?: string;
  officerId?: string;
  officerName?: string;
  
  // Specific findings
  scorePercentage?: number;
  overallRating?: number;
  overallResult?: 'Passed' | 'Action Required' | 'Critical Non-Compliance';
  complianceStatus?: 'Compliant' | 'Action Required' | 'Non-Compliant';
  
  // Dynamic Checklist Items
  items?: {
    id: string;
    category: string;
    parameter: string;
    expectedStandard: string;
    actualFinding: string;
    status: 'Pass' | 'Fail' | 'Needs Improvement' | 'NA';
    remarks?: string;
  }[];
  checklistItems?: {
    item: string;
    status: 'Pass' | 'Fail' | 'Needs Improvement' | 'NA';
    remarks?: string;
  }[];
  
  // Specific tests for Milk Quality
  organolepticSmellTaste?: 'Normal' | 'Sour' | 'Off-flavor' | 'Watery';
  mbrtHours?: number;
  alcoholTest?: 'Negative (Good)' | 'Positive (Sour/Spoiled)';
  adulterationUrea?: 'Negative' | 'Positive';
  adulterationDetergent?: 'Negative' | 'Positive';
  adulterationStarch?: 'Negative' | 'Positive';
  adulterationSalt?: 'Negative' | 'Positive';
  milkTemperatureC?: number;

  // Equipment / Center specific
  bmcTemperatureC?: number;
  powerBackupStatus?: 'Working' | 'Faulty' | 'Not Available';
  cipSanitationDone?: boolean;
  analyzerCalibrated?: boolean;
  weighScaleCertified?: boolean;

  actionPlan?: string;
  actionRequired?: string;
  correctiveDeadline?: string;
  followUpDate?: string;
  latitude?: number;
  longitude?: number;
  photoUrls?: string[];
  gpsLocation?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  inspectorSignature?: string;
  inchargeSignature?: string;
  createdAt: string;
  updatedAt?: string;
}

// 7. Notice & Circulars
export interface DairyNotice {
  id: string;
  noticeNumber: string; // NOT-2026-01
  title: string;
  marathiTitle: string;
  category: 'Rate Revision' | 'Quality Advisory' | 'Bonus / Incentive' | 'Meeting' | 'Festival Timing' | 'Government Scheme' | 'General';
  content: string;
  marathiContent: string;
  issuedDate: string;
  effectiveFrom: string;
  validUntil?: string;
  targetAudience: 'All Producers' | 'Cow Milk Producers' | 'Buffalo Milk Producers' | 'Center Operators' | 'MPOs';
  targetRoutes: string[]; // 'all' or specific route IDs
  isUrgent: boolean;
  attachmentUrl?: string;
  issuedBy: string;
  isActive: boolean;
  viewCount: number;
  createdAt: string;
}

// 8. Complaints & Producer Requests (Grievance Redressal)
export interface ProducerComplaint {
  id: string;
  ticketNumber: string; // TKT-2026-001
  producerCode: string;
  producerName: string;
  mobileNumber: string;
  route: string;
  village: string;
  collectionCenter: string;
  complaintType: 'Fat/SNF Dispute' | 'Payment Delay' | 'Advance Request' | 'Cattle Feed Delivery' | 'Doctor/Vet Visit' | 'Can Replacement' | 'Electronic Analyzer Issue' | 'Behavior Complaint' | 'Other';
  priority: PriorityLevel;
  subject: string;
  details: string;
  lodgedDate: string;
  slaDueDate: string;
  assignedOfficerId: string;
  assignedOfficerName: string;
  status: 'Open' | 'Under Investigation' | 'Resolved' | 'Closed' | 'Rejected';
  resolutionNotes?: string;
  resolvedDate?: string;
  resolvedBy?: string;
  producerSatisfied?: boolean;
  createdAt: string;
  updatedAt: string;
}

// 9. Admin/Manager Approval Workflow Item
export interface ApprovalRequest {
  id: string;
  requestType: 'New Producer Registration' | 'Milk Rate Exception' | 'Advance/Loan Sanction' | 'Equipment Replacement' | 'Tour Plan Approval' | 'Write-off Request';
  referenceId: string;
  title: string;
  description: string;
  requestedById: string;
  requestedByName: string;
  requestedDate: string;
  amount?: number;
  route?: string;
  producerCode?: string;
  urgency: PriorityLevel;
  status: 'Pending' | 'Approved' | 'Rejected';
  actionTakenBy?: string;
  actionDate?: string;
  actionRemarks?: string;
  createdAt: string;
  updatedAt: string;
}
