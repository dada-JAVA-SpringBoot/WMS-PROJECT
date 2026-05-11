import React from 'react';

export default function PendingTaskTable({ title, data, type }) {
    if (!data || data.length === 0) return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-full flex flex-col items-center justify-center text-gray-400">
            <p>Không có {title.toLowerCase()} nào.</p>
        </div>
    );

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden h-full flex flex-col">
            <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-gray-800">{title}</h3>
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">
                    {data.length}
                </span>
            </div>
            <div className="overflow-auto flex-1">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold sticky top-0">
                        <tr>
                            <th className="px-4 py-3">Mã phiếu</th>
                            <th className="px-4 py-3">Ngày</th>
                            <th className="px-4 py-3">Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {data.slice(0, 10).map((item) => (
                            <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                                <td className="px-4 py-3 font-medium text-blue-600">
                                    {type === 'inbound' ? item.receiptCode : item.issueCode}
                                </td>
                                <td className="px-4 py-3 text-gray-500">
                                    {new Date(type === 'inbound' ? item.receiptDate : item.issueDate).toLocaleDateString('vi-VN')}
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        item.status === 'DRAFT' ? 'bg-gray-100 text-gray-600' :
                                        item.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                        item.status === 'ALLOCATED' ? 'bg-blue-100 text-blue-700' :
                                        'bg-green-100 text-green-700'
                                    }`}>
                                        {item.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
