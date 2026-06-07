import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

export default function AttendanceHistory() {
    const { t, i18n } = useTranslation();
    const { user } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axiosClient.get('/api/attendance/history')
            .then(res => setHistory(res.data))
            .finally(() => setLoading(false));
    }, []);

    const formatTime = (iso) => iso ? new Date(iso).toLocaleTimeString(i18n.language === 'vi' ? 'vi-VN' : 'en-US', { hour: '2-digit', minute: '2-digit' }) : '—';
    const formatDate = (iso) => iso ? new Date(iso).toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US') : '—';

    return (
        <div className="p-4 md:p-8 bg-[#f8f9fa] min-h-full flex flex-col no-scrollbar">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6 md:mb-8 transition-all">
                <div>
                    <h1 className="text-xl md:text-2xl font-black text-gray-800 uppercase tracking-tight">{t('pages.AttendanceHistory.title')}</h1>
                    <p className="text-gray-500 text-xs md:text-sm font-medium">{t('pages.AttendanceHistory.subtitle')}</p>
                </div>
                <div className="bg-white p-4 md:px-6 md:py-3 rounded-2xl shadow-sm border border-gray-100 flex justify-between sm:justify-end gap-4 md:gap-8 shrink-0">
                    <div className="text-center px-2">
                        <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-wider mb-0.5">{t('pages.AttendanceHistory.totalDays')}</p>
                        <p className="text-lg md:text-xl font-black text-[#1192a8]">{history.length}</p>
                    </div>
                    <div className="text-center px-2 border-l border-gray-50">
                        <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-wider mb-0.5">{t('pages.AttendanceHistory.lateCount')}</p>
                        <p className="text-lg md:text-xl font-black text-red-500">{history.filter(h => h.lateMinutes > 0).length}</p>
                    </div>
                    <div className="text-center px-2 border-l border-gray-50">
                        <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-wider mb-0.5">{t('pages.AttendanceHistory.overtimeMinutes')}</p>
                        <p className="text-lg md:text-xl font-black text-orange-500">{history.reduce((sum, h) => sum + (h.overtimeMinutes || 0), 0)}</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                <div className="overflow-x-auto no-scrollbar lg:scrollbar-thin">
                    <table className="w-full text-left border-collapse min-w-[800px] md:min-w-[1000px]">
                        <thead className="bg-gray-50/80 border-b sticky top-0 z-10 backdrop-blur-sm">
                            <tr className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                <th className="px-5 md:px-6 py-4">{t('pages.AttendanceHistory.headerWorkDate')}</th>
                                <th className="px-5 md:px-6 py-4">{t('pages.AttendanceHistory.headerCheckIn')}</th>
                                <th className="px-5 md:px-6 py-4">{t('pages.AttendanceHistory.headerCheckOut')}</th>
                                <th className="px-5 md:px-6 py-4 text-center">{t('pages.AttendanceHistory.headerStatus')}</th>
                                <th className="px-5 md:px-6 py-4">{t('pages.AttendanceHistory.headerLateApproval')}</th>
                                <th className="px-5 md:px-6 py-4">{t('pages.AttendanceHistory.headerOvertime')}</th>
                                <th className="px-5 md:px-6 py-4">{t('pages.AttendanceHistory.headerNoteReason')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan={7} className="px-6 py-20 text-center text-[#1192a8] font-bold animate-pulse uppercase text-xs tracking-widest">{t('pages.AttendanceHistory.loading')}</td></tr>
                            ) : history.length === 0 ? (
                                <tr><td colSpan={7} className="px-6 py-20 text-center text-gray-400 italic font-medium">{t('pages.AttendanceHistory.noData')}</td></tr>
                            ) : history.map((row, idx) => (
                                <tr key={idx} className="hover:bg-blue-50/30 transition-colors group cursor-default">
                                    <td className="px-5 md:px-6 py-4 text-sm font-black text-gray-700">{formatDate(row.workDate)}</td>
                                    <td className="px-5 md:px-6 py-4 text-sm font-mono font-bold text-green-600">{formatTime(row.checkInTime)}</td>
                                    <td className="px-5 md:px-6 py-4 text-sm font-mono font-bold text-orange-600">{formatTime(row.checkOutTime)}</td>
                                    <td className="px-5 md:px-6 py-4 text-center">
                                        <span className={`text-[9px] md:text-[10px] font-black px-2.5 py-1 rounded-lg uppercase shadow-sm border ${
                                            row.status === 'PRESENT' ? 'bg-green-50 text-green-700 border-green-100' :
                                            row.status === 'LATE' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-gray-50 text-gray-400 border-gray-100'
                                        }`}>
                                            {row.status === 'PRESENT' ? t('pages.AttendanceHistory.statusPresent') : row.status === 'LATE' ? t('pages.AttendanceHistory.statusLate') : t('pages.AttendanceHistory.statusAbsent')}
                                        </span>
                                    </td>
                                    <td className="px-5 md:px-6 py-4">
                                        {row.lateMinutes > 0 ? (
                                            <div className="flex flex-col">
                                                <span className="text-sm text-red-500 font-black">{t('pages.AttendanceHistory.minutes', { count: row.lateMinutes })}</span>
                                                <span className={`text-[9px] font-black uppercase tracking-tighter mt-0.5 ${
                                                    row.approvalStatus === 'APPROVED' ? 'text-green-500' :
                                                    row.approvalStatus === 'REJECTED' ? 'text-red-400' : 'text-amber-500'
                                                }`}>
                                                    {row.approvalStatus === 'PENDING' ? t('pages.AttendanceHistory.approvalPending') : row.approvalStatus === 'APPROVED' ? t('pages.AttendanceHistory.approvalApproved') : t('pages.AttendanceHistory.approvalRejected')}
                                                </span>
                                            </div>
                                        ) : <span className="text-gray-300 font-bold">—</span>}
                                    </td>
                                    <td className="px-5 md:px-6 py-4 text-sm text-orange-600 font-black">
                                        {row.overtimeMinutes > 0 ? t('pages.AttendanceHistory.overtimeFormat', { count: row.overtimeMinutes }) : <span className="text-gray-300 font-bold">—</span>}
                                    </td>
                                    <td className="px-5 md:px-6 py-4 min-w-[200px]">
                                        {row.lateReason && <p className="text-xs text-gray-600 font-bold bg-gray-100 px-2 py-1 rounded-lg inline-block mb-1">{row.lateReason}</p>}
                                        <p className="text-[10px] text-gray-400 font-medium italic">{row.note || ''}</p>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
