import React from 'react';

export default function TopTabNav({ tabs, activeTab, onChange }) {
    return (
        <div className="bg-[#edf3f7] border-b border-slate-200 px-4 pt-3">
            <div className="flex gap-1 overflow-x-auto">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onChange(tab.id)}
                            className={`relative border border-transparent px-4 py-3 text-[16px] whitespace-nowrap transition ${
                                isActive
                                    ? 'bg-white text-[#0f172a] after:absolute after:left-0 after:right-0 after:bottom-0 after:h-[3px] after:bg-[#3b82f6]'
                                    : 'text-[#111827] hover:bg-white/60'
                            }`}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
