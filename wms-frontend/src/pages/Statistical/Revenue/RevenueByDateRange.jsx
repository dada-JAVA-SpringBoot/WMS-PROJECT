import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import axiosClient from '../../../api/axiosClient';
import FilterBar, { FilterButton, FilterDateInput, FilterSelect } from '../../../components/statistical/FilterBar';
import FinancialCards from '../../../components/statistical/FinancialCards';
import GroupedBarChart from '../../../components/statistical/charts/GroupedBarChart';
import LineAreaChart   from '../../../components/statistical/charts/LineAreaChart';

const today    = new Date().toISOString().split('T')[0];
const sevenAgo = new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0];

export default function RevenueByDateRange() {
    const { t } = useTranslation();
    const [from, setFrom]       = useState(sevenAgo);
    const [to,   setTo]         = useState(today);
    const [summary, setSummary] = useState(null);
    const [detail,  setDetail]  = useState(null);
    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState(null);
    const [profitType, setProfitType] = useState('cashflow');

    const fetchAll = useCallback(async (f, toVal) => {
        setLoading(true); setError(null);
        try {
            const [s, d] = await Promise.all([
                axiosClient.get('/api/stats/finance',        { params: { from: f, to: toVal } }),
                axiosClient.get('/api/stats/finance/by-day', { params: { from: f, to: toVal } }),
            ]);
            setSummary(s.data);
            setDetail(d.data);
        } catch (err) {
            setError(err.response?.data?.error || t('pages.RevenueByDateRange.loadError'));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => { fetchAll(from, to); }, []);

    const handleFilter = () => {
        if (from > to) { setError(t('pages.RevenueByDateRange.validationDate')); return; }
        fetchAll(from, to);
    };
    const handleReset = () => { setFrom(sevenAgo); setTo(today); fetchAll(sevenAgo, today); };

    const isActual = profitType === 'actual';

    return (
        <div className="space-y-5 p-5 bg-[#f8f9fa] dark:bg-gray-900 min-h-screen transition-colors duration-300">
            <FilterBar>
                <span className="text-[16px] text-slate-800 dark:text-gray-300">{t('pages.RevenueByDateRange.lblFromDate')}</span>
                <FilterDateInput value={from} onChange={e => setFrom(e.target.value)} className="w-[170px] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" />
                <span className="text-[16px] text-slate-800 dark:text-gray-300">{t('pages.RevenueByDateRange.lblToDate')}</span>
                <FilterDateInput value={to}   onChange={e => setTo(e.target.value)}   className="w-[170px] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" />
                <FilterButton variant="primary" onClick={handleFilter}>{t('pages.RevenueByDateRange.btnFilter')}</FilterButton>
                <FilterButton onClick={handleReset}>{t('pages.RevenueByDateRange.btnReset')}</FilterButton>

                <span className="text-[16px] text-slate-800 dark:text-gray-300 ml-auto font-medium">{t('pages.RevenueByDateRange.lblProfitType')}</span>
                <FilterSelect value={profitType} onChange={e => setProfitType(e.target.value)} className="w-[200px] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
                    <option value="cashflow">{t('pages.RevenueByDateRange.optCashflow')}</option>
                    <option value="actual">{t('pages.RevenueByDateRange.optActual')}</option>
                </FilterSelect>
            </FilterBar>

            {/* FinancialCards cần đảm bảo bên trong component này cũng đã hỗ trợ Dark Mode */}
            <FinancialCards data={summary} loading={loading} error={error} profitType={profitType} />

            {detail && !loading && (
                <>
                    <div className="dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700 transition-colors">
                        <GroupedBarChart
                            title={t('pages.RevenueByDateRange.chartGroupedTitle')}
                            labels={detail.labels}
                            series={[
                                { label: isActual ? t('pages.RevenueByDateRange.chartGroupedCogsLabel') : t('pages.RevenueByDateRange.chartGroupedCostLabel'), color: '#e6b06e', data: isActual ? detail.cogsData : detail.costData },
                                { label: t('pages.RevenueByDateRange.chartGroupedRevenueLabel'), color: '#74b9f5', data: detail.revenueData },
                                { label: t('pages.RevenueByDateRange.chartGroupedLossLabel'), color: '#ef4444', data: detail.lossData },
                            ]}
                        />
                    </div>
                    <div className="dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700 transition-colors">
                        <LineAreaChart
                            title={t('pages.RevenueByDateRange.chartLineTitle')}
                            labels={detail.labels}
                            series={[
                                { label: isActual ? t('pages.RevenueByDateRange.chartLineActualLabel') : t('pages.RevenueByDateRange.chartLineNetLabel'), color: '#b68cf0', fill: '#b68cf0', data: isActual ? detail.actualProfitData : detail.profitData },
                            ]}
                        />
                    </div>
                </>
            )}
        </div>
    );
}