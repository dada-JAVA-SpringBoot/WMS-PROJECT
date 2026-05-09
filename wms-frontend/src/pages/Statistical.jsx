import React, { useState } from 'react';
import StatisticalOverview from './Statistical/StatisticalOverview';
import StatisticalInventory from './Statistical/StatisticalInventory';
import StatisticalOrders from './Statistical/StatisticalOrders';
import StatisticalFinance from './Statistical/StatisticalFinance';
import StatisticalPartners from './Statistical/StatisticalPartners';
import TopTabNav from '../components/statistical/TopTabNav';

const topTabs = [
    { id: 'overview', label: 'Dashboard' },
    { id: 'inventory', label: 'Tồn kho & ABC' },
    { id: 'orders', label: 'Nhập - Xuất' },
    { id: 'finance', label: 'Tài chính' },
    { id: 'partners', label: 'Đối tác' },
];

export default function Statistical() {
    const [activeTab, setActiveTab] = useState('overview');

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return <StatisticalOverview />;
            case 'inventory':
                return <StatisticalInventory />;
            case 'orders':
                return <StatisticalOrders />;
            case 'finance':
                return <StatisticalFinance />;
            case 'partners':
                return <StatisticalPartners />;
            default:
                return <StatisticalOverview />;
        }
    };

    return (
        <div className="min-h-full bg-[#eef3f6]">
            <TopTabNav tabs={topTabs} activeTab={activeTab} onChange={setActiveTab} />
            <div className="min-h-[calc(100vh-73px)]">{renderContent()}</div>
        </div>
    );
}
