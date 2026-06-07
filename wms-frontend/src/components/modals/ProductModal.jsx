import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
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
    conversions: [],
    supplierIds: [] // Mới: Danh sách ID nhà cung cấp
};

export default function ProductModal({ isOpen, onClose, onSuccess, product = null, mode = 'create' }) {
    const [formData, setFormData] = useState(emptyFormData);
    const [categories, setCategories] = useState([]);
    const [units, setUnits] = useState([]);
    const [suppliers, setSuppliers] = useState([]); // Danh sách NCC để chọn
    
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
                const [resCat, resUnit, resSup] = await Promise.all([
                    axiosClient.get("/api/categories"),
                    axiosClient.get("/api/units"),
                    axiosClient.get("/api/suppliers")
                ]);
                const cats = resCat.data || [];
                const uns = resUnit.data || [];
                const sups = resSup.data || [];
                setCategories(cats);
                setUnits(uns);
                setSuppliers(sups);

                if (mode === 'edit' && product) {
                    // Lấy chi tiết nhà cung cấp của SP nếu đang sửa
                    let productSupIds = [];
                    try {
                        const resPS = await axiosClient.get(`/api/products/${product.id}/suppliers`);
                        productSupIds = resPS.data.map(ps => ps.supplierId);
                    } catch { /* SP mới chưa có link */ }

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
                        conversions: product.conversions || [],
                        supplierIds: productSupIds
                    });
                } else {
                    setFormData({
                        ...emptyFormData,
                        categoryId: cats[0]?.id ? String(cats[0].id) : '',
                        baseUnit: uns[0]?.name ? normalizeUnitName(uns[0].name) : 'Hộp',
                        supplierIds: []
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

    const handleSupplierToggle = (id) => {
        setFormData(prev => {
            const current = prev.supplierIds || [];
            if (current.includes(id)) return { ...prev, supplierIds: current.filter(x => x !== id) };
            return { ...prev, supplierIds: [...current, id] };
        });
    };

    const handleCategoryInputChange = (e) => setCategoryForm(p => ({ ...p, [e.target.name]: e.target.value }));
    const handleUnitInputChange = (e) => setUnitForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const openCategoryModal = () => { setCategoryForm({ categoryCode: '', name: '', description: '' }); setIsCategoryModalOpen(true); };
    const openUnitModal = () => { setUnitForm({ unitCode: '', name: '', description: '' }); setIsUnitModalOpen(true); };

    const handleCreateCategory = async () => {
        if (!categoryForm.categoryCode.trim() || !categoryForm.name.trim()) return showMessage("Thiếu dữ liệu", "Vui lòng nhập đầy đủ!");
        setIsCategorySubmitting(true);
        try {
            const res = await axiosClient.post("/api/categories", categoryForm);
            const created = res.data;
            const nextRes = await axiosClient.get("/api/categories");
            setCategories(nextRes.data);
            setFormData(p => ({ ...p, categoryId: String(created.id) }));
            setIsCategoryModalOpen(false);
        } catch { showMessage("Lỗi", "Không thể lưu phân loại."); } finally { setIsCategorySubmitting(false); }
    };

    const handleCreateUnit = async () => {
        if (!unitForm.unitCode.trim() || !unitForm.name.trim()) return showMessage("Thiếu dữ liệu", "Vui lòng nhập đầy đủ!");
        setIsUnitSubmitting(true);
        try {
            const res = await axiosClient.post("/api/units", unitForm);
            const created = res.data;
            const nextRes = await axiosClient.get("/api/units");
            setUnits(nextRes.data);
            setFormData(p => ({ ...p, baseUnit: created.name }));
            setIsUnitModalOpen(false);
        } catch { showMessage("Lỗi", "Không thể lưu đơn vị."); } finally { setIsUnitSubmitting(false); }
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
            // Chuẩn hóa dữ liệu trước khi gửi: Chuyển chuỗi trống thành null cho các trường số
            const payload = { 
                ...formData, 
                categoryId: formData.categoryId ? Number(formData.categoryId) : null,
                weight:      formData.weight      === '' ? null : Number(formData.weight),
                length:      formData.length      === '' ? null : Number(formData.length),
                width:       formData.width       === '' ? null : Number(formData.width),
                height:      formData.height      === '' ? null : Number(formData.height),
                safetyStock: formData.safetyStock === '' ? null : Number(formData.safetyStock)
            };

            const url = mode === 'edit' ? `/api/products/${product.id}` : "/api/products";
            let savedProduct;
            if (mode === 'edit') {
                const res = await axiosClient.put(url, payload);
                savedProduct = res.data;
            } else {
                const res = await axiosClient.post(url, payload);
                savedProduct = res.data;
            }

            // Lưu liên kết nhà cung cấp
            await axiosClient.post(`/api/products/${savedProduct.id}/suppliers`, formData.supplierIds);

            onSuccess(); 
            onClose();
        } catch (err) { 
            console.error("Lỗi lưu sản phẩm:", err);
            showMessage("Lỗi", err.response?.data?.message || "Không thể lưu hồ sơ sản phẩm."); 
        } finally { 
            setIsSubmitting(false); 
        }
    };

    const cbm = ((parseFloat(formData.length || 0) * parseFloat(formData.width || 0) * parseFloat(formData.height || 0)) / 1000000).toFixed(6);

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex justify-center items-center z-[70] p-2 md:p-4">
            <div className="bg-white w-full max-w-6xl rounded-2xl md:rounded-xl shadow-2xl flex flex-col max-h-[98vh] md:max-h-[95vh] overflow-hidden">
                <div className="bg-[#1192a8] text-white px-4 md:px-6 py-3 md:py-4 flex justify-between items-center shrink-0">
                    <h2 className="text-base md:text-xl font-bold uppercase tracking-wide truncate">
                        {mode === 'edit' ? 'Cập Nhật Hồ Sơ Mặt Hàng' : 'Tạo Mới Hồ Sơ Mặt Hàng'}
                    </h2>
                    <button onClick={onClose} className="text-white hover:text-red-200 text-2xl md:text-3xl leading-none">&times;</button>
                </div>

                <div className="p-3 md:p-6 overflow-y-auto flex-1 bg-gray-50 flex flex-col gap-4 md:gap-6">
                    <div className="bg-white p-4 md:p-5 border rounded-xl shadow-sm">
                        <h3 className="text-[#00529c] font-bold border-b pb-2 mb-4 uppercase text-[11px] md:text-sm">1. Thông tin định danh cơ bản</h3>
                        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                            <div className="w-full md:w-1/4 flex flex-col items-center">
                                <div className="w-32 md:w-full aspect-square border border-gray-200 rounded-lg flex items-center justify-center mb-3 md:mb-2 bg-gray-50 overflow-hidden shrink-0">
                                    {formData.imageUrl ? <img src={formData.imageUrl} className="w-full h-full object-contain p-2" alt="" /> : <span className="text-[10px] md:text-xs text-gray-400">Ảnh minh họa</span>}
                                </div>
                                <FormInput label="Link ảnh (URL)" name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} placeholder="https://..." />
                            </div>
                            <div className="w-full md:w-3/4 grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                                <FormInput label="Mã SKU (*)" name="sku" value={formData.sku} onChange={handleInputChange} placeholder="VD: MILK-1L" />
                                <FormInput label="Mã vạch (Barcode)" name="barcode" value={formData.barcode} onChange={handleInputChange} placeholder="Quét hoặc nhập mã..." />
                                <div className="sm:col-span-2"><FormInput label="Tên sản phẩm (*)" name="name" value={formData.name} onChange={handleInputChange} placeholder="Nhập tên sản phẩm..." /></div>
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

                    <div className="bg-white p-4 md:p-5 border rounded-xl shadow-sm border-blue-100">
                        <h3 className="text-[#1192a8] font-bold border-b pb-2 mb-4 uppercase text-[11px] md:text-sm flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1">
                            2. Quy đổi đơn vị
                            <span className="text-[9px] md:text-[10px] text-gray-400 font-normal normal-case italic">* Hệ thống tự gợi ý vị trí kho phù hợp</span>
                        </h3>
                        <div className="flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-4 items-end bg-blue-50/50 p-4 rounded-lg border border-dashed border-blue-200 mb-4">
                            <div className="w-full md:col-span-4">
                                <FormSelect label="Đơn vị quy đổi" value={newConvName} onChange={(e) => setNewConvName(e.target.value)} options={['', ...units.map(u => u.name).filter(n => n !== formData.baseUnit)]} />
                            </div>
                            <div className="w-full md:col-span-5">
                                <label className="text-[10px] md:text-[11px] font-bold text-gray-500 uppercase mb-1 block">Hệ số: 1 [Mới] = ? [{formData.baseUnit}]</label>
                                <input type="number" value={newConvFactor} onChange={(e) => setNewConvFactor(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none" placeholder="VD: 24" />
                            </div>
                            <div className="w-full md:col-span-3">
                                <button onClick={addConversion} className="w-full bg-[#1192a8] text-white font-black py-2 md:py-2 rounded shadow hover:bg-teal-700 transition uppercase text-[10px] md:text-xs tracking-tighter">+ THÊM QUY ĐỔI</button>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 md:gap-3">
                            {formData.conversions.length > 0 ? formData.conversions.map((c, i) => (
                                <div key={i} className="flex items-center gap-2 bg-white border-2 border-[#1192a8] rounded-full pl-3 pr-2 py-1 shadow-sm animate-in fade-in zoom-in duration-200">
                                    <span className="text-xs md:text-sm font-bold text-gray-700">1 {c.unitName}</span>
                                    <span className="text-[10px] text-gray-400">=</span>
                                    <span className="text-xs md:text-sm font-black text-[#1192a8]">{c.conversionFactor} {formData.baseUnit}</span>
                                    <button onClick={() => removeConversion(i)} className="ml-1 md:ml-2 w-5 h-5 flex items-center justify-center bg-gray-100 text-gray-400 rounded-full hover:bg-red-500 hover:text-white transition">&times;</button>
                                </div>
                            )) : <p className="w-full text-center text-gray-400 text-[10px] md:text-xs italic py-2">Chưa có quy đổi đơn vị.</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div className="bg-white p-4 md:p-5 border rounded-xl shadow-sm">
                            <h3 className="text-[#00529c] font-bold border-b pb-2 mb-4 uppercase text-[11px] md:text-sm">3. Quy cách Logistics</h3>
                            <div className="grid grid-cols-2 gap-3 md:gap-4">
                                <FormInput label="Trọng lượng (kg)" name="weight" type="number" value={formData.weight} onChange={handleInputChange} placeholder="0.00" />
                                <FormInput label="Chiều dài (cm)" name="length" type="number" value={formData.length} onChange={handleInputChange} placeholder="0.00" />
                                <FormInput label="Chiều rộng (cm)" name="width" type="number" value={formData.width} onChange={handleInputChange} placeholder="0.00" />
                                <FormInput label="Chiều cao (cm)" name="height" type="number" value={formData.height} onChange={handleInputChange} placeholder="0.00" />
                            </div>
                            <div className="mt-3 md:mt-4 p-2 md:p-3 bg-slate-50 rounded border text-[9px] md:text-[10px] text-slate-500 flex justify-between font-bold">
                                <span>Thể tích: {cbm} m³</span>
                                <span>Đáy: {(parseFloat(formData.length || 0) * parseFloat(formData.width || 0)).toLocaleString()} cm²</span>
                            </div>
                        </div>
                        <div className="bg-white p-4 md:p-5 border rounded-xl shadow-sm">
                            <h3 className="text-[#00529c] font-bold border-b pb-2 mb-4 uppercase text-[11px] md:text-sm">4. Điều kiện lưu kho</h3>
                            <div className="space-y-3 md:space-y-4">
                                <FormSelect label="Nhiệt độ lưu kho" name="storageTemp" value={formData.storageTemp} onChange={handleInputChange} options={['Bình thường', 'Kho Mát (2-8°C)', 'Kho Lạnh (Dưới 0°C)']} />
                                <FormInput label="Tồn kho an toàn" name="safetyStock" type="number" value={formData.safetyStock} onChange={handleInputChange} placeholder="VD: 50" />
                                <div className="flex items-center gap-3 bg-red-50 p-2 md:p-3 rounded-lg border border-dashed border-red-200 mt-2">
                                    <input type="checkbox" id="isFragile" name="isFragile" checked={formData.isFragile} onChange={handleInputChange} className="w-5 h-5 text-red-600 rounded" />
                                    <label htmlFor="isFragile" className="text-[10px] md:text-xs font-black text-red-700 cursor-pointer uppercase tracking-tighter md:tracking-normal">⚠️ Hàng dễ vỡ (Fragile)</label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 md:p-5 border rounded-xl shadow-sm border-blue-100">
                        <h3 className="text-[#00529c] font-bold border-b pb-2 mb-4 uppercase text-[11px] md:text-sm">5. Nhà cung cấp</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            {suppliers.map(s => (
                                <label key={s.id} className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer ${formData.supplierIds.includes(s.id) ? 'border-[#1192a8] bg-teal-50/30' : 'border-gray-100 hover:border-gray-200'}`}>
                                    <input type="checkbox" checked={formData.supplierIds.includes(s.id)} onChange={() => handleSupplierToggle(s.id)} className="w-4 h-4 text-[#1192a8]" />
                                    <div className="flex flex-col text-left">
                                        <span className="text-[10px] md:text-xs font-bold text-gray-700">{s.name}</span>
                                        <span className="text-[8px] md:text-[9px] text-gray-400 font-mono uppercase">{s.supplierCode}</span>
                                    </div>
                                </label>
                            ))}
                            {suppliers.length === 0 && <p className="col-span-full text-center text-gray-400 italic py-4">Chưa có dữ liệu nhà cung cấp.</p>}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-3 md:gap-4 p-4 border-t bg-white shrink-0">
                    <button onClick={onClose} className="order-2 sm:order-1 px-6 py-2 text-gray-500 font-bold hover:underline text-sm md:text-base">HỦY BỎ</button>
                    <button onClick={handleSubmit} disabled={isSubmitting} className="order-1 sm:order-2 bg-[#1192a8] text-white px-8 md:px-10 py-2.5 rounded-xl md:rounded-lg font-black shadow-lg hover:bg-teal-700 transition-all active:scale-95 disabled:opacity-50 text-xs md:text-base uppercase tracking-wider">
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
                <SystemDialog
                    isOpen={!!systemDialog}
                    {...systemDialog}
                    onClose={() => setSystemDialog(null)}
                />
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
            <select name={name} value={value} onChange={onChange} className="wms-select w-full !py-2">
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
                <select name={name} value={value} onChange={onChange} className="wms-select flex-1 !py-2">
                    {options.map((opt, i) => <option key={i} value={isObjectOptions ? opt.value : opt}>{isObjectOptions ? opt.label : opt}</option>)}
                </select>
                <button type="button" onClick={onBtnClick} className="bg-blue-50 text-blue-600 px-3 py-1 rounded-xl font-bold hover:bg-blue-100 transition-colors border-2 border-transparent hover:border-blue-200">{btnLabel}</button>
            </div>
        </div>
    );
}

function QuickAddModal({ title, fields, form, onChange, onCancel, onSave, loading }) {
    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex justify-center items-center z-[80] p-4 animate-in fade-in duration-200">
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
