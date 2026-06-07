import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import axiosClient from '../../api/axiosClient';
import PanelCard from '../../components/statistical/PanelCard';
import StatisticsTable from '../../components/statistical/StatisticsTable';
import StatMetricCard from '../../components/statistical/StatMetricCard';
import FilterBar, { FilterButton, FilterDateInput } from '../../components/statistical/FilterBar';
import { formatCurrencyShort, formatCurrencyVN } from '../../components/statistical/charts/chartUtils';

export default function StatisticalInventory() {
    const { t } = useTranslation();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);

    // ── Cột cho bảng tồn kho ──────────────────────────────────────────────
    const inventoryColumns = useMemo(() => [
        { key: 'stt', label: t('pages.StatisticalInventory.colSTT'), minWidth: 60 },
        { key: 'sku', label: t('pages.StatisticalInventory.colSKU'), minWidth: 110 },
        { key: 'name', label: t('pages.StatisticalInventory.colProductName'), minWidth: 260 },
        { key: 'opening', label: t('pages.StatisticalInventory.colOpening'), minWidth: 130 },
        { key: 'inbound', label: t('pages.StatisticalInventory.colInbound'), minWidth: 140 },
        { key: 'outbound', label: t('pages.StatisticalInventory.colOutbound'), minWidth: 140 },
        { key: 'ending', label: t('pages.StatisticalInventory.colEnding'), minWidth: 130 },
        { key: 'abcClass', label: t('pages.StatisticalInventory.colABC'), minWidth: 70 },
    ], [t]);

    // ── Cột cho bảng ABC ──────────────────────────────────────────────────
    const abcColumns = useMemo(() => [
        { key: 'className', label: t('pages.StatisticalInventory.colABCGroup'), minWidth: 80 },
        { key: 'productCount', label: t('pages.StatisticalInventory.colABCCount'), minWidth: 100 },
        { key: 'totalValue', label: t('pages.StatisticalInventory.colABCTotalValue'), minWidth: 160 },
        { key: 'percentage', label: t('pages.StatisticalInventory.colABCPercentage'), minWidth: 120 },
    ], [t]);

    // ── Cột cho bảng hao hụt ──────────────────────────────────────────────
    const lossColumns = useMemo(() => [
        { key: 'date', label: t('pages.StatisticalInventory.colLossDate'), minWidth: 120 },
        { key: 'type', label: t('pages.StatisticalInventory.colLossType'), minWidth: 160 },
        { key: 'product', label: t('pages.StatisticalInventory.colLossProduct'), minWidth: 220 },
        { key: 'quantity', label: t('pages.StatisticalInventory.colLossQuantity'), minWidth: 100 },
        { key: 'reason', label: t('pages.StatisticalInventory.colLossReason'), minWidth: 300 },
        { key: 'reference', label: t('pages.StatisticalInventory.colLossReference'), minWidth: 140 },
    ], [t]);

    // Date range state — mặc định tháng hiện tại
    const today = new Date();
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
            setError(t('pages.StatisticalInventory.loadError'));
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
                <span className="text-[16px] text-slate-800 text-gray-200 font-bold uppercase tracking-wider">{t('pages.StatisticalInventory.lblPeriod')}</span>
                <span className="text-[15px] text-slate-700 text-gray-300">{t('pages.StatisticalInventory.lblFromDate')}</span>
                <FilterDateInput
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-[170px] rounded-lg border-slate-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                />
                <span className="text-[15px] text-slate-700 text-gray-300">{t('pages.StatisticalInventory.lblToDate')}</span>
                <FilterDateInput
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-[170px] rounded-lg border-slate-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                />
                <FilterButton variant="primary" onClick={handleSearch} className="rounded-lg font-bold">
                    {t('pages.StatisticalInventory.btnFilter')}
                </FilterButton>
                <FilterButton onClick={handleReset} className="rounded-lg font-bold">
                    {t('pages.StatisticalInventory.btnReset')}
                </FilterButton>
            </FilterBar>

            {/* ── KPI Cards ── */}
            {data && (
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-4">
                    <StatMetricCard
                        icon="📦"
                        value={data.totalProducts || 0}
                        label={t('pages.StatisticalInventory.lblTotalProducts')}
                        circleClass="bg-blue-500 text-white"
                    />
                    <StatMetricCard
                        icon="📊"
                        value={Number(data.totalStockValue || 0).toLocaleString('vi-VN')}
                        label={t('pages.StatisticalInventory.lblTotalStockValue')}
                        circleClass="bg-green-500 text-white"
                    />
                    <StatMetricCard
                        icon="⚠️"
                        value={data.lowStockProducts || 0}
                        label={t('pages.StatisticalInventory.lblLowStockProducts')}
                        circleClass="bg-orange-400 text-white"
                    />
                    <StatMetricCard
                        icon="🚫"
                        value={data.zeroStockProducts || 0}
                        label={t('pages.StatisticalInventory.lblZeroStockProducts')}
                        circleClass="bg-red-500 text-white"
                    />
                </div>
            )}

            <div className="space-y-5">
                {/* Inventory Table */}
                <PanelCard className="overflow-hidden bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
                    <div className="border-b border-slate-200 dark:border-gray-700 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <h3 className="text-[17px] font-black text-slate-900 dark:text-gray-100 uppercase tracking-tight">
                            {t('pages.StatisticalInventory.tblTitleInventory')}
                        </h3>
                        <span className="text-[12px] font-bold text-slate-500 dark:text-gray-400 bg-slate-100 dark:bg-gray-700 px-3 py-1 rounded-full border border-slate-200 dark:border-gray-600">
                            {startDate} ➜ {endDate}
                        </span>
                    </div>

                    {loading ? (
                        <div className="p-20 text-center text-[#1192a8] font-bold animate-pulse">{t('pages.StatisticalInventory.loadingInventory')}</div>
                    ) : error ? (
                        <div className="p-20 text-center text-red-400 dark:text-red-400 font-bold">{error}</div>
                    ) : inventoryRows.length === 0 ? (
                        <div className="p-20 text-center text-gray-400 dark:text-gray-600 italic">{t('pages.StatisticalInventory.noInventoryData')}</div>
                    ) : (
                        <StatisticsTable columns={inventoryColumns} rows={inventoryRows} scrollHeight="400px" />
                    )}
                </PanelCard>

                {/* ── Sub-tables ── */}
                <div className="grid grid-cols-1 xl:grid-cols-[450px_1fr] gap-5">
                    {/* ABC Analysis Summary */}
                    <PanelCard className="overflow-hidden bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
                        <div className="border-b border-slate-200 dark:border-gray-700 px-6 py-4 flex items-center gap-2">
                            <span className="w-1 h-4 bg-orange-400 dark:bg-orange-500"></span>
                            <h3 className="text-[17px] font-black text-slate-900 dark:text-gray-100 uppercase tracking-tight">
                                {t('pages.StatisticalInventory.tblTitleABC')}
                            </h3>
                        </div>
                        <div className="p-6">
                            {loading ? (
                                <div className="p-10 text-center text-orange-300 dark:text-orange-400 font-bold animate-pulse">{t('pages.StatisticalInventory.loadingABC')}</div>
                            ) : abcRows.length === 0 ? (
                                <div className="p-10 text-center text-gray-400 dark:text-gray-600 italic">{t('pages.StatisticalInventory.noABCData')}</div>
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
                                {t('pages.StatisticalInventory.tblTitleLoss')}
                            </h3>
                        </div>

                        {loading ? (
                            <div className="p-10 text-center text-rose-300 dark:text-rose-400 font-bold">{t('pages.StatisticalInventory.loadingLoss')}</div>
                        ) : lossRows.length === 0 ? (
                            <div className="p-16 text-center text-gray-400 dark:text-gray-600 italic font-medium">
                                {t('pages.StatisticalInventory.noLossData')}
                            </div>
                        ) : (
                            <StatisticsTable columns={lossColumns} rows={lossRows} scrollHeight="300px" />
                        )}
                        <div className="px-6 py-3 bg-white dark:bg-gray-800/50 border-t border-rose-50 dark:border-rose-900/30 text-[10px] text-rose-400 dark:text-rose-500 italic font-bold">
                            {t('pages.StatisticalInventory.lossFootnote')}
                        </div>
                    </PanelCard>

                </div>
            </div>
        </div>
    );
}