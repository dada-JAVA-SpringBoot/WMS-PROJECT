import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatCurrencyShort, formatCurrencyVN, getDisplayLanguage } from './charts/chartUtils';

const CARDS = [
    { key: 'totalCost',    label: 'Chi phí (Nhập)',    icon: '📦', circle: 'bg-[#fee2e2]' },
    { key: 'totalRevenue', label: 'Doanh thu (Xuất)',  icon: '💰', circle: 'bg-[#dbeafe]' },
    { key: 'totalLoss',    label: 'Thất thoát (Hao hụt)', icon: '📉', circle: 'bg-[#ffedd5]' },
    { key: 'profit',       label: 'Lợi nhuận ròng',  icon: '📈', circle: 'bg-[#d1fae5]' },
];

export default function FinancialCards({ data, loading, error, profitType = 'cashflow' }) {
    const { i18n } = useTranslation();
    const isEnglish = getDisplayLanguage(i18n.language) === 'en';

    if (error) {
        return (
            <div className="rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30 px-5 py-4 text-[15px] text-red-600 dark:text-red-400">
                {error}
            </div>
        );
    }

    const isActual = profitType === 'actual';
    const cards = [
        { 
            key: isActual ? 'totalCogs' : 'totalCost', 
            label: isActual ? (isEnglish ? 'Cost of Goods Sold (COGS)' : 'Giá vốn hàng bán (COGS)') : (isEnglish ? 'Cost (Inbound)' : 'Chi phí (Nhập)'), 
            icon: '📦', 
            circle: 'bg-[#fee2e2] dark:bg-[#fee2e2]/20' 
        },
        { key: 'totalRevenue', label: isEnglish ? 'Revenue (Outbound)' : 'Doanh thu (Xuất)',  icon: '💰', circle: 'bg-[#dbeafe] dark:bg-[#dbeafe]/20' },
        { key: 'totalLoss',    label: isEnglish ? 'Loss & Damage' : 'Thất thoát (Hao hụt)', icon: '📉', circle: 'bg-[#ffedd5] dark:bg-[#ffedd5]/20' },
        { 
            key: isActual ? 'actualProfit' : 'profit', 
            label: isActual ? (isEnglish ? 'Actual Profit' : 'Lợi nhuận thực tế') : (isEnglish ? 'Net Profit (Cash Flow)' : 'Lợi nhuận dòng (Dòng tiền)'), 
            icon: '📈', 
            circle: 'bg-[#d1fae5] dark:bg-[#d1fae5]/20' 
        },
    ];

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map(({ key, label, icon, circle }) => (
                <div
                    key={key}
                    className="flex items-center gap-5 border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-5 py-4 md:px-6 md:py-5 min-h-[100px] rounded-2xl md:rounded-3xl shadow-sm transition-colors"
                >
                    <div className={`flex h-12 w-12 md:h-16 md:w-16 shrink-0 items-center justify-center rounded-full text-2xl md:text-3xl ${circle}`}>
                        {icon}
                    </div>
                    <div className="min-w-0">
                        {loading ? (
                            <div className="h-6 w-24 md:h-8 md:w-36 animate-pulse rounded bg-slate-200 dark:bg-gray-700" />
                        ) : (
                            <div 
                                title={data?.[key] != null ? formatCurrencyVN(data?.[key]) : ''}
                                className={`text-lg md:text-[24px] font-black leading-tight truncate cursor-help ${key === 'totalLoss' ? 'text-red-500 dark:text-red-400' : (key === 'profit' || key === 'actualProfit') ? 'text-[#1192a8] dark:text-[#38bcd4]' : 'text-[#56748a] dark:text-[#94a3b8]'}`}
                            >
                                {data?.[key] != null ? formatCurrencyShort(data?.[key], i18n.language) : '—'}
                            </div>
                        )}
                        <div className="mt-1 md:mt-2 text-[10px] md:text-xs font-bold text-[#557084] dark:text-[#94a3b8] uppercase tracking-wider truncate">{label}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}
