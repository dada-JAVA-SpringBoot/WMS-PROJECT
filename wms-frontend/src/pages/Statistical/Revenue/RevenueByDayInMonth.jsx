import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import axiosClient from '../../../api/axiosClient';
import FilterBar, { FilterButton, FilterSelect } from '../../../components/statistical/FilterBar';
import FinancialCards from '../../../components/statistical/FinancialCards';
import GroupedBarChart from '../../../components/statistical/charts/GroupedBarChart';
import LineAreaChart   from '../../../components/statistical/charts/LineAreaChart';

const CUR_DATE  = new Date();
const CUR_YEAR  = CUR_DATE.getFullYear();
const CUR_MONTH = CUR_DATE.getMonth() + 1;
const YEARS     = [CUR_YEAR - 1, CUR_YEAR];

function daysInMonth(m, y) { return new Date(y, m, 0).getDate(); }
function pad(n) { return String(n).padStart(2, '0'); }

export default function RevenueByDayInMonth() {
    const { t } = useTranslation();
    const [month,   setMonth]   = useState(String(CUR_MONTH));
    const [year,    setYear]    = useState(String(CUR_YEAR));
    const [summary, setSummary] = useState(null);
    const [detail,  setDetail]  = useState(null);
    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState(null);
    const [profitType, setProfitType] = useState('cashflow');

    const fetchAll = useCallback(async (m, y) => {
        setLoading(true); setError(null);
        const lastDay = daysInMonth(Number(m), Number(y));
        const from    = `${y}-${pad(m)}-01`;
        const to      = `${y}-${pad(m)}-${pad(lastDay)}`;
        try {
            const [s, d] = await Promise.all([
                axiosClient.get('/api/stats/finance',        { params: { from, to } }),
                axiosClient.get('/api/stats/finance/by-day', { params: { from, to } }),
            ]);
            setSummary(s.data);
            setDetail(d.data);
        } catch (err) {
            setError(err.response?.data?.error || t('pages.RevenueByDayInMonth.loadError'));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => { fetchAll(month, year); }, []);

    const handleFilter = () => fetchAll(month, year);

    const isActual = profitType === 'actual';

    return (
        <div className="space-y-5 p-5 bg-[#f8f9fa] dark:bg-gray-900 min-h-screen transition-colors duration-300">
            <FilterBar>
                <span className="text-[16px] text-slate-800 dark:text-gray-300">{t('pages.RevenueByDayInMonth.lblSelectMonth')}</span>
                <FilterSelect value={month} onChange={e => setMonth(e.target.value)} className="w-[120px] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
                    {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>{t('pages.RevenueByDayInMonth.optMonth', { val: i + 1 })}</option>
                    ))}
                </FilterSelect>
                <span className="text-[16px] text-slate-800 dark:text-gray-300">{t('pages.RevenueByDayInMonth.lblSelectYear')}</span>
                <FilterSelect value={year} onChange={e => setYear(e.target.value)} className="w-[90px] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </FilterSelect>
                <FilterButton variant="primary" onClick={handleFilter}>{t('pages.RevenueByDayInMonth.btnFilter')}</FilterButton>

                <span className="text-[16px] text-slate-800 dark:text-gray-300 ml-auto font-medium">{t('pages.RevenueByDayInMonth.lblProfitType')}</span>
                <FilterSelect value={profitType} onChange={e => setProfitType(e.target.value)} className="w-[200px] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
                    <option value="cashflow">{t('pages.RevenueByDayInMonth.optCashflow')}</option>
                    <option value="actual">{t('pages.RevenueByDayInMonth.optActual')}</option>
                </FilterSelect>
            </FilterBar>

            <FinancialCards data={summary} loading={loading} error={error} profitType={profitType} />

            {detail && !loading && (
                <>
                    <div className="dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700 transition-colors">
                        <GroupedBarChart
                            title={t('pages.RevenueByDayInMonth.chartGroupedTitle', { month, year })}
                            labels={detail.labels}
                            series={[
                                { label: isActual ? t('pages.RevenueByDayInMonth.chartGroupedCogsLabel') : t('pages.RevenueByDayInMonth.chartGroupedCostLabel'), color: '#e6b06e', data: isActual ? detail.cogsData : detail.costData },
                                { label: t('pages.RevenueByDayInMonth.chartGroupedRevenueLabel'), color: '#74b9f5', data: detail.revenueData },
                                { label: t('pages.RevenueByDayInMonth.chartGroupedLossLabel'), color: '#ef4444', data: detail.lossData },
                            ]}
                        />
                    </div>
                    <div className="dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700 transition-colors">
                        <LineAreaChart
                            title={t('pages.RevenueByDayInMonth.chartLineTitle', { month, year })}
                            labels={detail.labels}
                            series={[
                                { label: isActual ? t('pages.RevenueByDayInMonth.chartLineActualLabel') : t('pages.RevenueByDayInMonth.chartLineNetLabel'), color: '#b68cf0', fill: '#b68cf0', data: isActual ? detail.actualProfitData : detail.profitData },
                            ]}
                        />
                    </div>
                </>
            )}
        </div>
    );
}