import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  Phone,
  MessageSquare,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Calendar,
  Building,
  User,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { StorageService } from '../../services/storageService';
import { MPOStorageService } from '../../services/mpoStorageService';
import { Farmer, LinkCenter, CollectionCenter } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';

export const FssaiComplianceView: React.FC = () => {
  const { language } = useLanguage();
  const isMr = language === 'mr';
  const { showToast } = useToast();

  const [statusFilter, setStatusFilter] = useState<'all' | 'expiring' | 'expired' | 'active' | 'missing'>('expiring');
  const [searchTerm, setSearchTerm] = useState('');
  const [targetType, setTargetType] = useState<'all' | 'producers' | 'centers'>('all');

  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [linkCenters, setLinkCenters] = useState<LinkCenter[]>([]);
  const [collectionCenters, setCollectionCenters] = useState<CollectionCenter[]>([]);

  const loadData = () => {
    setFarmers(StorageService.getFarmers());
    setLinkCenters(MPOStorageService.getLinkCenters());
    setCollectionCenters(MPOStorageService.getCollectionCenters());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('dairy_mpo_updated', loadData);
    window.addEventListener('dairy_storage_updated', loadData);
    return () => {
      window.removeEventListener('dairy_mpo_updated', loadData);
      window.removeEventListener('dairy_storage_updated', loadData);
    };
  }, []);

  // Compute unified list
  interface ComplianceItem {
    id: string;
    type: 'Producer' | 'Link Center' | 'Collection Center';
    code: string;
    name: string;
    contactName: string;
    mobileNumber: string;
    villageOrAddress: string;
    route?: string;
    fssaiNumber?: string;
    fssaiExpiryDate?: string;
    daysRemaining?: number;
    status: 'Active' | 'Expiring Soon' | 'Expired' | 'Missing';
  }

  const today = new Date();
  const thirtyDaysAhead = new Date();
  thirtyDaysAhead.setDate(today.getDate() + 30);

  const items: ComplianceItem[] = [];

  // 1. Add Farmers
  farmers.forEach(f => {
    let status: ComplianceItem['status'] = 'Missing';
    let daysRemaining: number | undefined = undefined;

    if (f.fssaiExpiryDate) {
      const exp = new Date(f.fssaiExpiryDate);
      const diffTime = exp.getTime() - today.getTime();
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (daysRemaining < 0) {
        status = 'Expired';
      } else if (daysRemaining <= 30) {
        status = 'Expiring Soon';
      } else {
        status = 'Active';
      }
    } else if (f.fssaiNumber) {
      status = 'Active';
    }

    items.push({
      id: f.id,
      type: 'Producer',
      code: f.farmerCode,
      name: f.name,
      contactName: f.name,
      mobileNumber: f.mobileNumber,
      villageOrAddress: f.village,
      route: f.route,
      fssaiNumber: f.fssaiNumber,
      fssaiExpiryDate: f.fssaiExpiryDate,
      daysRemaining,
      status,
    });
  });

  // 2. Add Link Centers
  linkCenters.forEach(lc => {
    let status: ComplianceItem['status'] = 'Missing';
    let daysRemaining: number | undefined = undefined;

    if (lc.fssaiExpiryDate) {
      const exp = new Date(lc.fssaiExpiryDate);
      const diffTime = exp.getTime() - today.getTime();
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (daysRemaining < 0) {
        status = 'Expired';
      } else if (daysRemaining <= 30) {
        status = 'Expiring Soon';
      } else {
        status = 'Active';
      }
    } else if (lc.fssaiNumber) {
      status = 'Active';
    }

    items.push({
      id: lc.id,
      type: 'Link Center',
      code: lc.centerCode,
      name: lc.centerName,
      contactName: lc.inchargeName,
      mobileNumber: lc.mobileNumber,
      villageOrAddress: lc.address,
      fssaiNumber: lc.fssaiNumber,
      fssaiExpiryDate: lc.fssaiExpiryDate,
      daysRemaining,
      status,
    });
  });

  // 3. Add Collection Centers
  collectionCenters.forEach(cc => {
    let status: ComplianceItem['status'] = 'Missing';
    let daysRemaining: number | undefined = undefined;

    if (cc.fssaiExpiryDate) {
      const exp = new Date(cc.fssaiExpiryDate);
      const diffTime = exp.getTime() - today.getTime();
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (daysRemaining < 0) {
        status = 'Expired';
      } else if (daysRemaining <= 30) {
        status = 'Expiring Soon';
      } else {
        status = 'Active';
      }
    } else if (cc.fssaiNumber) {
      status = 'Active';
    }

    items.push({
      id: cc.id,
      type: 'Collection Center',
      code: cc.centerCode,
      name: cc.centerName,
      contactName: cc.secretaryName,
      mobileNumber: cc.secretaryMobile,
      villageOrAddress: cc.village,
      route: cc.route,
      fssaiNumber: cc.fssaiNumber,
      fssaiExpiryDate: cc.fssaiExpiryDate,
      daysRemaining,
      status,
    });
  });

  // Metrics
  const expiringSoonCount = items.filter(i => i.status === 'Expiring Soon').length;
  const expiredCount = items.filter(i => i.status === 'Expired').length;
  const activeCount = items.filter(i => i.status === 'Active').length;
  const missingCount = items.filter(i => i.status === 'Missing').length;

  const handleSendReminder = (item: ComplianceItem) => {
    const text = `📜 *FSSAI परवाना नूतनीकरण स्मरणपत्र (FSSAI Renewal Reminder)*\n` +
      `नमस्कार *${item.contactName}*,\n` +
      `आपला *${item.name} (${item.code})* चा FSSAI परवाना क्रमांक *${item.fssaiNumber || 'नोंदणी'}* ` +
      `${item.daysRemaining !== undefined && item.daysRemaining >= 0 ? `पुढील ${item.daysRemaining} दिवसांत (${item.fssaiExpiryDate})` : 'कालबाह्य (Expired)'} होत आहे.\n\n` +
      `शासकीय नियमांनुसार दूध संकलन व पुरवठ्यासाठी वैध FSSAI परवाना आवश्यक आहे. कृपया डेअरी MPO अधिकाऱ्यांशी संपर्क साधून तातडीने नूतनीकरण करून घ्यावे.\n\n` +
      `_डेअरी व्यवस्थापन व अन्न सुरक्षा विभाग._`;

    const url = `https://wa.me/91${item.mobileNumber.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    showToast(isMr ? 'WhatsApp स्मरणपत्र पाठवले' : 'WhatsApp reminder generated', 'success');
  };

  const filteredItems = items.filter(item => {
    const matchSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.fssaiNumber && item.fssaiNumber.includes(searchTerm));

    const matchType =
      targetType === 'all' ||
      (targetType === 'producers' && item.type === 'Producer') ||
      (targetType === 'centers' && item.type !== 'Producer');

    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'expiring' && item.status === 'Expiring Soon') ||
      (statusFilter === 'expired' && item.status === 'Expired') ||
      (statusFilter === 'active' && item.status === 'Active') ||
      (statusFilter === 'missing' && item.status === 'Missing');

    return matchSearch && matchType && matchStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">
              {isMr ? 'FSSAI परवाना व अन्न सुरक्षा अनुपालन' : 'FSSAI License Compliance & Expiry Alerts'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {isMr ? 'सर्व गवळी व संकलन केंद्रांचे FSSAI परवाना ट्रॅकिंग, समाप्ती अलर्ट्स व थेट WhatsApp स्मरणपत्रे' : 'FSSAI tracking, expiry countdown (<30 days), license alerts & automated reminders'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{isMr ? 'रिफ्रेश' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
        <button
          onClick={() => setStatusFilter('expiring')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'expiring'
              ? 'bg-amber-500 text-white border-amber-600 shadow-md'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold uppercase ${statusFilter === 'expiring' ? 'text-amber-100' : 'text-amber-600'}`}>
              {isMr ? 'लवकर संपणारे (<३० दिवस)' : 'Expiring < 30 Days'}
            </span>
            <Clock className={`w-4 h-4 ${statusFilter === 'expiring' ? 'text-white' : 'text-amber-500'}`} />
          </div>
          <p className="text-2xl font-black">{expiringSoonCount}</p>
          <p className={`text-[11px] mt-1 font-semibold ${statusFilter === 'expiring' ? 'text-amber-100' : 'text-amber-600'}`}>
            {isMr ? 'तातडीने नूतनीकरण करा' : 'action required'}
          </p>
        </button>

        <button
          onClick={() => setStatusFilter('expired')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'expired'
              ? 'bg-red-600 text-white border-red-700 shadow-md'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold uppercase ${statusFilter === 'expired' ? 'text-red-100' : 'text-red-600'}`}>
              {isMr ? 'कालबाह्य झाले (Expired)' : 'Expired'}
            </span>
            <AlertTriangle className={`w-4 h-4 ${statusFilter === 'expired' ? 'text-white' : 'text-red-500'}`} />
          </div>
          <p className="text-2xl font-black">{expiredCount}</p>
          <p className={`text-[11px] mt-1 font-semibold ${statusFilter === 'expired' ? 'text-red-100' : 'text-red-600'}`}>
            {isMr ? 'परवाना संपला आहे' : 'immediate renewal'}
          </p>
        </button>

        <button
          onClick={() => setStatusFilter('active')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'active'
              ? 'bg-emerald-600 text-white border-emerald-700 shadow-md'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold uppercase ${statusFilter === 'active' ? 'text-emerald-100' : 'text-emerald-600'}`}>
              {isMr ? 'सक्रिय व वैध परवाने' : 'Active & Valid'}
            </span>
            <CheckCircle2 className={`w-4 h-4 ${statusFilter === 'active' ? 'text-white' : 'text-emerald-500'}`} />
          </div>
          <p className="text-2xl font-black">{activeCount}</p>
          <p className={`text-[11px] mt-1 font-semibold ${statusFilter === 'active' ? 'text-emerald-100' : 'text-emerald-600'}`}>
            {isMr ? 'नियमांचे पालन सुरू' : 'fully compliant'}
          </p>
        </button>

        <button
          onClick={() => setStatusFilter('missing')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'missing'
              ? 'bg-slate-700 text-white border-slate-800 shadow-md'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold uppercase ${statusFilter === 'missing' ? 'text-slate-200' : 'text-slate-500'}`}>
              {isMr ? 'अर्जाविना (Pending/No FSSAI)' : 'Missing FSSAI'}
            </span>
            <XCircle className={`w-4 h-4 ${statusFilter === 'missing' ? 'text-white' : 'text-slate-400'}`} />
          </div>
          <p className="text-2xl font-black">{missingCount}</p>
          <p className={`text-[11px] mt-1 font-semibold ${statusFilter === 'missing' ? 'text-slate-200' : 'text-slate-500'}`}>
            {isMr ? 'नवीन नोंदणी आवश्यक' : 'registration needed'}
          </p>
        </button>
      </div>

      {/* Filter and Table List */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder={isMr ? 'शोध (नाव, कोड, FSSAI नंबर)...' : 'Search name, code, FSSAI...'}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={targetType}
              onChange={e => setTargetType(e.target.value as any)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm"
            >
              <option value="all">{isMr ? 'सर्व (गवळी व केंद्रे)' : 'All Types'}</option>
              <option value="producers">{isMr ? 'फक्त गवळी (Producers)' : 'Producers Only'}</option>
              <option value="centers">{isMr ? 'फक्त केंद्रे (Centers)' : 'Centers Only'}</option>
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold"
            >
              <option value="all">{isMr ? 'सर्व स्थिती (All Status)' : 'All Status'}</option>
              <option value="expiring">{isMr ? 'लवकर संपणारे (<३० दिवस)' : 'Expiring Soon'}</option>
              <option value="expired">{isMr ? 'कालबाह्य (Expired)' : 'Expired'}</option>
              <option value="active">{isMr ? 'सक्रिय (Active)' : 'Active'}</option>
              <option value="missing">{isMr ? 'परवाना नाही (Missing)' : 'Missing FSSAI'}</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold uppercase text-[11px]">
                <th className="py-3 px-3">{isMr ? 'प्रकार / कोड' : 'Type / Code'}</th>
                <th className="py-3 px-3">{isMr ? 'नाव व पत्ता' : 'Name & Location'}</th>
                <th className="py-3 px-3">{isMr ? 'संपर्क व्यक्ती' : 'Contact Person'}</th>
                <th className="py-3 px-3">{isMr ? 'FSSAI क्रमांक' : 'FSSAI No.'}</th>
                <th className="py-3 px-3">{isMr ? 'समाप्ती दिनांक' : 'Expiry Date'}</th>
                <th className="py-3 px-3">{isMr ? 'स्थिती' : 'Status'}</th>
                <th className="py-3 px-3 text-right">{isMr ? 'कृती' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredItems.map(item => (
                <tr key={`${item.type}-${item.id}`} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40">
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono font-bold text-[10px] rounded">
                      {item.code}
                    </span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">{item.type}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-800 dark:text-white block">{item.name}</span>
                    <span className="text-slate-500 text-xs">{item.villageOrAddress} {item.route ? `(${item.route})` : ''}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-slate-700 dark:text-slate-300 block">{item.contactName}</span>
                    <span className="font-mono text-slate-400 text-xs">{item.mobileNumber}</span>
                  </td>
                  <td className="py-3 px-3">
                    {item.fssaiNumber ? (
                      <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        {item.fssaiNumber}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Not Registered</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    {item.fssaiExpiryDate ? (
                      <div>
                        <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{item.fssaiExpiryDate}</span>
                        {item.daysRemaining !== undefined && (
                          <span className={`block text-[10px] font-bold ${
                            item.daysRemaining < 0 ? 'text-red-600' : item.daysRemaining <= 30 ? 'text-amber-600' : 'text-emerald-600'
                          }`}>
                            {item.daysRemaining < 0
                              ? `${Math.abs(item.daysRemaining)} days ago`
                              : `${item.daysRemaining} days left`}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    {item.status === 'Expiring Soon' && (
                      <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 rounded-full text-xs font-bold animate-pulse">
                        Expiring Soon
                      </span>
                    )}
                    {item.status === 'Expired' && (
                      <span className="px-2.5 py-1 bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 rounded-full text-xs font-bold">
                        Expired
                      </span>
                    )}
                    {item.status === 'Active' && (
                      <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 rounded-full text-xs font-bold">
                        Active
                      </span>
                    )}
                    {item.status === 'Missing' && (
                      <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-xs font-medium">
                        No License
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {item.mobileNumber && (
                        <>
                          <a
                            href={`tel:${item.mobileNumber}`}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                            title="Call"
                          >
                            <Phone className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => handleSendReminder(item)}
                            className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                            title="Send WhatsApp Renewal Reminder"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>{isMr ? 'स्मरणपत्र' : 'Remind'}</span>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
