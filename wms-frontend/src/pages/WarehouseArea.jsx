import React from 'react';
import { TableToolbar, IconPlaceholder } from '../components/common/SharedUI';

export default function WarehouseAreaPage() {
    const actions = [
        { label: "THÊM", icon: <span>➕</span> },
        { label: "SỬA", icon: <span>✏️</span> },
        { label: "XÓA", icon: <span>🗑️</span> },
        { label: "NHẬP EXCEL", icon: <span>📥</span> },
        { label: "XUẤT EXCEL", icon: <span>📤</span> },
    ];

    const areas = [
        { id: 1, name: "Khu vực A", note: "Apple" },
        { id: 2, name: "Khu vực B", note: "Xiaomi" },
        { id: 3, name: "Khu vực C", note: "Samsung" },
        { id: 4, name: "Khu vực D", note: "Realme" },
        { id: 5, name: "Khu vực E", note: "Oppo" },
    ];

    return (
        <div className="p-6 flex flex-col h-full">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Quản lý khu vực kho</h1>
            <TableToolbar actions={actions} />

            <div className="flex-1 grid grid-cols-1 xl:grid-cols-3 gap-6 overflow-hidden">
                <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-700 uppercase text-xs sticky top-0">
                        <tr>
                            <th className="p-4 w-16 text-center">STT</th>
                            <th className="p-4">Mã kho</th>
                            <th className="p-4">Tên khu vực</th>
                            <th className="p-4">Ghi chú</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-600">
                        {areas.map((area, index) => (
                            <tr key={area.id} className="hover:bg-blue-50 cursor-pointer transition">
                                <td className="p-4 text-center font-medium text-gray-900">{index + 1}</td>
                                <td className="p-4">{area.id}</td>
                                <td className="p-4 font-semibold text-[#1192a8]">{area.name}</td>
                                <td className="p-4">{area.note}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                <div className="xl:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col">
                    <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-100">
                        <IconPlaceholder className="w-12 h-12" />
                        <h2 className="text-lg font-bold text-gray-800">Danh sách sản phẩm đang có ở khu vực</h2>
                    </div>
                    <div className="space-y-3 overflow-auto flex-1 pr-2">
                        {[
                            { name: "Xiaomi Redmi Note 12", qty: 22 },
                            { name: "Samsung Galaxy S20 FE", qty: 6 },
                            { name: "Samsung Galaxy S22+ 5G", qty: 20 },
                            { name: "OPPO Reno6 Pro 5G", qty: 7 },
                        ].map((prod, i) => (
                            <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-teal-100 transition">
                                <p className="font-semibold text-gray-800">{prod.name}</p>
                                <p className="text-sm text-gray-500 mt-1">Số lượng: <span className="font-bold text-[#1192a8]">{prod.qty}</span></p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}