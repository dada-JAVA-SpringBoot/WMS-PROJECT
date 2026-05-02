import React, { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { ActionButton } from '../components/common/SharedUI';
import VoucherContextMenu from '../components/modals/VoucherContextMenu';
import addIcon from '../components/common/icons/add.png';
import fixIcon from '../components/common/icons/fix.png';
import deleteIcon from '../components/common/icons/delete.png';
import excelIcon from '../components/common/icons/excel.png';
import excel1Icon from '../components/common/icons/excel1.png';

const emptyFormData = {
    warehouseId: '',
    zone: '',
    aisle: '',
    rack: '',
    level: '',
    binCode: '',
    capacity: 100,
    storageType: 'NORMAL'
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

function getStorageTypeLabel(storageType) {
    const key = String(storageType || 'NORMAL').toUpperCase();
    return STORAGE_META[key]?.label || storageType || 'Bình thường';
}

export default function WarehouseAreaPage() {
    const [locations, setLocations] = useState([]);
    const [selectedLocationId, setSelectedLocationId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchType, setSearchType] = useState('Tất cả');
    const [searchUnit, setSearchUnit] = useState('Tất cả');
    const [contextMenu, setContextMenu] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formMode, setFormMode] = useState('create');
    const [formData, setFormData] = useState(emptyFormData);
    const [formError, setFormError] = useState('');

    const fetchLocations = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:8080/api/location-overview');
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

    useEffect(() => {
        fetchLocations();
    }, []);

    useEffect(() => {
        if (!locations.length) {
            setSelectedLocationId(null);
            return;
        }

        if (!selectedLocationId || !locations.some(location => location.id === selectedLocationId)) {
            setSelectedLocationId(locations[0].id);
        }
    }, [locations, selectedLocationId]);

    const selectedLocation = useMemo(
        () => locations.find(location => location.id === selectedLocationId) || null,
        [locations, selectedLocationId]
    );

    const filteredLocations = useMemo(() => {
        const keyword = normalizeText(searchKeyword);
        const unitFilter = String(searchUnit || 'Tất cả').trim();

        const matchesUnit = (loc) => {
            if (!unitFilter || unitFilter === 'Tất cả') return true;
            if (!loc) return false;

            const u = unitFilter.toLowerCase();
            // common possible fields where unit might be provided
            const singleUnit = String(loc.unit || loc.unitType || loc.baseUnit || '').toLowerCase();
            if (singleUnit && singleUnit === u) return true;

            if (Array.isArray(loc.supportedUnits)) {
                if (loc.supportedUnits.map(s => String(s || '').toLowerCase()).includes(u)) return true;
            }

            return false;
        };


        return locations.filter((location) => {
            if (!keyword && (unitFilter === 'Tất cả' || !unitFilter)) return true;

            if (!matchesUnit(location)) return false;

            if (!keyword) return true;

            switch (searchType) {
                case 'Theo mã vị trí':
                    return normalizeText(location.binCode).includes(keyword);
                case 'Theo khu vực':
                    return normalizeText(location.zone).includes(keyword);
                case 'Theo lối':
                    return normalizeText(location.aisle).includes(keyword);
                case 'Theo kệ':
                    return normalizeText(location.rack).includes(keyword);
                case 'Theo tầng':
                    return normalizeText(location.level).includes(keyword);
                case 'Theo loại kho':
                    return normalizeText(getStorageTypeLabel(location.storageType)).includes(keyword);
                default:
                    return (
                        normalizeText(location.binCode).includes(keyword) ||
                        normalizeText(location.zone).includes(keyword) ||
                        normalizeText(location.aisle).includes(keyword) ||
                        normalizeText(location.rack).includes(keyword) ||
                        normalizeText(location.level).includes(keyword) ||
                        normalizeText(getStorageTypeLabel(location.storageType)).includes(keyword)
                    );
            }
        });
    }, [locations, searchKeyword, searchType, searchUnit]);

    const sortedLocations = useMemo(() => {
        return [...filteredLocations].sort((a, b) => {
            const warehouseDiff = Number(a.warehouseId || 0) - Number(b.warehouseId || 0);
            if (warehouseDiff !== 0) return warehouseDiff;

            const zoneDiff = normalizeText(a.zone).localeCompare(normalizeText(b.zone));
            if (zoneDiff !== 0) return zoneDiff;

            const aisleDiff = normalizeText(a.aisle).localeCompare(normalizeText(b.aisle));
            if (aisleDiff !== 0) return aisleDiff;

            const rackDiff = normalizeText(a.rack).localeCompare(normalizeText(b.rack));
            if (rackDiff !== 0) return rackDiff;

            const levelDiff = normalizeText(a.level).localeCompare(normalizeText(b.level));
            if (levelDiff !== 0) return levelDiff;

            return normalizeText(a.binCode).localeCompare(normalizeText(b.binCode));
        });
    }, [filteredLocations]);

    const groupedLocations = useMemo(() => {
        const groups = new Map();

        sortedLocations.forEach((location) => {
            const zoneKey = normalizeText(location.zone) || 'unassigned';
            const zoneLabel = location.zone?.trim() || 'Chưa phân khu';

            if (!groups.has(zoneKey)) {
                groups.set(zoneKey, {
                    zoneLabel,
                    locations: []
                });
            }

            groups.get(zoneKey).locations.push(location);
        });

        return [...groups.entries()]
            .sort((a, b) => a[1].zoneLabel.localeCompare(b[1].zoneLabel))
            .map(([key, value]) => ({ key, ...value }));
    }, [sortedLocations]);

    const statusCounts = useMemo(() => {
        return sortedLocations.reduce((acc, location) => {
            const status = String(location.statusCode || 'EMPTY').toUpperCase();
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});
    }, [sortedLocations]);

    const closeContextMenu = () => setContextMenu(null);

    const openCreateForm = () => {
        setFormMode('create');
        setFormData(emptyFormData);
        setFormError('');
        setIsFormOpen(true);
    };

    const openEditForm = (location = selectedLocation) => {
        if (!location) return;

        setFormMode('edit');
        setFormData({
            warehouseId: location.warehouseId ?? '',
            zone: location.zone || '',
            aisle: location.aisle || '',
            rack: location.rack || '',
            level: location.level || '',
            binCode: location.binCode || '',
            capacity: location.capacity ?? 100,
            storageType: String(location.storageType || 'NORMAL').toUpperCase()
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
        const warehouseId = '1';

        if (!binCode) {
            setFormError('Vui lòng nhập mã vị trí.');
            return;
        }

        const payload = {
            warehouseId: parseInt(warehouseId, 10),
            zone: String(formData.zone || '').trim(),
            aisle: String(formData.aisle || '').trim(),
            rack: String(formData.rack || '').trim(),
            level: String(formData.level || '').trim(),
            binCode,
            capacity: parseInt(formData.capacity || 100, 10),
            storageType: String(formData.storageType || 'NORMAL').trim().toUpperCase()
        };

        const url = formMode === 'create'
            ? 'http://localhost:8080/api/locations'
            : `http://localhost:8080/api/locations/${selectedLocationId}`;

        try {
            const response = await fetch(url, {
                method: formMode === 'create' ? 'POST' : 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Backend trả về lỗi');
            }

            setIsFormOpen(false);
            setFormError('');
            await fetchLocations();
        } catch (error) {
            setFormError('Không lưu được dữ liệu vị trí kho. Kiểm tra backend hoặc trùng mã vị trí.');
        }
    };

    const handleDeleteLocation = async (location = selectedLocation) => {
        if (!location) return;

        const isConfirm = window.confirm(`Xóa vị trí kho ${location.binCode}?`);
        if (!isConfirm) return;

        try {
            const response = await fetch(`http://localhost:8080/api/locations/${location.id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Backend trả về lỗi');
            }

            if (selectedLocationId === location.id) {
                setSelectedLocationId(null);
            }

            await fetchLocations();
        } catch (error) {
            window.alert('Không xóa được vị trí kho.');
        }
    };

    const handleExportExcel = () => {
        if (!filteredLocations.length) {
            window.alert('Không có dữ liệu để xuất.');
            return;
        }

        const dataToExport = filteredLocations.map((location, index) => ({
            'STT': index + 1,
            'Mã vị trí': location.binCode,
            'Khu vực': location.zone || '',
            'Lối': location.aisle || '',
            'Kệ': location.rack || '',
            'Tầng': location.level || '',
            'Loại kho': getStorageTypeLabel(location.storageType),
            'Tồn': Number(location.quantityOnHand || 0),
            'Phân bổ': Number(location.quantityAllocated || 0),
            'Dự kiến': Number(location.quantityExpected || 0),
            'Trạng thái': location.statusLabel || ''
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        ws['!cols'] = [
            { wch: 6 },
            { wch: 18 },
            { wch: 18 },
            { wch: 18 },
            { wch: 18 },
            { wch: 16 },
            { wch: 12 },
            { wch: 12 },
            { wch: 12 },
            { wch: 12 }
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'KhuVucKho');
        XLSX.writeFile(wb, `KhuVucKho_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    const handleRefresh = () => {
        fetchLocations();
    };

    const handleRowContextMenu = (event, location) => {
        event.preventDefault();
        event.stopPropagation();

        const menuWidth = 256;
        const menuHeight = 220;
        const x = Math.min(event.clientX, window.innerWidth - menuWidth - 12);
        const openAbove = event.clientY + menuHeight > window.innerHeight;
        const rawY = openAbove ? event.clientY - menuHeight - 12 : event.clientY;
        const y = Math.max(12, Math.min(rawY, window.innerHeight - menuHeight - 12));

        setSelectedLocationId(location.id);
        setContextMenu({
            x: Math.max(12, x),
            y: Math.max(12, y),
            item: location
        });
    };

    const toolbarActions = [
        { label: 'THÊM', iconSrc: addIcon, onClick: openCreateForm },
        { label: 'SỬA', iconSrc: fixIcon, onClick: () => openEditForm() },
        { label: 'XÓA', iconSrc: deleteIcon, onClick: () => handleDeleteLocation() },
        { label: 'XUẤT EXCEL', iconSrc: excelIcon, onClick: handleExportExcel },
        { label: 'LÀM MỚI', iconSrc: excel1Icon, onClick: handleRefresh }
    ];
    return (
        <div className="p-6 bg-[#f8f9fa] min-h-full flex flex-col text-left font-sans text-gray-800">
            <div className="flex items-center justify-between bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-6">
                <div className="flex gap-8">
                    {toolbarActions.map((action, index) => (
                        <ActionButton key={index} {...action} />
                    ))}
                </div>
                <div className="text-sm font-bold text-gray-700">Quản lý khu vực kho</div>
            </div>

            <div className="grid grid-cols-[240px_minmax(0,1fr)_320px] gap-6 mt-6 flex-1 overflow-hidden">
                <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 h-fit text-xs shrink-0 text-left">
                    <div className="flex items-center gap-2 mb-6 text-[#1192a8]">
                        <span className="text-xl">🔍</span>
                        <h2 className="font-bold uppercase tracking-wider text-sm">Bộ lọc tìm kiếm</h2>
                    </div>

                    <div className="space-y-6">
                        <div className="flex flex-col gap-1.5 text-left">
                            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">KIỂU TÌM</label>
                            <select
                                value={searchType}
                                onChange={(e) => setSearchType(e.target.value)}
                                className="border border-[#1192a8] rounded-2xl px-4 py-2 text-[11px] outline-none focus:ring-1 focus:ring-[#1192a8] bg-white text-gray-600 w-full shadow-sm"
                            >
                                <option value="Tất cả">Tất cả</option>
                                <option value="Theo mã vị trí">Theo mã vị trí</option>
                                <option value="Theo khu vực">Theo khu vực</option>
                                <option value="Theo lối">Theo lối</option>
                                <option value="Theo kệ">Theo kệ</option>
                                <option value="Theo tầng">Theo tầng</option>
                                <option value="Theo loại kho">Theo loại kho</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-1.5 text-left">
                            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">TỪ KHÓA</label>
                            <input
                                type="text"
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                placeholder="Nhập mã vị trí, khu vực, lối..."
                                className="border border-[#1192a8] rounded-2xl px-4 py-2 text-[11px] outline-none focus:ring-1 focus:ring-[#1192a8] bg-white text-gray-600 w-full shadow-sm"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5 text-left">
                            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">LOẠI CHỨA</label>
                            <select
                                value={searchUnit}
                                onChange={(e) => setSearchUnit(e.target.value)}
                                className="border border-[#1192a8] rounded-2xl px-4 py-2 text-[11px] outline-none focus:ring-1 focus:ring-[#1192a8] bg-white text-gray-600 w-full shadow-sm"
                            >
                                <option value="Tất cả">Tất cả</option>
                                <option value="Cái">Cái</option>
                                <option value="Hộp">Hộp</option>
                                <option value="Chai">Chai</option>
                                <option value="Kg">Kg</option>
                                <option value="Lốc">Lốc</option>
                                <option value="Thùng">Thùng</option>
                                <option value="Vỉ">Vỉ</option>
                                <option value="Gói">Gói</option>
                                <option value="Pallet">Pallet</option>
                            </select>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            setSearchType('Tất cả');
                            setSearchKeyword('');
                            setSearchUnit('Tất cả');
                        }}
                        className="w-full mt-8 py-3 border border-dashed border-[#1192a8] text-[#1192a8] rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-cyan-50 transition-all shadow-sm"
                    >
                        Làm mới bộ lọc
                    </button>

                    <div className="flex flex-wrap gap-2 mt-4">
                        <StatusLegend label="Trống" value={statusCounts.EMPTY || 0} className="bg-gray-100 text-gray-600 border-gray-200" />
                        <StatusLegend label="Chật" value={statusCounts.FULL || 0} className="bg-amber-100 text-amber-800 border-amber-200" />
                        <StatusLegend label="Phân bổ" value={statusCounts.ALLOCATED || 0} className="bg-blue-100 text-blue-700 border-blue-200" />
                        <StatusLegend label="Dự kiến" value={statusCounts.EXPECTED || 0} className="bg-violet-100 text-violet-700 border-violet-200" />
                        <StatusLegend label="Đang dùng" value={statusCounts.OCCUPIED || 0} className="bg-cyan-100 text-cyan-700 border-cyan-200" />
                    </div>
                </div>

                <div className="sticky top-6">
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 h-fit text-xs text-left">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                            <div>
                                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Vị trí đang chọn</p>
                                <h3 className="text-lg font-bold text-gray-800 mt-1">
                                    {selectedLocation?.binCode || 'Chưa chọn'}
                                </h3>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Tổng vị trí</p>
                                <p className="text-2xl font-black text-[#1192a8]">{locations.length}</p>
                            </div>
                        </div>

                        {selectedLocation ? (
                            <div className="space-y-4 text-sm">
                                <InfoRow label="Mã vị trí" value={selectedLocation.binCode} />
                                <InfoRow label="Khu vực" value={selectedLocation.zone || '---'} />
                                <InfoRow label="Lối" value={selectedLocation.aisle || '---'} />
                                <InfoRow label="Kệ" value={selectedLocation.rack || '---'} />
                                <InfoRow label="Tầng" value={selectedLocation.level || '---'} />
                                <InfoRow label="Loại kho" value={getStorageTypeLabel(selectedLocation.storageType)} />
                                <InfoRow label="Tồn" value={Number(selectedLocation.quantityOnHand || 0).toLocaleString()} />
                                <InfoRow label="Phân bổ" value={Number(selectedLocation.quantityAllocated || 0).toLocaleString()} />
                                <InfoRow label="Dự kiến" value={Number(selectedLocation.quantityExpected || 0).toLocaleString()} />
                                <InfoRow label="Sức chứa" value={Number(selectedLocation.capacity || 0).toLocaleString()} />
                                <InfoRow label="Lấp đầy" value={`${Number(selectedLocation.utilizationPercent || 0).toFixed(0)}%`} />
                                <InfoRow label="Trạng thái" value={selectedLocation.statusLabel || '---'} />

                                <div className="pt-2 border-t border-gray-100">
                                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">Vai trò trong luồng WMS</p>
                                    <div className="flex flex-wrap gap-2">
                                        <Badge>Nhập kho</Badge>
                                        <Badge>Xác định lô</Badge>
                                        <Badge>Chọn vị trí xuất</Badge>
                                    </div>
                                </div>

                                <div className="rounded-2xl bg-cyan-50 border border-cyan-100 p-4">
                                    <p className="text-xs text-cyan-900 font-semibold leading-5">
                                        Vị trí này là nguồn chọn trong phiếu nhập và là nền để gán tồn kho theo lô, khu vực, tầng.
                                    </p>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => openEditForm(selectedLocation)}
                                        className="flex-1 py-2.5 rounded-2xl border border-[#1192a8] text-[#1192a8] font-bold text-xs uppercase hover:bg-cyan-50 transition"
                                    >
                                        Sửa vị trí
                                    </button>
                                    <button
                                        onClick={() => handleDeleteLocation(selectedLocation)}
                                        className="flex-1 py-2.5 rounded-2xl border border-red-200 text-red-600 font-bold text-xs uppercase hover:bg-red-50 transition"
                                    >
                                        Xóa vị trí
                                    </button>
                                </div>

                                <div className="text-[10px] text-gray-400 uppercase tracking-widest pt-2">
                                    Đã lọc: {filteredLocations.length} / {locations.length}
                                </div>
                            </div>
                        ) : (
                            <div className="text-sm text-gray-500 leading-6">
                                Chọn một dòng để xem cấu trúc vị trí và liên kết sang phiếu nhập.
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 overflow-hidden min-w-0">
                    <div className="flex items-center justify-between px-2 pb-4 border-b border-gray-100 mb-4">
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Danh sách vị trí</p>
                                <h3 className="text-sm font-bold text-gray-800">Sắp xếp theo khu vực, lối, kệ, tầng, loại kho</h3>

                        </div>
                        <div className="text-right">
                            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Kết quả</p>
                            <p className="text-xl font-black text-[#1192a8]">{sortedLocations.length}</p>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="py-20 text-center text-[#1192a8] font-bold animate-pulse">
                            ĐANG TẢI DỮ LIỆU KHU VỰC KHO...
                        </div>
                    ) : groupedLocations.length > 0 ? (
                        <div className="overflow-y-auto pr-1 max-h-[calc(100vh-220px)] space-y-4">
                            {groupedLocations.map((group) => (
                                <section key={group.key} className="rounded-3xl border border-gray-100 bg-white overflow-hidden">
                                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                                        <div>
                                            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Khu vực</p>
                                            <h4 className="text-sm font-black text-[#1192a8] uppercase">{group.zoneLabel}</h4>
                                        </div>
                                        <div className="flex flex-wrap justify-end gap-2">
                                            <StatusChip label="Trống" value={countStatus(group.locations, 'EMPTY')} />
                                            <StatusChip label="Chật" value={countStatus(group.locations, 'FULL')} />
                                            <StatusChip label="Phân bổ" value={countStatus(group.locations, 'ALLOCATED')} />
                                            <StatusChip label="Dự kiến" value={countStatus(group.locations, 'EXPECTED')} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 p-4">
                                        {group.locations.map((location, index) => (
                                            <button
                                                key={location.id}
                                                type="button"
                                                onClick={() => setSelectedLocationId(location.id)}
                                                onDoubleClick={() => openEditForm(location)}
                                                onContextMenu={(e) => handleRowContextMenu(e, location)}
                                                className={`text-left rounded-2xl border p-6 min-h-[220px] transition-all shadow-sm hover:shadow-md ${
                                                    selectedLocationId === location.id
                                                        ? 'border-cyan-300 bg-cyan-50'
                                                        : 'border-gray-100 bg-white hover:border-cyan-200'
                                                }`}
                                            >
                                                <div className="flex items-start justify-between gap-3 mb-3">
                                                    <div>
                                                        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold"># {index + 1}</p>
                                                        <h4 className="text-lg font-black text-[#1192a8] uppercase truncate">
                                                            {location.binCode}
                                                        </h4>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2">
                                                        <StatusBadge statusCode={location.statusCode} />
                                                        <StorageBadge storageType={location.storageType} />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-2 text-xs">
                                                    <CardField label="Lối" value={location.aisle || '---'} />
                                                    <CardField label="Kệ" value={location.rack || '---'} />
                                                    <CardField label="Tầng" value={location.level || '---'} />
                                                    <CardField label="Loại kho" value={getStorageTypeLabel(location.storageType)} />
                                                    <CardField label="Tồn" value={Number(location.quantityOnHand || 0).toLocaleString()} />
                                                    <CardField label="Phân bổ" value={Number(location.quantityAllocated || 0).toLocaleString()} />
                                                    <CardField label="Dự kiến" value={Number(location.quantityExpected || 0).toLocaleString()} />
                                                    <CardField label="Sức chứa" value={Number(location.capacity || 0).toLocaleString()} />
                                                    <CardField label="Lấp đầy" value={`${Number(location.utilizationPercent || 0).toFixed(0)}%`} />
                                                    <CardField label="Mã ô" value={location.binCode || '---'} />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </section>
                            ))}
                        </div>
                    ) : (
                        <div className="py-24 text-center text-gray-300 italic">
                            <div className="flex flex-col items-center gap-3">
                                <span className="text-5xl opacity-20">📦</span>
                                <p className="text-gray-400">Chưa có dữ liệu khu vực kho.</p>
                            </div>
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
                            {formError ? (
                                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-medium">
                                    {formError}
                                </div>
                            ) : null}

                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Mã vị trí (BinCode)">
                                    <input
                                        type="text"
                                        name="binCode"
                                        value={formData.binCode}
                                        onChange={handleFormChange}
                                        className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1192a8]"
                                    />
                                </Field>
                                <Field label="Khu vực (Zone)">
                                    <input
                                        type="text"
                                        name="zone"
                                        value={formData.zone}
                                        onChange={handleFormChange}
                                        className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1192a8]"
                                    />
                                </Field>
                                <Field label="Lối (Aisle)">
                                    <input
                                        type="text"
                                        name="aisle"
                                        value={formData.aisle}
                                        onChange={handleFormChange}
                                        className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1192a8]"
                                    />
                                </Field>
                                <Field label="Kệ (Rack)">
                                    <input
                                        type="text"
                                        name="rack"
                                        value={formData.rack}
                                        onChange={handleFormChange}
                                        className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1192a8]"
                                    />
                                </Field>
                                <Field label="Tầng (Level)">
                                    <input
                                        type="text"
                                        name="level"
                                        value={formData.level}
                                        onChange={handleFormChange}
                                        className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1192a8]"
                                    />
                                </Field>
                                <Field label="Sức chứa">
                                    <input
                                        type="number"
                                        name="capacity"
                                        value={formData.capacity}
                                        onChange={handleFormChange}
                                        className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1192a8]"
                                    />
                                </Field>
                                <Field label="Loại kho">
                                    <select
                                        name="storageType"
                                        value={formData.storageType}
                                        onChange={handleFormChange}
                                        className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1192a8] bg-white"
                                    >
                                        <option value="NORMAL">Bình thường</option>
                                        <option value="CHILLED">Kho mát</option>
                                        <option value="COLD">Kho lạnh</option>
                                        <option value="FROZEN">Kho đông</option>
                                        <option value="BULK">Kho bulk</option>
                                        <option value="QUARANTINE">Cách ly</option>
                                    </select>
                                </Field>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                            <button
                                onClick={() => setIsFormOpen(false)}
                                className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-100 uppercase transition-colors"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={handleSaveLocation}
                                className="px-6 py-2.5 bg-[#1192a8] text-white rounded-xl text-sm font-bold shadow-md hover:bg-[#0e7a8c] uppercase transition-colors"
                            >
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
                title="Tác vụ khu vực kho"
                subtitle={contextMenu?.item?.binCode || ''}
                actions={[
                    { label: 'Chi tiết', onClick: () => { closeContextMenu(); setSelectedLocationId(contextMenu?.item?.id || null); } },
                    { label: 'Sửa', onClick: () => { closeContextMenu(); openEditForm(contextMenu?.item); } },
                    { label: 'Xóa', danger: true, onClick: () => { closeContextMenu(); handleDeleteLocation(contextMenu?.item); } },
                    { label: 'Xuất Excel', onClick: () => { closeContextMenu(); handleExportExcel(); } },
                    { label: 'Làm mới', onClick: () => { closeContextMenu(); handleRefresh(); } }
                ]}
                onClose={closeContextMenu}
            />
        </div>
    );
}

function Field({ label, children }) {
    return (
        <label className="flex flex-col gap-1.5 text-left">
            <span className="text-[10px] font-bold text-gray-400 uppercase ml-1">{label}</span>
            {children}
        </label>
    );
}

function InfoRow({ label, value }) {
    return (
        <div className="flex items-start justify-between gap-3 border-b border-dashed border-gray-100 pb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 shrink-0">{label}</span>
            <span className="text-sm font-semibold text-gray-800 text-right break-words">{value || '---'}</span>
        </div>
    );
}

function CardField({ label, value }) {
    return (
        <div className="rounded-xl bg-gray-50 border border-gray-100 px-3 py-2">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">{label}</p>
            <p className="text-sm font-semibold text-gray-800 truncate">{value || '---'}</p>
        </div>
    );
}

function StatusBadge({ statusCode }) {
    const meta = STATUS_META[String(statusCode || 'EMPTY').toUpperCase()] || STATUS_META.EMPTY;
    return (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border shrink-0 ${meta.className}`}>
            {meta.label}
        </span>
    );
}

function StorageBadge({ storageType }) {
    const key = String(storageType || 'NORMAL').toUpperCase();
    const meta = STORAGE_META[key] || STORAGE_META.NORMAL;
    return (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border shrink-0 ${meta.className}`}>
            {meta.label}
        </span>
    );
}

function StatusChip({ label, value }) {
    return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-white text-gray-700 border border-gray-200">
            {label}: {value}
        </span>
    );
}

function countStatus(locations, code) {
    return locations.filter((location) => String(location.statusCode || 'EMPTY').toUpperCase() === code).length;
}

function StatusLegend({ label, value, className }) {
    return (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${className}`}>
            {label}: {value}
        </span>
    );
}

function Badge({ children }) {
    return (
        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-[#eefbfc] text-[#1192a8] border border-cyan-100">
            {children}
        </span>
    );
}


