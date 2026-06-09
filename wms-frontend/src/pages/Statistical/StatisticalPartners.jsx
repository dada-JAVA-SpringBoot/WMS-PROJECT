import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SubTabNav from '../../components/statistical/SubTabNav';
import StatisticalCustomers from './StatisticalCustomers';
import StatisticalSuppliers from './StatisticalSuppliers';

import { useWorkspaceRefresh } from '../../hooks/useWorkspaceRefresh';

export default function StatisticalPartners() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('customers');

    const partnerTabs = [
        { id: 'customers', label: t('pages.StatisticalPartners.tabCustomers') },
        { id: 'suppliers', label: t('pages.StatisticalPartners.tabSuppliers') },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'customers':
                return <StatisticalCustomers />;
            case 'suppliers':
                return <StatisticalSuppliers />;
            default:
                return <StatisticalCustomers />;
        }
    };

    return (
        <div className="bg-[#eef3f6] dark:bg-gray-900 transition-colors duration-300">
            <SubTabNav tabs={partnerTabs} activeTab={activeTab} onChange={setActiveTab} />
            {renderContent()}
        </div>
    );
}