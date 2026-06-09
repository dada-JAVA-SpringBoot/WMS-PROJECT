import React from 'react';

export default function SubTabNav({ tabs, activeTab, onChange }) {
    return (
        <div className="border-b border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 transition-colors">
            <div className="flex gap-1 overflow-x-auto">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onChange(tab.id)}
                            className={`relative px-4 py-3 text-[15px] whitespace-nowrap transition ${
                                isActive
                                    ? 'text-[#0f172a] dark:text-gray-100 after:absolute after:left-0 after:right-0 after:bottom-0 after:h-[3px] after:bg-[#60a5fa]'
                                    : 'text-slate-700 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-700/50'
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
