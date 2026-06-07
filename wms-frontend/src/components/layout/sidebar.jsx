import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axiosClient from '../../api/axiosClient';
import SystemDialog from '../modals/SystemDialog';
import { useTheme } from '../../context/ThemeContext';

// Import icons
import homeIcon from '../common/icons/home.png';
import productIcon from '../common/icons/product.png';
import warehouseIcon from '../common/icons/warehouse.png';
import inboundIcon from '../common/icons/inbound.png';
import outboundIcon from '../common/icons/outbound.png';
import clientIcon from '../common/icons/client.png';
import supplierIcon from '../common/icons/supplier.png';
import staffIcon from '../common/icons/staff.png';
import accountIcon from '../common/icons/account.png';
import statisticalIcon from '../common/icons/statistical.png';
import authorityIcon from '../common/icons/authority.png';
import logoutIcon from '../common/icons/logout.png';
import historyIcon from '../common/icons/history.png';
import pickingIcon from '../common/icons/picking.png';
import inventoryIcon from '../common/icons/inventory.png';
import logoImg from '../common/icons/storage-stacks.png';
import { getAvatarSrc } from '../common/avatarUtils';
import { getRoleLabel } from '../../api/roleUtils';

const menuItems = [
    { id: 'home',           path: '/admin/home',           label: 'Trang chủ',      iconSrc: homeIcon },
    { id: 'products',       path: '/admin/products',       label: 'Sản phẩm',       iconSrc: productIcon,    roles: ['ADMIN', 'MANAGER', 'QUALITY_CONTROL'] },
    { id: 'warehouse-area', path: '/admin/warehouse-area', label: 'Khu vực kho',    iconSrc: warehouseIcon,   roles: ['ADMIN', 'MANAGER', 'STOREKEEPER', 'HANDLER', 'QUALITY_CONTROL'] },
    { id: 'inbound',        path: '/admin/inbound',        label: 'Phiếu nhập',     iconSrc: inboundIcon,     roles: ['ADMIN', 'MANAGER', 'STOREKEEPER', 'INBOUND_STAFF', 'ACCOUNTANT', 'QUALITY_CONTROL'] },
    { id: 'outbound',       path: '/admin/outbound',       label: 'Phiếu xuất',     iconSrc: outboundIcon,    roles: ['ADMIN', 'MANAGER', 'STOREKEEPER', 'OUTBOUND_STAFF', 'ACCOUNTANT', 'QUALITY_CONTROL'] },
    { id: 'attendance',     path: '/admin/attendance',     label: 'Lịch sử công',   iconSrc: historyIcon,     roles: ['ADMIN', 'MANAGER', 'STOREKEEPER', 'INBOUND_STAFF', 'OUTBOUND_STAFF', 'CHECKER', 'ACCOUNTANT', 'HANDLER', 'QUALITY_CONTROL'] },
    { id: 'attendance-manage', path: '/admin/attendance-manage', label: 'Duyệt chấm công', iconSrc: authorityIcon, roles: ['ADMIN', 'MANAGER'] },
    { id: 'client',         path: '/admin/client',         label: 'Khách hàng',     iconSrc: clientIcon,      roles: ['ADMIN', 'MANAGER', 'OUTBOUND_STAFF', 'ACCOUNTANT'] },
    { id: 'supplier',       path: '/admin/supplier',       label: 'Nhà cung cấp',   iconSrc: supplierIcon,    roles: ['ADMIN', 'MANAGER', 'STOREKEEPER', 'INBOUND_STAFF', 'ACCOUNTANT'] },
    { id: 'staff',          path: '/admin/staff',          label: 'Nhân viên',      iconSrc: staffIcon,       roles: ['ADMIN', 'MANAGER'] },
    { id: 'account',        path: '/admin/account',        label: 'Quản trị TK',    iconSrc: accountIcon,     roles: ['ADMIN', 'MANAGER'] },
    { id: 'statistical',    path: '/admin/statistical',    label: 'Thống kê',       iconSrc: statisticalIcon, roles: ['ADMIN', 'MANAGER', 'ACCOUNTANT'] },
    { id: 'transactions',   path: '/admin/transactions',   label: 'Lịch sử kho',    iconSrc: historyIcon,     roles: ['ADMIN', 'MANAGER', 'STOREKEEPER', 'ACCOUNTANT'] },
    { id: 'wave-picking',   path: '/admin/wave-picking',   label: 'Wave Picking',   iconSrc: pickingIcon,     roles: ['ADMIN', 'MANAGER', 'STOREKEEPER'] },
    { id: 'cycle-counting', path: '/admin/cycle-counting', label: 'Kiểm kê kho',    iconSrc: inventoryIcon,   roles: ['ADMIN', 'MANAGER', 'STOREKEEPER', 'CHECKER'] },
];

