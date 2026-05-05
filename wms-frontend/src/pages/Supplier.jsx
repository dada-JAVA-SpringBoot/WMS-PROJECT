// ================================================================
// 2. Supplier.jsx — thay fetch → axiosClient
// ================================================================
import React, { useState, useEffect, useRef } from 'react';
import SupplierModal from '../components/modals/SupplierModal';
import axiosClient from '../api/axiosClient';
import addIcon    from '../components/common/icons/add.png';
import fixIcon    from '../components/common/icons/fix.png';
import deleteIcon from '../components/common/icons/delete.png';
import inboundIcon from '../components/common/icons/inbound.png';
import excelIcon  from '../components/common/icons/excel.png';
import excel1Icon from '../components/common/icons/excel1.png';

const BASE = '/api/suppliers';

export default function Supplier({ onCreateInbound }) {
    const [data, setData]         = useState([]);
    const [loading, setLoading]   = useState(true);
    const [selected, setSelected] = useState(null);
    const [search, setSearch]     = useState('');
    const [searchBy, setSearchBy] = useState('all');
    const [modalOpen, setModalOpen] = useState(false);
    const [editData, setEditData]   = useState(null);
    const debounceRef = useRef(null);

    // ── 1. Fetch Dữ liệu bằng axiosClient ──────────
    const fetchData = async (keyword = '') => {
        setLoading(true);
        try {
            const url = keyword.trim() ? `${BASE}?keyword=${encodeURIComponent(keyword)}` : BASE;
            const res = await axiosClient.get(url);
            // Đảm bảo dữ liệu luôn là mảng
            setData(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error("Lỗi kết nối API:", error);
            setData([]); 
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // ── 2. Xử lý Tìm kiếm (Debounce để giảm tải Backend) ──────
    const handleSearchChange = (val) => {
        setSearch(val);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            fetchData(val);
        }, 500); // Đợi 0.5s sau khi ngừng gõ mới gọi API
    };

    // Lọc dữ liệu ở Client theo tiêu chí (searchBy) dựa trên kết quả trả về
    const filtered = searchBy === 'all' ? data : data.filter(row => {
        const q = search.toLowerCase();
        if (searchBy === 'name')    return row.name?.toLowerCase().includes(q);
        if (searchBy === 'code')    return row.supplierCode?.toLowerCase().includes(q);
        if (searchBy === 'phone')   return row.phone?.toLowerCase().includes(q);
        if (searchBy === 'address') return row.address?.toLowerCase().includes(q);
        return true;
    });

    // ── 3. Thêm/Sửa/Xóa ────────────────────────────────────
    const handleAdd = () => {
        setEditData(null);
        setModalOpen(true);
    };

    const handleEdit = () => {
        if (!selected) return alert('Vui lòng chọn một nhà cung cấp để chỉnh sửa!');
        setEditData(selected);
        setModalOpen(true);
    };

    const handleDelete = async () => {
        if (!selected) return alert('Vui lòng chọn một nhà cung cấp!');
        if (!window.confirm(`Xác nhận xóa nhà cung cấp "${selected.name}" khỏi hệ thống?`)) return;

        try {
            await axiosClient.delete(`${BASE}/${selected.id}`);
            alert("Xóa thành công!");
            setSelected(null); 
            fetchData(search);
        } catch {
            alert('Không thể xóa nhà cung cấp này (có thể liên quan đến dữ liệu khác) hoặc lỗi kết nối!');
        }
    };

    const handleCreateInbound = () => {
        if (!selected) return alert('Vui lòng chọn một nhà cung cấp để lập phiếu nhập!');
        onCreateInbound?.({
            kind: 'inbound',
            source: 'supplier',
            supplier: selected,
            products: []
        });
    };

    const toolbarActions = [
        { label: 'Thêm',       iconSrc: addIcon,    onClick: handleAdd },
        { label: 'Chỉnh sửa',  iconSrc: fixIcon,    onClick: handleEdit },
        { label: 'Xóa',        iconSrc: deleteIcon, onClick: handleDelete },
        { label: 'Phiếu nhập', iconSrc: inboundIcon, onClick: handleCreateInbound },
        { label: 'Nhập Excel', iconSrc: excelIcon,  onClick: () => {} },
        { label: 'Xuất Excel', iconSrc: excel1Icon, onClick: () => {} },
    ];

    return (
        <div className="p-8 bg-gray-50 h-full flex flex-col text-left font-sans">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 px-2">Quản lý nhà cung cấp</h1>

            {/* Toolbar & Search */}
            <div className="flex items-center justify-between bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-6">
                <div className="flex gap-8">
                    {toolbarActions.map((action, i) => (
                        <button
                            key={i}
                            onClick={action.onClick}
                            className="flex flex-col items-center gap-1 group bg-transparent border-none cursor-pointer transition-transform active:scale-95"
                        >
                            <div className="w-12 h-12 flex items-center justify-center rounded-xl group-hover:bg-gray-100 transition duration-200">
                                <img src={action.iconSrc} alt={action.label} className="w-9 h-9 object-contain" />
                            </div>
                            <span className="text-[10px] font-bold text-[#00529c] uppercase tracking-tighter group-hover:text-[#1192a8] transition whitespace-nowrap">
                                {action.label}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    <select
                        value={searchBy}
                        onChange={e => setSearchBy(e.target.value)}
                        className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#1192a8]/20 focus:border-[#1192a8] bg-white text-gray-600 cursor-pointer"
                    >
                        <option value="all">Tất cả thông tin</option>
                        <option value="name">Tên nhà cung cấp</option>
                        <option value="code">Mã NCC</option>
                        <option value="phone">Số điện thoại</option>
                        <option value="address">Địa chỉ</option>
                    </select>
                    <input
                        type="text"
                        value={search}
                        onChange={e => handleSearchChange(e.target.value)}
                        className="border border-gray-200 rounded-xl px-5 py-2.5 w-72 text-sm outline-none focus:ring-2 focus:ring-[#1192a8]/20 focus:border-[#1192a8] transition-all"
                        placeholder="Tìm kiếm NCC..."
                    />
                    <button
                        onClick={() => { setSearch(''); fetchData(''); }}
                        className="bg-[#1192a8] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-teal-700 hover:shadow-lg hover:shadow-teal-500/30 flex items-center gap-2 transition-all active:scale-95"
                    >
                        <span className="text-lg">↻</span> Làm mới
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex-1">
                <div className="overflow-auto h-full">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 border-b sticky top-0 z-10">
                        <tr className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                            <th className="px-6 py-4 text-center w-16">STT</th>
                            <th className="px-6 py-4 w-36 text-center">Mã NCC</th>
                            <th className="px-6 py-4">Tên nhà cung cấp</th>
                            <th className="px-6 py-4">Số điện thoại</th>
                            <th className="px-6 py-4">Địa chỉ</th>
                            <th className="px-6 py-4 text-right">SL đã nhập</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-sm">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-20 text-center text-[#1192a8] font-bold animate-pulse">
                                    ĐANG KẾT NỐI VỚI SQL SERVER...
                                </td>
                            </tr>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-20 text-center text-gray-400 italic">
                                    Không tìm thấy dữ liệu nhà cung cấp nào phù hợp.
                                </td>
                            </tr>
                        ) : filtered.map((row, idx) => (
                            <tr
                                key={row.id}
                                onClick={() => setSelected(selected?.id === row.id ? null : row)}
                                onDoubleClick={() => { setEditData(row); setModalOpen(true); }}
                                className={`transition-all cursor-pointer group ${
                                    selected?.id === row.id ? 'bg-cyan-50 border-l-4 border-l-[#1192a8]' : 'hover:bg-slate-50'
                                }`}
                            >
                                <td className="px-6 py-4 text-center text-gray-400 font-bold">{idx + 1}</td>
                                <td className="px-6 py-4 text-center font-mono font-bold text-gray-500 uppercase">{row.supplierCode}</td>
                                <td className="px-6 py-4 font-bold text-gray-800 group-hover:text-[#1192a8] transition-colors">{row.name}</td>
                                <td className="px-6 py-4 text-gray-600 font-mono">{row.phone || '—'}</td>
                                <td className="px-6 py-4 text-xs text-gray-500 italic max-w-xs truncate">{row.address || '—'}</td>
                                <td className="px-6 py-4 text-right font-black text-[#1192a8]">
                                    {row.totalImportQuantity?.toLocaleString('vi-VN') || 0}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {/* Selected Info Footer */}
            {selected && (
                <div className="mt-3 flex justify-between items-center px-4">
                    <p className="text-xs text-gray-400">
                        Đang chọn: <span className="text-[#1192a8] font-bold">{selected.name}</span>
                    </p>
                    <span className="text-[10px] text-gray-300 italic underline">Double-click dòng để sửa nhanh</span>
                </div>
            )}
            <SupplierModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSaved={() => fetchData(search)} editData={editData} />
        </div>
    );
}