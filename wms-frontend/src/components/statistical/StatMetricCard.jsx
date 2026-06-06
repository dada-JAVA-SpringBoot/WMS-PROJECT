import React from 'react';

export default function StatMetricCard({ icon, value, label, circleClass = 'bg-[#d1fae5]' }) {
    const renderIcon = () => {
        if (typeof icon === 'string') {
            return <span className="text-xl">{icon}</span>;
        }
        return icon;
    };

    return (
        <div className="flex flex-col justify-between border border-slate-100 bg-white p-5 min-h-[115px] rounded-2xl shadow-sm transition-all hover:shadow-md hover:border-slate-200/80">
            <div className="flex items-start justify-between gap-3">
                <span className="text-[10px] md:text-[11px] text-slate-400 font-extrabold uppercase tracking-wider leading-snug">
                    {label}
                </span>
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl ${circleClass}`}>
                    {renderIcon()}
                </div>
            </div>
            <div className="text-xl md:text-2xl font-black text-slate-800 mt-2 leading-none truncate">
                {value}
            </div>
        </div>
    );
}
