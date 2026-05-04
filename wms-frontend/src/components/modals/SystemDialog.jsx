import React from 'react';
import { useModalDismiss } from './useModalDismiss';

export default function SystemDialog({
    isOpen,
    title,
    message,
    confirmLabel = 'Đồng ý',
    cancelLabel = 'Hủy',
    onConfirm,
    onClose,
    variant = 'info',
    globalDismissEnabled = true
}) {
    useModalDismiss(isOpen, onClose, globalDismissEnabled);

    if (!isOpen) return null;

    const isConfirm = variant === 'confirm';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[80] p-4">
            <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
                <div className="bg-[#1192a8] text-white px-5 py-3">
                    <h3 className="text-base font-bold uppercase tracking-wide">{title}</h3>
                </div>
                <div className="p-5">
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{message}</p>
                </div>
                <div className="flex justify-end gap-3 p-4 border-t bg-white">
                    {isConfirm && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded font-medium hover:bg-gray-300"
                        >
                            {cancelLabel}
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={isConfirm ? onConfirm : onClose}
                        className={`px-5 py-2 rounded font-bold transition ${
                            isConfirm
                                ? 'bg-red-600 text-white hover:bg-red-700'
                                : 'bg-[#1192a8] text-white hover:bg-teal-700'
                        }`}
                    >
                        {isConfirm ? confirmLabel : 'Đóng'}
                    </button>
                </div>
            </div>
        </div>
    );
}
