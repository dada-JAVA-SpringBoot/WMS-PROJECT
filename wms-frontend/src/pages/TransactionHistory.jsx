import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axiosClient from '../api/axiosClient';
import historyIcon from '../components/common/icons/history.png';
import excelIcon  from '../components/common/icons/excel.png';
import excel1Icon from '../components/common/icons/excel1.png';
import * as XLSX from 'xlsx';
import { ActionButton } from '../components/common/SharedUI';

const TRANSACTION_TYPES = {
    INBOUND:      { label: 'Nhập kho',        color: 'text-green-600 bg-green-50 border-green-100 dark:text-green-400 dark:bg-green-900/20 dark:border-green-800' },
    OUTBOUND:     { label: 'Xuất kho',         color: 'text-red-600 bg-red-50 border-red-100 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800' },
    TRANSFER_IN:  { label: 'Điều chuyển đến',  color: 'text-blue-600 bg-blue-50 border-blue-100 dark:text-blue-400 dark:bg-blue-900/20 dark:border-blue-800' },
    TRANSFER_OUT: { label: 'Điều chuyển đi',   color: 'text-orange-600 bg-orange-50 border-orange-100 dark:text-orange-400 dark:bg-orange-900/20 dark:border-orange-800' },
    ADJUSTMENT:   { label: 'Điều chỉnh',       color: 'text-purple-600 bg-purple-50 border-purple-100 dark:text-purple-400 dark:bg-purple-900/20 dark:border-purple-800' }
};

