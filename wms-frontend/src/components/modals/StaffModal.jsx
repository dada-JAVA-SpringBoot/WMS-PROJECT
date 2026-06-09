import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { useModalDismiss } from './useModalDismiss';

const API = '/api/staff';

const CONTRACT_TYPES = [
    { value: 'PERMANENT',  label: 'Hợp đồng vô thời hạn' },
    { value: 'PART_TIME',  label: 'Bán thời gian (Part-time)' },
    { value: 'SEASONAL',   label: 'Hợp đồng thời vụ' },
    { value: 'EXPIRED',    label: 'Hợp đồng hết hạn (Nghỉ việc)' },
];

const WAREHOUSE_ROLES = [
    { value: 'WAREHOUSE_MANAGER',  label: 'Quản lý kho (Admin/Manager)' },
    { value: 'WAREHOUSE_KEEPER',   label: 'Thủ kho (Storekeeper)' },
    { value: 'INBOUND_STAFF',      label: 'Nhân viên nhập kho' },
    { value: 'OUTBOUND_STAFF',     label: 'Nhân viên xuất kho' },
    { value: 'QUALITY_CONTROL',    label: 'Kiểm duyệt (QC) — Kiểm tra, duyệt phiếu' },
    { value: 'INVENTORY_CHECKER',  label: 'Kiểm kê viên (Checker)' },
    { value: 'HANDLER',            label: 'NV Điều chuyển (Internal)' },
    { value: 'ACCOUNTANT',         label: 'Kế toán kho' },
    { value: 'INTERN',             label: 'Thực tập sinh' },
];

const PRESET_SHIFTS = [
    { label: '-- Tùy chỉnh --', start: '', end: '' },
    { label: 'Ca Sáng (06:00 - 14:00)', start: '06:00', end: '14:00' },
    { label: 'Ca Chiều (14:00 - 22:00)', start: '14:00', end: '22:00' },
    { label: 'Ca Đêm (22:00 - 06:00)', start: '22:00', end: '06:00' },
    { label: 'Giờ Hành Chính (08:00 - 17:00)', start: '08:00', end: '17:00' },
];

const emptyForm = {
    employeeCode: '', fullName: '', gender: 'MALE', dateOfBirth: '',
    phone: '', email: '', hireDate: '', contractType: 'PERMANENT',
    warehouseRole: 'INBOUND_STAFF', notes: '',
    username: '', password: '',
    shiftStartTime: '08:00', shiftEndTime: '17:00'
};

