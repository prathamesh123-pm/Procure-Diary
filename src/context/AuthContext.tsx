import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, LoginHistoryEntry } from '../types';
import { StorageService } from '../services/storageService';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (identifier: string, pass?: string, role?: UserRole) => Promise<{ success: boolean; error?: string }>;
  loginWithOtp: (mobile: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  demoLogin: (role?: UserRole | 'admin' | 'supervisor' | 'officer' | 'manager' | 'viewer') => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchUser: (userId: string) => void;
  updateProfile: (updated: Partial<User>) => void;
  clearError: () => void;
  isAdmin: boolean;
  isManager: boolean;
  isSupervisor: boolean;
  isOfficer: boolean;
  isMPO: boolean;
  isViewer: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  login: async () => ({ success: false }),
  loginWithOtp: async () => ({ success: false }),
  demoLogin: async () => ({ success: false }),
  logout: () => {},
  switchUser: () => {},
  updateProfile: () => {},
  clearError: () => {},
  isAdmin: false,
  isManager: false,
  isSupervisor: false,
  isOfficer: false,
  isMPO: false,
  isViewer: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('dairy_current_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id) return parsed;
      } catch {
        // Continue to fallback
      }
    }
    // Default logged-in user for immediate seamless access
    try {
      const users = StorageService.getUsers();
      const defaultUser = users[0] || null;
      if (defaultUser) {
        localStorage.setItem('dairy_current_user', JSON.stringify(defaultUser));
        return defaultUser;
      }
    } catch (e) {
      console.error('Storage service init error:', e);
    }
    return null;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('dairy_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('dairy_current_user');
    }
  }, [currentUser]);

  const clearError = () => setError(null);

  const login = async (identifier: string, _pass?: string, _role?: UserRole): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      const users = StorageService.getUsers();
      const cleanId = (identifier || '').trim().toLowerCase();

      if (!cleanId) {
        const msg = 'कृपया ईमेल, युझरनेम किंवा मोबाईल नंबर प्रविष्ट करा.';
        setError(msg);
        setIsLoading(false);
        return { success: false, error: msg };
      }

      // Match by email, mobile, id, name, or role alias
      let user = users.find(u => {
        const emailMatch = u.email && u.email.toLowerCase() === cleanId;
        const mobileMatch = u.mobile && u.mobile.replace(/\D/g, '') === cleanId.replace(/\D/g, '');
        const idMatch = u.id && u.id.toLowerCase() === cleanId;
        const nameMatch = u.name && u.name.toLowerCase().includes(cleanId);
        const roleMatch = (cleanId === 'admin' && u.role === 'admin') ||
                          (cleanId === 'supervisor' && u.role === 'supervisor') ||
                          ((cleanId === 'officer' || cleanId === 'field') && u.role === 'officer');
        return emailMatch || mobileMatch || idMatch || nameMatch || roleMatch;
      });

      // If user typed anything else, fallback create/grant access
      if (!user) {
        if (users.length > 0) {
          // Grant access using the primary account
          user = users[0];
        } else {
          // Create instant default admin user
          user = {
            id: 'USR-ADMIN-1',
            name: 'प्रमोद सावंत (Pramod Sawant - Executive)',
            email: cleanId.includes('@') ? cleanId : `${cleanId}@dairy.com`,
            mobile: '9822000001',
            role: 'admin',
            assignedRoutes: ['RT-101', 'RT-102', 'RT-103', 'RT-104', 'RT-105'],
            status: 'active',
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
          };
          StorageService.saveUser(user);
        }
      }

      if (user.status === 'disabled') {
        const msg = 'हे खाते प्रशासकाकडून तात्पुरते बंद केले आहे.';
        setError(msg);
        setIsLoading(false);
        return { success: false, error: msg };
      }

      const updatedUser = { ...user, lastLogin: new Date().toISOString() };
      StorageService.saveUser(updatedUser);
      setCurrentUser(updatedUser);

      StorageService.logLogin({
        id: `LOG-${Date.now()}`,
        userId: user.id,
        userName: user.name,
        role: user.role,
        timestamp: new Date().toISOString(),
        status: 'success',
      });

      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      console.error('Login error:', err);
      const msg = err.message || 'लॉगिन अयशस्वी झाले. कृपया पुन्हा प्रयत्न करा.';
      setError(msg);
      setIsLoading(false);
      return { success: false, error: msg };
    }
  };

  const demoLogin = async (role: UserRole | 'admin' | 'supervisor' | 'officer' = 'admin'): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);
    try {
      let users = StorageService.getUsers();
      if (!users || users.length === 0) {
        users = [
          {
            id: 'USR-ADMIN-1',
            name: 'प्रमोद सावंत (Pramod Sawant - Admin)',
            email: 'admin@dairy.com',
            mobile: '9822000001',
            role: 'admin',
            assignedRoutes: ['RT-101', 'RT-102', 'RT-103', 'RT-104', 'RT-105'],
            status: 'active',
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
          },
        ];
      }

      let targetUser = users.find(u => u.role === role);

      if (!targetUser) {
        targetUser = users[0];
      }

      if (targetUser) {
        const updatedUser = { ...targetUser, lastLogin: new Date().toISOString() };
        StorageService.saveUser(updatedUser);
        setCurrentUser(updatedUser);

        StorageService.logLogin({
          id: `LOG-${Date.now()}`,
          userId: targetUser.id,
          userName: targetUser.name,
          role: targetUser.role,
          timestamp: new Date().toISOString(),
          status: 'success',
        });
      }

      setIsLoading(false);
      return { success: true };
    } catch (e: any) {
      console.error('Demo login error:', e);
      setError(e.message || 'Demo login failed');
      setIsLoading(false);
      return { success: false, error: e.message };
    }
  };

  const loginWithOtp = async (mobile: string, otp: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);
    try {
      const users = StorageService.getUsers();
      const cleanMobile = mobile.trim().replace(/\D/g, '');

      let user = users.find(u => u.mobile.replace(/\D/g, '') === cleanMobile);

      if (!user && users.length > 0) {
        user = users[0]; // fallback
      }

      if (!user) {
        const msg = 'मोबाईल नंबर सिस्टीममध्ये सापडला नाही.';
        setError(msg);
        setIsLoading(false);
        return { success: false, error: msg };
      }

      if (otp.length < 4) {
        const msg = 'कृपया वैध ४ किंवा ६ अंकी OTP प्रविष्ट करा.';
        setError(msg);
        setIsLoading(false);
        return { success: false, error: msg };
      }

      const updatedUser = { ...user, lastLogin: new Date().toISOString() };
      StorageService.saveUser(updatedUser);
      setCurrentUser(updatedUser);

      StorageService.logLogin({
        id: `LOG-${Date.now()}`,
        userId: user.id,
        userName: user.name,
        role: user.role,
        timestamp: new Date().toISOString(),
        status: 'success',
      });

      setIsLoading(false);
      return { success: true };
    } catch (e: any) {
      setError(e.message || 'OTP login error');
      setIsLoading(false);
      return { success: false, error: e.message };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setError(null);
    localStorage.removeItem('dairy_current_user');
  };

  const switchUser = (userId: string) => {
    const users = StorageService.getUsers();
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
    }
  };

  const updateProfile = (updated: Partial<User>) => {
    if (!currentUser) return;
    const nextUser = { ...currentUser, ...updated };
    StorageService.saveUser(nextUser);
    setCurrentUser(nextUser);
  };

  const isAdmin = currentUser?.role === 'admin';
  const isManager = currentUser?.role === 'manager' || isAdmin;
  const isSupervisor = currentUser?.role === 'supervisor' || isManager || isAdmin;
  const isOfficer = currentUser?.role === 'officer';
  const isMPO = currentUser?.role === 'officer' || currentUser?.role === 'supervisor';
  const isViewer = currentUser?.role === 'viewer';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isLoading,
        error,
        login,
        loginWithOtp,
        demoLogin,
        logout,
        switchUser,
        updateProfile,
        clearError,
        isAdmin,
        isManager,
        isSupervisor,
        isOfficer,
        isMPO,
        isViewer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
