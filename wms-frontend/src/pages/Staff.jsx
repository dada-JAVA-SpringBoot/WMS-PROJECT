// ================================================================
// 3. Staff.jsx — thay fetch → axiosClient
// ================================================================
import React, { useState, useEffect, useRef } from 'react';
import StaffModal from '../components/modals/StaffModal';
import axiosClient from '../api/axiosClient';
import addIcon    from '../components/common/icons/add.png';
import fixIcon    from '../components/common/icons/fix.png';
import deleteIcon from '../components/common/icons/delete.png';
import inboundIcon from '../components/common/icons/inbound.png';
import outboundIcon from '../components/common/icons/outbound.png';
import excelIcon  from '../components/common/icons/excel.png';
import excel1Icon from '../components/common/icons/excel1.png';

const BASE = '/api/staff';

const ROLE_MAP = {
    WAREHOUSE_MANAGER:  { label: 'Quản lý kho',     color: 'bg-purple-100 text-purple-700 border-purple-200' },
    WAREHOUSE_KEEPER:   { label: 'Thủ kho',          color: 'bg-blue-100 text-blue-700 border-blue-200' },
    INBOUND_STAFF:      { label: 'Nhập kho',         color: 'bg-teal-100 text-teal-700 border-teal-200' },
    OUTBOUND_STAFF:     { label: 'Xuất kho',         color: 'bg-orange-100 text-orange-700 border-orange-200' },
    INVENTORY_CHECKER:  { label: 'Kiểm kê',          color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
};
const CONTRACT_MAP = {
    FULL_TIME: { label: 'Full-time',    color: 'bg-green-100 text-green-700' },
    PART_TIME: { label: 'Part-time',   color: 'bg-cyan-100 text-cyan-700' },
    PROBATION: { label: 'Thử việc',    color: 'bg-amber-100 text-amber-700' },
    INTERN:    { label: 'Thực tập',    color: 'bg-pink-100 text-pink-700' },
};
const STATUS_MAP = {
    ON_SHIFT:  { label: 'Đang trong ca',  dot: 'bg-green-500', color: 'text-green-700' },
    OFF_SHIFT: { label: 'Không trong ca', dot: 'bg-gray-400',  color: 'text-gray-500' },
    RESIGNED:  { label: 'Đã nghỉ làm',   dot: 'bg-red-400',   color: 'text-red-500' },
};
const GENDER_MAP = { MALE: 'Nam', FEMALE: 'Nữ' };

const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '—';

function RoleBadge({ role }) {
    const r = ROLE_MAP[role] || { label: role, color: 'bg-gray-100 text-gray-600 border-gray-200' };
    return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${r.color}`}>{r.label}</span>;
}
function ContractBadge({ type }) {
    const c = CONTRACT_MAP[type] || { label: type, color: 'bg-gray-100 text-gray-600' };
    return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.color}`}>{c.label}</span>;
}
function StatusDot({ status }) {
    const s = STATUS_MAP[status] || STATUS_MAP.OFF_SHIFT;
    return (
        <span className={`flex items-center gap-1.5 text-xs font-semibold ${s.color}`}>
            <span className={`w-2 h-2 rounded-full ${s.dot} ${status === 'ON_SHIFT' ? 'animate-pulse' : ''}`} />
            {s.label}
        </span>
    );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function Staff({ onCreateInbound, onCreateOutbound }) {
    const [data, setData]             = useState([]);
    const [loading, setLoading]       = useState(true);
    const [selected, setSelected]     = useState(null);
    const [search, setSearch]         = useState('');
    const [searchBy, setSearchBy]     = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterRole, setFilterRole]     = useState('all');
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

    const filtered = data.filter(row => {
        if (filterStatus !== 'all' && row.workStatus !== filterStatus) return false;
        if (filterRole   !== 'all' && row.warehouseRole !== filterRole) return false;
        if (search && searchBy !== 'all') {
            const q = search.toLowerCase();
            if (searchBy === 'name')  return row.fullName?.toLowerCase().includes(q);
            if (searchBy === 'code')  return row.employeeCode?.toLowerCase().includes(q);
            if (searchBy === 'phone') return row.phone?.toLowerCase().includes(q);
            if (searchBy === 'email') return row.email?.toLowerCase().includes(q);
        }
        return true;
    });

    const stats = {
        total:    data.length,
        onShift:  data.filter(d => d.workStatus === 'ON_SHIFT').length,
        offShift: data.filter(d => d.workStatus === 'OFF_SHIFT').length,
        resigned: data.filter(d => d.workStatus === 'RESIGNED').length,
    };

    const handleAdd    = () => { setEditData(null); setModalOpen(true); };
    
    const handleEdit   = () => {
        if (!selected) return alert('Vui lòng chọn một nhân viên để chỉnh sửa!');
        setEditData(selected); setModalOpen(true);
    };
    
    const handleDelete = async () => {
        if (!selected) return alert('Vui lòng chọn một nhân viên để xóa!');
        if (!window.confirm(`Xác nhận xóa nhân viên "${selected.fullName}"?`)) return;
        try {
            await axiosClient.delete(`${BASE}/${selected.id}`);
            setSelected(null); 
            fetchData(search);
        } catch { 
            alert('Xóa thất bại!'); 
        }
    };

    const handleCreateInbound = () => {
        if (!selected) return alert('Vui lòng chọn một nhân viên để lập phiếu nhập!');
        onCreateInbound?.({
            kind: 'inbound',
            source: 'staff',
            staff: selected,
            products: []
        });
    };

    const handleCreateOutbound = () => {
        if (!selected) return alert('Vui lòng chọn một nhân viên để lập phiếu xuất!');
        onCreateOutbound?.({
            kind: 'outbound',
            source: 'staff',
            staff: selected,
            products: []
        });
    };

    const toolbarActions = [
        { label: 'Thêm',       iconSrc: addIcon,    onClick: handleAdd },
        { label: 'Chỉnh sửa',  iconSrc: fixIcon,    onClick: handleEdit },
        { label: 'Xóa',        iconSrc: deleteIcon, onClick: handleDelete },
        { label: 'Phiếu nhập', iconSrc: inboundIcon,  onClick: handleCreateInbound },
        { label: 'Phiếu xuất', iconSrc: outboundIcon, onClick: handleCreateOutbound },
        { label: 'Nhập Excel', iconSrc: excelIcon,  onClick: () => {} },
        { label: 'Xuất Excel', iconSrc: excel1Icon, onClick: () => {} },
    ];

    return (
        <div className="p-8 bg-gray-50 min-h-full flex flex-col">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Quản lý nhân viên</h1>
            <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Tổng nhân viên', value: stats.total,    color: 'border-l-[#1192a8]', text: 'text-[#1192a8]' },
                    { label: 'Đang trong ca',  value: stats.onShift,  color: 'border-l-green-500', text: 'text-green-600' },
                    { label: 'Không trong ca', value: stats.offShift, color: 'border-l-gray-400',  text: 'text-gray-500' },
                    { label: 'Đã nghỉ làm',   value: stats.resigned, color: 'border-l-red-400',   text: 'text-red-500'  },
                ].map((s, i) => (
                    <div key={i} className={`bg-white rounded-2xl px-5 py-4 border border-gray-100 shadow-sm border-l-4 ${s.color}`}>
                        <p className="text-xs text-gray-500 font-medium">{s.label}</p>
                        <p className={`text-3xl font-black mt-1 ${s.text}`}>{s.value}</p>
                    </div>
                ))}
            </div>
            <div className="flex items-center justify-between bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-6">
                <div className="flex gap-8">
                    {toolbarActions.map((action, i) => (
                        <button key={i} onClick={action.onClick}
                            className="flex flex-col items-center gap-1 group bg-transparent border-none cursor-pointer transition-transform active:scale-90">
                            <div className="w-12 h-12 flex items-center justify-center rounded-xl group-hover:bg-gray-100 transition duration-200">
                                <img src={action.iconSrc} alt={action.label} className="w-9 h-9 object-contain" />
                            </div>
                            <span className="text-[10px] font-bold text-[#00529c] uppercase tracking-tighter group-hover:text-[#1192a8] transition text-center whitespace-nowrap">{action.label}</span>
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-3 flex-wrap justify-end">
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                        className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-white text-gray-600 cursor-pointer">
                        <option value="all">Tất cả trạng thái</option>
                        <option value="ON_SHIFT">Đang trong ca</option>
                        <option value="OFF_SHIFT">Không trong ca</option>
                        <option value="RESIGNED">Đã nghỉ làm</option>
                    </select>
                    <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
                        className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-white text-gray-600 cursor-pointer">
                        <option value="all">Tất cả vai trò</option>
                        <option value="WAREHOUSE_MANAGER">Quản lý kho</option>
                        <option value="WAREHOUSE_KEEPER">Thủ kho</option>
                        <option value="INBOUND_STAFF">Nhập kho</option>
                        <option value="OUTBOUND_STAFF">Xuất kho</option>
                        <option value="INVENTORY_CHECKER">Kiểm kê</option>
                    </select>
                    <select value={searchBy} onChange={e => setSearchBy(e.target.value)}
                        className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-white text-gray-600 cursor-pointer">
                        <option value="all">Tất cả</option>
                        <option value="name">Theo tên</option>
                        <option value="code">Theo mã</option>
                        <option value="phone">Theo SĐT</option>
                        <option value="email">Theo email</option>
                    </select>
                    <input type="text" value={search} onChange={e => handleSearchChange(e.target.value)}
                        placeholder="Nhập nội dung tìm kiếm..."
                        className="border border-gray-200 rounded-xl px-5 py-2.5 w-56 text-sm focus:outline-none focus:ring-2 focus:ring-[#1192a8]/20 focus:border-[#1192a8] transition-all" />
                    <button onClick={() => { setSearch(''); setFilterStatus('all'); setFilterRole('all'); fetchData(''); }}
                        className="bg-[#1192a8] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-teal-700 flex items-center gap-2 transition-all active:scale-95">
                        <span className="text-lg">↻</span> Làm mới
                    </button>
                </div>
            </div>
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex-1">
                {loading ? (
                    <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Đang tải dữ liệu...</div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 border-b">
                            <tr className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                                <th className="px-5 py-4 text-center w-12">STT</th>
                                <th className="px-5 py-4 w-28">Mã NV</th>
                                <th className="px-5 py-4">Họ và tên</th>
                                <th className="px-5 py-4 text-center w-16">GT</th>
                                <th className="px-5 py-4">SĐT</th>
                                <th className="px-5 py-4">Vai trò</th>
                                <th className="px-5 py-4">Hợp đồng</th>
                                <th className="px-5 py-4">Trạng thái</th>
                                <th className="px-5 py-4">Ngày vào làm</th>
                                <th className="px-5 py-4">Ghi chú</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.length === 0 ? (
                                <tr><td colSpan={10} className="px-6 py-12 text-center text-gray-400 text-sm">Không tìm thấy dữ liệu phù hợp</td></tr>
                            ) : filtered.map((row, idx) => (
                                <tr key={row.id}
                                    onClick={() => setSelected(selected?.id === row.id ? null : row)}
                                    onDoubleClick={() => { setEditData(row); setModalOpen(true); }}
                                    className={`transition-colors cursor-pointer group ${row.workStatus === 'RESIGNED' ? 'opacity-50' : ''} ${selected?.id === row.id ? 'bg-teal-50 border-l-4 border-l-[#1192a8]' : 'hover:bg-blue-50/50'}`}>
                                    <td className="px-5 py-3.5 text-sm text-center text-gray-400">{idx + 1}</td>
                                    <td className="px-5 py-3.5 text-sm font-mono text-gray-500">{row.employeeCode}</td>
                                    <td className="px-5 py-3.5">
                                        <p className="text-sm font-bold text-[#1192a8] group-hover:text-teal-600">{row.fullName}</p>
                                        <p className="text-[11px] text-gray-400">{row.email || '—'}</p>
                                    </td>
                                    <td className="px-5 py-3.5 text-xs text-center text-gray-500">{GENDER_MAP[row.gender] || '—'}</td>
                                    <td className="px-5 py-3.5 text-sm font-mono text-gray-600">{row.phone || '—'}</td>
                                    <td className="px-5 py-3.5"><RoleBadge role={row.warehouseRole} /></td>
                                    <td className="px-5 py-3.5"><ContractBadge type={row.contractType} /></td>
                                    <td className="px-5 py-3.5"><StatusDot status={row.workStatus} /></td>
                                    <td className="px-5 py-3.5 text-xs text-gray-500">{formatDate(row.hireDate)}</td>
                                    <td className="px-5 py-3.5 text-xs text-gray-400 italic max-w-[160px] truncate">{row.notes || '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            {selected && (
                <p className="mt-2 text-xs text-gray-400 text-right">
                    Đã chọn: <span className="text-[#1192a8] font-semibold">{selected.fullName}</span> — Double-click để sửa nhanh
                </p>
            )}
            <StaffModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSaved={() => fetchData(search)} editData={editData} />
        </div>
    );
}