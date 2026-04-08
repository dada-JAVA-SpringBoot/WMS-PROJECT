import React from 'react';
import FilterBar, { FilterButton, FilterInput } from '../../../components/statistical/FilterBar';
import GroupedBarChart from '../../../components/statistical/charts/GroupedBarChart';
import PanelCard from '../../../components/statistical/PanelCard';
import StatisticsTable from '../../../components/statistical/StatisticsTable';

const columns = [
    { key: 'year', label: 'Năm', minWidth: 220 },
    { key: 'capital', label: 'Vốn', minWidth: 220 },
    { key: 'revenue', label: 'Doanh thu', minWidth: 220 },
    { key: 'profit', label: 'Lợi nhuận', minWidth: 220 },
];

const rows = [
    { id: 1, year: '2018', capital: '0đ', revenue: '0đ', profit: '0đ' },
    { id: 2, year: '2019', capital: '0đ', revenue: '0đ', profit: '0đ' },
    { id: 3, year: '2020', capital: '0đ', revenue: '0đ', profit: '0đ' },
    { id: 4, year: '2021', capital: '0đ', revenue: '0đ', profit: '0đ' },
    { id: 5, year: '2022', capital: '0đ', revenue: '0đ', profit: '0đ' },
    { id: 6, year: '2023', capital: '604.200.000đ', revenue: '683.560.000đ', profit: '79.360.000đ' },
];

export default function RevenueByYear() {
    return (
        <div className="space-y-5 p-5">
            <FilterBar>
                <span className="text-[16px] text-slate-800">Từ năm</span>
                <FilterInput className="w-[74px]" placeholder="" />
                <span className="text-[16px] text-slate-800">Đến năm</span>
                <FilterInput className="w-[74px]" placeholder="" />
                <FilterButton variant="primary">Thống kê</FilterButton>
                <FilterButton>Làm mới</FilterButton>
                <FilterButton>Xuất excel</FilterButton>
            </FilterBar>

            <GroupedBarChart
                labels={['Năm 2018', 'Năm 2019', 'Năm 2020', 'Năm 2021', 'Năm 2022', 'Năm 2023']}
                                series={[
                    { label: 'Vốn', color: '#e6b06e', data: [0, 0, 0, 0, 0, 604200000] },
                    { label: 'Doanh thu', color: '#74b9f5', data: [0, 0, 0, 0, 0, 683560000] },
                    { label: 'Lợi nhuận', color: '#b68cf0', data: [0, 0, 0, 0, 0, 79360000] },
                ]}
                maxValue={1000000000}
                yTicks={10}
            />

            <PanelCard>
                <StatisticsTable columns={columns} rows={rows} scrollHeight="340px" />
            </PanelCard>
        </div>
    );
}
