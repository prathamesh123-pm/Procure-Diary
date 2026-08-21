import {
  Farmer,
  RouteItem,
  CallRecord,
  IncomingCallRecord,
  PendingTask,
  TaskStatus,
  FollowUpItem,
  User,
  LoginHistoryEntry,
  AppNotification,
} from '../types';

// Initial realistic default data for Dairy Operations
const INITIAL_ROUTES: RouteItem[] = [
  {
    id: 'R-01',
    routeNumber: 'RT-101',
    routeName: 'Sangli - Madhavnagar Route',
    village: 'Madhavnagar, Budhgaon, Karnal',
    area: 'Sangli North',
    description: 'Morning & Evening primary cow milk collection line',
    status: 'active',
    centerCount: 8,
    assignedOfficerId: 'USR-OFFICER-1',
    createdAt: '2026-01-10T08:00:00.000Z',
  },
  {
    id: 'R-02',
    routeNumber: 'RT-102',
    routeName: 'Walwa - Islampur Expressway Route',
    village: 'Islampur, Walwa, Kasegaon, Nerle',
    area: 'Walwa Taluka',
    description: 'High volume Buffalo & Cow milk cooperative corridor',
    status: 'active',
    centerCount: 12,
    assignedOfficerId: 'USR-OFFICER-2',
    createdAt: '2026-01-10T08:00:00.000Z',
  },
  {
    id: 'R-03',
    routeNumber: 'RT-103',
    routeName: 'Shirala Foothill Route',
    village: 'Shirala, Bilashi, Mangle, Kokrud',
    area: 'Shirala West',
    description: 'Hilly route with smallholder dairy producers',
    status: 'active',
    centerCount: 6,
    assignedOfficerId: 'USR-OFFICER-1',
    createdAt: '2026-01-12T08:00:00.000Z',
  },
  {
    id: 'R-04',
    routeNumber: 'RT-104',
    routeName: 'Miraj - Arag Border Route',
    village: 'Miraj, Arag, Bedag, Malgaon',
    area: 'Miraj East',
    description: 'Bulk chilling center feeder route',
    status: 'active',
    centerCount: 10,
    assignedOfficerId: 'USR-SUPERVISOR-1',
    createdAt: '2026-01-15T08:00:00.000Z',
  },
  {
    id: 'R-05',
    routeNumber: 'RT-105',
    routeName: 'Tasgaon Grape & Dairy Belt',
    village: 'Tasgaon, Savlaj, Manerajuri, Kumthe',
    area: 'Tasgaon Central',
    description: 'Rapidly growing crossbred cow collection belt',
    status: 'active',
    centerCount: 9,
    assignedOfficerId: 'USR-OFFICER-2',
    createdAt: '2026-01-20T08:00:00.000Z',
  },
];

