import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  MapPin,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  LogIn,
  LogOut,
  Navigation,
  FileSpreadsheet,
  User,
  ShieldCheck,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { MPOAttendance } from '../../types';
import { MPOStorageService } from '../../services/mpoStorageService';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';

export const MPOAttendanceView: React.FC = () => {
  const { currentUser } = useAuth();
  const { language } = useLanguage();
  const isMr = language === 'mr';
  const { showToast } = useToast();

  const officerId = currentUser?.id || 'USR-ADMIN-1';
  const officerName = currentUser?.name || 'प्रमोद सावंत (MPO)';
  const officerMobile = currentUser?.mobile || '9822000001';

  const [attendanceRecords, setAttendanceRecords] = useState<MPOAttendance[]>([]);
  const [todayRecord, setTodayRecord] = useState<MPOAttendance | null>(null);

  // Form / Checkin modal states
  const [isCheckInMode, setIsCheckInMode] = useState(false);
  const [isCheckOutMode, setIsCheckOutMode] = useState(false);

  // Camera stream & GPS
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [selfieDataUrl, setSelfieDataUrl] = useState<string>('');
  const [latitude, setLatitude] = useState<number>(16.8524);
  const [longitude, setLongitude] = useState<number>(74.5815);
  const [accuracy, setAccuracy] = useState<number>(4);
  const [address, setAddress] = useState<string>('सांगली - मिरज रोड (Sangli MPO Field)');
  const [shiftStatus, setShiftStatus] = useState<MPOAttendance['shiftStatus']>('Present');
  const [notes, setNotes] = useState('');
  const [kilometers, setKilometers] = useState(35);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadAttendance = () => {
    const list = MPOStorageService.getAttendanceRecords();
    setAttendanceRecords(list);
    const today = MPOStorageService.getTodayAttendance(officerId);
    setTodayRecord(today);
  };

  useEffect(() => {
    loadAttendance();
    window.addEventListener('dairy_mpo_updated', loadAttendance);
    return () => window.removeEventListener('dairy_mpo_updated', loadAttendance);
  }, [officerId]);

  // GPS capture
  const captureGps = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation not supported', 'error');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setAccuracy(Math.round(pos.coords.accuracy));
        setAddress(`अक्षांश: ${pos.coords.latitude.toFixed(4)}, रेखांश: ${pos.coords.longitude.toFixed(4)} (फील्ड लोकेशन)`);
        showToast(isMr ? 'GPS लोकेशन यशस्वीरीत्या मिळवले' : 'GPS coordinates captured', 'success');
      },
      err => {
        setAddress('मिरज - कवठेपिरान दूध संकलन रूट (डीफॉल्ट)');
        showToast(isMr ? 'GPS मिळवण्यात अडचण, डीफॉल्ट लोकेशन वापरले' : 'GPS defaulted', 'warning');
      }
    );
  };

  // Camera start / stop
  const startCamera = async () => {
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Camera stream error, fallback to file upload', err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCameraActive(false);
  };

  const snapSelfie = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Stamp Watermark (Date, Time, GPS)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px sans-serif';
        ctx.fillText(
          `${new Date().toLocaleString('en-IN')} | Lat: ${latitude.toFixed(4)}, Long: ${longitude.toFixed(4)}`,
          15,
          canvas.height - 28
        );
        ctx.fillText(`${officerName} | MPO Field Attendance`, 15, canvas.height - 10);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setSelfieDataUrl(dataUrl);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelfieDataUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const openCheckIn = () => {
    captureGps();
    setSelfieDataUrl('');
    setIsCheckInMode(true);
    setIsCheckOutMode(false);
    startCamera();
  };

  const openCheckOut = () => {
    captureGps();
    setSelfieDataUrl('');
    setIsCheckOutMode(true);
    setIsCheckInMode(false);
    startCamera();
  };

  const handleCheckInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const todayStr = now.toISOString().split('T')[0];

    const record = MPOStorageService.checkIn({
      date: todayStr,
      officerId,
      officerName,
      officerMobile,
      checkInTime: timeStr,
      checkInLatitude: latitude,
      checkInLongitude: longitude,
      checkInAccuracy: accuracy,
      checkInAddress: address,
      checkInSelfieUrl: selfieDataUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      shiftStatus,
      daySummaryNotes: notes,
    });

    stopCamera();
    setIsCheckInMode(false);
    showToast(isMr ? 'फील्ड हजेरी (Check-in) यशस्वी!' : 'Check-in successful with GPS selfie!', 'success');
    loadAttendance();
  };

  const handleCheckOutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!todayRecord) return;
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    // Calculate working minutes
    const [inH, inM] = todayRecord.checkInTime.split(':').map(Number);
    const [outH, outM] = timeStr.split(':').map(Number);
    const totalMinutes = (outH * 60 + outM) - (inH * 60 + inM);

    MPOStorageService.checkOut(todayRecord.id, {
      checkOutTime: timeStr,
      checkOutLatitude: latitude,
      checkOutLongitude: longitude,
      checkOutAddress: address,
      checkOutSelfieUrl: selfieDataUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      totalWorkingMinutes: totalMinutes > 0 ? totalMinutes : 480,
      daySummaryNotes: notes || todayRecord.daySummaryNotes,
      kilometersTraveled: Number(kilometers) || 0,
    });

    stopCamera();
    setIsCheckOutMode(false);
    showToast(isMr ? 'दिवसाची रवानगी (Check-out) पूर्ण झाली!' : 'Check-out completed successfully!', 'success');
    loadAttendance();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 rounded-xl">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">
              {isMr ? 'MPO फील्ड हजेरी व GPS सेल्फी ट्रॅकिंग' : 'MPO Field Attendance & GPS Tracking'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {isMr ? 'दैनिक हजेरी, थेट कॅमेरा सेल्फी वॉटरमार्क, GPS स्थान, प्रवासाचे अंतर व कामाचे तास' : 'Daily check-in/out with live GPS coordinates, camera selfie watermark & working hours'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!todayRecord ? (
            <button
              onClick={openCheckIn}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>{isMr ? 'सकाळची हजेरी (Check-In)' : 'Field Check-In'}</span>
            </button>
          ) : !todayRecord.checkOutTime ? (
            <button
              onClick={openCheckOut}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>{isMr ? 'संध्याकाळची रवानगी (Check-Out)' : 'Field Check-Out'}</span>
            </button>
          ) : (
            <div className="px-3.5 py-2 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-green-300">
              <CheckCircle2 className="w-4 h-4" />
              <span>{isMr ? 'आजची हजेरी पूर्ण झाली' : 'Today Attendance Completed'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Today Status Card */}
      <div className="bg-gradient-to-r from-blue-800 via-indigo-900 to-slate-900 text-white p-5 rounded-2xl shadow-md border border-blue-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded-md uppercase">Today Shift Status</span>
              <span className="text-xs text-blue-200">{new Date().toDateString()}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white">
              {officerName}
            </h3>
            <p className="text-xs text-blue-200 flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-blue-400" />
              <span>{todayRecord?.checkInAddress || 'मिरज - कवठेपिरान दूध संकलन रूट (RT-101)'}</span>
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-xs text-center">
              <span className="text-[10px] text-blue-200 block uppercase">{isMr ? 'हजेरी वेळ' : 'Check-In'}</span>
              <span className="text-base sm:text-lg font-black font-mono text-emerald-300">
                {todayRecord?.checkInTime || '--:--'}
              </span>
            </div>
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-xs text-center">
              <span className="text-[10px] text-blue-200 block uppercase">{isMr ? 'रवानगी वेळ' : 'Check-Out'}</span>
              <span className="text-base sm:text-lg font-black font-mono text-rose-300">
                {todayRecord?.checkOutTime || '--:--'}
              </span>
            </div>
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-xs text-center col-span-2 sm:col-span-1">
              <span className="text-[10px] text-blue-200 block uppercase">{isMr ? 'एकूण तास' : 'Working Time'}</span>
              <span className="text-base sm:text-lg font-black font-mono text-amber-300">
                {todayRecord?.totalWorkingMinutes
                  ? `${Math.floor(todayRecord.totalWorkingMinutes / 60)}h ${todayRecord.totalWorkingMinutes % 60}m`
                  : 'चालू (In Progress)'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance History Register */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white text-base">
              {isMr ? 'मासिक फील्ड हजेरी नोंदवही' : 'Monthly Field Attendance Register'}
            </h3>
            <p className="text-xs text-slate-500">
              {isMr ? 'GPS लोकेशन, सेल्फी छायाचित्र व कामाचे तास' : 'GPS verification, selfie stamps & tour logs'}
            </p>
          </div>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-lg">
            {attendanceRecords.length} {isMr ? 'नोंदी' : 'Entries'}
          </span>
        </div>

        {attendanceRecords.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 dark:bg-slate-900 rounded-xl text-slate-400">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold">{isMr ? 'कोणतीही हजेरी नोंद आढळली नाही. वरून Check-In करा.' : 'No attendance logged yet. Click Check-In above.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold uppercase text-[11px]">
                  <th className="py-3 px-3">{isMr ? 'दिनांक' : 'Date'}</th>
                  <th className="py-3 px-3">{isMr ? 'अधिकारी' : 'Officer'}</th>
                  <th className="py-3 px-3">{isMr ? 'सेल्फी' : 'Selfie'}</th>
                  <th className="py-3 px-3">{isMr ? 'हजेरी वेळ व GPS' : 'Check-In & GPS'}</th>
                  <th className="py-3 px-3">{isMr ? 'रवानगी वेळ' : 'Check-Out'}</th>
                  <th className="py-3 px-3">{isMr ? 'कामाचे तास' : 'Hours'}</th>
                  <th className="py-3 px-3">{isMr ? 'स्थिती' : 'Status'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {attendanceRecords.map(att => (
                  <tr key={att.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40">
                    <td className="py-3 px-3 font-mono font-bold text-slate-800 dark:text-white">
                      {att.date}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">{att.officerName}</span>
                      <span className="text-[11px] font-mono text-slate-400">{att.officerMobile}</span>
                    </td>
                    <td className="py-3 px-3">
                      {att.checkInSelfieUrl ? (
                        <img src={att.checkInSelfieUrl} alt="Selfie" className="w-10 h-10 object-cover rounded-lg border border-slate-200 shadow-xs" />
                      ) : (
                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-400">
                          <User className="w-5 h-5" />
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 block">{att.checkInTime}</span>
                      <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{att.checkInLatitude?.toFixed(4)}, {att.checkInLongitude?.toFixed(4)}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {att.checkOutTime ? (
                        <span className="font-mono font-bold text-rose-600 dark:text-rose-400">{att.checkOutTime}</span>
                      ) : (
                        <span className="text-xs text-amber-600 font-medium italic">Active Shift</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                      {att.totalWorkingMinutes ? `${Math.floor(att.totalWorkingMinutes / 60)}h ${att.totalWorkingMinutes % 60}m` : '-'}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2.5 py-1 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 rounded-full text-xs font-bold">
                        {att.shiftStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Check In / Check Out Modal */}
      {(isCheckInMode || isCheckOutMode) && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-5 py-4 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-blue-200" />
                <h3 className="font-bold text-base">
                  {isCheckInMode ? (isMr ? 'फील्ड हजेरी (Check-In)' : 'Field Check-In') : (isMr ? 'फील्ड रवानगी (Check-Out)' : 'Field Check-Out')}
                </h3>
              </div>
              <button
                onClick={() => {
                  stopCamera();
                  setIsCheckInMode(false);
                  setIsCheckOutMode(false);
                }}
                className="text-blue-200 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={isCheckInMode ? handleCheckInSubmit : handleCheckOutSubmit} className="p-5 space-y-4 text-xs sm:text-sm">
              {/* Camera Preview / Selfie */}
              <div className="relative bg-slate-950 rounded-xl overflow-hidden aspect-4/3 flex items-center justify-center border border-slate-800">
                {isCameraActive && !selfieDataUrl && (
                  <>
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={snapSelfie}
                      className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-2 bg-white text-slate-900 rounded-full font-bold text-xs shadow-lg flex items-center gap-1.5 cursor-pointer hover:bg-slate-100"
                    >
                      <Camera className="w-4 h-4 text-blue-600" />
                      <span>{isMr ? 'सेल्फी कॅप्चर करा' : 'Capture Selfie'}</span>
                    </button>
                  </>
                )}

                {selfieDataUrl && (
                  <div className="relative w-full h-full">
                    <img src={selfieDataUrl} alt="Selfie" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setSelfieDataUrl('');
                        startCamera();
                      }}
                      className="absolute top-2 right-2 px-2.5 py-1 bg-black/70 text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      {isMr ? 'पुन्हा फोटो घ्या' : 'Retake'}
                    </button>
                  </div>
                )}

                {!isCameraActive && !selfieDataUrl && (
                  <div className="text-center p-4 text-slate-400 space-y-2">
                    <Camera className="w-8 h-8 mx-auto opacity-50" />
                    <p>{isMr ? 'कॅमेरा सुरू करण्यासाठी खाली क्लिक करा किंवा फोटो निवडा' : 'Start camera or upload photo'}</p>
                    <div className="flex items-center justify-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={startCamera}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold cursor-pointer"
                      >
                        {isMr ? 'कॅमेरा सुरू करा' : 'Start Camera'}
                      </button>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-bold cursor-pointer"
                      >
                        {isMr ? 'फोटो अपलोड' : 'Upload'}
                      </button>
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </div>
                  </div>
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>

              {/* GPS Information */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1 text-slate-700 dark:text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span>GPS Geotag Verified</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-600 font-bold">Accuracy: ±{accuracy}m</span>
                </div>
                <p className="text-[11px] font-mono text-slate-600 dark:text-slate-400">
                  Lat: {latitude.toFixed(5)}, Long: {longitude.toFixed(5)}
                </p>
                <p className="text-[11px] text-slate-500">{address}</p>
              </div>

              {/* Check-Out specific inputs */}
              {isCheckOutMode && (
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isMr ? 'दिवसभरात प्रवास केलेले अंतर (KM)' : 'Kilometers Traveled Today'}
                  </label>
                  <input
                    type="number"
                    value={kilometers}
                    onChange={e => setKilometers(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono font-bold"
                  />
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isMr ? 'दिवसभराचा शेरा / रूट अहवाल' : 'Work Summary Remarks'}
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder={isMr ? 'उदा. कवठेपिरान व बहे संकलन केंद्र तपासणी पूर्ण...' : 'Visited centers, inspected milk quality...'}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    setIsCheckInMode(false);
                    setIsCheckOutMode(false);
                  }}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  {isMr ? 'रद्द करा' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md cursor-pointer ${
                    isCheckInMode ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isCheckInMode ? (isMr ? 'हजेरी नोंदवा (Submit)' : 'Confirm Check-In') : (isMr ? 'रवानगी नोंदवा (Submit)' : 'Confirm Check-Out')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
