import React from 'react';
import { Farmer } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { QrCode, X, Printer, Phone, MapPin, Milk, CheckCircle2 } from 'lucide-react';

interface FarmerQRModalProps {
  farmer: Farmer | null;
  isOpen: boolean;
  onClose: () => void;
}

export const FarmerQRModal: React.FC<FarmerQRModalProps> = ({ farmer, isOpen, onClose }) => {
  const { language } = useLanguage();

  if (!isOpen || !farmer) return null;

  // Generate a mock QR payload url (using quickchart or SVG representation)
  const qrData = `DAIRY-FARMER|CODE:${farmer.farmerCode}|NAME:${farmer.farmerName}|MOB:${farmer.mobileNumber}|ROUTE:${farmer.route}|MILK:${farmer.milkType}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {language === 'mr' ? 'शेतकरी ओळख QR कार्ड' : 'Farmer Digital QR Pass'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {farmer.farmerCode}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Card */}
        <div id="printable-qr-card" className="p-4 bg-emerald-50/50 dark:bg-slate-800/60 rounded-xl border border-emerald-200 dark:border-slate-700 text-center space-y-3">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
            <Milk className="w-4 h-4" />
            <span>{language === 'mr' ? 'प्रोक्युअर डायरी • गवळी डिजिटल पास' : 'Procure Diary • Gavali Digital Pass'}</span>
          </div>

          <div className="w-44 h-44 mx-auto bg-white p-2 rounded-xl shadow-xs border border-slate-200 dark:border-slate-700 flex items-center justify-center">
            <img
              src={qrImageUrl}
              alt="Farmer QR Code"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>

          <div>
            <h4 className="font-bold text-base text-slate-900 dark:text-white">
              {farmer.farmerName}
            </h4>
            <div className="flex items-center justify-center gap-2 mt-1 text-xs text-slate-600 dark:text-slate-400">
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                Code: {farmer.farmerCode}
              </span>
              <span>•</span>
              <span>{farmer.route}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-emerald-200/60 dark:border-slate-700 text-left grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-slate-400 block">{language === 'mr' ? 'दूध प्रकार:' : 'Milk Type:'}</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{farmer.milkType} ({farmer.dailyMilkQuantity}L/day)</span>
            </div>
            <div>
              <span className="text-slate-400 block">{language === 'mr' ? 'मोबाईल:' : 'Mobile:'}</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{farmer.mobileNumber}</span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-400 block">{language === 'mr' ? 'संकलन केंद्र:' : 'Center:'}</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{farmer.collectionCenter} - {farmer.village}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-2">
          <button
            onClick={handlePrint}
            className="flex-1 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{language === 'mr' ? 'कार्ड प्रिंट करा' : 'Print QR Pass'}</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer"
          >
            {language === 'mr' ? 'पूर्ण' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
