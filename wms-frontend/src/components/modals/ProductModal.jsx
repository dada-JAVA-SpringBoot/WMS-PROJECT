import React from 'react';

export default function ProductModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white w-[900px] rounded-lg shadow-xl overflow-hidden">
                {/* Header Modal */}
                <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-center w-full uppercase">Thêm sản phẩm mới</h2>
                    <button onClick={onClose} className="text-white hover:text-red-200 font-bold text-xl absolute ml-[840px]">✕</button>
                </div>

                {/* Body Modal */}
                <div className="p-6 flex gap-6">
                    {/* Cột trái: Hình ảnh */}
                    <div className="w-1/4 flex flex-col items-center">
                        <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-4 bg-gray-50 text-gray-400">
                            [Ảnh]
                        </div>
                        <button className="border border-blue-400 text-blue-600 px-4 py-1 rounded hover:bg-blue-50 transition">
                            Hình minh họa
                        </button>
                    </div>

                    {/* Cột phải: Form nhập liệu (Sử dụng Grid 4 cột) */}
                    <div className="w-3/4 grid grid-cols-4 gap-4">
                        <FormInput label="Tên sản phẩm" />
                        <FormSelect label="Xuất xứ" options={['Trung Quốc', 'Việt Nam', 'Hàn Quốc']} />
                        <FormInput label="Chip xử lý" />
                        <FormInput label="Dung lượng pin" />

                        <FormInput label="Kích thước màn" />
                        <FormInput label="Camera sau" />
                        <FormInput label="Camera trước" />
                        <FormSelect label="Hệ điều hành" options={['Android', 'iOS']} />

                        <FormInput label="Phiên bản hđh" />
                        <FormInput label="Thời gian bảo hành" />
                        <FormSelect label="Thương hiệu" options={['Apple', 'Samsung', 'Xiaomi']} />
                        <FormSelect label="Khu vực kho" options={['Khu vực A', 'Khu vực B']} />
                    </div>
                </div>

                {/* Footer Modal */}
                <div className="flex justify-center gap-4 p-4 border-t border-gray-200 bg-gray-50">
                    <button className="bg-[#4299e1] text-white px-8 py-2 rounded shadow hover:bg-blue-600">
                        Tạo cấu hình
                    </button>
                    <button onClick={onClose} className="bg-[#f56565] text-white px-8 py-2 rounded shadow hover:bg-red-600">
                        Huỷ bỏ
                    </button>
                </div>
            </div>
        </div>
    );
}

// Sub-components để tái sử dụng, giúp code gọn hơn
function FormInput({ label, type = "text" }) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">{label}</label>
            <input type={type} className="border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:border-blue-500" />
        </div>
    );
}

function FormSelect({ label, options }) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">{label}</label>
            <select className="border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:border-blue-500 bg-white">
                {options.map((opt, idx) => (
                    <option key={idx} value={opt}>{opt}</option>
                ))}
            </select>
        </div>
    );
}