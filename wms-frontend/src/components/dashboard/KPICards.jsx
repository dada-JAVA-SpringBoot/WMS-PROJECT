import React from 'react';
import { useTranslation } from 'react-i18next';
import StatMetricCard from '../statistical/StatMetricCard';
import inboundIcon from '../common/icons/inbound.png';
import outboundIcon from '../common/icons/outbound.png';
import productIcon from '../common/icons/product.png';
import warehouseIcon from '../common/icons/warehouse.png';

export default function KPICards({ data, roles }) {
    const { t } = useTranslation();
    if (!data) return null;

    const isAdminOrManager = roles.includes('ADMIN') || roles.includes('MANAGER');

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
            <StatMetricCard
                icon={<img src={productIcon} className="w-10 h-10 object-contain" alt="Products" />}
                value={data.totalSkus || 0}
                label={t('pages.KPICards.totalSkus')}
                circleClass="bg-blue-50"
            />
            <StatMetricCard
                icon={<img src={warehouseIcon} className="w-10 h-10 object-contain" alt="Stock" />}
                value={Math.round(data.totalStockQuantity || 0)}
                label={t('pages.KPICards.totalStock')}
                circleClass="bg-green-50"
            />
            <StatMetricCard
                icon={<img src={inboundIcon} className="w-10 h-10 object-contain" alt="Inbound" />}
                value={data.pendingInbound || 0}
                label={t('pages.KPICards.pendingInbound')}
                circleClass="bg-yellow-50"
            />
            <StatMetricCard
                icon={<img src={outboundIcon} className="w-10 h-10 object-contain" alt="Outbound" />}
                value={data.pendingOutbound || 0}
                label={t('pages.KPICards.pendingOutbound')}
                circleClass="bg-red-50"
            />
            {isAdminOrManager && (
                <>
                    <StatMetricCard
                        icon={<span className="text-2xl font-bold text-teal-600">%</span>}
                        value={`${Math.round(data.warehouseOccupancyRate || 0)}%`}
                        label={t('pages.KPICards.occupancyRate')}
                        circleClass="bg-teal-50"
                    />
                    <StatMetricCard
                        icon={<span className="text-2xl font-bold text-orange-600">!</span>}
                        value={data.lowStockCount || 0}
                        label={t('pages.KPICards.lowStock')}
                        circleClass="bg-orange-50"
                    />
                </>
            )}
        </div>
    );
}
