import React from 'react';
import SearchFilterPanel from '../../components/statistical/SearchFilterPanel';
import PanelCard from '../../components/statistical/PanelCard';
import StatisticsTable from '../../components/statistical/StatisticsTable';

const customerColumns = [
    { key: 'stt', label: 'STT', minWidth: 90 },
    { key: 'code', label: 'Mã khách hàng', minWidth: 160 },
    { key: 'name', label: 'Tên khách hàng', minWidth: 280 },
    { key: 'orders', label: 'Số lượng phiếu', minWidth: 170 },
    { key: 'total', label: 'Tổng số tiền', minWidth: 190 },
];

const customerRows = [
    { stt: 1, code: 1, name: 'Nguyễn Văn A', orders: 2, total: '66.000.000đ' },
    { stt: 2, code: 3, name: 'Hoàng Gia Bơ', orders: 3, total: '60.290.000đ' },
    { stt: 3, code: 4, name: 'Hồ Minh Hưng', orders: 3, total: '73.400.000đ' },
    { stt: 4, code: 30, name: 'Trần Đức Minh', orders: 2, total: '71.300.000đ' },
    { stt: 5, code: 31, name: 'Lê Hải Yến', orders: 1, total: '60.500.000đ' },
    { stt: 6, code: 33, name: 'Hoàng Đức Anh', orders: 1, total: '22.000.000đ' },
    { stt: 7, code: 34, name: 'Ngô Thanh Tùng', orders: 1, total: '36.000.000đ' },
    { stt: 8, code: 35, name: 'Võ Thị Kim Ngân', orders: 1, total: '18.000.000đ' },
    { stt: 9, code: 37, name: 'Lý Thanh Trúc', orders: 4, total: '122.070.000đ' },
    { stt: 10, code: 38, name: 'Bùi Văn Hoàng', orders: 1, total: '22.000.000đ' },
    { stt: 11, code: 39, name: 'Lê Văn Thành', orders: 2, total: '79.700.000đ' },
    { stt: 12, code: 40, name: 'Nguyễn Thị Lan Anh', orders: 1, total: '31.200.000đ' },
    { stt: 13, code: 41, name: 'Phạm Thị Mai', orders: 2, total: '21.100.000đ' },
].map((item, index) => ({ id: index + 1, ...item }));

export default function StatisticalCustomers() {
    return (
        <div className="grid min-h-[calc(100vh-120px)] grid-cols-1 gap-5 p-5 xl:grid-cols-[345px_minmax(0,1fr)]">
            <SearchFilterPanel title="Tìm kiếm khách hàng" searchLabel="" />
            <PanelCard className="overflow-hidden">
                <StatisticsTable columns={customerColumns} rows={customerRows} scrollHeight="780px" />
            </PanelCard>
        </div>
    );
}
