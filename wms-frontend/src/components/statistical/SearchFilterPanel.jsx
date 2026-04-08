import React from 'react';
import PanelCard from './PanelCard';
import { FilterButton } from './FilterBar';

function SearchField({ label, type = 'text', placeholder = '' }) {
    return (
        <div>
            <label className="mb-3 block text-[16px] text-slate-800">{label}</label>
            <div className="flex gap-2">
                <input
                    type={type}
                    placeholder={placeholder}
                    className="h-12 w-full border border-slate-300 bg-white px-3 text-[15px] outline-none focus:border-sky-400"
                />
                {type === 'date' && (
                    <button className="flex h-12 w-12 items-center justify-center border border-slate-300 bg-[#f8f8f8] text-lg hover:bg-slate-100">
                        📅
                    </button>
                )}
            </div>
        </div>
    );
}

export default function SearchFilterPanel({ title, searchLabel }) {
    return (
        <PanelCard className="h-full p-6">
            <div className="space-y-8">
                <SearchField label={title} placeholder={searchLabel} />
                <SearchField label="Từ ngày" type="date" />
                <SearchField label="Đến ngày" type="date" />
                <div className="flex gap-3 pt-2">
                    <FilterButton variant="success" className="flex-1 !h-11">
                        Xuất Excel
                    </FilterButton>
                    <FilterButton variant="danger" className="flex-1 !h-11">
                        Làm mới
                    </FilterButton>
                </div>
            </div>
        </PanelCard>
    );
}
