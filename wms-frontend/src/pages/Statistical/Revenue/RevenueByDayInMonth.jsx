import React from 'react';
import FilterBar, { FilterButton, FilterSelect } from '../../../components/statistical/FilterBar';
import GroupedBarChart from '../../../components/statistical/charts/GroupedBarChart';
import PanelCard from '../../../components/statistical/PanelCard';
import StatisticsTable from '../../../components/statistical/StatisticsTable';

const columns = [
    { key: 'date', label: 'Ngày', minWidth: 220 },
    { key: 'capital', label: 'Chi phí', minWidth: 220 },
    { key: 'revenue', label: 'Doanh thu', minWidth: 220 },
    { key: 'profit', label: 'Lợi nhuận', minWidth: 220 },
];

const rows = [
    { id: 1, date: '2023-05-01', capital: '9.000.000đ', revenue: '11.000.000đ', profit: '2.000.000đ' },
    { id: 2, date: '2023-05-02', capital: '46.400.000đ', revenue: '54.800.000đ', profit: '8.400.000đ' },
    { id: 3, date: '2023-05-03', capital: '41.600.000đ', revenue: '51.200.000đ', profit: '9.600.000đ' },
    { id: 4, date: '2023-05-04', capital: '24.600.000đ', revenue: '28.500.000đ', profit: '3.900.000đ' },
    { id: 5, date: '2023-05-05', capital: '33.000.000đ', revenue: '36.890.000đ', profit: '3.890.000đ' },
    { id: 6, date: '2023-05-06', capital: '16.000.000đ', revenue: '18.000.000đ', profit: '2.000.000đ' },
    { id: 7, date: '2023-05-07', capital: '15.000.000đ', revenue: '17.370.000đ', profit: '2.370.000đ' },
    { id: 8, date: '2023-05-08', capital: '32.000.000đ', revenue: '36.000.000đ', profit: '4.000.000đ' },
].map((item, index) => ({ ...item, id: index + 1 }));

export default function RevenueByDayInMonth() {
    return (
        <div className="space-y-5 p-5">
            <FilterBar>
                <span className="text-[16px] text-slate-800">Chọn tháng</span>
                <FilterSelect defaultValue="5" className="w-[120px]">
                    {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>{`Tháng ${i + 1}`}</option>
                    ))}
                </FilterSelect>
                <span className="text-[16px] text-slate-800">Chọn năm</span>
                <FilterSelect defaultValue="2023" className="w-[90px]">
                    <option value="2022">2022</option>
                    <option value="2023">2023</option>
                    <option value="2024">2024</option>
                </FilterSelect>
                <FilterButton variant="primary">Thống kê</FilterButton>
                <FilterButton>Xuất Excel</FilterButton>
            </FilterBar>

            <GroupedBarChart
                labels={['Ngày 1->3', 'Ngày 4->6', 'Ngày 7->9', 'Ngày 10->12', 'Ngày 13->15', 'Ngày 16->18', 'Ngày 19->21', 'Ngày 22->24', 'Ngày 25->27', 'Ngày 28->30']}
                                series={[
                    { label: 'Vốn', color: '#e6b06e', data: [97000000, 73600000, 61000000, 24600000, 0, 0, 0, 0, 0, 0] },
                    { label: 'Doanh thu', color: '#74b9f5', data: [117000000, 83390000, 69260000, 28500000, 0, 0, 0, 0, 0, 0] },
                    { label: 'Lợi nhuận', color: '#b68cf0', data: [20000000, 9790000, 8890000, 3900000, 0, 0, 0, 0, 0, 0] },
                ]}
                maxValue={200000000}
                yTicks={10}
            />

            <PanelCard>
                <StatisticsTable columns={columns} rows={rows} scrollHeight="340px" />
            </PanelCard>
        </div>
    );
}