export default function Sidebar({ user, onLogout, isOpen, onClose }) {
    const { t, i18n } = useTranslation();
    const { theme, toggleTheme } = useTheme();
    const [attendance, setAttendance] = useState(null);
    const [loadingAt, setLoadingAt] = useState(false);
    const [dialog, setDialog] = useState({ isOpen: false, title: '', message: '' });

    const fetchAttendance = () => {
        if (user && !user.roles.includes('ADMIN')) {
            axiosClient.get('/api/attendance/today')
                .then(res => setAttendance(res.data))
                .catch(() => {});
        }
    };

    useEffect(() => {
        fetchAttendance();
        const interval = setInterval(fetchAttendance, 60000);
        return () => clearInterval(interval);
    }, [user]);

    const handleCheckAction = async () => {
        setLoadingAt(true);
        try {
            const res = await axiosClient.post('/api/attendance/check-out');
            setAttendance(res.data);
            setDialog({ isOpen: true, title: 'Thành công', message: 'Kết thúc ca thành công!' });
        } catch (e) {
            setDialog({ isOpen: true, title: 'Lỗi', message: e.response?.data?.message || 'Có lỗi xảy ra' });
        } finally {
            setLoadingAt(false);
        }
    };

    const filteredMenu = menuItems.filter(item => {
        if (!item.roles) return true;
        return user?.roles?.some(r => item.roles.includes(r));
    });

    return (
        <>
            <SystemDialog
                isOpen={dialog.isOpen}
                title={dialog.title}
                message={dialog.message}
                onClose={() => setDialog({ ...dialog, isOpen: false })}
            />

            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-[100] lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />
            )}

            <aside className={`
                fixed lg:relative inset-y-0 left-0 w-[193px] h-full flex flex-col shadow-2xl lg:shadow-xl z-[101] lg:z-20
                bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-700
                transition-all duration-300 transform
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Logo Section */}
                <div className="p-4 flex items-center gap-2.5 border-b border-white/10 bg-[#1192a8] dark:bg-[#0a6b78] text-white shrink-0 transition-colors duration-300">
                    <div className="w-8 h-8 flex items-center justify-center bg-white/20 rounded-xl shadow-inner shrink-0">
                        <img src={logoImg} alt="Logo" className="w-full h-full object-contain p-1" />
                    </div>
                    <div className="overflow-hidden text-left flex-1">
                        <h1 className="font-black text-lg tracking-tighter leading-none uppercase">WMS</h1>
                        <p className="text-[9px] font-bold opacity-80 uppercase tracking-widest mt-0.5 truncate">{t('sidebar.system_name')}</p>
                    </div>
                    {/* Theme Toggle Button */}
                    <button
                        onClick={toggleTheme}
                        className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-all active:scale-90 shrink-0"
                        title={theme === 'dark' ? 'Chuyển sang sáng' : 'Chuyển sang tối'}
                    >
                        {theme === 'dark' ? (
                            <svg className="w-4 h-4 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm0 16a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm8-8a1 1 0 110 2h-1a1 1 0 110-2h1zM5 12a1 1 0 110 2H4a1 1 0 110-2h1zm11.95-6.364a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM8.172 15.778a1 1 0 010 1.414l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 0zm9.192 0a1 1 0 011.414 0l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 010-1.414zM5.636 5.636a1 1 0 011.414 0l.707.707A1 1 0 016.343 7.757l-.707-.707a1 1 0 010-1.414zM12 7a5 5 0 100 10A5 5 0 0012 7z"/>
                            </svg>
                        ) : (
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"/>
                            </svg>
                        )}
                    </button>
                </div>

                {/* User Info & Attendance Widget */}
                <div className="p-3 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-800/80 border-b border-gray-100 dark:border-gray-700 shrink-0 text-left transition-colors duration-300">
                    <div className="flex items-center gap-2.5 mb-3">
                        <div className="w-9 h-9 bg-gray-200 dark:bg-gray-600 rounded-xl overflow-hidden border-2 border-[#1192a8] shadow-sm shrink-0">
                            <img src={getAvatarSrc(user?.avatar)} alt="User" className="w-full h-full object-cover" />
                        </div>
                        <div className="overflow-hidden">
                            <p className="font-black text-[11px] text-gray-800 dark:text-gray-100 truncate" title={user?.fullName}>
                                {user?.fullName || 'User'}
                            </p>
                            <p className="text-[7px] text-[#1192a8] dark:text-[#4db8c8] font-black uppercase tracking-widest">
                                {getRoleLabel(user?.roles)}
                            </p>
                        </div>
                    </div>

                    {user && !user.roles.includes('ADMIN') && (
                        <div className="bg-white dark:bg-gray-700 p-2.5 rounded-2xl border border-blue-100 dark:border-gray-600 shadow-sm transition-colors duration-300">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[7px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('sidebar.shift')}</span>
                                {attendance?.checkInTime && !attendance?.checkOutTime && (
                                    <span className="flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
                                        <span className="text-[7px] font-black text-green-600 dark:text-green-400">LIVE</span>
                                    </span>
                                )}
                            </div>
                            <p className="text-[10px] font-bold text-gray-700 dark:text-gray-200 text-center mb-1">
                                {attendance?.checkInTime 
                                    ? (attendance.checkOutTime ? t('sidebar.shift_status_out') : t('sidebar.shift_status_in'))
                                    : t('sidebar.shift_status_none')}
                            </p>
                            {attendance?.checkInTime && !attendance?.checkOutTime && (
                                <button
                                    onClick={handleCheckAction}
                                    disabled={loadingAt}
                                    className="w-full py-2 rounded-xl text-[9px] font-black transition-all active:scale-95 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/30 border border-orange-200 dark:border-orange-800 uppercase tracking-wider"
                                >
                                    {loadingAt ? '...' : t('sidebar.btn_end_shift')}
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 overflow-y-auto p-1.5 space-y-1 no-scrollbar">
                    {filteredMenu.map((item) => {
                        const translatedLabel = t(`sidebar.${item.id.replace(/-/g, '_')}`);
                        return (
                            <NavLink
                                key={item.id}
                                to={item.path}
                                onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                                className={({ isActive }) => `
                                w-full flex items-center gap-3.5 px-3 py-2.5 rounded-2xl transition-all duration-200
                                ${isActive
                                ? 'bg-[#1192a8] dark:bg-[#0a6b78] text-white font-black shadow-lg shadow-teal-500/30 scale-[1.02]'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-700/60 text-gray-600 dark:text-gray-400 hover:text-[#1192a8] dark:hover:text-[#4db8c8]'}
                            `}
                            >
                                <img
                                    src={item.iconSrc}
                                    alt={translatedLabel}
                                    className={`w-5 h-5 object-contain transition-all ${
                                    item.path === window.location.pathname
                                        ? 'brightness-200'
                                        : 'dark:brightness-75 dark:invert-[0.3]'
                                }`}
                                />
                                <span className="text-[14px] font-bold tracking-tight">{translatedLabel}</span>
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Language Switcher */}
                <div className="p-2 border-t bg-gray-50 shrink-0 flex items-center justify-between">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest pl-1">Language</span>
                    <div className="flex bg-gray-200 p-0.5 rounded-lg border border-gray-300">
                        <button
                            onClick={() => i18n.changeLanguage('vi')}
                            className={`px-2 py-0.5 rounded-md text-[9px] font-black transition-all ${
                                i18n.language?.startsWith('vi') 
                                ? 'bg-[#1192a8] text-white shadow-sm' 
                                : 'text-gray-600 hover:text-[#1192a8]'
                            }`}
                        >
                            VI
                        </button>
                        <button
                            onClick={() => i18n.changeLanguage('en')}
                            className={`px-2 py-0.5 rounded-md text-[9px] font-black transition-all ${
                                i18n.language?.startsWith('en') 
                                ? 'bg-[#1192a8] text-white shadow-sm' 
                                : 'text-gray-600 hover:text-[#1192a8]'
                            }`}
                        >
                            EN
                        </button>
                    </div>
                </div>

                {/* Logout Button */}
                <div className="p-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 shrink-0 transition-colors duration-300">
                    <button
                        onClick={onLogout}
                        className="flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all font-bold w-full text-sm group"
                    >
                        <div className="w-8 h-8 flex items-center justify-center rounded-lg group-hover:bg-red-100 dark:group-hover:bg-red-900/30 transition">
                            <img src={logoutIcon} alt={t('sidebar.logout')} className="w-5 h-5 object-contain" />
                        </div>
                        <span>{t('sidebar.logout')}</span>
                    </button>
                </div>
            </aside>
        </>
    );
}