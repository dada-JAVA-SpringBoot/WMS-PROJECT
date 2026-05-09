import React from 'react';

function fmt(value) {
    if (value == null) return '—';
    return new Intl.NumberFormat('vi-VN').format(value) + 'đ';
}

const CARDS = [
    { key: 'totalCost',    label: 'Chi phí',    icon: '📦', circle: 'bg-[#fee2e2]' },
    { key: 'totalRevenue', label: 'Doanh thu',  icon: '💰', circle: 'bg-[#dbeafe]' },
    { key: 'profit',       label: 'Lợi nhuận',  icon: '📈', circle: 'bg-[#d1fae5]' },
];

export default function FinancialCards({ data, loading, error }) {
    if (error) {
        return (
            <div className="rounded border border-red-200 bg-red-50 px-5 py-4 text-[15px] text-red-600">
                {error}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {CARDS.map(({ key, label, icon, circle }) => (
                <div
                    key={key}
                    className="flex items-center gap-5 border border-slate-200 bg-white px-6 py-5 min-h-[100px]"
                >
                    <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-3xl ${circle}`}>
                        {icon}
                    </div>
                    <div>
                        {loading ? (
                            <div className="h-8 w-36 animate-pulse rounded bg-slate-200" />
                        ) : (
                            <div className="text-[28px] font-light leading-none text-[#56748a]">
                                {fmt(data?.[key])}
                            </div>
                        )}
                        <div className="mt-2 text-[15px] text-[#557084]">{label}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}