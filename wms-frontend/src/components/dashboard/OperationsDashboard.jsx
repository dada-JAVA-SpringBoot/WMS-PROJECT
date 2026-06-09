import React from 'react';
import { useTranslation } from 'react-i18next';
import QuickActions from './QuickActions';
import PendingTaskTable from './PendingTaskTable';
import inboundIcon from '../common/icons/inbound.png';
import outboundIcon from '../common/icons/outbound.png';

export default function OperationsDashboard({ roles, stats, inboundOrders, outboundOrders, cycleCounts = [] }) {
    const { t } = useTranslation();
    return (
        <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
            {/* Notifications for assigned tasks */}
            {cycleCounts.length > 0 && (
                <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800 p-6 rounded-2xl flex items-center justify-between animate-pulse">
                    <div className="flex items-center gap-4">
                        <div className="text-3xl">📝</div>
                        <div>
                            <h3 className="font-black text-orange-800 dark:text-orange-400 uppercase text-sm">{t('pages.OperationsDashboard.newInventoryTask')}</h3>
                            <p className="text-orange-700 dark:text-orange-300 text-xs">{t('pages.OperationsDashboard.inventoryCountAlert', { count: cycleCounts.length })}</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => window.location.href = '/admin/cycle-counting'}
                        className="px-6 py-2 bg-orange-600 dark:bg-orange-700 text-white rounded-xl text-xs font-black hover:bg-orange-700 dark:hover:bg-orange-600 transition-colors"
                    >
                        {t('pages.OperationsDashboard.goToInventoryPage')}
                    </button>
                </div>
            )}

            {/* Quick Access Section */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm transition-colors">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100 uppercase tracking-tight">{t('pages.OperationsDashboard.operationsCenter')}</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">{t('pages.OperationsDashboard.operationsCenterDesc')}</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="px-6 py-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800 flex items-center gap-3 transition-colors">
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">{stats?.pendingInbound || 0}</div>
                            <span className="text-blue-700 dark:text-blue-400 font-bold text-sm uppercase">{t('pages.OperationsDashboard.pendingInbound')}</span>
                        </div>
                        <div className="px-6 py-3 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-800 flex items-center gap-3 transition-colors">
                            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">{stats?.pendingOutbound || 0}</div>
                            <span className="text-red-700 dark:text-red-400 font-bold text-sm uppercase">{t('pages.OperationsDashboard.pendingOutbound')}</span>
                        </div>
                    </div>
                </div>
                <QuickActions roles={roles} />
            </div>

            {/* Main Workspace */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 h-[600px]">
                {/* Inbound Queue */}
                <div className="flex flex-col bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden transition-colors">
                    <div className="p-6 border-b border-gray-50 dark:border-gray-700 flex items-center gap-4 bg-gradient-to-r from-blue-50 dark:from-blue-900/20 to-white dark:to-gray-800">
                        <img src={inboundIcon} className="w-8 h-8 object-contain dark:invert dark:hue-rotate-180 dark:opacity-90" alt="Inbound" />
                        <h3 className="font-black text-gray-800 dark:text-gray-100 uppercase tracking-tight">{t('pages.OperationsDashboard.incomingOrPendingInbound')}</h3>
                    </div>
                    <div className="flex-1 overflow-auto">
                        <PendingTaskTable 
                            title={t('pages.OperationsDashboard.inboundTicketsList')} 
                            data={inboundOrders} 
                            type="inbound" 
                        />
                    </div>
                </div>

                {/* Outbound Queue */}
                <div className="flex flex-col bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden transition-colors">
                    <div className="p-6 border-b border-gray-50 dark:border-gray-700 flex items-center gap-4 bg-gradient-to-r from-red-50 dark:from-red-900/20 to-white dark:to-gray-800">
                        <img src={outboundIcon} className="w-8 h-8 object-contain dark:invert dark:hue-rotate-180 dark:opacity-90" alt="Outbound" />
                        <h3 className="font-black text-gray-800 dark:text-gray-100 uppercase tracking-tight">{t('pages.OperationsDashboard.pickingOrPendingOutbound')}</h3>
                    </div>
                    <div className="flex-1 overflow-auto">
                        <PendingTaskTable 
                            title={t('pages.OperationsDashboard.outboundTicketsList')} 
                            data={outboundOrders} 
                            type="outbound" 
                        />
                    </div>
                </div>
            </div>

            {/* Productivity Tips */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <TipCard 
                    icon="🔍" 
                    title={t('pages.OperationsDashboard.quickSearchTitle')} 
                    desc={t('pages.OperationsDashboard.quickSearchDesc')} 
                />
                <TipCard 
                    icon="📦" 
                    title={t('pages.OperationsDashboard.fefoRuleTitle')} 
                    desc={t('pages.OperationsDashboard.fefoRuleDesc')} 
                />
                <TipCard 
                    icon="📱" 
                    title={t('pages.OperationsDashboard.barcodeScanTitle')} 
                    desc={t('pages.OperationsDashboard.barcodeScanDesc')} 
                />
            </div>
        </div>
    );
}

function TipCard({ icon, title, desc }) {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:border-[#1192a8] dark:hover:border-[#38bcd4] transition-colors group">
            <div className="text-3xl mb-4 group-hover:scale-110 transition-transform inline-block">{icon}</div>
            <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-2">{title}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
        </div>
    );
}
