import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import axiosClient from '../../api/axiosClient';

export default function LocationInventoryModal({ location, onClose }) {
    const [inventory, setInventory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (location) {
            const fetchInventory = async () => {
                setIsLoading(true);
                try {
                    const response = await axiosClient.get(`/api/inventory/location/${location.id}`);
                    setInventory(response.data);
                } catch (error) {
                    console.error("Lỗi tải tồn kho theo vị trí:", error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchInventory();
        }
    }, [location]);

    const handleExportExcel = () => {
        if (!inventory.length) return;
        
        const data = inventory.map(item => ({
            'Mã vị trí': location.binCode,
            'Khu vực': location.zone,
            'Mã SKU': item.productSku,
            'Tên sản phẩm': item.productName,
            'Mã Lô (Batch)': item.batchCode,
            'Hạn sử dụng': item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('vi-VN') : '',
            'Tổng tồn': Number(item.onHand || 0),
            'Đã phân bổ': Number(item.allocated || 0),
            'Khả dụng': Number(item.onHand || 0) - Number(item.allocated || 0)
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Inventory");
        XLSX.writeFile(wb, `TonKho_${location.binCode}_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    if (!location) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="bg-[#1192a8] p-5 text-white flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-black text-lg">📦</div>
                        <div>
                            <h2 className="font-bold uppercase tracking-widest text-sm">Danh sách hàng hóa tại vị trí</h2>
                            <p className="text-xs opacity-90 font-medium">{location.binCode} — Khu vực: {location.zone}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={handleExportExcel}
                            disabled={inventory.length === 0}
                            className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tight transition-all disabled:opacity-30 border border-white/20"
                        >
                            Xuất Excel
                        </button>
                        <button onClick={onClose} className="text-3xl hover:text-red-200 leading-none">&times;</button>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto flex-1 bg-gray-50/30">
                    {isLoading ? (
                        <div className="py-20 text-center">
                            <div className="inline-block w-8 h-8 border-4 border-[#1192a8] border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-[#1192a8] font-black text-xs uppercase tracking-widest">Đang truy xuất dữ liệu...</p>
                        </div>
                    ) : inventory.length > 0 ? (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <table className="w-full text-left table-auto">
                                <thead className="bg-gray-50 border-b text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">
                                    <tr>
                                        <th className="px-5 py-4">Sản phẩm</th>
                                        <th className="px-5 py-4">Thông tin lô</th>
                                        <th className="px-5 py-4 text-right">Tổng tồn</th>
                                        <th className="px-5 py-4 text-right">Phân bổ</th>
                                        <th className="px-5 py-4 text-right">Khả dụng</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-gray-100">
                                    {inventory.map((item, idx) => {
                                        const onHand = Number(item.onHand || 0);
                                        const allocated = Number(item.allocated || 0);
                                        const available = onHand - allocated;
                                        return (
                                            <tr key={idx} className="hover:bg-blue-50/30 transition-colors group">
                                                <td className="px-5 py-4">
                                                    <p className="font-black text-gray-800 leading-tight mb-1">{item.productName}</p>
                                                    <p className="text-[11px] text-gray-400 font-mono">{item.productSku}</p>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[9px] font-bold text-gray-300 uppercase">Lô:</span>
                                                            <span className="font-mono text-xs font-bold text-[#1192a8] bg-[#1192a8]/5 px-1.5 py-0.5 rounded border border-[#1192a8]/10">{item.batchCode}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[9px] font-bold text-gray-300 uppercase">HSD:</span>
                                                            <span className="text-[11px] font-bold text-gray-500">
                                                                {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('vi-VN') : '---'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    <span className="font-black text-gray-700">{onHand.toLocaleString()}</span>
                                                </td>
                                                <td className="px-5 py-4 text-right font-bold text-gray-400">
                                                    {allocated.toLocaleString()}
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    <span className="px-3 py-1 bg-green-50 text-green-700 rounded-lg font-black text-sm border border-green-100">
                                                        {available.toLocaleString()}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="py-20 text-center">
                            <div className="text-4xl mb-4 opacity-20">📭</div>
                            <p className="text-gray-400 italic font-medium">Vị trí này hiện đang trống hàng.</p>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t bg-gray-50 flex justify-end">
                    <button onClick={onClose} className="px-8 py-2.5 bg-gray-800 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition shadow-lg active:scale-95">
                        ĐÓNG CỬA SỔ
                    </button>
                </div>
            </div>
        </div>
    );
}
