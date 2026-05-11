import React, { useEffect, useState, useMemo } from 'react';
import axiosClient from '../../api/axiosClient';
import PanelCard from '../../components/statistical/PanelCard';
import StatisticsTable from '../../components/statistical/StatisticsTable';
import StatMetricCard from '../../components/statistical/StatMetricCard';

// ── Cột cho bảng tồn kho ──────────────────────────────────────────────
const inventoryColumns = [
    { key: 'stt', label: 'STT', minWidth: 60 },
    { key: 'sku', label: 'Mã SP', minWidth: 110 },
    { key: 'name', label: 'Tên sản phẩm', minWidth: 260 },
    { key: 'opening', label: 'Tồn đầu kỳ', minWidth: 130 },
    { key: 'inbound', label: 'Nhập trong kỳ', minWidth: 140 },
    { key: 'outbound', label: 'Xuất trong kỳ', minWidth: 140 },
    { key: 'ending', label: 'Tồn cuối kỳ', minWidth: 130 },
    { key: 'abcClass', label: 'ABC', minWidth: 70 },
];

// ── Cột cho bảng ABC ──────────────────────────────────────────────────
const abcColumns = [
    { key: 'className', label: 'Nhóm', minWidth: 80 },
    { key: 'productCount', label: 'Số SP', minWidth: 100 },
    { key: 'totalValue', label: 'Tổng giá trị tồn', minWidth: 160 },
    { key: 'percentage', label: 'Tỉ lệ (%)', minWidth: 120 },
];

// ── Cột cho bảng hao hụt ──────────────────────────────────────────────
const lossColumns = [
    { key: 'date', label: 'Ngày ghi nhận', minWidth: 120 },
    { key: 'type', label: 'Loại hình', minWidth: 160 },
    { key: 'product', label: 'Sản phẩm', minWidth: 220 },
    { key: 'quantity', label: 'SL Hao hụt', minWidth: 100 },
    { key: 'reason', label: 'Lý do cụ thể', minWidth: 300 },
    { key: 'reference', label: 'Mã tham chiếu', minWidth: 140 },
];

