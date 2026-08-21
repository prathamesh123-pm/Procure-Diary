import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import {
  Farmer,
  ProducerCommunicationRecord,
  ProducerCommunicationSubject,
  ProducerCallStatus,
  CommunicationCampaign,
  ProducerCommunicationSummary,
} from '../types';
import { StorageService } from './storageService';
import { ActivityService } from './activityService';
import { DownloadService } from './downloadService';
import { setupPdfUnicodeFont, UNICODE_AUTOTABLE_STYLES, UNICODE_AUTOTABLE_HEAD_STYLES, UNICODE_FONT_FAMILY } from './pdfUnicodeHelper';

const STORAGE_KEY_PRODUCER_CALLS = 'dairy_db_producer_communication_calls';
const STORAGE_KEY_CAMPAIGNS = 'dairy_db_producer_communication_campaigns';

export const PRODUCER_COMMUNICATION_SUBJECTS: {
  id: ProducerCommunicationSubject;
  labelMr: string;
  labelEn: string;
  descriptionMr: string;
  defaultTemplateMr: string;
  defaultTemplateEn: string;
}[] = [
  {
    id: 'Rate Information',
    labelMr: 'दूध दर माहिती (Rate Information)',
    labelEn: 'Rate Information',
    descriptionMr: 'नवीन सुधारित गाय व म्हैस दूध दर पत्रक माहिती सर्व उत्पादकांना देणे.',
    defaultTemplateMr:
      'नमस्कार {नाव} जी, डेअरी तर्फे कळविण्यात येते की आपले सुधारित दूध दर लागू झाले आहेत. गाय दूध दर रु. ३९.५०/लिटर (३.५/८.५) व म्हैस दूध दर रु. ७२.००/लिटर (६.५/९.०) प्रमाणे राहतील. अधिक माहितीसाठी आपल्या संकलन केंद्राशी संपर्क साधा.',
    defaultTemplateEn:
      'Dear {name}, Please note the updated milk rates effective now: Cow Milk Base Rate Rs. 39.50/L, Buffalo Milk Base Rate Rs. 72.00/L. For full rate chart, contact your collection center.',
  },
  {
    id: 'Rate Change',
    labelMr: 'दूध दर बदल सूचना (Rate Change Notice)',
    labelEn: 'Rate Change',
    descriptionMr: 'शासकीय व संस्थात्मक दर बदल व फॅट स्लॅब इन्सेंटिव्ह सूचना.',
    defaultTemplateMr:
      'महत्त्वाची सूचना: डेअरी व्यवस्थापनाच्या निर्णयानुसार दिनांक {तारीख} पासून दुधाच्या खरेदी दरामध्ये सुधारणा करण्यात आली आहे. सर्व उत्पादक बंधूंनी याची नोंद घ्यावी.',
    defaultTemplateEn:
      'Important Notice: Effective {date}, revised milk purchase rates and fat/SNF slab incentives are being updated. Kindly check with your route supervisor.',
  },
  {
    id: 'FSSAI License Reminder',
    labelMr: 'FSSAI परवाना नूतनीकरण (FSSAI License Reminder)',
    labelEn: 'FSSAI License Reminder',
    descriptionMr: 'गवळी / दूध उत्पादक अन्न सुरक्षा FSSAI परवाना नोंदणी व नूतनीकरण स्मरणपत्र.',
    defaultTemplateMr:
      'नमस्कार {नाव} जी, अन्न सुरक्षा मानके (FSSAI) नियमानुसार आपल्या दुग्ध व्यवसायाचा FSSAI परवाना / नोंदणी नूतनीकरण करणे बंधनकारक आहे. कृपया आवश्यक कागदपत्रे (आधार, ७/१२, फोटो) त्वरित संकलन केंद्रात जमा करावीत.',
    defaultTemplateEn:
      'Dear {name}, FSSAI dairy registration/renewal is mandatory as per food safety regulations. Kindly submit your KYC documents at the center immediately.',
  },
  {
    id: 'Document Verification',
    labelMr: 'कागदपत्र व KYC पडताळणी (Document Verification)',
    labelEn: 'Document Verification',
    descriptionMr: 'बँक खाते, आधार, पॅन व पशु कानपट्टी (INAPH) तपासणी.',
    defaultTemplateMr:
      'नमस्कार {नाव} जी, थेट बँक पेमेंटसाठी आपले बँक पासबुक, आधार कार्ड व पशु कानपट्टी क्रमांक पडताळणी प्रलंबित आहे. कृपया आजच केंद्रावर कागदपत्रे दाखवून पडताळणी पूर्ण करावी.',
    defaultTemplateEn:
      'Dear {name}, Direct milk payment KYC verification is pending. Please verify your Bank Account, Aadhaar and INAPH cattle tag numbers with the center operator.',
  },
  {
    id: 'Milk Quality Notice',
    labelMr: 'दूध गुणवत्ता व फॅट सूचना (Milk Quality Notice)',
    labelEn: 'Milk Quality Notice',
    descriptionMr: 'स्वच्छ दूध उत्पादन, फॅट-SNF सुधारणा, ऍसिडिटी व MBRT गुणवत्ता सूचना.',
    defaultTemplateMr:
      'गुणवत्ता सूचना: स्वच्छ व निर्भेळ दूध पुरवठ्यासाठी जनावरांचे आरोग्य, स्वच्छ भांडी वापरणे व गाळणी करणे आवश्यक आहे. उत्तम फॅट व SNF साठी बायपास फॅट व संतुलित पशुखाद्य वापरावे.',
    defaultTemplateEn:
      'Quality Notice: Ensure hygienic milking practices, clean stainless steel cans, and proper mineral mixture feeding for optimal FAT and SNF yields.',
  },
  {
    id: 'Collection Timing',
    labelMr: 'संकलन वेळ बदल सूचना (Collection Timing)',
    labelEn: 'Collection Timing',
    descriptionMr: 'सकाळ व संध्याकाळ संकलन वेळ व वाहन आगमन वेळ बदल.',
    defaultTemplateMr:
      'वेळ बदल सूचना: उद्यापासून सकाळचे दूध संकलन सकाळी ६:०० ते ८:०० व संध्याकाळचे संकलन संध्याकाळी ६:०० ते ८:०० या वेळेतच होईल. वेळेवर दूध केंद्रावर पोहोचवावे.',
    defaultTemplateEn:
      'Timing Update: Starting tomorrow, milk collection timings are Morning 6:00 AM - 8:00 AM and Evening 6:00 PM - 8:00 PM. Please adhere to the schedule.',
  },
  {
    id: 'Meeting Information',
    labelMr: 'सभा / बैठक माहिती (Meeting Information)',
    labelEn: 'Meeting Information',
    descriptionMr: 'वार्षिक सर्वसाधारण सभा, गवळी मेळावा किंवा दूध वाढ मार्गदर्शन बैठक.',
    defaultTemplateMr:
      'महत्त्वाचे निमंत्रण: सर्व दूध उत्पादक सभासदांची विशेष बैठक दिनांक {तारीख} रोजी सकाळी ११:०० वाजता मुख्य कार्यालयात आयोजित केली आहे. आपली उपस्थिती प्रार्थनीय आहे.',
    defaultTemplateEn:
      'Invitation: An important Producer Information & Growth Meeting is scheduled on {date} at 11:00 AM. Your presence is requested.',
  },
  {
    id: 'Payment Information',
    labelMr: 'दूध बिल व पेमेंट माहिती (Payment Information)',
    labelEn: 'Payment Information',
    descriptionMr: '१० दिवसांचे दूध बिल बँक खात्यात जमा झाल्याची सूचना.',
    defaultTemplateMr:
      'पेमेंट सूचना: मागील बिल कालावधीचे दूध बिल आपल्या बँक खात्यात थेट वर्ग करण्यात आले आहे. कृपया आपले बँक पासबुक अथवा मेसेज तपासून खात्री करावी.',
    defaultTemplateEn:
      'Payment Update: Your 10-day milk procurement payment has been credited to your registered bank account. Kindly verify your account.',
  },
  {
    id: 'Other',
    labelMr: 'इतर अधिकृत सूचना (Other Notice)',
    labelEn: 'Other',
    descriptionMr: 'संस्थेची इतर कोणतीही अधिकृत सूचना वा घोषणा.',
    defaultTemplateMr:
      'नमस्कार {नाव} जी, डेअरी व्यवस्थापनातर्फे अधिकृत सूचना पाठवण्यात येत आहे. अधिक माहितीसाठी आपल्या संकलन केंद्र प्रमुखांशी संपर्क साधावा.',
    defaultTemplateEn:
      'Dear {name}, Please take note of the official notice from Dairy Management. Contact your center in-charge for any clarification.',
  },
];

