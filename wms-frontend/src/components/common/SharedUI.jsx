import React from 'react';

export const IconPlaceholder = ({ className = "w-10 h-10" }) => (
    <div className={`border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400 text-xs bg-gray-50 ${className}`}>
        [Icon]
    </div>
);

export const ActionButton = ({ label, icon, onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center gap-1.5 group bg-transparent border-none cursor-pointer">
        <div className="w-12 h-12 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 group-hover:border-[#1192a8] group-hover:text-[#1192a8] transition duration-200">
            {icon || <span className="text-xl">+</span>}
        </div>
        <span className="text-[11px] font-bold text-[#00529c] uppercase tracking-wide group-hover:text-[#1192a8] transition">
            {label}
        </span>
    </button>
);

export const TableToolbar = ({ actions, showSearch = true }) => (
    <div className="flex items-center justify-between bg-white p-5 mb-5 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex gap-6">
            {actions.map((action, index) => (
                <ActionButton key={index} {...action} />
            ))}
        </div>
        {showSearch && (
            <div className="flex items-center gap-3">
                <select className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#1192a8] focus:ring-1 focus:ring-[#1192a8] bg-white text-gray-700">
                    <option>Tất cả</option>
                    <option>Theo tên</option>
                    <option>Theo mã</option>
                </select>
                <div className="relative">
                    <input
                        type="text"
                        className="border border-gray-300 rounded-lg px-4 py-2 w-72 text-sm focus:outline-none focus:border-[#1192a8] focus:ring-1 focus:ring-[#1192a8]"
                        placeholder="Nhập nội dung tìm kiếm..."
                    />
                </div>
                <button className="bg-[#1192a8] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-teal-700 flex items-center gap-2 transition shadow-sm">
                    <span>↻</span> Làm mới
                </button>
            </div>
        )}
    </div>
);