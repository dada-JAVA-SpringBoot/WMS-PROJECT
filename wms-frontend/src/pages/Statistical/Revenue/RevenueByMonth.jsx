import React, { useState, useEffect, useCallback } from 'react';
import axiosClient from '../../../api/axiosClient';
import FilterBar, { FilterSelect } from '../../../components/statistical/FilterBar';
import FinancialCards from '../../../components/statistical/FinancialCards';
import GroupedBarChart from '../../../components/statistical/charts/GroupedBarChart';
import LineAreaChart   from '../../../components/statistical/charts/LineAreaChart';

const CUR_YEAR = new Date().getFullYear();
const YEARS    = [CUR_YEAR - 2, CUR_YEAR - 1, CUR_YEAR];

export default function RevenueByMonth() {
    const [year,    setYear]    = useState(String(CUR_YEAR));
    const [summary, setSummary] = useState(null);
    const [detail,  setDetail]  = useState(null);
    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState(null);

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
            setError(err.response?.data?.error || 'Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAll(year); }, []);

    const handleYearChange = (e) => { const y = e.target.value; setYear(y); fetchAll(y); };

    return (
        <div className="space-y-5 p-5">
            <FilterBar>
                <span className="text-[16px] text-slate-800">Chọn năm thống kê</span>
                <FilterSelect value={year} onChange={handleYearChange} className="w-[90px]">
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </FilterSelect>
            </FilterBar>

            <FinancialCards data={summary} loading={loading} error={error} />

            {detail && !loading && (
                <>
                    <GroupedBarChart
                        title={`Chi phí, Doanh thu & Hao hụt — Năm ${year}`}
                        labels={detail.labels}
                        series={[
                            { label: 'Chi phí (Nhập)', color: '#e6b06e', data: detail.costData    },
                            { label: 'Doanh thu (Xuất)', color: '#74b9f5', data: detail.revenueData },
                            { label: 'Hao hụt (Thất thoát)', color: '#ef4444', data: detail.lossData },
                        ]}
                    />
                    <LineAreaChart
                        title={`Xu hướng lợi nhuận — ${year}`}
                        labels={detail.labels}
                        series={[
                            { label: 'Lợi nhuận', color: '#b68cf0', fill: '#b68cf0', data: detail.profitData },
                        ]}
                    />
                </>
            )}
        </div>
    );
}