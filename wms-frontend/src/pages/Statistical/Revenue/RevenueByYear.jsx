import React, { useState, useEffect, useCallback } from 'react';
import axiosClient from '../../../api/axiosClient';
import FilterBar, { FilterButton, FilterInput, FilterSelect } from '../../../components/statistical/FilterBar';
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

    const isActual = profitType === 'actual';

    return (
        <div className="space-y-5 p-5 bg-[#f8f9fa] dark:bg-gray-900 min-h-screen transition-colors duration-300">
            <FilterBar className="dark:bg-gray-800 dark:border-gray-700">
                <span className="text-[16px] text-slate-800 dark:text-gray-300">Từ năm</span>
                <FilterInput value={fromYear} onChange={e => setFromYear(e.target.value)} className="w-[74px] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" placeholder="2018" />
                <span className="text-[16px] text-slate-800 dark:text-gray-300">Đến năm</span>
                <FilterInput value={toYear}   onChange={e => setToYear(e.target.value)}   className="w-[74px] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" placeholder="2024" />
                <FilterButton variant="primary" onClick={handleFilter}>Thống kê</FilterButton>
                <FilterButton onClick={handleReset} className="dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">Làm mới</FilterButton>

                <span className="text-[16px] text-slate-800 dark:text-gray-300 ml-auto font-medium">Loại lợi nhuận</span>
                <FilterSelect value={profitType} onChange={e => setProfitType(e.target.value)} className="w-[200px] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
                    <option value="cashflow">Theo dòng tiền (Chi/Thu)</option>
                    <option value="actual">Lợi nhuận thực tế (COGS)</option>
                </FilterSelect>
            </FilterBar>

            <FinancialCards data={summary} loading={loading} error={error} profitType={profitType} />

            {detail && !loading && (
                <>
                    <div className="dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700 transition-colors">
                        <GroupedBarChart
                            title="Chi phí, Doanh thu & Hao hụt theo năm"
                            labels={detail.labels}
                            series={[
                                { label: isActual ? 'Giá vốn hàng bán (COGS)' : 'Chi phí (Nhập)', color: '#e6b06e', data: isActual ? detail.cogsData : detail.costData },
                                { label: 'Doanh thu (Xuất)', color: '#74b9f5', data: detail.revenueData },
                                { label: 'Hao hụt (Thất thoát)', color: '#ef4444', data: detail.lossData },
                            ]}
                        />
                    </div>
                    <div className="dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700 transition-colors">
                        <LineAreaChart
                            title="Xu hướng lợi nhuận theo năm"
                            labels={detail.labels}
                            series={[
                                { label: isActual ? 'Lợi nhuận thực tế' : 'Lợi nhuận dòng', color: '#b68cf0', fill: '#b68cf0', data: isActual ? detail.actualProfitData : detail.profitData },
                            ]}
                        />
                    </div>
                </>
            )}
        </div>
    );
}