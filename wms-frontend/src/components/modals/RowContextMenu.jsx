import React from 'react';

export default function RowContextMenu({
    isOpen,
    x,
    y,
    products = [],
    onClose,
    onDetail,
    onEdit,
    onDelete,
    onCopy,
    onInbound,
    onOutbound,
    onRefresh,
    onSelectAll,
    onClearSelection
}) {
    if (!isOpen || !products.length) return null;

    const primaryProduct = products[0];
    const headerLabel = products.length > 1
        ? `Nhiều sản phẩm (${products.length})`
        : primaryProduct.sku;

    // Tính toán vị trí để không bị tràn
    const menuWidth = 240;
    const menuHeight = 450; // Ước tính
    let adjustedX = x;
    let adjustedY = y;
    if (x + menuWidth > window.innerWidth) adjustedX = x - menuWidth;
    if (y + menuHeight > window.innerHeight) adjustedY = y - menuHeight;

    return (
        <div
            className="fixed inset-0 z-[85] cursor-default"
            onContextMenu={(e) => { e.preventDefault(); onClose(); }}
            onClick={onClose}
        >
            <div
                className="absolute w-60 rounded-2xl border border-gray-100 bg-white/95 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden animate-in fade-in zoom-in-95 duration-100 ease-out"
                style={{ left: adjustedX, top: adjustedY }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-5 py-3.5 bg-gray-50/50 border-b border-gray-100">
                    <p className="text-[10px] uppercase text-gray-400 font-black tracking-[0.1em] mb-0.5">Tác vụ nhanh</p>
                    <p className="text-xs font-bold text-[#1192a8] truncate drop-shadow-sm">{headerLabel}</p>
                </div>

                {/* Danh sách action */}
                <div className="p-1.5 space-y-0.5">
                    <MenuItem label="Chi tiết" onClick={onDetail} />
                    <MenuItem label="Sửa" onClick={onEdit} />
                    <MenuItem label="Xóa" danger onClick={onDelete} />
                    <div className="h-px bg-gray-100 my-1 mx-2" />
                    <MenuItem label="Lập phiếu nhập" onClick={onInbound} />
                    <MenuItem label="Lập phiếu xuất" onClick={onOutbound} />
                    <MenuItem label="Sao chép dữ liệu" onClick={onCopy} />
                    <div className="h-px bg-gray-100 my-1 mx-2" />
                    <MenuItem label="Chọn tất cả" onClick={onSelectAll} />
                    <MenuItem label="Bỏ chọn" onClick={onClearSelection} />
                    <MenuItem label="Làm mới" onClick={onRefresh} />
                </div>
            </div>
        </div>
    );
}

function MenuItem({ label, onClick, danger = false }) {
    return (
        <button
            type="button"
            onClick={() => {
                onClick();
                // Close is handled by the parent's overlay click, but we can ensure it here if needed
            }}
            className={`
                w-full text-left px-4 py-2 text-[13px] font-semibold rounded-xl transition-all duration-200
                flex items-center justify-between group
                ${danger 
                    ? 'text-red-500 hover:bg-red-50 active:bg-red-100' 
                    : 'text-gray-600 hover:bg-[#1192a8]/10 hover:text-[#1192a8] active:bg-[#1192a8]/20'}
            `}
        >
            <span>{label}</span>
            <span className={`opacity-0 group-hover:opacity-100 transition-opacity text-[10px] ${danger ? 'text-red-300' : 'text-[#1192a8]/40'}`}>
                {danger ? '●' : '→'}
            </span>
        </button>
    );
}
