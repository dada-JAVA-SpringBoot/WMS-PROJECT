import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import KPICards from './KPICards';
import InventoryAlerts from './InventoryAlerts';
import QuickActions from './QuickActions';

export default function StorageDashboard({ stats, roles, cycleCounts = [] }) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const activeCounts = cycleCounts.filter(p => p.status !== 'COMPLETED');

    return (
        <div className="space-y-8 animate-in zoom-in duration-500">
            {/* Notifications for assigned tasks */}
            {activeCounts.length > 0 && (
                <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800 p-6 rounded-2xl flex items-center justify-between animate-pulse shadow-lg shadow-orange-100/50 dark:shadow-none transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/40 rounded-full flex items-center justify-center text-2xl">📝</div>
                        <div>
                            <h3 className="font-black text-orange-800 dark:text-orange-400 uppercase text-sm tracking-tight">{t('pages.StorageDashboard.inventoryTask')}</h3>
                            <p className="text-orange-700 dark:text-orange-300 text-xs font-medium">{t('pages.StorageDashboard.inventoryTaskAlert', { count: activeCounts.length })}</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => navigate('/admin/cycle-counting')}
                        className="px-6 py-3 bg-orange-600 dark:bg-orange-700 text-white rounded-xl text-xs font-black hover:bg-orange-700 dark:hover:bg-orange-600 transition-all active:scale-95 shadow-md shadow-orange-200 dark:shadow-none"
                    >
                        {t('pages.StorageDashboard.countNow')}
                    </button>
                </div>
            )}

            {/* Header: Occupancy focus */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col md:flex-row items-center gap-8 transition-colors">
                <div className="relative w-32 h-32 flex-shrink-0">
                    <svg className="w-full h-full" viewBox="0 0 36 36">
                        <path
                            className="text-gray-100 dark:text-gray-700"
                            strokeDasharray="100, 100"
                            strokeWidth="3"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                            className="text-[#1192a8] dark:text-[#38bcd4]"
                            strokeDasharray={`${stats?.warehouseOccupancyRate || 0}, 100`}
                            strokeWidth="3"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-black text-gray-800 dark:text-gray-100">{stats?.warehouseOccupancyRate || 0}%</span>
                        <span className="text-[8px] font-bold text-gray-400 dark:text-gray-500 uppercase">{t('pages.StorageDashboard.occupancy')}</span>
                    </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100 uppercase tracking-tight">{t('pages.StorageDashboard.storageManagement')}</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-2xl">
                        {t('pages.StorageDashboard.storageUsageStart')}
                        <span className="font-bold text-[#1192a8] dark:text-[#38bcd4]">{stats?.warehouseOccupancyRate || 0}%</span>
                        {t('pages.StorageDashboard.storageUsageMiddle1')}
                        <span className="font-bold text-orange-600 dark:text-orange-400">{stats?.lowStockCount || 0}</span>
                        {t('pages.StorageDashboard.storageUsageMiddle2')}
                        <span className="font-bold text-red-600 dark:text-red-400">{stats?.nearExpiryProducts?.length || 0}</span>
                        {t('pages.StorageDashboard.storageUsageEnd')}
                    </p>
                </div>
            </div>

            {/* KPIs for Storekeeper */}
            <KPICards data={stats} roles={roles} />

            {/* Critical Alerts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <InventoryAlerts 
                        nearExpiry={stats?.nearExpiryProducts} 
                        topStock={stats?.topStockProducts} 
                    />
                </div>
                
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm transition-colors">
                        <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4 border-b dark:border-gray-700 pb-2">{t('pages.StorageDashboard.warehouseOperations')}</h3>
                        <QuickActions roles={roles} />
                    </div>

                    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 p-6 rounded-2xl transition-colors">
                        <h3 className="font-bold text-orange-800 dark:text-orange-400 mb-2 flex items-center gap-2">
                            <span>💡</span> {t('pages.StorageDashboard.storageTipTitle')}
                        </h3>
                        <p className="text-sm text-orange-700 dark:text-orange-300 leading-relaxed">
                            {t('pages.StorageDashboard.storageTipDesc')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
