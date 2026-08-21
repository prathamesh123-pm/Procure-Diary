import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  FileSpreadsheet,
  FileText,
  Upload,
  Download,
  Star,
  PhoneCall,
  MessageCircle,
  QrCode,
  Eye,
  Edit2,
  Trash2,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Milk,
  Building,
  ShieldCheck,
  Tag,
  CreditCard,
  Layers,
  MapPin,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  ChevronRight,
  Grid,
  List,
} from 'lucide-react';
import { Farmer, MilkType, FarmerStatus, RouteItem } from '../../types';
import { StorageService } from '../../services/storageService';
import { ExcelService } from '../../services/excelService';
import { PDFService } from '../../services/pdfService';
import { useLanguage } from '../../context/LanguageContext';
import { FarmerFormModal } from './FarmerFormModal';
import { FarmerHistoryModal } from './FarmerHistoryModal';
import { FarmerQRModal } from './FarmerQRModal';
import { useToast } from '../../context/ToastContext';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';

interface FarmerMasterViewProps {
  onNewCallForFarmer: (farmer: Farmer) => void;
}

export const FarmerMasterView: React.FC<FarmerMasterViewProps> = ({ onNewCallForFarmer }) => {
  const { language, t } = useLanguage();
  const { showDeleteSuccess, showError } = useToast();
  const isMr = language === 'mr';

  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [routes, setRoutes] = useState<RouteItem[]>([]);

  // Search and Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoute, setSelectedRoute] = useState('all');
  const [selectedMilkType, setSelectedMilkType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedFssaiFilter, setSelectedFssaiFilter] = useState('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [groupByRouteMode, setGroupByRouteMode] = useState<boolean>(false);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFarmer, setEditingFarmer] = useState<Farmer | null>(null);
  const [historyFarmer, setHistoryFarmer] = useState<Farmer | null>(null);
  const [qrFarmer, setQrFarmer] = useState<Farmer | null>(null);
  const [importStatus, setImportStatus] = useState<{ count: number; error?: string } | null>(null);

  // Delete State
  const [farmerToDelete, setFarmerToDelete] = useState<Farmer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = () => {
    setFarmers(StorageService.getFarmers());
    setRoutes(StorageService.getRoutes());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('dairy_storage_updated', loadData);
    return () => window.removeEventListener('dairy_storage_updated', loadData);
  }, []);

  // Map route details for lookup
  const routeMap = useMemo(() => {
    const map = new Map<string, RouteItem>();
    routes.forEach(r => {
      map.set(r.routeNumber, r);
      map.set(r.routeName, r);
    });
    return map;
  }, [routes]);

  // Enhanced Multi-Parameter Search: Name, Route, Village, FSSAI, Cattle Tags, Mobile, Center
  const filteredFarmers = useMemo(() => {
    return farmers.filter(f => {
      if (showFavoritesOnly && !f.isFavorite) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const routeObj = routeMap.get(f.route);
        const routeName = routeObj ? routeObj.routeName.toLowerCase() : '';
        const routeVillages = routeObj ? routeObj.village.toLowerCase() : '';
        const routeArea = routeObj ? routeObj.area.toLowerCase() : '';
        const routeGroupName = f.routeGroupName ? f.routeGroupName.toLowerCase() : '';
        const fssai = (f.fssaiNumber || '').toLowerCase();
        const tags = (f.inaphTagNumbers || []).join(' ').toLowerCase();
        const bank = (f.bankName || '').toLowerCase();

        const match =
          f.farmerName.toLowerCase().includes(q) ||
          f.farmerCode.toLowerCase().includes(q) ||
          f.mobileNumber.includes(q) ||
          (f.alternateNumber && f.alternateNumber.includes(q)) ||
          f.village.toLowerCase().includes(q) ||
          f.collectionCenter.toLowerCase().includes(q) ||
          f.route.toLowerCase().includes(q) ||
          routeName.includes(q) ||
          routeVillages.includes(q) ||
          routeArea.includes(q) ||
          routeGroupName.includes(q) ||
          fssai.includes(q) ||
          tags.includes(q) ||
          bank.includes(q);

        if (!match) return false;
      }

      if (selectedRoute !== 'all' && f.route !== selectedRoute) return false;
      if (selectedMilkType !== 'all' && f.milkType !== selectedMilkType) return false;
      if (selectedStatus !== 'all' && f.status !== selectedStatus) return false;
      if (selectedFssaiFilter !== 'all') {
        if (selectedFssaiFilter === 'active' && f.fssaiStatus !== 'Active') return false;
        if (selectedFssaiFilter === 'pending' && f.fssaiStatus !== 'Pending') return false;
        if (selectedFssaiFilter === 'not_applied' && (f.fssaiStatus === 'Active' || f.fssaiNumber)) return false;
      }

      return true;
    });
  }, [farmers, searchQuery, selectedRoute, selectedMilkType, selectedStatus, selectedFssaiFilter, showFavoritesOnly, routeMap]);

  // Group filtered farmers by Route for the Route Grouping View
  const groupedByRoute = useMemo(() => {
    const groups: { [key: string]: { route: RouteItem | null; routeKey: string; items: Farmer[] } } = {};

    filteredFarmers.forEach(f => {
      const key = f.route || 'Other';
      if (!groups[key]) {
        groups[key] = {
          route: routeMap.get(key) || null,
          routeKey: key,
          items: [],
        };
      }
      groups[key].items.push(f);
    });

    return Object.values(groups);
  }, [filteredFarmers, routeMap]);

  // Summary Metrics
  const totalMilkVol = useMemo(() => {
    return filteredFarmers.reduce((acc, curr) => acc + (curr.dailyMilkQuantity || 0), 0);
  }, [filteredFarmers]);

  const fssaiCompliantCount = useMemo(() => {
    return filteredFarmers.filter(f => f.fssaiStatus === 'Active' && f.fssaiNumber).length;
  }, [filteredFarmers]);

  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    StorageService.toggleFarmerFavorite(id);
  };

  const handleDeleteFarmerClick = (farmer: Farmer, e: React.MouseEvent) => {
    e.stopPropagation();
    setFarmerToDelete(farmer);
  };

  const handleConfirmDelete = async () => {
    if (!farmerToDelete) return;
    setIsDeleting(true);
    try {
      StorageService.deleteFarmer(farmerToDelete.id);
      showDeleteSuccess(farmerToDelete.farmerName);
      setFarmerToDelete(null);
    } catch (err: any) {
      showError(err?.message || 'Failed to delete farmer record');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportExcel = () => {
    ExcelService.exportFarmersToExcel(filteredFarmers);
  };

  const handleDownloadTemplate = () => {
    ExcelService.downloadFarmerTemplate();
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imported = await ExcelService.parseFarmersFromExcel(file);
      const count = StorageService.importFarmersBatch(imported);
      setImportStatus({ count });
      setTimeout(() => setImportStatus(null), 4000);
    } catch (err: any) {
      setImportStatus({ count: 0, error: err.message || 'Import error' });
    }
  };

  const sendWhatsAppStatement = (farmer: Farmer, e: React.MouseEvent) => {
    e.stopPropagation();
    const tenDayEst = (farmer.dailyMilkQuantity * (farmer.currentRate || 38) * 10).toFixed(0);
    const msg = isMr
      ? `🥛 *दूध उत्पादक गवळी माहिती व दर स्लिप*
----------------------------------------
नाव: *${farmer.farmerName}* (${farmer.farmerCode})
गाव: ${farmer.village} | रूट: ${farmer.route}
संकलन केंद्र: ${farmer.collectionCenter}
दूध प्रकार: ${farmer.milkType === 'Cow' ? 'गाय दूध' : farmer.milkType === 'Buffalo' ? 'म्हैस दूध' : 'दोन्ही'}
दैनिक संकलन: ${farmer.dailyMilkQuantity} लिटर (सकाळ: ${farmer.morningMilkQty || '-'}L | संध्याकाळ: ${farmer.eveningMilkQty || '-'}L)
सरासरी गुणवत्ता: ${farmer.avgFat ? `${farmer.avgFat}% FAT` : ''} ${farmer.avgSNF ? `| ${farmer.avgSNF}% SNF` : ''}
लागू दर: ₹${farmer.currentRate || '38.00'}/Ltr
१० दिवसांचे अंदाजे बिल: ₹${Number(tenDayEst).toLocaleString('en-IN')}
FSSAI परवाना: ${farmer.fssaiNumber || 'नोंदणी सुरू'} (${farmer.fssaiStatus || 'Active'})
----------------------------------------
- दूध संकलन अधिकारी (Procure Diary CRM)`
      : `🥛 *Milk Supplier Profile & Rate Slip*
----------------------------------------
Farmer: *${farmer.farmerName}* (${farmer.farmerCode})
Village: ${farmer.village} | Route: ${farmer.route}
Center: ${farmer.collectionCenter}
Type: ${farmer.milkType} | Volume: ${farmer.dailyMilkQuantity} L/day
Avg Quality: ${farmer.avgFat ? `${farmer.avgFat}% FAT` : ''} ${farmer.avgSNF ? `| ${farmer.avgSNF}% SNF` : ''}
Procurement Rate: ₹${farmer.currentRate || '38.00'}/L
FSSAI No: ${farmer.fssaiNumber || 'Pending'}
----------------------------------------
- Procure Diary CRM`;

    window.open(`https://wa.me/91${farmer.mobileNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="space-y-4 pb-20 md:pb-6 animate-in fade-in">
      {/* Top Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/20">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                {isMr ? 'गवळी / दूध उत्पादक मास्टर' : 'Milk Producers & Gavali Master'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                {filteredFarmers.length} {isMr ? 'गवळी' : 'Producers'}
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
              <span>{isMr ? 'दैनिक संकलन:' : 'Daily Milk:'} <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{totalMilkVol.toLocaleString('en-IN')} Ltr/day</strong></span>
              <span>•</span>
              <span>{isMr ? 'FSSAI परवानाधारक:' : 'FSSAI Verified:'} <strong className="text-blue-600 dark:text-blue-400 font-bold">{fssaiCompliantCount}/{filteredFarmers.length}</strong></span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Group / Grid Switcher */}
          <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center gap-1 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setGroupByRouteMode(false)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                !groupByRouteMode
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
              title={isMr ? 'सर्व गवळी ग्रिड' : 'Grid View'}
            >
              <Grid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isMr ? 'ग्रिड व्ह्यू' : 'Grid'}</span>
            </button>
            <button
              onClick={() => setGroupByRouteMode(true)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                groupByRouteMode
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
              title={isMr ? 'रूट ग्रुप व्ह्यू' : 'Group by Route'}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isMr ? 'रूट ग्रुप्स' : 'Route Groups'}</span>
            </button>
          </div>

          <button
            onClick={() => {
              setEditingFarmer(null);
              setIsFormOpen(true);
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{isMr ? '+ नवीन गवळी जोडा' : 'Add New Gavali'}</span>
          </button>

          {/* Excel Actions */}
          <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700">
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">{isMr ? 'आयात' : 'Import'}</span>
            <input type="file" accept=".xlsx, .xls, .csv" onChange={handleImportExcel} className="hidden" />
          </label>

          <button
            onClick={handleExportExcel}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700"
            title="Export Farmers to Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Excel</span>
          </button>

          <button
            onClick={() => {
              const routeLabel = selectedRoute === 'all' ? (isMr ? 'सर्व रूट्स' : 'All Routes') : selectedRoute;
              PDFService.exportFarmerDirectoryPDF(filteredFarmers, routeLabel);
            }}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700"
            title="Export Gavali Directory to PDF"
          >
            <FileText className="w-3.5 h-3.5 text-red-600" />
            <span className="hidden sm:inline">PDF</span>
          </button>
        </div>
      </div>

      {/* Import Status Alert */}
      {importStatus && (
        <div
          className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-2 ${
            importStatus.error
              ? 'bg-red-50 text-red-800 dark:bg-red-950/50 dark:text-red-300 border border-red-200'
              : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200'
          }`}
        >
          {importStatus.error ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
          <span>
            {importStatus.error
              ? `त्रुटी: ${importStatus.error}`
              : `यशस्वी! ${importStatus.count} गवळी डेटाबेसमध्ये आयात झाले.`}
          </span>
        </div>
      )}

      {/* Comprehensive Search & Filter Section (नाव, रूट, गाव, FSSAI परवाना शोध) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
          {/* Main Search Input */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={isMr ? 'गवळ्याचे नाव, रूट (उदा. RT-101), गाव, FSSAI नं...' : 'Search by Gavali Name, Route (RT-101), Village, FSSAI...'}
              className="w-full text-xs pl-9.5 pr-3 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Route Dropdown Filter */}
          <div>
            <select
              value={selectedRoute}
              onChange={e => setSelectedRoute(e.target.value)}
              className="w-full text-xs p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium cursor-pointer"
            >
              <option value="all">{isMr ? 'सर्व रूट्स (All Routes)' : 'All Routes'}</option>
              {routes.map(r => (
                <option key={r.id} value={r.routeNumber}>
                  {r.routeNumber} - {r.routeName}
                </option>
              ))}
            </select>
          </div>

          {/* Milk Type Filter */}
          <div>
            <select
              value={selectedMilkType}
              onChange={e => setSelectedMilkType(e.target.value)}
              className="w-full text-xs p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium cursor-pointer"
            >
              <option value="all">{isMr ? 'सर्व दूध प्रकार (Milk)' : 'All Milk Types'}</option>
              <option value="Cow">{isMr ? 'गायीचे दूध (Cow)' : 'Cow Milk'}</option>
              <option value="Buffalo">{isMr ? 'म्हशीचे दूध (Buffalo)' : 'Buffalo Milk'}</option>
              <option value="Both">{isMr ? 'दोन्ही (Both)' : 'Both (Cow & Buffalo)'}</option>
            </select>
          </div>

          {/* FSSAI License Filter */}
          <div>
            <select
              value={selectedFssaiFilter}
              onChange={e => setSelectedFssaiFilter(e.target.value)}
              className="w-full text-xs p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium cursor-pointer"
            >
              <option value="all">{isMr ? 'सर्व FSSAI स्थिती' : 'All FSSAI Status'}</option>
              <option value="active">{isMr ? '✅ FSSAI परवाना वैध' : 'Active FSSAI'}</option>
              <option value="pending">{isMr ? '⏳ परवाना प्रलंबित/रिन्यू' : 'Pending/Renew'}</option>
              <option value="not_applied">{isMr ? '⚠️ परवाना नाही' : 'No License'}</option>
            </select>
          </div>

          {/* Status & Favorites */}
          <div className="flex items-center gap-2">
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="flex-1 text-xs p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium cursor-pointer"
            >
              <option value="all">{isMr ? 'सर्व स्थिती' : 'All Status'}</option>
              <option value="Active">Active</option>
              <option value="Irregular">Irregular</option>
              <option value="Stopped">Stopped</option>
            </select>

            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`p-2.5 rounded-2xl border transition-colors cursor-pointer shrink-0 ${
                showFavoritesOnly
                  ? 'bg-amber-100 border-amber-300 text-amber-600 dark:bg-amber-950 dark:border-amber-800'
                  : 'bg-slate-50 border-slate-200 text-slate-400 dark:bg-slate-800 dark:border-slate-700'
              }`}
              title={isMr ? 'केवळ आवडते गवळी' : 'Show Favorites Only'}
            >
              <Star className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Quick Route Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap mr-1">
            {isMr ? 'रूटनुसार जलद फिल्टर:' : 'Quick Routes:'}
          </span>
          <button
            type="button"
            onClick={() => setSelectedRoute('all')}
            className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap cursor-pointer transition-colors ${
              selectedRoute === 'all'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            {isMr ? 'सर्व रूट्स' : 'All'} ({farmers.length})
          </button>
          {routes.map(r => {
            const count = farmers.filter(f => f.route === r.routeNumber || f.route === r.routeName).length;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedRoute(r.routeNumber)}
                className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap cursor-pointer transition-colors ${
                  selectedRoute === r.routeNumber
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {r.routeNumber} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area: Grouped View OR Standard Grid View */}
      {filteredFarmers.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-xs bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
          <Users className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
          <p className="font-bold text-slate-700 dark:text-slate-300">
            {isMr ? 'शोध निकषांनुसार गवळी / शेतकरी सापडले नाहीत.' : 'No milk producers matched your search criteria.'}
          </p>
          <p className="text-slate-400 text-[11px]">
            {isMr ? 'कृपया वेगळे नाव, रूट क्रमांक किंवा गाव टाकून तपासा.' : 'Try changing your search term, route filter, or FSSAI status.'}
          </p>
        </div>
      ) : groupByRouteMode ? (
        /* ROUTE GROUPED VIEW */
        <div className="space-y-6">
          {groupedByRoute.map(group => {
            const routeTotalMilk = group.items.reduce((acc, curr) => acc + (curr.dailyMilkQuantity || 0), 0);
            const routeFssaiValid = group.items.filter(f => f.fssaiStatus === 'Active').length;

            return (
              <div
                key={group.routeKey}
                className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4"
              >
                {/* Route Header Card */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-50 via-emerald-50/40 to-slate-50 dark:from-slate-800/80 dark:via-slate-800 dark:to-slate-800/80 p-3.5 rounded-2xl border border-emerald-100 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-black flex items-center justify-center text-sm shadow-xs">
                      {group.routeKey}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{group.route ? group.route.routeName : `${isMr ? 'रूट' : 'Route'} ${group.routeKey}`}</span>
                        <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-md">
                          {group.items.length} {isMr ? 'गवळी' : 'Producers'}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500">
                        {group.route?.village || group.items[0]?.village} • {group.route?.area || 'Sangli Zone'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <div className="bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                      <span className="text-[10px] text-slate-400 block">{isMr ? 'एकूण दूध' : 'Total Volume'}</span>
                      <span className="font-black text-emerald-600 dark:text-emerald-400">{routeTotalMilk} L/day</span>
                    </div>
                    <div className="bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                      <span className="text-[10px] text-slate-400 block">{isMr ? 'FSSAI परवाना' : 'FSSAI Verified'}</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">{routeFssaiValid}/{group.items.length}</span>
                    </div>
                  </div>
                </div>

                {/* Farmer Cards in this Route */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {group.items.map(farmer => renderFarmerCard(farmer))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* STANDARD COMPREHENSIVE GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredFarmers.map(farmer => renderFarmerCard(farmer))}
        </div>
      )}

      {/* Add / Edit Farmer Form Modal */}
      <FarmerFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        farmerToEdit={editingFarmer}
        onSaved={() => loadData()}
      />

      {/* 360-Degree Comprehensive History & Dossier Modal */}
      <FarmerHistoryModal
        farmer={historyFarmer}
        isOpen={!!historyFarmer}
        onClose={() => setHistoryFarmer(null)}
        onNewCallForFarmer={farmer => {
          setHistoryFarmer(null);
          onNewCallForFarmer(farmer);
        }}
        onEditFarmer={farmer => {
          setHistoryFarmer(null);
          setEditingFarmer(farmer);
          setIsFormOpen(true);
        }}
      />

      {/* QR Code Modal */}
      <FarmerQRModal
        farmer={qrFarmer}
        isOpen={!!qrFarmer}
        onClose={() => setQrFarmer(null)}
      />

      {/* Standardized Delete Confirmation Dialog */}
      {farmerToDelete && (
        <DeleteConfirmModal
          isOpen={Boolean(farmerToDelete)}
          onClose={() => setFarmerToDelete(null)}
          onConfirm={handleConfirmDelete}
          isDeleting={isDeleting}
          itemType={isMr ? 'गवळी / दूध उत्पादक' : 'Milk Producer / Farmer'}
          itemName={farmerToDelete.farmerName}
          itemCode={farmerToDelete.farmerCode}
          title={isMr ? 'हा शेतकरी / गवळी रेकॉर्ड नक्की हटवायचा आहे का?' : 'Delete this farmer / producer record?'}
          dependentItems={[
            {
              label: isMr ? 'नोंदवलेले कॉल्स' : 'Logged Calls',
              count: StorageService.getFarmerDependencies(farmerToDelete.farmerCode).callsCount,
            },
            {
              label: isMr ? 'फॉलो-अप नोंदी' : 'Follow-up Records',
              count: StorageService.getFarmerDependencies(farmerToDelete.farmerCode).followUpsCount,
            },
            {
              label: isMr ? 'सक्रिय कार्ये (Tasks)' : 'Active Tasks',
              count: StorageService.getFarmerDependencies(farmerToDelete.farmerCode).tasksCount,
            },
          ]}
        />
      )}
    </div>
  );

  // Reusable Comprehensive Gavali Card Renderer
  function renderFarmerCard(farmer: Farmer) {
    const routeObj = routeMap.get(farmer.route);
    const tenDayEstimate = (farmer.dailyMilkQuantity * (farmer.currentRate || 38) * 10).toFixed(0);

    return (
      <div
        key={farmer.id}
        onClick={() => setHistoryFarmer(farmer)}
        className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-emerald-400 dark:hover:border-emerald-600 transition-all cursor-pointer space-y-3 relative group hover:shadow-md"
      >
        {/* Top Header: Name, Code & Route */}
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-black text-sm text-slate-900 dark:text-white line-clamp-1">
                {farmer.farmerName}
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 rounded-md shrink-0">
                {farmer.farmerCode}
              </span>
            </div>

            <p className="text-xs text-slate-500 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">{farmer.village}</span>
              <span>•</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">{farmer.route}</span>
            </p>
          </div>

          <button
            onClick={e => handleToggleFavorite(farmer.id, e)}
            className="p-1 text-slate-300 hover:text-amber-400 cursor-pointer transition-colors"
          >
            <Star className={`w-4 h-4 ${farmer.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
          </button>
        </div>

        {/* Milk Production & Quality Section (User Requested: दुधाची माहिती) */}
        <div className="p-2.5 rounded-2xl bg-emerald-50/50 dark:bg-slate-800/60 border border-emerald-100 dark:border-slate-700/60 space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Milk className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-black text-slate-900 dark:text-white">
                {farmer.dailyMilkQuantity} Ltr/day
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                farmer.milkType === 'Cow'
                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                  : farmer.milkType === 'Buffalo'
                  ? 'bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300'
                  : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
              }`}>
                {farmer.milkType === 'Cow' ? (isMr ? '🐄 गाय' : 'Cow') : farmer.milkType === 'Buffalo' ? (isMr ? '🐃 म्हैस' : 'Buffalo') : (isMr ? '🐄+🐃 दोन्ही' : 'Both')}
              </span>
            </div>

            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                farmer.status === 'Active'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : farmer.status === 'Irregular'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
              }`}
            >
              {farmer.status}
            </span>
          </div>

          {/* Breakdown for Both Milk Types */}
          {farmer.milkType === 'Both' && (farmer.cowLitres !== undefined || farmer.buffaloLitres !== undefined) && (
            <div className="flex items-center justify-between text-[10px] bg-white/70 dark:bg-slate-900/60 px-2 py-1 rounded-lg border border-emerald-100 dark:border-slate-700">
              <span className="text-amber-800 dark:text-amber-300 font-bold">
                🐄 {isMr ? 'गाय:' : 'Cow:'} {farmer.cowLitres ?? Math.round(farmer.dailyMilkQuantity * 0.6)}L (@₹{farmer.cowRate || '39.5'})
              </span>
              <span className="text-teal-800 dark:text-teal-300 font-bold">
                🐃 {isMr ? 'म्हैस:' : 'Buf:'} {farmer.buffaloLitres ?? Math.round(farmer.dailyMilkQuantity * 0.4)}L (@₹{farmer.buffaloRate || '72.5'})
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 pt-0.5 border-t border-emerald-200/40 dark:border-slate-700/40">
            <span>
              {farmer.morningMilkQty ? `🌅 ${farmer.morningMilkQty}L` : ''} {farmer.eveningMilkQty ? `+ 🌆 ${farmer.eveningMilkQty}L` : ''}
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {farmer.avgFat ? `${farmer.avgFat}% F` : ''} {farmer.avgSNF ? `| ${farmer.avgSNF}% S` : ''}
            </span>
          </div>

          {/* Rate & 10-day Payout Pill */}
          <div className="flex items-center justify-between text-[10px] pt-1 text-slate-500 font-medium">
            <span>{isMr ? 'दर:' : 'Rate:'} <strong className="text-emerald-700 dark:text-emerald-300 font-bold">₹{farmer.currentRate || '39.50'}/L</strong></span>
            <span>{isMr ? '१० दिवसांचे बिल:' : '10-Day Est:'} <strong className="text-amber-600 dark:text-amber-400 font-bold">₹{Number(tenDayEstimate).toLocaleString('en-IN')}</strong></span>
          </div>
        </div>

        {/* FSSAI & Regulatory Licensing Section (User Requested: एफएसएस परवाना व इतर माहिती) */}
        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50 space-y-1 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300 text-[10px]">
              <ShieldCheck className="w-3 h-3 text-blue-600" />
              <span>FSSAI:</span>
              <span className="font-mono text-slate-900 dark:text-slate-200">
                {farmer.fssaiNumber || (isMr ? 'नोंदणी केलेली नाही' : 'Not Registered')}
              </span>
            </span>

            <span
              className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                farmer.fssaiStatus === 'Active'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                  : farmer.fssaiStatus === 'Expiring Soon'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
              }`}
            >
              {farmer.fssaiStatus || 'Not Applied'}
            </span>
          </div>

          {/* Cattle Tags & Badges */}
          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
            <span className="flex items-center gap-1 truncate">
              <Tag className="w-3 h-3 text-purple-600 shrink-0" />
              <span>
                {farmer.inaphTagNumbers && farmer.inaphTagNumbers.length > 0
                  ? `${farmer.inaphTagNumbers.length} ${isMr ? 'पशु कानपट्ट्या' : 'Ear Tags'} (${farmer.inaphTagNumbers[0]}...)`
                  : (isMr ? 'पशु टॅग नोंद नाही' : 'No Tag Registered')}
              </span>
            </span>

            {farmer.cleanMilkCert && (
              <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded shrink-0">
                ✨ {isMr ? 'स्वच्छ दूध' : 'CMP'}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
            <span>{farmer.mobileNumber}</span>
          </div>

          <div className="flex items-center gap-1">
            <a
              href={`tel:${farmer.mobileNumber}`}
              onClick={e => e.stopPropagation()}
              className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 transition-colors shadow-2xs"
              title={isMr ? 'थेट कॉल करा' : 'Direct Call'}
            >
              <PhoneCall className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={e => sendWhatsAppStatement(farmer, e)}
              className="p-2 rounded-xl bg-green-50 dark:bg-green-950 text-green-600 hover:bg-green-100 transition-colors cursor-pointer shadow-2xs"
              title={isMr ? 'व्हॉट्सॲपवर दर व माहिती स्लिप पाठवा' : 'WhatsApp Rate Slip'}
            >
              <MessageCircle className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={e => {
                e.stopPropagation();
                setQrFarmer(farmer);
              }}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer transition-colors"
              title={isMr ? 'कलेक्शन QR कोड' : 'QR Code'}
            >
              <QrCode className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={e => {
                e.stopPropagation();
                setEditingFarmer(farmer);
                setIsFormOpen(true);
              }}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer transition-colors"
              title={isMr ? 'माहिती संपादित करा' : 'Edit Profile'}
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={e => handleDeleteFarmerClick(farmer, e)}
              aria-label="Delete Farmer"
              className="p-2 rounded-xl bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/80 cursor-pointer transition-all active:scale-95 shadow-2xs min-h-[36px] min-w-[36px] flex items-center justify-center"
              title={isMr ? 'गवळी रेकॉर्ड हटवा' : 'Delete Farmer Record'}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }
};
