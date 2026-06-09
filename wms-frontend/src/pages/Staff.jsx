import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import StaffModal from '../components/modals/StaffModal';
import ExportExcelModal from '../components/modals/ExportExcelModal';
import axiosClient from '../api/axiosClient';
import addIcon    from '../components/common/icons/add.png';
import fixIcon    from '../components/common/icons/fix.png';
import deleteIcon from '../components/common/icons/delete.png';
import inboundIcon from '../components/common/icons/inbound.png';
import outboundIcon from '../components/common/icons/outbound.png';
import excelIcon  from '../components/common/icons/excel.png';
import excel1Icon from '../components/common/icons/excel1.png';
import { getAvatarSrc } from '../components/common/avatarUtils';
import { useSelection } from '../hooks/useSelection';
import { useExcelExport } from '../hooks/useExcelExport';
import * as XLSX from 'xlsx';

const BASE = '/api/staff';

const ROLE_MAP = {
    WAREHOUSE_MANAGER:  { label: 'Quản lý kho',     color: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800' },
    WAREHOUSE_KEEPER:   { label: 'Thủ kho',          color: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' },
    INBOUND_STAFF:      { label: 'Nhập kho',         color: 'bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800' },
    OUTBOUND_STAFF:     { label: 'Xuất kho',         color: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800' },
    INVENTORY_CHECKER:  { label: 'Kiểm kê',          color: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700/50 dark:text-slate-300 dark:border-slate-600' },
    ACCOUNTANT:         { label: 'Kế toán kho',      color: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' },
    QUALITY_CONTROL:    { label: 'Kiểm duyệt (QC)',  color: 'bg-rose-100 text-red-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800' },
    HANDLER:            { label: 'Điều chuyển',      color: 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800' },
    INTERN:             { label: 'Thực tập sinh',    color: 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600' },
};
const CONTRACT_MAP = {
    PERMANENT: { label: 'Vô thời hạn',  color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    PART_TIME: { label: 'Bán thời gian', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400' },
    SEASONAL:  { label: 'Thời vụ',      color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    EXPIRED:   { label: 'Đã nghỉ việc', color: 'bg-red-100 text-red-700 font-bold dark:bg-red-900/30 dark:text-red-400' },
};

const GENDER_MAP = { MALE: 'Nam', FEMALE: 'Nữ' };

function RoleBadge({ role }) {
    const r = ROLE_MAP[role] || { label: role, color: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600' };
    return <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-lg border ${r.color}`}>{r.label}</span>;
}
function ContractBadge({ type }) {
    const c = CONTRACT_MAP[type] || { label: type, color: 'bg-gray-50 text-gray-500 dark:bg-gray-700/50 dark:text-gray-400' };
    return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${c.color}`}>{c.label}</span>;
}

function StatusDot({ status, lastActiveAt, roles, contractType, shiftStart, shiftEnd }) {
    const isOnline = lastActiveAt && (new Date() - new Date(lastActiveAt)) < 5 * 60 * 1000;
    const isIntern = roles?.includes('INTERN');
    const isAdmin  = roles?.includes('ADMIN');
    const isRetired = contractType === 'EXPIRED';

    if (isRetired || isAdmin) return null;

    if (isIntern) {
        if (isOnline) {
            return (
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] text-green-600 dark:text-green-400 font-black uppercase tracking-widest animate-bounce">ONLINE</span>
                </div>
            );
        }
        return null;
    }

    const isInShiftTime = (() => {
        if (!shiftStart || !shiftEnd) return false;
        const now = new Date();
        const [sH, sM] = shiftStart.split(':').map(Number);
        const [eH, eM] = shiftEnd.split(':').map(Number);
        const startTime = new Date(now).setHours(sH, sM, 0);
        const endTime   = new Date(now).setHours(eH, eM, 0);
        return now >= startTime && now <= endTime;
    })();

    if (status !== 'ON_SHIFT' && isInShiftTime) {
        return (
            <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)] animate-pulse" />
                    <span className="text-xs font-black uppercase tracking-tighter text-red-600 dark:text-red-400">Đã vào ca</span>
                </div>
                <span className="text-[9px] text-gray-400 dark:text-gray-500 font-bold ml-4.5 leading-none uppercase">CHƯA CHẤM CÔNG</span>
            </div>
        );
    }

    if (status !== 'ON_SHIFT') {
        return (
            <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-gray-600" />
                <span className="text-xs font-black uppercase tracking-tighter text-gray-400 dark:text-gray-500 font-bold">Ngoại tuyến</span>
            </div>
        );
    }

    if (isOnline) {
        return (
            <div className="flex items-center gap-2 group">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse ring-4 ring-green-100 dark:ring-green-900/30" />
                <div className="flex flex-col">
                    <span className="text-xs font-black uppercase tracking-tighter text-green-600 dark:text-green-400">Đang làm việc</span>
                    <span className="text-[9px] text-green-400 dark:text-green-500 font-black leading-none animate-bounce">ONLINE</span>
                </div>
            </div>
        );
    } else {
        return (
            <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-gray-400 dark:bg-gray-600" />
                <div className="flex flex-col">
                    <span className="text-xs font-black uppercase tracking-tighter text-gray-400 dark:text-gray-500 font-bold">Đang làm việc</span>
                    <span className="text-[9px] text-gray-300 dark:text-gray-600 font-bold leading-none ml-4.5">OFFLINE</span>
                </div>
            </div>
        );
    }
}

export default function Staff({ onCreateInbound, onCreateOutbound }) {
    const { user } = useAuth();
    const [data, setData]             = useState([]);
    const [loading, setLoading]       = useState(true);
    const [search, setSearch]         = useState('');
    const [searchBy, setSearchBy]     = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [modalOpen, setModalOpen]   = useState(false);
    const [editData, setEditData]     = useState(null);
    const debounceRef = useRef(null);

    const fetchData = async (keyword = '') => {
        setLoading(true);
        try {
            const url = keyword.trim() ? `${BASE}?keyword=${encodeURIComponent(keyword)}` : BASE;
            const res = await axiosClient.get(url);
            setData(res.data);
        } catch {
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSearchChange = (val) => {
        setSearch(val);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => fetchData(val), 300);
    };

    const checkIfInShift = (start, end) => {
        if (!start || !end) return false;
        const now = new Date();
        const [sH, sM] = start.split(':').map(Number);
        const [eH, eM] = end.split(':').map(Number);
        const startTime = new Date(now).setHours(sH, sM, 0);
        const endTime   = new Date(now).setHours(eH, eM, 0);
        return now >= startTime && now <= endTime;
    };

    const filtered = useMemo(() => {
        return data.filter(row => {
            if (filterStatus !== 'all' && row.workStatus !== filterStatus) return false;
            if (search && searchBy !== 'all') {
                const q = search.toLowerCase();
                if (searchBy === 'name')     return (row.fullName || '').toLowerCase().includes(q);
                if (searchBy === 'code')     return (row.employeeCode || '').toLowerCase().includes(q);
                if (searchBy === 'username') return (row.username || '').toLowerCase().includes(q);
            }
            return true;
        });
    }, [data, filterStatus, search, searchBy]);

    const {
        selectedIds,
        handleRowClick,
        clearSelection,
        selectedItems
    } = useSelection(filtered, (row) => {
        if (user?.roles?.includes('ADMIN')) {
            setEditData(row);
            setModalOpen(true);
        }
    });

    const {
        isExportModalOpen,
        exportFileName,
        setExportFileName,
        openExportModal,
        closeExportModal,
        performExport,
        detectBestExportMode
    } = useExcelExport('danh_sach_nhan_su.xlsx');

    const stats = {
        total:    data.length,
        working:  data.filter(d => d.workStatus === 'ON_SHIFT' && d.contractType !== 'EXPIRED').length,
        absent:   data.filter(d => d.workStatus !== 'ON_SHIFT' && d.contractType !== 'EXPIRED' && !d.roles?.includes('INTERN') && !d.roles?.includes('ADMIN') && checkIfInShift(d.shiftStartTime, d.shiftEndTime)).length,
        offline:  data.filter(d => d.workStatus !== 'ON_SHIFT' && d.contractType !== 'EXPIRED' && !d.roles?.includes('INTERN') && !d.roles?.includes('ADMIN') && !checkIfInShift(d.shiftStartTime, d.shiftEndTime)).length,
        resigned: data.filter(d => d.contractType === 'EXPIRED').length,
    };

    const handleAdd    = () => { setEditData(null); setModalOpen(true); };
    const handleEdit   = () => {
        if (selectedIds.length !== 1) return alert('Vui lòng chọn duy nhất một nhân viên để chỉnh sửa!');
        setEditData(selectedItems[0]); setModalOpen(true);
    };
    const handleDelete = async () => {
        if (selectedIds.length === 0) return alert('Vui lòng chọn ít nhất một nhân viên để xóa!');
        const names = selectedItems.map(i => i.fullName).join(', ');
        if (!window.confirm(`Xác nhận xóa các nhân viên: "${names}"?`)) return;
        try {
            for (const item of selectedItems) {
                await axiosClient.delete(`${BASE}/${item.id}`);
            }
            clearSelection();
            fetchData(search);
        } catch {
            alert('Xóa thất bại!');
        }
    };

    const handleCreateInbound = () => {
        if (selectedIds.length !== 1) return alert('Vui lòng chọn duy nhất một nhân viên để lập phiếu nhập!');
        onCreateInbound?.({ kind: 'inbound', source: 'staff', staff: selectedItems[0], products: [] });
    };

    const handleCreateOutbound = () => {
        if (selectedIds.length !== 1) return alert('Vui lòng chọn duy nhất một nhân viên để lập phiếu xuất!');
        onCreateOutbound?.({ kind: 'outbound', source: 'staff', staff: selectedItems[0], products: [] });
    };

    const handleExportExcel = async () => {
        const source = selectedItems.length > 0 ? selectedItems : filtered;
        if (!source.length) return alert('Không có dữ liệu để xuất!');

        const sheetData = source.map((row, idx) => ({
            "STT": idx + 1,
            "Mã nhân viên": row.employeeCode,
            "Họ tên": row.fullName,
            "Username": row.username,
            "Số điện thoại": row.phone,
            "Email": row.email,
            "Vai trò": ROLE_MAP[row.warehouseRole]?.label || row.warehouseRole,
            "Hợp đồng": CONTRACT_MAP[row.contractType]?.label || row.contractType,
            "Trạng thái": row.enabled ? "Hoạt động" : "Đã khóa"
        }));

        const ws = XLSX.utils.json_to_sheet(sheetData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "NhanVien");

        await performExport(wb, null, sheetData);
        closeExportModal();
    };

    const toolbarActions = [
        { label: 'Thêm',       iconSrc: addIcon,      onClick: handleAdd },
        { label: 'Chỉnh sửa',  iconSrc: fixIcon,      onClick: handleEdit },
        { label: 'Xóa',        iconSrc: deleteIcon,   onClick: handleDelete },
        { label: 'Phiếu nhập', iconSrc: inboundIcon,  onClick: handleCreateInbound },
        { label: 'Phiếu xuất', iconSrc: outboundIcon, onClick: handleCreateOutbound },
        { label: 'Nhập Excel', iconSrc: excelIcon,    onClick: () => {} },
        { label: 'Xuất Excel', iconSrc: excel1Icon,   onClick: () => openExportModal() },
    ];

    return (
        <div className="p-4 lg:p-8 bg-gray-50 dark:bg-gray-900 min-h-full flex flex-col text-left transition-colors duration-300">
            <h1 className="text-xl lg:text-2xl font-black text-gray-800 dark:text-gray-100 mb-6 uppercase tracking-tight">
                Quản lý nhân sự & Hệ thống
            </h1>

            {/* Stats cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                {[
                    { label: 'Tổng nhân sự',  value: stats.total,    color: 'border-l-[#1192a8]', text: 'text-[#1192a8]' },
                    { label: 'Đang làm việc', value: stats.working,  color: 'border-l-green-500', text: 'text-green-600 dark:text-green-400' },
                    { label: 'Vắng làm',      value: stats.absent,   color: 'border-l-red-500',   text: 'text-red-600 dark:text-red-400' },
                    { label: 'Ngoại tuyến',   value: stats.offline,  color: 'border-l-amber-400', text: 'text-amber-500 dark:text-amber-400' },
                    { label: 'Đã nghỉ việc',  value: stats.resigned, color: 'border-l-gray-400',  text: 'text-gray-400 dark:text-gray-500' },
                ].map((s, i) => (
                    <div key={i} className={`bg-white dark:bg-gray-800 rounded-2xl px-5 py-4 border border-gray-100 dark:border-gray-700 shadow-sm border-l-4 ${s.color} transition-colors duration-300`}>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest">{s.label}</p>
                        <p className={`text-2xl lg:text-3xl font-black mt-1 ${s.text}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            {user?.roles?.includes('ADMIN') && (
                <div className="flex flex-col lg:flex-row lg:items-center justify-between bg-white dark:bg-gray-800 p-4 lg:p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6 gap-4 transition-colors duration-300">
                    <div className="flex overflow-x-auto no-scrollbar pb-2 lg:pb-0 gap-6 lg:gap-8">
                        {toolbarActions.map((action, i) => (
                            <button key={i} onClick={action.onClick}
                                    className="flex flex-col items-center gap-1 shrink-0 group bg-transparent border-none cursor-pointer transition-transform active:scale-90">
                                <div className="w-10 h-10 flex items-center justify-center rounded-xl group-hover:bg-gray-100 dark:group-hover:bg-gray-700 transition duration-200">
                                    <img src={action.iconSrc} alt={action.label} className="w-8 h-8 object-contain dark:opacity-85 dark:brightness-110" />
                                </div>
                                <span className="text-[9px] font-black text-[#00529c] dark:text-[#1192a8] uppercase tracking-tighter group-hover:text-[#1192a8] dark:group-hover:text-[#38bcd4] transition text-center whitespace-nowrap">{action.label}</span>
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                        <select
                            value={filterStatus}
                            onChange={e => setFilterStatus(e.target.value)}
                            className="border border-gray-100 dark:border-gray-600 rounded-xl px-3 py-2 text-xs focus:outline-none bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 cursor-pointer font-bold transition-colors"
                        >
                            <option value="all">Mọi trạng thái</option>
                            <option value="ON_SHIFT">Đang làm việc</option>
                            <option value="OFF_SHIFT">Chưa vào ca</option>
                        </select>
                        <select
                            value={searchBy}
                            onChange={e => setSearchBy(e.target.value)}
                            className="border border-gray-100 dark:border-gray-600 rounded-xl px-3 py-2 text-xs focus:outline-none bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 cursor-pointer font-bold transition-colors"
                        >
                            <option value="all">Tất cả</option>
                            <option value="name">Theo tên</option>
                            <option value="code">Theo mã</option>
                            <option value="username">Username</option>
                        </select>
                        <input
                            type="text"
                            value={search}
                            onChange={e => handleSearchChange(e.target.value)}
                            placeholder="Tìm kiếm nhanh..."
                            className="border-2 border-gray-50 dark:border-gray-600 rounded-xl px-4 py-2 w-full lg:w-40 text-xs focus:outline-none focus:border-[#1192a8] bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 transition-all"
                        />
                        <button
                            onClick={() => { setSearch(''); setFilterStatus('all'); fetchData(''); clearSelection(); }}
                            className="bg-[#1192a8] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-teal-700 flex items-center gap-2 transition-all active:scale-95"
                        >
                            Làm mới
                        </button>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex-1 flex flex-col transition-colors duration-300">
                <div className="overflow-x-auto flex-1 no-scrollbar lg:scrollbar-thin">
                    {loading ? (
                        <div className="flex items-center justify-center h-48 text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">
                            Đang tải dữ liệu nhân sự...
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse min-w-[1000px]">
                            <thead className="bg-gray-50/50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 sticky top-0 z-10">
                            <tr className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                <th className="px-6 py-4 text-center w-12">#</th>
                                <th className="px-6 py-4">Nhân sự & Chân dung</th>
                                <th className="px-6 py-4">Thông tin liên hệ</th>
                                <th className="px-6 py-4">Phân quyền</th>
                                <th className="px-6 py-4">Hợp đồng</th>
                                <th className="px-6 py-4">Hoạt động thực tế</th>
                                <th className="px-6 py-4 text-right">Tài khoản</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-20 text-center text-gray-300 dark:text-gray-600 text-xs font-medium italic">
                                        Không có dữ liệu nhân sự phù hợp bộ lọc
                                    </td>
                                </tr>
                            ) : filtered.map((row, idx) => (
                                <tr
                                    key={row.id}
                                    onClick={(e) => handleRowClick(row, idx, e)}
                                    onDoubleClick={() => { if (user?.roles?.includes('ADMIN')) { setEditData(row); setModalOpen(true); } }}
                                    className={`transition-all cursor-pointer group
                                            ${row.contractType === 'EXPIRED' ? 'bg-gray-50/30 dark:bg-gray-800/30 opacity-60' : ''}
                                            ${selectedIds.includes(row.id)
                                        ? 'bg-[#1192a8]/10 dark:bg-[#1192a8]/15 border-l-4 border-l-[#1192a8]'
                                        : 'hover:bg-blue-50/30 dark:hover:bg-gray-700/30 border-l-4 border-l-transparent'
                                    }`}
                                >
                                    <td className="px-6 py-4 text-xs text-center text-gray-400 dark:text-gray-600 font-bold">{idx + 1}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white dark:border-gray-700 shadow-sm shrink-0">
                                                <img src={getAvatarSrc(row.avatar)} alt="Avatar" className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-gray-800 dark:text-gray-100 tracking-tight group-hover:text-[#1192a8] dark:group-hover:text-[#38bcd4] transition-colors">{row.fullName}</p>
                                                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest">{row.employeeCode}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-xs font-bold text-gray-600 dark:text-gray-300">{row.phone || '—'}</p>
                                        <p className="text-[10px] text-gray-400 dark:text-gray-500 italic">@{row.username || 'chưa_tạo'}</p>
                                    </td>
                                    <td className="px-6 py-4"><RoleBadge role={row.warehouseRole} /></td>
                                    <td className="px-6 py-4">
                                        <ContractBadge type={row.contractType} />
                                        {(row.shiftStartTime || row.shiftEndTime) && (
                                            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 font-mono font-bold uppercase">
                                                ⏰ {row.shiftStartTime || '??'} - {row.shiftEndTime || '??'}
                                            </p>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusDot
                                            status={row.workStatus}
                                            lastActiveAt={row.lastActiveAt}
                                            roles={row.roles}
                                            contractType={row.contractType}
                                            shiftStart={row.shiftStartTime}
                                            shiftEnd={row.shiftEndTime}
                                        />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${
                                                row.enabled
                                                    ? 'bg-green-50 text-green-600 border border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                                                    : 'bg-red-50 text-red-600 border border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                                            }`}>
                                                {row.enabled ? 'Hoạt động' : 'Đã khóa'}
                                            </span>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Selection hint */}
            {selectedIds.length > 0 && user?.roles?.includes('ADMIN') && (
                <p className="mt-3 text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest text-right">
                    Đang chọn: <span className="text-[#1192a8]">{selectedIds.length} nhân sự</span> — Nhấn đúp chuột để chỉnh sửa nhanh
                </p>
            )}

            <StaffModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSaved={() => fetchData(search)} editData={editData} />
            <ExportExcelModal
                isOpen={isExportModalOpen}
                fileName={exportFileName}
                onFileNameChange={setExportFileName}
                onExport={handleExportExcel}
                onClose={closeExportModal}
                saveMode={detectBestExportMode()}
            />
        </div>
    );
}