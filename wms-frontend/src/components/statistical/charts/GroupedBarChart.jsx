import React from 'react';
import { formatCurrencyShort } from './chartUtils';

export default function GroupedBarChart({ labels = [], series = [], title, maxValue, height = 380, yTicks = 5 }) {
    const width = 1180;
    const padding = { top: 28, right: 24, bottom: 62, left: 95 };

    // Safety check
    if (!series || series.length === 0 || !series[0].data || labels.length === 0) {
        return <div className="h-full flex items-center justify-center text-gray-400 italic">Không có dữ liệu biểu đồ</div>;
    }

    const seriesMax = Math.max(...series.flatMap((item) => item.data || [0]), 1);
    
    // Adaptive rounding based on magnitude
    const magnitude = Math.pow(10, Math.floor(Math.log10(seriesMax / yTicks)) || 0);
    const computedMax = maxValue || Math.ceil(seriesMax / yTicks / magnitude) * yTicks * magnitude;
    
    const ticks = Array.from({ length: yTicks + 1 }, (_, index) => (computedMax / yTicks) * index).reverse();
    const chartHeight = height - padding.top - padding.bottom;
    const categoryWidth = (width - padding.left - padding.right) / labels.length;
    const groupWidth = Math.min(110, categoryWidth * 0.76);
    const barWidth = groupWidth / series.length;

    return (
        <div className="bg-white p-2 h-full flex flex-col">
            {title && <h3 className="mb-4 text-center text-[20px] font-medium text-slate-900">{title}</h3>}
            <div className="w-full flex-1 overflow-hidden">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                    {ticks.map((tick, index) => {
                        const y = padding.top + (index * chartHeight) / yTicks;
                        return (
                            <g key={tick}>
                                <line
                                    x1={padding.left}
                                    y1={y}
                                    x2={width - padding.right}
                                    y2={y}
                                    stroke="#d7dde5"
                                    strokeWidth="1"
                                />
                                <text x={padding.left - 16} y={y + 4} textAnchor="end" fontSize="14" fill="#7c8795">
                                    {formatCurrencyShort(tick)}
                                </text>
                            </g>
                        );
                    })}

                    {labels.map((label, labelIndex) => {
                        const startX = padding.left + labelIndex * categoryWidth + (categoryWidth - groupWidth) / 2;
                        return (
                            <g key={label}>
                                {series.map((item, seriesIndex) => {
                                    const value = (item.data && item.data[labelIndex]) || 0;
                                    const barHeight = (value / computedMax) * chartHeight;
                                    const x = startX + seriesIndex * barWidth;
                                    const y = padding.top + chartHeight - barHeight;
                                    return (
                                        <rect
                                            key={`${label}-${item.label}`}
                                            x={x}
                                            y={y}
                                            width={Math.max(barWidth - 8, 10)}
                                            height={Math.max(barHeight, 0)}
                                            rx="1"
                                            fill={item.color}
                                            fillOpacity={item.opacity || 0.95}
                                        />
                                    );
                                })}
                                <text
                                    x={padding.left + labelIndex * categoryWidth + categoryWidth / 2}
                                    y={height - 18}
                                    textAnchor="middle"
                                    fontSize="14"
                                    fill="#7c8795"
                                >
                                    {label}
                                </text>
                            </g>
                        );
                    })}
                </svg>
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-8 text-[18px] text-slate-500">
                {series.map((item) => (
                    <div key={item.label} className="flex items-center gap-2">
                        <span className="inline-block h-4 w-4 rounded-full" style={{ backgroundColor: item.color }} />
                        <span>{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
