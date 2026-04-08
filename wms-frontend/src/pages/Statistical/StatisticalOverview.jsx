import React from 'react';
import StatMetricCard from '../../components/statistical/StatMetricCard';
import LineAreaChart from '../../components/statistical/charts/LineAreaChart';
import PanelCard from '../../components/statistical/PanelCard';
import StatisticsTable from '../../components/statistical/StatisticsTable';

const overviewRows = [
    { id: 1, date: '2023-05-04', capital: '24.600.000đ', revenue: '28.500.000đ', profit: '3.900.000đ' },
    { id: 2, date: '2023-05-05', capital: '33.000.000đ', revenue: '36.890.000đ', profit: '3.890.000đ' },
    { id: 3, date: '2023-05-06', capital: '16.000.000đ', revenue: '18.000.000đ', profit: '2.000.000đ' },
    { id: 4, date: '2023-05-07', capital: '15.000.000đ', revenue: '17.370.000đ', profit: '2.370.000đ' },
    { id: 5, date: '2023-05-08', capital: '32.000.000đ', revenue: '36.000.000đ', profit: '4.000.000đ' },
    { id: 6, date: '2023-05-09', capital: '15.000.000đ', revenue: '16.000.000đ', profit: '1.000.000đ' },
    { id: 7, date: '2023-05-10', capital: '25.000.000đ', revenue: '28.000.000đ', profit: '3.000.000đ' },
    { id: 8, date: '2023-05-11', capital: '0đ', revenue: '0đ', profit: '0đ' },
];

const overviewColumns = [
    { key: 'date', label: 'Ngày', minWidth: 220 },
    { key: 'capital', label: 'Vốn', minWidth: 220 },
    { key: 'revenue', label: 'Doanh thu', minWidth: 220 },
    { key: 'profit', label: 'Lợi nhuận', minWidth: 220 },
];

export default function StatisticalOverview() {
    return (
        <div className="space-y-5 p-5">
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
                <StatMetricCard icon="📱" value="14" label="Sản phẩm hiện có trong kho" circleClass="bg-[#58d7a7] text-white" />
                <StatMetricCard icon="👨‍💼" value="18" label="Khách từ trước đến nay" circleClass="bg-[#d7dbe0]" />
                <StatMetricCard icon="👨‍🔧" value="5" label="Nhân viên đang hoạt động" circleClass="bg-[#d6ebe5]" />
            </div>

            <LineAreaChart
                title="Thống kê doanh thu 8 ngày gần nhất"
                labels={['2023-05-04', '2023-05-05', '2023-05-06', '2023-05-07', '2023-05-08', '2023-05-09', '2023-05-10', '2023-05-11']}
                series={[
                    { label: 'Vốn', data: [24600000, 33000000, 16000000, 15000000, 32000000, 15000000, 25000000, 0], color: '#2563eb', fill: '#93c5fd', strokeWidth: 4 },
                    { label: 'Doanh thu', data: [28500000, 36890000, 18000000, 17370000, 36000000, 16000000, 28000000, 0], color: '#4c1d95', fill: '#a78bfa', strokeWidth: 4 },
                    { label: 'Lợi nhuận', data: [3900000, 3890000, 2000000, 2370000, 4000000, 1000000, 3000000, 0], color: '#ea580c', strokeWidth: 3 },
                ]}
                yTicks={5}
            />

            <PanelCard>
                <StatisticsTable columns={overviewColumns} rows={overviewRows} scrollHeight="310px" />
            </PanelCard>
        </div>
    );
}
