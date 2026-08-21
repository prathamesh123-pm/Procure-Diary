import { ProducerSurvey, SurveyDashboardMetrics, SurveyStatus, DeviceInstallStatus, Farmer } from '../types';
import { StorageService } from './storageService';

const SURVEYS_STORAGE_KEY = 'dairy_producer_surveys';
const SURVEY_SYNC_LOG_KEY = 'dairy_producer_surveys_sync_log';

// Pre-seeded comprehensive realistic surveys linked with initial farmers
const INITIAL_SURVEYS: ProducerSurvey[] = [
  {
    id: 'SURV-001',
    producerId: 'F-101',
    producerCode: 'F-101',
    producerName: 'तानाजी विठ्ठल पाटील (Tanaji Patil)',
    mobileNumber: '9822012345',
    alternateNumber: '9421098765',
    village: 'Madhavnagar',
    taluka: 'Miraj',
    district: 'Sangli',
    fullAddress: 'Near Maruti Mandir, Madhavnagar, Sangli 416406',
    latitude: 16.8924,
    longitude: 74.6041,
    gpsAccuracy: 4.2,
    route: 'RT-101',
    linkCenter: 'Sangli Main Link Center',
    collectionCenter: 'Madhavnagar Center 1',
    milkType: 'Cow',
    surveyDate: '2026-08-18',
    surveyedBy: 'Ramesh Patil (संकलन अधिकारी)',
    surveyedById: 'USR-OFFICER-1',
    surveyStatus: 'Completed',
    deviceStatus: 'Installed',
    deviceInstallationDate: '2026-08-18',
    deviceSerialNumber: 'MILK-IOT-9921',
    deviceModel: 'SmartFAT Digital Milk Analyzer & Auto-Stirrer Pro',
    dailyMilkPotential: 50,
    cattleCount: 10,
    surveyRemarks: 'Modern dairy farm with clean chilling setup. Solar backup available.',
    isActiveProducer: true,
    syncedToCloud: true,
    cloudSyncTime: '2026-08-18T11:45:00.000Z',
    createdAt: '2026-08-18T10:30:00.000Z',
    updatedAt: '2026-08-18T11:45:00.000Z',
    documents: [
      {
        id: 'DOC-1',
        name: 'Aadhaar Card Copy',
        type: 'Aadhaar',
        uploadedAt: '2026-08-18T10:32:00.000Z',
      },
      {
        id: 'DOC-2',
        name: 'FSSAI License Certificate',
        type: 'FSSAI',
        uploadedAt: '2026-08-18T10:33:00.000Z',
      },
    ],
  },
  {
    id: 'SURV-002',
    producerId: 'F-102',
    producerCode: 'F-102',
    producerName: 'सुभाष रघुनाथ शिंदे (Subhash Shinde)',
    mobileNumber: '9850123456',
    village: 'Budhgaon',
    taluka: 'Miraj',
    district: 'Sangli',
    fullAddress: 'Gat No 214, Budhgaon Shivar, Budhgaon 416304',
    latitude: 16.9082,
    longitude: 74.6321,
    gpsAccuracy: 5.1,
    route: 'RT-101',
    linkCenter: 'Sangli Main Link Center',
    collectionCenter: 'Budhgaon Main Dairy',
    milkType: 'Buffalo',
    surveyDate: '2026-08-19',
    surveyedBy: 'Ramesh Patil (संकलन अधिकारी)',
    surveyedById: 'USR-OFFICER-1',
    surveyStatus: 'Completed',
    deviceStatus: 'Installed',
    deviceInstallationDate: '2026-08-19',
    deviceSerialNumber: 'MILK-IOT-9944',
    deviceModel: 'SmartFAT Digital Analyzer + Thermal Receipt Printer',
    dailyMilkPotential: 35,
    cattleCount: 6,
    surveyRemarks: 'High FAT Murrah buffalo breed. Stable morning-evening supply.',
    isActiveProducer: true,
    syncedToCloud: true,
    cloudSyncTime: '2026-08-19T14:10:00.000Z',
    createdAt: '2026-08-19T13:40:00.000Z',
    updatedAt: '2026-08-19T14:10:00.000Z',
  },
  {
    id: 'SURV-003',
    producerId: 'F-103',
    producerCode: 'F-103',
    producerName: 'प्रकाश बापू मोहिते (Prakash Mohite)',
    mobileNumber: '9763234567',
    alternateNumber: '9922334455',
    village: 'Karnal',
    taluka: 'Miraj',
    district: 'Sangli',
    fullAddress: 'Mohite Vasti, Near Krishna River Canal, Karnal',
    latitude: 16.8831,
    longitude: 74.5829,
    gpsAccuracy: 3.8,
    route: 'RT-101',
    linkCenter: 'Sangli Main Link Center',
    collectionCenter: 'Karnal Shivar Center',
    milkType: 'Both',
    surveyDate: '2026-08-20',
    surveyedBy: 'Santosh Shinde (संकलन अधिकारी)',
    surveyedById: 'USR-OFFICER-2',
    surveyStatus: 'Pending',
    deviceStatus: 'Pending',
    dailyMilkPotential: 40,
    cattleCount: 7,
    surveyRemarks: 'Shed expansion in progress. Online device installation scheduled for next week.',
    isActiveProducer: true,
    syncedToCloud: true,
    cloudSyncTime: '2026-08-20T16:00:00.000Z',
    createdAt: '2026-08-20T15:20:00.000Z',
    updatedAt: '2026-08-20T16:00:00.000Z',
  },
  {
    id: 'SURV-004',
    producerId: 'F-104',
    producerCode: 'F-104',
    producerName: 'आनंदराव कृष्णा कदम (Anandrao Kadam)',
    mobileNumber: '9422045678',
    village: 'Walwa',
    taluka: 'Walwa',
    district: 'Sangli',
    fullAddress: 'Near Old Grampanchayat, Walwa 416313',
    latitude: 17.0392,
    longitude: 74.3418,
    gpsAccuracy: 6.0,
    route: 'RT-102',
    linkCenter: 'Islampur Chilling Link',
    collectionCenter: 'Walwa Gram Dairy',
    milkType: 'Cow',
    surveyDate: '2026-08-17',
    surveyedBy: 'Santosh Shinde (संकलन अधिकारी)',
    surveyedById: 'USR-OFFICER-2',
    surveyStatus: 'Revisit Required',
    deviceStatus: 'Pending',
    dailyMilkPotential: 25,
    cattleCount: 4,
    surveyRemarks: 'Producer requested revisit after vet checks cow vaccination & feed quality.',
    isActiveProducer: false,
    syncedToCloud: true,
    cloudSyncTime: '2026-08-17T18:00:00.000Z',
    createdAt: '2026-08-17T17:15:00.000Z',
    updatedAt: '2026-08-17T18:00:00.000Z',
  },
  {
    id: 'SURV-005',
    producerId: 'F-105',
    producerCode: 'F-105',
    producerName: 'संजय दत्तात्रय जाधव (Sanjay Jadhav)',
    mobileNumber: '9970156789',
    alternateNumber: '9822445566',
    village: 'Shirala',
    taluka: 'Shirala',
    district: 'Sangli',
    fullAddress: 'Bazaar Galli, Opp Union Bank, Shirala 415408',
    latitude: 16.9856,
    longitude: 74.1293,
    gpsAccuracy: 4.5,
    route: 'RT-103',
    linkCenter: 'Shirala BMC Link',
    collectionCenter: 'Shirala Western Center',
    milkType: 'Buffalo',
    surveyDate: '2026-08-19',
    surveyedBy: 'Ramesh Patil (संकलन अधिकारी)',
    surveyedById: 'USR-OFFICER-1',
    surveyStatus: 'Completed',
    deviceStatus: 'Installed',
    deviceInstallationDate: '2026-08-19',
    deviceSerialNumber: 'MILK-IOT-8812',
    deviceModel: 'Online Auto DPU & Electronic Weigh Scale Sync',
    dailyMilkPotential: 30,
    cattleCount: 5,
    surveyRemarks: 'Satisfactory milk density and automated collection center sync verified.',
    isActiveProducer: true,
    syncedToCloud: true,
    cloudSyncTime: '2026-08-19T17:20:00.000Z',
    createdAt: '2026-08-19T16:45:00.000Z',
    updatedAt: '2026-08-19T17:20:00.000Z',
  },
  {
    id: 'SURV-006',
    producerId: 'F-106',
    producerCode: 'F-106',
    producerName: 'दिलीप रामराव चव्हाण (Dilip Chavan)',
    mobileNumber: '9823456789',
    village: 'Miraj',
    taluka: 'Miraj',
    district: 'Sangli',
    fullAddress: 'Malgaon Road, Miraj Rural Belt, Miraj 416410',
    latitude: 16.8378,
    longitude: 74.6482,
    gpsAccuracy: 5.5,
    route: 'RT-104',
    linkCenter: 'Miraj Bulk Cooler Link',
    collectionCenter: 'Miraj Eastern Center',
    milkType: 'Cow',
    surveyDate: '2026-08-20',
    surveyedBy: 'Santosh Shinde (संकलन अधिकारी)',
    surveyedById: 'USR-OFFICER-2',
    surveyStatus: 'Pending',
    deviceStatus: 'Pending',
    dailyMilkPotential: 20,
    cattleCount: 3,
    surveyRemarks: 'New producer registered. Pending first 10 days procurement trial.',
    isActiveProducer: true,
    syncedToCloud: true,
    cloudSyncTime: '2026-08-20T18:30:00.000Z',
    createdAt: '2026-08-20T18:00:00.000Z',
    updatedAt: '2026-08-20T18:30:00.000Z',
  },
];

