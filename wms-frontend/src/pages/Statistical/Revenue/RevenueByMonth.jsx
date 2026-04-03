import React from 'react';
import FilterBar, { FilterButton, FilterSelect } from '../../../components/statistical/FilterBar';
import GroupedBarChart from '../../../components/statistical/charts/GroupedBarChart';
import PanelCard from '../../../components/statistical/PanelCard';
import StatisticsTable from '../../../components/statistical/StatisticsTable';

const columns = [
    { key: 'month', label: 'Tháng', minWidth: 220 },
    { key: 'capital', label: 'Chi phí', minWidth: 220 },
    { key: 'revenue', label: 'Doanh thu', minWidth: 220 },
    { key: 'profit', label: 'Lợi nhuận', minWidth: 220 },
];

const rows = [
    { id: 1, month: 'Tháng 1', capital: '0đ', revenue: '0đ', profit: '0đ' },
    { id: 2, month: 'Tháng 2', capital: '0đ', revenue: '0đ', profit: '0đ' },
    { id: 3, month: 'Tháng 3', capital: '0đ', revenue: '0đ', profit: '0đ' },
    { id: 4, month: 'Tháng 4', capital: '346.000.000đ', revenue: '384.500.000đ', profit: '38.500.000đ' },
    { id: 5, month: 'Tháng 5', capital: '258.200.000đ', revenue: '299.060.000đ', profit: '40.860.000đ' },
    { id: 6, month: 'Tháng 6', capital: '0đ', revenue: '0đ', profit: '0đ' },
    { id: 7, month: 'Tháng 7', capital: '0đ', revenue: '0đ', profit: '0đ' },
    { id: 8, month: 'Tháng 8', capital: '0đ', revenue: '0đ', profit: '0đ' },
    { id: 9, month: 'Tháng 9', capital: '0đ', revenue: '0đ', profit: '0đ' },
    { id: 10, month: 'Tháng 10', capital: '0đ', revenue: '0đ', profit: '0đ' },
    { id: 11, month: 'Tháng 11', capital: '0đ', revenue: '0đ', profit: '0đ' },
    { id: 12, month: 'Tháng 12', capital: '0đ', revenue: '0đ', profit: '0đ' },
];

export default function RevenueByMonth() {
    return (
        <div className="space-y-5 p-5">
            <FilterBar>
                <span className="text-[16px] text-slate-800">Chọn năm thống kê</span>
                <FilterSelect defaultValue="2023" className="w-[74px]">
                    <option value="2021">2021</option>
                    <option value="2022">2022</option>
                    <option value="2023">2023</option>
                    <option value="2024">2024</option>
                </FilterSelect>
                <FilterButton>Xuất Excel</FilterButton>
            </FilterBar>

            <GroupedBarChart
                labels={['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12']}
                                series={[
                    { label: 'Vốn', color: '#e6b06e', data: [0, 0, 0, 346000000, 258200000, 0, 0, 0, 0, 0, 0, 0] },
                    { label: 'Doanh thu', color: '#74b9f5', data: [0, 0, 0, 384500000, 299060000, 0, 0, 0, 0, 0, 0, 0] },
                    { label: 'Lợi nhuận', color: '#b68cf0', data: [0, 0, 0, 38500000, 40860000, 0, 0, 0, 0, 0, 0, 0] },
                ]}
                maxValue={500000000}
                yTicks={10}
            />

            <PanelCard>
                <StatisticsTable columns={columns} rows={rows} scrollHeight="340px" />
            </PanelCard>
        </div>
    );
}
