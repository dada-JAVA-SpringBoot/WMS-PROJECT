import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import axiosClient from '../../api/axiosClient';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function AttendanceModal({ user, onClose }) {
    const { t, i18n } = useTranslation();
    const isEnglish = String(i18n.language || '').startsWith('en');
    
    // Translations (Move to t() later)
    const copy = isEnglish ? {
        title: 'SECURE CHECK-IN',
        hello: 'Hello',
        currentTime: 'Current time',
        shiftStart: 'Shift start',
        lateTitle: 'You are checking in late.',
        lateDesc: 'A reason is required for manager approval.',
        lateLabel: 'Late reason *',
        latePlaceholder: 'Enter reason...',
        readyTitle: 'Ready to start?',
        readyDesc: 'Please scan the Manager\'s QR code.',
        reasonRequired: 'Please enter a reason for being late.',
        success: 'Check-in successful!',
        failed: 'Check-in failed',
        processing: 'PROCESSING...',
        qrPrompt: 'SCAN MANAGER QR',
        qrInvalid: 'Invalid or Expired QR code'
    } : {
        title: 'CHẤM CÔNG BẢO MẬT',
        hello: 'Xin chào',
        currentTime: 'Giờ hiện tại',
        shiftStart: 'Giờ bắt đầu ca',
        lateTitle: 'Bạn đang chấm công trễ.',
        lateDesc: 'Cần có lý do để quản lý phê duyệt.',
        lateLabel: 'Lý do đi trễ *',
        latePlaceholder: 'Nhập lý do cụ thể...',
        readyTitle: 'Sẵn sàng bắt đầu?',
        readyDesc: 'Vui lòng quét mã QR từ máy Quản lý.',
        reasonRequired: 'Vui lòng nhập lý do đi trễ.',
        success: 'Chấm công thành công!',
        failed: 'Chấm công thất bại',
        processing: 'ĐANG XỬ LÝ...',
        qrPrompt: 'QUÉT MÃ QUẢN LÝ',
        qrInvalid: 'Mã QR không hợp lệ hoặc hết hạn'
    };

    const [loading, setLoading] = useState(true);
    const [reason, setReason] = useState('');
    const [isLate, setIsLate] = useState(false);
    const [checking, setChecking] = useState(false);
    const [showScanner, setShowScanner] = useState(false);

    // Mock shift start time
    const SHIFT_START = "08:00"; 

    useEffect(() => {
        if (!user || user.roles.includes('ADMIN')) {
            onClose();
            return;
        }
        axiosClient.get('/api/attendance/today').then(res => {
            if (res.data && res.data.checkInTime) {
                onClose();
            } else {
                setLoading(false);
                checkLateness();
            }
        }).catch(() => setLoading(false));
    }, [user]);

    const checkLateness = () => {
        const now = new Date();
        const [h, m] = SHIFT_START.split(':');
        const shiftDate = new Date();
        shiftDate.setHours(parseInt(h), parseInt(m), 0);
        shiftDate.setMinutes(shiftDate.getMinutes() + 15);
        if (now > shiftDate) setIsLate(true);
    };

    // Scanner Logic
    const scannerRef = useRef(null);
    useEffect(() => {
        if (showScanner && !scannerRef.current) {
            const scanner = new Html5QrcodeScanner("reader", { 
                fps: 10, 
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0
            }, false);

            scanner.render((decodedText) => {
                scanner.clear();
                scannerRef.current = null;
                setShowScanner(false);
                handleCheckIn(decodedText);
            }, (error) => {
                // Ignore scan errors
            });
            scannerRef.current = scanner;
        }
        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear();
                scannerRef.current = null;
            }
        };
    }, [showScanner]);

    const handleCheckIn = async (qrToken) => {
        if (isLate && !reason.trim()) {
            alert(copy.reasonRequired);
            return;
        }
        setChecking(true);
        try {
            await axiosClient.post('/api/attendance/check-in', { reason, qrToken });
            alert(copy.success);
            onClose();
        } catch (e) {
            alert(e.response?.data?.message || copy.failed);
            setShowScanner(false);
        } finally {
            setChecking(false);
        }
    };

    if (loading) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="bg-gradient-to-br from-[#00529c] to-[#1192a8] p-8 text-center text-white relative">
                    <button onClick={onClose} className="absolute top-6 right-6 text-white/50 hover:text-white text-2xl leading-none">&times;</button>
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                        <span className="text-4xl">🕒</span>
                    </div>
                    <h2 className="text-2xl font-black tracking-tight uppercase">{copy.title}</h2>
                    <p className="text-white/80 text-sm mt-1">{copy.hello}, {user.fullName}</p>
                </div>

                <div className="p-8">
                    {!showScanner ? (
                        <>
                            <div className="flex justify-between items-center mb-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{copy.currentTime}</p>
                                    <p className="text-2xl font-black text-gray-800">{new Date().toLocaleTimeString(isEnglish ? 'en-US' : 'vi-VN', {hour:'2-digit', minute:'2-digit'})}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{copy.shiftStart}</p>
                                    <p className="text-lg font-bold text-[#1192a8]">{SHIFT_START}</p>
                                </div>
                            </div>

                            {isLate ? (
                                <div className="space-y-4 mb-6">
                                    <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-start gap-3">
                                        <span className="text-xl">⚠️</span>
                                        <div className="text-left">
                                            <p className="text-red-700 font-bold text-sm">{copy.lateTitle}</p>
                                            <p className="text-red-600/70 text-xs">{copy.lateDesc}</p>
                                        </div>
                                    </div>
                                    <div className="text-left">
                                        <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2 ml-1">{copy.lateLabel}</label>
                                        <textarea 
                                            value={reason}
                                            onChange={e => setReason(e.target.value)}
                                            placeholder={copy.latePlaceholder}
                                            className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#1192a8] focus:ring-4 focus:ring-[#1192a8]/10 transition-all min-h-[80px] resize-none"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-green-50 border border-green-100 p-6 rounded-3xl text-center mb-6">
                                    <p className="text-green-700 font-bold">{copy.readyTitle}</p>
                                    <p className="text-green-600/70 text-xs mt-1">{copy.readyDesc}</p>
                                </div>
                            )}

                            <button 
                                onClick={() => {
                                    if (isLate && !reason.trim()) return alert(copy.reasonRequired);
                                    setShowScanner(true);
                                }}
                                disabled={checking}
                                className="w-full bg-[#1192a8] hover:bg-teal-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-teal-500/30 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-widest text-sm">
                                {checking ? copy.processing : copy.qrPrompt}
                            </button>
                        </>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div id="reader" className="overflow-hidden rounded-3xl border-4 border-gray-100"></div>
                            <button 
                                onClick={() => setShowScanner(false)}
                                className="w-full mt-6 text-gray-400 font-bold uppercase text-[10px] tracking-widest hover:text-gray-600">
                                {t('common.cancel')}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
