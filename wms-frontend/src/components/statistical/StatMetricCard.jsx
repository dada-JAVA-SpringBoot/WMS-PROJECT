import React from 'react';

export default function StatMetricCard({ icon, value, label, circleClass = 'bg-[#d1fae5]' }) {
    return (
        <div className="flex items-center gap-6 border border-slate-200 bg-white px-6 py-5 min-h-[118px]">
            <div className={`flex h-20 w-20 items-center justify-center rounded-full text-4xl ${circleClass}`}>
                {icon}
            </div>
            <div>
                <div className="text-[48px] leading-none text-[#56748a] font-light">{value}</div>
                <div className="mt-2 text-[18px] text-[#557084]">{label}</div>
            </div>
        </div>
    );
}
