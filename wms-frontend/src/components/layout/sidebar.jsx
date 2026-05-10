import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

// Import icons
import homeIcon from '../common/icons/home.png';
import productIcon from '../common/icons/product.png';
import attributeIcon from '../common/icons/attribute.png';
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
import avatarImg from '../common/icons/avatar.png';

const menuItems = [
    { id: 'home',           path: '/admin/home',           label: 'Trang chủ',      iconSrc: homeIcon },
    { id: 'products',       path: '/admin/products',       label: 'Sản phẩm',       iconSrc: productIcon },
    { id: 'attribute',      path: '/admin/attribute',      label: 'Thuộc tính',     iconSrc: attributeIcon,   roles: ['ADMIN'] },
    { id: 'warehouse-area', path: '/admin/warehouse-area', label: 'Khu vực kho',    iconSrc: warehouseIcon,   roles: ['ADMIN', 'MANAGER', 'STOREKEEPER'] },
    { id: 'inbound',        path: '/admin/inbound',        label: 'Phiếu nhập',     iconSrc: inboundIcon,     roles: ['ADMIN', 'MANAGER', 'STOREKEEPER', 'INBOUND_STAFF'] },
    { id: 'outbound',       path: '/admin/outbound',       label: 'Phiếu xuất',     iconSrc: outboundIcon,    roles: ['ADMIN', 'MANAGER', 'STOREKEEPER', 'OUTBOUND_STAFF'] },
    { id: 'attendance',     path: '/admin/attendance',     label: 'Lịch sử công',   iconSrc: statisticalIcon, roles: ['MANAGER', 'STOREKEEPER', 'INBOUND_STAFF', 'OUTBOUND_STAFF', 'CHECKER'] },
    { id: 'attendance-m',   path: '/admin/attendance-manage', label: 'Duyệt chấm công', iconSrc: authorityIcon, roles: ['ADMIN', 'MANAGER'] },
    { id: 'client',         path: '/admin/client',         label: 'Khách hàng',     iconSrc: clientIcon,      roles: ['ADMIN', 'MANAGER', 'OUTBOUND_STAFF'] },
    { id: 'supplier',       path: '/admin/supplier',       label: 'Nhà cung cấp',   iconSrc: supplierIcon,    roles: ['ADMIN', 'MANAGER', 'STOREKEEPER', 'INBOUND_STAFF'] },
    { id: 'staff',          path: '/admin/staff',          label: 'Nhân viên',      iconSrc: staffIcon,       roles: ['ADMIN'] },
    { id: 'account',        path: '/admin/account',        label: 'Tài khoản',      iconSrc: accountIcon,     roles: ['ADMIN'] },
    { id: 'statistical',    path: '/admin/statistical',    label: 'Thống kê',       iconSrc: statisticalIcon, roles: ['ADMIN', 'MANAGER', 'STOREKEEPER', 'CHECKER'] },
];

export default function Sidebar({ user, onLogout }) {
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
            const endpoint = 'check-out'; // Chỉ hiện nút kết thúc ca trong sidebar
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
        <aside className="w-56 bg-white border-r h-screen flex flex-col shadow-xl z-20">
            {/* User Info & Attendance Widget */}
            <div className="p-4 bg-gradient-to-b from-white to-gray-50 border-b">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden border-2 border-[#1192a8] shadow-sm">
                        <img src={avatarImg} alt="User" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <p className="font-bold text-sm text-gray-800 truncate w-32" title={user?.fullName}>
                            {user?.fullName || 'User'}
                        </p>
                        <p className="text-[10px] text-[#1192a8] font-black uppercase tracking-widest">
                            {user?.roles?.[0] || 'Nhân viên'}
                        </p>
                    </div>
                </div>

                {user && !user.roles.includes('ADMIN') && (
                    <div className="bg-white p-3 rounded-2xl border border-blue-100 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Ca làm việc</span>
                            {attendance?.checkInTime && !attendance?.checkOutTime && (
                                <span className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
                                    <span className="text-[9px] font-black text-green-600">LIVE</span>
                                </span>
                            )}
                        </div>
                        <p className="text-[10px] font-bold text-gray-700 text-center mb-2">
                            {attendance?.checkInTime 
                                ? (attendance.checkOutTime ? 'ĐÃ KẾT THÚC CA' : 'ĐANG LÀM VIỆC')
                                : 'CHƯA VÀO CA'}
                        </p>
                        {attendance?.checkInTime && !attendance?.checkOutTime && (
                            <button 
                                onClick={handleCheckAction}
                                disabled={loadingAt}
                                className="w-full py-2.5 rounded-xl text-[10px] font-black transition-all active:scale-95 bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-200 uppercase tracking-wider"
                            >
                                {loadingAt ? '...' : 'KẾT THÚC CA'}
                            </button>
                        )}
                        {attendance?.lateMinutes > 0 && (
                            <p className="text-[9px] text-red-500 mt-2 font-bold text-center bg-red-50 py-1 rounded-lg italic">
                                ⚠ {attendance.approvalStatus === 'PENDING' ? 'ĐANG CHỜ DUYỆT TRỄ' : `TRỄ ${attendance.lateMinutes} PHÚT`}
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                {filteredMenu.map((item) => (
                    <NavLink
                        key={item.id}
                        to={item.path}
                        className={({ isActive }) => `
                            w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200
                            ${isActive 
                                ? 'bg-[#1192a8] text-white font-bold shadow-md shadow-teal-500/20' 
                                : 'hover:bg-gray-100 text-gray-600 hover:text-[#1192a8]'}
                        `}
                    >
                        <img
                            src={item.iconSrc}
                            alt={item.label}
                            className={`w-5 h-5 object-contain ${item.path === window.location.pathname ? 'brightness-200' : ''}`}
                        />
                        <span className="text-[13px] tracking-tight">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Logout Button */}
            <div className="p-2 border-t bg-gray-50">
                <button 
                    onClick={onLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all font-bold w-full text-sm group"
                >
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg group-hover:bg-red-100 transition">
                        <img src={logoutIcon} alt="Đăng xuất" className="w-5 h-5 object-contain" />
                    </div>
                    <span>Đăng xuất</span>
                </button>
            </div>
        </aside>
    );
}