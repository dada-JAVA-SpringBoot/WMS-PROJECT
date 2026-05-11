import React from 'react';
import { useModalDismiss } from './useModalDismiss';

export default function ExportExcelModal({
    isOpen,
    fileName,
    onFileNameChange,
    onExport,
    onClose,
    saveMode
}) {
    useModalDismiss(isOpen, onClose);

    if (!isOpen) return null;

    const isSavePicker = saveMode === 'save-picker';
    const statusText = isSavePicker
        ? 'Trình duyệt này hỗ trợ hộp lưu, nên bạn có thể đổi tên và chọn thư mục ngay khi xuất file.'
        : 'Trình duyệt này không hỗ trợ mở hộp lưu/chọn thư mục trực tiếp. Lý do là API lưu file bị giới hạn theo từng trình duyệt và quyền truy cập hệ thống.';

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex justify-center items-center z-[90] p-2 md:p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl md:rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="bg-[#1192a8] text-white px-5 md:px-6 py-3 md:py-4 flex justify-between items-center shrink-0">
                    <div className="min-w-0">
                        <h2 className="text-base md:text-xl font-bold uppercase tracking-wide truncate">Xuất file Excel</h2>
                        <p className="text-[10px] md:text-sm opacity-90 truncate italic">Cấu hình lưu trữ tệp tin</p>
                    </div>
                    <button onClick={onClose} className="text-white hover:text-red-200 text-2xl md:text-3xl leading-none ml-4">&times;</button>
                </div>

                <div className="p-4 md:p-6 bg-gray-50 space-y-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Tên tệp dự kiến:</label>
                        <input
                            type="text"
                            value={fileName}
                            onChange={(e) => onFileNameChange(e.target.value)}
                            className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1192a8] transition-all font-bold text-gray-700"
                            placeholder="inventory.xlsx"
                        />
                    </div>

                    <div className={`border-2 rounded-xl px-4 py-3 text-xs md:text-sm font-medium leading-relaxed ${isSavePicker ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-amber-50 border-amber-100 text-amber-800'}`}>
                        <div className="flex gap-3">
                            <span className="text-lg shrink-0">{isSavePicker ? '🛡️' : '⚠️'}</span>
                            <p>{statusText}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 border-t flex flex-col sm:flex-row justify-end gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="order-2 sm:order-1 px-6 py-2.5 text-gray-400 font-black text-xs uppercase tracking-widest"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        type="button"
                        onClick={onExport}
                        className="order-1 sm:order-2 px-8 py-3 rounded-xl bg-[#1192a8] text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-teal-500/20 active:scale-95 transition-all"
                    >
                        {isSavePicker ? 'Mở hộp lưu và tải' : 'Tải xuống ngay'}
                    </button>
                </div>
            </div>
        </div>
    );
}