export default function StaffModal({ isOpen, onClose, onSaved, editData }) {
    const isEdit = !!editData;
    useModalDismiss(isOpen, onClose);
    const [form, setForm] = useState(emptyForm);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [selectedPreset, setSelectedPreset] = useState(0);

    useEffect(() => {
        if (isOpen) {
            if (editData) {
                setForm({
                    employeeCode:  editData.employeeCode  || '',
                    fullName:      editData.fullName      || '',
                    gender:        editData.gender        || 'MALE',
                    dateOfBirth:   editData.dateOfBirth   || '',
                    phone:         editData.phone         || '',
                    email:         editData.email         || '',
                    hireDate:      editData.hireDate      || '',
                    contractType:  editData.contractType  || 'PERMANENT',
                    warehouseRole: editData.warehouseRole || 'INBOUND_STAFF',
                    notes:         editData.notes         || '',
                    username:      editData.username      || '',
                    password:      '',
                    shiftStartTime: editData.shiftStartTime || '08:00',
                    shiftEndTime:   editData.shiftEndTime   || '17:00'
                });
            } else {
                setForm(emptyForm);
            }
            setErrors({});
            setSelectedPreset(0);
        }
    }, [isOpen, editData]);

    if (!isOpen) return null;

    const handlePresetChange = (idx) => {
        const preset = PRESET_SHIFTS[idx];
        setSelectedPreset(idx);
        if (preset.start && preset.end) {
            setForm(prev => ({ ...prev, shiftStartTime: preset.start, shiftEndTime: preset.end }));
        }
    };

    const validate = () => {
        const e = {};
        if (!form.employeeCode.trim()) e.employeeCode = 'Vui lòng nhập mã nhân viên';
        if (!form.fullName.trim())     e.fullName     = 'Vui lòng nhập họ tên';
        
        if (!isEdit) {
            if (!form.username.trim()) e.username = 'Vui lòng nhập tên đăng nhập';
            if (!form.password.trim()) e.password = 'Vui lòng nhập mật khẩu';
        }

        if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
            e.email = 'Email không đúng định dạng';
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
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[98vh] md:max-h-[90vh]">

                {/* Header */}
                <div className="bg-gradient-to-r from-[#00529c] to-[#1192a8] px-5 md:px-8 py-4 md:py-5 flex items-center justify-between shrink-0">
                    <div className="min-w-0">
                        <h2 className="text-white font-bold text-base md:text-lg truncate">
                            {isEdit ? 'Chỉnh sửa nhân sự' : 'Thêm nhân sự & Tài khoản'}
                        </h2>
                        <p className="text-white/70 text-[10px] md:text-xs mt-0.5 truncate">
                            {isEdit ? `Đang sửa: ${editData.fullName}` : 'Tạo hồ sơ nhân viên kèm tài khoản đăng nhập'}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-white/70 hover:text-white text-2xl leading-none transition-colors ml-4">&times;</button>
                </div>

                {/* Body */}
                <div className="px-5 md:px-8 py-4 md:py-6 space-y-4 md:space-y-5 overflow-y-auto flex-1 custom-scrollbar">

                    {/* Section: Tài khoản đăng nhập */}
                    {!isEdit && (
                        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                            <h3 className="text-[#00529c] font-black text-[11px] md:text-sm mb-3 flex items-center gap-2 uppercase">
                                <span className="w-5 h-5 bg-[#00529c] text-white rounded-full flex items-center justify-center text-[10px]">1</span>
                                THÔNG TIN ĐĂNG NHẬP
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field label="Tên đăng nhập" required value={form.username}
                                    onChange={v => handleChange('username', v)}
                                    placeholder="VD: nguyenvan_a" error={errors.username} />
                                <Field label="Mật khẩu" required type="password" value={form.password}
                                    onChange={v => handleChange('password', v)}
                                    placeholder="********" error={errors.password} />
                            </div>
                        </div>
                    )}

                    <h3 className="text-gray-800 font-black text-[11px] md:text-sm mb-1 flex items-center gap-2 uppercase tracking-wide">
                        <span className="w-5 h-5 bg-gray-800 text-white rounded-full flex items-center justify-center text-[10px]">{isEdit ? '1' : '2'}</span>
                        HỒ SƠ CÁ NHÂN
                    </h3>

                    {/* Hàng 1: Mã NV + Họ tên */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Mã nhân viên" required value={form.employeeCode}
                            onChange={v => handleChange('employeeCode', v)}
                            placeholder="VD: EMP-001" error={errors.employeeCode} disabled={isEdit} />
                        <Field label="Họ và tên" required value={form.fullName}
                            onChange={v => handleChange('fullName', v)}
                            placeholder="VD: Nguyễn Văn A" error={errors.fullName} />
                    </div>

                    {/* Hàng 2: Giới tính + Ngày sinh */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <SelectField label="Giới tính" value={form.gender}
                            onChange={v => handleChange('gender', v)}
                            options={[{ value: 'MALE', label: 'Nam' }, { value: 'FEMALE', label: 'Nữ' }]} />
                        <Field label="Ngày sinh" type="date" value={form.dateOfBirth}
                            onChange={v => handleChange('dateOfBirth', v)} />
                    </div>

                    {/* Hàng 3: SĐT + Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Số điện thoại" type="tel" value={form.phone}
                            onChange={v => handleChange('phone', v)} placeholder="VD: 0901234567" />
                        <Field label="Email" type="email" value={form.email}
                            onChange={v => handleChange('email', v)}
                            placeholder="VD: nhanvien@wms.vn" error={errors.email} />
                    </div>

                    <h3 className="text-gray-800 font-black text-[11px] md:text-sm mb-1 flex items-center gap-2 uppercase tracking-wide">
                        <span className="w-5 h-5 bg-gray-800 text-white rounded-full flex items-center justify-center text-[10px]">{isEdit ? '2' : '3'}</span>
                        CÔNG VIỆC & PHÂN QUYỀN
                    </h3>

                    {/* Hàng 4: Ngày vào làm + Hợp đồng */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Ngày vào làm" type="date" value={form.hireDate}
                            onChange={v => handleChange('hireDate', v)} />
                        <SelectField label="Loại hợp đồng" value={form.contractType}
                            onChange={v => handleChange('contractType', v)} options={CONTRACT_TYPES} />
                    </div>

                    {/* Hàng 5: Vai trò */}
                    <div className="grid grid-cols-1">
                        <SelectField label="Vai trò gán quyền" value={form.warehouseRole}
                            onChange={v => handleChange('warehouseRole', v)} options={WAREHOUSE_ROLES} />
                    </div>

                    <h3 className="text-[#1192a8] font-black text-[11px] md:text-sm mb-1 flex items-center gap-2 uppercase tracking-wide">
                        <span className="w-5 h-5 bg-[#1192a8] text-white rounded-full flex items-center justify-center text-[10px]">{isEdit ? '3' : '4'}</span>
                        THIẾT LẬP CA LÀM VIỆC
                    </h3>

                    <div className="bg-cyan-50/50 p-4 rounded-2xl border border-cyan-100 space-y-4">
                        <SelectField 
                            label="Chọn nhanh khung giờ" 
                            value={selectedPreset}
                            onChange={v => handlePresetChange(parseInt(v))}
                            options={PRESET_SHIFTS.map((p, i) => ({ value: i, label: p.label }))} 
                        />
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Giờ bắt đầu</label>
                                <input 
                                    type="time" 
                                    value={form.shiftStartTime}
                                    onChange={e => handleChange('shiftStartTime', e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1192a8]/25 focus:border-[#1192a8] bg-white transition-all font-mono font-bold"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Giờ kết thúc</label>
                                <input 
                                    type="time" 
                                    value={form.shiftEndTime}
                                    onChange={e => handleChange('shiftEndTime', e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1192a8]/25 focus:border-[#1192a8] bg-white transition-all font-mono font-bold"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Ghi chú */}
                    <div>
                        <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5 ml-1">Ghi chú / Ca làm việc</label>
                        <textarea rows={2} value={form.notes}
                            onChange={e => handleChange('notes', e.target.value)}
                            placeholder="VD: Ca sáng thứ 2-6, phụ trách khu A..."
                            className="w-full border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1192a8]/25 focus:border-[#1192a8] transition-all resize-none"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="px-5 md:px-8 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row justify-end gap-3 shrink-0">
                    <button onClick={onClose}
                        className="order-2 sm:order-1 px-6 py-2.5 rounded-2xl text-sm font-black text-gray-400 bg-white border border-gray-100 hover:bg-gray-100 transition-all uppercase tracking-widest">
                        Hủy
                    </button>
                    <button onClick={handleSubmit} disabled={loading}
                        className="order-1 sm:order-2 px-7 py-3 rounded-2xl text-xs font-black text-white bg-[#1192a8] hover:bg-teal-700 hover:shadow-lg shadow-xl shadow-teal-500/20 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-widest">
                        {loading && <span className="animate-spin text-base">↻</span>}
                        {isEdit ? 'Lưu thay đổi' : 'Tạo nhân viên'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function Field({ label, value, onChange, placeholder, error, required, type = 'text', disabled = false }) {
    return (
        <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-tight mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input type={type} value={value} onChange={e => onChange(e.target.value)}
                placeholder={placeholder} disabled={disabled}
                className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all
                    ${disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-white'}
                    ${error ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:ring-[#1192a8]/25 focus:border-[#1192a8]'}`}
            />
            {error && <p className="text-[10px] text-red-500 mt-1 font-medium">{error}</p>}
        </div>
    );
}

function SelectField({ label, value, onChange, options }) {
    return (
        <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-tight mb-1">{label}</label>
            <select value={value} onChange={e => onChange(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1192a8]/25 focus:border-[#1192a8] bg-white transition-all cursor-pointer">
                {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
        </div>
    );
}