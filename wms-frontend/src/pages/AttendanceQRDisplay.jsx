import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import CryptoJS from 'crypto-js';
import { useTranslation } from 'react-i18next';

export default function AttendanceQRDisplay() {
    const { t } = useTranslation();
    const [qrToken, setQrToken] = useState('');
    const [countdown, setCountdown] = useState(3);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timeInterval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timeInterval);
    }, []);

    useEffect(() => {
        const secret = "your-256-bit-secret-here-at-least-32-chars"; // Trong thực tế nên lấy từ backend hoặc config bảo mật
        
        const generateToken = () => {
            const timestamp = Date.now();
            const hmac = CryptoJS.HmacSHA256(timestamp.toString(), secret).toString();
            setQrToken(`${timestamp}:${hmac}`);
            setCountdown(3);
        };

        generateToken();
        const interval = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    generateToken();
                    return 3;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 md:p-8 select-none">
            {/* Background Decorations */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#1192a8]/20 rounded-full blur-[80px] md:blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#00529c]/20 rounded-full blur-[100px] md:blur-[150px]"></div>
            </div>

            <div className="z-10 w-full max-w-4xl flex flex-col items-center">
                {/* Header */}
                <div className="text-center mb-8 md:mb-12">
                    <h1 className="text-3xl sm:text-4xl md:text-6xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-[#1192a8] mb-3 md:mb-4">
                        {t('pages.AttendanceManagement.qrAttendanceTitle') || 'MÃ CHẤM CÔNG'}
                    </h1>
                    <p className="text-sm sm:text-lg md:text-2xl text-gray-400 font-medium max-w-2xl mx-auto leading-relaxed px-4">
                        {t('pages.AttendanceManagement.qrAttendanceSubtitle') || 'Nhân viên quét mã này để điểm danh. Mã tự động làm mới sau mỗi 3 giây.'}
                    </p>
                </div>

                {/* Main QR Card */}
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] shadow-2xl flex flex-col items-center relative w-full max-w-sm md:max-w-md lg:max-w-lg">
                    
                    {/* Timer progress bar on top of the card */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 md:h-2 bg-white/10 rounded-t-[2rem] md:rounded-t-[3rem] overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-teal-400 to-[#1192a8] transition-all duration-1000 ease-linear"
                            style={{ width: `${(countdown / 3) * 100}%` }}
                        ></div>
                    </div>

                    <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-[2rem] shadow-inner mb-6 md:mb-8 w-full flex justify-center">
                        {qrToken && (
                            <QRCodeSVG 
                                value={qrToken} 
                                className="w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80" 
                                level="H"
                                includeMargin={true}
                            />
                        )}
                    </div>
                    
                    <div className="text-center w-full">
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs md:text-sm mb-2">
                            {t('pages.AttendanceManagement.qrAttendanceExpireNote') || 'Mã có hiệu lực trong 10 giây'}
                        </p>
                        <div className="flex items-center justify-center gap-2 md:gap-3 bg-black/30 rounded-xl md:rounded-2xl py-2 md:py-3 px-4 md:px-6 border border-white/5">
                            <span className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-teal-400 animate-pulse"></span>
                            <span className="font-mono text-xl md:text-2xl font-black tracking-widest">{countdown}s</span>
                        </div>
                    </div>
                </div>

                {/* Footer Time */}
                <div className="mt-8 md:mt-16 text-center">
                    <p className="text-gray-500 uppercase tracking-widest font-black text-xs md:text-sm mb-1 md:mb-2">Thời gian hệ thống</p>
                    <p className="font-mono text-3xl sm:text-4xl md:text-5xl font-black text-white/80">
                        {currentTime.toLocaleTimeString('vi-VN')}
                    </p>
                </div>
            </div>
        </div>
    );
}
