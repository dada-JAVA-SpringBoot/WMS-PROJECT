import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import axiosClient from '../../../api/axiosClient';
import FilterBar, { FilterSelect } from '../../../components/statistical/FilterBar';
import FinancialCards from '../../../components/statistical/FinancialCards';
import GroupedBarChart from '../../../components/statistical/charts/GroupedBarChart';
import LineAreaChart   from '../../../components/statistical/charts/LineAreaChart';

const CUR_YEAR = new Date().getFullYear();
const YEARS    = [CUR_YEAR - 2, CUR_YEAR - 1, CUR_YEAR];

export default function RevenueByMonth() {
    const { t } = useTranslation();
    const [year,    setYear]    = useState(String(CUR_YEAR));
    const [summary, setSummary] = useState(null);
    const [detail,  setDetail]  = useState(null);
    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState(null);
    const [profitType, setProfitType] = useState('cashflow');

    const fetchAll = useCallback(async (y) => {
        setLoading(true); setError(null);
        try {
            const [s, d] = await Promise.all([
                axiosClient.get('/api/stats/finance',           { params: { from: `${y}-01-01`, to: `${y}-12-31` } }),
                axiosClient.get('/api/stats/finance/by-month',  { params: { year: y } }),
            ]);
            setSummary(s.data);
            setDetail(d.data);
        } catch (err) {
            setError(err.response?.data?.error || t('pages.RevenueByMonth.loadError'));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => { fetchAll(year); }, []);

    const handleYearChange = (e) => { const y = e.target.value; setYear(y); fetchAll(y); };

    const isActual = profitType === 'actual';

    return (
        <div className="space-y-5 p-5 bg-[#f8f9fa] dark:bg-gray-900 min-h-screen transition-colors duration-300">
            <FilterBar>
                <span className="text-[16px] text-slate-800 dark:text-gray-300">{t('pages.RevenueByMonth.lblSelectYear')}</span>
                <FilterSelect value={year} onChange={handleYearChange} className="w-[90px] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </FilterSelect>

                <span className="text-[16px] text-slate-800 dark:text-gray-300 ml-auto font-medium">{t('pages.RevenueByMonth.lblProfitType')}</span>
                <FilterSelect value={profitType} onChange={e => setProfitType(e.target.value)} className="w-[200px] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
                    <option value="cashflow">{t('pages.RevenueByMonth.optCashflow')}</option>
                    <option value="actual">{t('pages.RevenueByMonth.optActual')}</option>
                </FilterSelect>
            </FilterBar>

            <FinancialCards data={summary} loading={loading} error={error} profitType={profitType} />

            {detail && !loading && (
                <>
                    <div className="dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700 transition-colors">
                        <GroupedBarChart
                            title={t('pages.RevenueByMonth.chartGroupedTitle', { year })}
                            labels={detail.labels}
                            series={[
                                { label: isActual ? t('pages.RevenueByMonth.chartGroupedCogsLabel') : t('pages.RevenueByMonth.chartGroupedCostLabel'), color: '#e6b06e', data: isActual ? detail.cogsData : detail.costData },
                                { label: t('pages.RevenueByMonth.chartGroupedRevenueLabel'), color: '#74b9f5', data: detail.revenueData },
                                { label: t('pages.RevenueByMonth.chartGroupedLossLabel'), color: '#ef4444', data: detail.lossData },
                            ]}
                        />
                    </div>
                    <div className="dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700 transition-colors">
                        <LineAreaChart
                            title={t('pages.RevenueByMonth.chartLineTitle', { year })}
                            labels={detail.labels}
                            series={[
                                { label: isActual ? t('pages.RevenueByMonth.chartLineActualLabel') : t('pages.RevenueByMonth.chartLineNetLabel'), color: '#b68cf0', fill: '#b68cf0', data: isActual ? detail.actualProfitData : detail.profitData },
                            ]}
                        />
                    </div>
                </>
            )}
        </div>
    );
}