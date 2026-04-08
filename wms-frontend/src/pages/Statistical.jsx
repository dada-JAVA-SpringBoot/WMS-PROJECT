import React, { useState } from 'react';
import StatisticalOverview from './Statistical/StatisticalOverview';
import StatisticalInventory from './Statistical/StatisticalInventory';
import StatisticalRevenue from './Statistical/StatisticalRevenue';
import StatisticalSuppliers from './Statistical/StatisticalSuppliers';
import StatisticalCustomers from './Statistical/StatisticalCustomers';
import TopTabNav from '../components/statistical/TopTabNav';

const topTabs = [
    { id: 'overview', label: 'Tổng quan' },
    { id: 'inventory', label: 'Tồn kho' },
    { id: 'revenue', label: 'Doanh thu' },
    { id: 'suppliers', label: 'Nhà cung cấp' },
    { id: 'customers', label: 'Khách hàng' },
];

export default function Statistical() {
    const [activeTab, setActiveTab] = useState('overview');

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return <StatisticalOverview />;
            case 'inventory':
                return <StatisticalInventory />;
            case 'revenue':
                return <StatisticalRevenue />;
            case 'suppliers':
                return <StatisticalSuppliers />;
            case 'customers':
                return <StatisticalCustomers />;
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
