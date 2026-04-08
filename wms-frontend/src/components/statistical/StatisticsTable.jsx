import React from 'react';

export default function StatisticsTable({ columns, rows, scrollHeight = '420px', align = 'center' }) {
    return (
        <div className="overflow-auto" style={{ maxHeight: scrollHeight }}>
            <table className="min-w-full border-collapse text-[15px]">
                <thead className="sticky top-0 z-10 bg-[#f2f3f5]">
                    <tr>
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                className={`border-b border-slate-200 px-6 py-4 font-semibold text-slate-900 ${column.className || ''}`}
                                style={{ minWidth: column.minWidth || 140, textAlign: column.align || align }}
                            >
                                {column.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, rowIndex) => (
                        <tr key={row.id || rowIndex} className="border-b border-slate-200 hover:bg-slate-50">
                            {columns.map((column) => (
                                <td
                                    key={column.key}
                                    className={`px-6 py-4 text-slate-800 ${column.cellClassName || ''}`}
                                    style={{ textAlign: column.align || align }}
                                >
                                    {row[column.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
