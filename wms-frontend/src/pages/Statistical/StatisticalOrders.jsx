import React, { useState } from 'react';
import SubTabNav from '../../components/statistical/SubTabNav';
import PanelCard from '../../components/statistical/PanelCard';
import StatisticsTable from '../../components/statistical/StatisticsTable';
import SearchFilterPanel from '../../components/statistical/SearchFilterPanel';

const orderTabs = [
    { id: 'inbound', label: 'Nhập kho (Inbound)' },
    { id: 'outbound', label: 'Xuất kho (Outbound)' },
];

const inboundColumns = [
    { key: 'stt', label: 'STT', minWidth: 80 },
    { key: 'code', label: 'Mã phiếu nhập', minWidth: 150 },
    { key: 'date', label: 'Ngày nhập', minWidth: 150 },
    { key: 'supplier', label: 'Nhà cung cấp', minWidth: 200 },
    { key: 'items', label: 'Số mặt hàng', minWidth: 120 },
    { key: 'total', label: 'Tổng tiền', minWidth: 150 },
    { key: 'status', label: 'Trạng thái', minWidth: 120 },
];

const outboundColumns = [
    { key: 'stt', label: 'STT', minWidth: 80 },
    { key: 'code', label: 'Mã phiếu xuất', minWidth: 150 },
    { key: 'date', label: 'Ngày xuất', minWidth: 150 },
    { key: 'customer', label: 'Khách hàng', minWidth: 200 },
    { key: 'items', label: 'Số mặt hàng', minWidth: 120 },
    { key: 'total', label: 'Tổng tiền', minWidth: 150 },
    { key: 'status', label: 'Trạng thái', minWidth: 120 },
];

export default function StatisticalOrders() {
    const [activeTab, setActiveTab] = useState('inbound');

    const renderTable = () => {
        if (activeTab === 'inbound') {
            return (
                <div className="grid grid-cols-1 gap-5 p-5 xl:grid-cols-[345px_minmax(0,1fr)]">
                    <SearchFilterPanel title="Lọc phiếu nhập" />
                    <PanelCard className="overflow-hidden">
                        <StatisticsTable columns={inboundColumns} rows={[]} scrollHeight="600px" />
                        <div className="p-10 text-center text-gray-400">Dữ liệu mẫu đang được cập nhật...</div>
                    </PanelCard>
                </div>
            );
        }
        return (
            <div className="grid grid-cols-1 gap-5 p-5 xl:grid-cols-[345px_minmax(0,1fr)]">
                <SearchFilterPanel title="Lọc phiếu xuất" />
                <PanelCard className="overflow-hidden">
                    <StatisticsTable columns={outboundColumns} rows={[]} scrollHeight="600px" />
                    <div className="p-10 text-center text-gray-400">Dữ liệu mẫu đang được cập nhật...</div>
                </PanelCard>
            </div>
        );
    };

    return (
        <div className="bg-[#eef3f6]">
            <SubTabNav tabs={orderTabs} activeTab={activeTab} onChange={setActiveTab} />
            {renderTable()}
        </div>
    );
}
