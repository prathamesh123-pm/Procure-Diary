// ==========================================
// MPO Management System Storage & Business Logic Service
// ==========================================

import {
  LinkCenter,
  CollectionCenter,
  CattleShedSurvey,
  CompetitorDairy,
  MPOAttendance,
  TourPlanItem,
  InspectionChecklistRecord,
  DairyNotice,
  ProducerComplaint,
  ApprovalRequest,
  Farmer,
} from '../types';
import { StorageService } from './storageService';

const LINK_CENTERS_KEY = 'dairy_mpo_link_centers';
const COLLECTION_CENTERS_KEY = 'dairy_mpo_collection_centers';
const GOTHA_SURVEYS_KEY = 'dairy_mpo_gotha_surveys';
const COMPETITORS_KEY = 'dairy_mpo_competitors';
const ATTENDANCE_KEY = 'dairy_mpo_attendance';
const TOUR_PLANS_KEY = 'dairy_mpo_tour_plans';
const INSPECTIONS_KEY = 'dairy_mpo_inspections';
const NOTICES_KEY = 'dairy_mpo_notices';
const COMPLAINTS_KEY = 'dairy_mpo_complaints';
const APPROVALS_KEY = 'dairy_mpo_approvals';

export class MPOStorageService {
  // ----------------------------------------
  // Helper Event Dispatcher
  // ----------------------------------------
  private static notifyChange(eventType: string = 'dairy_mpo_updated') {
    window.dispatchEvent(new CustomEvent(eventType));
    window.dispatchEvent(new CustomEvent('dairy_storage_updated'));
  }

