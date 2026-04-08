import React from 'react';
import { TableToolbar, IconPlaceholder } from '../components/common/SharedUI';

export default function ImportReceiptsPage() {
    const actions = [
        { label: "THÊM", icon: <span>➕</span> },
        { label: "CHI TIẾT", icon: <span>📄</span> },
        { label: "HỦY PHIẾU", icon: <span>🚫</span> },
        { label: "XUẤT EXCEL", icon: <span>📤</span> },
    ];

    return (
        <div className="p-6 flex flex-col h-full">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Quản lý phiếu nhập</h1>
            <TableToolbar actions={actions} />

            <div className="flex-1 flex gap-6 overflow-hidden">
                <div className="w-72 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col space-y-4 bg-gray-50">
                    <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">🛒 Bộ lọc tìm kiếm</h3>

                    {[ "Nhà cung cấp", "Nhân viên nhập" ].map(label => (
                        <div key={label}>
                            <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block">{label}</label>
                            <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"><option>Tất cả</option></select>
                        </div>
                    ))}

                    {[ "Từ ngày", "Đến ngày", "Từ số tiền (VND)", "Đến số tiền (VND)" ].map(label => (
                        <div key={label}>
                            <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block">{label}</label>
                            <input type="text" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder={label.includes("tiền") ? "0" : "dd/mm/yyyy"} />
                        </div>
                    ))}

                    <div className="pt-4 mt-auto">
                        <button className="w-full bg-gray-200 text-gray-700 py-2.5 rounded-lg text-sm font-bold hover:bg-gray-300 transition">
                            Bỏ lọc
                        </button>
                    </div>
                </div>

                <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-700 uppercase text-xs sticky top-0">
                        <tr>
                            <th className="p-4">STT</th>
                            <th className="p-4">Mã phiếu</th>
                            <th className="p-4">Nhà cung cấp</th>
                            <th className="p-4">Nhân viên nhập</th>
                            <th className="p-4">Thời gian</th>
                            <th className="p-4 text-right">Tổng tiền</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-600">
                        {[
                            { id: "PN23", ncc: "Công Ty TNHH Thế Giới Di Động", user: "", time: "10/05/2023 08:25", total: "16.000.000đ" },
                            { id: "PN21", ncc: "Công Ty Samsung Việt Nam", user: "", time: "10/05/2023 08:17", total: "12.500.000đ" },
                            { id: "PN20", ncc: "Công ty Vivo Việt Nam", user: "" +
                                    "" +
                                    "", time: "09/05/2023 12:09", total: "13.000.000đ" },
                        ].map((p, index) => (
                            <tr key={p.id} className="hover:bg-blue-50 cursor-pointer transition">
                                <td className="p-4 font-medium text-gray-900">{index + 1}</td>
                                <td className="p-4 font-mono text-xs bg-gray-50 px-2 py-1 rounded w-fit">{p.id}</td>
                                <td className="p-4 font-medium text-gray-800">{p.ncc}</td>
                                <td className="p-4">{p.user}</td>
                                <td className="p-4 text-gray-500">{p.time}</td>
                                <td className="p-4 text-right font-bold text-teal-700">{p.total}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}