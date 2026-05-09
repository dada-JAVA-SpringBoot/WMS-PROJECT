import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { useModalDismiss } from './useModalDismiss';

const API = '/api/suppliers';
const emptyForm = { supplierCode: '', name: '', phone: '', address: '' };

export default function SupplierModal({ isOpen, onClose, onSaved, editData }) {
    const isEdit = !!editData;
    useModalDismiss(isOpen, onClose);

    const [form, setForm] = useState(emptyForm);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            setForm(editData ? {
                supplierCode: editData.supplierCode || '',
                name: editData.name || '',
                phone: editData.phone || '',
                address: editData.address || '',
            } : emptyForm);
            setErrors({});
        }
    }, [isOpen, editData]);

    if (!isOpen) return null;

    const validate = () => {
        const e = {};
        if (!form.supplierCode.trim()) e.supplierCode = 'Vui lòng nhập mã nhà cung cấp';
        if (!form.name.trim()) e.name = 'Vui lòng nhập tên nhà cung cấp';
        return e;
    };

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
    };

    const handleSubmit = async () => {
        const e = validate();
        if (Object.keys(e).length > 0) { setErrors(e); return; }
        setLoading(true);
        try {
            const url = isEdit ? `${API}/${editData.id}` : API;
            if (isEdit) {
                await axiosClient.put(url, form);
            } else {
                await axiosClient.post(url, form);
            }
            onSaved();
            onClose();
        } catch (err) {
            alert('Có lỗi xảy ra: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">

                {/* Header */}
                <div className="bg-gradient-to-r from-[#00529c] to-[#1192a8] px-8 py-5 flex items-center justify-between">
                    <div>
                        <h2 className="text-white font-bold text-lg">
                            {isEdit ? 'Chỉnh sửa nhà cung cấp' : 'Thêm nhà cung cấp mới'}
                        </h2>
                        <p className="text-white/70 text-xs mt-0.5">
                            {isEdit ? `Đang sửa: ${editData.name}` : 'Điền thông tin để tạo nhà cung cấp'}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-white/70 hover:text-white text-2xl leading-none transition-colors">×</button>
                </div>

                {/* Body */}
                <div className="px-8 py-6 space-y-5">
                    <Field
                        label="Mã nhà cung cấp"
                        required
                        value={form.supplierCode}
                        onChange={v => handleChange('supplierCode', v)}
                        placeholder="VD: SUP-001"
                        error={errors.supplierCode}
                        disabled={isEdit}
                    />
                    <Field
                        label="Tên nhà cung cấp"
                        required
                        value={form.name}
                        onChange={v => handleChange('name', v)}
                        placeholder="VD: Công ty TNHH ABC"
                        error={errors.name}
                    />
                    <Field
                        label="Số điện thoại"
                        value={form.phone}
                        onChange={v => handleChange('phone', v)}
                        placeholder="VD: 02812345678"
                        type="tel"
                    />
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Địa chỉ</label>
                        <textarea
                            rows={2}
                            value={form.address}
                            onChange={e => handleChange('address', e.target.value)}
                            placeholder="VD: Khu công nghiệp Tân Bình, TP.HCM"
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1192a8]/25 focus:border-[#1192a8] transition-all resize-none"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-100 transition-all"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-7 py-2.5 rounded-xl text-sm font-bold text-white bg-[#1192a8] hover:bg-teal-700 hover:shadow-lg hover:shadow-teal-500/30 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading && <span className="animate-spin text-base">↻</span>}
                        {isEdit ? 'Lưu thay đổi' : 'Thêm mới'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function Field({ label, value, onChange, placeholder, error, required, type = 'text', disabled = false }) {
    return (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all
                    ${disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-white'}
                    ${error
                        ? 'border-red-400 focus:ring-red-200 focus:border-red-400'
                        : 'border-gray-200 focus:ring-[#1192a8]/25 focus:border-[#1192a8]'
                    }`}
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
}
