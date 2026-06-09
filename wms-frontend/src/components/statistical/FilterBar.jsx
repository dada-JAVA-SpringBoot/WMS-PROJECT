import React from 'react';

function BaseInput({ className = '', ...props }) {
    return (
        <input
            {...props}
            className={`h-9 border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 text-[15px] outline-none focus:border-sky-400 dark:focus:border-sky-500 text-gray-800 dark:text-gray-100 transition-colors ${className}`}
        />
    );
}

export function FilterSelect({ children, className = '', ...props }) {
    return (
        <select
            {...props}
            className={`h-9 border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 text-[15px] outline-none focus:border-sky-400 dark:focus:border-sky-500 text-gray-800 dark:text-gray-100 transition-colors ${className}`}
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
        default: 'border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-slate-50 dark:hover:bg-gray-600 text-slate-800 dark:text-gray-200',
        primary: 'border border-[#63a2da] dark:border-blue-600 bg-[#f8fcff] dark:bg-blue-900/30 hover:bg-[#eef6fd] dark:hover:bg-blue-800/40 text-slate-800 dark:text-blue-100',
        success: 'border border-[#51b36b] dark:border-green-600 bg-[#58b96e] dark:bg-green-600 text-white hover:opacity-95',
        danger: 'border border-[#d85a5f] dark:border-red-600 bg-[#dc5c62] dark:bg-red-600 text-white hover:opacity-95',
    };

    return (
        <button
            {...props}
            className={`h-10 min-w-[110px] px-4 text-[15px] transition-colors ${variants[variant]} ${className}`}
        >
            {children}
        </button>
    );
}

export default function FilterBar({ children, className = '' }) {
    return (
        <div className={`border border-slate-200 dark:border-gray-700 bg-[#f3f4f6] dark:bg-gray-800 px-4 py-3 transition-colors rounded-xl ${className}`}>
            <div className="flex flex-wrap items-center justify-center gap-3">{children}</div>
        </div>
    );
}