  // ========================================
  // 1. Link Centers Management
  // ========================================
  static getLinkCenters(): LinkCenter[] {
    try {
      const data = localStorage.getItem(LINK_CENTERS_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load link centers', e);
    }
    // Seed initial realistic Link Centers (Sangli/Kolhapur dairy hubs)
    const seed: LinkCenter[] = [
      {
        id: 'LC-01',
        centerCode: 'LC-01',
        centerName: 'सांगली मुख्य लिंक केंद्र (Sangli Main Hub)',
        inchargeName: 'संजय पाटील (Sanjay Patil)',
        mobileNumber: '9822101010',
        alternateNumber: '9422303030',
        taluka: 'Miraj',
        district: 'Sangli',
        address: 'एमआयडीसी कुपवाड, सांगली ४१६४३६',
        latitude: 16.8524,
        longitude: 74.5815,
        assignedRouteIds: ['RT-101', 'RT-102', 'RT-103'],
        chillingCapacityLiters: 15000,
        dailyAverageCollection: 9450,
        equipmentStatus: 'Operational',
        status: 'Active',
        fssaiNumber: '11524036000011',
        fssaiExpiryDate: '2027-05-15',
        createdAt: '2026-01-10T10:00:00Z',
        updatedAt: '2026-08-20T10:00:00Z',
      },
      {
        id: 'LC-02',
        centerCode: 'LC-02',
        centerName: 'इस्लामपूर लिंक व चिलिंग केंद्र (Islampur BMC Hub)',
        inchargeName: 'दिलीप मोहिते (Dilip Mohite)',
        mobileNumber: '9822404040',
        taluka: 'Walwa',
        district: 'Sangli',
        address: 'पेठ-सांगली रोड, इस्लामपूर',
        latitude: 17.0543,
        longitude: 74.2632,
        assignedRouteIds: ['RT-104', 'RT-105'],
        chillingCapacityLiters: 10000,
        dailyAverageCollection: 6800,
        equipmentStatus: 'Operational',
        status: 'Active',
        fssaiNumber: '11524036000012',
        fssaiExpiryDate: '2026-09-18', // Expiring soon
        createdAt: '2026-01-15T10:00:00Z',
        updatedAt: '2026-08-20T10:00:00Z',
      },
      {
        id: 'LC-03',
        centerCode: 'LC-03',
        centerName: 'कडेगाव लिंक केंद्र (Kadegaon Hub)',
        inchargeName: 'विजय सूर्यवंशी (Vijay Suryavanshi)',
        mobileNumber: '9822505050',
        taluka: 'Kadegaon',
        district: 'Sangli',
        address: 'कडेगाव बस स्थानक जवळ',
        latitude: 17.2985,
        longitude: 74.3312,
        assignedRouteIds: ['RT-106', 'RT-107'],
        chillingCapacityLiters: 8000,
        dailyAverageCollection: 4200,
        equipmentStatus: 'Operational',
        status: 'Active',
        fssaiNumber: '11524036000013',
        fssaiExpiryDate: '2027-11-20',
        createdAt: '2026-02-01T10:00:00Z',
        updatedAt: '2026-08-20T10:00:00Z',
      },
    ];
    localStorage.setItem(LINK_CENTERS_KEY, JSON.stringify(seed));
    return seed;
  }

  static saveLinkCenter(center: LinkCenter): LinkCenter {
    const list = this.getLinkCenters();
    const idx = list.findIndex(c => c.id === center.id);
    if (idx >= 0) {
      list[idx] = { ...center, updatedAt: new Date().toISOString() };
    } else {
      list.unshift({ ...center, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    localStorage.setItem(LINK_CENTERS_KEY, JSON.stringify(list));
    this.notifyChange();
    return center;
  }

  static deleteLinkCenter(id: string) {
    const list = this.getLinkCenters().filter(c => c.id !== id);
    localStorage.setItem(LINK_CENTERS_KEY, JSON.stringify(list));
    this.notifyChange();
  }

  // ========================================
  // 2. Collection Centers Management
  // ========================================
  static getCollectionCenters(): CollectionCenter[] {
    try {
      const data = localStorage.getItem(COLLECTION_CENTERS_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load collection centers', e);
    }
    const seed: CollectionCenter[] = [
      {
        id: 'CC-101',
        centerCode: 'CC-101',
        centerName: 'कवठेपिरान दूध संकलन केंद्र (Kavathe Piran Center)',
        village: 'कवठेपिरान (Kavathe Piran)',
        taluka: 'Miraj',
        route: 'RT-101',
        linkCenterId: 'LC-01',
        linkCenterName: 'सांगली मुख्य लिंक केंद्र',
        secretaryName: 'अशोक चव्हाण (Ashok Chavan)',
        secretaryMobile: '9822606060',
        morningTiming: '06:00 AM - 08:30 AM',
        eveningTiming: '05:30 PM - 07:45 PM',
        dailyAverageCowLiters: 1450,
        dailyAverageBuffaloLiters: 680,
        totalProducersCount: 42,
        hasElectronicAnalyzer: true,
        analyzerSerialNumber: 'MILK-SCAN-7711',
        hasDPU: true,
        latitude: 16.8821,
        longitude: 74.4981,
        status: 'Active',
        fssaiNumber: '11524036000201',
        fssaiExpiryDate: '2026-09-05', // Expiring in < 30 days!
        createdAt: '2026-01-10T10:00:00Z',
        updatedAt: '2026-08-20T10:00:00Z',
      },
      {
        id: 'CC-102',
        centerCode: 'CC-102',
        centerName: 'बहे दूध संकलन केंद्र (Bahe Center)',
        village: 'बहे (Bahe)',
        taluka: 'Walwa',
        route: 'RT-104',
        linkCenterId: 'LC-02',
        linkCenterName: 'इस्लामपूर लिंक व चिलिंग केंद्र',
        secretaryName: 'सतीश सावंत (Satish Sawant)',
        secretaryMobile: '9822707070',
        morningTiming: '06:15 AM - 08:45 AM',
        eveningTiming: '05:45 PM - 08:00 PM',
        dailyAverageCowLiters: 980,
        dailyAverageBuffaloLiters: 420,
        totalProducersCount: 28,
        hasElectronicAnalyzer: true,
        analyzerSerialNumber: 'MILK-SCAN-8842',
        hasDPU: true,
        latitude: 17.0812,
        longitude: 74.2219,
        status: 'Active',
        fssaiNumber: '11524036000202',
        fssaiExpiryDate: '2027-04-12',
        createdAt: '2026-01-15T10:00:00Z',
        updatedAt: '2026-08-20T10:00:00Z',
      },
      {
        id: 'CC-103',
        centerCode: 'CC-103',
        centerName: 'ताकारी दूध संकलन केंद्र (Takari Center)',
        village: 'ताकारी (Takari)',
        taluka: 'Walwa',
        route: 'RT-104',
        linkCenterId: 'LC-02',
        linkCenterName: 'इस्लामपूर लिंक व चिलिंग केंद्र',
        secretaryName: 'रमेश जाधव (Ramesh Jadhav)',
        secretaryMobile: '9822808080',
        morningTiming: '06:00 AM - 08:15 AM',
        eveningTiming: '05:30 PM - 07:30 PM',
        dailyAverageCowLiters: 1120,
        dailyAverageBuffaloLiters: 510,
        totalProducersCount: 35,
        hasElectronicAnalyzer: true,
        analyzerSerialNumber: 'MILK-SCAN-9021',
        hasDPU: true,
        latitude: 17.1124,
        longitude: 74.2891,
        status: 'Active',
        fssaiNumber: '11524036000203',
        fssaiExpiryDate: '2027-10-30',
        createdAt: '2026-01-20T10:00:00Z',
        updatedAt: '2026-08-20T10:00:00Z',
      },
    ];
    localStorage.setItem(COLLECTION_CENTERS_KEY, JSON.stringify(seed));
    return seed;
  }

  static saveCollectionCenter(center: CollectionCenter): CollectionCenter {
    const list = this.getCollectionCenters();
    const idx = list.findIndex(c => c.id === center.id);
    if (idx >= 0) {
      list[idx] = { ...center, updatedAt: new Date().toISOString() };
    } else {
      list.unshift({ ...center, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    localStorage.setItem(COLLECTION_CENTERS_KEY, JSON.stringify(list));
    this.notifyChange();
    return center;
  }

  static deleteCollectionCenter(id: string) {
    const list = this.getCollectionCenters().filter(c => c.id !== id);
    localStorage.setItem(COLLECTION_CENTERS_KEY, JSON.stringify(list));
    this.notifyChange();
  }

  // ========================================
  // 3. Cattle Shed (Gotha) Survey Management
  // ========================================
  static getGothaSurveys(): CattleShedSurvey[] {
    try {
      const data = localStorage.getItem(GOTHA_SURVEYS_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load gotha surveys', e);
    }
    const seed: CattleShedSurvey[] = [
      {
        id: 'GOTH-001',
        surveyNumber: 'GOTH-2026-001',
        producerCode: 'G-101',
        producerName: 'आनंदराव पाटील (Anandrao Patil)',
        mobileNumber: '9822112233',
        village: 'कवठेपिरान (Kavathe Piran)',
        route: 'RT-101',
        shedType: 'Semi-Covered Modern',
        floorType: 'Rubber Matting',
        waterSource: 'Borewell',
        milkingMethod: 'Single Bucket Machine',
        cowsCount: { hf: 8, jersey: 4, gir: 2, desi: 0, calves: 3 },
        buffaloesCount: { murrah: 4, jafrabadi: 0, pandharpuri: 2, local: 0, calves: 1 },
        totalCattle: 24,
        milkingCattleCount: 18,
        dailyCowYield: 180,
        dailyBuffaloYield: 35,
        dungManagement: 'Biogas Plant',
        cleanlinessRating: 5,
        fmdVaccinated: true,
        lumpyVaccinated: true,
        brucellosisVaccinated: true,
        dewormingDone: true,
        cattleInsuranceCount: 12,
        gpsLocation: { latitude: 16.8834, longitude: 74.4995, accuracy: 4, address: 'कवठेपिरान, सांगली' },
        remarks: 'आदर्श गोठा व्यवस्थापन. उच्च प्रतीचे चारा व पाण्याचे नियोजन.',
        recommendations: 'सायलेज व पशुखाद्य साठवणुकीसाठी आधुनिक शेड वाढवणे योग्य.',
        officerId: 'USR-ADMIN-1',
        officerName: 'प्रमोद सावंत (Pramod Sawant)',
        surveyDate: '2026-08-18',
        createdAt: '2026-08-18T11:00:00Z',
        updatedAt: '2026-08-18T11:00:00Z',
      },
      {
        id: 'GOTH-002',
        surveyNumber: 'GOTH-2026-002',
        producerCode: 'G-102',
        producerName: 'तुकाराम जाधव (Tukaram Jadhav)',
        mobileNumber: '9822334455',
        village: 'बहे (Bahe)',
        route: 'RT-104',
        shedType: 'Closed Shed',
        floorType: 'Concrete with Grooves',
        waterSource: 'Well',
        milkingMethod: 'Manual Hand Milking',
        cowsCount: { hf: 4, jersey: 2, gir: 0, desi: 0, calves: 2 },
        buffaloesCount: { murrah: 6, jafrabadi: 2, pandharpuri: 0, local: 0, calves: 2 },
        totalCattle: 16,
        milkingCattleCount: 11,
        dailyCowYield: 65,
        dailyBuffaloYield: 52,
        dungManagement: 'Compost Pit',
        cleanlinessRating: 4,
        fmdVaccinated: true,
        lumpyVaccinated: true,
        brucellosisVaccinated: false,
        dewormingDone: true,
        cattleInsuranceCount: 6,
        gpsLocation: { latitude: 17.0825, longitude: 74.2235, accuracy: 5, address: 'बहे, ता. वाळवा' },
        remarks: 'दूध फॅट व SNF उत्तम आहे. गोठ्यात हवा खेळती राहण्यासाठी बाजूचे जाळीदार काम करणे आवश्यक.',
        recommendations: 'मिलकिंग मशीन सबसिडीसाठी अर्ज करण्याची शिफारस.',
        officerId: 'USR-ADMIN-1',
        officerName: 'प्रमोद सावंत (Pramod Sawant)',
        surveyDate: '2026-08-19',
        createdAt: '2026-08-19T14:30:00Z',
        updatedAt: '2026-08-19T14:30:00Z',
      },
    ];
    localStorage.setItem(GOTHA_SURVEYS_KEY, JSON.stringify(seed));
    return seed;
  }

  static saveGothaSurvey(survey: CattleShedSurvey): CattleShedSurvey {
    const list = this.getGothaSurveys();
    const idx = list.findIndex(s => s.id === survey.id);
    if (idx >= 0) {
      list[idx] = { ...survey, updatedAt: new Date().toISOString() };
    } else {
      list.unshift({ ...survey, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    localStorage.setItem(GOTHA_SURVEYS_KEY, JSON.stringify(list));
    this.notifyChange();
    return survey;
  }

  static deleteGothaSurvey(id: string) {
    const list = this.getGothaSurveys().filter(s => s.id !== id);
    localStorage.setItem(GOTHA_SURVEYS_KEY, JSON.stringify(list));
    this.notifyChange();
  }

  // ========================================
  // 4. Competitor Dairy Intelligence
  // ========================================
  static getCompetitors(): CompetitorDairy[] {
    try {
      const data = localStorage.getItem(COMPETITORS_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load competitors', e);
    }
    const seed: CompetitorDairy[] = [
      {
        id: 'COMP-01',
        dairyName: 'गोकुळ दूध संघ (Gokul Milk Union)',
        operatingVillages: ['कवठेपिरान', 'बहे', 'ताकारी', 'मांजर्डे'],
        routes: ['RT-101', 'RT-104'],
        cowRatePerFatSnf: '₹37.50 @ 3.5/8.5',
        buffaloRatePerFatSnf: '₹53.00 @ 6.0/9.0',
        paymentCycle: '10 Days',
        incentivesOffered: 'दिवाळी बोनस ₹२.५०/लिटर, पशुवैद्यकीय मोफत सेवा',
        cattleFeedCredit: 'गोकुळ पशुखाद्य १ महिना बिल कपात',
        activeCollectionCentersCount: 14,
        threatLevel: 'High',
        keyWeaknesses: 'कडक गुणवत्ता तपासणीत वजावट जास्त, केंद्रावर वेळेची मर्यादा',
        ourCounterStrategy: 'वेळेवर १० दिवसांचे थेट खात्यावर पेमेंट व बोनस अग्रिम उचल देणे.',
        lastUpdatedDate: '2026-08-15',
        updatedBy: 'प्रमोद सावंत',
        createdAt: '2026-01-10T10:00:00Z',
      },
      {
        id: 'COMP-02',
        dairyName: 'चितळे डेअरी (Chitale Dairy)',
        operatingVillages: ['भिलवडी', 'तुंग', 'कवठेपिरान'],
        routes: ['RT-101', 'RT-102'],
        cowRatePerFatSnf: '₹38.00 @ 3.5/8.5',
        buffaloRatePerFatSnf: '₹54.50 @ 6.0/9.0',
        paymentCycle: '10 Days',
        incentivesOffered: 'उन्हाळी दूध इन्सेंटिव्ह ₹१.५० प्रति लिटर',
        cattleFeedCredit: 'चितळे स्पेशल मिनरल मिक्श्चर अनुदान',
        activeCollectionCentersCount: 8,
        threatLevel: 'High',
        keyWeaknesses: 'कमी दूध देणाऱ्या शेतकऱ्यांचे संकलन टाळतात, ठराविक लिटर मर्यादा',
        ourCounterStrategy: 'सर्व लहान-मोठ्या शेतकऱ्यांचे स्वागत, घरपोच पशुखाद्य वितरण.',
        lastUpdatedDate: '2026-08-16',
        updatedBy: 'प्रमोद सावंत',
        createdAt: '2026-01-15T10:00:00Z',
      },
      {
        id: 'COMP-03',
        dairyName: 'वारणा दूध संघ (Warana Dairy)',
        operatingVillages: ['बहे', 'ताकारी', 'इस्लामपूर परिसर'],
        routes: ['RT-104', 'RT-105'],
        cowRatePerFatSnf: '₹36.80 @ 3.5/8.5',
        buffaloRatePerFatSnf: '₹51.50 @ 6.0/9.0',
        paymentCycle: '15 Days',
        incentivesOffered: 'वार्षिक लाभांश व साखर वाटप',
        cattleFeedCredit: 'वारणा पशुखाद्य सवलत',
        activeCollectionCentersCount: 6,
        threatLevel: 'Medium',
        keyWeaknesses: 'पेमेंट १५ दिवसांचे, काही केंद्रांवर डीपीयूमधील वजन तफावत तक्रारी',
        ourCounterStrategy: '१० दिवसांचे त्वरित पेमेंट व अचूक ऑनलाइन वजन-फॅट पावती.',
        lastUpdatedDate: '2026-08-10',
        updatedBy: 'प्रमोद सावंत',
        createdAt: '2026-02-01T10:00:00Z',
      },
    ];
    localStorage.setItem(COMPETITORS_KEY, JSON.stringify(seed));
    return seed;
  }

  static saveCompetitor(comp: CompetitorDairy): CompetitorDairy {
    const list = this.getCompetitors();
    const idx = list.findIndex(c => c.id === comp.id);
    if (idx >= 0) {
      list[idx] = { ...comp, lastUpdatedDate: new Date().toISOString().split('T')[0] };
    } else {
      list.unshift({ ...comp, createdAt: new Date().toISOString(), lastUpdatedDate: new Date().toISOString().split('T')[0] });
    }
    localStorage.setItem(COMPETITORS_KEY, JSON.stringify(list));
    this.notifyChange();
    return comp;
  }

  static deleteCompetitor(id: string) {
    const list = this.getCompetitors().filter(c => c.id !== id);
    localStorage.setItem(COMPETITORS_KEY, JSON.stringify(list));
    this.notifyChange();
  }

  // ========================================
  // 5. MPO Attendance with GPS & Selfie
  // ========================================
  static getAttendanceRecords(): MPOAttendance[] {
    try {
      const data = localStorage.getItem(ATTENDANCE_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load attendance', e);
    }
    return [];
  }

  static getTodayAttendance(officerId: string): MPOAttendance | null {
    const today = new Date().toISOString().split('T')[0];
    const list = this.getAttendanceRecords();
    return list.find(a => a.date === today && a.officerId === officerId) || null;
  }

  static checkIn(record: Omit<MPOAttendance, 'id' | 'createdAt' | 'updatedAt' | 'syncedToCloud'>): MPOAttendance {
    const list = this.getAttendanceRecords();
    const newRecord: MPOAttendance = {
      ...record,
      id: `ATT-${Date.now()}`,
      syncedToCloud: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    list.unshift(newRecord);
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(list));
    this.notifyChange();
    return newRecord;
  }

  static checkOut(id: string, checkOutData: {
    checkOutTime: string;
    checkOutLatitude?: number;
    checkOutLongitude?: number;
    checkOutAddress?: string;
    checkOutSelfieUrl?: string;
    totalWorkingMinutes?: number;
    daySummaryNotes?: string;
    kilometersTraveled?: number;
  }): MPOAttendance | null {
    const list = this.getAttendanceRecords();
    const idx = list.findIndex(a => a.id === id);
    if (idx >= 0) {
      list[idx] = {
        ...list[idx],
        ...checkOutData,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(list));
      this.notifyChange();
      return list[idx];
    }
    return null;
  }

  // ========================================
  // 6. Tour Plans (Daily Tour Planning / DTP)
  // ========================================
  static getTourPlans(): TourPlanItem[] {
    try {
      const data = localStorage.getItem(TOUR_PLANS_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load tour plans', e);
    }
    const today = new Date().toISOString().split('T')[0];
    const seed: TourPlanItem[] = [
      {
        id: 'DTP-001',
        planDate: today,
        officerId: 'USR-ADMIN-1',
        officerName: 'प्रमोद सावंत (Pramod Sawant)',
        routeNumber: 'RT-101',
        targetVillages: ['कवठेपिरान', 'भिलवडी'],
        targetCenters: ['कवठेपिरान संकलन केंद्र'],
        producersToVisit: [
          {
            producerCode: 'G-101',
            producerName: 'आनंदराव पाटील',
            village: 'कवठेपिरान',
            purpose: 'दूध वाढ व नवीन गोठा तपासणी',
            status: 'Completed',
            outcomeRemarks: 'दररोज २० लिटर दूध वाढवण्यास संमती दिली.',
          },
          {
            producerCode: 'G-103',
            producerName: 'सखाराम माने',
            village: 'भिलवडी',
            purpose: 'फॅट/SNF समस्या निवारण',
            status: 'Scheduled',
          },
        ],
        plannedCollectionLitersTarget: 2500,
        specialObjectives: 'स्पर्धक चितळे डेअरीकडे जाणाऱ्या २ मोठ्या उत्पादकांना पुन्हा जोडणे.',
        approvalStatus: 'Approved',
        approvedBy: 'जनरल मॅनेजर (GM Dairy)',
        actualVisitedCount: 1,
        completionPercentage: 50,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem(TOUR_PLANS_KEY, JSON.stringify(seed));
    return seed;
  }

  static saveTourPlan(plan: TourPlanItem): TourPlanItem {
    const list = this.getTourPlans();
    const idx = list.findIndex(p => p.id === plan.id);
    if (idx >= 0) {
      list[idx] = { ...plan, updatedAt: new Date().toISOString() };
    } else {
      list.unshift({ ...plan, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    localStorage.setItem(TOUR_PLANS_KEY, JSON.stringify(list));
    this.notifyChange();
    return plan;
  }

  static deleteTourPlan(id: string) {
    const list = this.getTourPlans().filter(p => p.id !== id);
    localStorage.setItem(TOUR_PLANS_KEY, JSON.stringify(list));
    this.notifyChange();
  }

  // ========================================
  // 7. Field Inspection Checklists (4 Types)
  // ========================================
  static getInspections(): InspectionChecklistRecord[] {
    try {
      const data = localStorage.getItem(INSPECTIONS_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load inspections', e);
    }
    const seed: InspectionChecklistRecord[] = [
      {
        id: 'INSP-001',
        inspectionType: 'milk_quality',
        referenceCode: 'QUAL-2026-081',
        date: '2026-08-20',
        time: '07:15 AM',
        targetName: 'कवठेपिरान दूध संकलन केंद्र (CC-101)',
        route: 'RT-101',
        village: 'कवठेपिरान',
        inspectorId: 'USR-ADMIN-1',
        inspectorName: 'प्रमोद सावंत (Pramod Sawant)',
        scorePercentage: 95,
        overallResult: 'Passed',
        organolepticSmellTaste: 'Normal',
        mbrtHours: 4.5,
        alcoholTest: 'Negative (Good)',
        adulterationUrea: 'Negative',
        adulterationDetergent: 'Negative',
        adulterationStarch: 'Negative',
        adulterationSalt: 'Negative',
        milkTemperatureC: 4.2,
        items: [
          { id: '1', category: 'Testing', parameter: 'Organoleptic Taste & Odor', expectedStandard: 'Fresh, No off-smell', actualFinding: 'Clean fresh milk taste', status: 'Pass' },
          { id: '2', category: 'Adulteration', parameter: 'Urea, Detergent, Starch Strip Test', expectedStandard: '100% Negative', actualFinding: 'All strips negative', status: 'Pass' },
          { id: '3', category: 'Temperature', parameter: 'Reception Milk Temp', expectedStandard: '< 5°C at BMC', actualFinding: '4.2°C logged', status: 'Pass' },
        ],
        actionPlan: 'नियमित सॅम्पल बॉटल्स उकळत्या पाण्यात स्वच्छ ठेवणे कायम ठेवावे.',
        inspectorSignature: 'Pramod Sawant (MPO)',
        inchargeSignature: 'Ashok Chavan (Secretary)',
        createdAt: '2026-08-20T07:30:00Z',
        updatedAt: '2026-08-20T07:30:00Z',
      },
      {
        id: 'INSP-002',
        inspectionType: 'chilling_center',
        referenceCode: 'CHILL-2026-042',
        date: '2026-08-19',
        time: '04:00 PM',
        targetName: 'इस्लामपूर लिंक व चिलिंग केंद्र (LC-02)',
        route: 'RT-104',
        village: 'इस्लामपूर',
        inspectorId: 'USR-ADMIN-1',
        inspectorName: 'प्रमोद सावंत (Pramod Sawant)',
        scorePercentage: 88,
        overallResult: 'Passed',
        bmcTemperatureC: 3.8,
        powerBackupStatus: 'Working',
        cipSanitationDone: true,
        items: [
          { id: '1', category: 'Chilling', parameter: 'BMC Cooling Speed', expectedStandard: '35°C to 4°C in < 2 hrs', actualFinding: 'Cooled in 1 hr 45 min', status: 'Pass' },
          { id: '2', category: 'CIP', parameter: 'Alkali + Acid Hot Wash', expectedStandard: 'Daily after tanker dispatch', actualFinding: 'CIP log verified and signed', status: 'Pass' },
          { id: '3', category: 'Generator', parameter: 'Diesel Generator Backup', expectedStandard: 'Min 50L diesel reserve', actualFinding: 'DG set tested, diesel reserve ok', status: 'Pass' },
        ],
        actionPlan: 'बीएमसी तापमान लॉगबुकवर प्रति तास तापमान नोंद करणे.',
        inspectorSignature: 'Pramod Sawant (MPO)',
        createdAt: '2026-08-19T16:30:00Z',
        updatedAt: '2026-08-19T16:30:00Z',
      },
    ];
    localStorage.setItem(INSPECTIONS_KEY, JSON.stringify(seed));
    return seed;
  }

  static saveInspection(insp: InspectionChecklistRecord): InspectionChecklistRecord {
    const list = this.getInspections();
    const idx = list.findIndex(i => i.id === insp.id);
    if (idx >= 0) {
      list[idx] = { ...insp, updatedAt: new Date().toISOString() };
    } else {
      list.unshift({ ...insp, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    localStorage.setItem(INSPECTIONS_KEY, JSON.stringify(list));
    this.notifyChange();
    return insp;
  }

  static deleteInspection(id: string) {
    const list = this.getInspections().filter(i => i.id !== id);
    localStorage.setItem(INSPECTIONS_KEY, JSON.stringify(list));
    this.notifyChange();
  }

  // ========================================
  // 8. Dairy Notices & Circulars
  // ========================================
  static getNotices(): DairyNotice[] {
    try {
      const data = localStorage.getItem(NOTICES_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load notices', e);
    }
    const seed: DairyNotice[] = [
      {
        id: 'NOT-01',
        noticeNumber: 'NOT-2026-081',
        title: 'Cow Milk Rate Increase from 1st September',
        marathiTitle: 'गाय दुधाच्या खरेदी दरात प्रति लिटर ₹१.५० ची वाढ',
        category: 'Rate Revision',
        content: 'Dear Milk Producers, In view of rising cattle feed costs and upcoming festive season, our dairy has increased cow milk procurement base rate by Rs 1.50 per liter with effect from 1st September 2026.',
        marathiContent: 'सर्व सन्माननीय दूध उत्पादक (गवळी) बंधूंना कळविण्यात येते की, पशुखाद्याच्या किमती व आगामी सणासुदीचा काळ लक्षात घेऊन १ सप्टेंबर २०२६ पासून गाय दुधाच्या खरेदी दरात प्रति लिटर ₹१.५० ची वाढ करण्यात येत आहे.',
        issuedDate: '2026-08-20',
        effectiveFrom: '2026-09-01',
        targetAudience: 'All Producers',
        targetRoutes: ['all'],
        isUrgent: true,
        issuedBy: 'व्यवस्थापकीय संचालक (MD Dairy)',
        isActive: true,
        viewCount: 142,
        createdAt: '2026-08-20T09:00:00Z',
      },
      {
        id: 'NOT-02',
        noticeNumber: 'NOT-2026-075',
        title: 'Clean Milk Production and FSSAI Registration Drive',
        marathiTitle: 'स्वच्छ दूध उत्पादन व FSSAI परवाना नोंदणी विशेष मोहीम',
        category: 'Quality Advisory',
        content: 'All milk collection centers and producers must ensure FSSAI registration. MPOs will assist in on-the-spot registration at village centers.',
        marathiContent: 'सर्व संकलन केंद्रे व दूध उत्पादकांनी आपला FSSAI परवाना नूतनीकरण करून घ्यावा. MPO अधिकारी आपल्या गावात थेट नोंदणी सहाय्य करतील.',
        issuedDate: '2026-08-15',
        effectiveFrom: '2026-08-15',
        targetAudience: 'All Producers',
        targetRoutes: ['all'],
        isUrgent: false,
        issuedBy: 'गुणवत्ता नियंत्रण विभाग (QC Department)',
        isActive: true,
        viewCount: 98,
        createdAt: '2026-08-15T10:00:00Z',
      },
    ];
    localStorage.setItem(NOTICES_KEY, JSON.stringify(seed));
    return seed;
  }

  static saveNotice(notice: DairyNotice): DairyNotice {
    const list = this.getNotices();
    const idx = list.findIndex(n => n.id === notice.id);
    if (idx >= 0) {
      list[idx] = notice;
    } else {
      list.unshift(notice);
    }
    localStorage.setItem(NOTICES_KEY, JSON.stringify(list));
    this.notifyChange();
    return notice;
  }

  static deleteNotice(id: string) {
    const list = this.getNotices().filter(n => n.id !== id);
    localStorage.setItem(NOTICES_KEY, JSON.stringify(list));
    this.notifyChange();
  }

  // ========================================
  // 9. Complaints & Producer Grievance Requests
  // ========================================
  static getComplaints(): ProducerComplaint[] {
    try {
      const data = localStorage.getItem(COMPLAINTS_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load complaints', e);
    }
    const seed: ProducerComplaint[] = [
      {
        id: 'TKT-001',
        ticketNumber: 'TKT-2026-101',
        producerCode: 'G-101',
        producerName: 'आनंदराव पाटील (Anandrao Patil)',
        mobileNumber: '9822112233',
        route: 'RT-101',
        village: 'कवठेपिरान',
        collectionCenter: 'कवठेपिरान दूध संकलन केंद्र',
        complaintType: 'Fat/SNF Dispute',
        priority: 'High',
        subject: 'संध्याकाळच्या सत्रात फॅट कमी लागल्याची तक्रार',
        details: 'काल संध्याकाळी दुधाची फॅट ३.८ ऐवजी ३.३ दाखवली गेली. विश्लेषक कॅलिब्रेशन तपासणीची विनंती.',
        lodgedDate: '2026-08-20',
        slaDueDate: '2026-08-22',
        assignedOfficerId: 'USR-ADMIN-1',
        assignedOfficerName: 'प्रमोद सावंत (Pramod Sawant)',
        status: 'Under Investigation',
        resolutionNotes: 'केंद्रावरील मिल्क अ‍ॅनालायझरचे ऑटो-कॅलिब्रेशन केले. पुन्हा सॅम्पल घेऊन तपासणी सुरू आहे.',
        createdAt: '2026-08-20T08:00:00Z',
        updatedAt: '2026-08-20T11:00:00Z',
      },
      {
        id: 'TKT-002',
        ticketNumber: 'TKT-2026-102',
        producerCode: 'G-102',
        producerName: 'तुकाराम जाधव (Tukaram Jadhav)',
        mobileNumber: '9822334455',
        route: 'RT-104',
        village: 'बहे',
        collectionCenter: 'बहे दूध संकलन केंद्र',
        complaintType: 'Cattle Feed Delivery',
        priority: 'Medium',
        subject: '१० पोती सरकी पेंड (Cattle Feed) मागणी',
        details: 'गोठ्यासाठी उच्च दर्जाची सरकी पेंड दूध बिलावर क्रेडिटवर उपलब्ध करून देणे.',
        lodgedDate: '2026-08-19',
        slaDueDate: '2026-08-21',
        assignedOfficerId: 'USR-ADMIN-1',
        assignedOfficerName: 'प्रमोद सावंत (Pramod Sawant)',
        status: 'Resolved',
        resolutionNotes: 'गोदाम व्यवस्थापकाकडून १० पोती सरकी पेंड गाडीद्वारे बहे केंद्रावर पाठवली.',
        resolvedDate: '2026-08-20',
        resolvedBy: 'प्रमोद सावंत',
        producerSatisfied: true,
        createdAt: '2026-08-19T10:30:00Z',
        updatedAt: '2026-08-20T12:00:00Z',
      },
    ];
    localStorage.setItem(COMPLAINTS_KEY, JSON.stringify(seed));
    return seed;
  }

  static saveComplaint(comp: ProducerComplaint): ProducerComplaint {
    const list = this.getComplaints();
    const idx = list.findIndex(c => c.id === comp.id);
    if (idx >= 0) {
      list[idx] = { ...comp, updatedAt: new Date().toISOString() };
    } else {
      list.unshift({ ...comp, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    localStorage.setItem(COMPLAINTS_KEY, JSON.stringify(list));
    this.notifyChange();
    return comp;
  }

  static deleteComplaint(id: string) {
    const list = this.getComplaints().filter(c => c.id !== id);
    localStorage.setItem(COMPLAINTS_KEY, JSON.stringify(list));
    this.notifyChange();
  }

  // ========================================
  // 10. Admin / Manager Approvals Workflow
  // ========================================
  static getApprovals(): ApprovalRequest[] {
    try {
      const data = localStorage.getItem(APPROVALS_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load approvals', e);
    }
    const seed: ApprovalRequest[] = [
      {
        id: 'APP-001',
        requestType: 'Advance/Loan Sanction',
        referenceId: 'ADV-2026-09',
        title: 'आनंदराव पाटील - ₹५०,००० चारा व शेड सुधारणा अग्रिम उचल',
        description: 'दररोज २००+ लिटर दूध पुरवठादार. १० हप्त्यांमध्ये दूध बिलातून कपात केली जाईल.',
        requestedById: 'USR-ADMIN-1',
        requestedByName: 'प्रमोद सावंत (MPO)',
        requestedDate: '2026-08-19',
        amount: 50000,
        route: 'RT-101',
        producerCode: 'G-101',
        urgency: 'High',
        status: 'Approved',
        actionTakenBy: 'मॅनेजर (GM Procurement)',
        actionDate: '2026-08-20',
        actionRemarks: 'उत्पादकाची दूध पुरवठा विश्वासार्हता पाहून उचल मंजूर करण्यात आली.',
        createdAt: '2026-08-19T14:00:00Z',
        updatedAt: '2026-08-20T10:00:00Z',
      },
      {
        id: 'APP-002',
        requestType: 'Equipment Replacement',
        referenceId: 'EQ-2026-44',
        title: 'बहे संकलन केंद्रावर नवीन डिजिटल वजनकाटा (Weigh Scale) मंजुरी',
        description: 'जुना काटा एरर देत असल्याने तात्काळ बदलून देणे आवश्यक.',
        requestedById: 'USR-ADMIN-1',
        requestedByName: 'प्रमोद सावंत (MPO)',
        requestedDate: '2026-08-20',
        amount: 8500,
        route: 'RT-104',
        urgency: 'Urgent',
        status: 'Pending',
        createdAt: '2026-08-20T11:00:00Z',
        updatedAt: '2026-08-20T11:00:00Z',
      },
    ];
    localStorage.setItem(APPROVALS_KEY, JSON.stringify(seed));
    return seed;
  }

  static saveApproval(app: ApprovalRequest): ApprovalRequest {
    const list = this.getApprovals();
    const idx = list.findIndex(a => a.id === app.id);
    if (idx >= 0) {
      list[idx] = { ...app, updatedAt: new Date().toISOString() };
    } else {
      list.unshift({ ...app, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    localStorage.setItem(APPROVALS_KEY, JSON.stringify(list));
    this.notifyChange();
    return app;
  }

  // ========================================
  // 11. FSSAI Expiry Alerts Engine
  // ========================================
  static getFssaiExpiryAlerts(): {
    producersExpiringSoon: Farmer[];
    producersExpired: Farmer[];
    centersExpiringSoon: (LinkCenter | CollectionCenter)[];
    centersExpired: (LinkCenter | CollectionCenter)[];
  } {
    const farmers = StorageService.getFarmers();
    const linkCenters = this.getLinkCenters();
    const collectionCenters = this.getCollectionCenters();

    const today = new Date();
    const thirtyDaysAhead = new Date();
    thirtyDaysAhead.setDate(today.getDate() + 30);

    const producersExpiringSoon: Farmer[] = [];
    const producersExpired: Farmer[] = [];

    farmers.forEach(f => {
      if (f.fssaiExpiryDate) {
        const exp = new Date(f.fssaiExpiryDate);
        if (exp < today) {
          producersExpired.push(f);
        } else if (exp <= thirtyDaysAhead) {
          producersExpiringSoon.push(f);
        }
      }
    });

    const centersExpiringSoon: (LinkCenter | CollectionCenter)[] = [];
    const centersExpired: (LinkCenter | CollectionCenter)[] = [];

    [...linkCenters, ...collectionCenters].forEach(c => {
      if (c.fssaiExpiryDate) {
        const exp = new Date(c.fssaiExpiryDate);
        if (exp < today) {
          centersExpired.push(c);
        } else if (exp <= thirtyDaysAhead) {
          centersExpiringSoon.push(c);
        }
      }
    });

    return {
      producersExpiringSoon,
      producersExpired,
      centersExpiringSoon,
      centersExpired,
    };
  }

  static updateTourApproval(id: string, status: 'Approved' | 'Rejected', approverName: string, remarks?: string): TourPlanItem | null {
    const list = this.getTourPlans();
    const idx = list.findIndex(p => p.id === id);
    if (idx >= 0) {
      list[idx] = {
        ...list[idx],
        approvalStatus: status,
        approvedBy: approverName,
        approvalRemarks: remarks,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(TOUR_PLANS_KEY, JSON.stringify(list));
      this.notifyChange();
      return list[idx];
    }
    return null;
  }

  // ========================================
  // 12. MPO Task Reminders
  // ========================================
  static getTasks(): any[] {
    try {
      const data = localStorage.getItem('dairy_mpo_tasks');
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load MPO tasks', e);
    }
    const seed = [
      {
        id: 'TSK-01',
        officerId: 'USR-ADMIN-1',
        title: 'कवठेपिरान दूध संकलन केंद्र वजनकाटा कॅलिब्रेशन तपासणी',
        dueDate: new Date().toISOString().split('T')[0],
        priority: 'High',
        isCompleted: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'TSK-02',
        officerId: 'USR-ADMIN-1',
        title: 'इस्लामपूर चिलिंग सेंटर FSSAI रिन्यूअल फॉर्म जमा करणे',
        dueDate: new Date().toISOString().split('T')[0],
        priority: 'High',
        isCompleted: false,
        createdAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem('dairy_mpo_tasks', JSON.stringify(seed));
    return seed;
  }

  static saveTask(task: any): any {
    const list = this.getTasks();
    const idx = list.findIndex(t => t.id === task.id);
    if (idx >= 0) {
      list[idx] = task;
    } else {
      list.unshift(task);
    }
    localStorage.setItem('dairy_mpo_tasks', JSON.stringify(list));
    this.notifyChange();
    return task;
  }

  static deleteTask(id: string) {
    const list = this.getTasks().filter(t => t.id !== id);
    localStorage.setItem('dairy_mpo_tasks', JSON.stringify(list));
    this.notifyChange();
  }
}
