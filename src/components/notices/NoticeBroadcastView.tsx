import React, { useState, useEffect } from 'react';
import {
  Bell,
  Plus,
  Search,
  Filter,
  Share2,
  Calendar,
  Send,
  Users,
  Building,
  CheckCircle2,
  AlertCircle,
  FileText,
  Trash2,
  Edit2,
  Sparkles,
} from 'lucide-react';
import { MPOStorageService } from '../../services/mpoStorageService';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';

interface NoticeItem {
  id: string;
  title: string;
  category: 'Rate Revision' | 'Bonus' | 'Veterinary Camp' | 'FSSAI Alert' | 'General';
  targetAudience: 'All Producers' | 'All Centers' | 'Route RT-101' | 'Route RT-102';
  content: string;
  publishDate: string;
  expiryDate?: string;
  issuedBy: string;
  priority: 'Urgent' | 'Normal' | 'High';
}

export const NoticeBroadcastView: React.FC = () => {
  const { currentUser } = useAuth();
  const { language } = useLanguage();
  const isMr = language === 'mr';
  const { showToast } = useToast();

  const [notices, setNotices] = useState<NoticeItem[]>([
    {
      id: 'NOT-1',
      title: 'दिवाळी सणानिमित्त विशेष दूध दर वाढ व बोनस परिपत्रक',
      category: 'Bonus',
      targetAudience: 'All Producers',
      content: 'सर्व दूध उत्पादक शेतकरी बांधवांना कळविण्यात येते की, चालू महिन्यापासून गाय व म्हैस दुधाला प्रति लिटर ₹१.५० वाढीव बोनस थेट बँक खात्यात जमा करण्यात येईल.',
      publishDate: '2026-08-20',
      expiryDate: '2026-09-30',
      issuedBy: 'प्रमोद सावंत (MPO)',
      priority: 'High',
    },
    {
      id: 'NOT-2',
      title: 'FSSAI परवाना नूतनीकरण व कागदपत्रे पडताळणी मोहीम',
      category: 'FSSAI Alert',
      targetAudience: 'All Centers',
      content: 'सर्व संकलन केंद्र चालकांनी आपापले नूतनीकरण झालेले FSSAI प्रमाणपत्र व वजनकाटा स्टॅम्पिंग सर्टिफिकेट ३१ ऑगस्टपूर्वी जमा करावेत.',
      publishDate: '2026-08-18',
      expiryDate: '2026-08-31',
      issuedBy: 'व्यवस्थापक',
      priority: 'Urgent',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // New Notice Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<NoticeItem['category']>('Rate Revision');
  const [targetAudience, setTargetAudience] = useState<NoticeItem['targetAudience']>('All Producers');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<NoticeItem['priority']>('Normal');

  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      showToast(isMr ? 'कृपया शीर्षक व तपशील भरा' : 'Please fill title and content', 'error');
      return;
    }

    const newN: NoticeItem = {
      id: `NOT-${Date.now()}`,
      title,
      category,
      targetAudience,
      content,
      publishDate: new Date().toISOString().split('T')[0],
      issuedBy: currentUser?.name || 'प्रमोद सावंत (MPO)',
      priority,
    };

    setNotices(prev => [newN, ...prev]);
    showToast(isMr ? 'परिपत्रक / नोटीस प्रसिद्ध झाली' : 'Notice broadcasted', 'success');
    setIsModalOpen(false);
    setTitle('');
    setContent('');
  };

  const handleDelete = (id: string) => {
    if (window.confirm(isMr ? 'ही नोटीस हटवायची आहे का?' : 'Delete this notice?')) {
      setNotices(prev => prev.filter(n => n.id !== id));
      showToast(isMr ? 'नोटीस हटवली' : 'Notice deleted', 'success');
    }
  };

  const handleBroadcastWhatsApp = (notice: NoticeItem) => {
    const text = `📢 *अधिकृत डेअरी परिपत्रक / नोटीस (Official Notice)*\n` +
      `📌 *विषय:* ${notice.title}\n` +
      `🏷️ *प्रवर्ग:* ${notice.category} | प्राधान्य: ${notice.priority}\n` +
      `👥 *कोणासाठी:* ${notice.targetAudience}\n` +
      `📅 *दिनांक:* ${notice.publishDate}\n\n` +
      `📝 *तपशील:*\n${notice.content}\n\n` +
      `👨‍💼 *जारीकर्ता:* ${notice.issuedBy}\n` +
      `_डेअरी व्यवस्थापन व संकलन कार्यालय._`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const filteredNotices = notices.filter(n => {
    const matchSearch = n.title.toLowerCase().includes(searchTerm.toLowerCase()) || n.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = selectedCategory === 'all' || n.category === selectedCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 rounded-xl">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">
              {isMr ? 'परिपत्रके व नोटीस ब्रॉडकास्ट (Circulars & Notices)' : 'Circulars & Official Notices'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {isMr ? 'दूध दर बदल, बोनस, पशुवैद्यकीय शिबिरे, नियमावली व शेतकरी WhatsApp ब्रॉडकास्ट' : 'Rate revisions, festive bonuses, veterinary camp alerts & group WhatsApp broadcasts'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{isMr ? '+ नवीन परिपत्रक काढा' : '+ Issue Notice'}</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder={isMr ? 'शोध परिपत्रक (शीर्षक, मजकूर)...' : 'Search notices...'}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm"
          >
            <option value="all">{isMr ? 'सर्व प्रवर्ग (All Categories)' : 'All Categories'}</option>
            <option value="Rate Revision">Rate Revision</option>
            <option value="Bonus">Bonus Scheme</option>
            <option value="Veterinary Camp">Veterinary Camp</option>
            <option value="FSSAI Alert">FSSAI Alert</option>
            <option value="General">General Notice</option>
          </select>
        </div>

        {/* Notice List */}
        <div className="space-y-3.5">
          {filteredNotices.map(notice => (
            <div
              key={notice.id}
              className="p-4 bg-slate-50/70 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 hover:border-amber-400 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    notice.priority === 'Urgent'
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
                      : notice.priority === 'High'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                  }`}>
                    {notice.priority}
                  </span>
                  <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-semibold rounded">
                    {notice.category}
                  </span>
                  <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {notice.publishDate}
                  </span>
                  <span className="text-xs text-blue-600 font-medium">
                    🎯 {notice.targetAudience}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {notice.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {notice.content}
                </p>
                <div className="text-[11px] text-slate-400">
                  {isMr ? 'जारीकर्ता:' : 'Issued by:'} {notice.issuedBy}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <button
                  onClick={() => handleBroadcastWhatsApp(notice)}
                  className="px-3.5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{isMr ? 'WhatsApp पाठवा' : 'Broadcast'}</span>
                </button>
                <button
                  onClick={() => handleDelete(notice.id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Notice Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-5 py-4 bg-gradient-to-r from-amber-700 to-orange-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-200" />
                <h3 className="font-bold text-base">
                  {isMr ? 'नवीन परिपत्रक / नोटीस काढा' : 'Issue New Notice'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-amber-200 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNotice} className="p-5 space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isMr ? 'परिपत्रक शीर्षक (Notice Title)' : 'Title'} *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                  placeholder="उदा. दूध दर वाढ / बोनस जाहीर"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isMr ? 'प्रवर्ग (Category)' : 'Category'}
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  >
                    <option value="Rate Revision">Rate Revision</option>
                    <option value="Bonus">Bonus Scheme</option>
                    <option value="Veterinary Camp">Veterinary Camp</option>
                    <option value="FSSAI Alert">FSSAI Alert</option>
                    <option value="General">General Notice</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isMr ? 'प्राधान्य (Priority)' : 'Priority'}
                  </label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent / Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isMr ? 'लक्षित वर्ग (Target Audience)' : 'Target Audience'}
                </label>
                <select
                  value={targetAudience}
                  onChange={e => setTargetAudience(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                >
                  <option value="All Producers">सर्व उत्पादक (All Producers)</option>
                  <option value="All Centers">सर्व संकलन केंद्रे (All Centers)</option>
                  <option value="Route RT-101">रूट RT-101 (Route RT-101)</option>
                  <option value="Route RT-102">रूट RT-102 (Route RT-102)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isMr ? 'परिपत्रक मजकूर व तपशील (Notice Content)' : 'Content'} *
                </label>
                <textarea
                  rows={4}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  required
                  placeholder="संपूर्ण माहिती व सूचना..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  {isMr ? 'रद्द करा' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{isMr ? 'प्रसिद्ध करा (Broadcast)' : 'Broadcast Notice'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
