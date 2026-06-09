import React from 'react';
import { useTranslation } from 'react-i18next';

export default function InventoryAlerts({ nearExpiry, topStock }) {
    const { t } = useTranslation();
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Sắp hết hạn */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden transition-colors">
                <div className="p-4 border-b border-gray-50 dark:border-gray-700 bg-orange-50/50 dark:bg-orange-900/20">
                    <h3 className="font-bold text-orange-800 dark:text-orange-400 flex items-center gap-2">
                        <span>⚠️</span> {t('pages.InventoryAlerts.nearExpiry')}
                    </h3>
                </div>
                <div className="overflow-auto max-h-[300px]">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold">
                            <tr>
                                <th className="px-4 py-3">{t('pages.InventoryAlerts.product')}</th>
                                <th className="px-4 py-3">{t('pages.InventoryAlerts.batch')}</th>
                                <th className="px-4 py-3">{t('pages.InventoryAlerts.expiryDate')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {nearExpiry?.length > 0 ? nearExpiry.map((item, idx) => (
                                <tr key={idx} className="hover:bg-orange-50/20">
                                    <td className="px-4 py-3 font-medium text-gray-700">{item.name}</td>
                                    <td className="px-4 py-3 text-gray-500">{item.batchCode}</td>
                                    <td className="px-4 py-3 text-red-600 font-bold">
                                        {new Date(item.expiryDate).toLocaleDateString('vi-VN')}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="3" className="px-4 py-8 text-center text-gray-400">{t('pages.InventoryAlerts.noNearExpiry')}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Tồn kho nhiều nhất */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden transition-colors">
                <div className="p-4 border-b border-gray-50 dark:border-gray-700 bg-blue-50/50 dark:bg-blue-900/20">
                    <h3 className="font-bold text-blue-800 dark:text-blue-400 flex items-center gap-2">
                        <span>📊</span> {t('pages.InventoryAlerts.topStock')}
                    </h3>
                </div>
                <div className="overflow-auto max-h-[300px]">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold">
                            <tr>
                                <th className="px-4 py-3">{t('pages.InventoryAlerts.product')}</th>
                                <th className="px-4 py-3 text-right">{t('pages.InventoryAlerts.quantity')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {topStock?.length > 0 ? topStock.map((item, idx) => (
                                <tr key={idx} className="hover:bg-blue-50/20">
                                    <td className="px-4 py-3 font-medium text-gray-700">{item.name}</td>
                                    <td className="px-4 py-3 text-right font-bold text-blue-600">
                                        {item.totalStock}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="2" className="px-4 py-8 text-center text-gray-400">{t('pages.InventoryAlerts.noData')}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
