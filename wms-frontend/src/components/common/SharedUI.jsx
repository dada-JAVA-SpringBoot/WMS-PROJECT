import React from 'react';

export const IconPlaceholder = ({ className = "w-10 h-10" }) => (
    <div className={`border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center text-gray-400 text-xs bg-gray-50 transition-all ${className}`}>
        [Icon]
    </div>
);


export const ActionButton = ({ label, iconSrc, icon, onClick }) => (
    <button
        onClick={onClick}
        className="flex flex-col items-center gap-1 group bg-transparent border-none cursor-pointer transition-transform active:scale-90"
    >
        <div className="w-12 h-12 flex items-center justify-center rounded-xl group-hover:bg-gray-100 transition duration-200">

            {iconSrc ? (
                <img src={iconSrc} alt={label} className="w-9 h-9 object-contain" />
            ) : (

                icon || <IconPlaceholder className="w-9 h-9" />
            )}
        </div>
        <span className="text-[10px] font-bold text-[#00529c] uppercase tracking-tighter group-hover:text-[#1192a8] transition text-center whitespace-nowrap">
            {label}
        </span>
    </button>
);


export const TableToolbar = ({ actions = [], showSearch = true }) => (
    <div className="flex items-center justify-between bg-white p-5 rounded-3xl shadow-sm border border-gray-100">

        <div className="flex gap-8">
            {actions.map((action, index) => (
                <ActionButton key={index} {...action} />
            ))}
        </div>


        {showSearch && (
            <div className="flex items-center gap-3">
                <select className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1192a8]/20 focus:border-[#1192a8] bg-white text-gray-600 cursor-pointer">
                    <option>Tất cả</option>
                    <option>Theo tên</option>
                    <option>Theo mã</option>
                </select>
                <div className="relative">
                    <input
                        type="text"
                        className="border border-gray-200 rounded-xl px-5 py-2.5 w-72 text-sm focus:outline-none focus:ring-2 focus:ring-[#1192a8]/20 focus:border-[#1192a8] transition-all"
                        placeholder="Nhập nội dung tìm kiếm..."
                    />
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="bg-[#1192a8] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-teal-700 hover:shadow-lg hover:shadow-teal-500/30 flex items-center gap-2 transition-all active:scale-95"
                >
                    <span className="text-lg">↻</span> Làm mới
                </button>
            </div>
        )}
    </div>
);