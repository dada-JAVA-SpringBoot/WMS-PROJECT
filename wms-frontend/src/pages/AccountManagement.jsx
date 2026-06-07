// ===== src/pages/AccountManagement.jsx =====
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';
import { getAvatarSrc } from '../components/common/avatarUtils';
import ImageCropModal from '../components/modals/ImageCropModal';

export default function AccountManagement() {
    const { user } = useAuth();
    const canManage = user?.roles?.some(r => ['ADMIN', 'MANAGER'].includes(r));

    const [staff, setStaff]       = useState([]);
    const [loading, setLoading]   = useState(true);
    const [selectedId, setSelectedId] = useState(null);
    const [newPass, setNewPass]   = useState('');
    const [saving, setSaving]     = useState(false);

    const [isCropModalOpen, setIsCropModalOpen] = useState(false);
    const [tempImageSrc, setTempImageSrc]       = useState(null);
    const [editingStaffId, setEditingStaffId]   = useState(null);

    const fetchStaff = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axiosClient.get('/api/staff');
            setStaff(res.data);
        } catch (e) {
            console.error("Error loading staff:", e);
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchStaff(); }, [fetchStaff]);

    const saveAvatar = async (staffId, croppedBlob) => {
        if (!staffId || !croppedBlob) return;
        try {
            const formData = new FormData();
            formData.append('file', croppedBlob, 'avatar.jpg');
            await axiosClient.post(`/api/staff/${staffId}/avatar`, formData);
            fetchStaff();
            setIsCropModalOpen(false);
            alert('Cập nhật chân dung thành công!');
        } catch (e) {
            console.error("Avatar update error:", e);
            alert('Lỗi cập nhật ảnh chân dung.');
        }
    };

    const handleFileChange = (e, staffId) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            setEditingStaffId(staffId);
            setTempImageSrc(reader.result);
            setIsCropModalOpen(true);
        };
        reader.readAsDataURL(file);
        e.target.value = null;
    };

    const resetPassword = async (staffId) => {
        if (!newPass) return alert('Nhập mật khẩu mới!');
        if (!window.confirm('Xác nhận đặt lại mật khẩu?')) return;
        setSaving(true);
        try {
            await axiosClient.post(`/api/staff/${staffId}/reset-password`, { newPassword: newPass });
            setNewPass('');
            alert('Đặt lại mật khẩu thành công!');
        } catch (e) {
            alert(e.response?.data?.message || 'Lỗi hệ thống');
        } finally { setSaving(false); }
    };

    const toggleEnabled = async (staffId, currentEnabled) => {
        if (!window.confirm(`${currentEnabled ? 'Vô hiệu hóa' : 'Kích hoạt'} tài khoản này?`)) return;
        try {
            await axiosClient.post(`/api/staff/${staffId}/toggle-enabled`);
            fetchStaff();
        } catch (e) {
            alert(e.response?.data?.message || 'Lỗi hệ thống');
        }
    };

    const getRoleLabel = (roleName, contractType) => {
        if (contractType === 'EXPIRED') {
            return (
                <span className="px-2 py-0.5 rounded-lg border border-red-200 dark:border-red-800 text-[9px] font-black uppercase tracking-tighter bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300">
                    Đã nghỉ việc
                </span>
            );
        }
        const map = {
            'ADMIN':            { text: 'Quản trị',        cls: 'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800' },
            'MANAGER':          { text: 'Quản lý',         cls: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800' },
            'ACCOUNTANT':       { text: 'Kế toán',         cls: 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800' },
            'STOREKEEPER':      { text: 'Thủ kho',         cls: 'bg-teal-50 text-teal-600 border-teal-100 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-800' },
            'WAREHOUSE_KEEPER': { text: 'Thủ kho',         cls: 'bg-teal-50 text-teal-600 border-teal-100 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-800' },
            'INBOUND_STAFF':    { text: 'Nhân viên nhập',  cls: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800' },
            'OUTBOUND_STAFF':   { text: 'Nhân viên xuất',  cls: 'bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800' },
            'QUALITY_CONTROL':  { text: 'Kiểm duyệt (QC)', cls: 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800' },
            'HANDLER':          { text: 'Điều chuyển',     cls: 'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800' },
            'CHECKER':          { text: 'Kiểm kê',         cls: 'bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600' },
            'INTERN':           { text: 'Thực tập sinh',   cls: 'bg-gray-50 text-gray-500 border-gray-100 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600' },
        };
        const item = map[roleName] || { text: roleName, cls: 'bg-gray-50 text-gray-500 dark:bg-gray-700 dark:text-gray-400' };
        return (
            <span className={`px-2 py-0.5 rounded-lg border text-[9px] font-black uppercase tracking-tighter ${item.cls}`}>
                {item.text}
            </span>
        );
    };

    const getContractLabel = (type) => {
        const map = {
            'PERMANENT': { text: 'Vô thời hạn',  cls: 'text-green-600 dark:text-green-400' },
            'PART_TIME': { text: 'Bán thời gian', cls: 'text-blue-500 dark:text-blue-400' },
            'SEASONAL':  { text: 'Thời vụ',       cls: 'text-amber-500 dark:text-amber-400' },
            'EXPIRED':   { text: 'Đã nghỉ việc',  cls: 'text-red-500 dark:text-red-400 font-bold' },
        };
        const item = map[type] || { text: type, cls: 'text-gray-400 dark:text-gray-500' };
        return <span className={`text-[10px] ${item.cls}`}>{item.text}</span>;
    };

    return (
        <div className="p-4 lg:p-8 bg-gray-50 dark:bg-gray-900 min-h-full text-left transition-colors duration-300">
            <h1 className="text-xl lg:text-2xl font-black text-gray-800 dark:text-gray-100 mb-6 uppercase tracking-tight">
                Quản trị nhân sự
            </h1>

            <div className="bg-white dark:bg-gray-800 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-700 overflow-x-auto no-scrollbar transition-colors duration-300">
                {loading ? (
                    <div className="flex items-center justify-center h-48 text-gray-400 dark:text-gray-600 font-bold uppercase tracking-widest animate-pulse">
                        Đang tải dữ liệu...
                    </div>
                ) : (
                    <table className="w-full text-left min-w-[950px]">
                        <thead className="bg-gray-50/50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                        <tr className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">
                            <th className="px-6 py-5">Nhân viên & Chân dung</th>
                            <th className="px-6 py-5">Tên đăng nhập</th>
                            <th className="px-6 py-5">Trạng thái</th>
                            <th className="px-6 py-5">Bảo mật</th>
                            <th className="px-6 py-5 text-right">Hành động</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                        {staff.map(s => (
                            <tr key={s.id} className="hover:bg-blue-50/30 dark:hover:bg-gray-700/30 transition-colors group">

                                {/* ── Nhân viên ── */}
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="relative shrink-0">
                                            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-2xl overflow-hidden border-2 border-white dark:border-gray-600 shadow-sm group-hover:border-[#1192a8] transition-all">
                                                <img src={getAvatarSrc(s.avatar)} alt="Profile" className="w-full h-full object-cover" />
                                            </div>
                                            {canManage && (
                                                <label className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#1192a8] text-white rounded-lg flex items-center justify-center text-[10px] shadow-lg cursor-pointer hover:scale-110 active:scale-95 transition-all" title="Thay đổi ảnh">
                                                    ✎
                                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, s.id)} />
                                                </label>
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <p className="text-sm font-black text-gray-800 dark:text-gray-100 tracking-tight">{s.fullName}</p>
                                                <div className="flex gap-1">
                                                    {s.roles?.map(r => <React.Fragment key={r}>{getRoleLabel(r, s.contractType)}</React.Fragment>)}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest">{s.employeeCode}</p>
                                                <span className="text-gray-200 dark:text-gray-600">|</span>
                                                {getContractLabel(s.contractType)}
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                {/* ── Username ── */}
                                <td className="px-6 py-4">
                                    <p className="text-sm font-black font-mono text-[#1192a8]">
                                        {s.username || <span className="text-gray-300 dark:text-gray-600 italic font-normal text-[10px]">chưa thiết lập</span>}
                                    </p>
                                </td>

                                {/* ── Trạng thái ── */}
                                <td className="px-6 py-4">
                                        <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-xl ${
                                            s.enabled
                                                ? 'bg-green-50 text-green-600 border border-green-100 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
                                                : 'bg-red-50 text-red-600 border border-red-100 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
                                        }`}>
                                            {s.enabled ? 'Đang hoạt động' : 'Đã vô hiệu'}
                                        </span>
                                </td>

                                {/* ── Bảo mật / Reset pass ── */}
                                <td className="px-6 py-4">
                                    {s.username && (
                                        (!s.roles?.includes('ADMIN') || user.roles?.includes('ADMIN')) ? (
                                            <div className="flex gap-2">
                                                <input
                                                    type="password"
                                                    placeholder="Mật khẩu mới..."
                                                    value={selectedId === s.id ? newPass : ''}
                                                    onFocus={() => setSelectedId(s.id)}
                                                    onChange={e => setNewPass(e.target.value)}
                                                    className="border-2 border-gray-100 dark:border-gray-600 rounded-xl px-3 py-2 text-xs w-32 outline-none focus:border-[#1192a8] transition-all bg-gray-50/50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                                                />
                                                <button
                                                    onClick={() => resetPassword(s.id)}
                                                    disabled={saving || selectedId !== s.id}
                                                    className="px-4 py-2 bg-[#1192a8] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-teal-700 transition disabled:opacity-40 shadow-md shadow-teal-500/10"
                                                >
                                                    Reset
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-[10px] text-gray-300 dark:text-gray-600 italic">Bảo vệ hệ thống</span>
                                        )
                                    )}
                                </td>

                                {/* ── Hành động ── */}
                                <td className="px-6 py-4 text-right">
                                    {s.username && s.username !== user.username && (
                                        (!s.roles?.includes('ADMIN') || user.roles?.includes('ADMIN')) ? (
                                            <button
                                                onClick={() => toggleEnabled(s.id, s.enabled)}
                                                className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition shadow-sm ${
                                                    s.enabled
                                                        ? 'bg-white dark:bg-gray-700 border border-red-100 dark:border-red-800 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                                                        : 'bg-[#1192a8] text-white hover:bg-teal-700 shadow-teal-500/10'
                                                }`}
                                            >
                                                {s.enabled ? 'Vô hiệu hóa' : 'Kích hoạt'}
                                            </button>
                                        ) : null
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* ── Modal Cắt ảnh ── */}
            <ImageCropModal
                isOpen={isCropModalOpen}
                imageSrc={tempImageSrc}
                onCancel={() => setIsCropModalOpen(false)}
                onCropComplete={(cropped) => saveAvatar(editingStaffId, cropped)}
            />
        </div>
    );
}