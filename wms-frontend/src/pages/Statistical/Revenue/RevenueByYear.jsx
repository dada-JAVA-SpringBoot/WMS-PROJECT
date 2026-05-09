import React, { useState, useEffect, useCallback } from 'react';
import axiosClient from '../../../api/axiosClient';
import FilterBar, { FilterButton, FilterInput } from '../../../components/statistical/FilterBar';
import FinancialCards from '../../../components/statistical/FinancialCards';
import GroupedBarChart from '../../../components/statistical/charts/GroupedBarChart';
import LineAreaChart   from '../../../components/statistical/charts/LineAreaChart';

const CUR_YEAR = new Date().getFullYear();

export default function RevenueByYear() {
    const [fromYear, setFromYear] = useState(String(CUR_YEAR - 5));
    const [toYear,   setToYear]   = useState(String(CUR_YEAR));
    const [summary,  setSummary]  = useState(null);
    const [detail,   setDetail]   = useState(null);
    const [loading,  setLoading]  = useState(false);
    const [error,    setError]    = useState(null);

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
            setError(err.response?.data?.error || 'Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAll(fromYear, toYear); }, []);

    const handleFilter = () => {
        if (Number(fromYear) > Number(toYear)) { setError('Năm bắt đầu không được lớn hơn năm kết thúc'); return; }
        fetchAll(fromYear, toYear);
    };
    const handleReset = () => { setFromYear(String(CUR_YEAR - 5)); setToYear(String(CUR_YEAR)); fetchAll(CUR_YEAR - 5, CUR_YEAR); };

    return (
        <div className="space-y-5 p-5">
            <FilterBar>
                <span className="text-[16px] text-slate-800">Từ năm</span>
                <FilterInput value={fromYear} onChange={e => setFromYear(e.target.value)} className="w-[74px]" placeholder="2018" />
                <span className="text-[16px] text-slate-800">Đến năm</span>
                <FilterInput value={toYear}   onChange={e => setToYear(e.target.value)}   className="w-[74px]" placeholder="2024" />
                <FilterButton variant="primary" onClick={handleFilter}>Thống kê</FilterButton>
                <FilterButton onClick={handleReset}>Làm mới</FilterButton>
            </FilterBar>

            <FinancialCards data={summary} loading={loading} error={error} />

            {detail && !loading && (
                <>
                    <GroupedBarChart
                        title="Chi phí vs Doanh thu theo năm"
                        labels={detail.labels}
                        series={[
                            { label: 'Chi phí',   color: '#e6b06e', data: detail.costData    },
                            { label: 'Doanh thu', color: '#74b9f5', data: detail.revenueData },
                        ]}
                    />
                    <LineAreaChart
                        title="Xu hướng lợi nhuận theo năm"
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