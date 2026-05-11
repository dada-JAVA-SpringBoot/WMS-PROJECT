import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { useModalDismiss } from './useModalDismiss';

const API = '/api/customers';
const emptyForm = { customerCode: '', name: '', phone: '', address: '' };

export default function ClientModal({ isOpen, onClose, onSaved, editData }) {
    const isEdit = !!editData;
    useModalDismiss(isOpen, onClose);

    const [form, setForm] = useState(emptyForm);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            setForm(editData ? {
                customerCode: editData.customerCode || '',
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
        if (!form.customerCode.trim()) e.customerCode = 'Vui lòng nhập mã khách hàng';
        if (!form.name.trim()) e.name = 'Vui lòng nhập tên khách hàng';
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-2 md:p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[98vh] md:max-h-[90vh]">

                {/* Header */}
                <div className="bg-gradient-to-r from-[#00529c] to-[#1192a8] px-5 md:px-8 py-4 md:py-5 flex items-center justify-between shrink-0">
                    <div className="min-w-0">
                        <h2 className="text-white font-bold text-base md:text-lg truncate">
                            {isEdit ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng mới'}
                        </h2>
                        <p className="text-white/70 text-[10px] md:text-xs mt-0.5 truncate">
                            {isEdit ? `Đang sửa: ${editData.name}` : 'Điền thông tin để tạo khách hàng'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/70 hover:text-white text-2xl leading-none transition-colors ml-4"
                    >×</button>
                </div>

                {/* Body */}
                <div className="px-5 md:px-8 py-4 md:py-6 space-y-4 md:space-y-5 overflow-y-auto flex-1">
                    <Field
                        label="Mã khách hàng"
                        required
                        value={form.customerCode}
                        onChange={v => handleChange('customerCode', v)}
                        placeholder="VD: CUS-001"
                        error={errors.customerCode}
                        disabled={isEdit}
                    />
                    <Field
                        label="Tên khách hàng"
                        required
                        value={form.name}
                        onChange={v => handleChange('name', v)}
                        placeholder="VD: Nguyễn Văn A"
                        error={errors.name}
                    />
                    <Field
                        label="Số điện thoại"
                        value={form.phone}
                        onChange={v => handleChange('phone', v)}
                        placeholder="VD: 0987654321"
                        type="tel"
                    />
                    <div>
                        <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5 ml-1">
                            Địa chỉ liên hệ
                        </label>
                        <textarea
                            rows={2}
                            value={form.address}
                            onChange={e => handleChange('address', e.target.value)}
                            placeholder="VD: 123 Đường ABC, Quận 1, TP.HCM"
                            className="w-full border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1192a8]/25 focus:border-[#1192a8] transition-all resize-none bg-white"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="px-5 md:px-8 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row justify-end gap-3 shrink-0">
                    <button
                        onClick={onClose}
                        className="order-2 sm:order-1 px-6 py-2.5 rounded-2xl text-sm font-black text-gray-400 bg-white border border-gray-100 hover:bg-gray-100 transition-all uppercase tracking-widest"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="order-1 sm:order-2 px-7 py-3 rounded-2xl text-xs font-black text-white bg-[#1192a8] hover:bg-teal-700 hover:shadow-lg shadow-xl shadow-teal-500/20 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-widest"
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
