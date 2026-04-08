import React from 'react';
import { TableToolbar, IconPlaceholder } from '../components/common/SharedUI';

export default function AttributesPage() {
    const attributes = [
        { name: "Thương hiệu", details: "Brands" },
        { name: "Xuất xứ", details: "Origins" },
        { name: "Hệ điều hành", details: "OS" },
        { name: "Ram", details: "Memory" },
        { name: "Rom", details: "Storage" },
        { name: "Màu sắc", details: "Colors" },
    ];

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-8">Quản lý thuộc tính</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {attributes.map((attr, index) => (
                    <div key={index} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-6 transform transition hover:-translate-y-1 hover:shadow-md cursor-pointer group">
                        <IconPlaceholder className="w-20 h-20 rounded-2xl group-hover:border-[#1192a8] group-hover:text-[#1192a8]" />
                        <div className="flex-1">
                            <h3 className="text-xl font-extrabold text-[#1192a8] uppercase tracking-tight">{attr.name}</h3>
                            <p className="text-gray-400 text-sm mt-1">{attr.details} →</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}