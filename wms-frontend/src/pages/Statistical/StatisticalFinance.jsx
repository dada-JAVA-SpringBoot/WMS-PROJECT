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

export default function StatisticalFinance() {
    const [activeTab, setActiveTab] = useState('year');

    const renderContent = () => {
        switch (activeTab) {
            case 'year': return <RevenueByYear />;
            case 'month': return <RevenueByMonth />;
            case 'dayInMonth': return <RevenueByDayInMonth />;
            case 'dateRange': return <RevenueByDateRange />;
            default: return <RevenueByYear />;
        }
    };

    return (
        // Thêm dark:bg-gray-900 để đồng bộ nền với các component con
        <div className="bg-[#eef3f6] dark:bg-gray-900 min-h-screen transition-colors duration-300">
            {/* Lưu ý: Component SubTabNav cũng cần được cập nhật class
               để hỗ trợ dark mode (ví dụ: dark:border-gray-700)
            */}
            <SubTabNav tabs={revenueTabs} activeTab={activeTab} onChange={setActiveTab} />

            <div className="p-4">
                {renderContent()}
            </div>
        </div>
    );
}