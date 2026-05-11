import React from 'react';

function fmt(value) {
    if (value == null) return '—';
    return new Intl.NumberFormat('vi-VN').format(value) + 'đ';
}

const CARDS = [
    { key: 'totalCost',    label: 'Chi phí (Nhập)',    icon: '📦', circle: 'bg-[#fee2e2]' },
    { key: 'totalRevenue', label: 'Doanh thu (Xuất)',  icon: '💰', circle: 'bg-[#dbeafe]' },
    { key: 'totalLoss',    label: 'Thất thoát (Hao hụt)', icon: '📉', circle: 'bg-[#ffedd5]' },
    { key: 'profit',       label: 'Lợi nhuận ròng',  icon: '📈', circle: 'bg-[#d1fae5]' },
];

export default function FinancialCards({ data, loading, error }) {
    if (error) {
        return (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-[15px] text-red-600">
                {error}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CARDS.map(({ key, label, icon, circle }) => (
                <div
                    key={key}
                    className="flex items-center gap-5 border border-slate-200 bg-white px-5 py-4 md:px-6 md:py-5 min-h-[100px] rounded-2xl md:rounded-3xl shadow-sm"
                >
                    <div className={`flex h-12 w-12 md:h-16 md:w-16 shrink-0 items-center justify-center rounded-full text-2xl md:text-3xl ${circle}`}>
                        {icon}
                    </div>
                    <div className="min-w-0">
                        {loading ? (
                            <div className="h-6 w-24 md:h-8 md:w-36 animate-pulse rounded bg-slate-200" />
                        ) : (
                            <div className={`text-lg md:text-[24px] font-black leading-tight truncate ${key === 'totalLoss' ? 'text-red-500' : key === 'profit' ? 'text-[#1192a8]' : 'text-[#56748a]'}`}>
                                {fmt(data?.[key])}
                            </div>
                        )}
                        <div className="mt-1 md:mt-2 text-[10px] md:text-xs font-bold text-[#557084] uppercase tracking-wider truncate">{label}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}