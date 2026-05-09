import React from 'react';
import SearchFilterPanel from '../../components/statistical/SearchFilterPanel';
import PanelCard from '../../components/statistical/PanelCard';
import StatisticsTable from '../../components/statistical/StatisticsTable';

const customerColumns = [
    { key: 'stt', label: 'STT', minWidth: 90 },
    { key: 'code', label: 'Mã cửa hàng', minWidth: 160 },
    { key: 'name', label: 'Tên cửa hàng/Đại lý', minWidth: 280 },
    { key: 'orders', label: 'Số lượng đơn nhận', minWidth: 170 },
    { key: 'total', label: 'Tổng giá trị hàng', minWidth: 190 },
];

const customerRows = [
    { stt: 1, code: 'CH-001', name: 'Cửa hàng Quận 1 - Nguyễn Văn A', orders: 2, total: '66.000.000đ' },
    { stt: 2, code: 'CH-003', name: 'Đại lý Hoàng Gia Bơ', orders: 3, total: '60.290.000đ' },
    { stt: 3, code: 'CH-004', name: 'Cửa hàng Tiện Lợi Hưng Phú', orders: 3, total: '73.400.000đ' },
];

export default function StatisticalCustomers() {
    return (
        <div className="grid min-h-[calc(100vh-120px)] grid-cols-1 gap-5 p-5 xl:grid-cols-[345px_minmax(0,1fr)]">
            <SearchFilterPanel title="Tìm kiếm cửa hàng" searchLabel="" />
            <PanelCard className="overflow-hidden">
                <StatisticsTable columns={customerColumns} rows={customerRows} scrollHeight="780px" />
            </PanelCard>
        </div>
    );
}
