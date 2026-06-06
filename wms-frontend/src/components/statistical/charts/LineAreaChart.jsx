import React from 'react';
import { formatCurrencyShort } from './chartUtils';

function getPoints(values, width, height, padding, minValue, maxValue) {
    const range = maxValue - minValue || 1;
    const stepX = values.length > 1 ? (width - padding.left - padding.right) / (values.length - 1) : 0;
    const chartHeight = height - padding.top - padding.bottom;

    return values.map((value, index) => {
        const x = padding.left + index * stepX;
        const ratio = (value - minValue) / range;
        const y = padding.top + chartHeight - ratio * chartHeight;
        return { x, y, value };
    });
}

function createLinePath(points) {
    if (!points.length) return '';
    return `M ${points.map((point) => `${point.x},${point.y}`).join(' L ')}`;
}

function createAreaPath(points, yZero) {
    if (!points.length) return '';
    const start = points[0];
    const end = points[points.length - 1];
    return `${createLinePath(points)} L ${end.x},${yZero} L ${start.x},${yZero} Z`;
}

export default function LineAreaChart({
    labels = [],
    series = [],
    title,
    height = 380,
    yTicks = 4, // Sử dụng số tick chẵn để chia đều âm dương đẹp hơn
}) {
    const width = 1180;
    const padding = { top: 40, right: 30, bottom: 55, left: 82 };
    
    if (!series || series.length === 0 || !series[0].data) {
        return <div className="h-full flex items-center justify-center text-gray-400 italic">Không có dữ liệu biểu đồ</div>;
    }

    const rawMin = Math.min(...series.flatMap((item) => item.data || [0]), 0);
    const rawMax = Math.max(...series.flatMap((item) => item.data || [0]), 1);
    
    let roundedMin = 0;
    let roundedMax = 1;
    let ticks = [];

    if (rawMin < 0) {
        const absMax = Math.max(Math.abs(rawMax), Math.abs(rawMin));
        const magnitude = Math.pow(10, Math.floor(Math.log10(absMax / yTicks)) || 0);
        roundedMax = Math.ceil(absMax / yTicks / magnitude) * yTicks * magnitude;
        roundedMin = -roundedMax;
        ticks = Array.from({ length: yTicks + 1 }, (_, index) => roundedMax - ((roundedMax - roundedMin) / yTicks) * index);
    } else {
        const magnitude = Math.pow(10, Math.floor(Math.log10(rawMax / yTicks)) || 0);
        roundedMax = Math.ceil(rawMax / yTicks / magnitude) * yTicks * magnitude;
        roundedMin = 0;
        ticks = Array.from({ length: yTicks + 1 }, (_, index) => roundedMax - (roundedMax / yTicks) * index);
    }

    const chartHeight = height - padding.top - padding.bottom;
    const yZero = padding.top + chartHeight - ((0 - roundedMin) / (roundedMax - roundedMin)) * chartHeight;

    return (
        <div className="bg-white p-2 h-full">
            {title && <h3 className="mb-4 text-center text-[20px] font-medium text-slate-900">{title}</h3>}
            <div className="w-full h-full overflow-hidden">
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

                    {rawMin < 0 && (
                        <line
                            x1={padding.left}
                            y1={yZero}
                            x2={width - padding.right}
                            y2={yZero}
                            stroke="#64748b"
                            strokeWidth="1.5"
                            strokeDasharray="4 4"
                        />
                    )}

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
                        const points = getPoints(item.data, width, height, padding, roundedMin, roundedMax);
                        return (
                            <g key={item.label}>
                                {item.fill && (
                                    <path
                                        d={createAreaPath(points, yZero)}
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
