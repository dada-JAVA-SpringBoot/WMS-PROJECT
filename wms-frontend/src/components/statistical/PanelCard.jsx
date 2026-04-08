import React from 'react';

export default function PanelCard({ children, className = '' }) {
    return <div className={`rounded-none border border-slate-200 bg-white ${className}`}>{children}</div>;
}
