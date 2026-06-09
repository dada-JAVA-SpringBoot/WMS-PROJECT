import React from 'react';

export default function TopTabNav({ tabs, activeTab, onChange }) {
    return (
        <div className="bg-[#edf3f7] dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700 px-4 pt-3 transition-colors">
            <div className="flex gap-1 overflow-x-auto">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onChange(tab.id)}
                            className={`relative border border-transparent px-4 py-3 text-[16px] whitespace-nowrap transition ${
                                isActive
                                    ? 'bg-white dark:bg-gray-900 text-[#0f172a] dark:text-gray-100 after:absolute after:left-0 after:right-0 after:bottom-0 after:h-[3px] after:bg-[#3b82f6]'
                                    : 'text-[#111827] dark:text-gray-400 hover:bg-white/60 dark:hover:bg-gray-700/60'
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
