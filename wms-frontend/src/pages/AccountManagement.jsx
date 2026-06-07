// ===== src/pages/AccountManagement.jsx =====
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';
import { getAvatarSrc } from '../components/common/avatarUtils';
import ImageCropModal from '../components/modals/ImageCropModal';
import { useTranslation } from 'react-i18next';

export default function AccountManagement() {
    const { t } = useTranslation();
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
            alert(t('pages.AccountManagement.avatarUpdateSuccess'));
        } catch (e) {
            console.error("Avatar update error:", e);
            alert(t('pages.AccountManagement.avatarUpdateError'));
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
        if (!newPass) return alert(t('pages.AccountManagement.enterNewPassword'));
        if (!window.confirm(t('pages.AccountManagement.confirmResetPassword'))) return;
        setSaving(true);
        try {
            await axiosClient.post(`/api/staff/${staffId}/reset-password`, { newPassword: newPass });
            setNewPass('');
            alert(t('pages.AccountManagement.passwordResetSuccess'));
        } catch (e) {
            alert(e.response?.data?.message || t('pages.AccountManagement.systemError'));
        } finally { setSaving(false); }
    };

    const toggleEnabled = async (staffId, currentEnabled) => {
        if (!window.confirm(t('pages.AccountManagement.confirmToggleAccount', { action: currentEnabled ? t('pages.AccountManagement.disable') : t('pages.AccountManagement.enable') }))) return;
        try {
            await axiosClient.post(`/api/staff/${staffId}/toggle-enabled`);
            fetchStaff();
        } catch (e) {
            alert(e.response?.data?.message || t('pages.AccountManagement.systemError'));
        }
    };

    const getRoleLabel = (roleName, contractType) => {
        if (contractType === 'EXPIRED') {
            return <span className="px-2 py-0.5 rounded-lg border border-red-200 dark:border-red-800 text-[9px] font-black uppercase tracking-tighter bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300">{t('pages.AccountManagement.resigned')}</span>;
        }
        const map = {
            'ADMIN':           { text: t('pages.AccountManagement.roleAdmin'),    cls: 'bg-purple-50 text-purple-600 border-purple-100' },
            'MANAGER':         { text: t('pages.AccountManagement.roleManager'),     cls: 'bg-amber-50 text-amber-600 border-amber-100' },
            'ACCOUNTANT':      { text: t('pages.AccountManagement.roleAccountant'),     cls: 'bg-blue-50 text-blue-600 border-blue-100' },
            'STOREKEEPER':     { text: t('pages.AccountManagement.roleStorekeeper'),     cls: 'bg-teal-50 text-teal-600 border-teal-100' },
            'WAREHOUSE_KEEPER':{ text: t('pages.AccountManagement.roleStorekeeper'),     cls: 'bg-teal-50 text-teal-600 border-teal-100' },
            'INBOUND_STAFF':   { text: t('pages.AccountManagement.roleInboundStaff'), cls: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
            'OUTBOUND_STAFF':  { text: t('pages.AccountManagement.roleOutboundStaff'), cls: 'bg-orange-50 text-orange-600 border-orange-100' },
            'QUALITY_CONTROL': { text: t('pages.AccountManagement.roleQualityControl'), cls: 'bg-rose-50 text-rose-600 border-rose-100' },
            'HANDLER':         { text: t('pages.AccountManagement.roleHandler'), cls: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
            'CHECKER':         { text: t('pages.AccountManagement.roleChecker'),     cls: 'bg-slate-50 text-slate-600 border-slate-100' },
            'INTERN':          { text: t('pages.AccountManagement.roleIntern'), cls: 'bg-gray-50 text-gray-500 border-gray-100' },
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
            'PERMANENT': { text: t('pages.AccountManagement.contractPermanent'), cls: 'text-green-600' },
            'PART_TIME': { text: t('pages.AccountManagement.contractPartTime'), cls: 'text-blue-500' },
            'SEASONAL':  { text: t('pages.AccountManagement.contractSeasonal'), cls: 'text-amber-500' },
            'EXPIRED':   { text: t('pages.AccountManagement.contractExpired'), cls: 'text-red-500 font-bold' },
        };
        const item = map[type] || { text: type, cls: 'text-gray-400 dark:text-gray-500' };
        return <span className={`text-[10px] ${item.cls}`}>{item.text}</span>;
    };

    return (
        <div className="p-4 lg:p-8 bg-gray-50 dark:bg-gray-900 min-h-full text-left transition-colors duration-300">
            <h1 className="text-xl lg:text-2xl font-black text-gray-800 dark:text-gray-100 mb-6 uppercase tracking-tight">{t('pages.AccountManagement.title')}</h1>

            <div className="bg-white dark:bg-gray-800 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-700 overflow-x-auto no-scrollbar transition-colors duration-300">
                {loading ? (
                    <div className="flex items-center justify-center h-48 text-gray-400 dark:text-gray-600 font-bold uppercase tracking-widest animate-pulse">
                        {t('pages.AccountManagement.loading')}
                    </div>
                ) : (
                    <table className="w-full text-left min-w-[950px]">
                        <thead className="bg-gray-50/50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                        <tr className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">
                            <th className="px-6 py-5">{t('pages.AccountManagement.headerStaffAndAvatar')}</th>
                            <th className="px-6 py-5">{t('pages.AccountManagement.headerUsername')}</th>
                            <th className="px-6 py-5">{t('pages.AccountManagement.headerStatus')}</th>
                            <th className="px-6 py-5">{t('pages.AccountManagement.headerSecurity')}</th>
                            <th className="px-6 py-5 text-right">{t('pages.AccountManagement.headerActions')}</th>
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
                                        {s.username || <span className="text-gray-300 dark:text-gray-600 italic font-normal text-[10px]">{t('pages.AccountManagement.notSet')}</span>}
                                    </p>
                                </td>

                                {/* ── Trạng thái ── */}
                                <td className="px-6 py-4">
                                        <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-xl ${
                                            s.enabled
                                                ? 'bg-green-50 text-green-600 border border-green-100 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
                                                : 'bg-red-50 text-red-600 border border-red-100 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
                                        }`}>
                                            {s.enabled ? t('pages.AccountManagement.active') : t('pages.AccountManagement.disabled')}
                                        </span>
                                </td>

                                {/* ── Bảo mật / Reset pass ── */}
                                <td className="px-6 py-4">
                                    {s.username && (
                                        (!s.roles?.includes('ADMIN') || user.roles?.includes('ADMIN')) ? (
                                            <div className="flex gap-2">
                                                <input
                                                    type="password"
                                                    placeholder={t('pages.AccountManagement.newPasswordPlaceholder')}
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
                                            <span className="text-[10px] text-gray-300 dark:text-gray-600 italic">{t('pages.AccountManagement.systemProtected')}</span>
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
                                                {s.enabled ? t('pages.AccountManagement.disable') : t('pages.AccountManagement.enable')}
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