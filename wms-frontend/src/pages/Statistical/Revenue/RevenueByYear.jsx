import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import axiosClient from '../../../api/axiosClient';
import FilterBar, { FilterButton, FilterInput, FilterSelect } from '../../../components/statistical/FilterBar';
import FinancialCards from '../../../components/statistical/FinancialCards';
import GroupedBarChart from '../../../components/statistical/charts/GroupedBarChart';
import LineAreaChart   from '../../../components/statistical/charts/LineAreaChart';

const CUR_YEAR = new Date().getFullYear();

export default function RevenueByYear() {
    const { t } = useTranslation();
    const [fromYear, setFromYear] = useState(String(CUR_YEAR - 5));
    const [toYear,   setToYear]   = useState(String(CUR_YEAR));
    const [summary,  setSummary]  = useState(null);
    const [detail,   setDetail]   = useState(null);
    const [loading,  setLoading]  = useState(false);
    const [error,    setError]    = useState(null);
    const [profitType, setProfitType] = useState('cashflow');

    const fetchAll = useCallback(async (fy, ty) => {
        setLoading(true); setError(null);
        try {
            const [s, d] = await Promise.all([
                axiosClient.get('/api/stats/finance',          { params: { from: `${fy}-01-01`, to: `${ty}-12-31` } }),
                axiosClient.get('/api/stats/finance/by-year',  { params: { fromYear: fy, toYear: ty } }),
            ]);
            setSummary(s.data);
            setDetail(d.data);
        } catch (err) {
            setError(err.response?.data?.error || t('pages.RevenueByYear.loadError'));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => { fetchAll(fromYear, toYear); }, []);

    const handleFilter = () => {
        if (Number(fromYear) > Number(toYear)) { setError(t('pages.RevenueByYear.validationYear')); return; }
        fetchAll(fromYear, toYear);
    };
    const handleReset = () => { setFromYear(String(CUR_YEAR - 5)); setToYear(String(CUR_YEAR)); fetchAll(CUR_YEAR - 5, CUR_YEAR); };

    const isActual = profitType === 'actual';

    return (
        <div className="space-y-5 p-5 bg-[#f8f9fa] dark:bg-gray-900 min-h-screen transition-colors duration-300">
            <FilterBar>
                <span className="text-[16px] text-slate-800 dark:text-gray-300">{t('pages.RevenueByYear.lblFromYear')}</span>
                <FilterInput value={fromYear} onChange={e => setFromYear(e.target.value)} className="w-[74px] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" placeholder="2018" />
                <span className="text-[16px] text-slate-800 dark:text-gray-300">{t('pages.RevenueByYear.lblToYear')}</span>
                <FilterInput value={toYear}   onChange={e => setToYear(e.target.value)}   className="w-[74px] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" placeholder="2024" />
                <FilterButton variant="primary" onClick={handleFilter}>{t('pages.RevenueByYear.btnFilter')}</FilterButton>
                <FilterButton onClick={handleReset}>{t('pages.RevenueByYear.btnReset')}</FilterButton>

                <span className="text-[16px] text-slate-800 dark:text-gray-300 ml-auto font-medium">{t('pages.RevenueByYear.lblProfitType')}</span>
                <FilterSelect value={profitType} onChange={e => setProfitType(e.target.value)} className="w-[200px] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
                    <option value="cashflow">{t('pages.RevenueByYear.optCashflow')}</option>
                    <option value="actual">{t('pages.RevenueByYear.optActual')}</option>
                </FilterSelect>
            </FilterBar>

            <FinancialCards data={summary} loading={loading} error={error} profitType={profitType} />

            {detail && !loading && (
                <>
                    <div className="dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700 transition-colors">
                        <GroupedBarChart
                            title={t('pages.RevenueByYear.chartGroupedTitle')}
                            labels={detail.labels}
                            series={[
                                { label: isActual ? t('pages.RevenueByYear.chartGroupedCogsLabel') : t('pages.RevenueByYear.chartGroupedCostLabel'), color: '#e6b06e', data: isActual ? detail.cogsData : detail.costData },
                                { label: t('pages.RevenueByYear.chartGroupedRevenueLabel'), color: '#74b9f5', data: detail.revenueData },
                                { label: t('pages.RevenueByYear.chartGroupedLossLabel'), color: '#ef4444', data: detail.lossData },
                            ]}
                        />
                    </div>
                    <div className="dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700 transition-colors">
                        <LineAreaChart
                            title={t('pages.RevenueByYear.chartLineTitle')}
                            labels={detail.labels}
                            series={[
                                { label: isActual ? t('pages.RevenueByYear.chartLineActualLabel') : t('pages.RevenueByYear.chartLineNetLabel'), color: '#b68cf0', fill: '#b68cf0', data: isActual ? detail.actualProfitData : detail.profitData },
                            ]}
                        />
                    </div>
                </>
            )}
        </div>
    );
}