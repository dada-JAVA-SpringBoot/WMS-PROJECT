import React from 'react';
import { useTranslation } from 'react-i18next';

export default function PendingTaskTable({ title, data, type }) {
    const { t } = useTranslation();
    if (!data || data.length === 0) return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 transition-colors">
            <p>{t('pages.PendingTaskTable.noTasks', { title: title.toLowerCase() })}</p>
        </div>
    );

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden h-full flex flex-col transition-colors">
            <div className="p-4 border-b border-gray-50 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                <h3 className="font-bold text-gray-800 dark:text-gray-200">{title}</h3>
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold px-2 py-1 rounded-full">
                    {data.length}
                </span>
            </div>
            <div className="overflow-auto flex-1">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 uppercase text-[10px] font-bold sticky top-0">
                        <tr>
                            <th className="px-4 py-3">{t('pages.PendingTaskTable.ticketCode')}</th>
                            <th className="px-4 py-3">{t('pages.PendingTaskTable.date')}</th>
                            <th className="px-4 py-3">{t('pages.PendingTaskTable.status')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                        {data.slice(0, 10).map((item) => (
                            <tr key={item.id} className="hover:bg-blue-50/30 dark:hover:bg-gray-700/30 transition-colors">
                                <td className="px-4 py-3 font-medium text-blue-600 dark:text-blue-400">
                                    {type === 'inbound' ? item.receiptCode : item.issueCode}
                                </td>
                                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                                    {new Date(type === 'inbound' ? item.receiptDate : item.issueDate).toLocaleDateString('vi-VN')}
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        item.status === 'DRAFT' ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' :
                                        item.status === 'PENDING' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                                        item.status === 'ALLOCATED' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                                        'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                    }`}>
                                        {item.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}