import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import StatisticalOverview from './Statistical/StatisticalOverview';
import StatisticalInventory from './Statistical/StatisticalInventory';
import StatisticalOrders from './Statistical/StatisticalOrders';
import StatisticalFinance from './Statistical/StatisticalFinance';
import StatisticalPartners from './Statistical/StatisticalPartners';
import TopTabNav from '../components/statistical/TopTabNav';

export default function Statistical() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('overview');

    const topTabs = [
        { id: 'overview', label: t('pages.Statistical.tabOverview') },
        { id: 'inventory', label: t('pages.Statistical.tabInventory') },
        { id: 'orders', label: t('pages.Statistical.tabOrders') },
        { id: 'finance', label: t('pages.Statistical.tabFinance') },
        { id: 'partners', label: t('pages.Statistical.tabPartners') },
    ];

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
