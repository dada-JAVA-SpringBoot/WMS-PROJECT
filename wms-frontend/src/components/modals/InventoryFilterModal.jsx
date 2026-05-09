import React, { useState } from 'react';
import { useModalDismiss } from './useModalDismiss';

const defaultDraft = {
    status: 'ALL',
    stock: 'ALL',
    categoryId: 'ALL',
    supplierCode: 'ALL',
    baseUnit: 'ALL',
    storageTemp: 'ALL',
    sortBy: 'DEFAULT'
};

export default function InventoryFilterModal({ isOpen, value, categories = [], suppliers = [], units = [], onApply, onClose }) {
    if (!isOpen) return null;

    return (
        <InventoryFilterModalContent
            value={value}
            categories={categories}
            suppliers={suppliers}
            units={units}
            onApply={onApply}
            onClose={onClose}
        />
    );
}

function InventoryFilterModalContent({ value, categories, suppliers, units, onApply, onClose }) {
    const [draft, setDraft] = useState(value || defaultDraft);
    useModalDismiss(true, onClose);

    const update = (field, nextValue) => {
        setDraft(prev => ({ ...prev, [field]: nextValue }));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
                <div className="bg-[#1192a8] text-white px-6 py-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold uppercase tracking-wide">Bộ lọc tồn kho</h2>
                        <p className="text-sm opacity-90">Lọc theo phân loại, nhà cung cấp, tình trạng kinh doanh và các số liệu tồn kho</p>
                    </div>
                    <button onClick={onClose} className="text-white hover:text-red-200 text-3xl leading-none">&times;</button>
                </div>

                <div className="p-6 bg-gray-50 space-y-5 overflow-y-auto flex-1">
                    <FilterGroup title="Phân loại">
                        <select
                            value={draft.categoryId}
                            onChange={(e) => update('categoryId', e.target.value)}
                            className="wms-select flex-1 !py-2"
                        >
                            <option value="ALL">Tất cả phân loại</option>
                            {categories.map((category) => (
                                <option key={category.id} value={String(category.id)}>
                                    {category.categoryCode} - {category.name}
                                </option>
                            ))}
                        </select>
                    </FilterGroup>

                    <FilterGroup title="Nhà cung cấp">
                        <select
                            value={draft.supplierCode}
                            onChange={(e) => update('supplierCode', e.target.value)}
                            className="wms-select flex-1 !py-2"
                        >
                            <option value="ALL">Tất cả nhà cung cấp</option>
                            {suppliers.map((supplier) => (
                                <option key={supplier.id} value={supplier.supplierCode}>
                                    {supplier.supplierCode} - {supplier.name}
                                </option>
                            ))}
                        </select>
                    </FilterGroup>

                    <FilterGroup title="Đơn vị tính">
                        <select
                            value={draft.baseUnit}
                            onChange={(e) => update('baseUnit', e.target.value)}
                            className="wms-select flex-1 !py-2"
                        >
                            <option value="ALL">Tất cả đơn vị tính</option>
                            {units.map((unit) => (
                                <option key={unit.id} value={unit.name}>
                                    {unit.unitCode} - {unit.name}
                                </option>
                            ))}
                        </select>
                    </FilterGroup>

                    <FilterGroup title="Điều kiện lưu kho">
                        <select
                            value={draft.storageTemp}
                            onChange={(e) => update('storageTemp', e.target.value)}
                            className="wms-select flex-1 !py-2"
                        >
                            <option value="ALL">Tất cả điều kiện</option>
                            <option value="Bình thường">Bình thường</option>
                            <option value="Kho Mát">Kho Mát</option>
                            <option value="Kho Lạnh">Kho Lạnh</option>
                            <option value="Tránh ánh sáng trực tiếp">Tránh ánh sáng trực tiếp</option>
                        </select>
                    </FilterGroup>

                    <FilterGroup title="Trạng thái sản phẩm">
                        <SegmentButton
                            active={draft.status === 'ALL'}
                            label="Không lọc"
                            onClick={() => update('status', 'ALL')}
                        />
                        <SegmentButton
                            active={draft.status === 'ACTIVE'}
                            label="Đang kinh doanh"
                            onClick={() => update('status', 'ACTIVE')}
                        />
                        <SegmentButton
                            active={draft.status === 'INACTIVE'}
                            label="Ngừng kinh doanh"
                            onClick={() => update('status', 'INACTIVE')}
                        />
                    </FilterGroup>

                    <FilterGroup title="Tồn kho">
                        <SegmentButton active={draft.stock === 'ALL'} label="Tất cả" onClick={() => update('stock', 'ALL')} />
                        <SegmentButton active={draft.stock === 'HAS'} label="Có khả dụng" onClick={() => update('stock', 'HAS')} />
                        <SegmentButton active={draft.stock === 'LOW'} label="Dưới an toàn" onClick={() => update('stock', 'LOW')} />
                        <SegmentButton active={draft.stock === 'ZERO'} label="Hết khả dụng" onClick={() => update('stock', 'ZERO')} />
                        <SegmentButton active={draft.stock === 'ALLOCATED'} label="Đã phân bổ" onClick={() => update('stock', 'ALLOCATED')} />
                        <SegmentButton active={draft.stock === 'INCOMING'} label="Đang về kho" onClick={() => update('stock', 'INCOMING')} />
                        <SegmentButton active={draft.stock === 'NO_INCOMING'} label="Không có hàng về" onClick={() => update('stock', 'NO_INCOMING')} />
                    </FilterGroup>

                    <FilterGroup title="Sắp xếp">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                            <SortRow
                                title="Mã SKU"
                                activeSortBy={draft.sortBy}
                                ascValue="SKU_ASC"
                                descValue="SKU_DESC"
                                ascLabel="A-Z"
                                descLabel="Z-A"
                                onChange={update}
                            />
                            <SortRow
                                title="Tên sản phẩm"
                                activeSortBy={draft.sortBy}
                                ascValue="NAME_ASC"
                                descValue="NAME_DESC"
                                ascLabel="A-Z"
                                descLabel="Z-A"
                                onChange={update}
                            />
                            <SortRow
                                title="Đơn vị tính"
                                activeSortBy={draft.sortBy}
                                ascValue="UNIT_ASC"
                                descValue="UNIT_DESC"
                                ascLabel="A-Z"
                                descLabel="Z-A"
                                onChange={update}
                            />
                            <SortRow
                                title="Tồn khả dụng"
                                activeSortBy={draft.sortBy}
                                ascValue="AVAILABLE_ASC"
                                descValue="AVAILABLE_DESC"
                                ascLabel="Tăng"
                                descLabel="Giảm"
                                onChange={update}
                            />
                            <SortRow
                                title="Tồn an toàn"
                                activeSortBy={draft.sortBy}
                                ascValue="SAFETY_ASC"
                                descValue="SAFETY_DESC"
                                ascLabel="Tăng"
                                descLabel="Giảm"
                                onChange={update}
                            />
                            <SortRow
                                title="Tổng tồn"
                                activeSortBy={draft.sortBy}
                                ascValue="TOTAL_ASC"
                                descValue="TOTAL_DESC"
                                ascLabel="Tăng"
                                descLabel="Giảm"
                                onChange={update}
                            />
                            <SortRow
                                title="Đã phân bổ"
                                activeSortBy={draft.sortBy}
                                ascValue="ALLOCATED_ASC"
                                descValue="ALLOCATED_DESC"
                                ascLabel="Tăng"
                                descLabel="Giảm"
                                onChange={update}
                            />
                            <SortRow
                                title="Đang về kho"
                                activeSortBy={draft.sortBy}
                                ascValue="INCOMING_ASC"
                                descValue="INCOMING_DESC"
                                ascLabel="Tăng"
                                descLabel="Giảm"
                                onChange={update}
                            />
                            <SortRow
                                title="Ngày thêm"
                                activeSortBy={draft.sortBy}
                                ascValue="CREATED_ASC"
                                descValue="CREATED_DESC"
                                ascLabel="Cũ trước"
                                descLabel="Mới trước"
                                onChange={update}
                            />
                            <SortRow
                                title="Lô gần nhất"
                                activeSortBy={draft.sortBy}
                                ascValue="BATCH_EXPIRY_ASC"
                                descValue="BATCH_EXPIRY_DESC"
                                ascLabel="Cận date"
                                descLabel="Xa date"
                                onChange={update}
                            />
                        </div>
                    </FilterGroup>
                </div>

                <div className="bg-white p-4 border-t flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() => onApply(defaultDraft)}
                        className="px-5 py-2.5 rounded-md bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition"
                    >
                        Xóa lọc
                    </button>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-md bg-gray-600 text-white font-bold hover:bg-gray-700 transition"
                        >
                            Hủy
                        </button>
                        <button
                            type="button"
                            onClick={() => onApply(draft)}
                            className="px-5 py-2.5 rounded-md bg-[#1192a8] text-white font-bold hover:bg-teal-700 transition"
                        >
                            Áp dụng
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function FilterGroup({ title, children }) {
    return (
        <section className="bg-white border rounded-lg p-4">
            <h3 className="text-xs font-bold uppercase text-gray-500 mb-3">{title}</h3>
            <div className="flex flex-wrap gap-2">{children}</div>
        </section>
    );
}

function SegmentButton({ active, label, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`px-3 py-2 rounded-md border text-sm font-medium transition ${
                active
                    ? 'bg-[#1192a8] text-white border-[#1192a8]'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
        >
            {label}
        </button>
    );
}

function SortRow({ title, activeSortBy, ascValue, descValue, ascLabel, descLabel, onChange }) {
    return (
        <div className="border border-gray-200 rounded-lg p-3 bg-white">
            <div className="text-[11px] font-bold uppercase text-gray-500 mb-2">{title}</div>
            <div className="flex flex-wrap gap-2">
                <SegmentButton active={activeSortBy === ascValue} label={ascLabel} onClick={() => onChange('sortBy', ascValue)} />
                <SegmentButton active={activeSortBy === descValue} label={descLabel} onClick={() => onChange('sortBy', descValue)} />
            </div>
        </div>
    );
}