export const PRODUCER_CALL_STATUSES: {
  id: ProducerCallStatus;
  labelMr: string;
  labelEn: string;
  badgeBg: string;
  badgeText: string;
}[] = [
  {
    id: 'Call Completed',
    labelMr: 'कॉल पूर्ण झाला',
    labelEn: 'Call Completed',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-950/60',
    badgeText: 'text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
  },
  {
    id: 'Information Delivered Successfully',
    labelMr: 'माहिती यशस्वीरित्या दिली',
    labelEn: 'Info Delivered',
    badgeBg: 'bg-teal-100 dark:bg-teal-950/60',
    badgeText: 'text-teal-800 dark:text-teal-300 border-teal-300 dark:border-teal-800',
  },
  {
    id: 'Call Not Answered',
    labelMr: 'कॉल उचलला नाही',
    labelEn: 'Not Answered',
    badgeBg: 'bg-amber-100 dark:bg-amber-950/60',
    badgeText: 'text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800',
  },
  {
    id: 'Busy',
    labelMr: 'व्यस्त (Busy)',
    labelEn: 'Busy',
    badgeBg: 'bg-orange-100 dark:bg-orange-950/60',
    badgeText: 'text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-800',
  },
  {
    id: 'Switched Off',
    labelMr: 'मोबाईल बंद (Switched Off)',
    labelEn: 'Switched Off',
    badgeBg: 'bg-rose-100 dark:bg-rose-950/60',
    badgeText: 'text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800',
  },
  {
    id: 'Number Not Reachable',
    labelMr: 'नॉट रिचेबल (Unreachable)',
    labelEn: 'Not Reachable',
    badgeBg: 'bg-purple-100 dark:bg-purple-950/60',
    badgeText: 'text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800',
  },
  {
    id: 'Call Back Required',
    labelMr: 'पुन्हा कॉल करणे आवश्यक',
    labelEn: 'Call Back Required',
    badgeBg: 'bg-blue-100 dark:bg-blue-950/60',
    badgeText: 'text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800',
  },
  {
    id: 'Follow-up Required',
    labelMr: 'फॉलो-अप आवश्यक',
    labelEn: 'Follow-up Required',
    badgeBg: 'bg-indigo-100 dark:bg-indigo-950/60',
    badgeText: 'text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800',
  },
  {
    id: 'Wrong Number',
    labelMr: 'चुकीचा नंबर (Wrong Number)',
    labelEn: 'Wrong Number',
    badgeBg: 'bg-slate-100 dark:bg-slate-800',
    badgeText: 'text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700',
  },
];

