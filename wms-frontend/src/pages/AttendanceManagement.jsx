import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import AttendanceModal from '../components/modals/AttendanceModal'; // We might use a custom modal for approval
import { useTranslation } from 'react-i18next';

export default function AttendanceManagement() {
    const { t, i18n } = useTranslation();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ start: '', end: '' });
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [approvalNote, setApprovalNote] = useState('');

    const fetchRecords = () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (filters.start) params.append('start', filters.start);
        if (filters.end) params.append('end', filters.end);
        axiosClient.get(`/api/attendance/admin/all?${params.toString()}`)
            .then(res => setRecords(res.data))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchRecords(); }, []);

    const handleApprove = async (id, status) => {
        try {
            await axiosClient.post(`/api/attendance/${id}/approve`, { status, note: approvalNote });
            alert(t('pages.AttendanceManagement.statusUpdated'));
            setSelectedRecord(null);
            setApprovalNote('');
            fetchRecords();
        } catch (e) {
            alert(t('pages.AttendanceManagement.approvalError'));
        }
    };

    const formatTime = (iso) => iso ? new Date(iso).toLocaleTimeString(i18n.language === 'vi' ? 'vi-VN' : 'en-US', { hour: '2-digit', minute: '2-digit' }) : '—';
    const formatDate = (iso) => iso ? new Date(iso).toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US') : '—';

    return (
        <div className="p-4 md:p-8 bg-[#f8f9fa] dark:bg-gray-900 min-h-full flex flex-col no-scrollbar transition-colors duration-300">

            {/* ── Header ── */}
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6 md:mb-8 transition-all">
                <div>
                    <h1 className="text-xl md:text-2xl font-black text-gray-800 dark:text-gray-100 uppercase tracking-tight">{t('pages.AttendanceManagement.title')}</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm font-medium">{t('pages.AttendanceManagement.subtitle')}</p>
                </div>

                {/* ── Filter card ── */}
                <div className="bg-white dark:bg-gray-800 p-3 md:p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row gap-2 md:gap-3 shrink-0 transition-colors duration-300">
                    <div className="flex gap-2">
                        <div className="flex-1 sm:flex-none">
                            <p className="text-[8px] font-black text-gray-400 dark:text-gray-500 uppercase ml-1 mb-0.5">{t('pages.AttendanceManagement.fromDate')}</p>
                            <input 
                                type="date" 
                                className="w-full px-3 py-2 rounded-xl border border-gray-100 dark:border-gray-600 text-xs font-bold outline-none focus:border-[#1192a8] transition-all bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                                value={filters.start}
                                onChange={e => setFilters({ ...filters, start: e.target.value })}
                            />
                        </div>
                        <div className="flex-1 sm:flex-none">
                            <p className="text-[8px] font-black text-gray-400 dark:text-gray-500 uppercase ml-1 mb-0.5">{t('pages.AttendanceManagement.toDate')}</p>
                            <input 
                                type="date" 
                                className="w-full px-3 py-2 rounded-xl border border-gray-100 dark:border-gray-600 text-xs font-bold outline-none focus:border-[#1192a8] transition-all bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                                value={filters.end}
                                onChange={e => setFilters({ ...filters, end: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={fetchRecords}
                            className="w-full sm:w-auto bg-[#1192a8] text-white px-6 py-2.5 rounded-xl font-black text-[11px] shadow-lg shadow-teal-500/20 active:scale-95 transition-all uppercase tracking-widest"
                        >
                            {t('pages.AttendanceManagement.filterButton')}
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Table ── */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col transition-colors duration-300">
                <div className="overflow-x-auto no-scrollbar lg:scrollbar-thin">
                    <table className="w-full text-left border-collapse min-w-[900px] md:min-w-[1100px]">
                        <thead className="bg-gray-50/80 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 sticky top-0 z-10 backdrop-blur-sm">
                        <tr className="text-[9px] md:text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                            <th className="px-5 md:px-6 py-4">{t('pages.AttendanceManagement.headerEmployee')}</th>
                            <th className="px-5 md:px-6 py-4">{t('pages.AttendanceManagement.headerWorkDate')}</th>
                            <th className="px-5 md:px-6 py-4">{t('pages.AttendanceManagement.headerCheckInOut')}</th>
                            <th className="px-5 md:px-6 py-4 text-center">{t('pages.AttendanceManagement.headerStatus')}</th>
                            <th className="px-5 md:px-6 py-4">{t('pages.AttendanceManagement.headerLateApproval')}</th>
                            <th className="px-5 md:px-6 py-4">{t('pages.AttendanceManagement.headerEmployeeReason')}</th>
                            <th className="px-5 md:px-6 py-4 text-right">{t('pages.AttendanceManagement.headerActions')}</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-20 text-center text-[#1192a8] font-bold animate-pulse uppercase text-xs tracking-widest">
                                    {t('pages.AttendanceManagement.loading')}
                                </td>
                            </tr>
                        ) : records.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-20 text-center text-gray-400 dark:text-gray-600 italic font-medium">
                                    {t('pages.AttendanceManagement.noData')}
                                </td>
                            </tr>
                        ) : records.map((row, idx) => (
                            <tr key={idx} className="hover:bg-blue-50/30 dark:hover:bg-gray-700/30 transition-colors group">
                                <td className="px-5 md:px-6 py-4">
                                    <p className="text-sm font-black text-gray-800 dark:text-gray-100 uppercase tracking-tight">{row.staff?.fullName}</p>
                                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono font-bold">{row.staff?.employeeCode}</p>
                                </td>
                                <td className="px-5 md:px-6 py-4 text-sm font-bold text-gray-600 dark:text-gray-300">
                                    {formatDate(row.workDate)}
                                </td>
                                <td className="px-5 md:px-6 py-4">
                                    <div className="text-[11px] font-mono font-bold space-y-0.5">
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                                            <span className="text-green-600 dark:text-green-400">IN: {formatTime(row.checkInTime)}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-1 h-1 bg-orange-500 rounded-full"></span>
                                            <span className="text-orange-600 dark:text-orange-400">OUT: {formatTime(row.checkOutTime)}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-5 md:px-6 py-4 text-center">
                                        <span className={`text-[9px] md:text-[10px] font-black px-2.5 py-1 rounded-lg uppercase shadow-sm border ${
                                            row.status === 'PRESENT'
                                                ? 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
                                                : 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
                                        }`}>
                                            {row.status === 'PRESENT' ? t('pages.AttendanceManagement.statusPresent') : t('pages.AttendanceManagement.statusLate')}
                                        </span>
                                    </td>
                                    <td className="px-5 md:px-6 py-4">
                                        {row.lateMinutes > 0 ? (
                                            <div className="flex flex-col">
                                                <span className="text-sm text-red-500 dark:text-red-400 font-black">{t('pages.AttendanceManagement.minutes', { count: row.lateMinutes })}</span>
                                                <span className={`text-[9px] font-black uppercase tracking-tighter mt-0.5 ${
                                                row.approvalStatus === 'APPROVED' ? 'text-green-500 dark:text-green-400' :
                                                    row.approvalStatus === 'REJECTED' ? 'text-red-400 dark:text-red-400' :
                                                        'text-amber-500 dark:text-amber-400'
                                            }`}>
                                                    {row.approvalStatus === 'PENDING' ? t('pages.AttendanceManagement.approvalPending') : row.approvalStatus === 'APPROVED' ? t('pages.AttendanceManagement.approvalApproved') : t('pages.AttendanceManagement.approvalRejected')}
                                                </span>
                                            </div>
                                        ) : <span className="text-gray-300 dark:text-gray-600 font-bold">—</span>}
                                    </td>
                                    <td className="px-5 md:px-6 py-4 max-w-xs">
                                        {row.lateReason && <p className="text-xs text-gray-700 dark:text-gray-300 font-bold bg-orange-50 dark:bg-orange-900/20 px-2.5 py-1 rounded-lg inline-block border border-orange-100 dark:border-orange-800 italic">"{row.lateReason}"</p>}
                                        {row.note && <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium italic mt-1.5">{t('pages.AttendanceManagement.feedback', { note: row.note })}</p>}
                                    </td>
                                    <td className="px-5 md:px-6 py-4 text-right">
                                        {row.lateMinutes > 0 && row.approvalStatus === 'PENDING' ? (
                                            <button 
                                                onClick={() => setSelectedRecord(row)}
                                                className="bg-[#1192a8]/10 dark:bg-[#1192a8]/20 text-[#1192a8] px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-[#1192a8] hover:text-white transition-all shadow-sm active:scale-95"
                                            >
                                                {t('pages.AttendanceManagement.approveButton')}
                                            </button>
                                        ) : <span className="text-gray-300 dark:text-gray-600 text-[10px] font-bold uppercase tracking-tighter">{t('pages.AttendanceManagement.completed')}</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Modal Duyệt ── */}
            {selectedRecord && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-2 md:p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[98vh] animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-5 md:p-6 border-b dark:border-gray-700 shrink-0 bg-[#1192a8]">
                            <h3 className="text-base md:text-lg font-black text-white text-center uppercase tracking-widest">{t('pages.AttendanceManagement.modalTitle')}</h3>
                            <p className="text-[10px] md:text-xs text-center text-white/70 mt-1 font-bold uppercase">
                                {selectedRecord.staff?.fullName} — {formatDate(selectedRecord.workDate)}
                            </p>
                        </div>

                        {/* Modal body */}
                        <div className="p-5 md:p-6 space-y-5 overflow-y-auto flex-1">
                            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-2xl border border-orange-100 dark:border-orange-800 shadow-sm">
                                <p className="text-[9px] font-black text-orange-400 dark:text-orange-300 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                    <span className="w-1 h-1 bg-orange-400 rounded-full"></span> {t('pages.AttendanceManagement.modalEmployeeReasonLabel')}
                                </p>
                                <p className="text-sm text-gray-700 dark:text-gray-200 italic font-bold leading-relaxed">
                                    "{selectedRecord.lateReason}"
                                </p>
                            </div>
                            <div>
                                <label className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 block ml-1">{t('pages.AttendanceManagement.modalManagerFeedbackLabel')}</label>
                                <textarea 
                                    className="w-full border-2 border-gray-100 dark:border-gray-600 rounded-2xl p-4 text-sm h-28 focus:ring-4 focus:ring-[#1192a8]/10 focus:border-[#1192a8] outline-none transition-all resize-none bg-gray-50/30 dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                                    placeholder={t('pages.AttendanceManagement.modalFeedbackPlaceholder')}
                                    value={approvalNote}
                                    onChange={e => setApprovalNote(e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3 md:gap-4 pt-2">
                                <button
                                    onClick={() => handleApprove(selectedRecord.id, 'REJECTED')}
                                    className="py-3.5 rounded-2xl text-[10px] md:text-[11px] font-black uppercase tracking-widest bg-rose-50 dark:bg-rose-900/30 text-rose-500 dark:text-rose-300 border border-rose-100 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-all active:scale-95 shadow-sm"
                                >
                                    {t('pages.AttendanceManagement.rejectButton')}
                                </button>
                                <button
                                    onClick={() => handleApprove(selectedRecord.id, 'APPROVED')}
                                    className="py-3.5 rounded-2xl text-[10px] md:text-[11px] font-black uppercase tracking-widest bg-[#1192a8] text-white hover:bg-teal-700 transition-all active:scale-95 shadow-xl shadow-teal-500/20"
                                >
                                    {t('pages.AttendanceManagement.approveConfirmButton')}
                                </button>
                            </div>
                        </div>

                        {/* Modal footer */}
                        <button
                            onClick={() => setSelectedRecord(null)}
                            className="w-full py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all border-t dark:border-gray-700 uppercase tracking-widest"
                        >
                            {t('pages.AttendanceManagement.cancelButton')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
