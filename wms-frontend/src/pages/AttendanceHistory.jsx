import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';

export default function AttendanceHistory() {
    const { user } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axiosClient.get('/api/attendance/history')
            .then(res => setHistory(res.data))
            .finally(() => setLoading(false));
    }, []);

    const formatTime = (iso) => iso ? new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '—';
    const formatDate = (iso) => iso ? new Date(iso).toLocaleDateString('vi-VN') : '—';

    return (
        <div className="p-8 bg-gray-50 min-h-full">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Lịch sử chấm công</h1>
                    <p className="text-gray-500 text-sm">Theo dõi thời gian ra vào, trễ giờ và làm thêm</p>
                </div>
                <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 flex gap-8">
                    <div className="text-center">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Ngày công</p>
                        <p className="text-xl font-black text-[#1192a8]">{history.length}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Trễ (lần)</p>
                        <p className="text-xl font-black text-red-500">{history.filter(h => h.lateMinutes > 0).length}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Tăng ca (phút)</p>
                        <p className="text-xl font-black text-orange-500">{history.reduce((sum, h) => sum + (h.overtimeMinutes || 0), 0)}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-gray-400">Đang tải dữ liệu...</div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 border-b">
                            <tr className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                                <th className="px-6 py-4">Ngày</th>
                                <th className="px-6 py-4">Giờ vào</th>
                                <th className="px-6 py-4">Giờ ra</th>
                                <th className="px-6 py-4">Trạng thái</th>
                                <th className="px-6 py-4">Đi muộn / Duyệt</th>
                                <th className="px-6 py-4">Làm thêm</th>
                                <th className="px-6 py-4">Ghi chú / Lý do</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {history.length === 0 ? (
                                <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">Chưa có dữ liệu chấm công</td></tr>
                            ) : history.map((row, idx) => (
                                <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                                    <td className="px-6 py-4 text-sm font-bold text-gray-700">{formatDate(row.workDate)}</td>
                                    <td className="px-6 py-4 text-sm font-mono text-green-600">{formatTime(row.checkInTime)}</td>
                                    <td className="px-6 py-4 text-sm font-mono text-orange-600">{formatTime(row.checkOutTime)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                            row.status === 'PRESENT' ? 'bg-green-100 text-green-700' :
                                            row.status === 'LATE' ? 'bg-red-100 text-red-700' : 'bg-gray-100'
                                        }`}>
                                            {row.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {row.lateMinutes > 0 ? (
                                            <div className="flex flex-col">
                                                <span className="text-sm text-red-500 font-bold">{row.lateMinutes} phút</span>
                                                <span className={`text-[9px] font-bold ${
                                                    row.approvalStatus === 'APPROVED' ? 'text-green-500' :
                                                    row.approvalStatus === 'REJECTED' ? 'text-red-400' : 'text-orange-400'
                                                }`}>
                                                    {row.approvalStatus === 'PENDING' ? '⌛ ĐANG CHỜ DUYỆT' : row.approvalStatus}
                                                </span>
                                            </div>
                                        ) : '—'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-orange-500 font-bold">
                                        {row.overtimeMinutes > 0 ? `${row.overtimeMinutes} phút` : '—'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-xs text-gray-600 font-medium">{row.lateReason || ''}</p>
                                        <p className="text-[10px] text-gray-400 italic mt-0.5">{row.note || ''}</p>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}