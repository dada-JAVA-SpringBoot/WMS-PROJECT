import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import axiosClient from '../../api/axiosClient';
import { useExcelExport } from '../../hooks/useExcelExport';
import ExportExcelModal from './ExportExcelModal';

export default function LocationInventoryModal({ location, onClose }) {
    const [inventory, setInventory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const {
        isExportModalOpen,
        exportFileName,
        setExportFileName,
        openExportModal,
        closeExportModal,
        performExport,
        detectBestExportMode
    } = useExcelExport(`TonKho_${location?.binCode}_${new Date().toISOString().slice(0, 10)}.xlsx`);

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

    const handleExportExcel = async () => {
        if (!inventory.length) return;
        
        const sheetData = inventory.map(item => ({
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

        const ws = XLSX.utils.json_to_sheet(sheetData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Inventory");
        
        await performExport(wb, null, sheetData);
        closeExportModal();
    };

    if (!location) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex justify-center items-center p-2 md:p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[98vh] md:max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="bg-[#1192a8] p-4 md:p-5 text-white flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-2 md:gap-4 min-w-0">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-lg md:rounded-xl flex items-center justify-center font-black text-sm md:text-lg shrink-0">📦</div>
                        <div className="min-w-0">
                            <h2 className="font-bold uppercase tracking-widest text-[10px] md:text-sm truncate">Hàng hóa tại vị trí</h2>
                            <p className="text-[10px] md:text-xs opacity-90 font-medium truncate">{location.binCode} — {location.zone}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 md:gap-4 ml-4 shrink-0">
                        <button 
                            onClick={() => openExportModal()}
                            disabled={inventory.length === 0}
                            className="bg-white/10 hover:bg-white/20 px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl text-[10px] font-black uppercase tracking-tight transition-all disabled:opacity-30 border border-white/20 hidden sm:block"
                        >
                            Xuất Excel
                        </button>
                        <button onClick={onClose} className="text-2xl md:text-3xl hover:text-red-200 leading-none">&times;</button>
                    </div>
                </div>

                <div className="p-3 md:p-6 overflow-y-auto flex-1 bg-gray-50/30">
                    {isLoading ? (
                        <div className="py-20 text-center">
                            <div className="inline-block w-8 h-8 border-4 border-[#1192a8] border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-[#1192a8] font-black text-xs uppercase tracking-widest">Đang tải...</p>
                        </div>
                    ) : inventory.length > 0 ? (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto no-scrollbar lg:scrollbar-thin">
                                <table className="w-full text-left min-w-[500px]">
                                    <thead className="bg-gray-50 border-b text-[9px] font-black text-gray-400 uppercase tracking-wider">
                                        <tr>
                                            <th className="px-4 py-3">Sản phẩm</th>
                                            <th className="px-4 py-3">Thông tin lô</th>
                                            <th className="px-4 py-3 text-right">Tổng tồn</th>
                                            <th className="px-4 py-3 text-right">Khả dụng</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-[11px] md:text-sm divide-y divide-gray-100">
                                        {inventory.map((item, idx) => {
                                            const onHand = Number(item.onHand || 0);
                                            const allocated = Number(item.allocated || 0);
                                            const available = onHand - allocated;
                                            return (
                                                <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                                                    <td className="px-4 py-3">
                                                        <p className="font-black text-gray-800 leading-tight mb-0.5 truncate max-w-[150px] md:max-w-none">{item.productName}</p>
                                                        <p className="text-[10px] text-gray-400 font-mono">{item.productSku}</p>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex flex-col gap-0.5">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="font-mono text-[10px] font-bold text-[#1192a8] bg-[#1192a8]/5 px-1 rounded">Lô: {item.batchCode}</span>
                                                            </div>
                                                            <span className="text-[9px] font-bold text-gray-400">
                                                                HSD: {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('vi-VN') : '---'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <span className="font-black text-gray-700">{onHand.toLocaleString()}</span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded font-black">
                                                            {available.toLocaleString()}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="py-20 text-center">
                            <div className="text-4xl mb-4 opacity-20 text-gray-300">📭</div>
                            <p className="text-gray-400 italic font-bold uppercase text-[10px] tracking-widest">Vị trí này đang trống hàng.</p>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t bg-gray-50 flex flex-col sm:flex-row gap-3 shrink-0">
                    <button 
                        onClick={() => openExportModal()}
                        disabled={inventory.length === 0}
                        className="sm:hidden w-full py-3 bg-[#1192a8] text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 disabled:opacity-30"
                    >
                        Xuất Excel
                    </button>
                    <button onClick={onClose} className="w-full sm:w-auto ml-auto px-10 py-3 bg-gray-500 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95">
                        Đóng cửa sổ
                    </button>
                </div>
            </div>
            
            <ExportExcelModal 
                isOpen={isExportModalOpen}
                fileName={exportFileName}
                onFileNameChange={setExportFileName}
                onExport={handleExportExcel}
                onClose={closeExportModal}
                saveMode={detectBestExportMode()}
            />
        </div>
    );
}

