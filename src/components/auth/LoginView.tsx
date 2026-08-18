import React, { useState } from 'react';
import {
  Milk,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Phone,
  KeyRound,
  ShieldCheck,
  UserCheck,
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const LoginView: React.FC = () => {
  const { login, loginWithOtp, demoLogin, error, clearError, isLoading } = useAuth();
  const { language, setLanguage } = useLanguage();

  const [authMode, setAuthMode] = useState<'password' | 'otp'>('password');
  const [identifier, setIdentifier] = useState('admin@dairy.com');
  const [password, setPassword] = useState('admin123');
  const [mobile, setMobile] = useState('9822000001');
  const [otp, setOtp] = useState('1234');
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;

    setLocalLoading(true);
    try {
      await login(identifier, password);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleSendOtp = () => {
    if (!mobile.trim() || mobile.length < 10) {
      alert(language === 'mr' ? 'कृपया १० अंकी वैध मोबाईल नंबर प्रविष्ट करा.' : 'Please enter a valid 10-digit mobile number.');
      return;
    }
    setOtpSent(true);
    setOtp('1234');
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobile.trim() || !otp.trim()) return;

    setLocalLoading(true);
    try {
      await loginWithOtp(mobile, otp);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleRoleQuickSelect = (roleKey: 'admin' | 'supervisor' | 'officer') => {
    if (roleKey === 'admin') {
      setIdentifier('admin@dairy.com');
      setPassword('admin123');
      setMobile('9822000001');
    } else if (roleKey === 'supervisor') {
      setIdentifier('supervisor@dairy.com');
      setPassword('super123');
      setMobile('9822000004');
    } else {
      setIdentifier('ramesh@dairy.com');
      setPassword('ramesh123');
      setMobile('9822000002');
    }
    clearError();
  };

  const handleQuickDemoLogin = async (roleKey: 'admin' | 'supervisor' | 'officer') => {
    setLocalLoading(true);
    try {
      if (typeof demoLogin === 'function') {
        await demoLogin(roleKey);
      } else if (typeof login === 'function') {
        const idMap = {
          admin: 'admin@dairy.com',
          supervisor: 'supervisor@dairy.com',
          officer: 'ramesh@dairy.com',
        };
        await login(idMap[roleKey]);
      }
    } catch (err) {
      console.error('Demo login execution error:', err);
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 flex flex-col justify-center items-center p-4 text-slate-100 relative">
      {/* Top Header controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <button
          onClick={() => setLanguage(language === 'mr' ? 'en' : 'mr')}
          className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur-xs transition-colors cursor-pointer border border-white/10"
        >
          {language === 'mr' ? 'English' : 'मराठी'}
        </button>
      </div>

      <div className="w-full max-w-md space-y-5 my-auto">
        {/* Brand Logo & Name */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-xl shadow-emerald-500/20 border border-emerald-300/30">
            <Milk className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            {language === 'mr' ? 'प्रोक्युअर डायरी CRM' : 'Procure Diary CRM'}
          </h1>
          <p className="text-xs text-emerald-200/80 font-medium">
            {language === 'mr'
              ? 'दूध संकलन अधिकारी वैयक्तिक कार्यव्यवस्थापन व गवळी CRM'
              : 'Milk Procurement Executive Personal CRM & Field Operations'}
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/10 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-5 sm:p-7 border border-white/15 shadow-2xl space-y-4">
          {/* Auth Mode Toggle Tabs */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-black/30 border border-white/10">
            <button
              type="button"
              onClick={() => {
                setAuthMode('password');
                clearError();
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                authMode === 'password'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {language === 'mr' ? 'पासवर्ड लॉगिन' : 'Password Login'}
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('otp');
                clearError();
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                authMode === 'otp'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {language === 'mr' ? 'मोबाईल OTP लॉगिन' : 'Mobile OTP'}
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-200 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-300" />
              <span>{error}</span>
            </div>
          )}

          {/* Mode 1: Password Form */}
          {authMode === 'password' ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-200 mb-1">
                  {language === 'mr' ? 'ईमेल / युझरनेम / मोबाईल' : 'Email / Username / Mobile'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    placeholder="admin@dairy.com किंवा 9822000001"
                    className="w-full pl-9.5 pr-3 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-200 mb-1">
                  {language === 'mr' ? 'पासवर्ड (Password)' : 'Password'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9.5 pr-10 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || localLoading}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all disabled:opacity-50"
              >
                {isLoading || localLoading ? (
                  <span>{language === 'mr' ? 'लॉगिन होत आहे...' : 'Signing In...'}</span>
                ) : (
                  <>
                    <span>{language === 'mr' ? 'लॉगिन करा' : 'Sign In'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Mode 2: OTP Form */
            <form onSubmit={handleOtpSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-200 mb-1">
                  {language === 'mr' ? 'नोंदणीकृत मोबाईल नंबर' : 'Registered Mobile Number'}
                </label>
                <div className="flex gap-2">
                  <div className="relative grow">
                    <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="tel"
                      value={mobile}
                      onChange={e => setMobile(e.target.value)}
                      placeholder="9822000001"
                      className="w-full pl-9.5 pr-3 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="px-3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap"
                  >
                    {otpSent ? (language === 'mr' ? 'पुन्हा पाठवा' : 'Resend') : (language === 'mr' ? 'OTP पाठवा' : 'Send OTP')}
                  </button>
                </div>
              </div>

              {otpSent && (
                <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-200 text-[11px] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>
                    {language === 'mr'
                      ? 'डेमो OTP पाठवला आहे: '
                      : 'Test OTP generated: '}
                    <strong className="underline text-white font-bold">1234</strong>
                  </span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-200 mb-1">
                  {language === 'mr' ? 'OTP प्रविष्ट करा' : 'Enter OTP'}
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    placeholder="1234"
                    maxLength={6}
                    className="w-full pl-9.5 pr-3 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium tracking-widest text-center text-sm"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || localLoading}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all disabled:opacity-50"
              >
                {isLoading || localLoading ? (
                  <span>{language === 'mr' ? 'सत्यापित होत आहे...' : 'Verifying...'}</span>
                ) : (
                  <>
                    <span>{language === 'mr' ? 'OTP सह लॉगिन करा' : 'Verify & Log In'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick Instant Role 1-Click Login Buttons */}
          <div className="space-y-2 pt-3 border-t border-white/10">
            <span className="text-[11px] font-bold text-emerald-300 block text-center">
              ⚡ {language === 'mr' ? 'त्वरित १-क्लिक डेमो लॉगिन (Instant Access):' : 'Instant 1-Click Role Login:'}
            </span>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin')}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-center border border-white/10 transition-all cursor-pointer group active:scale-95"
              >
                <span className="block text-[11px] font-bold text-white group-hover:text-amber-300">👑 Admin</span>
                <span className="text-[9px] text-slate-300 block">प्रमोद सावंत</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('supervisor')}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-center border border-white/10 transition-all cursor-pointer group active:scale-95"
              >
                <span className="block text-[11px] font-bold text-white group-hover:text-blue-300">📋 Supervisor</span>
                <span className="text-[9px] text-slate-300 block">गणेश देशमुख</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('officer')}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-center border border-white/10 transition-all cursor-pointer group active:scale-95"
              >
                <span className="block text-[11px] font-bold text-white group-hover:text-emerald-300">🚜 Officer</span>
                <span className="text-[9px] text-slate-300 block">रमेश पाटील</span>
              </button>
            </div>
          </div>
        </div>

        <div className="text-center text-[11px] text-slate-400">
          Procure Diary • Milk Procurement Executive Field CRM • Offline-First PWA
        </div>
      </div>
    </div>
  );
};
