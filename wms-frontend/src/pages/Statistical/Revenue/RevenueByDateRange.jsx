import React, { useState, useEffect, useCallback } from 'react';
import axiosClient from '../../../api/axiosClient';
import FilterBar, { FilterButton, FilterDateInput, FilterSelect } from '../../../components/statistical/FilterBar';
import FinancialCards from '../../../components/statistical/FinancialCards';
import GroupedBarChart from '../../../components/statistical/charts/GroupedBarChart';
import LineAreaChart   from '../../../components/statistical/charts/LineAreaChart';

const today    = new Date().toISOString().split('T')[0];
const sevenAgo = new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0];

export default function RevenueByDateRange() {
    const [from, setFrom]       = useState(sevenAgo);
    const [to,   setTo]         = useState(today);
    const [summary, setSummary] = useState(null);
    const [detail,  setDetail]  = useState(null);
    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState(null);
    const [profitType, setProfitType] = useState('cashflow');

    const fetchAll = useCallback(async (f, t) => {
        setLoading(true); setError(null);
        try {
            const [s, d] = await Promise.all([
                axiosClient.get('/api/stats/finance',        { params: { from: f, to: t } }),
                axiosClient.get('/api/stats/finance/by-day', { params: { from: f, to: t } }),
            ]);
            setSummary(s.data);
            setDetail(d.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAll(from, to); }, []);

    const handleFilter = () => {
        if (from > to) { setError('Ngày bắt đầu không được lớn hơn ngày kết thúc'); return; }
        fetchAll(from, to);
    };
    const handleReset = () => { setFrom(sevenAgo); setTo(today); fetchAll(sevenAgo, today); };

    const isActual = profitType === 'actual';

    return (
        <div className="space-y-5 p-5">
            <FilterBar>
                <span className="text-[16px] text-slate-800">Từ ngày</span>
                <FilterDateInput value={from} onChange={e => setFrom(e.target.value)} className="w-[170px]" />
                <span className="text-[16px] text-slate-800">Đến ngày</span>
                <FilterDateInput value={to}   onChange={e => setTo(e.target.value)}   className="w-[170px]" />
                <FilterButton variant="primary" onClick={handleFilter}>Thống kê</FilterButton>
                <FilterButton onClick={handleReset}>Làm mới</FilterButton>

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
                        title="Chi phí, Doanh thu & Hao hụt"
                        labels={detail.labels}
                        series={[
                            { label: isActual ? 'Giá vốn hàng bán (COGS)' : 'Chi phí (Nhập)', color: '#e6b06e', data: isActual ? detail.cogsData : detail.costData },
                            { label: 'Doanh thu (Xuất)', color: '#74b9f5', data: detail.revenueData },
                            { label: 'Hao hụt (Thất thoát)', color: '#ef4444', data: detail.lossData },
                        ]}
                    />
                    <LineAreaChart
                        title="Xu hướng lợi nhuận"
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