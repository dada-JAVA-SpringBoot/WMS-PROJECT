// ===== src/pages/AccountManagement.jsx =====
// Trang ADMIN quản lý tài khoản — đổi mật khẩu, gán role, bật/tắt tài khoản
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';

const ROLES = ['ADMIN','MANAGER','STOREKEEPER','INBOUND_STAFF','OUTBOUND_STAFF','CHECKER'];

export default function AccountManagement() {
    const { user } = useAuth();

    const [staff, setStaff]       = useState([]);
    const [loading, setLoading]   = useState(true);
    const [selected, setSelected] = useState(null);
    const [newPass, setNewPass]   = useState('');
    const [saving, setSaving]     = useState(false);

    const fetchStaff = useCallback(async () => {
        setLoading(true);
        try {
            const res  = await axiosClient.get('/api/staff');
            setStaff(res.data);
        } catch (e) {
            console.error("Lỗi tải danh sách nhân viên:", e);
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchStaff(); }, [fetchStaff]);

    const resetPassword = async (staffId) => {
        if (!newPass) return alert('Nhập mật khẩu mới!');
        if (!window.confirm('Xác nhận đặt lại mật khẩu?')) return;
        setSaving(true);
        try {
            await axiosClient.post(`/api/staff/${staffId}/reset-password`, { newPassword: newPass });
            setNewPass(''); alert('Đặt lại mật khẩu thành công!');
        } catch (e) {
            const msg = e.response?.data?.message || e.message || 'Lỗi hệ thống';
            alert(msg);
        } finally { setSaving(false); }
    };

    const toggleEnabled = async (staffId, currentEnabled) => {
        if (!window.confirm(`${currentEnabled ? 'Vô hiệu hóa' : 'Kích hoạt'} tài khoản này?`)) return;
        try {
            await axiosClient.post(`/api/staff/${staffId}/toggle-enabled`);
            fetchStaff();
        } catch (e) {
            const msg = e.response?.data?.message || e.message || 'Lỗi hệ thống';
            alert(msg);
        }
    };

    return (
        <div className="p-8 bg-gray-50 min-h-full">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Quản lý tài khoản</h1>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-48 text-gray-400">Đang tải...</div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                                <th className="px-6 py-4">Nhân viên</th>
                                <th className="px-6 py-4">Username</th>
                                <th className="px-6 py-4">Trạng thái TK</th>
                                <th className="px-6 py-4">Đặt lại mật khẩu</th>
                                <th className="px-6 py-4 text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {staff.map(s => (
                                <tr key={s.id} className="hover:bg-blue-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-bold text-gray-800">{s.fullName}</p>
                                        <p className="text-xs text-gray-400 font-mono">{s.employeeCode}</p>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-mono text-[#1192a8]">
                                        {s.username || <span className="text-gray-300 italic">chưa có</span>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                                            s.enabled
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-600'
                                        }`}>
                                            {s.enabled ? 'Đang hoạt động' : 'Đã vô hiệu hóa'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {s.username && (
                                            <div className="flex gap-2">
                                                <input type="password" placeholder="Mật khẩu mới..."
                                                    value={selected === s.id ? newPass : ''}
                                                    onFocus={() => setSelected(s.id)}
                                                    onChange={e => setNewPass(e.target.value)}
                                                    className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-36 focus:outline-none focus:ring-1 focus:ring-[#1192a8]"
                                                />
                                                <button onClick={() => resetPassword(s.id)}
                                                    disabled={saving || selected !== s.id}
                                                    className="px-3 py-1.5 bg-[#1192a8] text-white text-xs font-bold rounded-lg hover:bg-teal-700 transition disabled:opacity-40">
                                                    Đặt lại
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {s.username && s.username !== user.username && (
                                            <button
                                                onClick={() => toggleEnabled(s.id, s.enabled)}
                                                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition ${
                                                    s.enabled
                                                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                                                }`}>
                                                {s.enabled ? 'Vô hiệu hóa' : 'Kích hoạt'}
                                            </button>
                                        )}
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