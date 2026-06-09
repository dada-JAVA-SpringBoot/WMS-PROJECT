import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
    supplierIds: [] // Supplier IDs
};

export default function ProductModal({ isOpen, onClose, onSuccess, product = null, mode = 'create' }) {
    const { i18n } = useTranslation();
    const isEnglish = String(i18n.language || '').startsWith('en');
    const copy = isEnglish ? {
        headerCreate: 'Create Product Record',
        headerEdit: 'Update Product Record',
        section1: '1. Basic identification',
        section2: '2. Unit conversions',
        section2Hint: '* The system will suggest a suitable warehouse location',
        section3: '3. Logistics specs',
        section4: '4. Storage conditions',
        section5: '5. Suppliers',
        previewImage: 'Preview image',
        imageUrl: 'Image URL',
        imageUrlPlaceholder: 'https://...',
        sku: 'SKU (*)',
        skuPlaceholder: 'e.g. MILK-1L',
        barcode: 'Barcode',
        barcodePlaceholder: 'Scan or enter a code...',
        productName: 'Product name (*)',
        productNamePlaceholder: 'Enter product name...',
        baseUnit: 'Base unit',
        category: 'Category',
        conversionUnit: 'Conversion unit',
        factorLabel: 'Factor: 1 [New] = ? [{{unit}}]',
        addConversion: '+ Add conversion',
        noConversions: 'No unit conversions yet.',
        weight: 'Weight (kg)',
        length: 'Length (cm)',
        width: 'Width (cm)',
        height: 'Height (cm)',
        volume: 'Volume',
        baseArea: 'Base area',
        storageTemp: 'Storage temperature',
        fragile: '⚠️ Fragile goods',
        suppliersEmpty: 'No supplier data available.',
        cancel: 'CANCEL',
        save: 'SAVE PRODUCT RECORD',
        saving: 'PROCESSING...',
        addCategoryTitle: 'Add new category',
        addUnitTitle: 'Add new unit',
        categoryCode: 'Category code',
        categoryName: 'Category name',
        unitCode: 'Unit code',
        unitName: 'Unit name',
        categoryCodePlaceholder: 'e.g. CAT-MILK',
        categoryNamePlaceholder: 'e.g. Milk & beverages',
        unitCodePlaceholder: 'e.g. UNIT-BOX',
        unitNamePlaceholder: 'e.g. Box',
        quickAddCancel: 'CANCEL',
        quickAddConfirm: 'CONFIRM',
        missingDataTitle: 'Missing data',
        missingDataFields: 'Please fill in all required fields!',
        categorySaveError: 'Unable to save the category.',
        unitSaveError: 'Unable to save the unit.',
        conversionFactorError: 'The conversion factor must be greater than 0!',
        conversionExistsError: 'This unit already exists!',
        productRequiredError: 'SKU and product name are required!',
        productSaveError: 'Unable to save the product record.',
        productDialogError: 'Error',
        labelImage: 'Image',
        labelImageAlt: '',
        btnClose: '×',
    } : {
        headerCreate: 'Tạo hồ sơ sản phẩm',
        headerEdit: 'Cập nhật hồ sơ sản phẩm',
        section1: '1. Thông tin cơ bản',
        section2: '2. Quy đổi đơn vị',
        section2Hint: '* Hệ thống sẽ gợi ý vị trí lưu kho phù hợp',
        section3: '3. Thông số logistics',
        section4: '4. Điều kiện lưu kho',
        section5: '5. Nhà cung cấp',
        previewImage: 'Ảnh xem trước',
        imageUrl: 'URL ảnh',
        imageUrlPlaceholder: 'https://...',
        sku: 'SKU (*)',
        skuPlaceholder: 'VD: MILK-1L',
        barcode: 'Mã vạch',
        barcodePlaceholder: 'Quét hoặc nhập mã...',
        productName: 'Tên sản phẩm (*)',
        productNamePlaceholder: 'Nhập tên sản phẩm...',
        baseUnit: 'Đơn vị cơ sở',
        category: 'Danh mục',
        conversionUnit: 'Đơn vị quy đổi',
        factorLabel: 'Hệ số: 1 [Mới] = ? [{{unit}}]',
        addConversion: '+ Thêm quy đổi',
        noConversions: 'Chưa có quy đổi đơn vị.',
        weight: 'Khối lượng (kg)',
        length: 'Dài (cm)',
        width: 'Rộng (cm)',
        height: 'Cao (cm)',
        volume: 'Thể tích',
        baseArea: 'Diện tích đáy',
        storageTemp: 'Nhiệt độ lưu kho',
        fragile: '⚠️ Hàng dễ vỡ',
        suppliersEmpty: 'Chưa có dữ liệu nhà cung cấp.',
        cancel: 'HỦY',
        save: 'LƯU HỒ SƠ SẢN PHẨM',
        saving: 'ĐANG XỬ LÝ...',
        addCategoryTitle: 'Thêm danh mục mới',
        addUnitTitle: 'Thêm đơn vị mới',
        categoryCode: 'Mã danh mục',
        categoryName: 'Tên danh mục',
        unitCode: 'Mã đơn vị',
        unitName: 'Tên đơn vị',
        categoryCodePlaceholder: 'VD: CAT-MILK',
        categoryNamePlaceholder: 'VD: Sữa & đồ uống',
        unitCodePlaceholder: 'VD: UNIT-BOX',
        unitNamePlaceholder: 'VD: Hộp',
        quickAddCancel: 'HỦY',
        quickAddConfirm: 'XÁC NHẬN',
        missingDataTitle: 'Thiếu dữ liệu',
        missingDataFields: 'Vui lòng nhập đầy đủ các trường bắt buộc!',
        categorySaveError: 'Không thể lưu danh mục.',
        unitSaveError: 'Không thể lưu đơn vị.',
        conversionFactorError: 'Hệ số quy đổi phải lớn hơn 0!',
        conversionExistsError: 'Đơn vị này đã tồn tại!',
        productRequiredError: 'Vui lòng nhập SKU và tên sản phẩm!',
        productSaveError: 'Không thể lưu hồ sơ sản phẩm.',
        productDialogError: 'Lỗi',
        labelImage: 'Ảnh',
        labelImageAlt: '',
        btnClose: '×',
    };
    const [formData, setFormData] = useState(emptyFormData);
    const [categories, setCategories] = useState([]);
    const [units, setUnits] = useState([]);
    const [suppliers, setSuppliers] = useState([]); // Suppliers to choose from
    
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
                        // Load supplier links when editing
                    let productSupIds = [];
                    try {
                        const resPS = await axiosClient.get(`/api/products/${product.id}/suppliers`);
                        productSupIds = resPS.data.map(ps => ps.id?.supplierId || ps.supplier?.id);
                    } catch { /* New products may not have supplier links yet */ }

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
                console.error("Failed to load master data", error);
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
        if (!categoryForm.categoryCode.trim() || !categoryForm.name.trim()) return showMessage(copy.missingDataTitle, copy.missingDataFields);
        setIsCategorySubmitting(true);
        try {
            const res = await axiosClient.post("/api/categories", categoryForm);
            const created = res.data;
            const nextRes = await axiosClient.get("/api/categories");
            setCategories(nextRes.data);
            setFormData(p => ({ ...p, categoryId: String(created.id) }));
            setIsCategoryModalOpen(false);
        } catch { showMessage(copy.productDialogError, copy.categorySaveError); } finally { setIsCategorySubmitting(false); }
    };

    const handleCreateUnit = async () => {
        if (!unitForm.unitCode.trim() || !unitForm.name.trim()) return showMessage(copy.missingDataTitle, copy.missingDataFields);
        setIsUnitSubmitting(true);
        try {
            const res = await axiosClient.post("/api/units", unitForm);
            const created = res.data;
            const nextRes = await axiosClient.get("/api/units");
            setUnits(nextRes.data);
            setFormData(p => ({ ...p, baseUnit: created.name }));
            setIsUnitModalOpen(false);
        } catch { showMessage(copy.productDialogError, copy.unitSaveError); } finally { setIsUnitSubmitting(false); }
    };

    const addConversion = () => {
        if (!newConvName || !newConvFactor) return showMessage(copy.missingDataTitle, copy.missingDataFields);
        const factor = parseFloat(newConvFactor);
        if (isNaN(factor) || factor <= 0) return showMessage(copy.productDialogError, copy.conversionFactorError);
        if (formData.conversions.some(c => c.unitName === newConvName)) return showMessage(copy.productDialogError, copy.conversionExistsError);
        setFormData(p => ({ ...p, conversions: [...p.conversions, { unitName: newConvName, conversionFactor: factor }] }));
        setNewConvName(''); setNewConvFactor('');
    };

    const removeConversion = (idx) => setFormData(p => ({ ...p, conversions: p.conversions.filter((_, i) => i !== idx) }));

    const handleSubmit = async () => {
        if (!formData.sku || !formData.name) return showMessage(copy.missingDataTitle, copy.productRequiredError);
        setIsSubmitting(true);
        try {
            // Normalize payload before sending: convert empty strings to null for numeric fields
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

            // Save supplier links
            await axiosClient.post(`/api/products/${savedProduct.id}/suppliers`, formData.supplierIds);

            onSuccess(); 
            onClose();
        } catch (err) { 
            console.error("Failed to save product:", err);
            showMessage(copy.productDialogError, err.response?.data?.message || copy.productSaveError); 
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
                        {mode === 'edit' ? copy.headerEdit : copy.headerCreate}
                    </h2>
                    <button onClick={onClose} className="text-white hover:text-red-200 text-2xl md:text-3xl leading-none">&times;</button>
                </div>

                <div className="p-3 md:p-6 overflow-y-auto flex-1 bg-gray-50 flex flex-col gap-4 md:gap-6">
                    <div className="bg-white p-4 md:p-5 border rounded-xl shadow-sm">
                        <h3 className="text-[#00529c] font-bold border-b pb-2 mb-4 uppercase text-[11px] md:text-sm">{copy.section1}</h3>
                        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                            <div className="w-full md:w-1/4 flex flex-col items-center">
                                <div className="w-32 md:w-full aspect-square border border-gray-200 rounded-lg flex items-center justify-center mb-3 md:mb-2 bg-gray-50 overflow-hidden shrink-0">
                                    {formData.imageUrl ? <img src={formData.imageUrl} className="w-full h-full object-contain p-2" alt="" /> : <span className="text-[10px] md:text-xs text-gray-400">{copy.previewImage}</span>}
                                </div>
                                <FormInput label={copy.imageUrl} name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} placeholder={copy.imageUrlPlaceholder} />
                            </div>
                            <div className="w-full md:w-3/4 grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                                <FormInput label={copy.sku} name="sku" value={formData.sku} onChange={handleInputChange} placeholder={copy.skuPlaceholder} />
                                <FormInput label={copy.barcode} name="barcode" value={formData.barcode} onChange={handleInputChange} placeholder={copy.barcodePlaceholder} />
                                <div className="sm:col-span-2"><FormInput label={copy.productName} name="name" value={formData.name} onChange={handleInputChange} placeholder={copy.productNamePlaceholder} /></div>
                                <FormSelectWithAction 
                                    label={copy.baseUnit} name="baseUnit" value={formData.baseUnit} onChange={handleInputChange} 
                                    options={units.map(u => ({ label: `${u.unitCode} - ${u.name}`, value: u.name }))} isObjectOptions btnLabel="+" onBtnClick={openUnitModal} 
                                />
                                <FormSelectWithAction 
                                    label={copy.category} name="categoryId" value={formData.categoryId} onChange={handleInputChange}
                                    options={categories.map(c => ({ label: `${c.categoryCode} - ${c.name}`, value: String(c.id) }))} isObjectOptions btnLabel="+" onBtnClick={openCategoryModal} 
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 md:p-5 border rounded-xl shadow-sm border-blue-100">
                        <h3 className="text-[#1192a8] font-bold border-b pb-2 mb-4 uppercase text-[11px] md:text-sm flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1">
                            {copy.section2}
                            <span className="text-[9px] md:text-[10px] text-gray-400 font-normal normal-case italic">{copy.section2Hint}</span>
                        </h3>
                        <div className="flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-4 items-end bg-blue-50/50 p-4 rounded-lg border border-dashed border-blue-200 mb-4">
                            <div className="w-full md:col-span-4">
                                <FormSelect label={copy.conversionUnit} value={newConvName} onChange={(e) => setNewConvName(e.target.value)} options={['', ...units.map(u => u.name).filter(n => n !== formData.baseUnit)]} />
                            </div>
                            <div className="w-full md:col-span-5">
                                <label className="text-[10px] md:text-[11px] font-bold text-gray-500 uppercase mb-1 block">{copy.factorLabel.replace('{{unit}}', formData.baseUnit)}</label>
                                <input type="number" value={newConvFactor} onChange={(e) => setNewConvFactor(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none" placeholder={isEnglish ? 'e.g. 24' : 'VD: 24'} />
                            </div>
                            <div className="w-full md:col-span-3">
                                <button onClick={addConversion} className="w-full bg-[#1192a8] text-white font-black py-2 md:py-2 rounded shadow hover:bg-teal-700 transition uppercase text-[10px] md:text-xs tracking-tighter">{copy.addConversion}</button>
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
                            )) : <p className="w-full text-center text-gray-400 text-[10px] md:text-xs italic py-2">{copy.noConversions}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div className="bg-white p-4 md:p-5 border rounded-xl shadow-sm">
                            <h3 className="text-[#00529c] font-bold border-b pb-2 mb-4 uppercase text-[11px] md:text-sm">{copy.section3}</h3>
                            <div className="grid grid-cols-2 gap-3 md:gap-4">
                                <FormInput label={copy.weight} name="weight" type="number" value={formData.weight} onChange={handleInputChange} placeholder="0.00" />
                                <FormInput label={copy.length} name="length" type="number" value={formData.length} onChange={handleInputChange} placeholder="0.00" />
                                <FormInput label={copy.width} name="width" type="number" value={formData.width} onChange={handleInputChange} placeholder="0.00" />
                                <FormInput label={copy.height} name="height" type="number" value={formData.height} onChange={handleInputChange} placeholder="0.00" />
                            </div>
                            <div className="mt-3 md:mt-4 p-2 md:p-3 bg-slate-50 rounded border text-[9px] md:text-[10px] text-slate-500 flex justify-between font-bold">
                                <span>{copy.volume}: {cbm} m³</span>
                                <span>{copy.baseArea}: {(parseFloat(formData.length || 0) * parseFloat(formData.width || 0)).toLocaleString()} cm²</span>
                            </div>
                        </div>
                        <div className="bg-white p-4 md:p-5 border rounded-xl shadow-sm">
                            <h3 className="text-[#00529c] font-bold border-b pb-2 mb-4 uppercase text-[11px] md:text-sm">{copy.section4}</h3>
                            <div className="space-y-3 md:space-y-4">
                                <FormSelect label={copy.storageTemp} name="storageTemp" value={formData.storageTemp} onChange={handleInputChange} options={isEnglish ? ['Normal', 'Cool room (2-8°C)', 'Cold room (below 0°C)'] : ['Bình thường', 'Kho Mát (2-8°C)', 'Kho Lạnh (dưới 0°C)']} />
                                <FormInput label={isEnglish ? 'Safety stock' : 'Tồn an toàn'} name="safetyStock" type="number" value={formData.safetyStock} onChange={handleInputChange} placeholder={isEnglish ? 'e.g. 50' : 'VD: 50'} />
                                <div className="flex items-center gap-3 bg-red-50 p-2 md:p-3 rounded-lg border border-dashed border-red-200 mt-2">
                                    <input type="checkbox" id="isFragile" name="isFragile" checked={formData.isFragile} onChange={handleInputChange} className="w-5 h-5 text-red-600 rounded" />
                                    <label htmlFor="isFragile" className="text-[10px] md:text-xs font-black text-red-700 cursor-pointer uppercase tracking-tighter md:tracking-normal">{copy.fragile}</label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 md:p-5 border rounded-xl shadow-sm border-blue-100">
                        <h3 className="text-[#00529c] font-bold border-b pb-2 mb-4 uppercase text-[11px] md:text-sm">{copy.section5}</h3>
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
                            {suppliers.length === 0 && <p className="col-span-full text-center text-gray-400 italic py-4">{copy.suppliersEmpty}</p>}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-3 md:gap-4 p-4 border-t bg-white shrink-0">
                    <button onClick={onClose} className="order-2 sm:order-1 px-6 py-2 text-gray-500 font-bold hover:underline text-sm md:text-base">{copy.cancel}</button>
                    <button onClick={handleSubmit} disabled={isSubmitting} className="order-1 sm:order-2 bg-[#1192a8] text-white px-8 md:px-10 py-2.5 rounded-xl md:rounded-lg font-black shadow-lg hover:bg-teal-700 transition-all active:scale-95 disabled:opacity-50 text-xs md:text-base uppercase tracking-wider">
                        {isSubmitting ? copy.saving : copy.save}
                    </button>
                </div>

                {isCategoryModalOpen && (
                    <QuickAddModal 
                        title={copy.addCategoryTitle} 
                        fields={[
                            {label:copy.categoryCode, name:'categoryCode', placeholder: copy.categoryCodePlaceholder}, 
                            {label:copy.categoryName, name:'name', placeholder: copy.categoryNamePlaceholder}
                        ]} 
                        form={categoryForm} 
                        onChange={handleCategoryInputChange} 
                        onCancel={()=>setIsCategoryModalOpen(false)} 
                        onSave={handleCreateCategory} 
                        loading={isCategorySubmitting}
                        cancelLabel={copy.quickAddCancel}
                        confirmLabel={copy.quickAddConfirm}
                        savingLabel={copy.saving}
                    />
                )}
                {isUnitModalOpen && (
                    <QuickAddModal 
                        title={copy.addUnitTitle} 
                        fields={[
                            {label:copy.unitCode, name:'unitCode', placeholder: copy.unitCodePlaceholder}, 
                            {label:copy.unitName, name:'name', placeholder: copy.unitNamePlaceholder}
                        ]} 
                        form={unitForm} 
                        onChange={handleUnitInputChange} 
                        onCancel={()=>setIsUnitModalOpen(false)} 
                        onSave={handleCreateUnit} 
                        loading={isUnitSubmitting}
                        cancelLabel={copy.quickAddCancel}
                        confirmLabel={copy.quickAddConfirm}
                        savingLabel={copy.saving}
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

function QuickAddModal({ title, fields, form, onChange, onCancel, onSave, loading, cancelLabel = 'CANCEL', confirmLabel = 'CONFIRM', savingLabel = 'SAVING...' }) {
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
                    <button onClick={onCancel} className="px-4 py-2 text-gray-500 font-bold text-sm">{cancelLabel}</button>
                    <button onClick={onSave} disabled={loading} className="bg-[#1192a8] text-white px-6 py-2 rounded font-bold shadow hover:bg-teal-700 disabled:opacity-50">{loading ? savingLabel : confirmLabel}</button>
                </div>
            </div>
        </div>
    );
}
