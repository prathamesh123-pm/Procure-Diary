import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'mr';

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // App & Navigation
    'app.title': 'Procure Diary',
    'app.fullname': 'Procure Diary – Milk Procurement Executive CRM',
    'app.subtitle': 'Personal Field Management & Gavali (गवळी) Relationship CRM',
    'nav.dashboard': 'Dashboard',
    'nav.calls': 'Calls & Visits',
    'nav.incoming': 'Inbound',
    'nav.farmers': 'Gavalis & Farmers',
    'nav.routes': 'Routes',
    'nav.tasks': 'Pending Work',
    'nav.followups': 'Follow-Ups',
    'nav.work_plan': 'Daily Tour Plan',
    'nav.rate_calc': 'Rate Calculator',
    'nav.reports': 'Reports & Dairy',
    'nav.users': 'User Control',
    'nav.ai_assistant': 'AI Copilot',

    // Dashboard Stats
    'dash.today_total': "Today's Field Calls & Visits",
    'dash.incoming': 'Incoming Calls',
    'dash.outgoing': 'Outgoing Calls',
    'dash.completed': 'Completed Interactions',
    'dash.pending': 'Pending Calls',
    'dash.not_received': 'Not Reachable / Busy',
    'dash.switched_off': 'Switched Off',
    'dash.busy': 'Busy / Coverage',
    'dash.followup_today': 'Follow-Up Due Today',
    'dash.followup_overdue': 'Overdue Follow-Ups',
    'dash.monthly_calls': 'Monthly Call Volume',
    'dash.pending_tasks': 'Active Pending Tasks',
    'dash.route_summary': 'Route Wise Procurement',
    'dash.officer_summary': 'Executive Performance',
    'dash.quick_actions': 'Quick Actions',
    'dash.download_today_pdf': 'Daily Field Diary PDF',
    'dash.export_excel': 'Export Excel',
    'dash.recent_calls': "Today's Field Log",
    'dash.view_all': 'View All',
    'dash.quick_search': 'Search Gavali / Village / Route / Task...',
    'dash.ai_insights': 'Procurement AI Daily Intelligence',

    // Call Register
    'call.title': 'Call & Field Visit Register',
    'call.new_call': 'Log Call / Visit',
    'call.log_incoming': 'Log Inbound Call',
    'call.date': 'Date',
    'call.time': 'Time',
    'call.direction': 'Type',
    'call.farmer_code': 'Gavali / Farmer Code',
    'call.farmer_name': 'Gavali / Farmer Name',
    'call.mobile': 'Mobile Number',
    'call.route': 'Route',
    'call.village': 'Village',
    'call.purpose': 'Interaction Purpose',
    'call.status': 'Status',
    'call.discussion': 'Discussion & Notes',
    'call.info_given': 'Rate / Guidance Given',
    'call.pending_work': 'Pending Action Item',
    'call.followup_date': 'Follow-Up Date',
    'call.priority': 'Priority',
    'call.officer': 'Procurement Executive',
    'call.duration': 'Duration',
    'call.voice_note': 'Voice Audio Note',
    'call.attachments': 'Attachments / Photos',
    'call.ai_summary': 'AI Summary',
    'call.has_pending': 'Generate Action Item',

    // Purposes
    'purpose.milk_collection': 'Milk Collection Expansion',
    'purpose.rate_info': 'Rate & Incentive Discussion',
    'purpose.complaint': 'Fat/Quality Grievance',
    'purpose.payment': 'Payment Settlement Issue',
    'purpose.advance': 'Advance (उचल) / Loan Request',
    'purpose.rt': 'Sample RT Test / Chilling Quality',
    'purpose.milk_quality': 'Milk Quality / Acidity Issue',
    'purpose.visit': 'Gavali Shed / Yard Visit',
    'purpose.new_producer': 'New Gavali Acquisition',
    'purpose.collection_increase': 'Procurement Volume Drive',
    'purpose.animal_info': 'Feed & Mineral Mixture Support',
    'purpose.other': 'Other Field Discussion',

    // Statuses
    'status.completed': 'Completed / Visit Done',
    'status.not_received': 'Not Received',
    'status.switched_off': 'Switched Off',
    'status.busy': 'Busy / Line Waiting',
    'status.out_of_coverage': 'Out of Coverage Area',
    'status.call_back_later': 'Call Back Later',
    'status.followup_required': 'Follow-up Required',
    'status.invalid_number': 'Invalid Number',
    'status.wrong_number': 'Wrong Number',
    'status.visit_completed': 'Field Visit Completed',
    'status.other': 'Other',

    // Farmer Master (Gavali Directory)
    'farmer.title': 'Gavali & Farmer Master Directory',
    'farmer.add_new': 'Add Gavali / Farmer',
    'farmer.import_excel': 'Import Excel',
    'farmer.export_excel': 'Export Excel',
    'farmer.qr_code': 'Gavali ID & QR Code',
    'farmer.daily_milk': 'Daily Milk (Ltr)',
    'farmer.milk_type': 'Milk Type',
    'farmer.supplier_type': 'Supplier Type',
    'farmer.collection_center': 'Collection Center / Route',
    'farmer.alt_number': 'Alternate Number',
    'farmer.remarks': 'Notes / Retention Risk',
    'farmer.active': 'Active',
    'farmer.irregular': 'Irregular',
    'farmer.stopped': 'Stopped / Diverted',
    'farmer.at_risk': 'At Risk (Competitor Threat)',
    'farmer.history': 'Gavali 360° History',
    'farmer.cow': 'Cow Milk',
    'farmer.buffalo': 'Buffalo Milk',
    'farmer.both': 'Both (Cow & Buffalo)',

    // Routes
    'route.title': 'Route Management',
    'route.add': 'Add New Route',
    'route.number': 'Route Number',
    'route.name': 'Route Name',
    'route.area': 'Area / Taluka',
    'route.centers': 'Collection Centers',
    'route.farmers_count': 'Total Farmers',
    'route.status': 'Route Status',

    // Pending Work
    'task.title': 'Pending Work Management',
    'task.add': 'Create Work Item',
    'task.work_name': 'Work / Issue Title',
    'task.description': 'Description',
    'task.assigned_to': 'Assigned Officer',
    'task.due_date': 'Due Date',
    'task.completion_date': 'Completed On',
    'task.pending': 'Pending',
    'task.in_progress': 'In Progress',
    'task.completed': 'Completed',
    'task.closed': 'Closed',
    'task.mark_done': 'Mark Done',

    // Follow Up
    'followup.title': 'Follow-Up Schedule',
    'followup.today': "Today's Follow-Ups",
    'followup.tomorrow': "Tomorrow's Follow-Ups",
    'followup.overdue': 'Overdue Follow-Ups',
    'followup.reschedule': 'Reschedule',
    'followup.complete': 'Mark Completed',
    'followup.cancel': 'Cancel',

    // General & Actions
    'btn.save': 'Save Record',
    'btn.cancel': 'Cancel',
    'btn.edit': 'Edit',
    'btn.delete': 'Delete',
    'btn.search': 'Search...',
    'btn.filter': 'Filter',
    'btn.call': 'Call',
    'btn.whatsapp': 'WhatsApp',
    'btn.sms': 'SMS',
    'btn.maps': 'Navigate',
    'btn.record_audio': 'Record Voice Note',
    'btn.stop_audio': 'Stop & Save',
    'btn.login': 'Log In',
    'btn.logout': 'Sign Out',
    'btn.refresh': 'Sync Cloud',
    'btn.generate_pdf': 'Download PDF Report',
    'btn.generate_excel': 'Download Excel File',

    // Auth & Security
    'auth.title': 'Dairy Operations Portal',
    'auth.subtitle': 'Enter credentials to access secure system',
    'auth.email_user': 'Email or User ID',
    'auth.password': 'Password',
    'auth.mobile_login': 'Login with Mobile & OTP',
    'auth.role': 'User Role',
    'auth.admin': 'Administrator',
    'auth.officer': 'Collection Officer',
    'auth.supervisor': 'Field Supervisor',
    'auth.quick_demo': 'Quick Switch Demo Account',

    // Common labels
    'common.high': 'High',
    'common.medium': 'Medium',
    'common.low': 'Low',
    'common.all': 'All',
    'common.no_records': 'No records found',
    'common.synced': 'Cloud Synced',
    'common.offline': 'Offline Mode (Auto-sync ready)',
    'common.last_sync': 'Last Synced',
  },
  mr: {
    // App & Navigation
    'app.title': 'प्रोक्युअर डायरी',
    'app.fullname': 'प्रोक्युअर डायरी – दूध संकलन अधिकारी CRM',
    'app.subtitle': 'दूध संकलन अधिकारी वैयक्तिक कार्यव्यवस्थापन व गवळी (गवळी) CRM',
    'nav.dashboard': 'डॅशबोर्ड',
    'nav.calls': 'कॉल व शेतभेटी',
    'nav.incoming': 'इनकमिंग कॉल',
    'nav.farmers': 'गवळी व शेतकरी',
    'nav.routes': 'रूट व्यवस्थापन',
    'nav.tasks': 'प्रलंबित कामे',
    'nav.followups': 'फॉलो-अप',
    'nav.work_plan': 'दौरा व कार्य नियोजन',
    'nav.rate_calc': 'दर व फॅट कॅल्क्युलेटर',
    'nav.reports': 'अहवाल व डायरी',
    'nav.users': 'वापरकर्ते नियंत्रण',
    'nav.ai_assistant': 'AI प्रोक्युअर सहाय्यक',

    // Dashboard Stats
    'dash.today_total': 'आजचे एकूण कॉल व शेतभेटी',
    'dash.incoming': 'इनकमिंग कॉल',
    'dash.outgoing': 'आउटगोइंग कॉल',
    'dash.completed': 'पूर्ण झालेला संपर्क',
    'dash.pending': 'प्रलंबित कॉल',
    'dash.not_received': 'न उचललेले / व्यस्त',
    'dash.switched_off': 'स्विच ऑफ कॉल',
    'dash.busy': 'व्यस्त / कव्हरेजबाहेर',
    'dash.followup_today': 'आजचे फॉलो-अप',
    'dash.followup_overdue': 'मुदत उलटलेले फॉलो-अप',
    'dash.monthly_calls': 'मासिक एकूण कॉल',
    'dash.pending_tasks': 'सक्रिय प्रलंबित कामे',
    'dash.route_summary': 'रूटनुसार संकलन सारांश',
    'dash.officer_summary': 'अधिकारी कामकाज कामगिरी',
    'dash.quick_actions': 'त्वरित कृती बटणे',
    'dash.download_today_pdf': 'दैनंदिन डायरी PDF',
    'dash.export_excel': 'एक्सेल निर्यात',
    'dash.recent_calls': 'आजची संपर्क व भेट नोंद यादी',
    'dash.view_all': 'सर्व पहा',
    'dash.quick_search': 'गवळी / गाव / रूट / काम शोधा...',
    'dash.ai_insights': 'AI दैनंदिन संकलन मार्गदर्शन',

    // Call Register
    'call.title': 'कॉल व भेट नोंदवही (Register)',
    'call.new_call': 'नवीन कॉल / भेट नोंदवा',
    'call.log_incoming': 'इनकमिंग कॉल नोंदवा',
    'call.date': 'दिनांक',
    'call.time': 'वेळ',
    'call.direction': 'प्रकार',
    'call.farmer_code': 'गवळी / शेतकरी कोड',
    'call.farmer_name': 'गवळी / पुरवठादाराचे नाव',
    'call.mobile': 'मोबाईल नंबर',
    'call.route': 'रूट',
    'call.village': 'गाव',
    'call.purpose': 'संभाषण / भेटीचा उद्देश',
    'call.status': 'स्थिती (Status)',
    'call.discussion': 'झालेली चर्चा व नोंदी',
    'call.info_given': 'दिलेली माहिती / दर',
    'call.pending_work': 'प्रलंबित काम / तक्रार',
    'call.followup_date': 'फॉलो-अप तारीख',
    'call.priority': 'प्राधान्य',
    'call.officer': 'संकलन अधिकारी',
    'call.duration': 'कालावधी',
    'call.voice_note': 'ऑडिओ व्हॉईस नोट',
    'call.attachments': 'संलग्न फोटो / कागदपत्रे',
    'call.ai_summary': 'AI सारांश',
    'call.has_pending': 'प्रलंबित काम तयार करा',

    // Purposes
    'purpose.milk_collection': 'दूध संकलन वाढ मोहीम',
    'purpose.rate_info': 'दर व इन्सेंटिव्ह माहिती',
    'purpose.complaint': 'फॅट / गुणवत्ता तक्रार निवारण',
    'purpose.payment': 'बिल / पेमेंट चौकशी',
    'purpose.advance': 'अ‍ॅडव्हान्स / उचल मागणी',
    'purpose.rt': 'RT सॅम्पल चाचणी / गुणवत्ता तपासणी',
    'purpose.milk_quality': 'दूध गुणवत्ता / नासणे अडचण',
    'purpose.visit': 'गवळी गोठा भेट / पाहणी',
    'purpose.new_producer': 'नवीन गवळी / शेतकरी जोडणे',
    'purpose.collection_increase': 'संकलन क्षमता वाढ',
    'purpose.animal_info': 'पशुखाद्य व मिनरल मिक्चर पुरवठा',
    'purpose.other': 'इतर फील्ड विषय',

    // Statuses
    'status.completed': 'पूर्ण झाले / भेट झाली',
    'status.not_received': 'फोन उचलला नाही',
    'status.switched_off': 'स्विच ऑफ आहे',
    'status.busy': 'व्यस्त (Busy)',
    'status.out_of_coverage': 'कव्हरेज क्षेत्राबाहेर',
    'status.call_back_later': 'नंतर पुन्हा फोन करणे',
    'status.followup_required': 'फॉलो-अप आवश्यक',
    'status.invalid_number': 'अवैध नंबर',
    'status.wrong_number': 'चुकीचा नंबर',
    'status.visit_completed': 'शेतभेट पूर्ण झाली',
    'status.other': 'इतर स्थिती',

    // Farmer Master
    'farmer.title': 'गवळी व शेतकरी मास्टर नोंदवही',
    'farmer.add_new': 'नवीन गवळी / शेतकरी जोडा',
    'farmer.import_excel': 'एक्सेल आयात (Import)',
    'farmer.export_excel': 'एक्सेल निर्यात (Export)',
    'farmer.qr_code': 'गवळी आयडी व QR कोड',
    'farmer.daily_milk': 'दैनिक दूध (लिटर)',
    'farmer.milk_type': 'दूध प्रकार',
    'farmer.supplier_type': 'पुरवठादार प्रकार (Supplier Type)',
    'farmer.collection_center': 'संकलन केंद्र / रूट',
    'farmer.alt_number': 'पर्यायी नंबर',
    'farmer.remarks': 'शेरा / संकलन टीप',
    'farmer.active': 'सक्रिय (Active)',
    'farmer.irregular': 'अनियमित (Irregular)',
    'farmer.stopped': 'बंद / डायव्हर्ट झालेले',
    'farmer.at_risk': 'धोक्यात (Competitor Threat)',
    'farmer.history': 'गवळ्याचा ३६०° इतिहास',
    'farmer.cow': 'गाय दूध',
    'farmer.buffalo': 'म्हैस दूध',
    'farmer.both': 'गाय व म्हैस दोन्ही',

    // Routes
    'route.title': 'रूट व्यवस्थापन',
    'route.add': 'नवीन रूट जोडा',
    'route.number': 'रूट नंबर',
    'route.name': 'रूटचे नाव',
    'route.area': 'परिसर / तालुका',
    'route.centers': 'संकलन केंद्रे',
    'route.farmers_count': 'एकूण शेतकरी',
    'route.status': 'रूट स्थिती',

    // Pending Work
    'task.title': 'प्रलंबित कामे व्यवस्थापन',
    'task.add': 'नवीन काम जोडा',
    'task.work_name': 'कामाचे शीर्षक / विषय',
    'task.description': 'तपशीलवार वर्णन',
    'task.assigned_to': 'नियुक्त अधिकारी',
    'task.due_date': 'अंतिम तारीख',
    'task.completion_date': 'पूर्ण केलेली तारीख',
    'task.pending': 'प्रलंबित',
    'task.in_progress': 'प्रगतीपथावर',
    'task.completed': 'पूर्ण झाले',
    'task.closed': 'बंद केले',
    'task.mark_done': 'पूर्ण करा',

    // Follow Up
    'followup.title': 'फॉलो-अप वेळापत्रक',
    'followup.today': 'आजचे फॉलो-अप',
    'followup.tomorrow': 'उद्याचे फॉलो-अप',
    'followup.overdue': 'थकबाकी / मुदत संपलेले',
    'followup.reschedule': 'तारीख बदला',
    'followup.complete': 'पूर्ण म्हणून चिन्हांकित करा',
    'followup.cancel': 'रद्द करा',

    // General & Actions
    'btn.save': 'माहिती जतन करा',
    'btn.cancel': 'रद्द करा',
    'btn.edit': 'संपादित करा',
    'btn.delete': 'हटवा',
    'btn.search': 'शोधा...',
    'btn.filter': 'फिल्टर',
    'btn.call': 'कॉल करा',
    'btn.whatsapp': 'व्हॉट्सअ‍ॅप',
    'btn.sms': 'एसएमएस पाठवा',
    'btn.maps': 'रस्ता नकाशा',
    'btn.record_audio': 'व्हॉईस नोट रेकॉर्ड करा',
    'btn.stop_audio': 'थांबवा व सेव्ह करा',
    'btn.login': 'लॉगिन करा',
    'btn.logout': 'लॉगआउट करा',
    'btn.refresh': 'क्लाउड सिंक करा',
    'btn.generate_pdf': 'PDF अहवाल डाउनलोड',
    'btn.generate_excel': 'एक्सेल फाइल डाउनलोड',

    // Auth & Security
    'auth.title': 'दुग्ध ऑपरेशन्स पोर्टल',
    'auth.subtitle': 'सुरक्षित प्रणालीमध्ये प्रवेश करण्यासाठी लॉगिन करा',
    'auth.email_user': 'ईमेल किंवा युजर आयडी',
    'auth.password': 'पासवर्ड',
    'auth.mobile_login': 'मोबाईल नंबर आणि OTP द्वारे लॉगिन',
    'auth.role': 'वापरकर्ता पद (Role)',
    'auth.admin': 'प्रशासक (Admin)',
    'auth.officer': 'संकलन अधिकारी (Collection Officer)',
    'auth.supervisor': 'क्षेत्र पर्यवेक्षक (Field Supervisor)',
    'auth.quick_demo': 'डेमो खात्यात त्वरित स्विच करा',

    // Common labels
    'common.high': 'उच्च (High)',
    'common.medium': 'मध्यम (Medium)',
    'common.low': 'कमी (Low)',
    'common.all': 'सर्व',
    'common.no_records': 'कोणतीही नोंद सापडली नाही',
    'common.synced': 'क्लाउड सिंक झालेले',
    'common.offline': 'ऑफलाइन मोड (ऑटो-सिंक तयार)',
    'common.last_sync': 'शेवटचे सिंक',
  },
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'mr',
  setLanguage: () => {},
  t: (key: string) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('dairy_app_lang');
    return (saved === 'en' || saved === 'mr') ? saved : 'mr'; // Default Marathi for authentic dairy ops
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('dairy_app_lang', lang);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
