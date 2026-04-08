import React from 'react';

// 1. Import các ảnh icon từ thư mục của bạn
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
    { id: 'home', label: 'Trang chủ', iconSrc: homeIcon },
    { id: 'products', label: 'Sản phẩm', iconSrc: productIcon },
    { id: 'attribute', label: 'Thuộc tính', iconSrc: attributeIcon },
    { id: 'warehouse-area', label: 'Khu vực kho', iconSrc: warehouseIcon },
    { id: 'inbound', label: 'Phiếu nhập', iconSrc: inboundIcon },
    { id: 'outbound', label: 'Phiếu xuất', iconSrc: outboundIcon },
    { id: 'client', label: 'Khách hàng', iconSrc: clientIcon },
    { id: 'supplier', label: 'Nhà cung cấp', iconSrc: supplierIcon },
    { id: 'staff', label: 'Nhân viên', iconSrc: staffIcon },
    { id: 'account', label: 'Tài khoản', iconSrc: accountIcon },
    { id: 'statistical', label: 'Thống kê', iconSrc: statisticalIcon },
    { id: 'authority', label: 'Phân quyền', iconSrc: authorityIcon },
];

export default function Sidebar({ activeTab, setActiveTab }) {
    return (
        <aside className="w-64 bg-white border-r h-screen flex flex-col">

            {/* Khu vực thông tin người dùng */}
            <div className="p-4 flex items-center gap-3 border-b">
                <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                    <img src={avatarImg} alt="User" className="w-full h-full object-cover" />
                </div>
                <div>
                    <p className="font-bold text-sm">Admin</p>
                    <p className="text-xs text-gray-500">Quản lý kho</p>
                </div>
            </div>

            {/* Menu điều hướng */}
            <nav className="flex-1 overflow-y-auto p-2">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition
              ${activeTab === item.id ? 'bg-blue-100 text-blue-600 font-bold' : 'hover:bg-gray-100 text-gray-700'}`}
                    >
                        <img
                            src={item.iconSrc}
                            alt={item.label}
                            className="w-6 h-6 object-contain"
                        />
                        <span className="text-sm">{item.label}</span>
                    </button>
                ))}
            </nav>

            {/* Nút đăng xuất */}
            <button className="p-4 text-red-500 flex items-center gap-3 hover:bg-red-50 transition border-t font-medium">
                <img src={logoutIcon} alt="Đăng xuất" className="w-6 h-6 object-contain" />
                <span>Đăng xuất</span>
            </button>
        </aside>
    );
}