const INITIAL_FARMERS: Farmer[] = [
  {
    id: 'F-101',
    farmerCode: 'F-101',
    farmerName: 'तानाजी विठ्ठल पाटील (Tanaji Patil)',
    mobileNumber: '9822012345',
    alternateNumber: '9421098765',
    village: 'Madhavnagar',
    route: 'RT-101',
    routeGroupName: 'Sangli North Dairy Belt',
    collectionCenter: 'Madhavnagar Center 1',
    milkType: 'Cow',
    supplierType: 'Gavali',
    dailyMilkQuantity: 45,
    morningMilkQty: 25,
    eveningMilkQty: 20,
    avgFat: 3.9,
    avgSNF: 8.6,
    currentRate: 39.70,
    cattleCount: 10,
    fssaiNumber: '11524036000123',
    fssaiExpiryDate: '2027-08-31',
    fssaiStatus: 'Active',
    inaphTagNumbers: ['100234567891', '100234567892', '100234567893'],
    cleanMilkCert: true,
    vaccinationStatus: 'Fully Vaccinated',
    bankName: 'Bank of Maharashtra',
    bankAccountNumber: '60123456789',
    ifscCode: 'MAHB0000123',
    aadhaarNumber: 'XXXX-XXXX-4589',
    panNumber: 'ABCDE1234F',
    advanceBalance: 0,
    status: 'Active',
    remarks: 'Regular high-quality HF cow milk supplier. 10 cows in modern shed.',
    isFavorite: true,
    address: 'Near Maruti Mandir, Madhavnagar, Sangli',
    createdAt: '2026-01-05T06:00:00.000Z',
    updatedAt: '2026-02-01T06:00:00.000Z',
  },
  {
    id: 'F-102',
    farmerCode: 'F-102',
    farmerName: 'सुभाष रघुनाथ शिंदे (Subhash Shinde)',
    mobileNumber: '9850123456',
    alternateNumber: '',
    village: 'Budhgaon',
    route: 'RT-101',
    routeGroupName: 'Sangli North Dairy Belt',
    collectionCenter: 'Budhgaon Main Dairy',
    milkType: 'Buffalo',
    supplierType: 'Gavali',
    dailyMilkQuantity: 28,
    morningMilkQty: 15,
    eveningMilkQty: 13,
    avgFat: 7.8,
    avgSNF: 9.1,
    currentRate: 72.50,
    cattleCount: 6,
    fssaiNumber: '11523038000456',
    fssaiExpiryDate: '2026-11-15',
    fssaiStatus: 'Active',
    inaphTagNumbers: ['100234567894', '100234567895'],
    cleanMilkCert: true,
    vaccinationStatus: 'Fully Vaccinated',
    bankName: 'Sangli DCC Bank',
    bankAccountNumber: '1029384756',
    ifscCode: 'SDCC0000045',
    aadhaarNumber: 'XXXX-XXXX-8921',
    panNumber: 'BKDPS5678G',
    advanceBalance: 5000,
    status: 'Active',
    remarks: 'High FAT (8.2+) Murrah buffalo milk producer.',
    isFavorite: true,
    address: 'Gat No 214, Budhgaon Shivar',
    createdAt: '2026-01-06T06:00:00.000Z',
    updatedAt: '2026-02-05T06:00:00.000Z',
  },
  {
    id: 'F-103',
    farmerCode: 'F-103',
    farmerName: 'प्रकाश बापू मोहिते (Prakash Mohite)',
    mobileNumber: '9763234567',
    alternateNumber: '9922334455',
    village: 'Islampur',
    route: 'RT-102',
    routeGroupName: 'Walwa-Islampur Milk Corridor',
    collectionCenter: 'Islampur Hub B',
    milkType: 'Both',
    supplierType: 'Bulk Supplier',
    dailyMilkQuantity: 65,
    morningMilkQty: 35,
    eveningMilkQty: 30,
    avgFat: 4.0,
    avgSNF: 8.6,
    currentRate: 40.20,
    cattleCount: 16,
    fssaiNumber: '11522045000789',
    fssaiExpiryDate: '2026-09-30',
    fssaiStatus: 'Expiring Soon',
    inaphTagNumbers: ['100234567896', '100234567897', '100234567898'],
    cleanMilkCert: true,
    vaccinationStatus: 'Fully Vaccinated',
    bankName: 'State Bank of India',
    bankAccountNumber: '30495867123',
    ifscCode: 'SBIN0000345',
    aadhaarNumber: 'XXXX-XXXX-3344',
    panNumber: 'PMOKM8899K',
    advanceBalance: 0,
    status: 'Active',
    remarks: 'Large dairy farm with automated milking parlor.',
    isFavorite: true,
    address: 'Uran-Islampur Road, Sangli',
    createdAt: '2026-01-08T06:00:00.000Z',
    updatedAt: '2026-02-10T06:00:00.000Z',
  },
  {
    id: 'F-104',
    farmerCode: 'F-104',
    farmerName: 'आनंदराव कृष्णा कदम (Anandrao Kadam)',
    mobileNumber: '9422045678',
    alternateNumber: '',
    village: 'Walwa',
    route: 'RT-102',
    routeGroupName: 'Walwa-Islampur Milk Corridor',
    collectionCenter: 'Walwa Gram Dairy',
    milkType: 'Cow',
    supplierType: 'Gavali',
    dailyMilkQuantity: 18,
    morningMilkQty: 10,
    eveningMilkQty: 8,
    avgFat: 3.4,
    avgSNF: 8.4,
    currentRate: 37.80,
    cattleCount: 4,
    fssaiNumber: '11524036000998',
    fssaiExpiryDate: '2028-01-10',
    fssaiStatus: 'Active',
    inaphTagNumbers: ['100234567899'],
    cleanMilkCert: false,
    vaccinationStatus: 'Due for FMD',
    bankName: 'Bank of India',
    bankAccountNumber: '9081726354',
    ifscCode: 'BKID0001234',
    aadhaarNumber: 'XXXX-XXXX-7711',
    advanceBalance: 12000,
    status: 'Irregular',
    remarks: 'Supply reduced last week due to cattle feed shortage issue.',
    isFavorite: false,
    address: 'Near Old Grampanchayat, Walwa',
    createdAt: '2026-01-10T06:00:00.000Z',
    updatedAt: '2026-02-12T06:00:00.000Z',
  },
  {
    id: 'F-105',
    farmerCode: 'F-105',
    farmerName: 'संजय दत्तात्रय जाधव (Sanjay Jadhav)',
    mobileNumber: '9970156789',
    alternateNumber: '9822445566',
    village: 'Shirala',
    route: 'RT-103',
    routeGroupName: 'Shirala Foothill Cooperative',
    collectionCenter: 'Shirala Western Center',
    milkType: 'Buffalo',
    supplierType: 'Gavali',
    dailyMilkQuantity: 22,
    morningMilkQty: 12,
    eveningMilkQty: 10,
    avgFat: 6.8,
    avgSNF: 9.0,
    currentRate: 69.50,
    cattleCount: 5,
    fssaiNumber: '11523049000112',
    fssaiExpiryDate: '2027-04-20',
    fssaiStatus: 'Active',
    inaphTagNumbers: ['100234567900', '100234567901'],
    cleanMilkCert: true,
    vaccinationStatus: 'Fully Vaccinated',
    bankName: 'Sangli DCC Bank',
    bankAccountNumber: '7766554433',
    ifscCode: 'SDCC0000078',
    aadhaarNumber: 'XXXX-XXXX-6622',
    advanceBalance: 50000,
    status: 'Active',
    remarks: 'Requested loan/advance for purchasing 2 new pregnant buffaloes.',
    isFavorite: false,
    address: 'Shirala Kasaba, Tal. Shirala',
    createdAt: '2026-01-14T06:00:00.000Z',
    updatedAt: '2026-02-14T06:00:00.000Z',
  },
  {
    id: 'F-106',
    farmerCode: 'F-106',
    farmerName: 'गणपत मारुती देसाई (Ganpat Desai)',
    mobileNumber: '9657267890',
    alternateNumber: '',
    village: 'Arag',
    route: 'RT-104',
    routeGroupName: 'Miraj-Arag Border Belt',
    collectionCenter: 'Arag Primary Chilling Unit',
    milkType: 'Cow',
    supplierType: 'Gavali',
    dailyMilkQuantity: 38,
    morningMilkQty: 20,
    eveningMilkQty: 18,
    avgFat: 3.8,
    avgSNF: 8.6,
    currentRate: 39.50,
    cattleCount: 8,
    fssaiNumber: '11524036000334',
    fssaiExpiryDate: '2028-06-15',
    fssaiStatus: 'Active',
    inaphTagNumbers: ['100234567902', '100234567903'],
    cleanMilkCert: true,
    vaccinationStatus: 'Fully Vaccinated',
    bankName: 'Union Bank of India',
    bankAccountNumber: '554433221100',
    ifscCode: 'UBIN0554433',
    aadhaarNumber: 'XXXX-XXXX-1199',
    advanceBalance: 0,
    status: 'Active',
    remarks: 'Consistently 3.8+ FAT / 8.6 SNF cow milk.',
    isFavorite: true,
    address: 'Arag-Bedag Link Road',
    createdAt: '2026-01-18T06:00:00.000Z',
    updatedAt: '2026-02-15T06:00:00.000Z',
  },
  {
    id: 'F-107',
    farmerCode: 'F-107',
    farmerName: 'बाळासाहेब आप्पासाहेब चव्हाण (Balasaheb Chavan)',
    mobileNumber: '9890378901',
    alternateNumber: '9423112233',
    village: 'Savlaj',
    route: 'RT-105',
    routeGroupName: 'Tasgaon Grape & Dairy Belt',
    collectionCenter: 'Savlaj Vikas Society Center',
    milkType: 'Cow',
    supplierType: 'Bulk Supplier',
    dailyMilkQuantity: 52,
    morningMilkQty: 28,
    eveningMilkQty: 24,
    avgFat: 3.7,
    avgSNF: 8.5,
    currentRate: 39.00,
    cattleCount: 12,
    fssaiNumber: '11521035000556',
    fssaiExpiryDate: '2025-12-31',
    fssaiStatus: 'Pending',
    inaphTagNumbers: ['100234567904', '100234567905'],
    cleanMilkCert: true,
    vaccinationStatus: 'Due for Lumpy',
    bankName: 'HDFC Bank',
    bankAccountNumber: '50100234567890',
    ifscCode: 'HDFC0001234',
    aadhaarNumber: 'XXXX-XXXX-9900',
    panNumber: 'CHAVB3344P',
    advanceBalance: 15000,
    status: 'Active',
    remarks: 'Wants silage packing machine demonstration on his farm.',
    isFavorite: false,
    address: 'Savlaj East, Tal. Tasgaon',
    createdAt: '2026-01-22T06:00:00.000Z',
    updatedAt: '2026-02-16T06:00:00.000Z',
  },
  {
    id: 'F-108',
    farmerCode: 'F-108',
    farmerName: 'दिलीप नारायण साळुंखे (Dilip Salunkhe)',
    mobileNumber: '9860489012',
    alternateNumber: '',
    village: 'Kasegaon',
    route: 'RT-102',
    routeGroupName: 'Walwa-Islampur Milk Corridor',
    collectionCenter: 'Kasegaon Highway Center',
    milkType: 'Buffalo',
    supplierType: 'Gavali',
    dailyMilkQuantity: 15,
    morningMilkQty: 8,
    eveningMilkQty: 7,
    avgFat: 6.4,
    avgSNF: 8.9,
    currentRate: 67.20,
    cattleCount: 3,
    fssaiNumber: '',
    fssaiStatus: 'Not Applied',
    inaphTagNumbers: [],
    cleanMilkCert: false,
    vaccinationStatus: 'Partially Vaccinated',
    bankName: 'Bank of Maharashtra',
    bankAccountNumber: '6022334455',
    ifscCode: 'MAHB0000123',
    aadhaarNumber: 'XXXX-XXXX-5566',
    advanceBalance: 8000,
    status: 'Stopped',
    remarks: 'Temporarily stopped pouring milk due to rate comparison with local private vendor.',
    isFavorite: false,
    address: 'Kasegaon Post Office Line',
    createdAt: '2026-01-25T06:00:00.000Z',
    updatedAt: '2026-02-17T06:00:00.000Z',
  },
];

