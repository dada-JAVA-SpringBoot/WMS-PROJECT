import React from 'react';

export default function VoucherContextMenu({
    isOpen,
    x,
    y,
    title = 'Tác vụ nhanh',
    subtitle = '',
    actions = [],
    onClose
}) {
    if (!isOpen || !actions.length) return null;

    return (
        <div
            className="fixed inset-0 z-[85]"
            onContextMenu={(e) => e.preventDefault()}
            onClick={onClose}
        >
            <div
                className="absolute w-64 rounded-lg border border-gray-200 bg-white shadow-2xl overflow-hidden"
                style={{ left: x, top: y }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="px-4 py-3 border-b bg-gray-50">
                    <p className="text-xs uppercase text-gray-500 font-bold">{title}</p>
                    {subtitle ? <p className="text-sm font-semibold text-gray-900 truncate">{subtitle}</p> : null}
                </div>

                {actions.map((action) => (
                    <MenuItem
                        key={action.label}
                        label={action.label}
                        onClick={action.onClick}
                        danger={action.danger}
                    />
                ))}
            </div>
        </div>
    );
}

function MenuItem({ label, onClick, danger = false }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition ${
                danger ? 'text-red-600' : 'text-gray-700'
            }`}
        >
            {label}
        </button>
    );
}
