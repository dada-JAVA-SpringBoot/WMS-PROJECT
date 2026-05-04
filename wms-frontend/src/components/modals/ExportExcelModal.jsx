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
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[90] p-4">
            <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl flex flex-col overflow-hidden">
                <div className="bg-[#1192a8] text-white px-6 py-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold uppercase tracking-wide">Xuất Excel</h2>
                        <p className="text-sm opacity-90">Tùy vào bảo mật của từng trình duyệt mà phương thức lưu sẽ thay đổi.</p>
                    </div>
                    <button onClick={onClose} className="text-white hover:text-red-200 text-3xl leading-none">&times;</button>
                </div>

                <div className="p-6 bg-gray-50 space-y-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold text-gray-700">Tên file</label>
                        <input
                            type="text"
                            value={fileName}
                            onChange={(e) => onFileNameChange(e.target.value)}
                            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                            placeholder="inventory.xlsx"
                        />
                    </div>

                    <div className={`border rounded px-3 py-3 text-sm ${isSavePicker ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
                        {statusText}
                    </div>
                </div>

                <div className="bg-white p-4 border-t flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-md bg-gray-600 text-white font-bold hover:bg-gray-700 transition"
                    >
                        Hủy
                    </button>
                    <button
                        type="button"
                        onClick={onExport}
                        className="px-5 py-2.5 rounded-md bg-[#1192a8] text-white font-bold hover:bg-teal-700 transition"
                    >
                        {isSavePicker ? 'Mở hộp lưu và xuất' : 'Tải xuống ngay'}
                    </button>
                </div>
            </div>
        </div>
    );
}
