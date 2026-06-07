import React from 'react';
import { useTranslation } from 'react-i18next';
import KPICards from './KPICards';
import LineAreaChart from '../statistical/charts/LineAreaChart';
import GroupedBarChart from '../statistical/charts/GroupedBarChart';

export default function ExecutiveDashboard({ stats, roles }) {
    const { t } = useTranslation();
    // Chuẩn bị dữ liệu cho chart
    const chartData = stats?.dailyFlow || [];
    
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* KPIs */}
            <KPICards data={stats} roles={roles} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Chart 1: Dòng chảy hàng hóa */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-[450px] flex flex-col">
                    <h3 className="font-bold text-gray-800 mb-6">{t('pages.ExecutiveDashboard.goodsFlow')}</h3>
                    <div className="flex-1 min-h-0">
                        <LineAreaChart 
                            labels={chartData.map(d => d.label)}
                            series={[
                                { label: t('pages.ExecutiveDashboard.inbound'), data: chartData.map(d => d.inbound), color: '#1192a8', fill: '#1192a8' },
                                { label: t('pages.ExecutiveDashboard.outbound'), data: chartData.map(d => d.outbound), color: '#f43f5e', fill: '#f43f5e' }
                            ]}
                        />
                    </div>
                </div>

                {/* Chart 2: Tồn kho theo danh mục */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-[450px] flex flex-col">
                    <h3 className="font-bold text-gray-800 mb-6">{t('pages.ExecutiveDashboard.stockByCategory')}</h3>
                    <div className="flex-1 min-h-0">
                        <GroupedBarChart 
                            labels={stats?.stockByCategory?.map(c => c.category) || []}
                            series={[
                                { label: t('pages.ExecutiveDashboard.quantity'), data: stats?.stockByCategory?.map(c => c.totalStock) || [], color: '#1192a8' }
                            ]}
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Top Products Card */}
                <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                        <h3 className="font-bold text-gray-800">{t('pages.ExecutiveDashboard.topStockProducts')}</h3>
                    </div>
                    <div className="overflow-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-400 uppercase text-[10px] font-bold">
                                <tr>
                                    <th className="px-6 py-4">{t('pages.ExecutiveDashboard.product')}</th>
                                    <th className="px-6 py-4">{t('pages.ExecutiveDashboard.skuCode')}</th>
                                    <th className="px-6 py-4 text-right">{t('pages.ExecutiveDashboard.totalStock')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {stats?.topStockProducts?.map((p, idx) => (
                                    <tr key={idx} className="hover:bg-blue-50/20 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-800">{p.name}</td>
                                        <td className="px-6 py-4 text-gray-500 font-mono text-xs">{p.sku}</td>
                                        <td className="px-6 py-4 text-right font-black text-[#1192a8]">{p.totalStock}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* System Summary */}
                <div className="bg-gradient-to-br from-[#1192a8] to-[#0e7c8a] p-8 rounded-2xl text-white shadow-xl shadow-teal-100 flex flex-col justify-center">
                    <div className="mb-6">
                        <h3 className="text-xl font-bold mb-2">{t('pages.ExecutiveDashboard.operationsSummary')}</h3>
                        <p className="text-teal-50 text-sm opacity-80">{t('pages.ExecutiveDashboard.realtimeUpdate')}</p>
                    </div>
                    <div className="space-y-4">
                        <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                            <div className="text-xs uppercase font-bold opacity-60 mb-1">{t('pages.ExecutiveDashboard.occupancyRate')}</div>
                            <div className="text-3xl font-black">{stats?.warehouseOccupancyRate || 0}%</div>
                        </div>
                        <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                            <div className="text-xs uppercase font-bold opacity-60 mb-1">{t('pages.ExecutiveDashboard.lowStockItems')}</div>
                            <div className="text-3xl font-black">{stats?.lowStockCount || 0}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
