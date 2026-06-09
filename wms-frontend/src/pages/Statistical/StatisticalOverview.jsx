import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import axiosClient from '../../api/axiosClient';
import StatMetricCard from '../../components/statistical/StatMetricCard';
import LineAreaChart from '../../components/statistical/charts/LineAreaChart';
import PanelCard from '../../components/statistical/PanelCard';
import StatisticsTable from '../../components/statistical/StatisticsTable';
import { formatNumberByLanguage } from '../../utils/formatters';

import { useWorkspaceRefresh } from '../../hooks/useWorkspaceRefresh';

export default function StatisticalOverview() {
    const { t, i18n } = useTranslation();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axiosClient.get('/api/stats/dashboard');
            setData(res.data);
            setError(null);
        } catch (error) {
            console.error('Không tải được dữ liệu dashboard:', error);
            setError(t('pages.StatisticalOverview.loadError'));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    useWorkspaceRefresh(() => {
        fetchDashboardData();
    });

    if (loading) return <div className="p-5 text-gray-600 dark:text-gray-400 transition-colors duration-300">{t('pages.StatisticalOverview.loading')}</div>;
    if (error) return <div className="p-5 text-red-500 dark:text-red-400 transition-colors duration-300">{error}</div>;

    // Dữ liệu chart từ API
    const chartLabels = (data?.dailyFlow || []).map(f => {
        const val = parseInt(f.label);
        if (isNaN(val)) return f.label;
        const days = {
            en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            vi: ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"]
        };
        const lang = i18n.language.startsWith('vi') ? 'vi' : 'en';
        return days[lang][val - 1] || f.label;
    });
    const chartInbound  = data?.dailyFlow?.map(f => f.inbound)  || [];
    const chartOutbound = data?.dailyFlow?.map(f => f.outbound) || [];

    // Cột cho bảng Top sản phẩm tồn nhiều
    const topStockColumns = [
        { key: 'stt', label: t('pages.StatisticalOverview.colSTT'), minWidth: 60 },
        { key: 'sku', label: t('pages.StatisticalOverview.colSKU'), minWidth: 120 },
        { key: 'name', label: t('pages.StatisticalOverview.colProductName'), minWidth: 260 },
        { key: 'totalStock', label: t('pages.StatisticalOverview.colStock'), minWidth: 120 },
    ];
    const topStockRows = (data?.topStockProducts || []).map((item, i) => ({
        id: i,
        stt: i + 1,
        sku: item.sku,
        name: item.name,
        totalStock: formatNumberByLanguage(item.totalStock),
    }));

    // Cột cho bảng sản phẩm sắp hết hạn
    const expiryColumns = [
        { key: 'stt', label: t('pages.StatisticalOverview.colSTT'), minWidth: 60 },
        { key: 'name', label: t('pages.StatisticalOverview.colProduct'), minWidth: 220 },
        { key: 'batchCode', label: t('pages.StatisticalOverview.colBatchCode'), minWidth: 140 },
        { key: 'expiryDate', label: t('pages.StatisticalOverview.colExpiryDate'), minWidth: 140 },
        { key: 'quantity', label: t('pages.StatisticalOverview.colStock'), minWidth: 100 },
    ];
    const expiryRows = (data?.nearExpiryProducts || []).map((item, i) => ({
        id: i,
        stt: i + 1,
        name: item.name,
        batchCode: item.batchCode,
        expiryDate: item.expiryDate,
        quantity: formatNumberByLanguage(item.quantity),
    }));

    // Cột cho bảng phân bổ theo danh mục
    const categoryColumns = [
        { key: 'stt', label: t('pages.StatisticalOverview.colSTT'), minWidth: 60 },
        { key: 'category', label: t('pages.StatisticalOverview.colCategory'), minWidth: 260 },
        { key: 'totalStock', label: t('pages.StatisticalOverview.colTotalStock'), minWidth: 160 },
    ];
    const categoryRows = (data?.stockByCategory || []).map((item, i) => ({
        id: i,
        stt: i + 1,
        category: item.category,
        totalStock: formatNumberByLanguage(item.totalStock),
    }));

    return (
        <div className="space-y-5 p-5 bg-[#f8f9fa] dark:bg-gray-900 min-h-full transition-colors duration-300">

            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <StatMetricCard 
                    icon="📦" 
                    value={data?.totalSkus || 0} 
                    label={t('pages.StatisticalOverview.lblTotalSkus')} 
                    circleClass="bg-blue-500 text-white" 
                />
                <StatMetricCard 
                    icon="📊" 
                    value={formatNumberByLanguage(data?.totalStockQuantity)} 
                    label={t('pages.StatisticalOverview.lblTotalStockQuantity')} 
                    circleClass="bg-green-500 text-white" 
                />
                <StatMetricCard 
                    icon="🏢" 
                    value={`${data?.warehouseOccupancyRate?.toFixed(1) || 0}%`} 
                    label={t('pages.StatisticalOverview.lblWarehouseOccupancyRate')} 
                    circleClass="bg-purple-500 text-white" 
                />
                <StatMetricCard 
                    icon="⚠️" 
                    value={data?.lowStockCount || 0} 
                    label={t('pages.StatisticalOverview.lblLowStockCount')} 
                    circleClass="bg-red-500 text-white" 
                />
                <StatMetricCard 
                    icon="📥" 
                    value={data?.pendingInbound || 0} 
                    label={t('pages.StatisticalOverview.lblPendingInbound')} 
                    circleClass="bg-orange-400 text-white" 
                />
                <StatMetricCard 
                    icon="📤" 
                    value={data?.pendingOutbound || 0} 
                    label={t('pages.StatisticalOverview.lblPendingOutbound')} 
                    circleClass="bg-indigo-400 text-white" 
                />
            </div>

            {/* Smart Suggestion Alert Bar */}
            <div className="bg-cyan-50/50 dark:bg-cyan-900/20 border border-cyan-100 dark:border-cyan-800 rounded-2xl p-4 flex items-center gap-3 text-cyan-800 dark:text-cyan-300 text-sm font-semibold shadow-sm transition-colors duration-300">
                <span className="text-xl">💡</span>
                <p>
                    {t('pages.StatisticalOverview.lblOptimizationSuggestion')} {t('pages.StatisticalOverview.lblOccupancyCurrentlyAt')} <span className="font-extrabold text-cyan-600 dark:text-cyan-400">{data?.warehouseOccupancyRate?.toFixed(1)}%</span>. 
                    {data?.warehouseOccupancyRate > 75 
                        ? t('pages.StatisticalOverview.txtOccupancyHigh') 
                        : t('pages.StatisticalOverview.txtOccupancyLow')}
                </p>
            </div>

            {/* Chart */}
            {chartLabels.length > 0 && (
                <div className="bg-white dark:bg-gray-800 p-2 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm transition-colors duration-300">
                    <LineAreaChart
                        title={t('pages.StatisticalOverview.lblFlowChartTitle')}
                        labels={chartLabels}
                        series={[
                            { label: t('pages.StatisticalOverview.lblInbound'), data: chartInbound, color: '#10b981', fill: '#d1fae5', strokeWidth: 3 },
                            { label: t('pages.StatisticalOverview.lblOutbound'), data: chartOutbound, color: '#ef4444', fill: '#fee2e2', strokeWidth: 3 },
                        ]}
                        valueFormatter={formatNumberByLanguage}
                    />
                </div>
            )}

            {/* Tables Row: Top tồn kho & Sắp hết hạn */}
            <div className="flex flex-col gap-5">
                <PanelCard className="overflow-hidden">
                    <div className="border-b border-slate-200 dark:border-gray-700 px-6 py-4">
                        <h3 className="text-[17px] font-semibold text-slate-900 dark:text-gray-100">
                            {t('pages.StatisticalOverview.lblTopStockTitle')}
                        </h3>
                    </div>
                    <StatisticsTable columns={topStockColumns} rows={topStockRows} scrollHeight="300px" />
                    {topStockRows.length === 0 && (
                        <div className="p-6 text-center text-gray-400 dark:text-gray-600">{t('pages.StatisticalOverview.noStockData')}</div>
                    )}
                </PanelCard>

                <PanelCard className="overflow-hidden">
                    <div className="border-b border-slate-200 dark:border-gray-700 px-6 py-4">
                        <h3 className="text-[17px] font-semibold text-slate-900 dark:text-gray-100">
                            {t('pages.StatisticalOverview.lblNearExpiryTitle')}
                        </h3>
                    </div>
                    <StatisticsTable columns={expiryColumns} rows={expiryRows} scrollHeight="300px" />
                    {expiryRows.length === 0 && (
                        <div className="p-6 text-center text-gray-400 dark:text-gray-600">{t('pages.StatisticalOverview.noNearExpiryData')}</div>
                    )}
                </PanelCard>
            </div>

            {/* Table: Phân bổ tồn kho theo danh mục */}
            <PanelCard className="overflow-hidden">
                <div className="border-b border-slate-200 dark:border-gray-700 px-6 py-4">
                    <h3 className="text-[17px] font-semibold text-slate-900 dark:text-gray-100">
                        {t('pages.StatisticalOverview.lblStockByCategoryTitle')}
                    </h3>
                </div>
                <StatisticsTable columns={categoryColumns} rows={categoryRows} scrollHeight="300px" />
                {categoryRows.length === 0 && (
                    <div className="p-6 text-center text-gray-400 dark:text-gray-600">{t('pages.StatisticalOverview.noData')}</div>
                )}
            </PanelCard>
        </div>
    );
}
