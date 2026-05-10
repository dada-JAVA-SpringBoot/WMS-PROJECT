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
        <div className="p-8 bg-gray-50 min-h-full">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Quản lý chấm công</h1>
                    <p className="text-gray-500 text-sm">Duyệt lý do đi trễ và xem lịch sử toàn nhân viên</p>
                </div>
                <div className="flex gap-2">
                    <input 
                        type="date" 
                        className="px-4 py-2 rounded-xl border border-gray-200 text-sm"
                        value={filters.start}
                        onChange={e => setFilters({...filters, start: e.target.value})}
                    />
                    <input 
                        type="date" 
                        className="px-4 py-2 rounded-xl border border-gray-200 text-sm"
                        value={filters.end}
                        onChange={e => setFilters({...filters, end: e.target.value})}
                    />
                    <button 
                        onClick={fetchRecords}
                        className="bg-[#1192a8] text-white px-6 py-2 rounded-xl font-bold text-sm shadow-md"
                    >
                        Lọc
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-gray-400">Đang tải dữ liệu...</div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 border-b">
                            <tr className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                                <th className="px-6 py-4">Nhân viên</th>
                                <th className="px-6 py-4">Ngày</th>
                                <th className="px-6 py-4">Giờ vào/ra</th>
                                <th className="px-6 py-4">Trạng thái</th>
                                <th className="px-6 py-4">Đi muộn / Duyệt</th>
                                <th className="px-6 py-4">Lý do</th>
                                <th className="px-6 py-4 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {records.length === 0 ? (
                                <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">Chưa có dữ liệu</td></tr>
                            ) : records.map((row, idx) => (
                                <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-bold text-gray-800">{row.staff?.fullName}</p>
                                        <p className="text-[10px] text-gray-400 font-mono">{row.staff?.employeeCode}</p>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(row.workDate)}</td>
                                    <td className="px-6 py-4">
                                        <div className="text-[11px] font-mono">
                                            <span className="text-green-600">IN: {formatTime(row.checkInTime)}</span><br/>
                                            <span className="text-orange-600">OUT: {formatTime(row.checkOutTime)}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                            row.status === 'PRESENT' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
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
                                    <td className="px-6 py-4 max-w-xs">
                                        <p className="text-xs text-gray-600 truncate" title={row.lateReason}>{row.lateReason || ''}</p>
                                        <p className="text-[10px] text-gray-400 italic mt-0.5">{row.note || ''}</p>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {row.lateMinutes > 0 && row.approvalStatus === 'PENDING' && (
                                            <button 
                                                onClick={() => setSelectedRecord(row)}
                                                className="text-[10px] font-bold text-[#1192a8] hover:underline"
                                            >
                                                DUYỆT
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal Duyệt */}
            {selectedRecord && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
                        <div className="p-6 border-b">
                            <h3 className="text-lg font-bold text-gray-800 text-center">Duyệt lý do đi trễ</h3>
                            <p className="text-xs text-center text-gray-400 mt-1">
                                {selectedRecord.staff?.fullName} - {formatDate(selectedRecord.workDate)}
                            </p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
                                <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">Lý do nhân viên</p>
                                <p className="text-sm text-gray-700 italic">"{selectedRecord.lateReason}"</p>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Ghi chú quản lý</label>
                                <textarea 
                                    className="w-full border rounded-2xl p-4 text-sm h-24 focus:ring-2 focus:ring-[#1192a8] focus:border-[#1192a8] outline-none"
                                    placeholder="Nhập ghi chú phản hồi..."
                                    value={approvalNote}
                                    onChange={e => setApprovalNote(e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => handleApprove(selectedRecord.id, 'REJECTED')}
                                    className="py-3 rounded-2xl text-[11px] font-black uppercase tracking-wider bg-red-50 text-red-500 hover:bg-red-100 transition-all"
                                >
                                    TỪ CHỐI
                                </button>
                                <button 
                                    onClick={() => handleApprove(selectedRecord.id, 'APPROVED')}
                                    className="py-3 rounded-2xl text-[11px] font-black uppercase tracking-wider bg-[#1192a8] text-white hover:bg-teal-700 transition-all"
                                >
                                    ĐỒNG Ý
                                </button>
                            </div>
                        </div>
                        <button 
                            onClick={() => setSelectedRecord(null)}
                            className="w-full py-4 text-xs font-bold text-gray-400 hover:bg-gray-50 transition-all border-t uppercase tracking-widest"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}