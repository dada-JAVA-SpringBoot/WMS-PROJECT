import React, { useState, useEffect, useCallback } from 'react';
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
            setError(err.response?.data?.error || 'Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAll(month, year); }, []);

    const handleFilter = () => fetchAll(month, year);

    const isActual = profitType === 'actual';

    return (
        <div className="space-y-5 p-5">
            <FilterBar>
                <span className="text-[16px] text-slate-800">Chọn tháng</span>
                <FilterSelect value={month} onChange={e => setMonth(e.target.value)} className="w-[120px]">
                    {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>{`Tháng ${i + 1}`}</option>
                    ))}
                </FilterSelect>
                <span className="text-[16px] text-slate-800">Chọn năm</span>
                <FilterSelect value={year} onChange={e => setYear(e.target.value)} className="w-[90px]">
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </FilterSelect>
                <FilterButton variant="primary" onClick={handleFilter}>Thống kê</FilterButton>

                <span className="text-[16px] text-slate-800 ml-auto font-medium">Loại lợi nhuận</span>
                <FilterSelect value={profitType} onChange={e => setProfitType(e.target.value)} className="w-[200px]">
                    <option value="cashflow">Theo dòng tiền (Chi/Thu)</option>
                    <option value="actual">Lợi nhuận thực tế (COGS)</option>
                </FilterSelect>
            </FilterBar>

            <FinancialCards data={summary} loading={loading} error={error} profitType={profitType} />

            {detail && !loading && (
                <>
                    <GroupedBarChart
                        title={`Chi phí, Doanh thu & Hao hụt — Tháng ${month}/${year}`}
                        labels={detail.labels}
                        series={[
                            { label: isActual ? 'Giá vốn hàng bán (COGS)' : 'Chi phí (Nhập)', color: '#e6b06e', data: isActual ? detail.cogsData : detail.costData },
                            { label: 'Doanh thu (Xuất)', color: '#74b9f5', data: detail.revenueData },
                            { label: 'Hao hụt (Thất thoát)', color: '#ef4444', data: detail.lossData },
                        ]}
                    />
                    <LineAreaChart
                        title={`Xu hướng lợi nhuận — Tháng ${month}/${year}`}
                        labels={detail.labels}
                        series={[
                            { label: isActual ? 'Lợi nhuận thực tế' : 'Lợi nhuận dòng', color: '#b68cf0', fill: '#b68cf0', data: isActual ? detail.actualProfitData : detail.profitData },
                        ]}
                    />
                </>
            )}
        </div>
    );
}