import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
    const { i18n } = useTranslation();
    const isEnglish = String(i18n.language || '').startsWith('en');
    const [draft, setDraft] = useState(value || defaultDraft);
    useModalDismiss(true, onClose);

    const update = (field, nextValue) => {
        setDraft(prev => ({ ...prev, [field]: nextValue }));
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex justify-center items-center z-50 p-2 md:p-4">
            <div className="bg-white w-full max-w-2xl rounded-2xl md:rounded-xl shadow-2xl flex flex-col overflow-hidden max-h-[98vh] md:max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
                <div className="bg-[#1192a8] text-white px-5 md:px-6 py-3 md:py-4 flex justify-between items-center shrink-0">
                    <div className="min-w-0">
                        <h2 className="text-base md:text-xl font-bold uppercase tracking-wide truncate">{isEnglish ? 'Advanced Filter' : 'Bộ lọc nâng cao'}</h2>
                        <p className="text-[10px] md:text-sm opacity-90 truncate italic">{isEnglish ? 'Search & sort inventory' : 'Tìm kiếm & Sắp xếp tồn kho'}</p>
                    </div>
                    <button onClick={onClose} className="text-white hover:text-red-200 text-2xl md:text-3xl leading-none ml-4">&times;</button>
                </div>

                <div className="p-3 md:p-6 bg-gray-50 space-y-4 md:space-y-5 overflow-y-auto flex-1 no-scrollbar">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FilterGroup title={isEnglish ? 'Product Category' : 'Phân loại hàng hóa'}>
                            <select
                                value={draft.categoryId}
                                onChange={(e) => update('categoryId', e.target.value)}
                                className="wms-select w-full !py-2 !text-xs md:!text-sm"
                            >
                                <option value="ALL">{isEnglish ? 'All categories' : 'Tất cả phân loại'}</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={String(category.id)}>
                                        {category.categoryCode} - {category.name}
                                    </option>
                                ))}
                            </select>
                        </FilterGroup>

                        <FilterGroup title={isEnglish ? 'Supplier' : 'Nhà cung cấp'}>
                            <select
                                value={draft.supplierCode}
                                onChange={(e) => update('supplierCode', e.target.value)}
                                className="wms-select w-full !py-2 !text-xs md:!text-sm"
                            >
                                <option value="ALL">{isEnglish ? 'All suppliers' : 'Tất cả nhà cung cấp'}</option>
                                {suppliers.map((supplier) => (
                                    <option key={supplier.id} value={supplier.supplierCode}>
                                        {supplier.supplierCode} - {supplier.name}
                                    </option>
                                ))}
                            </select>
                        </FilterGroup>

                        <FilterGroup title={isEnglish ? 'Unit' : 'Đơn vị tính'}>
                            <select
                                value={draft.baseUnit}
                                onChange={(e) => update('baseUnit', e.target.value)}
                                className="wms-select w-full !py-2 !text-xs md:!text-sm"
                            >
                                <option value="ALL">{isEnglish ? 'All units' : 'Tất cả đơn vị'}</option>
                                {units.map((unit) => (
                                    <option key={unit.id} value={unit.name}>
                                        {unit.unitCode} - {unit.name}
                                    </option>
                                ))}
                            </select>
                        </FilterGroup>

                        <FilterGroup title={isEnglish ? 'Storage Condition' : 'Điều kiện lưu kho'}>
                            <select
                                value={draft.storageTemp}
                                onChange={(e) => update('storageTemp', e.target.value)}
                                className="wms-select w-full !py-2 !text-xs md:!text-sm"
                            >
                                <option value="ALL">{isEnglish ? 'All conditions' : 'Tất cả điều kiện'}</option>
                                <option value="Bình thường">{isEnglish ? 'Normal' : 'Bình thường'}</option>
                                <option value="Kho Mát">{isEnglish ? 'Cool Storage' : 'Kho Mát'}</option>
                                <option value="Kho Lạnh">{isEnglish ? 'Cold Storage' : 'Kho Lạnh'}</option>
                            </select>
                        </FilterGroup>
                    </div>

                    <FilterGroup title={isEnglish ? 'Business Status' : 'Trạng thái kinh doanh'}>
                        <SegmentButton active={draft.status === 'ALL'} label={isEnglish ? 'All' : 'Tất cả'} onClick={() => update('status', 'ALL')} />
                        <SegmentButton active={draft.status === 'ACTIVE'} label={isEnglish ? 'Active' : 'Đang KD'} onClick={() => update('status', 'ACTIVE')} />
                        <SegmentButton active={draft.status === 'INACTIVE'} label={isEnglish ? 'Inactive' : 'Ngừng KD'} onClick={() => update('status', 'INACTIVE')} />
                    </FilterGroup>

                    <FilterGroup title={isEnglish ? 'Stock Status' : 'Tình trạng tồn kho'}>
                        <SegmentButton active={draft.stock === 'ALL'} label={isEnglish ? 'All' : 'Tất cả'} onClick={() => update('stock', 'ALL')} />
                        <SegmentButton active={draft.stock === 'HAS'} label={isEnglish ? 'Available' : 'Có sẵn'} onClick={() => update('stock', 'HAS')} />
                        <SegmentButton active={draft.stock === 'LOW'} label={isEnglish ? 'Low stock' : 'Sắp hết'} onClick={() => update('stock', 'LOW')} />
                        <SegmentButton active={draft.stock === 'ZERO'} label={isEnglish ? 'Out of stock' : 'Hết hàng'} onClick={() => update('stock', 'ZERO')} />
                        <SegmentButton active={draft.stock === 'ALLOCATED'} label={isEnglish ? 'Allocated' : 'Đã P/B'} onClick={() => update('stock', 'ALLOCATED')} />
                    </FilterGroup>

                    <FilterGroup title={isEnglish ? 'Sort Criteria' : 'Tiêu chí sắp xếp'}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 w-full">
                            <SortRow title={isEnglish ? 'SKU Code' : 'Mã SKU'} activeSortBy={draft.sortBy} ascValue="SKU_ASC" descValue="SKU_DESC" ascLabel="A-Z" descLabel="Z-A" onChange={update} />
                            <SortRow title={isEnglish ? 'Product Name' : 'Tên sản phẩm'} activeSortBy={draft.sortBy} ascValue="NAME_ASC" descValue="NAME_DESC" ascLabel="A-Z" descLabel="Z-A" onChange={update} />
                            <SortRow title={isEnglish ? 'Available Stock' : 'Tồn khả dụng'} activeSortBy={draft.sortBy} ascValue="AVAILABLE_ASC" descValue="AVAILABLE_DESC" ascLabel={isEnglish ? 'Asc' : 'Tăng'} descLabel={isEnglish ? 'Desc' : 'Giảm'} onChange={update} />
                            <SortRow title={isEnglish ? 'Nearest Batch' : 'Lô gần nhất'} activeSortBy={draft.sortBy} ascValue="BATCH_EXPIRY_ASC" descValue="BATCH_EXPIRY_DESC" ascLabel={isEnglish ? 'Sooner' : 'Cận date'} descLabel={isEnglish ? 'Later' : 'Xa date'} onChange={update} />
                        </div>
                    </FilterGroup>
                </div>

                <div className="bg-white p-4 border-t flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={() => onApply(defaultDraft)}
                        className="order-3 sm:order-1 py-2.5 px-6 rounded-xl bg-gray-100 text-gray-500 font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-gray-200 transition"
                    >
                        {isEnglish ? 'Clear filters' : 'Xóa bộ lọc'}
                    </button>
                    <div className="flex gap-3 order-1 sm:order-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-gray-400 font-black text-[10px] md:text-xs uppercase tracking-widest hover:underline transition"
                        >
                            {isEnglish ? 'Close' : 'Đóng'}
                        </button>
                        <button
                            type="button"
                            onClick={() => onApply(draft)}
                            className="flex-1 sm:flex-none px-10 py-3 rounded-xl bg-[#1192a8] text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-teal-500/20 active:scale-95 transition-all"
                        >
                            {isEnglish ? 'Apply' : 'Áp dụng'}
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
