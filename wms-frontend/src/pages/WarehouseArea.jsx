import React, { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { ActionButton } from '../components/common/SharedUI';
import VoucherContextMenu from '../components/modals/VoucherContextMenu';
import addIcon from '../components/common/icons/add.png';
import fixIcon from '../components/common/icons/fix.png';
import deleteIcon from '../components/common/icons/delete.png';
import excelIcon from '../components/common/icons/excel.png';
import excel1Icon from '../components/common/icons/excel1.png';

const API_BASE_URL = 'http://localhost:8080/api';

const emptyFormData = {
    warehouseId: 1, // Fix tạm thời mặc định là 1 để tránh lỗi validation BE
    zone: '', aisle: '', rack: '', level: '',
    binCode: '', capacity: 100, storageType: 'NORMAL', containerType: 'CAI'
};

const normalizeText = (value) => String(value || '').trim().toLowerCase();

const STATUS_META = {
    EMPTY: { label: 'Trống', className: 'bg-gray-100 text-gray-600 border-gray-200' },
    FULL: { label: 'Đã chật', className: 'bg-amber-100 text-amber-800 border-amber-200' },
    ALLOCATED: { label: 'Đã phân bổ', className: 'bg-blue-100 text-blue-700 border-blue-200' },
    EXPECTED: { label: 'Hàng dự kiến', className: 'bg-violet-100 text-violet-700 border-violet-200' },
    OCCUPIED: { label: 'Đang dùng', className: 'bg-cyan-100 text-cyan-700 border-cyan-200' }
};

const STORAGE_META = {
    NORMAL: { label: 'Bình thường', className: 'bg-slate-100 text-slate-700 border-slate-200' },
    COLD: { label: 'Kho lạnh', className: 'bg-blue-100 text-blue-700 border-blue-200' },
    CHILLED: { label: 'Kho mát', className: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
    FROZEN: { label: 'Kho đông', className: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
    BULK: { label: 'Kho bulk', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    QUARANTINE: { label: 'Cách ly', className: 'bg-rose-100 text-rose-700 border-rose-200' }
};

const CONTAINER_META = {
    CAI: { label: 'Cái', className: 'bg-gray-100 text-gray-600 border-gray-200' },
    HOP: { label: 'Hộp', className: 'bg-amber-100 text-amber-800 border-amber-200' },
    THUNG: { label: 'Thùng', className: 'bg-blue-100 text-blue-700 border-blue-200' },
    PALLET: { label: 'Pallet', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    LOC: { label: 'Lốc', className: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
    VI: { label: 'Vỉ', className: 'bg-purple-100 text-purple-700 border-purple-200' },
    GOI: { label: 'Gói', className: 'bg-pink-100 text-pink-700 border-pink-200' },
    KG: { label: 'Kg', className: 'bg-slate-100 text-slate-700 border-slate-200' },
    KHAY: { label: 'Khay', className: 'bg-teal-100 text-teal-700 border-teal-200' },
    CHAI: { label: 'Chai', className: 'bg-cyan-100 text-cyan-700 border-cyan-200' }
};

function getStorageTypeLabel(storageType) {
    return STORAGE_META[String(storageType || 'NORMAL').toUpperCase()]?.label || 'Bình thường';
}

export default function WarehouseAreaPage() {
    const [locations, setLocations] = useState([]);
    const [units, setUnits] = useState([]);
    const [selectedLocationId, setSelectedLocationId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchType, setSearchType] = useState('Tất cả');
    const [contextMenu, setContextMenu] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formMode, setFormMode] = useState('create');
    const [formData, setFormData] = useState(emptyFormData);
    const [formError, setFormError] = useState('');

    const unitMap = useMemo(() => {
        return new Map(units.map(u => [u.unitCode.toUpperCase(), u.name]));
    }, [units]);

    const getContainerMeta = (containerType) => {
        const code = String(containerType || '').toUpperCase();
        const shortCode = code.replace('UNIT-', '');
        
        // Check in CONTAINER_META first
        if (CONTAINER_META[shortCode]) return CONTAINER_META[shortCode];
        if (CONTAINER_META[code]) return CONTAINER_META[code];

        // Check in units for dynamic label
        const label = unitMap.get(code) || unitMap.get(shortCode) || containerType || 'Cái';
        return { label, className: 'bg-slate-100 text-slate-700 border-slate-200' };
    };

    function ContainerBadge({ containerType }) {
        const meta = getContainerMeta(containerType);
        return <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${meta.className}`}>{meta.label}</span>;
    }

    const fetchLocations = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/location-overview`);
            if (response.ok) {
                const data = await response.json();
                setLocations(data);
            }
        } catch (error) {
            console.warn('Không tải được danh sách vị trí kho', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchUnits = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/units`);
            if (response.ok) {
                const data = await response.json();
                setUnits(data);
                // Update default container type if empty and in create mode
                if (data.length > 0 && formMode === 'create' && formData.containerType === 'CAI') {
                    const caiUnit = data.find(u => u.unitCode.toUpperCase().includes('CAI'));
                    if (caiUnit) {
                        setFormData(prev => ({ ...prev, containerType: caiUnit.unitCode }));
                    } else {
                        setFormData(prev => ({ ...prev, containerType: data[0].unitCode }));
                    }
                }
            }
        } catch (error) {
            console.warn('Không tải được đơn vị tính', error);
        }
    };

    useEffect(() => {
        fetchLocations();
        fetchUnits();
    }, []);

    const selectedLocation = useMemo(
        () => locations.find(loc => loc.id === selectedLocationId) || null,
        [locations, selectedLocationId]
    );

    const filteredLocations = useMemo(() => {
        const keyword = normalizeText(searchKeyword);
        return locations.filter((location) => {
            if (!keyword) return true;
            const target = {
                'Theo mã vị trí': location.binCode,
                'Theo khu vực': location.zone,
                'Theo lối': location.aisle,
                'Theo kệ': location.rack,
                'Theo tầng': location.level,
                'Theo loại kho': getStorageTypeLabel(location.storageType),
                'Theo loại hàng': getContainerMeta(location.containerType).label
            };
            if (searchType !== 'Tất cả') return normalizeText(target[searchType]).includes(keyword);
            return Object.values(target).some(val => normalizeText(val).includes(keyword));
        });
    }, [locations, searchKeyword, searchType, unitMap]);

    const sortedLocations = useMemo(() => {
        return [...filteredLocations].sort((a, b) =>
            (a.warehouseId - b.warehouseId) ||
            normalizeText(a.zone).localeCompare(normalizeText(b.zone)) ||
            normalizeText(a.aisle).localeCompare(normalizeText(b.aisle)) ||
            normalizeText(a.rack).localeCompare(normalizeText(b.rack)) ||
            normalizeText(a.level).localeCompare(normalizeText(b.level)) ||
            normalizeText(a.binCode).localeCompare(normalizeText(b.binCode))
        );
    }, [filteredLocations]);

    const groupedLocations = useMemo(() => {
        const groups = new Map();
        sortedLocations.forEach((loc) => {
            const key = normalizeText(loc.zone) || 'unassigned';
            if (!groups.has(key)) groups.set(key, { zoneLabel: loc.zone?.trim() || 'Chưa phân khu', locations: [] });
            groups.get(key).locations.push(loc);
        });
        return [...groups.values()].sort((a, b) => a.zoneLabel.localeCompare(b.zoneLabel));
    }, [sortedLocations]);

    const statusCounts = useMemo(() => {
        return sortedLocations.reduce((acc, loc) => {
            const s = String(loc.statusCode || 'EMPTY').toUpperCase();
            acc[s] = (acc[s] || 0) + 1;
            return acc;
        }, {});
    }, [sortedLocations]);

    const closeContextMenu = () => setContextMenu(null);

    const openCreateForm = () => {
        setFormMode('create');
        setFormData(emptyFormData);
        // Find default unit if exists
        if (units.length > 0) {
            const caiUnit = units.find(u => u.unitCode.toUpperCase().includes('CAI'));
            if (caiUnit) {
                setFormData(prev => ({ ...prev, containerType: caiUnit.unitCode }));
            } else {
                setFormData(prev => ({ ...prev, containerType: units[0].unitCode }));
            }
        }
        setFormError('');
        setIsFormOpen(true);
    };

    const openEditForm = (location = selectedLocation) => {
        if (!location) return;
        setFormMode('edit');
        
        // Find the matching unitCode from units list to ensure select dropdown matches
        let containerType = String(location.containerType || 'CAI').toUpperCase();
        const foundUnit = units.find(u => 
            u.unitCode.toUpperCase() === containerType || 
            u.unitCode.toUpperCase() === `UNIT-${containerType}` ||
            u.unitCode.toUpperCase().replace('UNIT-', '') === containerType
        );
        
        if (foundUnit) {
            containerType = foundUnit.unitCode;
        }

        setFormData({
            warehouseId: location.warehouseId ?? 1,
            zone: location.zone || '', aisle: location.aisle || '',
            rack: location.rack || '', level: location.level || '',
            binCode: location.binCode || '', capacity: location.capacity ?? 100,
            storageType: String(location.storageType || 'NORMAL').toUpperCase(),
            containerType: containerType
        });
        setFormError('');
        setIsFormOpen(true);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveLocation = async () => {
        const binCode = String(formData.binCode || '').trim();
        if (!binCode) { setFormError('Vui lòng nhập mã vị trí.'); return; }

        // SỬA LỖI 2: Đảm bảo payload truyền đi có đầy đủ thông tin containerType và đúng kiểu dữ liệu
        const payload = {
            warehouseId: Number(formData.warehouseId) || 1,
            zone: String(formData.zone || '').trim(),
            aisle: String(formData.aisle || '').trim(),
            rack: String(formData.rack || '').trim(),
            level: String(formData.level || '').trim(),
            binCode: binCode,
            capacity: parseInt(formData.capacity || 100, 10),
            storageType: String(formData.storageType || 'NORMAL').toUpperCase(),
            containerType: String(formData.containerType || 'CAI').toUpperCase() // Quan trọng!
        };

        const url = formMode === 'create' ? `${API_BASE_URL}/locations` : `${API_BASE_URL}/locations/${selectedLocationId}`;
        try {
            const response = await fetch(url, {
                method: formMode === 'create' ? 'POST' : 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error('Backend trả về lỗi');
            setIsFormOpen(false);
            setFormError('');
            await fetchLocations();
        } catch (error) {
            setFormError('Không lưu được dữ liệu vị trí. Kiểm tra kết nối backend hoặc trùng mã.');
        }
    };

    const handleDeleteLocation = async (location = selectedLocation) => {
        if (!location) return;
        const isConfirm = window.confirm(`Bạn có chắc chắn muốn xóa vị trí ${location.binCode}?`);
        if (!isConfirm) return;

        try {
            const response = await fetch(`${API_BASE_URL}/locations/${location.id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Backend trả về lỗi');
            if (selectedLocationId === location.id) setSelectedLocationId(null);
            await fetchLocations();
        } catch (error) {
            window.alert('Lỗi: Không thể xóa vị trí (Có thể đang có hàng tồn kho).');
        }
    };

    const handleRowContextMenu = (event, location) => {
        event.preventDefault();
        event.stopPropagation();
        setSelectedLocationId(location.id);
        setContextMenu({ x: event.clientX, y: event.clientY, item: location });
    };

    return (
        <div className="p-6 bg-[#f8f9fa] min-h-[100vh] flex flex-col text-left font-sans text-gray-800">

            <div className="sticky top-0 z-20 flex items-center justify-between bg-white/95 backdrop-blur-sm p-5 rounded-3xl shadow-sm border border-gray-200 mb-6 transition-all">
                <div className="flex gap-4">
                    <ActionButton label="THÊM MỚI" iconSrc={addIcon} onClick={openCreateForm} />
                    <ActionButton label="SỬA" iconSrc={fixIcon} onClick={() => openEditForm()} />
                    <ActionButton label="XÓA" iconSrc={deleteIcon} onClick={() => handleDeleteLocation()} />
                    <ActionButton label="LÀM MỚI" iconSrc={excel1Icon} onClick={fetchLocations} />
                </div>

                <div className="flex gap-2 bg-gray-50 px-3 py-1.5 rounded-2xl border border-gray-100">
                    <StatusLegend label="Trống" value={statusCounts.EMPTY || 0} className="bg-gray-100 text-gray-600 border-gray-200" />
                    <StatusLegend label="Chật" value={statusCounts.FULL || 0} className="bg-amber-100 text-amber-800 border-amber-200" />
                    <StatusLegend label="Phân bổ" value={statusCounts.ALLOCATED || 0} className="bg-blue-100 text-blue-700 border-blue-200" />
                    <StatusLegend label="Đang dùng" value={statusCounts.OCCUPIED || 0} className="bg-cyan-100 text-cyan-700 border-cyan-200" />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-6">
                    <div className="flex items-center gap-4 flex-1">
                        <select
                            value={searchType}
                            onChange={(e) => setSearchType(e.target.value)}
                            className="border border-[#1192a8] rounded-xl px-4 py-2 text-xs outline-none bg-white w-48"
                        >
                            <option value="Tất cả">Tất cả kiểu tìm</option>
                            <option value="Theo mã vị trí">Theo mã vị trí</option>
                            <option value="Theo khu vực">Theo khu vực</option>
                            <option value="Theo loại kho">Theo loại kho</option>
                        </select>
                        <input
                            type="text"
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            placeholder="Nhập từ khóa tìm kiếm nhanh..."
                            className="border border-[#1192a8] rounded-xl px-4 py-2 text-xs outline-none flex-1 focus:ring-1 focus:ring-[#1192a8]"
                        />
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                    {isLoading ? (
                        <div className="py-20 text-center text-[#1192a8] font-bold animate-pulse">ĐANG TẢI DỮ LIỆU...</div>
                    ) : (
                        <div className="space-y-8">
                            {groupedLocations.map((group) => (
                                <section key={group.zoneLabel} className="rounded-3xl border border-gray-100 overflow-hidden">
                                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                                        <h4 className="text-base font-black text-[#1192a8] uppercase">Khu vực: {group.zoneLabel}</h4>
                                        <span className="text-xs font-bold text-gray-500">{group.locations.length} vị trí</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-6">
                                        {group.locations.map((loc, idx) => (
                                            <div
                                                key={loc.id}
                                                onClick={() => setSelectedLocationId(loc.id)}
                                                onDoubleClick={() => openEditForm(loc)}
                                                onContextMenu={(e) => handleRowContextMenu(e, loc)}
                                                className={`border rounded-2xl p-4 transition-all cursor-pointer bg-white group ${
                                                    selectedLocationId === loc.id ? 'border-[#1192a8] shadow-md bg-cyan-50/20' : 'border-gray-100 hover:shadow-md hover:border-cyan-200'
                                                }`}
                                            >
                                                <div className="flex justify-between items-start mb-3">
                                                    <span className="text-[10px] font-bold text-gray-400">#{idx + 1}</span>
                                                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                                                        <StorageBadge storageType={loc.storageType} />
                                                        <ContainerBadge containerType={loc.containerType} />
                                                        <StatusBadge statusCode={loc.statusCode} />
                                                    </div>
                                                </div>
                                                <h5 className="text-lg font-black text-[#1192a8] mb-4 truncate" title={loc.binCode}>{loc.binCode}</h5>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <CardField label="Lối/Kệ" value={`${loc.aisle || '-'}/${loc.rack || '-'}`} />
                                                    <CardField label="Tầng" value={loc.level} />
                                                    <CardField label="Sức chứa" value={loc.capacity} />
                                                    <CardField label="Tồn thực tế" value={`${loc.quantityOnHand || 0}/${loc.capacity || 0}`} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {isFormOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[780px] flex flex-col max-h-[92vh]">
                        <div className="px-5 py-4 flex justify-between items-center border-b border-gray-200">
                            <div className="flex items-center gap-2">
                                <img src={addIcon} alt="add" className="h-5 w-5 object-contain" />
                                <h2 className="text-xl font-medium text-[#0e7c8a] uppercase">
                                    {formMode === 'create' ? 'Thêm khu vực kho' : 'Sửa khu vực kho'}
                                </h2>
                            </div>
                            <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-red-500 text-2xl transition-colors">✕</button>
                        </div>

                        <div className="p-6 space-y-5 overflow-y-auto">
                            {formError && (
                                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-medium">
                                    {formError}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Mã vị trí (BinCode)">
                                    <input type="text" name="binCode" value={formData.binCode} onChange={handleFormChange} className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1192a8]"/>
                                </Field>
                                <Field label="Khu vực (Zone)">
                                    <input type="text" name="zone" value={formData.zone} onChange={handleFormChange} className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1192a8]"/>
                                </Field>
                                <Field label="Lối (Aisle)">
                                    <input type="text" name="aisle" value={formData.aisle} onChange={handleFormChange} className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1192a8]"/>
                                </Field>
                                <Field label="Kệ (Rack)">
                                    <input type="text" name="rack" value={formData.rack} onChange={handleFormChange} className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1192a8]"/>
                                </Field>
                                <Field label="Tầng (Level)">
                                    <input type="text" name="level" value={formData.level} onChange={handleFormChange} className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1192a8]"/>
                                </Field>
                                <Field label="Sức chứa">
                                    <input type="number" name="capacity" value={formData.capacity} onChange={handleFormChange} className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1192a8]"/>
                                </Field>
                                <Field label="Loại kho">
                                    <select name="storageType" value={formData.storageType} onChange={handleFormChange} className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1192a8] bg-white">
                                        <option value="NORMAL">Bình thường</option>
                                        <option value="CHILLED">Kho mát</option>
                                        <option value="COLD">Kho lạnh</option>
                                        <option value="FROZEN">Kho đông</option>
                                        <option value="BULK">Kho bulk</option>
                                        <option value="QUARANTINE">Cách ly</option>
                                    </select>
                                </Field>
                                <Field label="Loại hàng chứa">
                                    <select name="containerType" value={formData.containerType} onChange={handleFormChange} className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1192a8] bg-white">
                                        {units.map(unit => (
                                            <option key={unit.id} value={unit.unitCode}>{unit.name}</option>
                                        ))}
                                    </select>
                                </Field>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                            <button onClick={() => setIsFormOpen(false)} className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-100 uppercase transition-colors">
                                Hủy bỏ
                            </button>
                            <button onClick={handleSaveLocation} className="px-6 py-2.5 bg-[#1192a8] text-white rounded-xl text-sm font-bold shadow-md hover:bg-[#0e7a8c] uppercase transition-colors">
                                Lưu vị trí
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <VoucherContextMenu
                isOpen={!!contextMenu}
                x={contextMenu?.x || 0}
                y={contextMenu?.y || 0}
                title="Tác vụ nhanh"
                subtitle={contextMenu?.item?.binCode || ''}
                actions={[
                    { label: '✎ Sửa thông tin', onClick: () => { closeContextMenu(); openEditForm(contextMenu?.item); } },
                    { label: '🗑 Xóa vị trí này', danger: true, onClick: () => { closeContextMenu(); handleDeleteLocation(contextMenu?.item); } },
                ]}
                onClose={closeContextMenu}
            />
        </div>
    );
}

// SỬA LỖI 1: ĐỊNH NGHĨA COMPONENT Field VÀ CÁC COMPONENT PHỤ TRỢ KHÁC
function Field({ label, children }) {
    return (
        <label className="flex flex-col gap-1.5 text-left">
            <span className="text-[10px] font-bold text-gray-400 uppercase ml-1">{label}</span>
            {children}
        </label>
    );
}

function CardField({ label, value }) {
    return (
        <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
            <p className="text-[9px] uppercase font-bold text-gray-400">{label}</p>
            <p className="text-xs font-bold text-gray-700 truncate">{value || '---'}</p>
        </div>
    );
}

function StatusBadge({ statusCode }) {
    const meta = STATUS_META[String(statusCode || 'EMPTY').toUpperCase()] || STATUS_META.EMPTY;
    return <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${meta.className}`}>{meta.label}</span>;
}

function StorageBadge({ storageType }) {
    const meta = STORAGE_META[String(storageType || 'NORMAL').toUpperCase()] || STORAGE_META.NORMAL;
    return <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${meta.className}`}>{meta.label}</span>;
}

function StatusLegend({ label, value, className }) {
    return <span className={`px-3 py-1 rounded-xl text-[10px] font-bold border ${className}`}>{label}: {value}</span>;
}