const getTodayDateString = (offsetDays = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

const INITIAL_CALLS: CallRecord[] = [
  {
    id: 'CALL-001',
    date: getTodayDateString(0),
    time: '08:30',
    type: 'outgoing',
    farmerCode: 'F-101',
    farmerName: 'तानाजी विठ्ठल पाटील (Tanaji Patil)',
    mobileNumber: '9822012345',
    route: 'RT-101',
    village: 'Madhavnagar',
    callPurpose: 'Milk Collection',
    callStatus: 'Completed',
    discussion: 'Confirmed morning collection increased from 40 to 45 Ltr. Inquired about monthly bonus rate.',
    informationGiven: 'Explained new rate chart (+Rs. 1.50/Ltr bonus on FAT 3.8+) and payment schedule.',
    pendingWork: 'Send updated rate chart PDF over WhatsApp.',
    hasPendingWork: true,
    followUpDate: getTodayDateString(3),
    priority: 'High',
    officerId: 'USR-OFFICER-1',
    officerName: 'Ramesh Patil (संकलन अधिकारी)',
    callDuration: 185,
    aiSummary: 'Farmer increased morning supply to 45L. Rate bonus explained. Action: Send rate PDF.',
    createdAt: `${getTodayDateString(0)}T08:35:00.000Z`,
    updatedAt: `${getTodayDateString(0)}T08:35:00.000Z`,
  },
  {
    id: 'CALL-002',
    date: getTodayDateString(0),
    time: '09:15',
    type: 'outgoing',
    farmerCode: 'F-104',
    farmerName: 'आनंदराव कृष्णा कदम (Anandrao Kadam)',
    mobileNumber: '9422045678',
    route: 'RT-102',
    village: 'Walwa',
    callPurpose: 'Collection Increase',
    callStatus: 'Follow-up Required',
    discussion: 'Discussed why supply dropped from 30L to 18L. Farmer mentioned shortage of cattle feed concentrate.',
    informationGiven: 'Offered subsidized dairy cattle feed bags directly delivered to Walwa center.',
    pendingWork: 'Arrange 10 bags of cattle feed delivery to Walwa center by Friday.',
    hasPendingWork: true,
    followUpDate: getTodayDateString(1),
    priority: 'High',
    officerId: 'USR-OFFICER-2',
    officerName: 'Santosh Shinde (संकलन अधिकारी)',
    callDuration: 240,
    aiSummary: 'Supply dip caused by feed shortage. Subsidized feed arranged. Follow-up tomorrow on delivery.',
    createdAt: `${getTodayDateString(0)}T09:20:00.000Z`,
    updatedAt: `${getTodayDateString(0)}T09:20:00.000Z`,
  },
  {
    id: 'CALL-003',
    date: getTodayDateString(0),
    time: '10:00',
    type: 'incoming',
    farmerCode: 'F-105',
    farmerName: 'संजय दत्तात्रय जाधव (Sanjay Jadhav)',
    mobileNumber: '9970156789',
    route: 'RT-103',
    village: 'Shirala',
    callPurpose: 'Advance',
    callStatus: 'Completed',
    discussion: 'Farmer called requesting Rs. 50,000 seasonal cattle loan advance for 2 Murrah buffaloes.',
    informationGiven: 'Explained eligibility criteria, KYC documents required, and deduction terms from milk bills.',
    pendingWork: 'Collect loan application form and 7/12 land record copy during Shirala route visit.',
    hasPendingWork: true,
    followUpDate: getTodayDateString(2),
    priority: 'Medium',
    officerId: 'USR-OFFICER-1',
    officerName: 'Ramesh Patil (संकलन अधिकारी)',
    callDuration: 310,
    aiSummary: 'Loan advance inquiry for Rs 50k. KYC and 7/12 form collection scheduled on field visit.',
    createdAt: `${getTodayDateString(0)}T10:06:00.000Z`,
    updatedAt: `${getTodayDateString(0)}T10:06:00.000Z`,
  },
  {
    id: 'CALL-004',
    date: getTodayDateString(0),
    time: '10:45',
    type: 'outgoing',
    farmerCode: 'F-108',
    farmerName: 'दिलीप नारायण साळुंखे (Dilip Salunkhe)',
    mobileNumber: '9860489012',
    route: 'RT-102',
    village: 'Kasegaon',
    callPurpose: 'New Producer',
    callStatus: 'Not Received',
    discussion: 'Ringing but no answer. Re-trying in afternoon session.',
    informationGiven: 'N/A',
    pendingWork: '',
    hasPendingWork: false,
    followUpDate: getTodayDateString(0),
    priority: 'Medium',
    officerId: 'USR-OFFICER-2',
    officerName: 'Santosh Shinde (संकलन अधिकारी)',
    callDuration: 30,
    createdAt: `${getTodayDateString(0)}T10:46:00.000Z`,
    updatedAt: `${getTodayDateString(0)}T10:46:00.000Z`,
  },
  {
    id: 'CALL-005',
    date: getTodayDateString(0),
    time: '11:20',
    type: 'outgoing',
    farmerCode: 'F-103',
    farmerName: 'प्रकाश बापू मोहिते (Prakash Mohite)',
    mobileNumber: '9763234567',
    route: 'RT-102',
    village: 'Islampur',
    callPurpose: 'RT',
    callStatus: 'Completed',
    discussion: 'Discussed RT (Quality test) report. FAT test showed 4.1% and SNF 8.7%. Farmer very satisfied.',
    informationGiven: 'Provided computerized slip confirmation and praised clean milking hygiene practices.',
    pendingWork: '',
    hasPendingWork: false,
    priority: 'Low',
    officerId: 'USR-SUPERVISOR-1',
    officerName: 'Ganesh Deshmukh (फील्ड सुपरवायझर)',
    callDuration: 150,
    aiSummary: 'RT quality test verified optimal FAT/SNF. Excellent hygiene acknowledged.',
    createdAt: `${getTodayDateString(0)}T11:25:00.000Z`,
    updatedAt: `${getTodayDateString(0)}T11:25:00.000Z`,
  },
];

const INITIAL_INCOMING_CALLS: IncomingCallRecord[] = [
  {
    id: 'INC-001',
    date: getTodayDateString(0),
    time: '07:45',
    farmerCode: 'F-102',
    farmerName: 'सुभाष रघुनाथ शिंदे (Subhash Shinde)',
    mobileNumber: '9850123456',
    route: 'RT-101',
    subject: 'Morning Milk Sample MBRT Testing',
    discussion: 'Farmer wanted to verify why test result was delayed at Budhgaon center.',
    workRequested: 'Fast test result on farmer mobile app SMS.',
    actionTaken: 'Contacted Budhgaon lab technician; result SMS triggered immediately.',
    pendingWork: 'Verify analyzer sensor calibration at Budhgaon center.',
    followUpDate: getTodayDateString(2),
    officerId: 'USR-OFFICER-1',
    officerName: 'Ramesh Patil (संकलन अधिकारी)',
    createdAt: `${getTodayDateString(0)}T07:50:00.000Z`,
  },
  {
    id: 'INC-002',
    date: getTodayDateString(0),
    time: '10:00',
    farmerCode: 'F-105',
    farmerName: 'संजय दत्तात्रय जाधव (Sanjay Jadhav)',
    mobileNumber: '9970156789',
    route: 'RT-103',
    subject: 'Seasonal Advance Loan Application',
    discussion: 'Inquired about loan application submission process.',
    workRequested: 'Cattle loan documentation form.',
    actionTaken: 'Detailed KYC requirements shared over phone.',
    pendingWork: 'Collect loan documents during Shirala field visit.',
    followUpDate: getTodayDateString(2),
    officerId: 'USR-OFFICER-1',
    officerName: 'Ramesh Patil (संकलन अधिकारी)',
    createdAt: `${getTodayDateString(0)}T10:05:00.000Z`,
  },
];

const INITIAL_PENDING_TASKS: PendingTask[] = [
  {
    id: 'TSK-001',
    workName: 'Send updated rate chart PDF over WhatsApp',
    description: 'Farmer Tanaji Patil requested the latest August 2026 FAT-SNF rate revision chart.',
    assignedToId: 'USR-OFFICER-1',
    assignedToName: 'Ramesh Patil (संकलन अधिकारी)',
    farmerCode: 'F-101',
    farmerName: 'तानाजी विठ्ठल पाटील (Tanaji Patil)',
    farmerMobile: '9822012345',
    route: 'RT-101',
    dueDate: getTodayDateString(0),
    priority: 'High',
    status: 'In Progress',
    createdAt: `${getTodayDateString(0)}T08:35:00.000Z`,
    updatedAt: `${getTodayDateString(0)}T08:35:00.000Z`,
  },
  {
    id: 'TSK-002',
    workName: 'Arrange 10 bags cattle feed delivery to Walwa',
    description: 'Ensure subsidized bypass protein cattle feed reaches Walwa collection center for Anandrao Kadam.',
    assignedToId: 'USR-OFFICER-2',
    assignedToName: 'Santosh Shinde (संकलन अधिकारी)',
    farmerCode: 'F-104',
    farmerName: 'आनंदराव कृष्णा कदम (Anandrao Kadam)',
    farmerMobile: '9422045678',
    route: 'RT-102',
    dueDate: getTodayDateString(1),
    priority: 'High',
    status: 'Pending',
    createdAt: `${getTodayDateString(0)}T09:20:00.000Z`,
    updatedAt: `${getTodayDateString(0)}T09:20:00.000Z`,
  },
  {
    id: 'TSK-003',
    workName: 'Collect loan documents during Shirala field visit',
    description: 'Collect 7/12 extract and Aadhaar copy for Rs 50,000 cattle purchase advance.',
    assignedToId: 'USR-OFFICER-1',
    assignedToName: 'Ramesh Patil (संकलन अधिकारी)',
    farmerCode: 'F-105',
    farmerName: 'संजय दत्तात्रय जाधव (Sanjay Jadhav)',
    farmerMobile: '9970156789',
    route: 'RT-103',
    dueDate: getTodayDateString(2),
    priority: 'Medium',
    status: 'Pending',
    createdAt: `${getTodayDateString(0)}T10:06:00.000Z`,
    updatedAt: `${getTodayDateString(0)}T10:06:00.000Z`,
  },
  {
    id: 'TSK-004',
    workName: 'Silage making demonstration on Balasaheb farm',
    description: 'Schedule technician visit for corn silage pit preparation in Savlaj village.',
    assignedToId: 'USR-SUPERVISOR-1',
    assignedToName: 'Ganesh Deshmukh (फील्ड सुपरवायझर)',
    farmerCode: 'F-107',
    farmerName: 'बाळासाहेब आप्पासाहेब चव्हाण (Balasaheb Chavan)',
    farmerMobile: '9890378901',
    route: 'RT-105',
    dueDate: getTodayDateString(-1), // overdue
    priority: 'Medium',
    status: 'Pending',
    createdAt: `${getTodayDateString(-3)}T10:00:00.000Z`,
    updatedAt: `${getTodayDateString(-3)}T10:00:00.000Z`,
  },
];

const INITIAL_FOLLOWUPS: FollowUpItem[] = [
  {
    id: 'FLW-001',
    callId: 'CALL-004',
    farmerCode: 'F-108',
    farmerName: 'दिलीप नारायण साळुंखे (Dilip Salunkhe)',
    mobileNumber: '9860489012',
    route: 'RT-102',
    village: 'Kasegaon',
    scheduledDate: getTodayDateString(0),
    reason: 'Morning call not received. Call again at 4:30 PM before evening collection starts.',
    priority: 'High',
    officerId: 'USR-OFFICER-2',
    officerName: 'Santosh Shinde (संकलन अधिकारी)',
    status: 'pending',
    createdAt: `${getTodayDateString(0)}T10:46:00.000Z`,
  },
  {
    id: 'FLW-002',
    callId: 'CALL-002',
    farmerCode: 'F-104',
    farmerName: 'आनंदराव कृष्णा कदम (Anandrao Kadam)',
    mobileNumber: '9422045678',
    route: 'RT-102',
    village: 'Walwa',
    scheduledDate: getTodayDateString(1),
    reason: 'Confirm cattle feed delivery status and recovery of milk pouring volume.',
    priority: 'High',
    officerId: 'USR-OFFICER-2',
    officerName: 'Santosh Shinde (संकलन अधिकारी)',
    status: 'pending',
    createdAt: `${getTodayDateString(0)}T09:20:00.000Z`,
  },
  {
    id: 'FLW-003',
    callId: 'CALL-003',
    farmerCode: 'F-105',
    farmerName: 'संजय दत्तात्रय जाधव (Sanjay Jadhav)',
    mobileNumber: '9970156789',
    route: 'RT-103',
    village: 'Shirala',
    scheduledDate: getTodayDateString(2),
    reason: 'Verify cattle advance documentation and branch approval status.',
    priority: 'Medium',
    officerId: 'USR-OFFICER-1',
    officerName: 'Ramesh Patil (संकलन अधिकारी)',
    status: 'pending',
    createdAt: `${getTodayDateString(0)}T10:06:00.000Z`,
  },
  {
    id: 'FLW-004',
    callId: 'CALL-PREV-01',
    farmerCode: 'F-107',
    farmerName: 'बाळासाहेब आप्पासाहेब चव्हाण (Balasaheb Chavan)',
    mobileNumber: '9890378901',
    route: 'RT-105',
    village: 'Savlaj',
    scheduledDate: getTodayDateString(-1), // Overdue
    reason: 'Follow up on silage bunker construction progress.',
    priority: 'Medium',
    officerId: 'USR-SUPERVISOR-1',
    officerName: 'Ganesh Deshmukh (फील्ड सुपरवायझर)',
    status: 'pending',
    createdAt: `${getTodayDateString(-2)}T11:00:00.000Z`,
  },
];

const INITIAL_USERS: User[] = [
  {
    id: 'USR-ADMIN-1',
    name: 'प्रमोद सावंत (Pramod Sawant - Admin)',
    email: 'admin@dairy.com',
    mobile: '9822000001',
    role: 'admin',
    assignedRoutes: ['RT-101', 'RT-102', 'RT-103', 'RT-104', 'RT-105'],
    status: 'active',
    createdAt: '2026-01-01T00:00:00.000Z',
    lastLogin: '2026-08-17T20:30:00.000Z',
  },
  {
    id: 'USR-OFFICER-1',
    name: 'रमेश विष्णू पाटील (Ramesh Patil)',
    email: 'ramesh@dairy.com',
    mobile: '9822000002',
    role: 'officer',
    assignedRoutes: ['RT-101', 'RT-103'],
    status: 'active',
    createdAt: '2026-01-02T00:00:00.000Z',
    lastLogin: '2026-08-17T19:00:00.000Z',
  },
  {
    id: 'USR-OFFICER-2',
    name: 'संतोष बापू शिंदे (Santosh Shinde)',
    email: 'santosh@dairy.com',
    mobile: '9822000003',
    role: 'officer',
    assignedRoutes: ['RT-102', 'RT-105'],
    status: 'active',
    createdAt: '2026-01-03T00:00:00.000Z',
    lastLogin: '2026-08-17T18:45:00.000Z',
  },
  {
    id: 'USR-SUPERVISOR-1',
    name: 'गणेश महादेव देशमुख (Ganesh Deshmukh)',
    email: 'supervisor@dairy.com',
    mobile: '9822000004',
    role: 'supervisor',
    assignedRoutes: ['RT-101', 'RT-102', 'RT-103', 'RT-104', 'RT-105'],
    status: 'active',
    createdAt: '2026-01-04T00:00:00.000Z',
    lastLogin: '2026-08-17T21:00:00.000Z',
  },
];

// LocalStorage Keys
const KEYS = {
  FARMERS: 'dairy_db_farmers',
  ROUTES: 'dairy_db_routes',
  CALLS: 'dairy_db_calls',
  INCOMING_CALLS: 'dairy_db_incoming_calls',
  TASKS: 'dairy_db_tasks',
  FOLLOWUPS: 'dairy_db_followups',
  USERS: 'dairy_db_users',
  LOGIN_HISTORY: 'dairy_db_login_history',
  NOTIFICATIONS: 'dairy_db_notifications',
  LAST_SYNC: 'dairy_db_last_sync_timestamp',
};

// Generic safe loader and saver
function loadFromStorage<T>(key: string, initialData: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(initialData));
      return initialData;
    }
    return JSON.parse(item);
  } catch (err) {
    console.error(`Error loading key ${key} from storage:`, err);
    return initialData;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    localStorage.setItem(KEYS.LAST_SYNC, new Date().toISOString());
    window.dispatchEvent(new Event('dairy_storage_updated'));
  } catch (err) {
    console.error(`Error saving key ${key} to storage:`, err);
  }
}

