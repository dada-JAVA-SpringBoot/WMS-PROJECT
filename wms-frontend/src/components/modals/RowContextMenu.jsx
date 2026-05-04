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
    return (
        <div
            className="fixed inset-0 z-[85]"
            onContextMenu={(e) => e.preventDefault()}
            onClick={onClose}
        >
            <div
                className="absolute w-64 rounded-lg border border-gray-200 bg-white shadow-2xl overflow-hidden"
                style={{ left: x, top: y }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="px-4 py-3 border-b bg-gray-50">
                    <p className="text-xs uppercase text-gray-500 font-bold">Tác vụ nhanh</p>
                    <p className="text-sm font-semibold text-gray-900 truncate">{headerLabel}</p>
                </div>

                <MenuItem label="Chi tiết" onClick={onDetail} />
                <MenuItem label="Sửa" onClick={onEdit} />
                <MenuItem label="Xóa" danger onClick={onDelete} />
                <MenuItem label="Lập phiếu nhập" onClick={onInbound} />
                <MenuItem label="Lập phiếu xuất" onClick={onOutbound} />
                <MenuItem label="Sao chép dữ liệu" onClick={onCopy} />
                <MenuItem label="Chọn tất cả" onClick={onSelectAll} />
                <MenuItem label="Bỏ chọn" onClick={onClearSelection} />
                <MenuItem label="Làm mới" onClick={onRefresh} />
            </div>
        </div>
    );
}

function MenuItem({ label, onClick, danger = false }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition ${
                danger ? 'text-red-600' : 'text-gray-700'
            }`}
        >
            {label}
        </button>
    );
}
