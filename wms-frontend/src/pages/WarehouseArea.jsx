import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { ActionButton } from '../components/common/SharedUI';
import VoucherContextMenu from '../components/modals/VoucherContextMenu';
import LocationInventoryModal from '../components/modals/LocationInventoryModal';
import TransferModal from '../components/modals/TransferModal';
import SystemDialog from '../components/modals/SystemDialog';
import ScannerModal from '../components/modals/ScannerModal';
import axiosClient from '../api/axiosClient';
import addIcon from '../components/common/icons/add.png';
import fixIcon from '../components/common/icons/fix.png';
import deleteIcon from '../components/common/icons/delete.png';
import excel1Icon from '../components/common/icons/excel1.png';
import excelIcon from "../components/common/icons/excel.png";
import scanIcon from '../components/common/icons/scan.png';

const emptyFormData = {
    warehouseId: 1,
    zone: '', aisle: '', rack: '', level: '',
    binCode: '', capacity: 100, storageType: 'NORMAL', containerType: 'CAI'
};

const normalizeText = (value) => String(value || '').trim().toLowerCase();

const STATUS_META = {
    EMPTY:     { label: 'Trống',        className: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600' },
    FULL:      { label: 'Đã chật',      className: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700' },
    ALLOCATED: { label: 'Đã phân bổ',   className: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700' },
    EXPECTED:  { label: 'Hàng dự kiến', className: 'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/40 dark:text-violet-300 dark:border-violet-700' },
    OCCUPIED:  { label: 'Đang dùng',    className: 'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/40 dark:text-cyan-300 dark:border-cyan-700' }
};

const STORAGE_META = {
    NORMAL:     { label: 'Bình thường', className: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600' },
    COLD:       { label: 'Kho lạnh',    className: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700' },
    CHILLED:    { label: 'Kho mát',     className: 'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/40 dark:text-cyan-300 dark:border-cyan-700' },
    FROZEN:     { label: 'Kho đông',    className: 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-700' },
    BULK:       { label: 'Kho bulk',    className: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700' },
    QUARANTINE: { label: 'Cách ly',     className: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-700' }
};

const CONTAINER_META = {
    CAI:    { label: 'Cái',   className: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600' },
    HOP:    { label: 'Hộp',   className: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700' },
    THUNG:  { label: 'Thùng', className: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700' },
    PALLET: { label: 'Pallet',className: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700' },
    LOC:    { label: 'Lốc',   className: 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-700' },
    VI:     { label: 'Vỉ',    className: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-700' },
    GOI:    { label: 'Gói',   className: 'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/40 dark:text-pink-300 dark:border-pink-700' },
    KG:     { label: 'Kg',    className: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600' },
    KHAY:   { label: 'Khay',  className: 'bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/40 dark:text-teal-300 dark:border-teal-700' },
    CHAI:   { label: 'Chai',  className: 'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/40 dark:text-cyan-300 dark:border-cyan-700' }
};

function getStorageTypeLabel(storageType) {
    return STORAGE_META[String(storageType || 'NORMAL').toUpperCase()]?.label || 'Bình thường';
}

export default function WarehouseAreaPage({ onCreateInbound }) {
    const reactLocation = useLocation();
    const [locations, setLocations] = useState([]);
    const [units, setUnits] = useState([]);
    const [selectedLocationId, setSelectedLocationId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchType, setSearchType] = useState('Tất cả');
    const [filterZone, setFilterZone] = useState('ALL');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [filterStorage, setFilterStorage] = useState('ALL');

    const [contextMenu, setContextMenu] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isInventoryOpen, setIsInventoryOpen] = useState(false);
    const [viewingLocation, setViewingLocation] = useState(null);
    const [viewMode, setViewMode] = useState('grid');
    const [formMode, setFormMode] = useState('create');
    const [formData, setFormData] = useState(emptyFormData);
    const [formError, setFormError] = useState('');

    const [isScannerOpen, setIsScannerOpen] = useState(false);

    const [dialog, setDialog] = useState({ isOpen: false, title: '', message: '', variant: 'info', onConfirm: null });
    const showMsg     = (title, message, variant = 'info') => setDialog({ isOpen: true, title, message, variant, onConfirm: null });
    const showConfirm = (title, message, onConfirm)        => setDialog({ isOpen: true, title, message, variant: 'confirm', onConfirm });

    useEffect(() => {
        const params = new URLSearchParams(reactLocation.search);
        const searchCode = params.get('search');
        if (searchCode) { setSearchKeyword(searchCode); setSearchType('Theo mã vị trí'); }
    }, [reactLocation.search]);

    const handleScanSuccess = (decodedText) => {
        setIsScannerOpen(false);
        setSearchKeyword(decodedText.trim());
        setSearchType('Theo mã vị trí');
    };

    const unitMap = useMemo(() => {
        const m = new Map();
        units.forEach(u => m.set(u.unitCode, u.name));
        return m;
    }, [units]);

    const getContainerMeta = (containerType) => {
        if (!containerType) return CONTAINER_META.CAI;
        const code = containerType.toUpperCase().trim();
        const shortCode = code.startsWith('UNIT-') ? code.substring(5) : code;
        if (CONTAINER_META[shortCode]) return CONTAINER_META[shortCode];
        if (CONTAINER_META[code]) return CONTAINER_META[code];
        const label = unitMap.get(code) || unitMap.get(shortCode) || containerType || 'Cái';
        return { label, className: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600' };
    };

    function ContainerBadge({ containerType }) {
        const meta = getContainerMeta(containerType);
        return <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${meta.className}`}>{meta.label}</span>;
    }

    const lastClickRef = useRef({ id: null, time: 0 });
    const handleLocClick = (loc) => {
        const now = Date.now();
        const isDoubleTap = lastClickRef.current.id === loc.id && (now - lastClickRef.current.time < 300);
        if (isDoubleTap) {
            setViewingLocation(loc); setIsInventoryOpen(true);
            lastClickRef.current = { id: null, time: 0 };
            return;
        }
        lastClickRef.current = { id: loc.id, time: now };
        setSelectedLocationId(loc.id);
    };

    const fetchLocations = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axiosClient.get('/api/location-overview');
            setLocations(response.data);
        } catch (error) {
            console.warn('Không tải được danh sách vị trí kho', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchUnits = useCallback(async () => {
        try {
            const response = await axiosClient.get('/api/units');
            const data = response.data;
            setUnits(data);
            if (data.length > 0 && formMode === 'create' && formData.containerType === 'CAI') {
                const caiUnit = data.find(u => u.unitCode.toUpperCase().includes('CAI'));
                setFormData(prev => ({ ...prev, containerType: caiUnit ? caiUnit.unitCode : data[0].unitCode }));
            }
        } catch (error) {
            console.warn('Không tải được đơn vị tính', error);
        }
    }, [formMode, formData.containerType]);

    const handleExportGlobalExcel = () => {
        if (!locations.length) return;
        const data = locations.map(loc => ({
            'Khu vực': loc.zone,
            'Mã vị trí': loc.binCode,
            'Lối (Aisle)': loc.aisle,
            'Kệ (Rack)': loc.rack,
            'Tầng (Level)': loc.level,
            'Sức chứa': loc.capacity,
            'Tồn thực tế': loc.quantityOnHand || 0,
            'Tỷ lệ (%)': loc.capacity > 0 ? ((loc.quantityOnHand || 0) / loc.capacity * 100).toFixed(1) : 0,
            'Loại kho': getStorageTypeLabel(loc.storageType),
            'Vật chứa': loc.containerType,
            'Trạng thái': STATUS_META[loc.statusCode]?.label || loc.statusCode
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Warehouse");
        XLSX.writeFile(wb, `Kho_TongQuan_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    useEffect(() => {
        fetchLocations();
        fetchUnits();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const selectedLocation = useMemo(
        () => locations.find(loc => loc.id === selectedLocationId) || null,
        [locations, selectedLocationId]
    );

    const filteredLocations = useMemo(() => {
        const keyword = normalizeText(searchKeyword);
        return locations.filter((loc) => {
            let matchesKeyword = true;
            if (keyword) {
                const target = {
                    'Theo mã vị trí': loc.binCode,
                    'Theo khu vực': loc.zone,
                    'Theo lối': loc.aisle,
                    'Theo kệ': loc.rack,
                    'Theo tầng': loc.level,
                    'Theo loại kho': getStorageTypeLabel(loc.storageType),
                    'Theo loại hàng': getContainerMeta(loc.containerType).label
                };
                matchesKeyword = searchType === 'Tất cả'
                    ? Object.values(target).some(val => normalizeText(val).includes(keyword))
                    : normalizeText(target[searchType]).includes(keyword);
            }
            const matchesZone    = filterZone    === 'ALL' || loc.zone        === filterZone;
            const matchesStatus  = filterStatus  === 'ALL' || loc.statusCode  === filterStatus;
            const matchesStorage = filterStorage === 'ALL' || loc.storageType === filterStorage;
            return matchesKeyword && matchesZone && matchesStatus && matchesStorage;
        });
    }, [locations, searchKeyword, searchType, filterZone, filterStatus, filterStorage]);

    const zones = useMemo(() => Array.from(new Set(locations.map(l => l.zone))).sort(), [locations]);

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
        return Array.from(groups.values());
    }, [sortedLocations]); // eslint-disable-line react-hooks/exhaustive-deps

    const statusCounts = useMemo(() => {
        const counts = {};
        locations.forEach(loc => counts[loc.statusCode] = (counts[loc.statusCode] || 0) + 1);
        return counts;
    }, [locations]);

    const handleCreateInboundFromLoc = (location) => {
        if (!location) return;
        if (typeof onCreateInbound === 'function') {
            onCreateInbound({ kind: 'inbound', targetLocation: location });
        }
    };

    const openCreateForm = () => { setFormMode('create'); setFormData(emptyFormData); setFormError(''); setIsFormOpen(true); };
    const openEditForm = (location = selectedLocation) => {
        if (!location) return;
        setFormMode('edit');
        setFormData({
            warehouseId: location.warehouseId, zone: location.zone, aisle: location.aisle,
            rack: location.rack, level: location.level, binCode: location.binCode,
            capacity: location.capacity, storageType: location.storageType, containerType: location.containerType
        });
        setFormError('');
        setIsFormOpen(true);
    };

    const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSaveForm = async () => {
        if (!formData.binCode || !formData.zone) return setFormError('Vui lòng nhập đầy đủ Mã vị trí và Khu vực.');
        const payload = { ...formData, capacity: parseInt(formData.capacity || 100, 10) };
        const url = formMode === 'create' ? `/api/locations` : `/api/locations/${selectedLocationId}`;
        try {
            if (formMode === 'create') { await axiosClient.post(url, payload); }
            else { await axiosClient.put(url, payload); }
            setIsFormOpen(false); setFormError(''); await fetchLocations();
        } catch { setFormError('Không lưu được dữ liệu vị trí.'); }
    };

    const handleDeleteLocation = async (location = selectedLocation) => {
        if (!location) return;
        showConfirm("Xác nhận xóa", `Bạn có chắc chắn muốn xóa vị trí ${location.binCode}?`, async () => {
            try {
                await axiosClient.delete(`/api/locations/${location.id}`);
                if (selectedLocationId === location.id) setSelectedLocationId(null);
                await fetchLocations();
                showMsg("Thành công", "Đã xóa vị trí thành công.");
            } catch { showMsg("Lỗi", 'Không thể xóa vị trí (Có thể đang có hàng tồn kho).'); }
        });
    };

    const handleRowContextMenu = (event, location) => {
        event.preventDefault(); event.stopPropagation();
        setSelectedLocationId(location.id);
        setContextMenu({ x: event.clientX, y: event.clientY, item: location });
    };

    const closeContextMenu = () => setContextMenu(null);

    return (
        <div className="p-6 bg-[#f8f9fa] dark:bg-gray-900 min-h-full flex flex-col text-left font-sans text-gray-800 dark:text-gray-100 transition-colors duration-300">
            <SystemDialog
                isOpen={dialog.isOpen} title={dialog.title} message={dialog.message}
                variant={dialog.variant}
                onConfirm={() => { dialog.onConfirm?.(); setDialog({ ...dialog, isOpen: false }); }}
                onClose={() => setDialog({ ...dialog, isOpen: false })}
            />
            <ScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} onScanSuccess={handleScanSuccess} />

            {/* ── Header Toolbar & Status Legend ── */}
            <div className="sticky top-0 z-20 flex flex-col bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm p-4 md:p-5 rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 mb-4 md:mb-6 transition-all gap-4">
                <div className="flex items-center justify-between w-full">
                    <div className="flex gap-4 md:gap-6 overflow-x-auto no-scrollbar pb-1 flex-1">
                        <ActionButton label="THÊM MỚI" iconSrc={addIcon}    onClick={openCreateForm} />
                        <ActionButton label="QUÉT MÃ"  iconSrc={scanIcon}   onClick={() => setIsScannerOpen(true)} />
                        <ActionButton label="SỬA"      iconSrc={fixIcon}    onClick={() => openEditForm()} />
                        <ActionButton label="XÓA"      iconSrc={deleteIcon} onClick={() => handleDeleteLocation()} />
                        <ActionButton label="LÀM MỚI"  iconSrc={excel1Icon} onClick={fetchLocations} />
                    </div>
                    <div className="text-xs font-black text-gray-300 dark:text-gray-600 uppercase tracking-widest hidden lg:block ml-4">
                        Quản lý sơ đồ vị trí
                    </div>
                </div>

                {/* Status Legend */}
                <div className="flex flex-wrap gap-2 md:gap-3 bg-gray-50/50 dark:bg-gray-700/30 p-2 md:p-3 rounded-xl md:rounded-2xl border border-gray-100/50 dark:border-gray-700 justify-center sm:justify-start">
                    <StatusLegend label="Trống"     value={statusCounts.EMPTY     || 0} className="bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 border-gray-200 dark:border-gray-600" />
                    <StatusLegend label="Chật"      value={statusCounts.FULL      || 0} className="bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-100 dark:border-amber-700" />
                    <StatusLegend label="Phân bổ"   value={statusCounts.ALLOCATED || 0} className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-700" />
                    <StatusLegend label="Đang dùng" value={statusCounts.OCCUPIED  || 0} className="bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border-cyan-100 dark:border-cyan-700" />
                </div>
            </div>

            {/* ── Filter Bar ── */}
            <div className="bg-white dark:bg-gray-800 p-4 md:p-5 rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col gap-4 mb-4 md:mb-6 transition-colors duration-300">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <select
                        value={searchType} onChange={(e) => setSearchType(e.target.value)}
                        className="wms-select w-full sm:w-48 !text-sm !py-2.5 md:!py-3 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                    >
                        <option value="Tất cả">Tất cả kiểu tìm</option>
                        <option value="Theo mã vị trí">Theo mã vị trí</option>
                        <option value="Theo khu vực">Theo khu vực</option>
                        <option value="Theo loại kho">Theo loại kho</option>
                    </select>
                    <div className="relative flex-1">
                        <input
                            type="text" value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)}
                            placeholder="Nhập từ khóa tìm kiếm nhanh..."
                            className="w-full border-2 border-gray-100 dark:border-gray-600 rounded-xl px-4 py-2.5 md:py-3 text-sm outline-none focus:border-[#1192a8] focus:ring-4 focus:ring-[#1192a8]/10 transition-all bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                        />
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-gray-50 dark:border-gray-700 pt-4">
                    <div className="flex items-center gap-2 flex-1 sm:flex-none min-w-[140px]">
                        <span className="text-[9px] md:text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase shrink-0">Khu vực:</span>
                        <select value={filterZone} onChange={(e) => setFilterZone(e.target.value)} className="wms-select w-full !text-[11px] !py-1.5 !px-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                            <option value="ALL">Tất cả</option>
                            {zones.map(z => <option key={z} value={z}>{z}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center gap-2 flex-1 sm:flex-none min-w-[140px]">
                        <span className="text-[9px] md:text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase shrink-0">Trạng thái:</span>
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="wms-select w-full !text-[11px] !py-1.5 !px-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                            <option value="ALL">Tất cả</option>
                            {Object.entries(STATUS_META).map(([code, meta]) => <option key={code} value={code}>{meta.label}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center gap-2 flex-1 sm:flex-none min-w-[140px]">
                        <span className="text-[9px] md:text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase shrink-0">Loại kho:</span>
                        <select value={filterStorage} onChange={(e) => setFilterStorage(e.target.value)} className="wms-select w-full !text-[11px] !py-1.5 !px-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                            <option value="ALL">Tất cả</option>
                            {Object.entries(STORAGE_META).map(([code, meta]) => <option key={code} value={code}>{meta.label}</option>)}
                        </select>
                    </div>
                    <button
                        onClick={() => { setFilterZone('ALL'); setFilterStatus('ALL'); setFilterStorage('ALL'); setSearchKeyword(''); }}
                        className="ml-auto text-[9px] md:text-[10px] font-black text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 uppercase tracking-tighter cursor-pointer transition-colors"
                    >
                        Xóa bộ lọc ✕
                    </button>
                </div>
            </div>

            {/* ── Main Content ── */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 md:p-6 overflow-hidden flex flex-col transition-colors duration-300">
                {isLoading ? (
                    <div className="flex-1 flex flex-col justify-center items-center py-20 text-[#1192a8] font-bold">
                        <div className="w-10 h-10 border-4 border-[#1192a8] border-t-transparent rounded-full animate-spin mb-4"></div>
                        <span className="animate-pulse tracking-widest uppercase text-xs">Đang tải dữ liệu sơ đồ...</span>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto no-scrollbar pr-1">
                        <div className="space-y-6 md:space-y-8">
                            {groupedLocations.length > 0 ? groupedLocations.map((group) => (
                                <section key={group.zoneLabel} className="rounded-2xl md:rounded-3xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
                                    <div className="px-4 md:px-6 py-3 md:py-4 bg-gray-50/80 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                        <h4 className="text-sm md:text-base font-black text-[#1192a8] uppercase tracking-wide">
                                            Khu vực: {group.zoneLabel}
                                        </h4>
                                        <span className="text-[10px] md:text-xs font-bold text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-700 px-2 py-0.5 rounded-full border border-gray-200 dark:border-gray-600">
                                            {group.locations.length} vị trí
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 p-4 md:p-6 bg-white dark:bg-gray-800">
                                        {group.locations.map((loc, idx) => (
                                            <div
                                                key={loc.id}
                                                onClick={() => handleLocClick(loc)}
                                                onDoubleClick={() => { setViewingLocation(loc); setIsInventoryOpen(true); }}
                                                onContextMenu={(e) => handleRowContextMenu(e, loc)}
                                                className={`border rounded-2xl p-4 transition-all cursor-pointer group
                                                    ${selectedLocationId === loc.id
                                                    ? 'border-[#1192a8] shadow-md bg-cyan-50/20 dark:bg-[#1192a8]/10'
                                                    : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md hover:border-cyan-200 dark:hover:border-cyan-700'
                                                }`}
                                            >
                                                <div className="flex justify-between items-start mb-3">
                                                    <span className="text-[10px] font-bold text-gray-300 dark:text-gray-600">#{idx + 1}</span>
                                                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                                                        <StorageBadge storageType={loc.storageType} />
                                                        <ContainerBadge containerType={loc.containerType} />
                                                        <StatusBadge statusCode={loc.statusCode} />
                                                    </div>
                                                </div>
                                                <div className="flex items-baseline justify-between mb-4">
                                                    <div className="flex items-baseline gap-3 min-w-0">
                                                        <h5 className="text-lg font-black text-[#1192a8] truncate uppercase" title={loc.binCode}>{loc.binCode}</h5>
                                                        {viewMode === 'details' && <span className="text-[9px] font-bold text-gray-300 dark:text-gray-600 uppercase italic shrink-0">Hàng hóa:</span>}
                                                    </div>
                                                    {viewMode === 'details' && (
                                                        <div className="text-right shrink-0">
                                                            <span className="text-[8px] font-bold text-gray-400 dark:text-gray-500 uppercase block leading-none mb-0.5">Tỉ lệ</span>
                                                            <span className="text-xs font-black text-gray-700 dark:text-gray-300">{(loc.quantityOnHand || 0).toLocaleString()} / {(loc.capacity || 0).toLocaleString()}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                {viewMode === 'grid' ? (
                                                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-gray-50 dark:border-gray-700 pt-3">
                                                        <CardField label="Lối/Kệ"      value={`${loc.aisle || '-'}/${loc.rack || '-'}`} />
                                                        <CardField label="Tầng"         value={loc.level || '-'} />
                                                        <CardField label="Sức chứa"     value={loc.capacity} />
                                                        <CardField label="Tồn thực tế"  value={`${(loc.quantityOnHand || 0).toLocaleString()} / ${(loc.capacity || 0).toLocaleString()}`} />
                                                    </div>
                                                ) : (
                                                    <div className="mt-2 border-t border-gray-50 dark:border-gray-700 pt-3">
                                                        <LocationInventoryInline locationId={loc.id} onTransferSuccess={fetchLocations} />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )) : (
                                <div className="py-20 text-center text-gray-400 dark:text-gray-600 italic font-medium uppercase text-xs tracking-widest animate-pulse">
                                    Không có dữ liệu vị trí phù hợp với bộ lọc.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* ── FAB Toggle ── */}
            <button
                onClick={() => setViewMode(prev => prev === 'grid' ? 'details' : 'grid')}
                className="fixed bottom-10 right-10 w-16 h-16 bg-[#1192a8] text-white rounded-full shadow-[0_10px_30px_rgba(17,146,168,0.4)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 group overflow-hidden"
            >
                <div className="flex flex-col items-center gap-0.5">
                    <span className="text-2xl font-bold leading-none">{viewMode === 'grid' ? '≡' : '▦'}</span>
                    <span className="text-[8px] font-black uppercase tracking-tighter">{viewMode === 'grid' ? 'CHI TIẾT' : 'LƯỚI'}</span>
                </div>
            </button>

            {/* ── Form Modal ── */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-black/40 z-50 flex justify-center items-center backdrop-blur-md p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-[780px] flex flex-col max-h-[92vh]">
                        <div className="px-5 py-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2">
                                <img src={addIcon} alt="add" className="h-5 w-5 object-contain dark:opacity-85 dark:brightness-110" />
                                <h2 className="text-xl font-medium text-[#0e7c8a] uppercase">
                                    {formMode === 'create' ? 'Thêm vị trí mới' : 'Cập nhật thông tin'}
                                </h2>
                            </div>
                            <button onClick={() => setIsFormOpen(false)} className="text-2xl text-gray-400 dark:text-gray-500 hover:text-red-500 transition-colors">×</button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1 text-left">
                            {formError && (
                                <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-2 rounded-xl text-xs font-bold mb-4 border border-red-100 dark:border-red-800 uppercase italic">
                                    ⚠️ {formError}
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Khu vực (Zone) *">
                                    <input type="text" name="zone" value={formData.zone} onChange={handleFormChange} placeholder="VD: Khu A"
                                           className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1192a8] bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200" />
                                </Field>
                                <Field label="Mã vị trí (Bin Code) *">
                                    <input type="text" name="binCode" value={formData.binCode} onChange={handleFormChange} placeholder="VD: A1-01-01"
                                           className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1192a8] bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200" />
                                </Field>
                                <Field label="Lối (Aisle)">
                                    <input type="text" name="aisle" value={formData.aisle} onChange={handleFormChange}
                                           className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1192a8] bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200" />
                                </Field>
                                <Field label="Kệ (Rack)">
                                    <input type="text" name="rack" value={formData.rack} onChange={handleFormChange}
                                           className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1192a8] bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200" />
                                </Field>
                                <Field label="Tầng (Level)">
                                    <input type="text" name="level" value={formData.level} onChange={handleFormChange}
                                           className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1192a8] bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200" />
                                </Field>
                                <Field label="Sức chứa">
                                    <input type="number" name="capacity" value={formData.capacity} onChange={handleFormChange}
                                           className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1192a8] bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200" />
                                </Field>
                                <Field label="Loại kho">
                                    <select name="storageType" value={formData.storageType} onChange={handleFormChange}
                                            className="wms-select w-full !py-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                                        <option value="NORMAL">Bình thường</option>
                                        <option value="CHILLED">Kho mát</option>
                                        <option value="COLD">Kho lạnh</option>
                                        <option value="FROZEN">Kho đông</option>
                                        <option value="BULK">Kho bulk</option>
                                        <option value="QUARANTINE">Cách ly</option>
                                    </select>
                                </Field>
                                <Field label="Loại hàng chứa">
                                    <select name="containerType" value={formData.containerType} onChange={handleFormChange}
                                            className="wms-select w-full !py-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                                        {units.map(unit => (<option key={unit.id} value={unit.unitCode}>{unit.name}</option>))}
                                    </select>
                                </Field>
                            </div>
                        </div>
                        <div className="p-4 border-t dark:border-gray-700 flex justify-end gap-3">
                            <button onClick={() => setIsFormOpen(false)} className="px-6 py-2.5 text-gray-500 dark:text-gray-400 font-bold text-sm hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                                HỦY BỎ
                            </button>
                            <button onClick={handleSaveForm} className="px-8 py-2.5 bg-[#1192a8] text-white rounded-xl font-bold text-sm shadow-lg hover:bg-teal-700 transition">
                                XÁC NHẬN
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <VoucherContextMenu
                isOpen={!!contextMenu} x={contextMenu?.x || 0} y={contextMenu?.y || 0}
                title="Tác vụ nhanh" subtitle={contextMenu?.item?.binCode || ''}
                actions={[
                    { label: 'Xem tồn kho',    onClick: () => { closeContextMenu(); setViewingLocation(contextMenu?.item); setIsInventoryOpen(true); } },
                    { label: 'Lập phiếu nhập', onClick: () => { closeContextMenu(); handleCreateInboundFromLoc(contextMenu?.item); } },
                    { label: 'Sửa thông tin',  onClick: () => { closeContextMenu(); openEditForm(contextMenu?.item); } },
                    { label: 'Xóa vị trí này', danger: true, onClick: () => { closeContextMenu(); handleDeleteLocation(contextMenu?.item); } }
                ]}
                onClose={closeContextMenu}
            />
            {isInventoryOpen && viewingLocation && (
                <LocationInventoryModal location={viewingLocation} onClose={() => { setIsInventoryOpen(false); setViewingLocation(null); }} />
            )}
        </div>
    );
}

function StatusBadge({ statusCode }) {
    const meta = STATUS_META[statusCode] || STATUS_META.EMPTY;
    return <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${meta.className}`}>{meta.label}</span>;
}

function StorageBadge({ storageType }) {
    const meta = STORAGE_META[String(storageType || 'NORMAL').toUpperCase()] || STORAGE_META.NORMAL;
    return <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${meta.className}`}>{meta.label}</span>;
}

function CardField({ label, value }) {
    return (
        <div>
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase leading-none mb-1 text-left">{label}</p>
            <p className="text-xs font-black text-gray-700 dark:text-gray-200 text-left">{value}</p>
        </div>
    );
}

function Field({ label, children }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">{label}</label>
            {children}
        </div>
    );
}

function StatusLegend({ label, value, className }) {
    return <span className={`px-3 py-1 rounded-xl text-[10px] font-bold border ${className}`}>{label}: {value}</span>;
}

function LocationInventoryInline({ locationId, onTransferSuccess }) {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [transferTarget, setTransferTarget] = useState(null);

    useEffect(() => {
        const fetchItems = async () => {
            setLoading(true);
            try {
                const res = await axiosClient.get(`/api/inventory/location/${locationId}`);
                setInventory(res.data);
            } catch { setInventory([]); } finally { setLoading(false); }
        };
        fetchItems();
    }, [locationId]);

    if (loading) return (
        <div className="space-y-1">
            <div className="h-3 bg-gray-100 dark:bg-gray-700 animate-pulse rounded w-full"></div>
            <div className="h-3 bg-gray-50 dark:bg-gray-700/50 animate-pulse rounded w-2/3"></div>
        </div>
    );
    if (inventory.length === 0) return (
        <div className="text-[10px] text-gray-300 dark:text-gray-600 italic py-1 text-left">Vị trí trống</div>
    );

    return (
        <div className="space-y-3 max-h-80 overflow-y-auto pr-2 scrollbar-thin">
            {inventory.map((inv, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-50/50 dark:bg-gray-700/30 p-3 rounded-xl border border-gray-100 dark:border-gray-700 group/item hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm transition-all">
                    <div className="flex-1 min-w-0 text-left">
                        <p className="text-[13px] font-black text-gray-800 dark:text-gray-100 truncate mb-1 leading-tight">{inv.productName}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 items-center">
                            <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tighter">Mã lô:</span>
                                <span className="text-[12px] font-mono font-bold text-[#1192a8] bg-[#1192a8]/5 dark:bg-[#1192a8]/10 px-1.5 py-0.5 rounded border border-[#1192a8]/10">{inv.batchCode}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tighter">Số lượng:</span>
                                <span className="text-[14px] font-black text-gray-900 dark:text-gray-100">{Number(inv.onHand).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); setTransferTarget({ product: { id: inv.productId, name: inv.productName, sku: inv.productSku, baseUnit: 'Cái' }, inv }); }}
                        className="opacity-0 group-hover/item:opacity-100 bg-[#1192a8] text-white text-[11px] font-black px-4 py-2 rounded-lg shadow-lg shadow-[#1192a8]/20 transition-all hover:scale-105 active:scale-95 whitespace-nowrap ml-4"
                    >
                        CHUYỂN
                    </button>
                </div>
            ))}
            {transferTarget && (
                <TransferModal
                    isOpen={!!transferTarget} onClose={() => setTransferTarget(null)}
                    product={transferTarget.product} stockLine={transferTarget.inv}
                    onSuccess={() => { setTransferTarget(null); onTransferSuccess(); }}
                />
            )}
        </div>
    );
}