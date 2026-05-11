import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import AttendanceModal from '../components/modals/AttendanceModal'; // We might use a custom modal for approval

export default function AttendanceManagement() {
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

    useEffect(() => {
        fetchRecords();
    }, []);

    const handleApprove = async (id, status) => {
        try {
            await axiosClient.post(`/api/attendance/${id}/approve`, {
                status,
                note: approvalNote
            });
            alert('Đã cập nhật trạng thái duyệt');
            setSelectedRecord(null);
            setApprovalNote('');
            fetchRecords();
        } catch (e) {
            alert('Lỗi khi duyệt');
        }
    };

    const formatTime = (iso) => iso ? new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '—';
    const formatDate = (iso) => iso ? new Date(iso).toLocaleDateString('vi-VN') : '—';

    return (
        <div className="p-4 md:p-8 bg-[#f8f9fa] min-h-full flex flex-col no-scrollbar">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6 md:mb-8 transition-all">
                <div>
                    <h1 className="text-xl md:text-2xl font-black text-gray-800 uppercase tracking-tight">Quản lý chấm công</h1>
                    <p className="text-gray-500 text-xs md:text-sm font-medium">Duyệt lý do đi trễ và xem lịch sử toàn nhân viên</p>
                </div>
                <div className="bg-white p-3 md:p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-2 md:gap-3 shrink-0">
                    <div className="flex gap-2">
                        <div className="flex-1 sm:flex-none">
                            <p className="text-[8px] font-black text-gray-400 uppercase ml-1 mb-0.5">Từ ngày</p>
                            <input 
                                type="date" 
                                className="w-full px-3 py-2 rounded-xl border border-gray-100 text-xs font-bold outline-none focus:border-[#1192a8] transition-all"
                                value={filters.start}
                                onChange={e => setFilters({...filters, start: e.target.value})}
                            />
                        </div>
                        <div className="flex-1 sm:flex-none">
                            <p className="text-[8px] font-black text-gray-400 uppercase ml-1 mb-0.5">Đến ngày</p>
                            <input 
                                type="date" 
                                className="w-full px-3 py-2 rounded-xl border border-gray-100 text-xs font-bold outline-none focus:border-[#1192a8] transition-all"
                                value={filters.end}
                                onChange={e => setFilters({...filters, end: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="flex items-end">
                        <button 
                            onClick={fetchRecords}
                            className="w-full sm:w-auto bg-[#1192a8] text-white px-6 py-2.5 rounded-xl font-black text-[11px] shadow-lg shadow-teal-500/20 active:scale-95 transition-all uppercase tracking-widest"
                        >
                            Lọc dữ liệu
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                <div className="overflow-x-auto no-scrollbar lg:scrollbar-thin">
                    <table className="w-full text-left border-collapse min-w-[900px] md:min-w-[1100px]">
                        <thead className="bg-gray-50/80 border-b sticky top-0 z-10 backdrop-blur-sm">
                            <tr className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                <th className="px-5 md:px-6 py-4">Nhân viên</th>
                                <th className="px-5 md:px-6 py-4">Ngày làm việc</th>
                                <th className="px-5 md:px-6 py-4">Giờ vào/ra</th>
                                <th className="px-5 md:px-6 py-4 text-center">Trạng thái</th>
                                <th className="px-5 md:px-6 py-4">Đi muộn / Duyệt</th>
                                <th className="px-5 md:px-6 py-4">Lý do nhân viên</th>
                                <th className="px-5 md:px-6 py-4 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan={7} className="px-6 py-20 text-center text-[#1192a8] font-bold animate-pulse uppercase text-xs tracking-widest">Đang tải dữ liệu...</td></tr>
                            ) : records.length === 0 ? (
                                <tr><td colSpan={7} className="px-6 py-20 text-center text-gray-400 italic font-medium">Chưa có dữ liệu chấm công để hiển thị.</td></tr>
                            ) : records.map((row, idx) => (
                                <tr key={idx} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="px-5 md:px-6 py-4">
                                        <p className="text-sm font-black text-gray-800 uppercase tracking-tight">{row.staff?.fullName}</p>
                                        <p className="text-[10px] text-gray-400 font-mono font-bold">{row.staff?.employeeCode}</p>
                                    </td>
                                    <td className="px-5 md:px-6 py-4 text-sm font-bold text-gray-600">{formatDate(row.workDate)}</td>
                                    <td className="px-5 md:px-6 py-4">
                                        <div className="text-[11px] font-mono font-bold space-y-0.5">
                                            <div className="flex items-center gap-1.5"><span className="w-1 h-1 bg-green-500 rounded-full"></span><span className="text-green-600">IN: {formatTime(row.checkInTime)}</span></div>
                                            <div className="flex items-center gap-1.5"><span className="w-1 h-1 bg-orange-500 rounded-full"></span><span className="text-orange-600">OUT: {formatTime(row.checkOutTime)}</span></div>
                                        </div>
                                    </td>
                                    <td className="px-5 md:px-6 py-4 text-center">
                                        <span className={`text-[9px] md:text-[10px] font-black px-2.5 py-1 rounded-lg uppercase shadow-sm border ${
                                            row.status === 'PRESENT' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
                                        }`}>
                                            {row.status === 'PRESENT' ? 'Đúng giờ' : 'Đi muộn'}
                                        </span>
                                    </td>
                                    <td className="px-5 md:px-6 py-4">
                                        {row.lateMinutes > 0 ? (
                                            <div className="flex flex-col">
                                                <span className="text-sm text-red-500 font-black">{row.lateMinutes} phút</span>
                                                <span className={`text-[9px] font-black uppercase tracking-tighter mt-0.5 ${
                                                    row.approvalStatus === 'APPROVED' ? 'text-green-500' :
                                                    row.approvalStatus === 'REJECTED' ? 'text-red-400' : 'text-amber-500'
                                                }`}>
                                                    {row.approvalStatus === 'PENDING' ? '⏳ Chờ duyệt' : row.approvalStatus === 'APPROVED' ? '✓ Đã duyệt' : '✕ Từ chối'}
                                                </span>
                                            </div>
                                        ) : <span className="text-gray-300 font-bold">—</span>}
                                    </td>
                                    <td className="px-5 md:px-6 py-4 max-w-xs">
                                        {row.lateReason && <p className="text-xs text-gray-700 font-bold bg-orange-50 px-2.5 py-1 rounded-lg inline-block border border-orange-100 italic">"{row.lateReason}"</p>}
                                        {row.note && <p className="text-[10px] text-gray-400 font-medium italic mt-1.5">Phản hồi: {row.note}</p>}
                                    </td>
                                    <td className="px-5 md:px-6 py-4 text-right">
                                        {row.lateMinutes > 0 && row.approvalStatus === 'PENDING' ? (
                                            <button 
                                                onClick={() => setSelectedRecord(row)}
                                                className="bg-[#1192a8]/10 text-[#1192a8] px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-[#1192a8] hover:text-white transition-all shadow-sm active:scale-95"
                                            >
                                                Duyệt
                                            </button>
                                        ) : <span className="text-gray-300 text-[10px] font-bold uppercase tracking-tighter">Hoàn tất</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Duyệt */}
            {selectedRecord && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-2 md:p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[98vh] animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-5 md:p-6 border-b shrink-0 bg-[#1192a8]">
                            <h3 className="text-base md:text-lg font-black text-white text-center uppercase tracking-widest">Duyệt lý do đi trễ</h3>
                            <p className="text-[10px] md:text-xs text-center text-white/70 mt-1 font-bold uppercase">
                                {selectedRecord.staff?.fullName} — {formatDate(selectedRecord.workDate)}
                            </p>
                        </div>
                        <div className="p-5 md:p-6 space-y-5 overflow-y-auto flex-1">
                            <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 shadow-sm">
                                <p className="text-[9px] font-black text-orange-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                    <span className="w-1 h-1 bg-orange-400 rounded-full"></span> Lý do từ nhân viên
                                </p>
                                <p className="text-sm text-gray-700 italic font-bold leading-relaxed">"{selectedRecord.lateReason}"</p>
                            </div>
                            <div>
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Ghi chú của quản lý (Phản hồi)</label>
                                <textarea 
                                    className="w-full border-2 border-gray-100 rounded-2xl p-4 text-sm h-28 focus:ring-4 focus:ring-[#1192a8]/10 focus:border-[#1192a8] outline-none transition-all resize-none bg-gray-50/30"
                                    placeholder="VD: Chấp nhận lý do khách quan, lần sau chú ý hơn..."
                                    value={approvalNote}
                                    onChange={e => setApprovalNote(e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3 md:gap-4 pt-2">
                                <button 
                                    onClick={() => handleApprove(selectedRecord.id, 'REJECTED')}
                                    className="py-3.5 rounded-2xl text-[10px] md:text-[11px] font-black uppercase tracking-widest bg-rose-50 text-rose-500 border border-rose-100 hover:bg-rose-100 transition-all active:scale-95 shadow-sm"
                                >
                                    TỪ CHỐI
                                </button>
                                <button 
                                    onClick={() => handleApprove(selectedRecord.id, 'APPROVED')}
                                    className="py-3.5 rounded-2xl text-[10px] md:text-[11px] font-black uppercase tracking-widest bg-[#1192a8] text-white hover:bg-teal-700 transition-all active:scale-95 shadow-xl shadow-teal-500/20"
                                >
                                    ĐỒNG Ý
                                </button>
                            </div>
                        </div>
                        <button 
                            onClick={() => setSelectedRecord(null)}
                            className="w-full py-4 text-[10px] font-black text-gray-400 hover:bg-gray-50 transition-all border-t uppercase tracking-widest"
                        >
                            Huỷ bỏ
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}