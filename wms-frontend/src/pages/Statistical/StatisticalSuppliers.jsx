import React from 'react';
import SearchFilterPanel from '../../components/statistical/SearchFilterPanel';
import PanelCard from '../../components/statistical/PanelCard';
import StatisticsTable from '../../components/statistical/StatisticsTable';

const supplierColumns = [
    { key: 'stt', label: 'STT', minWidth: 90 },
    { key: 'code', label: 'Mã nhà cung cấp', minWidth: 190 },
    { key: 'name', label: 'Tên nhà cung cấp', minWidth: 340 },
    { key: 'orders', label: 'Số lượng nhập', minWidth: 170 },
    { key: 'total', label: 'Tổng số tiền', minWidth: 190 },
];

const supplierRows = [
    { stt: 1, code: 1, name: 'Công Ty TNHH Thế Giới Di Động', orders: 10, total: '483.000.000đ' },
    { stt: 2, code: 2, name: 'Công ty Vivo Việt Nam', orders: 2, total: '47.500.000đ' },
    { stt: 3, code: 3, name: 'Công Ty TNHH Bao La', orders: 1, total: '35.000.000đ' },
    { stt: 4, code: 5, name: 'Hệ Thống Phân Phối Chính Hãng Xiaomi', orders: 2, total: '170.000.000đ' },
    { stt: 5, code: 6, name: 'Công Ty Samsung Việt Nam', orders: 4, total: '863.300.000đ' },
    { stt: 6, code: 7, name: 'Công ty Oppo Việt Nam', orders: 1, total: '187.500.000đ' },
].map((item, index) => ({ id: index + 1, ...item }));

export default function StatisticalSuppliers() {
    return (
        <div className="grid min-h-[calc(100vh-120px)] grid-cols-1 gap-5 p-5 xl:grid-cols-[345px_minmax(0,1fr)]">
            <SearchFilterPanel title="Tìm kiếm nhà cung cấp" searchLabel="" />
            <PanelCard className="overflow-hidden">
                <StatisticsTable columns={supplierColumns} rows={supplierRows} scrollHeight="780px" />
            </PanelCard>
        </div>
    );
}
