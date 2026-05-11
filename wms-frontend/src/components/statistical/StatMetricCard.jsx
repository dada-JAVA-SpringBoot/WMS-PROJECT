import React from 'react';

export default function StatMetricCard({ icon, value, label, circleClass = 'bg-[#d1fae5]' }) {
    return (
        <div className="flex items-center gap-3 md:gap-6 border border-slate-200 bg-white px-4 py-4 md:px-6 md:py-5 min-h-[100px] md:min-h-[118px] rounded-2xl md:rounded-none">
            <div className={`flex h-12 w-12 md:h-20 md:w-20 shrink-0 items-center justify-center rounded-full text-xl md:text-4xl ${circleClass}`}>
                {icon}
            </div>
            <div className="min-w-0">
                <div className="text-2xl md:text-[48px] leading-tight md:leading-none text-[#56748a] font-black md:font-light truncate">{value}</div>
                <div className="mt-1 md:mt-2 text-[10px] md:text-[18px] text-[#557084] font-bold md:font-normal uppercase md:capitalize tracking-wider md:tracking-normal">{label}</div>
            </div>
        </div>
    );
}
