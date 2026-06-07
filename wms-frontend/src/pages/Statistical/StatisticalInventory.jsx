import React, { useEffect, useState, useMemo } from 'react';
import axiosClient from '../../api/axiosClient';
import PanelCard from '../../components/statistical/PanelCard';
import StatisticsTable from '../../components/statistical/StatisticsTable';
import StatMetricCard from '../../components/statistical/StatMetricCard';
import FilterBar, { FilterButton, FilterDateInput } from '../../components/statistical/FilterBar';
import { formatCurrencyShort, formatCurrencyVN } from '../../components/statistical/charts/chartUtils';

const inventoryColumns = [
    { key: 'stt',      label: 'STT',           minWidth: 60  },
    { key: 'sku',      label: 'Mã SP',         minWidth: 110 },
    { key: 'name',     label: 'Tên sản phẩm',  minWidth: 260 },
    { key: 'opening',  label: 'Tồn đầu kỳ',    minWidth: 130 },
    { key: 'inbound',  label: 'Nhập trong kỳ', minWidth: 140 },
    { key: 'outbound', label: 'Xuất trong kỳ', minWidth: 140 },
    { key: 'ending',   label: 'Tồn cuối kỳ',   minWidth: 130 },
    { key: 'abcClass', label: 'ABC',            minWidth: 70  },
];

const abcColumns = [
    { key: 'className',    label: 'Nhóm',             minWidth: 80  },
    { key: 'productCount', label: 'Số SP',             minWidth: 100 },
    { key: 'totalValue',   label: 'Tổng giá trị tồn', minWidth: 160 },
    { key: 'percentage',   label: 'Tỉ lệ (%)',         minWidth: 120 },
];

const lossColumns = [
    { key: 'date',      label: 'Ngày ghi nhận', minWidth: 120 },
    { key: 'type',      label: 'Loại hình',     minWidth: 160 },
    { key: 'product',   label: 'Sản phẩm',      minWidth: 220 },
    { key: 'quantity',  label: 'SL Hao hụt',    minWidth: 100 },
    { key: 'reason',    label: 'Lý do cụ thể',  minWidth: 300 },
    { key: 'reference', label: 'Mã tham chiếu', minWidth: 140 },
];

