import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Edit2,
  Trash2,
  Lock,
  Key,
  Route,
  CheckCircle2,
  X,
  History,
} from 'lucide-react';
import { User, UserRole, RouteItem } from '../../types';
import { StorageService } from '../../services/storageService';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

export const UserManagementView: React.FC = () => {
  const { language, t } = useLanguage();
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [routes, setRoutes] = useState<RouteItem[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [role, setRole] = useState<UserRole>('officer');
  const [assignedRoute, setAssignedRoute] = useState('RT-101');

  const loadData = () => {
    setUsers(StorageService.getUsers());
    setRoutes(StorageService.getRoutes());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('dairy_storage_updated', loadData);
    return () => window.removeEventListener('dairy_storage_updated', loadData);
  }, []);

  const handleOpenAdd = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setMobileNumber('');
    setRole('officer');
    setAssignedRoute(routes[0]?.routeNumber || 'RT-101');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (u: User) => {
    setEditingUser(u);
    setName(u.name);
    setEmail(u.email);
    setMobileNumber(u.mobileNumber || '');
    setRole(u.role);
    setAssignedRoute(u.assignedRoutes?.[0] || 'RT-101');
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm(language === 'mr' ? 'हा युजर काढून टाकायचा आहे का?' : 'Delete this staff user?')) {
      StorageService.deleteUser(id);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const saved: User = {
      id: editingUser ? editingUser.id : `USER-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      role,
      mobileNumber: mobileNumber.trim(),
      assignedRoutes: [assignedRoute],
      isActive: true,
      lastLogin: editingUser?.lastLogin,
      createdAt: editingUser?.createdAt || new Date().toISOString(),
    };

    StorageService.saveUser(saved);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4 pb-20 md:pb-6 animate-in fade-in">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {language === 'mr' ? 'कर्मचारी व युजर व्यवस्थापन' : 'Staff & User Access Control'}
            </h2>
            <p className="text-xs text-slate-500">
              {users.length} {language === 'mr' ? 'नोंदणीकृत अधिकारी व पर्यवेक्षक' : 'registered dairy officers and supervisors'}
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4 stroke-[2.5]" />
          <span>{language === 'mr' ? 'नवीन अधिकारी जोडा' : 'Add New Staff'}</span>
        </button>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {users.map(u => (
          <div
            key={u.id}
            className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 relative"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">{u.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      u.role === 'admin'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                        : u.role === 'supervisor'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}
                  >
                    {u.role}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{u.email}</p>
                {u.mobileNumber && <p className="text-xs font-mono text-slate-400">📞 {u.mobileNumber}</p>}
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(u)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                {u.id !== currentUser?.id && (
                  <button
                    onClick={() => handleDelete(u.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>Route: <strong className="text-slate-700 dark:text-slate-300">{u.assignedRoutes?.join(', ') || 'All'}</strong></span>
              <span className="text-[10px] text-emerald-600 font-bold">● Active</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {editingUser ? (language === 'mr' ? 'कर्मचारी तपशील संपादित करा' : 'Edit Staff User') : (language === 'mr' ? 'नवीन अधिकारी जोडा' : 'Add Staff User')}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">{language === 'mr' ? 'पूर्ण नाव' : 'Full Name'} *</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="उदा. सचिन पाटील"
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="officer@dairy.com"
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">{language === 'mr' ? 'मोबाईल नंबर' : 'Mobile Number'}</label>
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={e => setMobileNumber(e.target.value)}
                    placeholder="9822XXXXXX"
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">{language === 'mr' ? 'पद / रोल' : 'Role'}</label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value as UserRole)}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                  >
                    <option value="officer">Field Officer (क्षेत्रीय अधिकारी)</option>
                    <option value="supervisor">Supervisor (पर्यवेक्षक)</option>
                    <option value="admin">Administrator (व्यवस्थापक)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">{language === 'mr' ? 'नेमून दिलेला रूट' : 'Assigned Route'}</label>
                <select
                  value={assignedRoute}
                  onChange={e => setAssignedRoute(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                >
                  {routes.map(r => (
                    <option key={r.id} value={r.routeNumber}>
                      {r.routeNumber} - {r.routeName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  {t('btn.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer"
                >
                  {t('btn.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