export const SurveyService = {
  /**
   * Get all Producer Surveys from persistent storage
   */
  getSurveys: (): ProducerSurvey[] => {
    try {
      const stored = localStorage.getItem(SURVEYS_STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(SURVEYS_STORAGE_KEY, JSON.stringify(INITIAL_SURVEYS));
        return INITIAL_SURVEYS;
      }
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error reading producer surveys from storage:', e);
      return INITIAL_SURVEYS;
    }
  },

  /**
   * Save or update a Producer Survey
   */
  saveSurvey: (survey: ProducerSurvey): ProducerSurvey => {
    const surveys = SurveyService.getSurveys();
    const existingIndex = surveys.findIndex(s => s.id === survey.id);

    const now = new Date().toISOString();
    const updatedSurvey: ProducerSurvey = {
      ...survey,
      updatedAt: now,
      syncedToCloud: true,
      cloudSyncTime: now,
    };

    if (existingIndex >= 0) {
      surveys[existingIndex] = updatedSurvey;
    } else {
      surveys.unshift({
        ...updatedSurvey,
        createdAt: survey.createdAt || now,
      });
    }

    try {
      localStorage.setItem(SURVEYS_STORAGE_KEY, JSON.stringify(surveys));
      window.dispatchEvent(new Event('dairy_storage_updated'));
      window.dispatchEvent(new Event('dairy_survey_updated'));
    } catch (e) {
      console.error('Error saving survey to storage:', e);
    }

    return updatedSurvey;
  },

  /**
   * Delete a Producer Survey by ID
   */
  deleteSurvey: (id: string): boolean => {
    const surveys = SurveyService.getSurveys();
    const filtered = surveys.filter(s => s.id !== id);
    try {
      localStorage.setItem(SURVEYS_STORAGE_KEY, JSON.stringify(filtered));
      window.dispatchEvent(new Event('dairy_storage_updated'));
      window.dispatchEvent(new Event('dairy_survey_updated'));
      return true;
    } catch (e) {
      console.error('Error deleting survey:', e);
      return false;
    }
  },

  /**
   * Bulk import / sync surveys
   */
  bulkSaveSurveys: (incomingSurveys: ProducerSurvey[]): void => {
    try {
      localStorage.setItem(SURVEYS_STORAGE_KEY, JSON.stringify(incomingSurveys));
      window.dispatchEvent(new Event('dairy_storage_updated'));
      window.dispatchEvent(new Event('dairy_survey_updated'));
    } catch (e) {
      console.error('Error in bulk saving surveys:', e);
    }
  },

  /**
   * Auto-generate or populate a survey draft from an existing Gavali / Farmer record
   */
  createSurveyFromFarmer: (farmer: Farmer, officerName: string, officerId?: string): ProducerSurvey => {
    const today = new Date().toISOString().split('T')[0];
    const defaultTaluka =
      farmer.village.toLowerCase().includes('walwa') || farmer.village.toLowerCase().includes('islampur')
        ? 'Walwa'
        : farmer.village.toLowerCase().includes('shirala')
        ? 'Shirala'
        : 'Miraj';

    return {
      id: `SURV-${Date.now()}`,
      producerId: farmer.id,
      producerCode: farmer.farmerCode,
      producerName: farmer.farmerName,
      mobileNumber: farmer.mobileNumber,
      alternateNumber: farmer.alternateNumber || '',
      village: farmer.village,
      taluka: defaultTaluka,
      district: 'Sangli',
      fullAddress: farmer.address || `${farmer.village}, Taluka ${defaultTaluka}, Dist Sangli`,
      route: farmer.route,
      linkCenter: farmer.linkCenter || `${farmer.route} Link Center`,
      collectionCenter: farmer.collectionCenter || `${farmer.village} Center`,
      milkType: farmer.milkType,
      surveyDate: today,
      surveyedBy: officerName || 'संकलन अधिकारी (Procurement Executive)',
      surveyedById: officerId,
      surveyStatus: 'Completed',
      deviceStatus: 'Installed',
      deviceInstallationDate: today,
      deviceSerialNumber: `MILK-IOT-${Math.floor(1000 + Math.random() * 9000)}`,
      deviceModel: 'SmartFAT Digital Analyzer + Direct Cloud Weigh Scale',
      dailyMilkPotential: farmer.dailyMilkQuantity || 25,
      cattleCount: farmer.cattleCount || 4,
      surveyRemarks: farmer.remarks || 'Standard verified milk producer.',
      isActiveProducer: farmer.status === 'Active',
      syncedToCloud: true,
      cloudSyncTime: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  /**
   * Compute comprehensive dashboard metrics
   */
  getMetrics: (surveysList?: ProducerSurvey[]): SurveyDashboardMetrics => {
    const surveys = surveysList || SurveyService.getSurveys();
    const totalProducers = surveys.length;
    const totalSurveysCompleted = surveys.filter(s => s.surveyStatus === 'Completed').length;
    const totalSurveysPending = surveys.filter(s => s.surveyStatus === 'Pending').length;
    const totalSurveysRevisit = surveys.filter(s => s.surveyStatus === 'Revisit Required').length;
    const totalDeviceInstalled = surveys.filter(s => s.deviceStatus === 'Installed').length;
    const totalDevicePending = surveys.filter(s => s.deviceStatus === 'Pending').length;
    const totalDeviceNotRequired = surveys.filter(s => s.deviceStatus === 'Not Required').length;
    const totalActiveProducers = surveys.filter(s => s.isActiveProducer).length;
    const totalInactiveProducers = totalProducers - totalActiveProducers;
    const completionRate = totalProducers > 0 ? Math.round((totalSurveysCompleted / totalProducers) * 100) : 0;

    return {
      totalProducers,
      totalSurveysCompleted,
      totalSurveysPending,
      totalSurveysRevisit,
      totalDeviceInstalled,
      totalDevicePending,
      totalDeviceNotRequired,
      totalActiveProducers,
      totalInactiveProducers,
      completionRate,
    };
  },

  /**
   * Helper to fetch real-time device GPS coordinates
   */
  getCurrentGpsLocation: (): Promise<{ latitude: number; longitude: number; accuracy: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        position => {
          resolve({
            latitude: Number(position.coords.latitude.toFixed(6)),
            longitude: Number(position.coords.longitude.toFixed(6)),
            accuracy: Number(position.coords.accuracy.toFixed(1)),
          });
        },
        error => {
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  },
};
