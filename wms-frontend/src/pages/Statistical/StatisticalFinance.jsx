import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SubTabNav from '../../components/statistical/SubTabNav';
import RevenueByYear from './Revenue/RevenueByYear';
import RevenueByMonth from './Revenue/RevenueByMonth';
import RevenueByDayInMonth from './Revenue/RevenueByDayInMonth';
import RevenueByDateRange from './Revenue/RevenueByDateRange';

import { useWorkspaceRefresh } from '../../hooks/useWorkspaceRefresh';

export default function StatisticalFinance() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('year');

    // Cần thêm logic fetch dữ liệu nếu cần, nhưng trang này là wrapper
    // Nếu các trang con cần làm mới, chúng nên tự implement hook hoặc nhận prop
    useWorkspaceRefresh(() => {
        // Tự động làm mới khi đổi công ty
    });

    const revenueTabs = [
        { id: 'year', label: t('pages.StatisticalFinance.tabYear') },
        { id: 'month', label: t('pages.StatisticalFinance.tabMonth') },
        { id: 'dayInMonth', label: t('pages.StatisticalFinance.tabDayInMonth') },
        { id: 'dateRange', label: t('pages.StatisticalFinance.tabDateRange') },
    ];

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