import React from 'react';

export default function SubTabNav({ tabs, activeTab, onChange }) {
    return (
        <div className="border-b border-slate-200 bg-white px-4">
            <div className="flex gap-1 overflow-x-auto">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onChange(tab.id)}
                            className={`relative px-4 py-3 text-[15px] whitespace-nowrap transition ${
                                isActive
                                    ? 'text-[#0f172a] after:absolute after:left-0 after:right-0 after:bottom-0 after:h-[3px] after:bg-[#60a5fa]'
                                    : 'text-slate-700 hover:bg-slate-50'
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