export default function StatisticalInventory() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Date range state — mặc định tháng hiện tại
    const today = new Date();
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const [startDate, setStartDate] = useState(firstOfMonth.toISOString().slice(0, 10));
    const [endDate, setEndDate] = useState(today.toISOString().slice(0, 10));

    const fetchData = async (start, end) => {
        setLoading(true);
        setError(null);
        try {
            const res = await axiosClient.get('/api/stats/inventory', {
                params: { startDate: start, endDate: end }
            });
            setData(res.data);
        } catch (err) {
            console.error('Không tải được dữ liệu tồn kho:', err);
            setError('Không thể tải dữ liệu. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(startDate, endDate);
    }, []);

    const handleSearch = () => {
        fetchData(startDate, endDate);
    };

    const handleReset = () => {
        const now = new Date();
        const first = new Date(now.getFullYear(), now.getMonth(), 1);
        setStartDate(first.toISOString().slice(0, 10));
        setEndDate(now.toISOString().slice(0, 10));
        fetchData(first.toISOString().slice(0, 10), now.toISOString().slice(0, 10));
    };

    // Transform data cho bảng tồn kho
    const inventoryRows = useMemo(() => {
        if (!data?.productStocks) return [];
        return data.productStocks.map((item, index) => ({
            id: index,
            stt: item.stt,
            sku: item.sku,
            name: item.name,
            opening: Number(item.openingStock).toLocaleString('vi-VN'),
            inbound: Number(item.inboundQty).toLocaleString('vi-VN'),
            outbound: Number(item.outboundQty).toLocaleString('vi-VN'),
            ending: Number(item.endingStock).toLocaleString('vi-VN'),
            abcClass: item.abcClass || '—',
        }));
    }, [data]);

    // Transform data cho bảng ABC
    const abcRows = useMemo(() => {
        if (!data?.abcAnalysis) return [];
        return data.abcAnalysis.map((item, index) => ({
            id: index,
            className: item.className,
            productCount: item.productCount,
            totalValue: Number(item.totalValue).toLocaleString('vi-VN'),
            percentage: `${item.percentage}%`,
        }));
    }, [data]);

    // Transform data cho bảng Hao hụt
    const lossRows = useMemo(() => {
        if (!data?.lossDetails) return [];
        return data.lossDetails.map((item, index) => ({
            id: index,
            date: item.date,
            type: item.type,
            product: `${item.sku} - ${item.productName}`,
            quantity: Number(item.quantity).toLocaleString('vi-VN'),
            reason: item.reason || '—',
            reference: item.referenceCode || '—',
        }));
    }, [data]);

    return (
        <div className="min-h-[calc(100vh-120px)] p-5 space-y-5">
            {/* KPI Cards */}
            {data && (
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-4">
                    <StatMetricCard
                        icon="📦"
                        value={data.totalProducts || 0}
                        label="Tổng sản phẩm"
                        circleClass="bg-blue-500 text-white"
                    />
                    <StatMetricCard
                        icon="📊"
                        value={Number(data.totalStockValue || 0).toLocaleString('vi-VN')}
                        label="Tổng giá trị tồn kho"
                        circleClass="bg-green-500 text-white"
                    />
                    <StatMetricCard
                        icon="⚠️"
                        value={data.lowStockProducts || 0}
                        label="SP dưới định mức"
                        circleClass="bg-orange-400 text-white"
                    />
                    <StatMetricCard
                        icon="🚫"
                        value={data.zeroStockProducts || 0}
                        label="SP hết hàng"
                        circleClass="bg-red-500 text-white"
                    />
                </div>
            )}

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[345px_minmax(0,1fr)]">
                {/* Search / Filter Panel */}
                <PanelCard className="h-fit p-6">
                    <div className="space-y-6">
                        <h3 className="text-[17px] font-semibold text-slate-900 uppercase tracking-tight border-b pb-2">Kỳ thống kê</h3>

                        <div>
                            <label className="mb-2 block text-[13px] font-black text-gray-400 uppercase">Từ ngày</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="h-11 w-full border border-slate-300 rounded-xl bg-white px-3 text-[15px] outline-none focus:border-[#1192a8]"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-[13px] font-black text-gray-400 uppercase">Đến ngày</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="h-11 w-full border border-slate-300 rounded-xl bg-white px-3 text-[15px] outline-none focus:border-[#1192a8]"
                            />
                        </div>

                        <div className="flex gap-3 pt-1">
                            <button
                                onClick={handleSearch}
                                className="flex-1 h-11 bg-[#1192a8] text-white text-[13px] font-black uppercase rounded-xl hover:bg-[#0d7a8e] shadow-lg shadow-teal-500/20 active:scale-95 transition-all"
                            >
                                Lọc dữ liệu
                            </button>
                            <button
                                onClick={handleReset}
                                className="flex-1 h-11 bg-white text-slate-700 text-[13px] font-black uppercase border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
                            >
                                Làm mới
                            </button>
                        </div>

                        {/* ABC Analysis Summary */}
                        {abcRows.length > 0 && (
                            <div className="pt-5 border-t border-slate-100">
                                <h4 className="mb-3 text-[14px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                    <span className="w-1 h-4 bg-orange-400"></span> Phân tích ABC
                                </h4>
                                <StatisticsTable
                                    columns={abcColumns}
                                    rows={abcRows}
                                    scrollHeight="180px"
                                    align="center"
                                />
                            </div>
                        )}
                    </div>
                </PanelCard>

                {/* Main Content Areas */}
                <div className="space-y-5">
                    {/* Inventory Table */}
                    <PanelCard className="overflow-hidden">
                        <div className="border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <h3 className="text-[17px] font-black text-slate-900 uppercase tracking-tight">
                                Bảng đối soát tồn kho
                            </h3>
                            <span className="text-[12px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                                {startDate} ➜ {endDate}
                            </span>
                        </div>

                        {loading ? (
                            <div className="p-20 text-center text-[#1192a8] font-bold animate-pulse">ĐANG TẢI DỮ LIỆU...</div>
                        ) : error ? (
                            <div className="p-20 text-center text-red-400 font-bold">{error}</div>
                        ) : inventoryRows.length === 0 ? (
                            <div className="p-20 text-center text-gray-400 italic">Không tìm thấy sản phẩm nào trong kỳ.</div>
                        ) : (
                            <StatisticsTable
                                columns={inventoryColumns}
                                rows={inventoryRows}
                                scrollHeight="400px"
                            />
                        )}
                    </PanelCard>

                    {/* Loss Details Table (MỚI) */}
                    <PanelCard className="overflow-hidden border-rose-100 bg-rose-50/5">
                        <div className="border-b border-rose-100 px-6 py-4 bg-rose-50/30 flex items-center gap-3">
                            <span className="text-xl">📉</span>
                            <h3 className="text-[17px] font-black text-rose-800 uppercase tracking-tight">
                                Nhật ký hao tổn & Thất thoát hàng hóa
                            </h3>
                        </div>

                        {loading ? (
                            <div className="p-10 text-center text-rose-300 font-bold">ĐANG KIỂM TRA SỔ SÁCH...</div>
                        ) : lossRows.length === 0 ? (
                            <div className="p-16 text-center text-gray-400 italic font-medium">
                                Tuyệt vời! Không ghi nhận bất kỳ khoản hao tổn nào trong kỳ này.
                            </div>
                        ) : (
                            <StatisticsTable
                                columns={lossColumns}
                                rows={lossRows}
                                scrollHeight="300px"
                            />
                        )}
                        <div className="px-6 py-3 bg-white border-t border-rose-50 text-[10px] text-rose-400 italic font-bold">
                            * Dữ liệu bao gồm hàng hỏng từ khâu QC và sai lệch âm từ các đợt kiểm kê thực tế.
                        </div>
                    </PanelCard>
                </div>
            </div>
        </div>
    );
}
