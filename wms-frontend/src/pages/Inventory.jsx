import React, { useState } from 'react';
import ProductModal from '../components/modals/ProductModal';

import addIcon from '../components/common/icons/add.png';
import fixIcon from '../components/common/icons/fix.png';
import deleteIcon from '../components/common/icons/delete.png';
import infoIcon from '../components/common/icons/info.png';
import scanIcon from '../components/common/icons/scan.png';
import excelIcon from '../components/common/icons/excel.png';

export default function Inventory() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const mockData = [
        { id: 1, name: 'Vivo Y22s', stock: 5, brand: 'Apple', os: 'Android', screen: '6.55 inch', chip: 'SnapDragon 680', battery: '5000mAh', origin: 'Trung Quốc', area: 'Khu vực A' },
        { id: 2, name: 'Samsung Galaxy A53 5G', stock: 3, brand: 'Samsung', os: 'Android', screen: '6.5 inch', chip: 'Exynos 1280', battery: '5000mAh', origin: 'Trung Quốc', area: 'Khu vực B' },
        { id: 4, name: 'Vivo Y02s', stock: 14, brand: 'Vivo', os: 'Android', screen: '6.51 inch', chip: 'MediaTek Helio ...', battery: '5000mAh', origin: 'Trung Quốc', area: 'Khu vực C' },
        { id: 5, name: 'Samsung Galaxy A54 5G', stock: 39, brand: 'Samsung', os: 'Android', screen: '6.4 inch', chip: 'Exynos 1380 8 ...', battery: '5000mAh', origin: 'Hàn Quốc', area: 'Khu vực C' },
        { id: 6, name: 'Samsung Galaxy A13', stock: 27, brand: 'Samsung', os: 'Android', screen: '6.6 inch', chip: 'Exynos 850', battery: '5000mAh', origin: 'Trung Quốc', area: 'Khu vực B' },
    ];

    return (
        <div className="p-6 h-full flex flex-col bg-gray-50">
            {/* Thanh công cụ (Action Buttons Bar) */}
            <div className="flex items-center justify-between bg-white p-4 mb-4 rounded-xl shadow-sm">

                <div className="flex gap-6">
                    <div onClick={() => setIsModalOpen(true)}>
                        <ActionButton iconSrc={addIcon} label="THÊM" />
                    </div>
                    <ActionButton iconSrc={fixIcon} label="SỬA" />
                    <ActionButton iconSrc={deleteIcon} label="XÓA" />
                    <ActionButton iconSrc={infoIcon} label="CHI TIẾT" />
                    <ActionButton iconSrc={scanIcon} label="XEM DS" />
                    <ActionButton iconSrc={excelIcon} label="XUẤT EXCEL" />
                </div>

                <div className="flex items-center gap-3">
                    <select className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 bg-white">
                        <option>Tất cả</option>
                        <option>Theo tên</option>
                        <option>Theo mã</option>
                    </select>
                    <input
                        type="text"
                        className="border border-gray-300 rounded px-4 py-1.5 w-64 text-sm focus:outline-none focus:border-blue-500"
                        placeholder="Nhập nội dung tìm kiếm..."
                    />
                    <button className="bg-[#1192a8] text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-teal-700 flex items-center gap-2 transition">
                        <span>↻</span> Làm mới
                    </button>
                </div>
            </div>

            {/* Khu vực Bảng dữ liệu (Table Area) */}
            <div className="bg-white flex-1 overflow-auto rounded-xl shadow-sm">
                <table className="w-full text-center text-sm">
                    <thead className="bg-gray-50 sticky top-0 shadow-sm">
                    <tr className="text-gray-700">
                        <th className="p-4 font-bold">Mã SP</th>
                        <th className="p-4 font-bold">Tên sản phẩm</th>
                        <th className="p-4 font-bold">Số lượng tồn</th>
                        <th className="p-4 font-bold">Thương hiệu</th>
                        <th className="p-4 font-bold">Hệ điều hành</th>
                        <th className="p-4 font-bold">Kích thước màn</th>
                        <th className="p-4 font-bold">Chip xử lý</th>
                        <th className="p-4 font-bold">Dung lượng pin</th>
                        <th className="p-4 font-bold">Xuất xứ</th>
                        <th className="p-4 font-bold">Khu vực kho</th>
                    </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                    {mockData.map((item) => (
                        <tr key={item.id} className="hover:bg-blue-50 transition cursor-pointer text-gray-600">
                            <td className="p-3">{item.id}</td>
                            <td className="p-3 font-medium text-gray-800">{item.name}</td>
                            <td className="p-3">{item.stock}</td>
                            <td className="p-3">{item.brand}</td>
                            <td className="p-3">{item.os}</td>
                            <td className="p-3">{item.screen}</td>
                            <td className="p-3">{item.chip}</td>
                            <td className="p-3">{item.battery}</td>
                            <td className="p-3">{item.origin}</td>
                            <td className="p-3">{item.area}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            {/* Nơi nhúng Modal Thêm Sản Phẩm */}
            <ProductModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
}

function ActionButton({ iconSrc, label }) {
    return (
        <button className="flex flex-col items-center gap-1 group bg-transparent border-none cursor-pointer">
            <img
                src={iconSrc}
                alt={label}
                className="w-10 h-10 group-hover:scale-110 transition duration-200"
            />
            <span className="text-[11px] font-bold text-[#00529c] uppercase tracking-wide group-hover:text-blue-600 transition">
                {label}
            </span>
        </button>
    );
}