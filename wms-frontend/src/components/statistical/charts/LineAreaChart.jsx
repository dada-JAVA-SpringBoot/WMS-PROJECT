import React from 'react';
import { formatCurrencyShort } from './chartUtils';

function getPoints(values, width, height, padding, maxValue) {
    const safeMax = maxValue || Math.max(...values, 1);
    const stepX = values.length > 1 ? (width - padding.left - padding.right) / (values.length - 1) : 0;

    return values.map((value, index) => {
        const x = padding.left + index * stepX;
        const y = height - padding.bottom - (value / safeMax) * (height - padding.top - padding.bottom);
        return { x, y, value };
    });
}

function createLinePath(points) {
    if (!points.length) return '';
    return `M ${points.map((point) => `${point.x},${point.y}`).join(' L ')}`;
}

function createAreaPath(points, height, padding) {
    if (!points.length) return '';
    const start = points[0];
    const end = points[points.length - 1];
    return `${createLinePath(points)} L ${end.x},${height - padding.bottom} L ${start.x},${height - padding.bottom} Z`;
}

export default function LineAreaChart({
    labels,
    series,
    title,
    height = 380,
    yTicks = 5,
}) {
    const width = 1180;
    const padding = { top: 40, right: 30, bottom: 55, left: 82 };
    const maxValue = Math.max(...series.flatMap((item) => item.data), 1);
    const roundedMax = Math.ceil(maxValue / yTicks / 1000000) * yTicks * 1000000;
    const ticks = Array.from({ length: yTicks + 1 }, (_, index) => (roundedMax / yTicks) * index).reverse();

    return (
        <div className="border border-slate-200 bg-white p-6">
            {title && <h3 className="mb-4 text-center text-[20px] font-medium text-slate-900">{title}</h3>}
            <div className="w-full overflow-x-auto">
                <svg viewBox={`0 0 ${width} ${height}`} className="min-w-[980px] w-full">
                    {ticks.map((tick, index) => {
                        const y = padding.top + (index * (height - padding.top - padding.bottom)) / yTicks;
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

                    {labels.map((label, index) => {
                        const x =
                            labels.length > 1
                                ? padding.left + (index * (width - padding.left - padding.right)) / (labels.length - 1)
                                : padding.left;
                        return (
                            <text key={label} x={x} y={height - 18} textAnchor="middle" fontSize="14" fill="#7c8795">
                                {label}
                            </text>
                        );
                    })}

                    {series.map((item) => {
                        const points = getPoints(item.data, width, height, padding, roundedMax);
                        return (
                            <g key={item.label}>
                                {item.fill && (
                                    <path
                                        d={createAreaPath(points, height, padding)}
                                        fill={item.fill}
                                        fillOpacity="0.28"
                                    />
                                )}
                                <path
                                    d={createLinePath(points)}
                                    fill="none"
                                    stroke={item.color}
                                    strokeWidth={item.strokeWidth || 4}
                                    strokeLinejoin="round"
                                    strokeLinecap="round"
                                />
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
