import React, { useEffect, useState } from 'react';
import SystemDialog from './SystemDialog';

const emptyFormData = {
    sku: '',
    barcode: '',
    name: '',
    baseUnit: 'Hộp',
    categoryId: '',
    weight: '',
    length: '',
    width: '',
    height: '',
    storageTemp: 'Bình thường',
    safetyStock: '',
    isFragile: false,
    imageUrl: '',
    status: 'ACTIVE',
    conversions: [] 
};

export default function ProductModal({ isOpen, onClose, onSuccess, product = null, mode = 'create' }) {
    const [formData, setFormData] = useState(emptyFormData);
    const [categories, setCategories] = useState([]);
    const [units, setUnits] = useState([]);
    
    const [newConvName, setNewConvName] = useState('');
    const [newConvFactor, setNewConvFactor] = useState('');

    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isCategorySubmitting, setIsCategorySubmitting] = useState(false);
    const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
    const [isUnitSubmitting, setIsUnitSubmitting] = useState(false);
    const [categoryForm, setCategoryForm] = useState({ categoryCode: '', name: '', description: '' });
    const [unitForm, setUnitForm] = useState({ unitCode: '', name: '', description: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [systemDialog, setSystemDialog] = useState(null);

    const normalizeUnitName = (value) => {
        if (!value) return '';
        const map = { 'H?p': 'Hộp', 'L?c': 'Lốc', 'V?i': 'Vỉ', 'Khay': 'Khay', 'Thùng': 'Thùng', 'Gói': 'Gói', 'Cái': 'Cái', 'Kg': 'Kg', 'Pallet': 'Pallet' };
        return map[value] || value;
    };

    const showMessage = (title, message) => {
        setSystemDialog({ variant: 'info', title, message });
    };

    useEffect(() => {
        if (!isOpen) return;

        const fetchData = async () => {
            try {
                const [resCat, resUnit] = await Promise.all([
                    fetch("http://localhost:8080/api/categories"),
                    fetch("http://localhost:8080/api/units")
                ]);
                const cats = resCat.ok ? await resCat.json() : [];
                const uns = resUnit.ok ? await resUnit.json() : [];
                setCategories(cats);
                setUnits(uns);

                if (mode === 'edit' && product) {
                    setFormData({
                        sku: product.sku || '',
                        barcode: product.barcode || '',
                        name: product.name || '',
                        baseUnit: normalizeUnitName(product.baseUnit) || 'Hộp',
                        categoryId: product.categoryId != null ? String(product.categoryId) : '',
                        weight: product.weight ?? '',
                        length: product.length ?? '',
                        width: product.width ?? '',
                        height: product.height ?? '',
                        storageTemp: product.storageTemp || 'Bình thường',
                        safetyStock: product.safetyStock ?? '',
                        isFragile: product.isFragile ?? product.fragile ?? false,
                        imageUrl: product.imageUrl || '',
                        status: product.status || 'ACTIVE',
                        conversions: product.conversions || []
                    });
                } else {
                    setFormData({
                        ...emptyFormData,
                        categoryId: cats[0]?.id ? String(cats[0].id) : '',
                        baseUnit: uns[0]?.name ? normalizeUnitName(uns[0].name) : 'Hộp'
                    });
                }
            } catch (error) {
                console.error("Lỗi tải dữ liệu Master Data", error);
            }
        };

        fetchData();
    }, [isOpen, mode, product]);

    useEffect(() => {
        if (!isOpen) return;
        const handleDismiss = (event) => {
            if (event.type === 'keydown' && event.key !== 'Escape') return;
            if (event.type === 'contextmenu') event.preventDefault();
            if (systemDialog) { setSystemDialog(null); return; }
            if (isCategoryModalOpen) { setIsCategoryModalOpen(false); return; }
            if (isUnitModalOpen) { setIsUnitModalOpen(false); return; }
            onClose();
        };
        window.addEventListener('keydown', handleDismiss);
        window.addEventListener('contextmenu', handleDismiss);
        return () => {
            window.removeEventListener('keydown', handleDismiss);
            window.removeEventListener('contextmenu', handleDismiss);
        };
    }, [isOpen, systemDialog, isCategoryModalOpen, isUnitModalOpen, onClose]);

    if (!isOpen) return null;

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleCategoryInputChange = (e) => setCategoryForm(p => ({ ...p, [e.target.name]: e.target.value }));
    const handleUnitInputChange = (e) => setUnitForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const openCategoryModal = () => { setCategoryForm({ categoryCode: '', name: '', description: '' }); setIsCategoryModalOpen(true); };
    const openUnitModal = () => { setUnitForm({ unitCode: '', name: '', description: '' }); setIsUnitModalOpen(true); };

    const handleCreateCategory = async () => {
        if (!categoryForm.categoryCode.trim() || !categoryForm.name.trim()) return showMessage("Thiếu dữ liệu", "Vui lòng nhập đầy đủ!");
        setIsCategorySubmitting(true);
        try {
            const res = await fetch("http://localhost:8080/api/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(categoryForm) });
            if (res.ok) {
                const created = await res.json();
                const next = await fetch("http://localhost:8080/api/categories").then(r => r.json());
                setCategories(next);
                setFormData(p => ({ ...p, categoryId: String(created.id) }));
                setIsCategoryModalOpen(false);
            } else showMessage("Lỗi", "Không thể lưu phân loại.");
        } catch (e) { showMessage("Lỗi", "Không thể kết nối máy chủ."); } finally { setIsCategorySubmitting(false); }
    };

    const handleCreateUnit = async () => {
        if (!unitForm.unitCode.trim() || !unitForm.name.trim()) return showMessage("Thiếu dữ liệu", "Vui lòng nhập đầy đủ!");
        setIsUnitSubmitting(true);
        try {
            const res = await fetch("http://localhost:8080/api/units", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(unitForm) });
            if (res.ok) {
                const created = await res.json();
                const next = await fetch("http://localhost:8080/api/units").then(r => r.json());
                setUnits(next);
                setFormData(p => ({ ...p, baseUnit: created.name }));
                setIsUnitModalOpen(false);
            } else showMessage("Lỗi", "Không thể lưu đơn vị.");
        } catch (e) { showMessage("Lỗi", "Không thể kết nối máy chủ."); } finally { setIsUnitSubmitting(false); }
    };

    const addConversion = () => {
        if (!newConvName || !newConvFactor) return showMessage("Thiếu dữ liệu", "Vui lòng nhập đầy đủ!");
        const factor = parseFloat(newConvFactor);
        if (isNaN(factor) || factor <= 0) return showMessage("Lỗi", "Hệ số phải > 0!");
        if (formData.conversions.some(c => c.unitName === newConvName)) return showMessage("Lỗi", "Đơn vị đã tồn tại!");
        setFormData(p => ({ ...p, conversions: [...p.conversions, { unitName: newConvName, conversionFactor: factor }] }));
        setNewConvName(''); setNewConvFactor('');
    };

    const removeConversion = (idx) => setFormData(p => ({ ...p, conversions: p.conversions.filter((_, i) => i !== idx) }));

    const handleSubmit = async () => {
        if (!formData.sku || !formData.name) return showMessage("Thiếu dữ liệu", "Mã SKU và Tên là bắt buộc!");
        setIsSubmitting(true);
        try {
            const payload = { ...formData, categoryId: formData.categoryId ? Number(formData.categoryId) : null };
            const res = await fetch(mode === 'edit' ? `http://localhost:8080/api/products/${product.id}` : "http://localhost:8080/api/products", {
                method: mode === 'edit' ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (res.ok) { onSuccess(); onClose(); }
            else showMessage("Lỗi", "Không thể lưu hồ sơ sản phẩm.");
        } catch (e) { showMessage("Lỗi", "Kết nối thất bại."); } finally { setIsSubmitting(false); }
    };

    const cbm = ((parseFloat(formData.length || 0) * parseFloat(formData.width || 0) * parseFloat(formData.height || 0)) / 1000000).toFixed(6);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[70] p-4">
            <div className="bg-white w-full max-w-5xl rounded-xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
                <div className="bg-[#1192a8] text-white px-6 py-4 flex justify-between items-center shrink-0">
                    <h2 className="text-xl font-bold uppercase tracking-wide">
                        {mode === 'edit' ? 'Cập Nhật Hồ Sơ Mặt Hàng' : 'Tạo Mới Hồ Sơ Mặt Hàng'}
                    </h2>
                    <button onClick={onClose} className="text-white hover:text-red-200 text-3xl leading-none">&times;</button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 bg-gray-50 flex flex-col gap-6">
                    <div className="bg-white p-5 border rounded-xl shadow-sm">
                        <h3 className="text-[#00529c] font-bold border-b pb-2 mb-4 uppercase text-sm">1. Thông tin định danh cơ bản</h3>
                        <div className="flex gap-6">
                            <div className="w-1/4 flex flex-col items-center">
                                <div className="w-full aspect-square border border-gray-200 rounded-lg flex items-center justify-center mb-2 bg-gray-50 overflow-hidden">
                                    {formData.imageUrl ? <img src={formData.imageUrl} className="w-full h-full object-contain p-2" alt="" /> : <span className="text-xs text-gray-400">Ảnh minh họa</span>}
                                </div>
                                <FormInput label="Link ảnh (URL)" name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} placeholder="https://..." />
                            </div>
                            <div className="w-3/4 grid grid-cols-2 gap-4">
                                <FormInput label="Mã SKU (*)" name="sku" value={formData.sku} onChange={handleInputChange} placeholder="VD: MILK-1L" />
                                <FormInput label="Mã vạch (Barcode)" name="barcode" value={formData.barcode} onChange={handleInputChange} placeholder="Quét hoặc nhập mã..." />
                                <div className="col-span-2"><FormInput label="Tên sản phẩm (*)" name="name" value={formData.name} onChange={handleInputChange} placeholder="Nhập tên sản phẩm..." /></div>
                                <FormSelectWithAction 
                                    label="Đơn vị tính cơ sở" name="baseUnit" value={formData.baseUnit} onChange={handleInputChange} 
                                    options={units.map(u => ({ label: `${u.unitCode} - ${u.name}`, value: u.name }))} isObjectOptions btnLabel="+" onBtnClick={openUnitModal} 
                                />
                                <FormSelectWithAction 
                                    label="Phân loại" name="categoryId" value={formData.categoryId} onChange={handleInputChange}
                                    options={categories.map(c => ({ label: `${c.categoryCode} - ${c.name}`, value: String(c.id) }))} isObjectOptions btnLabel="+" onBtnClick={openCategoryModal} 
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-5 border rounded-xl shadow-sm border-blue-100">
                        <h3 className="text-[#1192a8] font-bold border-b pb-2 mb-4 uppercase text-sm flex justify-between">
                            2. Thiết lập quy đổi đơn vị (Packaging Hierarchy)
                            <span className="text-[10px] text-gray-400 font-normal normal-case italic">* Giúp hệ thống tự động gợi ý vị trí kho phù hợp</span>
                        </h3>
                        <div className="grid grid-cols-12 gap-4 items-end bg-blue-50/50 p-4 rounded-lg border border-dashed border-blue-200 mb-4">
                            <div className="col-span-4">
                                <FormSelect label="Đơn vị quy đổi" value={newConvName} onChange={(e) => setNewConvName(e.target.value)} options={['', ...units.map(u => u.name).filter(n => n !== formData.baseUnit)]} />
                            </div>
                            <div className="col-span-5">
                                <label className="text-[11px] font-bold text-gray-500 uppercase mb-1 block">Hệ số: 1 [Mới] = ? [{formData.baseUnit}]</label>
                                <input type="number" value={newConvFactor} onChange={(e) => setNewConvFactor(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none" placeholder="VD: 24" />
                            </div>
                            <div className="col-span-3">
                                <button onClick={addConversion} className="w-full bg-[#1192a8] text-white font-bold py-2 rounded shadow hover:bg-teal-700 transition">+ THÊM QUY ĐỔI</button>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {formData.conversions.length > 0 ? formData.conversions.map((c, i) => (
                                <div key={i} className="flex items-center gap-2 bg-white border-2 border-[#1192a8] rounded-full pl-4 pr-2 py-1 shadow-sm animate-in fade-in zoom-in duration-200">
                                    <span className="text-sm font-bold text-gray-700">1 {c.unitName}</span>
                                    <span className="text-xs text-gray-400">=</span>
                                    <span className="text-sm font-black text-[#1192a8]">{c.conversionFactor} {formData.baseUnit}</span>
                                    <button onClick={() => removeConversion(i)} className="ml-2 w-5 h-5 flex items-center justify-center bg-gray-100 text-gray-400 rounded-full hover:bg-red-500 hover:text-white transition">&times;</button>
                                </div>
                            )) : <p className="w-full text-center text-gray-400 text-xs italic py-2">Hiện sản phẩm này chỉ được quản lý theo đơn vị lẻ.</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white p-5 border rounded-xl shadow-sm">
                            <h3 className="text-[#00529c] font-bold border-b pb-2 mb-4 uppercase text-sm">3. Quy cách Logistics</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <FormInput label="Trọng lượng (kg)" name="weight" type="number" value={formData.weight} onChange={handleInputChange} placeholder="0.00" />
                                <FormInput label="Chiều dài (cm)" name="length" type="number" value={formData.length} onChange={handleInputChange} placeholder="0.00" />
                                <FormInput label="Chiều rộng (cm)" name="width" type="number" value={formData.width} onChange={handleInputChange} placeholder="0.00" />
                                <FormInput label="Chiều cao (cm)" name="height" type="number" value={formData.height} onChange={handleInputChange} placeholder="0.00" />
                            </div>
                            <div className="mt-4 p-3 bg-slate-50 rounded border text-[10px] text-slate-500 flex justify-between">
                                <span>Thể tích: <strong>{cbm} m³</strong></span>
                                <span>Diện tích đáy: <strong>{(parseFloat(formData.length || 0) * parseFloat(formData.width || 0)).toLocaleString()} cm²</strong></span>
                            </div>
                        </div>
                        <div className="bg-white p-5 border rounded-xl shadow-sm">
                            <h3 className="text-[#00529c] font-bold border-b pb-2 mb-4 uppercase text-sm">4. Điều kiện & Cảnh báo</h3>
                            <div className="space-y-4">
                                <FormSelect label="Nhiệt độ lưu kho" name="storageTemp" value={formData.storageTemp} onChange={handleInputChange} options={['Bình thường', 'Kho Mát (2-8°C)', 'Kho Lạnh (Dưới 0°C)']} />
                                <FormInput label="Tồn kho an toàn" name="safetyStock" type="number" value={formData.safetyStock} onChange={handleInputChange} placeholder="VD: 50" />
                                <div className="flex items-center gap-3 bg-red-50 p-3 rounded-lg border border-dashed border-red-200 mt-2">
                                    <input type="checkbox" id="isFragile" name="isFragile" checked={formData.isFragile} onChange={handleInputChange} className="w-5 h-5 text-red-600 rounded" />
                                    <label htmlFor="isFragile" className="text-xs font-black text-red-700 cursor-pointer uppercase">⚠️ Hàng dễ vỡ (Fragile)</label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4 p-4 border-t bg-white shrink-0">
                    <button onClick={onClose} className="px-6 py-2 text-gray-500 font-bold hover:underline">HỦY BỎ</button>
                    <button onClick={handleSubmit} disabled={isSubmitting} className="bg-[#1192a8] text-white px-10 py-2.5 rounded-lg font-black shadow-lg hover:bg-teal-700 transition-all active:scale-95 disabled:opacity-50">
                        {isSubmitting ? 'ĐANG XỬ LÝ...' : 'LƯU HỒ SƠ SẢN PHẨM'}
                    </button>
                </div>

                {isCategoryModalOpen && (
                    <QuickAddModal 
                        title="Thêm phân loại mới" 
                        fields={[
                            {label:'Mã phân loại', name:'categoryCode', placeholder: 'VD: CAT-SUA'}, 
                            {label:'Tên phân loại', name:'name', placeholder: 'VD: Sữa & Đồ uống'}
                        ]} 
                        form={categoryForm} 
                        onChange={handleCategoryInputChange} 
                        onCancel={()=>setIsCategoryModalOpen(false)} 
                        onSave={handleCreateCategory} 
                        loading={isCategorySubmitting} 
                    />
                )}
                {isUnitModalOpen && (
                    <QuickAddModal 
                        title="Thêm đơn vị tính mới" 
                        fields={[
                            {label:'Mã đơn vị', name:'unitCode', placeholder: 'VD: UNIT-THUNG'}, 
                            {label:'Tên đơn vị', name:'name', placeholder: 'VD: Thùng'}
                        ]} 
                        form={unitForm} 
                        onChange={handleUnitInputChange} 
                        onCancel={()=>setIsUnitModalOpen(false)} 
                        onSave={handleCreateUnit} 
                        loading={isUnitSubmitting} 
                    />
                )}
                <SystemDialog isOpen={!!systemDialog} {...systemDialog} onClose={() => setSystemDialog(null)} />
            </div>
        </div>
    );
}

function FormInput({ label, type = "text", name, value, onChange, placeholder }) {
    return (
        <div className="flex flex-col gap-1 text-left">
            <label className="text-[11px] font-bold text-gray-500 uppercase">{label}</label>
            <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} className="border border-gray-300 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none transition-all placeholder:text-gray-300 text-gray-800" />
        </div>
    );
}

function FormSelect({ label, name, value, onChange, options, isObjectOptions = false }) {
    return (
        <div className="flex flex-col gap-1 text-left">
            <label className="text-[11px] font-bold text-gray-500 uppercase">{label}</label>
            <select name={name} value={value} onChange={onChange} className="border border-gray-300 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none bg-white transition-all text-gray-800">
                {options.map((opt, i) => <option key={i} value={isObjectOptions ? opt.value : opt}>{isObjectOptions ? opt.label : opt}</option>)}
            </select>
        </div>
    );
}

function FormSelectWithAction({ label, name, value, onChange, options, isObjectOptions, btnLabel, onBtnClick }) {
    return (
        <div className="flex flex-col gap-1 text-left">
            <label className="text-[11px] font-bold text-gray-500 uppercase">{label}</label>
            <div className="flex gap-2">
                <select name={name} value={value} onChange={onChange} className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none bg-white transition-all text-gray-800">
                    {options.map((opt, i) => <option key={i} value={isObjectOptions ? opt.value : opt}>{isObjectOptions ? opt.label : opt}</option>)}
                </select>
                <button type="button" onClick={onBtnClick} className="bg-blue-50 text-blue-600 px-3 py-1 rounded font-bold hover:bg-blue-100 transition-colors">{btnLabel}</button>
            </div>
        </div>
    );
}

function QuickAddModal({ title, fields, form, onChange, onCancel, onSave, loading }) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[80] p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
                <div className="bg-[#1192a8] text-white px-5 py-3 flex justify-between items-center">
                    <h3 className="text-base font-bold uppercase">{title}</h3>
                    <button onClick={onCancel} className="text-2xl leading-none">&times;</button>
                </div>
                <div className="p-5 space-y-4">
                    {fields.map(f => (
                        <FormInput 
                            key={f.name} 
                            label={f.label} 
                            name={f.name} 
                            value={form[f.name]} 
                            onChange={onChange} 
                            placeholder={f.placeholder}
                        />
                    ))}
                </div>
                <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
                    <button onClick={onCancel} className="px-4 py-2 text-gray-500 font-bold text-sm">HỦY</button>
                    <button onClick={onSave} disabled={loading} className="bg-[#1192a8] text-white px-6 py-2 rounded font-bold shadow hover:bg-teal-700 disabled:opacity-50">{loading ? 'ĐANG LƯU...' : 'XÁC NHẬN'}</button>
                </div>
            </div>
        </div>
    );
}
