import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

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
import logoImg from '../common/icons/storage-stacks.png';
import { getAvatarSrc } from '../common/avatarUtils';

const menuItems = [
    { id: 'home',           path: '/admin/home',           label: 'Trang chủ',      iconSrc: homeIcon },
    { id: 'products',       path: '/admin/products',       label: 'Sản phẩm',       iconSrc: productIcon },
    { id: 'warehouse-area', path: '/admin/warehouse-area', label: 'Khu vực kho',    iconSrc: warehouseIcon,   roles: ['ADMIN', 'MANAGER', 'STOREKEEPER', 'HANDLER'] },
    { id: 'inbound',        path: '/admin/inbound',        label: 'Phiếu nhập',     iconSrc: inboundIcon,     roles: ['ADMIN', 'MANAGER', 'STOREKEEPER', 'INBOUND_STAFF', 'ACCOUNTANT'] },
    { id: 'outbound',       path: '/admin/outbound',       label: 'Phiếu xuất',     iconSrc: outboundIcon,    roles: ['ADMIN', 'MANAGER', 'STOREKEEPER', 'OUTBOUND_STAFF', 'ACCOUNTANT'] },
    { id: 'attendance',     path: '/admin/attendance',     label: 'Lịch sử công',   iconSrc: historyIcon,     roles: ['ADMIN', 'MANAGER', 'STOREKEEPER', 'INBOUND_STAFF', 'OUTBOUND_STAFF', 'CHECKER', 'ACCOUNTANT', 'HANDLER'] },
    { id: 'attendance-m',   path: '/admin/attendance-manage', label: 'Duyệt chấm công', iconSrc: authorityIcon, roles: ['ADMIN', 'MANAGER'] },
    { id: 'client',         path: '/admin/client',         label: 'Khách hàng',     iconSrc: clientIcon,      roles: ['ADMIN', 'MANAGER', 'OUTBOUND_STAFF', 'ACCOUNTANT'] },
    { id: 'supplier',       path: '/admin/supplier',       label: 'Nhà cung cấp',   iconSrc: supplierIcon,    roles: ['ADMIN', 'MANAGER', 'STOREKEEPER', 'INBOUND_STAFF', 'ACCOUNTANT'] },
    { id: 'staff',          path: '/admin/staff',          label: 'Nhân viên',      iconSrc: staffIcon,       roles: ['ADMIN', 'MANAGER'] },
    { id: 'account',        path: '/admin/account',        label: 'Quản trị TK',    iconSrc: accountIcon,     roles: ['ADMIN', 'MANAGER'] },
    { id: 'statistical',    path: '/admin/statistical',    label: 'Thống kê',       iconSrc: statisticalIcon, roles: ['ADMIN', 'MANAGER', 'ACCOUNTANT'] },
];

export default function Sidebar({ user, onLogout, isOpen, onClose }) {
    const [attendance, setAttendance] = useState(null);
    const [loadingAt, setLoadingAt] = useState(false);

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
            const endpoint = 'check-out';
            const res = await axiosClient.post(`/api/attendance/${endpoint}`);
            setAttendance(res.data);
            alert('Kết thúc ca thành công!');
        } catch (e) {
            alert(e.response?.data?.message || 'Có lỗi xảy ra');
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
            {/* Mobile Backdrop */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-[100] lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />
            )}

            <aside className={`
                fixed lg:relative inset-y-0 left-0 w-48 bg-white border-r h-full flex flex-col shadow-2xl lg:shadow-xl z-[101] lg:z-20
                transition-transform duration-300 transform
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Logo Section */}
                <div className="p-4 flex items-center gap-2.5 border-b bg-[#1192a8] text-white shrink-0">
                    <div className="w-8 h-8 flex items-center justify-center bg-white/20 rounded-xl shadow-inner shrink-0">
                        <img src={logoImg} alt="Logo" className="w-full h-full object-contain p-1" />
                    </div>
                    <div className="overflow-hidden text-left">
                        <h1 className="font-black text-lg tracking-tighter leading-none uppercase">WMS</h1>
                        <p className="text-[9px] font-bold opacity-80 uppercase tracking-widest mt-0.5 truncate">Hệ thống kho</p>
                    </div>
                </div>

                {/* User Info & Attendance Widget */}
                <div className="p-3 bg-gradient-to-b from-white to-gray-50 border-b shrink-0 text-left">
                    <div className="flex items-center gap-2.5 mb-3">
                        <div className="w-9 h-9 bg-gray-200 rounded-xl overflow-hidden border-2 border-[#1192a8] shadow-sm shrink-0">
                            <img src={getAvatarSrc(user?.avatar)} alt="User" className="w-full h-full object-cover" />
                        </div>
                        <div className="overflow-hidden">
                            <p className="font-black text-[11px] text-gray-800 truncate" title={user?.fullName}>
                                {user?.fullName || 'User'}
                            </p>
                            <p className="text-[7px] text-[#1192a8] font-black uppercase tracking-widest">
                                {user?.roles?.[0] || 'Nhân viên'}
                            </p>
                        </div>
                    </div>

                    {user && !user.roles.includes('ADMIN') && (
                        <div className="bg-white p-2.5 rounded-2xl border border-blue-100 shadow-sm">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[7px] font-bold text-gray-400 uppercase tracking-widest">Ca làm việc</span>
                                {attendance?.checkInTime && !attendance?.checkOutTime && (
                                    <span className="flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
                                        <span className="text-[7px] font-black text-green-600">LIVE</span>
                                    </span>
                                )}
                            </div>
                            <p className="text-[10px] font-bold text-gray-700 text-center mb-1">
                                {attendance?.checkInTime 
                                    ? (attendance.checkOutTime ? 'ĐÃ KẾT THÚC' : 'ĐANG LÀM')
                                    : 'CHƯA VÀO CA'}
                            </p>
                            {attendance?.checkInTime && !attendance?.checkOutTime && (
                                <button 
                                    onClick={handleCheckAction}
                                    disabled={loadingAt}
                                    className="w-full py-2 rounded-xl text-[9px] font-black transition-all active:scale-95 bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-200 uppercase tracking-wider"
                                >
                                    {loadingAt ? '...' : 'KẾT THÚC CA'}
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 overflow-y-auto p-1.5 space-y-1 custom-scrollbar">
                    {filteredMenu.map((item) => (
                        <NavLink
                            key={item.id}
                            to={item.path}
                            onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                            className={({ isActive }) => `
                                w-full flex items-center gap-3.5 px-3 py-2.5 rounded-2xl transition-all duration-200
                                ${isActive 
                                    ? 'bg-[#1192a8] text-white font-black shadow-lg shadow-teal-500/30 scale-[1.02]' 
                                    : 'hover:bg-gray-100 text-gray-600 hover:text-[#1192a8]'}
                            `}
                        >
                            <img
                                src={item.iconSrc}
                                alt={item.label}
                                className={`w-5 h-5 object-contain ${item.path === window.location.pathname ? 'brightness-200' : ''}`}
                            />
                            <span className="text-[14px] font-bold tracking-tight">{item.label}</span>
                            </NavLink>
                    ))}
                </nav>

                {/* Logout Button */}
                <div className="p-2 border-t bg-gray-50 shrink-0">
                    <button 
                        onClick={onLogout}
                        className="flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-all font-bold w-full text-sm group"
                    >
                        <div className="w-8 h-8 flex items-center justify-center rounded-lg group-hover:bg-red-100 transition">
                            <img src={logoutIcon} alt="Đăng xuất" className="w-5 h-5 object-contain" />
                        </div>
                        <span>Đăng xuất</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