export default function StatisticalInventory() {
    const [data, setData]       = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);

    const today        = new Date();
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const [startDate, setStartDate] = useState(firstOfMonth.toISOString().slice(0, 10));
    const [endDate,   setEndDate]   = useState(today.toISOString().slice(0, 10));

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

    useEffect(() => { fetchData(startDate, endDate); }, []);

    const handleSearch = () => fetchData(startDate, endDate);

    const handleReset = () => {
        const now   = new Date();
        const first = new Date(now.getFullYear(), now.getMonth(), 1);
        const s = first.toISOString().slice(0, 10);
        const e = now.toISOString().slice(0, 10);
        setStartDate(s);
        setEndDate(e);
        fetchData(s, e);
    };

    const inventoryRows = useMemo(() => {
        if (!data?.productStocks) return [];
        return data.productStocks.map((item, index) => ({
            id:       index,
            stt:      item.stt,
            sku:      item.sku,
            name:     item.name,
            opening:  Number(item.openingStock).toLocaleString('vi-VN'),
            inbound:  Number(item.inboundQty).toLocaleString('vi-VN'),
            outbound: Number(item.outboundQty).toLocaleString('vi-VN'),
            ending:   Number(item.endingStock).toLocaleString('vi-VN'),
            abcClass: item.abcClass || '—',
        }));
    }, [data]);

    const abcRows = useMemo(() => {
        if (!data?.abcAnalysis) return [];
        return data.abcAnalysis.map((item, index) => ({
            id:           index,
            className:    item.className,
            productCount: item.productCount,
            totalValue:   Number(item.totalValue).toLocaleString('vi-VN'),
            percentage:   `${item.percentage}%`,
        }));
    }, [data]);

    const lossRows = useMemo(() => {
        if (!data?.lossDetails) return [];
        return data.lossDetails.map((item, index) => ({
            id:        index,
            date:      item.date,
            type:      item.type,
            product:   `${item.sku} - ${item.productName}`,
            quantity:  Number(item.quantity).toLocaleString('vi-VN'),
            reason:    item.reason || '—',
            reference: item.referenceCode || '—',
        }));
    }, [data]);

    return (
        <div className="min-h-[calc(100vh-120px)] p-5 space-y-5 bg-[#f8f9fa] dark:bg-gray-900 transition-colors duration-300">

            {/* ── Filter Bar ── */}
            <FilterBar>
                <span className="text-[16px] text-slate-800 text-gray-200 font-bold uppercase tracking-wider">
                    Kỳ thống kê:
                </span>
                <span className="text-[15px] text-slate-700 text-gray-300">Từ ngày</span>
                <FilterDateInput
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-[170px] rounded-lg border-slate-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                />
                <span className="text-[15px] text-slate-700 text-gray-300">Đến ngày</span>
                <FilterDateInput
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-[170px] rounded-lg border-slate-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                />
                <FilterButton variant="primary" onClick={handleSearch} className="rounded-lg font-bold">
                    Lọc dữ liệu
                </FilterButton>
                <FilterButton onClick={handleReset} className="rounded-lg font-bold">
                    Làm mới
                </FilterButton>
            </FilterBar>

            {/* ── KPI Cards ── */}
            {data && (
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-4">
                    <StatMetricCard icon="📦" value={data.totalProducts || 0}
                                    label="Tổng sản phẩm"
                                    circleClass="bg-blue-500 text-white" />
                    <StatMetricCard icon="📊" value={Number(data.totalStockValue || 0).toLocaleString('vi-VN')}
                                    label="Tổng lượng tồn kho (sản phẩm)"
                                    circleClass="bg-green-500 text-white" />
                    <StatMetricCard icon="⚠️" value={data.lowStockProducts || 0}
                                    label="SP dưới định mức"
                                    circleClass="bg-orange-400 text-white" />
                    <StatMetricCard icon="🚫" value={data.zeroStockProducts || 0}
                                    label="SP hết hàng"
                                    circleClass="bg-red-500 text-white" />
                </div>
            )}

            <div className="space-y-5">

                {/* ── Bảng đối soát tồn kho ── */}
                <PanelCard className="overflow-hidden bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
                    <div className="border-b border-slate-200 dark:border-gray-700 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <h3 className="text-[17px] font-black text-slate-900 dark:text-gray-100 uppercase tracking-tight">
                            Bảng đối soát tồn kho
                        </h3>
                        <span className="text-[12px] font-bold text-slate-500 dark:text-gray-400 bg-slate-100 dark:bg-gray-700 px-3 py-1 rounded-full border border-slate-200 dark:border-gray-600">
                            {startDate} ➜ {endDate}
                        </span>
                    </div>

                    {loading ? (
                        <div className="p-20 text-center text-[#1192a8] font-bold animate-pulse">
                            ĐANG TẢI DỮ LIỆU...
                        </div>
                    ) : error ? (
                        <div className="p-20 text-center text-red-400 dark:text-red-400 font-bold">{error}</div>
                    ) : inventoryRows.length === 0 ? (
                        <div className="p-20 text-center text-gray-400 dark:text-gray-600 italic">
                            Không tìm thấy sản phẩm nào trong kỳ.
                        </div>
                    ) : (
                        <StatisticsTable columns={inventoryColumns} rows={inventoryRows} scrollHeight="400px" />
                    )}
                </PanelCard>

                {/* ── Sub-tables ── */}
                <div className="grid grid-cols-1 xl:grid-cols-[450px_1fr] gap-5">

                    {/* ABC Analysis */}
                    <PanelCard className="overflow-hidden bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
                        <div className="border-b border-slate-200 dark:border-gray-700 px-6 py-4 flex items-center gap-2">
                            <span className="w-1 h-4 bg-orange-400 dark:bg-orange-500"></span>
                            <h3 className="text-[17px] font-black text-slate-900 dark:text-gray-100 uppercase tracking-tight">
                                Phân tích phân lớp ABC
                            </h3>
                        </div>
                        <div className="p-6">
                            {loading ? (
                                <div className="p-10 text-center text-orange-300 dark:text-orange-400 font-bold animate-pulse">
                                    ĐANG TẢI PHÂN TÍCH...
                                </div>
                            ) : abcRows.length === 0 ? (
                                <div className="p-10 text-center text-gray-400 dark:text-gray-600 italic">
                                    Không có dữ liệu phân tích ABC.
                                </div>
                            ) : (
                                <StatisticsTable columns={abcColumns} rows={abcRows} scrollHeight="180px" align="center" />
                            )}
                        </div>
                    </PanelCard>

                    {/* Loss Details */}
                    <PanelCard className="overflow-hidden border border-rose-100 dark:border-rose-900/40 bg-rose-50/5 dark:bg-rose-950/10 transition-colors duration-300">
                        <div className="border-b border-rose-100 dark:border-rose-900/40 px-6 py-4 bg-rose-50/30 dark:bg-rose-950/20 flex items-center gap-3">
                            <span className="text-xl">📉</span>
                            <h3 className="text-[17px] font-black text-rose-800 dark:text-rose-300 uppercase tracking-tight">
                                Nhật ký hao tổn & Thất thoát hàng hóa
                            </h3>
                        </div>

                        {loading ? (
                            <div className="p-10 text-center text-rose-300 dark:text-rose-400 font-bold">
                                ĐANG KIỂM TRA SỔ SÁCH...
                            </div>
                        ) : lossRows.length === 0 ? (
                            <div className="p-16 text-center text-gray-400 dark:text-gray-600 italic font-medium">
                                Tuyệt vời! Không ghi nhận bất kỳ khoản hao tổn nào trong kỳ này.
                            </div>
                        ) : (
                            <StatisticsTable columns={lossColumns} rows={lossRows} scrollHeight="300px" />
                        )}

                        <div className="px-6 py-3 bg-white dark:bg-gray-800/50 border-t border-rose-50 dark:border-rose-900/30 text-[10px] text-rose-400 dark:text-rose-500 italic font-bold">
                            * Dữ liệu bao gồm hàng hỏng từ khâu QC và sai lệch âm từ các đợt kiểm kê thực tế.
                        </div>
                    </PanelCard>

                </div>
            </div>
        </div>
    );
}