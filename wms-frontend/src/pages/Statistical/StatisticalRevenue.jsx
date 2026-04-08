import React, { useState } from 'react';
import SubTabNav from '../../components/statistical/SubTabNav';
import RevenueByYear from './Revenue/RevenueByYear';
import RevenueByMonth from './Revenue/RevenueByMonth';
import RevenueByDayInMonth from './Revenue/RevenueByDayInMonth';
import RevenueByDateRange from './Revenue/RevenueByDateRange';

const revenueTabs = [
    { id: 'year', label: 'Thống kê theo năm' },
    { id: 'month', label: 'Thống kê từng tháng trong năm' },
    { id: 'dayInMonth', label: 'Thống kê từng ngày trong tháng' },
    { id: 'dateRange', label: 'Thống kê từ ngày đến ngày' },
];

export default function StatisticalRevenue() {
    const [activeTab, setActiveTab] = useState('year');

    const renderContent = () => {
        switch (activeTab) {
            case 'year':
                return <RevenueByYear />;
            case 'month':
                return <RevenueByMonth />;
            case 'dayInMonth':
                return <RevenueByDayInMonth />;
            case 'dateRange':
                return <RevenueByDateRange />;
            default:
                return <RevenueByYear />;
        }
    };

    return (
        <div className="bg-[#eef3f6]">
            <SubTabNav tabs={revenueTabs} activeTab={activeTab} onChange={setActiveTab} />
            {renderContent()}
        </div>
    );
}
