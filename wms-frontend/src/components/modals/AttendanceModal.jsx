import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';

export default function AttendanceModal({ user, onClose }) {
    const [attendance, setAttendance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reason, setReason] = useState('');
    const [isLate, setIsLate] = useState(false);
    const [checking, setChecking] = useState(false);

    // Mock thời gian ca làm việc (thực tế nên gọi API lấy ca)
    const SHIFT_START = "08:00"; 

    useEffect(() => {
        if (!user || user.roles.includes('ADMIN')) {
            onClose(); // Admin không cần chấm công
            return;
        }

        // Kiểm tra xem hôm nay đã chấm công chưa
        axiosClient.get('/api/attendance/today').then(res => {
            if (res.data && res.data.checkInTime) {
                onClose(); // Đã chấm công rồi thì đóng luôn
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
        
        // Cho phép trễ 15 phút (giống backend)
        shiftDate.setMinutes(shiftDate.getMinutes() + 15);

        if (now > shiftDate) {
            setIsLate(true);
        }
    };

    const handleCheckIn = async () => {
        if (isLate && !reason.trim()) {
            alert("Vui lòng nhập lý do đi trễ!");
            return;
        }
        setChecking(true);
        try {
            await axiosClient.post('/api/attendance/check-in', { reason });
            alert("Chấm công thành công!");
            onClose();
        } catch (e) {
            alert(e.response?.data?.message || "Lỗi chấm công");
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
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                        <span className="text-4xl">🕒</span>
                    </div>
                    <h2 className="text-2xl font-black tracking-tight">XÁC NHẬN VÀO CA</h2>
                    <p className="text-white/80 text-sm mt-1">Xin chào, {user.fullName}</p>
                </div>

                {/* Body */}
                <div className="p-8">
                    <div className="flex justify-between items-center mb-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Giờ hiện tại</p>
                            <p className="text-2xl font-black text-gray-800">{new Date().toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Quy định vào ca</p>
                            <p className="text-lg font-bold text-[#1192a8]">{SHIFT_START}</p>
                        </div>
                    </div>

                    {isLate ? (
                        <div className="space-y-4 animate-in slide-in-from-top-4 duration-500">
                            <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-start gap-3">
                                <span className="text-xl">⚠️</span>
                                <div>
                                    <p className="text-red-700 font-bold text-sm">Bạn đang vào ca trễ!</p>
                                    <p className="text-red-600/70 text-xs">Hệ thống yêu cầu lý do để quản lý phê duyệt.</p>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2 ml-1">Lý do đi trễ *</label>
                                <textarea 
                                    value={reason}
                                    onChange={e => setReason(e.target.value)}
                                    placeholder="Nhập lý do cụ thể (VD: Hỏng xe, tắc đường...)"
                                    className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#1192a8] focus:ring-4 focus:ring-[#1192a8]/10 transition-all min-h-[100px] resize-none"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="bg-green-50 border border-green-100 p-6 rounded-3xl text-center mb-6">
                            <p className="text-green-700 font-bold">Bạn đã sẵn sàng làm việc?</p>
                            <p className="text-green-600/70 text-xs mt-1">Hôm nay bạn đi làm rất đúng giờ!</p>
                        </div>
                    )}

                    <button 
                        onClick={handleCheckIn}
                        disabled={checking}
                        className="w-full bg-[#1192a8] hover:bg-teal-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-teal-500/30 transition-all active:scale-95 disabled:opacity-50 mt-4 flex items-center justify-center gap-3">
                        {checking ? "ĐANG XỬ LÝ..." : (isLate ? "GỬI VÀ BẮT ĐẦU" : "BẮT ĐẦU LÀM VIỆC")}
                    </button>
                </div>
            </div>
        </div>
    );
}