// Storage API
export const StorageService = {
  // Routes
  getRoutes: (): RouteItem[] => loadFromStorage<RouteItem[]>(KEYS.ROUTES, INITIAL_ROUTES),
  saveRoute: (route: RouteItem): void => {
    const routes = StorageService.getRoutes();
    const index = routes.findIndex(r => r.id === route.id);
    if (index >= 0) {
      routes[index] = route;
    } else {
      routes.unshift(route);
    }
    saveToStorage(KEYS.ROUTES, routes);
  },
  deleteRoute: (id: string): void => {
    const routes = StorageService.getRoutes().filter(r => r.id !== id);
    saveToStorage(KEYS.ROUTES, routes);
  },

  // Farmers
  getFarmers: (): Farmer[] => {
    const list = loadFromStorage<Farmer[]>(KEYS.FARMERS, INITIAL_FARMERS);
    return list.map(f => {
      if (f.linkCenter) return f;
      const computedLink =
        f.route === 'RT-101'
          ? 'Sangli Main Link Center'
          : f.route === 'RT-102'
          ? 'Islampur Chilling Link'
          : f.route === 'RT-103'
          ? 'Shirala BMC Link'
          : f.route === 'RT-104'
          ? 'Miraj Bulk Cooler Link'
          : 'Tasgaon Central Link';
      return { ...f, linkCenter: computedLink };
    });
  },
  saveFarmer: (farmer: Farmer): void => {
    const farmers = StorageService.getFarmers();
    const index = farmers.findIndex(f => f.id === farmer.id || f.farmerCode === farmer.farmerCode);
    if (index >= 0) {
      farmers[index] = { ...farmers[index], ...farmer, updatedAt: new Date().toISOString() };
    } else {
      farmers.unshift({
        ...farmer,
        createdAt: farmer.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    saveToStorage(KEYS.FARMERS, farmers);
  },
  deleteFarmer: (id: string): void => {
    const farmers = StorageService.getFarmers().filter(f => f.id !== id);
    saveToStorage(KEYS.FARMERS, farmers);
  },
  toggleFarmerFavorite: (id: string): void => {
    const farmers = StorageService.getFarmers();
    const index = farmers.findIndex(f => f.id === id);
    if (index >= 0) {
      farmers[index].isFavorite = !farmers[index].isFavorite;
      saveToStorage(KEYS.FARMERS, farmers);
    }
  },
  importFarmersBatch: (newFarmers: Partial<Farmer>[]): number => {
    return StorageService.bulkImportFarmers(newFarmers);
  },
  bulkImportFarmers: (newFarmers: Partial<Farmer>[]): number => {
    const existing = StorageService.getFarmers();
    const existingCodes = new Set(existing.map(f => f.farmerCode.toLowerCase()));
    let addedCount = 0;
    const merged = [...existing];

    newFarmers.forEach(f => {
      if (f.farmerCode && !existingCodes.has(f.farmerCode.toLowerCase())) {
        merged.push({
          id: f.id || `F-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          farmerCode: f.farmerCode,
          farmerName: f.farmerName || 'शेतकरी (Farmer)',
          mobileNumber: f.mobileNumber || '9800000000',
          alternateNumber: f.alternateNumber || '',
          village: f.village || 'Sangli',
          route: f.route || 'RT-101',
          collectionCenter: f.collectionCenter || 'Main Center',
          milkType: f.milkType || 'Cow',
          dailyMilkQuantity: f.dailyMilkQuantity || 20,
          status: f.status || 'Active',
          remarks: f.remarks || '',
          isFavorite: Boolean(f.isFavorite),
          address: f.address || '',
          createdAt: f.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        existingCodes.add(f.farmerCode.toLowerCase());
        addedCount++;
      }
    });

    saveToStorage(KEYS.FARMERS, merged);
    return addedCount;
  },

  // Calls
  getCalls: (): CallRecord[] => loadFromStorage<CallRecord[]>(KEYS.CALLS, INITIAL_CALLS),
  saveCall: (call: CallRecord): void => {
    const calls = StorageService.getCalls();
    const index = calls.findIndex(c => c.id === call.id);
    if (index >= 0) {
      calls[index] = { ...calls[index], ...call, updatedAt: new Date().toISOString() };
    } else {
      calls.unshift({
        ...call,
        createdAt: call.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    saveToStorage(KEYS.CALLS, calls);

    // Auto generate pending task if flagged
    if (call.hasPendingWork && call.pendingWork.trim()) {
      const existingTask = StorageService.getTasks().find(t => t.sourceCallId === call.id);
      if (!existingTask) {
        StorageService.saveTask({
          id: `TSK-${Date.now()}`,
          workName: call.pendingWork,
          description: `Generated from call on ${call.date}: ${call.discussion}`,
          assignedToId: call.officerId,
          assignedToName: call.officerName,
          farmerCode: call.farmerCode,
          farmerName: call.farmerName,
          farmerMobile: call.mobileNumber,
          route: call.route,
          dueDate: call.followUpDate || call.date,
          priority: call.priority,
          status: 'Pending',
          sourceCallId: call.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }

    // Auto generate follow up if date provided or status requires it
    if (call.followUpDate || call.callStatus === 'Follow-up Required' || call.callStatus === 'Call Back Later' || call.callStatus === 'Not Received') {
      const targetDate = call.followUpDate || call.date;
      const existingFollowUp = StorageService.getFollowUps().find(f => f.callId === call.id);
      if (!existingFollowUp) {
        StorageService.saveFollowUp({
          id: `FLW-${Date.now()}`,
          callId: call.id,
          farmerCode: call.farmerCode,
          farmerName: call.farmerName,
          mobileNumber: call.mobileNumber,
          route: call.route,
          village: call.village,
          scheduledDate: targetDate,
          reason: `${call.callStatus}: ${call.discussion.substring(0, 80)}`,
          priority: call.priority,
          officerId: call.officerId,
          officerName: call.officerName,
          status: 'pending',
          createdAt: new Date().toISOString(),
        });
      }
    }
  },
  deleteCall: (id: string): void => {
    const calls = StorageService.getCalls().filter(c => c.id !== id);
    saveToStorage(KEYS.CALLS, calls);
  },

  // Incoming Calls
  getIncomingCalls: (): IncomingCallRecord[] =>
    loadFromStorage<IncomingCallRecord[]>(KEYS.INCOMING_CALLS, INITIAL_INCOMING_CALLS),
  saveIncomingCall: (call: IncomingCallRecord): void => {
    const calls = StorageService.getIncomingCalls();
    const index = calls.findIndex(c => c.id === call.id);
    if (index >= 0) {
      calls[index] = call;
    } else {
      calls.unshift({
        ...call,
        createdAt: call.createdAt || new Date().toISOString(),
      });
    }
    saveToStorage(KEYS.INCOMING_CALLS, calls);

    // Also mirror to main calls for unified metrics
    const mirrorCall: CallRecord = {
      id: `MIRROR-${call.id}`,
      date: call.date,
      time: call.time,
      type: 'incoming',
      farmerCode: call.farmerCode,
      farmerName: call.farmerName,
      mobileNumber: call.mobileNumber,
      route: call.route,
      village: 'Registered Village',
      callPurpose: 'Complaint',
      callStatus: 'Completed',
      discussion: `${call.subject} - ${call.discussion}`,
      informationGiven: call.actionTaken,
      pendingWork: call.pendingWork,
      hasPendingWork: Boolean(call.pendingWork),
      followUpDate: call.followUpDate,
      priority: 'High',
      officerId: call.officerId,
      officerName: call.officerName,
      callDuration: 120,
      createdAt: call.createdAt,
      updatedAt: call.createdAt,
    };
    StorageService.saveCall(mirrorCall);
  },
  deleteIncomingCall: (id: string): void => {
    const incoming = StorageService.getIncomingCalls().filter(c => c.id !== id);
    saveToStorage(KEYS.INCOMING_CALLS, incoming);

    // Also delete mirror call if present
    const mirrorId = `MIRROR-${id}`;
    const calls = StorageService.getCalls().filter(c => c.id !== mirrorId && c.id !== id);
    saveToStorage(KEYS.CALLS, calls);
  },

  // Dependency Helpers
  getRouteDependencies: (routeNumber: string) => {
    const farmers = StorageService.getFarmers().filter(
      f => f.route === routeNumber || f.route.toLowerCase() === routeNumber.toLowerCase()
    );
    const calls = StorageService.getCalls().filter(
      c => c.route === routeNumber || c.route.toLowerCase() === routeNumber.toLowerCase()
    );
    const tasks = StorageService.getTasks().filter(
      t => t.route === routeNumber || t.route?.toLowerCase() === routeNumber.toLowerCase()
    );
    return {
      farmersCount: farmers.length,
      callsCount: calls.length,
      tasksCount: tasks.length,
    };
  },

  getFarmerDependencies: (farmerCode: string, mobileNumber?: string) => {
    const calls = StorageService.getCalls().filter(
      c => c.farmerCode === farmerCode || (mobileNumber && c.mobileNumber === mobileNumber)
    );
    const tasks = StorageService.getTasks().filter(
      t => t.farmerCode === farmerCode || (mobileNumber && t.farmerMobile === mobileNumber)
    );
    const followUps = StorageService.getFollowUps().filter(
      f => f.farmerCode === farmerCode || (mobileNumber && f.mobileNumber === mobileNumber)
    );
    return {
      callsCount: calls.length,
      tasksCount: tasks.length,
      followUpsCount: followUps.length,
    };
  },

  // Pending Tasks
  getTasks: (): PendingTask[] => loadFromStorage<PendingTask[]>(KEYS.TASKS, INITIAL_PENDING_TASKS),
  saveTask: (task: PendingTask): void => {
    const tasks = StorageService.getTasks();
    const index = tasks.findIndex(t => t.id === task.id);
    if (index >= 0) {
      tasks[index] = { ...tasks[index], ...task, updatedAt: new Date().toISOString() };
    } else {
      tasks.unshift({
        ...task,
        createdAt: task.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    saveToStorage(KEYS.TASKS, tasks);
  },
  updateTaskStatus: (id: string, status: TaskStatus): void => {
    const tasks = StorageService.getTasks();
    const index = tasks.findIndex(t => t.id === id);
    if (index >= 0) {
      tasks[index].status = status;
      tasks[index].updatedAt = new Date().toISOString();
      if (status === 'Completed') {
        tasks[index].completionDate = new Date().toISOString().split('T')[0];
      }
      saveToStorage(KEYS.TASKS, tasks);
    }
  },
  deleteTask: (id: string): void => {
    const tasks = StorageService.getTasks().filter(t => t.id !== id);
    saveToStorage(KEYS.TASKS, tasks);
  },

  // Follow Ups
  getFollowUps: (): FollowUpItem[] =>
    loadFromStorage<FollowUpItem[]>(KEYS.FOLLOWUPS, INITIAL_FOLLOWUPS),
  saveFollowUp: (item: FollowUpItem): void => {
    const list = StorageService.getFollowUps();
    const index = list.findIndex(f => f.id === item.id);
    if (index >= 0) {
      list[index] = item;
    } else {
      list.unshift(item);
    }
    saveToStorage(KEYS.FOLLOWUPS, list);
  },
  completeFollowUp: (id: string): void => {
    const list = StorageService.getFollowUps();
    const index = list.findIndex(f => f.id === id);
    if (index >= 0) {
      list[index].status = 'completed';
      list[index].completedAt = new Date().toISOString();
      saveToStorage(KEYS.FOLLOWUPS, list);
    }
  },
  rescheduleFollowUp: (id: string, newDate: string): void => {
    const list = StorageService.getFollowUps();
    const index = list.findIndex(f => f.id === id);
    if (index >= 0) {
      list[index].status = 'pending';
      list[index].rescheduledTo = newDate;
      list[index].scheduledDate = newDate;
      saveToStorage(KEYS.FOLLOWUPS, list);
    }
  },
  deleteFollowUp: (id: string): void => {
    const list = StorageService.getFollowUps().filter(f => f.id !== id);
    saveToStorage(KEYS.FOLLOWUPS, list);
  },

  // Users
  getUsers: (): User[] => loadFromStorage<User[]>(KEYS.USERS, INITIAL_USERS),
  saveUser: (user: User): void => {
    const users = StorageService.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.unshift(user);
    }
    saveToStorage(KEYS.USERS, users);
  },
  deleteUser: (id: string): void => {
    const users = StorageService.getUsers().filter(u => u.id !== id);
    saveToStorage(KEYS.USERS, users);
  },

  // Login History
  getLoginHistory: (): LoginHistoryEntry[] =>
    loadFromStorage<LoginHistoryEntry[]>(KEYS.LOGIN_HISTORY, []),
  logLogin: (entry: LoginHistoryEntry): void => {
    const list = StorageService.getLoginHistory();
    list.unshift(entry);
    if (list.length > 100) list.pop(); // keep last 100
    saveToStorage(KEYS.LOGIN_HISTORY, list);
  },

  // Backup & Restore
  exportBackupJSON: (): string => {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      farmers: StorageService.getFarmers(),
      routes: StorageService.getRoutes(),
      calls: StorageService.getCalls(),
      incomingCalls: StorageService.getIncomingCalls(),
      tasks: StorageService.getTasks(),
      followUps: StorageService.getFollowUps(),
      users: StorageService.getUsers(),
    };
    return JSON.stringify(data, null, 2);
  },
  restoreBackupJSON: (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.farmers) saveToStorage(KEYS.FARMERS, data.farmers);
      if (data.routes) saveToStorage(KEYS.ROUTES, data.routes);
      if (data.calls) saveToStorage(KEYS.CALLS, data.calls);
      if (data.incomingCalls) saveToStorage(KEYS.INCOMING_CALLS, data.incomingCalls);
      if (data.tasks) saveToStorage(KEYS.TASKS, data.tasks);
      if (data.followUps) saveToStorage(KEYS.FOLLOWUPS, data.followUps);
      if (data.users) saveToStorage(KEYS.USERS, data.users);
      return true;
    } catch (e) {
      console.error('Failed to restore backup:', e);
      return false;
    }
  },

  // Daily Plans
  getDailyPlans: (): any[] => {
    return loadFromStorage<any[]>('dairy_daily_plans', []);
  },
  saveDailyPlans: (plans: any[]): void => {
    saveToStorage('dairy_daily_plans', plans);
  },

  getLastSync: (): string => {
    return localStorage.getItem(KEYS.LAST_SYNC) || new Date().toISOString();
  },
};
