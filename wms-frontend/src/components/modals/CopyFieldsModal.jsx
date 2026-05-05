import React, { useEffect, useMemo, useState } from 'react';
import { useModalDismiss } from './useModalDismiss';

const defaultFields = {
    sku: true,
    name: true,
    barcode: true,
    category: true,
    unit: true,
    status: false,
    stock: false,
    allocated: false,
    available: false,
    incoming: false,
    safety: false,
    supplier: false,
    storage: false
};

export default function CopyFieldsModal({
    isOpen,
    products = [],
    resolveCategoryLabel = () => '',
    resolveUnitLabel = () => '',
    onClose,
    onCopy
}) {
    const [fields, setFields] = useState(defaultFields);
    useModalDismiss(isOpen, onClose);

    useEffect(() => {
        if (isOpen) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFields(defaultFields);
        }
    }, [isOpen, products]);

    const copyLines = useMemo(() => {
        if (!products.length) return [];
        return products.flatMap((product, index) => {
            const lines = [];
            if (products.length > 1) lines.push(`--- Sản phẩm ${index + 1} ---`);
            if (fields.sku) lines.push(`SKU: ${product.sku || ''}`);
            if (fields.name) lines.push(`Tên: ${product.name || ''}`);
            if (fields.barcode) lines.push(`Barcode: ${product.barcode || ''}`);
            if (fields.category) lines.push(`Phân loại: ${resolveCategoryLabel(product) || 'Chưa gán'}`);
            if (fields.unit) lines.push(`Đơn vị tính: ${resolveUnitLabel(product) || product.baseUnit || ''}`);
            if (fields.status) lines.push(`Trạng thái: ${product.status || ''}`);
            if (fields.stock) lines.push(`Tổng tồn: ${product.totalStock ?? 0}`);
            if (fields.allocated) lines.push(`Đã phân bổ: ${product.allocatedStock ?? product.quantityAllocated ?? product.allocated ?? 0}`);
            if (fields.available) {
                const totalStock = Number(product.totalStock || 0);
                const allocatedStock = Number(product.allocatedStock ?? product.quantityAllocated ?? product.allocated ?? 0);
                const availableStock = product.availableStock !== undefined && product.availableStock !== null
                    ? product.availableStock
                    : totalStock - allocatedStock;
                lines.push(`Tồn khả dụng: ${availableStock}`);
            }
            if (fields.incoming) lines.push(`Đang về kho: ${product.incomingStock ?? product.inboundStock ?? product.onOrderStock ?? 0}`);
            if (fields.safety) lines.push(`Tồn an toàn: ${product.safetyStock ?? ''}`);
            if (fields.supplier) lines.push(`Nhà cung cấp: ${product.supplierCodes || 'Chưa xác định'}`);
            if (fields.storage) lines.push(`Điều kiện lưu kho: ${product.storageTemp || 'Bình thường'}`);
            if (products.length > 1) lines.push('');
            return lines;
        });
    }, [fields, products, resolveCategoryLabel, resolveUnitLabel]);

    if (!isOpen || !products.length) return null;

    const toggle = (field) => {
        setFields(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const selectAll = () => {
        setFields({
            sku: true,
            name: true,
            barcode: true,
            category: true,
            unit: true,
            status: true,
            stock: true,
            allocated: true,
            available: true,
            incoming: true,
            safety: true,
            supplier: true,
            storage: true
        });
    };

    const clearAll = () => {
        setFields({
            sku: false,
            name: false,
            barcode: false,
            category: false,
            unit: false,
            status: false,
            stock: false,
            allocated: false,
            available: false,
            incoming: false,
            safety: false,
            supplier: false,
            storage: false
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[90] p-4">
            <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
                <div className="bg-[#1192a8] text-white px-6 py-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold uppercase tracking-wide">Sao chép dữ liệu</h2>
                        <p className="text-sm opacity-90">
                            {products.length === 1
                                ? `${products[0].sku} - ${products[0].name}`
                                : `${products.length} sản phẩm đã chọn`}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-white hover:text-red-200 text-3xl leading-none">&times;</button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 bg-gray-50 space-y-4">
                    <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={selectAll} className="px-3 py-2 rounded-md bg-white border border-gray-200 text-sm font-medium hover:bg-gray-50">
                            Chọn tất cả
                        </button>
                        <button type="button" onClick={clearAll} className="px-3 py-2 rounded-md bg-white border border-gray-200 text-sm font-medium hover:bg-gray-50">
                            Bỏ chọn
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <CheckItem label="SKU" checked={fields.sku} onChange={() => toggle('sku')} />
                        <CheckItem label="Tên sản phẩm" checked={fields.name} onChange={() => toggle('name')} />
                        <CheckItem label="Barcode" checked={fields.barcode} onChange={() => toggle('barcode')} />
                        <CheckItem label="Phân loại" checked={fields.category} onChange={() => toggle('category')} />
                        <CheckItem label="Đơn vị tính" checked={fields.unit} onChange={() => toggle('unit')} />
                        <CheckItem label="Trạng thái" checked={fields.status} onChange={() => toggle('status')} />
                        <CheckItem label="Tổng tồn" checked={fields.stock} onChange={() => toggle('stock')} />
                        <CheckItem label="Đã phân bổ" checked={fields.allocated} onChange={() => toggle('allocated')} />
                        <CheckItem label="Tồn khả dụng" checked={fields.available} onChange={() => toggle('available')} />
                        <CheckItem label="Đang về kho" checked={fields.incoming} onChange={() => toggle('incoming')} />
                        <CheckItem label="Tồn an toàn" checked={fields.safety} onChange={() => toggle('safety')} />
                        <CheckItem label="Nhà cung cấp" checked={fields.supplier} onChange={() => toggle('supplier')} />
                        <CheckItem label="Điều kiện lưu kho" checked={fields.storage} onChange={() => toggle('storage')} />
                    </div>

                    <div className="bg-white border rounded-lg p-4">
                        <h3 className="text-xs font-bold uppercase text-gray-500 mb-3">Nội dung sẽ sao chép</h3>
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap break-words min-h-[120px]">{copyLines.join('\n') || 'Chưa chọn nội dung nào.'}</pre>
                    </div>
                </div>

                <div className="bg-white p-4 border-t flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-md bg-gray-600 text-white font-bold hover:bg-gray-700 transition"
                    >
                        Hủy
                    </button>
                    <button
                        type="button"
                        onClick={() => onCopy(copyLines)}
                        className="px-5 py-2.5 rounded-md bg-[#1192a8] text-white font-bold hover:bg-teal-700 transition"
                    >
                        Sao chép
                    </button>
                </div>
            </div>
        </div>
    );
}

function CheckItem({ label, checked, onChange }) {
    return (
        <label className="flex items-center gap-3 bg-white border rounded-lg px-4 py-3 cursor-pointer">
            <input type="checkbox" checked={checked} onChange={onChange} className="w-4 h-4" />
            <span className="text-sm font-medium text-gray-700">{label}</span>
        </label>
    );
}
