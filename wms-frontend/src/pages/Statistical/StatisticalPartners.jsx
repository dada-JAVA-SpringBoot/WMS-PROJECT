import React, { useState } from 'react';
import SubTabNav from '../../components/statistical/SubTabNav';
import StatisticalCustomers from './StatisticalCustomers';
import StatisticalSuppliers from './StatisticalSuppliers';

const partnerTabs = [
    { id: 'customers', label: 'Cửa hàng / Đại lý' },
    { id: 'suppliers', label: 'Nhà cung cấp' },
];

export default function StatisticalPartners() {
    const [activeTab, setActiveTab] = useState('customers');

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