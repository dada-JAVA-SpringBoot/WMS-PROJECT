import React from 'react';

function BaseInput({ className = '', ...props }) {
    return (
        <input
            {...props}
            className={`h-9 border border-slate-300 bg-white px-3 text-[15px] outline-none focus:border-sky-400 ${className}`}
        />
    );
}

export function FilterSelect({ children, className = '', ...props }) {
    return (
        <select
            {...props}
            className={`h-9 border border-slate-300 bg-white px-3 text-[15px] outline-none focus:border-sky-400 ${className}`}
        >
            {children}
        </select>
    );
}

export function FilterInput(props) {
    return <BaseInput {...props} />;
}

export function FilterDateInput(props) {
    return <BaseInput type="date" {...props} />;
}

export function FilterButton({ children, variant = 'default', className = '', ...props }) {
    const variants = {
        default: 'border border-slate-300 bg-white hover:bg-slate-50 text-slate-800',
        primary: 'border border-[#63a2da] bg-[#f8fcff] hover:bg-[#eef6fd] text-slate-800',
        success: 'border border-[#51b36b] bg-[#58b96e] text-white hover:opacity-95',
        danger: 'border border-[#d85a5f] bg-[#dc5c62] text-white hover:opacity-95',
    };

    return (
        <button
            {...props}
            className={`h-10 min-w-[110px] px-4 text-[15px] transition ${variants[variant]} ${className}`}
        >
            {children}
        </button>
    );
}

export default function FilterBar({ children, className = '' }) {
    return (
        <div className={`border border-slate-200 bg-[#f3f4f6] px-4 py-3 ${className}`}>
            <div className="flex flex-wrap items-center justify-center gap-3">{children}</div>
        </div>
    );
}