export default function TransactionHistory() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterKeyword, setFilterKeyword] = useState("");
    const [filterType, setFilterType] = useState("ALL");
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axiosClient.get('/api/transactions/history');
            setTransactions(res.data);
        } catch (error) {
            console.error("Lỗi tải lịch sử giao dịch:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filteredData = useMemo(() => {
        let result = transactions.filter(t => {
            const kw = filterKeyword.toLowerCase().trim();
            const matchesKw = !kw || (
                (t.productName || "").toLowerCase().includes(kw) ||
                (t.productSku || "").toLowerCase().includes(kw) ||
                (t.binCode || "").toLowerCase().includes(kw) ||
                (t.batchCode || "").toLowerCase().includes(kw)
            );
            const matchesType = filterType === "ALL" || t.transactionType === filterType;
            return matchesKw && matchesType;
        });

        if (sortConfig.key) {
            result.sort((a, b) => {
                let vA = a[sortConfig.key];
                let vB = b[sortConfig.key];
                if (vA < vB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (vA > vB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return result;
    }, [transactions, filterKeyword, filterType, sortConfig]);

    const handleExportExcel = () => {
        if (!filteredData.length) return;
        const sheetData = filteredData.map((t, idx) => ({
            "STT": idx + 1,
            "Thời gian": new Date(t.createdAt).toLocaleString('vi-VN'),
            "Sản phẩm": t.productName,
            "SKU": t.productSku,
            "Loại giao dịch": TRANSACTION_TYPES[t.transactionType]?.label || t.transactionType,
            "Thay đổi": t.quantityChange,
            "Lô hàng": t.batchCode,
            "Vị trí": t.binCode,
            "Khu vực": t.zone,
            "Người thực hiện": t.staffName || `NV #${t.createdBy}`
        }));
        const ws = XLSX.utils.json_to_sheet(sheetData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "LichSuGiaoDich");
        XLSX.writeFile(wb, `Lich_Su_Giao_Dich_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    const SortIcon = ({ col }) => {
        if (sortConfig.key !== col) return <span className="opacity-20 ml-1 italic">↕</span>;
        return <span className="ml-1 text-[#1192a8] dark:text-[#38bcd4] font-black">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>;
    };

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key, direction });
    };

    return (
        <div className="p-6 bg-[#f8f9fa] dark:bg-gray-900 min-h-full flex flex-col text-left font-sans text-gray-800 dark:text-gray-100 transition-colors duration-300">

            {/* Header Toolbar */}
            <div className="sticky top-0 z-20 flex items-center justify-between bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6 transition-colors duration-300">
                <div className="flex gap-4">
                    <ActionButton label="XUẤT EXCEL" iconSrc={excelIcon} onClick={handleExportExcel} />
                    <ActionButton label="LÀM MỚI" iconSrc={excel1Icon} onClick={fetchData} />
                </div>
                <div className="flex items-center gap-3">
                    <img src={historyIcon} className="w-6 h-6 object-contain opacity-40 dark:opacity-60 dark:brightness-110" alt="History" />
                    <h1 className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Nhật ký biến động kho (Audit Trail)</h1>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-100 dark:border-gray-700 mb-6 flex flex-col gap-4 shadow-sm transition-colors duration-300">
                <div className="flex items-center gap-4">
                    <input
                        type="text"
                        value={filterKeyword}
                        onChange={e => setFilterKeyword(e.target.value)}
                        placeholder="Tìm theo sản phẩm, SKU, vị trí hoặc số lô..."
                        className="flex-1 border-2 border-gray-100 dark:border-gray-600 rounded-xl px-5 py-3 text-sm outline-none focus:border-[#1192a8] bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 transition-all"
                    />
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase">Loại giao dịch:</span>
                        <select
                            value={filterType}
                            onChange={e => setFilterType(e.target.value)}
                            className="wms-select !py-2 !px-4 min-w-[180px] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                        >
                            <option value="ALL">Tất cả các loại</option>
                            {Object.entries(TRANSACTION_TYPES).map(([val, meta]) => (
                                <option key={val} value={val}>{meta.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Table Area */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm flex flex-col transition-colors duration-300">
                <div className="overflow-auto flex-1 no-scrollbar">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/80 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase sticky top-0 z-10 backdrop-blur-sm">
                        <tr>
                            <th className="p-5 w-16">#</th>
                            <th className="p-5 cursor-pointer hover:text-[#1192a8] dark:hover:text-[#38bcd4]" onClick={() => requestSort('createdAt')}>Thời gian <SortIcon col="createdAt" /></th>
                            <th className="p-5">Sản phẩm / SKU</th>
                            <th className="p-5">Loại giao dịch</th>
                            <th className="p-5 text-right cursor-pointer hover:text-[#1192a8] dark:hover:text-[#38bcd4]" onClick={() => requestSort('quantityChange')}>Thay đổi <SortIcon col="quantityChange" /></th>
                            <th className="p-5">Lô & Vị trí</th>
                            <th className="p-5">Người thực hiện</th>
                        </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-gray-50 dark:divide-gray-700/50">
                        {loading ? (
                            <tr>
                                <td colSpan="7" className="py-20 text-center animate-pulse text-[#1192a8] dark:text-[#38bcd4] font-black uppercase tracking-widest">
                                    Đang truy vấn dữ liệu giao dịch...
                                </td>
                            </tr>
                        ) : filteredData.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="py-20 text-center text-gray-400 dark:text-gray-600 italic">
                                    Không tìm thấy dữ liệu giao dịch phù hợp.
                                </td>
                            </tr>
                        ) : filteredData.map((t, idx) => {
                            const typeMeta = TRANSACTION_TYPES[t.transactionType] || { label: t.transactionType, color: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400' };
                            return (
                                <tr key={t.id} className="hover:bg-blue-50/50 dark:hover:bg-gray-700/30 transition-colors">
                                    <td className="p-5 text-gray-300 dark:text-gray-600 font-bold">{idx + 1}</td>
                                    <td className="p-5">
                                        <div className="font-bold text-gray-700 dark:text-gray-200">{new Date(t.createdAt).toLocaleDateString('vi-VN')}</div>
                                        <div className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">{new Date(t.createdAt).toLocaleTimeString('vi-VN')}</div>
                                    </td>
                                    <td className="p-5">
                                        <div className="font-black text-gray-800 dark:text-gray-100 uppercase truncate max-w-[200px]" title={t.productName}>{t.productName}</div>
                                        <div className="text-[10px] font-bold text-[#1192a8] dark:text-[#38bcd4] font-mono">{t.productSku}</div>
                                    </td>
                                    <td className="p-5">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${typeMeta.color}`}>
                                                {typeMeta.label}
                                            </span>
                                    </td>
                                    <td className="p-5 text-right font-black text-lg">
                                            <span className={t.quantityChange > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                                {t.quantityChange > 0 ? `+${t.quantityChange}` : t.quantityChange}
                                            </span>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex flex-col gap-0.5">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase">Lô:</span>
                                                <span className="text-[11px] font-black text-gray-700 dark:text-gray-200 font-mono">{t.batchCode}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase">Vị trí:</span>
                                                <span className="text-[11px] font-black text-[#1192a8] dark:text-[#38bcd4]">{t.binCode}</span>
                                                <span className="text-[9px] text-gray-400 dark:text-gray-500">({t.zone})</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-[10px] font-black text-gray-400 dark:text-gray-400">
                                                {(t.staffName || 'U').charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-bold text-gray-600 dark:text-gray-300">{t.staffName || `NV #${t.createdBy}`}</span>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}