import React, { useState } from 'react';

export default function ProductModal({ isOpen, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        // 1. Thông tin chung
        sku: '',
        barcode: '',
        name: '',
        baseUnit: 'Hộp',
        categoryId: 1,
        supplierId: '', // Thay thành ID vì sẽ chọn từ list
        // 2. Quy cách (Logistic)
        weight: '',
        length: '',
        width: '',
        height: '',
        // 3. Quản lý kho (WMS Rules)
        storageTemp: 'Bình thường',
        safetyStock: '',
        isFragile: false,
        imageUrl: '',
        status: 'ACTIVE'
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async () => {
        if (!formData.sku || !formData.name) {
            alert("Vui lòng nhập Mã SKU và Tên sản phẩm!");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch("http://localhost:8080/api/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                onSuccess();
                onClose();
            } else {
                alert("Lỗi khi lưu! Có thể mã SKU đã trùng lặp.");
            }
        } catch (error) {
            alert("Không thể kết nối đến máy chủ.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- LOGIC TÍNH TOÁN TỰ ĐỘNG ---
    const l = parseFloat(formData.length) || 0;
    const w = parseFloat(formData.width) || 0;
    const h = parseFloat(formData.height) || 0;

    const area = l * w; // cm2
    const volume = l * w * h; // cm3
    const cbm = (volume / 1000000).toFixed(6); // m3

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white w-full max-w-5xl rounded-xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">

                {/* Header */}
                <div className="bg-[#1192a8] text-white px-6 py-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold uppercase tracking-wide">Tạo Mới Hồ Sơ Mặt Hàng (Master Data)</h2>
                    <button onClick={onClose} className="text-white hover:text-red-200 text-3xl leading-none">&times;</button>
                </div>

                {/* Body (Có thanh cuộn) */}
                <div className="p-6 overflow-y-auto flex-1 bg-gray-50 flex flex-col gap-6">

                    {/* Section 1: Thông tin chung (Vẫn giữ border) */}
                    <div className="bg-white p-5 border rounded-xl shadow-sm">
                        <h3 className="text-[#00529c] font-bold border-b pb-2 mb-4">1. THÔNG TIN ĐỊNH DANH CƠ BẢN</h3>

                        <div className="flex flex-col gap-5">
                            {/* Phân nửa trên: Ảnh bên trái, Form cơ bản bên phải */}
                            <div className="flex gap-6">
                                {/* Cột Trái: Xem trước hình ảnh */}
                                <div className="w-1/4 flex flex-col items-center">
                                    <div className="w-full aspect-square border border-gray-200 rounded-lg flex items-center justify-center mb-2 bg-gray-50 overflow-hidden text-gray-400">
                                        {formData.imageUrl ? (
                                            <img
                                                src={formData.imageUrl}
                                                alt="Preview"
                                                className="w-full h-full object-contain p-2"
                                                onError={(e) => { e.target.src = 'https://placehold.co/400x400/f87171/ffffff?text=Loi+Link+Anh'; }}
                                            />
                                        ) : (
                                            <span className="text-sm text-center">Xem trước<br/>ảnh minh họa</span>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-gray-500 text-center leading-relaxed">
                                        Ảnh sẽ tự động hiển thị khi bạn nhập URL hợp lệ.
                                    </p>
                                </div>

                                {/* Cột Phải: Các trường cơ bản */}
                                <div className="w-3/4 grid grid-cols-2 gap-4 h-fit">
                                    <FormInput label="Mã SKU (* Bắt buộc)" name="sku" value={formData.sku} onChange={handleInputChange} placeholder="VD: MILK-1L" />

                                    {/* Component Input có nút Quét mã */}
                                    <FormInputWithAction
                                        label="Mã vạch (Barcode)"
                                        name="barcode"
                                        value={formData.barcode}
                                        onChange={handleInputChange}
                                        placeholder="Nhập mã..."
                                        btnLabel="📷 Quét"
                                        onBtnClick={() => alert('Mở camera/máy quét')}
                                    />

                                    <div className="col-span-2">
                                        <FormInput label="Tên sản phẩm (* Bắt buộc)" name="name" value={formData.name} onChange={handleInputChange} placeholder="Nhập tên chi tiết hiển thị trên phiếu xuất/nhập" />
                                    </div>
                                    <div className="col-span-2">
                                        <FormInput
                                            label="Link ảnh sản phẩm (URL)"
                                            name="imageUrl"
                                            value={formData.imageUrl}
                                            onChange={handleInputChange}
                                            placeholder="https://example.com/image.jpg"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Phân nửa dưới: Các trường Select lùi sát trái (Trải dài full chiều rộng section 1) */}
                            <div className="grid grid-cols-4 gap-4 border-t pt-4 mt-2">
                                <FormSelectWithAction
                                    label="Đơn vị tính cơ bản"
                                    name="baseUnit"
                                    value={formData.baseUnit}
                                    onChange={handleInputChange}
                                    options={['Hộp', 'Thùng', 'Cái', 'Kg', 'Lốc', 'Pallet']}
                                    btnLabel="+"
                                    onBtnClick={() => alert('Thêm Đơn vị tính mới')}
                                />

                                <FormSelectWithAction
                                    label="Nhóm danh mục"
                                    name="categoryId"
                                    value={formData.categoryId}
                                    onChange={handleInputChange}
                                    options={[{ label: '1 - Thực phẩm/Sữa', value: 1 }, { label: '2 - Bánh kẹo', value: 2 }, { label: '3 - Gia dụng', value: 3 }]}
                                    isObjectOptions={true}
                                    btnLabel="+"
                                    onBtnClick={() => alert('Thêm Danh mục mới')}
                                />

                                {/* Nhà cung cấp chuyển thành Select Dropdown */}
                                <FormSelect
                                    label="Nhà cung cấp"
                                    name="supplierId"
                                    value={formData.supplierId}
                                    onChange={handleInputChange}
                                    options={[
                                        { label: 'Chọn nhà cung cấp...', value: '' },
                                        { label: 'Vinamilk (SUP-VNM)', value: '1' },
                                        { label: 'Masan (SUP-MSN)', value: '2' },
                                        { label: 'Samsung (SUP-SS)', value: '3' }
                                    ]}
                                    isObjectOptions={true}
                                />

                                <FormSelect
                                    label="Trạng thái kinh doanh"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    options={[{ label: 'Đang kinh doanh', value: 'ACTIVE' }, { label: 'Ngừng kinh doanh', value: 'INACTIVE' }]}
                                    isObjectOptions={true}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Logistic & Thể tích (Đã lùi sát trái full width) */}
                    <div className="bg-white p-5 border rounded-xl shadow-sm">
                        <h3 className="text-[#00529c] font-bold border-b pb-2 mb-4">2. QUY CÁCH LOGISTIC (KÍCH THƯỚC & TRỌNG LƯỢNG)</h3>

                        <div className="flex gap-8">
                            {/* Khu vực nhập liệu */}
                            <div className="w-2/3 grid grid-cols-2 gap-4">
                                <FormInput label="Trọng lượng (kg)" name="weight" type="number" value={formData.weight} onChange={handleInputChange} placeholder="0.00" />
                                <FormInput label="Chiều dài (cm)" name="length" type="number" value={formData.length} onChange={handleInputChange} placeholder="0.00" />
                                <FormInput label="Chiều rộng (cm)" name="width" type="number" value={formData.width} onChange={handleInputChange} placeholder="0.00" />
                                <FormInput label="Chiều cao (cm)" name="height" type="number" value={formData.height} onChange={handleInputChange} placeholder="0.00" />
                            </div>

                            {/* Khu vực Ước lượng tự động (Mới thêm) */}
                            <div className="w-1/3 bg-blue-50 border border-blue-200 rounded-lg p-4 flex flex-col justify-center">
                                <h4 className="text-[11px] font-bold text-blue-800 uppercase mb-3 border-b border-blue-200 pb-1">Thuộc tính ước lượng</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Diện tích đáy:</span>
                                        <span className="font-semibold text-gray-800">{area.toLocaleString()} cm²</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Thể tích:</span>
                                        <span className="font-semibold text-gray-800">{volume.toLocaleString()} cm³</span>
                                    </div>
                                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-blue-200">
                                        <span className="text-blue-900 font-bold">Quy đổi CBM:</span>
                                        <span className="font-black text-blue-700 text-lg">{cbm} m³</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Cảnh báo WMS (Đã lùi sát trái full width) */}
                    <div className="bg-white p-5 border rounded-xl shadow-sm">
                        <h3 className="text-[#00529c] font-bold border-b pb-2 mb-4">3. ĐIỀU KIỆN LƯU KHO & CẢNH BÁO</h3>
                        <div className="grid grid-cols-3 gap-6">
                            <FormSelect label="Yêu cầu nhiệt độ" name="storageTemp" value={formData.storageTemp} onChange={handleInputChange} options={['Bình thường (Nhiệt độ phòng)', 'Kho Mát (2-8°C)', 'Kho Lạnh (Dưới 0°C)', 'Tránh ánh sáng trực tiếp']} />
                            <FormInput label="Tồn kho an toàn" name="safetyStock" type="number" value={formData.safetyStock} onChange={handleInputChange} placeholder="Số lượng cảnh báo hết hàng" />

                            <div className="flex items-center justify-center border border-dashed border-red-300 bg-red-50 rounded-lg p-2 mt-5">
                                <input type="checkbox" id="isFragile" name="isFragile" checked={formData.isFragile} onChange={handleInputChange} className="w-5 h-5 text-red-600 rounded border-gray-300 focus:ring-red-500" />
                                <label htmlFor="isFragile" className="text-sm font-bold text-red-700 ml-2 cursor-pointer">Hàng dễ vỡ (Fragile)</label>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="flex justify-end gap-4 p-4 border-t border-gray-200 bg-white">
                    <button onClick={onClose} className="bg-gray-200 text-gray-700 px-6 py-2.5 rounded font-medium shadow-sm hover:bg-gray-300 transition">
                        Huỷ bỏ
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="bg-[#1192a8] text-white px-8 py-2.5 rounded font-bold shadow hover:bg-teal-700 transition disabled:opacity-50 flex items-center gap-2"
                    >
                        {isSubmitting ? 'ĐANG XỬ LÝ...' : 'LƯU HỒ SƠ'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Sub-components: Input thường
function FormInput({ label, type = "text", name, value, onChange, placeholder }) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">{label}</label>
            <input
                type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
        </div>
    );
}

// Sub-components: Input kèm Nút (Dùng cho Mã vạch)
function FormInputWithAction({ label, type = "text", name, value, onChange, placeholder, btnLabel, onBtnClick }) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">{label}</label>
            <div className="flex gap-2">
                <input
                    type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition min-w-0"
                />
                <button
                    type="button"
                    onClick={onBtnClick}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1.5 rounded text-sm font-medium transition whitespace-nowrap"
                >
                    {btnLabel}
                </button>
            </div>
        </div>
    );
}

// Sub-components: Select thường
function FormSelect({ label, name, value, onChange, options, isObjectOptions = false }) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">{label}</label>
            <select
                name={name} value={value} onChange={onChange}
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white transition"
            >
                {options.map((opt, idx) => {
                    const val = isObjectOptions ? opt.value : opt;
                    const display = isObjectOptions ? opt.label : opt;
                    return <option key={idx} value={val}>{display}</option>;
                })}
            </select>
        </div>
    );
}

// Sub-components: Select kèm Nút (Dùng cho Đơn vị, Danh mục)
function FormSelectWithAction({ label, name, value, onChange, options, isObjectOptions = false, btnLabel, onBtnClick }) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">{label}</label>
            <div className="flex gap-2">
                <select
                    name={name} value={value} onChange={onChange}
                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white transition min-w-0"
                >
                    {options.map((opt, idx) => {
                        const val = isObjectOptions ? opt.value : opt;
                        const display = isObjectOptions ? opt.label : opt;
                        return <option key={idx} value={val}>{display}</option>;
                    })}
                </select>
                <button
                    type="button"
                    onClick={onBtnClick}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1.5 rounded text-lg font-bold transition flex items-center justify-center"
                    title="Thêm mới"
                >
                    {btnLabel}
                </button>
            </div>
        </div>
    );
}