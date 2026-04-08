import React from 'react';
import FilterBar, { FilterButton, FilterDateInput } from '../../../components/statistical/FilterBar';
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
    { id: 1, date: '2023-04-25', capital: '18.000.000đ', revenue: '22.400.000đ', profit: '4.400.000đ' },
    { id: 2, date: '2023-04-26', capital: '21.500.000đ', revenue: '25.900.000đ', profit: '4.400.000đ' },
    { id: 3, date: '2023-04-27', capital: '19.500.000đ', revenue: '23.100.000đ', profit: '3.600.000đ' },
    { id: 4, date: '2023-04-28', capital: '26.000.000đ', revenue: '30.600.000đ', profit: '4.600.000đ' },
    { id: 5, date: '2023-04-29', capital: '12.400.000đ', revenue: '15.800.000đ', profit: '3.400.000đ' },
    { id: 6, date: '2023-04-30', capital: '14.000.000đ', revenue: '17.400.000đ', profit: '3.400.000đ' },
    { id: 7, date: '2023-05-01', capital: '9.000.000đ', revenue: '11.000.000đ', profit: '2.000.000đ' },
    { id: 8, date: '2023-05-02', capital: '46.400.000đ', revenue: '54.800.000đ', profit: '8.400.000đ' },
].map((item, index) => ({ ...item, id: index + 1 }));

export default function RevenueByDateRange() {
    return (
        <div className="space-y-5 p-5">
            <FilterBar>
                <span className="text-[16px] text-slate-800">Từ ngày</span>
                <FilterDateInput defaultValue="2023-04-25" className="w-[170px]" />
                <span className="text-[16px] text-slate-800">Đến ngày</span>
                <FilterDateInput defaultValue="2023-05-02" className="w-[170px]" />
                <FilterButton variant="primary">Thống kê</FilterButton>
                <FilterButton>Làm mới</FilterButton>
                <FilterButton>Xuất Excel</FilterButton>
            </FilterBar>

            <GroupedBarChart
                labels={['25/04', '26/04', '27/04', '28/04', '29/04', '30/04', '01/05', '02/05']}
                series={[
                    { label: 'Vốn', color: '#e6b06e', data: [18000000, 21500000, 19500000, 26000000, 12400000, 14000000, 9000000, 46400000] },
                    { label: 'Doanh thu', color: '#74b9f5', data: [22400000, 25900000, 23100000, 30600000, 15800000, 17400000, 11000000, 54800000] },
                    { label: 'Lợi nhuận', color: '#b68cf0', data: [4400000, 4400000, 3600000, 4600000, 3400000, 3400000, 2000000, 8400000] },
                ]}
                maxValue={80000000}
                yTicks={8}
            />

            <PanelCard>
                <StatisticsTable columns={columns} rows={rows} scrollHeight="340px" />
            </PanelCard>
        </div>
    );
}
