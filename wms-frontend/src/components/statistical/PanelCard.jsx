import React from 'react';

export default function PanelCard({ children, className = '' }) {
    return <div className={`rounded-none border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors ${className}`}>{children}</div>;
}
