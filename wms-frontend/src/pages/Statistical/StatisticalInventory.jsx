import React from 'react';
import SearchFilterPanel from '../../components/statistical/SearchFilterPanel';
import PanelCard from '../../components/statistical/PanelCard';
import StatisticsTable from '../../components/statistical/StatisticsTable';

const inventoryColumns = [
    { key: 'stt', label: 'STT', minWidth: 80 },
    { key: 'code', label: 'Mã SP', minWidth: 110 },
    { key: 'name', label: 'Tên sản phẩm', minWidth: 260 },
    { key: 'opening', label: 'Tồn đầu kỳ', minWidth: 150 },
    { key: 'inbound', label: 'Nhập trong kỳ', minWidth: 160 },
    { key: 'outbound', label: 'Xuất trong kỳ', minWidth: 160 },
    { key: 'ending', label: 'Tồn cuối kỳ', minWidth: 150 },
];

const inventoryRows = [
    { stt: 2, code: 1, name: 'Vivo Y22s', opening: 0, inbound: 16, outbound: 11, ending: 5 },
    { stt: 3, code: 2, name: 'Samsung Galaxy A53 5G', opening: 0, inbound: 20, outbound: 17, ending: 3 },
    { stt: 4, code: 3, name: 'iPhone 13 mini', opening: 0, inbound: 19, outbound: 13, ending: 6 },
    { stt: 5, code: 4, name: 'Vivo Y02s', opening: 0, inbound: 15, outbound: 1, ending: 14 },
    { stt: 6, code: 5, name: 'Samsung Galaxy A54 5G', opening: 0, inbound: 45, outbound: 6, ending: 39 },
    { stt: 7, code: 6, name: 'Samsung Galaxy A13', opening: 0, inbound: 30, outbound: 3, ending: 27 },
    { stt: 8, code: 7, name: 'Xiaomi Redmi Note 12', opening: 0, inbound: 25, outbound: 3, ending: 22 },
    { stt: 9, code: 8, name: 'Xiaomi Redmi 12C', opening: 0, inbound: 0, outbound: 0, ending: 0 },
    { stt: 10, code: 9, name: 'Samsung Galaxy S20 FE', opening: 0, inbound: 9, outbound: 3, ending: 6 },
    { stt: 11, code: 10, name: 'Samsung Galaxy A23', opening: 0, inbound: 10, outbound: 0, ending: 10 },
    { stt: 12, code: 11, name: 'Realme 10', opening: 0, inbound: 10, outbound: 10, ending: 0 },
    { stt: 13, code: 12, name: 'Vivo Y21', opening: 0, inbound: 8, outbound: 0, ending: 8 },
    { stt: 14, code: 13, name: 'Samsung Galaxy S22+ 5G', opening: 0, inbound: 20, outbound: 0, ending: 20 },
    { stt: 15, code: 14, name: 'OPPO Reno6 Pro 5G', opening: 0, inbound: 13, outbound: 6, ending: 7 },
    { stt: 16, code: 15, name: 'OPPO A95', opening: 0, inbound: 7, outbound: 2, ending: 5 },
    { stt: 17, code: 17, name: 'Samsung Galaxy A53 5G S', opening: 0, inbound: 5, outbound: 0, ending: 5 },
].map((item, index) => ({ id: index + 1, ...item }));

export default function StatisticalInventory() {
    return (
        <div className="grid min-h-[calc(100vh-120px)] grid-cols-1 gap-5 p-5 xl:grid-cols-[345px_minmax(0,1fr)]">
            <SearchFilterPanel title="Tìm kiếm sản phẩm" searchLabel="" />
            <PanelCard className="overflow-hidden">
                <StatisticsTable columns={inventoryColumns} rows={inventoryRows} scrollHeight="780px" />
            </PanelCard>
        </div>
    );
}