const INITIAL_CAMPAIGNS: CommunicationCampaign[] = [
  {
    id: 'CMP-2026-001',
    title: 'दूध दर सुधारणा व फॅट बोनस मोहीम (August 2026)',
    subject: 'Rate Information',
    date: new Date().toISOString().split('T')[0],
    targetRoutes: ['all'],
    notes: 'सर्व गवळी व दूध उत्पादकांना नवीन सुधारित दर व फॅट इन्सेंटिव्ह स्लॅब समजावून सांगणे.',
    broadcastTemplate:
      'नमस्कार {नाव} जी, डेअरी तर्फे कळविण्यात येते की आपले सुधारित दूध दर लागू झाले आहेत. गाय दूध दर रु. ३९.५०/लिटर व म्हैस दूध दर रु. ७२.००/लिटर प्रमाणे राहतील. अधिक माहितीसाठी आपल्या संकलन केंद्राशी संपर्क साधा.',
    createdById: 'USR-ADMIN-1',
    createdByName: 'प्रमोद सावंत (Pramod Sawant)',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'CMP-2026-002',
    title: 'FSSAI परवाना नूतनीकरण विशेष सूचना',
    subject: 'FSSAI License Reminder',
    date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    targetRoutes: ['RT-101', 'RT-102'],
    notes: 'शासकीय अन्न सुरक्षा नियमानुसार परवाना नूतनीकरण कागदपत्रे गोळा करणे.',
    broadcastTemplate:
      'नमस्कार {नाव} जी, अन्न सुरक्षा मानके (FSSAI) नियमानुसार आपल्या दुग्ध व्यवसायाचा FSSAI परवाना नूतनीकरण करणे आवश्यक आहे. कृपया आवश्यक कागदपत्रे संकलन केंद्रात जमा करावीत.',
    createdById: 'USR-ADMIN-1',
    createdByName: 'प्रमोद सावंत (Pramod Sawant)',
    status: 'completed',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

const INITIAL_PRODUCER_CALLS: ProducerCommunicationRecord[] = [
  {
    id: 'PCC-101',
    campaignId: 'CMP-2026-001',
    producerCode: 'F-101',
    producerName: 'तानाजी विठ्ठल पाटील (Tanaji Patil)',
    mobileNumber: '9822012345',
    alternateNumber: '9421098765',
    village: 'Madhavnagar',
    route: 'RT-101',
    linkCenter: 'Sangli Main Link Center',
    collectionCenter: 'Madhavnagar Center 1',
    milkType: 'Cow',
    subject: 'Rate Information',
    status: 'Information Delivered Successfully',
    callDate: new Date().toISOString().split('T')[0],
    callTime: '09:15',
    callDuration: 180,
    remarks: 'नवीन गाय दूध दर रु. ३९.५० समजावून सांगितले. रोज ५० लिटर वाढीव पुरवठा करण्याचे आश्वासन दिले.',
    followUpDate: '',
    channel: 'Call',
    officerId: 'USR-ADMIN-1',
    officerName: 'प्रमोद सावंत (Pramod Sawant)',
    syncedToCloud: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'PCC-102',
    campaignId: 'CMP-2026-001',
    producerCode: 'F-102',
    producerName: 'सुभाष रघुनाथ शिंदे (Subhash Shinde)',
    mobileNumber: '9850123456',
    alternateNumber: '',
    village: 'Budhgaon',
    route: 'RT-101',
    linkCenter: 'Sangli Main Link Center',
    collectionCenter: 'Budhgaon Main Dairy',
    milkType: 'Buffalo',
    subject: 'Rate Information',
    status: 'Call Completed',
    callDate: new Date().toISOString().split('T')[0],
    callTime: '09:40',
    callDuration: 210,
    remarks: 'म्हैस दुधाचे रु. ७२ दर समाधानकारक वाटले. फॅट ८.० वर टिकवून ठेवण्यासाठी मिनरल मिक्स्चर वापरणार.',
    followUpDate: '',
    channel: 'Call',
    officerId: 'USR-ADMIN-1',
    officerName: 'प्रमोद सावंत (Pramod Sawant)',
    syncedToCloud: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'PCC-103',
    campaignId: 'CMP-2026-001',
    producerCode: 'F-103',
    producerName: 'प्रकाश बापू मोहिते (Prakash Mohite)',
    mobileNumber: '9763234567',
    alternateNumber: '9922334455',
    village: 'Islampur',
    route: 'RT-102',
    linkCenter: 'Islampur Chilling Link',
    collectionCenter: 'Islampur Hub B',
    milkType: 'Both',
    subject: 'Rate Information',
    status: 'Information Delivered Successfully',
    callDate: new Date().toISOString().split('T')[0],
    callTime: '10:05',
    callDuration: 150,
    remarks: 'मोठ्या गोठ्यातील ६५ लिटर दुधाचे दर व वाहतूक सबसिडीबाबत चर्चा झाली.',
    followUpDate: '',
    channel: 'WhatsApp',
    officerId: 'USR-ADMIN-1',
    officerName: 'प्रमोद सावंत (Pramod Sawant)',
    syncedToCloud: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'PCC-104',
    campaignId: 'CMP-2026-001',
    producerCode: 'F-104',
    producerName: 'आनंदराव कृष्णा कदम (Anandrao Kadam)',
    mobileNumber: '9422045678',
    alternateNumber: '',
    village: 'Walwa',
    route: 'RT-102',
    linkCenter: 'Islampur Chilling Link',
    collectionCenter: 'Walwa Gram Dairy',
    milkType: 'Cow',
    subject: 'Rate Information',
    status: 'Follow-up Required',
    callDate: new Date().toISOString().split('T')[0],
    callTime: '10:30',
    callDuration: 120,
    remarks: 'पशुखाद्य सबसिडी हवी आहे. दोन दिवसांनी प्रत्यक्ष भेटून चर्चा करण्याचे ठरले.',
    followUpDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    channel: 'Call',
    officerId: 'USR-ADMIN-1',
    officerName: 'प्रमोद सावंत (Pramod Sawant)',
    syncedToCloud: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'PCC-105',
    campaignId: 'CMP-2026-001',
    producerCode: 'F-105',
    producerName: 'संजय दत्तात्रय जाधव (Sanjay Jadhav)',
    mobileNumber: '9970156789',
    alternateNumber: '9822445566',
    village: 'Shirala',
    route: 'RT-103',
    linkCenter: 'Shirala BMC Link',
    collectionCenter: 'Shirala Western Center',
    milkType: 'Buffalo',
    subject: 'Rate Information',
    status: 'Call Not Answered',
    callDate: new Date().toISOString().split('T')[0],
    callTime: '11:00',
    callDuration: 0,
    remarks: 'कॉल उचलला नाही. संध्याकाळी संकलन वेळी पुन्हा संपर्क करण्याचे नियोजित.',
    followUpDate: new Date().toISOString().split('T')[0],
    channel: 'Call',
    officerId: 'USR-ADMIN-1',
    officerName: 'प्रमोद सावंत (Pramod Sawant)',
    syncedToCloud: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'PCC-106',
    campaignId: 'CMP-2026-001',
    producerCode: 'F-106',
    producerName: 'गणपत मारुती देसाई (Ganpat Desai)',
    mobileNumber: '9657267890',
    alternateNumber: '',
    village: 'Arag',
    route: 'RT-104',
    linkCenter: 'Miraj Bulk Cooler Link',
    collectionCenter: 'Arag Primary Chilling Unit',
    milkType: 'Cow',
    subject: 'Rate Information',
    status: 'Busy',
    callDate: new Date().toISOString().split('T')[0],
    callTime: '11:15',
    callDuration: 0,
    remarks: 'नंबर व्यस्त येत होता. व्हॉट्सॲपवर माहिती पाठवली.',
    followUpDate: '',
    channel: 'WhatsApp',
    officerId: 'USR-ADMIN-1',
    officerName: 'प्रमोद सावंत (Pramod Sawant)',
    syncedToCloud: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export class ProducerCommunicationService {
  /**
   * Return list of registered producers with normalized linkCenter, village, route, milkType
   */
  static getProducers(): Farmer[] {
    const rawFarmers = StorageService.getFarmers();
    return rawFarmers.map(f => {
      const linkCenter =
        f.linkCenter ||
        (f.route === 'RT-101'
          ? 'Sangli Main Link Center'
          : f.route === 'RT-102'
          ? 'Islampur Chilling Link'
          : f.route === 'RT-103'
          ? 'Shirala BMC Link'
          : f.route === 'RT-104'
          ? 'Miraj Bulk Cooler Link'
          : 'Tasgaon Central Link');
      return {
        ...f,
        linkCenter,
      };
    });
  }

  /**
   * Get all communication campaigns from server & local storage
   */
  static getCampaigns(): CommunicationCampaign[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_CAMPAIGNS);
      if (raw) {
        return JSON.parse(raw);
      }
      localStorage.setItem(STORAGE_KEY_CAMPAIGNS, JSON.stringify(INITIAL_CAMPAIGNS));
      return INITIAL_CAMPAIGNS;
    } catch {
      return INITIAL_CAMPAIGNS;
    }
  }

  /**
   * Save or update a campaign permanently
   */
  static async saveCampaign(campaign: Partial<CommunicationCampaign>): Promise<CommunicationCampaign> {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];

    let currentUser: any = { id: 'USR-ADMIN-1', name: 'प्रमोद सावंत (Pramod Sawant)' };
    try {
      const savedUser = localStorage.getItem('dairy_current_user');
      if (savedUser) currentUser = JSON.parse(savedUser);
    } catch {}

    const fullCampaign: CommunicationCampaign = {
      id: campaign.id || `CMP-${Date.now()}`,
      title: campaign.title || `${campaign.subject || 'Communication'} - ${dateStr}`,
      subject: campaign.subject || 'Rate Information',
      date: campaign.date || dateStr,
      targetRoutes: campaign.targetRoutes || ['all'],
      notes: campaign.notes || '',
      broadcastTemplate: campaign.broadcastTemplate || '',
      createdById: campaign.createdById || currentUser.id,
      createdByName: campaign.createdByName || currentUser.name,
      status: campaign.status || 'active',
      createdAt: campaign.createdAt || now.toISOString(),
      updatedAt: now.toISOString(),
    };

    const list = ProducerCommunicationService.getCampaigns();
    const idx = list.findIndex(c => c.id === fullCampaign.id);
    if (idx >= 0) {
      list[idx] = fullCampaign;
    } else {
      list.unshift(fullCampaign);
    }
    localStorage.setItem(STORAGE_KEY_CAMPAIGNS, JSON.stringify(list));

    // Try server sync
    try {
      fetch('/api/producer-communication/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullCampaign),
      }).catch(() => {});
    } catch {}

    ActivityService.trackActivity({
      activityType: 'report_created',
      title: `मोहीम तयार केली: ${fullCampaign.title}`,
      description: `Communication Campaign created/updated for subject: ${fullCampaign.subject} across routes: ${fullCampaign.targetRoutes.join(', ')}`,
      entityType: 'report',
      entityId: fullCampaign.id,
      entityName: fullCampaign.title,
    });

    window.dispatchEvent(new Event('dairy_producer_communication_updated'));
    return fullCampaign;
  }

  /**
   * Get all producer call tracking records
   */
  static getCalls(): ProducerCommunicationRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_PRODUCER_CALLS);
      if (raw) {
        return JSON.parse(raw);
      }
      localStorage.setItem(STORAGE_KEY_PRODUCER_CALLS, JSON.stringify(INITIAL_PRODUCER_CALLS));
      return INITIAL_PRODUCER_CALLS;
    } catch {
      return INITIAL_PRODUCER_CALLS;
    }
  }

  /**
   * Save or update a single producer call record permanently in Firebase / server & localStorage
   */
  static async saveCall(record: Partial<ProducerCommunicationRecord>): Promise<ProducerCommunicationRecord> {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let currentUser: any = { id: 'USR-ADMIN-1', name: 'प्रमोद सावंत (Pramod Sawant)' };
    try {
      const savedUser = localStorage.getItem('dairy_current_user');
      if (savedUser) currentUser = JSON.parse(savedUser);
    } catch {}

    const fullRecord: ProducerCommunicationRecord = {
      id: record.id || `PCC-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      campaignId: record.campaignId || '',
      producerCode: record.producerCode || '',
      producerName: record.producerName || 'उत्पादक (Producer)',
      mobileNumber: record.mobileNumber || '',
      alternateNumber: record.alternateNumber || '',
      village: record.village || '',
      route: record.route || 'RT-101',
      linkCenter: record.linkCenter || 'Sangli Main Link Center',
      collectionCenter: record.collectionCenter || '',
      milkType: record.milkType || 'Cow',
      subject: record.subject || 'Rate Information',
      status: record.status || 'Call Completed',
      callDate: record.callDate || dateStr,
      callTime: record.callTime || timeStr,
      callDuration: record.callDuration !== undefined ? record.callDuration : 60,
      remarks: record.remarks || '',
      followUpDate: record.followUpDate || '',
      channel: record.channel || 'Call',
      officerId: currentUser.id,
      officerName: currentUser.name,
      syncedToCloud: navigator.onLine,
      createdAt: record.createdAt || now.toISOString(),
      updatedAt: now.toISOString(),
    };

    const list = ProducerCommunicationService.getCalls();
    const idx = list.findIndex(c => c.id === fullRecord.id);
    if (idx >= 0) {
      list[idx] = fullRecord;
    } else {
      list.unshift(fullRecord);
    }
    localStorage.setItem(STORAGE_KEY_PRODUCER_CALLS, JSON.stringify(list));

    // Save to server permanent disk storage / API
    try {
      fetch('/api/producer-communication/calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullRecord),
      }).catch(() => {});
    } catch {}

    // Track activity
    ActivityService.trackActivity({
      activityType: 'call_logged',
      title: `उत्पादक कॉल नोंद: ${fullRecord.producerName}`,
      description: `[${fullRecord.subject}] ${fullRecord.status}: ${fullRecord.remarks || 'नोंद झाली'}`,
      entityType: 'call',
      entityId: fullRecord.id,
      entityName: fullRecord.producerName,
      details: {
        producerCode: fullRecord.producerCode,
        route: fullRecord.route,
        status: fullRecord.status,
      },
    });

    window.dispatchEvent(new Event('dairy_producer_communication_updated'));
    return fullRecord;
  }

  /**
   * Delete a call record permanently (Admin only)
   */
  static deleteCall(id: string): void {
    const list = ProducerCommunicationService.getCalls().filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEY_PRODUCER_CALLS, JSON.stringify(list));

    try {
      fetch(`/api/producer-communication/calls/${id}`, {
        method: 'DELETE',
      }).catch(() => {});
    } catch {}

    window.dispatchEvent(new Event('dairy_producer_communication_updated'));
  }

  /**
   * Get communication history for a specific producer
   */
  static getProducerHistory(producerCode: string): ProducerCommunicationRecord[] {
    const all = ProducerCommunicationService.getCalls();
    return all
      .filter(c => c.producerCode === producerCode)
      .sort((a, b) => new Date(`${b.callDate} ${b.callTime}`).getTime() - new Date(`${a.callDate} ${a.callTime}`).getTime());
  }

  /**
   * Calculate live summary statistics for a set of calls against all producers
   */
  static getSummary(calls: ProducerCommunicationRecord[], totalProducersCount: number): ProducerCommunicationSummary {
    let completed = 0;
    let delivered = 0;
    let notAnswered = 0;
    let busy = 0;
    let switchedOff = 0;
    let followUp = 0;
    let wrongOrUnreachable = 0;
    let callBackRequired = 0;

    // Track unique producers contacted in this query
    const contactedProducers = new Set<string>();

    for (const c of calls) {
      contactedProducers.add(c.producerCode);

      if (c.status === 'Information Delivered Successfully') {
        delivered++;
        completed++;
      } else if (c.status === 'Call Completed') {
        completed++;
      } else if (c.status === 'Call Not Answered') {
        notAnswered++;
      } else if (c.status === 'Busy') {
        busy++;
      } else if (c.status === 'Switched Off') {
        switchedOff++;
      } else if (c.status === 'Call Back Required') {
        callBackRequired++;
        followUp++;
      } else if (c.status === 'Follow-up Required') {
        followUp++;
      } else if (c.status === 'Wrong Number' || c.status === 'Number Not Reachable') {
        wrongOrUnreachable++;
      }

      if (c.followUpDate && c.status !== 'Follow-up Required' && c.status !== 'Call Back Required') {
        followUp++;
      }
    }

    const totalProducers = totalProducersCount > 0 ? totalProducersCount : 1;
    const remainingCalls = Math.max(0, totalProducers - contactedProducers.size);
    const completionPercentage = Math.min(100, Math.round((contactedProducers.size / totalProducers) * 100));

    return {
      totalProducers,
      callsCompleted: completed,
      informationDelivered: delivered,
      notAnswered,
      busy,
      switchedOff,
      followUpPending: followUp,
      remainingCalls,
      wrongOrUnreachable,
      callBackRequired,
      completionPercentage,
    };
  }

  /**
   * Generate customized WhatsApp Web/App broadcast URL
   */
  static generateWhatsAppUrl(
    producer: Farmer,
    subject: string,
    customMessageTemplate?: string,
    dairyName = 'प्रोक्युअर डेअरी (Procure Dairy)'
  ): string {
    const rawNumber = (producer.mobileNumber || '').replace(/\D/g, '');
    const cleanNumber = rawNumber.length === 10 ? `91${rawNumber}` : rawNumber;

    const subjectObj = PRODUCER_COMMUNICATION_SUBJECTS.find(s => s.id === subject);
    let template = customMessageTemplate || subjectObj?.defaultTemplateMr || '';
    if (!template) {
      template = `नमस्कार {नाव} जी, ${dairyName} तर्फे ${subject} बाबत अधिकृत माहिती पाठवत आहोत.`;
    }

    const todayDate = new Date().toLocaleDateString('mr-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const populated = template
      .replace(/\{नाव\}/g, producer.farmerName)
      .replace(/\{name\}/gi, producer.farmerName)
      .replace(/\{तारीख\}/g, todayDate)
      .replace(/\{date\}/gi, todayDate)
      .replace(/\{डेअरी नाव\}/g, dairyName)
      .replace(/\{dairy\}/gi, dairyName);

    const encoded = encodeURIComponent(populated);
    return `https://wa.me/${cleanNumber}?text=${encoded}`;
  }

  /**
   * Generate tailored SMS URL
   */
  static generateSmsUrl(
    producer: Farmer,
    subject: string,
    customMessageTemplate?: string,
    dairyName = 'Procure Dairy'
  ): string {
    const rawNumber = (producer.mobileNumber || '').replace(/\D/g, '');
    const subjectObj = PRODUCER_COMMUNICATION_SUBJECTS.find(s => s.id === subject);
    let template = customMessageTemplate || subjectObj?.defaultTemplateMr || '';
    if (!template) {
      template = `Hello ${producer.farmerName}, notice regarding ${subject} from ${dairyName}.`;
    }

    const todayDate = new Date().toLocaleDateString('en-IN');
    const populated = template
      .replace(/\{नाव\}/g, producer.farmerName)
      .replace(/\{name\}/gi, producer.farmerName)
      .replace(/\{तारीख\}/g, todayDate)
      .replace(/\{date\}/gi, todayDate);

    return `sms:${rawNumber}?body=${encodeURIComponent(populated)}`;
  }

  /**
   * EXPORT REPORT: PDF FORMAT
   */
  static exportReportToPDF(options: {
    subject: string;
    date: string;
    userName: string;
    summary: ProducerCommunicationSummary;
    records: {
      producer: Farmer;
      call?: ProducerCommunicationRecord;
    }[];
    dairyName?: string;
  }): void {
    const {
      subject,
      date,
      userName,
      summary,
      records,
      dairyName = 'प्रोक्युअर डेअरी संघ - उत्पादक संपर्क व कॉल ट्रॅकिंग अहवाल',
    } = options;

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true,
    });

    setupPdfUnicodeFont(doc);

    const pageWidth = 297;
    const margin = 12;
    const contentWidth = pageWidth - margin * 2;

    // Header Background banner
    doc.setFillColor(5, 150, 105); // Emerald
    doc.rect(0, 0, pageWidth, 26, 'F');

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFont(UNICODE_FONT_FAMILY, 'bold');
    doc.setFontSize(15);
    doc.text(dairyName, margin, 11);

    doc.setFont(UNICODE_FONT_FAMILY, 'normal');
    doc.setFontSize(10);
    doc.text(`विषय (Subject): ${subject}  |  दिनांक (Date): ${date}  |  अधिकारी: ${userName}`, margin, 20);

    // Generation timestamp on top right
    const genTimestamp = new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    doc.setFontSize(8);
    doc.text(`अहवाल निर्मिती वेळ: ${genTimestamp}`, pageWidth - margin, 20, { align: 'right' });

    // Summary KPI Block
    let yPos = 32;
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, yPos, contentWidth, 20, 2, 2, 'FD');

    const cardWidth = contentWidth / 7;
    const stats = [
      { label: 'एकूण उत्पादक', val: summary.totalProducers.toString(), color: [30, 41, 59] },
      { label: 'कॉल पूर्ण', val: summary.callsCompleted.toString(), color: [5, 150, 105] },
      { label: 'माहिती दिली', val: summary.informationDelivered.toString(), color: [13, 148, 136] },
      { label: 'उचलला नाही', val: summary.notAnswered.toString(), color: [217, 119, 6] },
      { label: 'व्यस्त (Busy)', val: summary.busy.toString(), color: [234, 88, 12] },
      { label: 'मोबाईल बंद', val: summary.switchedOff.toString(), color: [225, 29, 72] },
      { label: 'फॉलो-अप प्रलंबित', val: summary.followUpPending.toString(), color: [79, 70, 229] },
    ];

    stats.forEach((st, i) => {
      const x = margin + i * cardWidth + cardWidth / 2;
      doc.setTextColor(st.color[0], st.color[1], st.color[2]);
      doc.setFont(UNICODE_FONT_FAMILY, 'bold');
      doc.setFontSize(13);
      doc.text(st.val, x, yPos + 8, { align: 'center' });

      doc.setTextColor(100, 116, 139);
      doc.setFont(UNICODE_FONT_FAMILY, 'normal');
      doc.setFontSize(8);
      doc.text(st.label, x, yPos + 16, { align: 'center' });

      if (i < 6) {
        doc.setDrawColor(226, 232, 240);
        doc.line(margin + (i + 1) * cardWidth, yPos + 3, margin + (i + 1) * cardWidth, yPos + 17);
      }
    });

    yPos += 26;

    // Table Data
    const tableBody = records.map((item, idx) => {
      const p = item.producer;
      const c = item.call;
      const statusText = c?.status || 'कॉल प्रलंबित (Pending)';
      const durationText = c ? `${Math.floor(c.callDuration / 60)}m ${c.callDuration % 60}s` : '-';
      const timeText = c?.callTime || '-';
      const remarksText = c?.remarks || '-';
      const followUpText = c?.followUpDate || '-';

      return [
        (idx + 1).toString(),
        p.farmerCode,
        p.farmerName,
        p.mobileNumber,
        p.village,
        p.route,
        p.linkCenter || '-',
        p.collectionCenter,
        p.milkType,
        statusText,
        timeText,
        durationText,
        remarksText,
        followUpText,
      ];
    });

    autoTable(doc, {
      startY: yPos,
      margin: { left: margin, right: margin, bottom: 18 },
      head: [
        [
          'क्र.',
          'कोड',
          'उत्पादकाचे नाव (Producer Name)',
          'मोबाईल',
          'गाव',
          'रूट',
          'लिंक सेंटर',
          'संकलन केंद्र',
          'प्रकार',
          'कॉल स्थिती (Status)',
          'वेळ',
          'कालावधी',
          'नोंदी / शेरा (Remarks)',
          'फॉलो-अप',
        ],
      ],
      body: tableBody,
      styles: {
        ...UNICODE_AUTOTABLE_STYLES,
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak',
        textColor: [30, 41, 59],
      },
      headStyles: {
        ...UNICODE_AUTOTABLE_HEAD_STYLES,
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontSize: 8,
        halign: 'center',
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { cellWidth: 8, halign: 'center' },
        1: { cellWidth: 14, halign: 'center' },
        2: { cellWidth: 38 },
        3: { cellWidth: 20, halign: 'center' },
        4: { cellWidth: 18 },
        5: { cellWidth: 14, halign: 'center' },
        6: { cellWidth: 24 },
        7: { cellWidth: 24 },
        8: { cellWidth: 12, halign: 'center' },
        9: { cellWidth: 24, fontStyle: 'bold' },
        10: { cellWidth: 12, halign: 'center' },
        11: { cellWidth: 14, halign: 'center' },
        12: { cellWidth: 35 },
        13: { cellWidth: 16, halign: 'center' },
      },
      didDrawPage: data => {
        // Footer
        doc.setFont(UNICODE_FONT_FAMILY, 'normal');
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(
          `प्रोक्युअर डेअरी मॅनेजमेंट सिस्टीम - पान ${data.pageNumber} / {total_pages_count_string}`,
          margin,
          205
        );
        doc.text(`स्वाक्षरी / अधिकारी: ${userName}`, pageWidth - margin, 205, { align: 'right' });
      },
    });

    const filename = `Producer_Communication_${subject.replace(/[^a-zA-Z0-9]/g, '_')}_${date}.pdf`;
    doc.save(filename);

    DownloadService.addDownload({
      name: filename,
      type: 'pdf',
      size: `${Math.round(records.length * 1.8 + 80)} KB`,
      category: 'उत्पादक संपर्क अहवाल (Communication Report)',
      generatedBy: userName,
      recordCount: records.length,
    });
  }

  /**
   * EXPORT REPORT: EXCEL (.XLSX) FORMAT
   */
  static exportReportToExcel(options: {
    subject: string;
    date: string;
    userName: string;
    summary: ProducerCommunicationSummary;
    records: {
      producer: Farmer;
      call?: ProducerCommunicationRecord;
    }[];
  }): void {
    const { subject, date, userName, summary, records } = options;
    const wb = XLSX.utils.book_new();

    // Sheet 1: Summary KPI Card
    const summaryData = [
      ['PRODUCER COMMUNICATION & CALL TRACKING REPORT'],
      ['Communication Subject', subject],
      ['Campaign / Report Date', date],
      ['Reporting Officer / User', userName],
      ['Report Generation Date & Time', new Date().toLocaleString('en-IN')],
      [],
      ['SUMMARY METRICS', 'COUNT'],
      ['Total Producers (एकूण उत्पादक)', summary.totalProducers],
      ['Calls Completed (कॉल पूर्ण)', summary.callsCompleted],
      ['Information Delivered (माहिती दिली)', summary.informationDelivered],
      ['Call Not Answered (उचलला नाही)', summary.notAnswered],
      ['Busy (व्यस्त)', summary.busy],
      ['Switched Off (मोबाईल बंद)', summary.switchedOff],
      ['Follow-up Required (फॉलो-अप प्रलंबित)', summary.followUpPending],
      ['Remaining Calls (शिल्लक कॉल्स)', summary.remainingCalls],
      ['Completion Rate (%)', `${summary.completionPercentage}%`],
    ];

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

    // Sheet 2: Detailed Producer Call Register
    const rows = records.map((item, idx) => {
      const p = item.producer;
      const c = item.call;
      return {
        'Sr No': idx + 1,
        'Producer Code': p.farmerCode,
        'Producer Name': p.farmerName,
        'Mobile Number': p.mobileNumber,
        'Alternate Mobile': p.alternateNumber || '-',
        'Village': p.village,
        'Route': p.route,
        'Link Center': p.linkCenter || '-',
        'Collection Center': p.collectionCenter,
        'Milk Type': p.milkType,
        'Communication Subject': subject,
        'Call Status': c?.status || 'Pending',
        'Call Date': c?.callDate || date,
        'Call Time': c?.callTime || '-',
        'Duration (Sec)': c?.callDuration || 0,
        'Channel': c?.channel || 'Call',
        'Remarks / Notes': c?.remarks || '-',
        'Follow-up Date': c?.followUpDate || '-',
        'Officer Name': c?.officerName || userName,
      };
    });

    const wsDetails = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, wsDetails, 'Producer_Call_Details');

    const filename = `Producer_Communication_${subject.replace(/[^a-zA-Z0-9]/g, '_')}_${date}.xlsx`;
    XLSX.writeFile(wb, filename);

    DownloadService.addDownload({
      name: filename,
      type: 'excel',
      size: `${Math.round(records.length * 0.9 + 45)} KB`,
      category: 'उत्पादक संपर्क अहवाल (Communication Report)',
      generatedBy: userName,
      recordCount: records.length,
    });
  }

  /**
   * EXPORT REPORT: CSV FORMAT (UTF-8 with BOM for Marathi compatibility)
   */
  static exportReportToCSV(options: {
    subject: string;
    date: string;
    userName: string;
    records: {
      producer: Farmer;
      call?: ProducerCommunicationRecord;
    }[];
  }): void {
    const { subject, date, userName, records } = options;

    const headers = [
      'Sr No',
      'Producer Code',
      'Producer Name',
      'Mobile Number',
      'Village',
      'Route',
      'Link Center',
      'Collection Center',
      'Milk Type',
      'Subject',
      'Call Status',
      'Call Date',
      'Call Time',
      'Duration (Sec)',
      'Channel',
      'Remarks',
      'Follow-up Date',
      'Officer Name',
    ];

    const rows = records.map((item, idx) => {
      const p = item.producer;
      const c = item.call;
      return [
        idx + 1,
        `"${p.farmerCode}"`,
        `"${p.farmerName.replace(/"/g, '""')}"`,
        `"${p.mobileNumber}"`,
        `"${p.village}"`,
        `"${p.route}"`,
        `"${(p.linkCenter || '').replace(/"/g, '""')}"`,
        `"${p.collectionCenter.replace(/"/g, '""')}"`,
        `"${p.milkType}"`,
        `"${subject.replace(/"/g, '""')}"`,
        `"${(c?.status || 'Pending').replace(/"/g, '""')}"`,
        `"${c?.callDate || date}"`,
        `"${c?.callTime || ''}"`,
        c?.callDuration || 0,
        `"${c?.channel || 'Call'}"`,
        `"${(c?.remarks || '').replace(/"/g, '""')}"`,
        `"${c?.followUpDate || ''}"`,
        `"${(c?.officerName || userName).replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const filename = `Producer_Communication_${subject.replace(/[^a-zA-Z0-9]/g, '_')}_${date}.csv`;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    DownloadService.addDownload({
      name: filename,
      type: 'csv',
      size: `${Math.round(records.length * 0.4 + 20)} KB`,
      category: 'उत्पादक संपर्क अहवाल (Communication Report)',
      generatedBy: userName,
      recordCount: records.length,
    });
  }

  /**
   * EXPORT REPORT: MICROSOFT WORD (.DOC) FORMAT
   */
  static exportReportToWord(options: {
    subject: string;
    date: string;
    userName: string;
    summary: ProducerCommunicationSummary;
    records: {
      producer: Farmer;
      call?: ProducerCommunicationRecord;
    }[];
    dairyName?: string;
  }): void {
    const {
      subject,
      date,
      userName,
      summary,
      records,
      dairyName = 'प्रोक्युअर डेअरी संघ - दूध संकलन व क्षेत्रीय अधिकारी CRM',
    } = options;

    const genTimestamp = new Date().toLocaleString('en-IN');

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Producer Communication Report</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 11pt; color: #1e293b; margin: 20px; }
          .header { background-color: #059669; color: #ffffff; padding: 18px; border-radius: 6px; }
          .header h1 { margin: 0 0 6px 0; font-size: 18pt; }
          .header p { margin: 0; font-size: 10.5pt; opacity: 0.95; }
          .meta-box { background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 14px; margin: 16px 0; }
          .meta-grid { display: table; width: 100%; }
          .meta-row { display: table-row; }
          .meta-cell { display: table-cell; padding: 4px 10px; font-size: 10pt; }
          .kpi-table { width: 100%; border-collapse: collapse; margin: 16px 0; }
          .kpi-table th { background: #0f172a; color: white; padding: 8px; font-size: 9.5pt; border: 1px solid #334155; }
          .kpi-table td { background: #f1f5f9; padding: 10px; text-align: center; font-size: 11pt; font-weight: bold; border: 1px solid #cbd5e1; }
          .data-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          .data-table th { background-color: #1e293b; color: #ffffff; padding: 8px 6px; text-align: left; font-size: 9pt; border: 1px solid #475569; }
          .data-table td { padding: 6px; border: 1px solid #cbd5e1; font-size: 8.5pt; }
          .data-table tr:nth-child(even) { background-color: #f8fafc; }
          .badge { padding: 2px 6px; border-radius: 4px; font-size: 8pt; font-weight: bold; }
          .badge-completed { background: #dcfce7; color: #166534; }
          .badge-not-answered { background: #fef3c7; color: #92400e; }
          .badge-busy { background: #ffedd5; color: #9a3412; }
          .badge-switched-off { background: #ffe4e6; color: #9f1239; }
          .footer { margin-top: 30px; font-size: 9pt; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 10px; display: table; width: 100%; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${dairyName}</h1>
          <p><strong>उत्पादक संपर्क व कॉल ट्रॅकिंग अहवाल (Producer Communication & Call Tracking Report)</strong></p>
        </div>

        <div class="meta-box">
          <div class="meta-grid">
            <div class="meta-row">
              <div class="meta-cell"><strong>विषय (Subject):</strong> ${subject}</div>
              <div class="meta-cell"><strong>तारीख (Date):</strong> ${date}</div>
            </div>
            <div class="meta-row">
              <div class="meta-cell"><strong>अधिकारी (User Name):</strong> ${userName}</div>
              <div class="meta-cell"><strong>निर्मिती वेळ (Generated At):</strong> ${genTimestamp}</div>
            </div>
          </div>
        </div>

        <table class="kpi-table">
          <tr>
            <th>एकूण उत्पादक</th>
            <th>कॉल पूर्ण</th>
            <th>माहिती दिली</th>
            <th>उचलला नाही</th>
            <th>व्यस्त (Busy)</th>
            <th>मोबाईल बंद</th>
            <th>फॉलो-अप प्रलंबित</th>
            <th>शिल्लक कॉल्स</th>
          </tr>
          <tr>
            <td>${summary.totalProducers}</td>
            <td style="color: #059669;">${summary.callsCompleted}</td>
            <td style="color: #0d9488;">${summary.informationDelivered}</td>
            <td style="color: #d97706;">${summary.notAnswered}</td>
            <td style="color: #ea580c;">${summary.busy}</td>
            <td style="color: #e11d48;">${summary.switchedOff}</td>
            <td style="color: #4f46e5;">${summary.followUpPending}</td>
            <td>${summary.remainingCalls}</td>
          </tr>
        </table>

        <h3>उत्पादकनिहाय कॉल व संपर्क तपशील (Producer-wise Call Details)</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>कोड</th>
              <th>उत्पादकाचे नाव</th>
              <th>मोबाईल</th>
              <th>गाव</th>
              <th>रूट</th>
              <th>लिंक सेंटर</th>
              <th>संकलन केंद्र</th>
              <th>प्रकार</th>
              <th>कॉल स्थिती (Status)</th>
              <th>वेळ</th>
              <th>कालावधी</th>
              <th>नोंदी / शेरा (Remarks)</th>
              <th>फॉलो-अप</th>
            </tr>
          </thead>
          <tbody>
            ${records
              .map((item, idx) => {
                const p = item.producer;
                const c = item.call;
                const status = c?.status || 'Pending';
                const duration = c ? `${Math.floor(c.callDuration / 60)}m ${c.callDuration % 60}s` : '-';
                return `
                  <tr>
                    <td>${idx + 1}</td>
                    <td><strong>${p.farmerCode}</strong></td>
                    <td>${p.farmerName}</td>
                    <td>${p.mobileNumber}</td>
                    <td>${p.village}</td>
                    <td>${p.route}</td>
                    <td>${p.linkCenter || '-'}</td>
                    <td>${p.collectionCenter}</td>
                    <td>${p.milkType}</td>
                    <td><strong>${status}</strong></td>
                    <td>${c?.callTime || '-'}</td>
                    <td>${duration}</td>
                    <td>${c?.remarks || '-'}</td>
                    <td>${c?.followUpDate || '-'}</td>
                  </tr>
                `;
              })
              .join('')}
          </tbody>
        </table>

        <div class="footer">
          <div style="display: table-cell;">प्रोक्युअर डेअरी व्यवस्थापन सिस्टीम - अधिकृत अहवाल</div>
          <div style="display: table-cell; text-align: right;"><strong>स्वाक्षरी:</strong> ${userName}</div>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\uFEFF', htmlContent], {
      type: 'application/msword;charset=utf-8',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const filename = `Producer_Communication_${subject.replace(/[^a-zA-Z0-9]/g, '_')}_${date}.doc`;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    DownloadService.addDownload({
      name: filename,
      type: 'word',
      size: `${Math.round(records.length * 0.8 + 35)} KB`,
      category: 'उत्पादक संपर्क अहवाल (Communication Report)',
      generatedBy: userName,
      recordCount: records.length,
    });
  }
}
