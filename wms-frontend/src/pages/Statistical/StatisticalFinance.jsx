import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SubTabNav from '../../components/statistical/SubTabNav';
import RevenueByYear from './Revenue/RevenueByYear';
import RevenueByMonth from './Revenue/RevenueByMonth';
import RevenueByDayInMonth from './Revenue/RevenueByDayInMonth';
import RevenueByDateRange from './Revenue/RevenueByDateRange';

export default function StatisticalFinance() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('year');

    const revenueTabs = [
        { id: 'year', label: t('pages.StatisticalFinance.tabYear') },
        { id: 'month', label: t('pages.StatisticalFinance.tabMonth') },
        { id: 'dayInMonth', label: t('pages.StatisticalFinance.tabDayInMonth') },
        { id: 'dateRange', label: t('pages.StatisticalFinance.tabDateRange') },
    ];

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
