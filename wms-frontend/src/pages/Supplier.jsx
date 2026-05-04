// ================================================================
// 2. Supplier.jsx — thay fetch → axiosClient
// ================================================================
import React, { useState, useEffect, useRef } from 'react';
import SupplierModal from '../components/modals/SupplierModal';
import axiosClient from '../api/axiosClient';
import addIcon    from '../components/common/icons/add.png';
import fixIcon    from '../components/common/icons/fix.png';
import deleteIcon from '../components/common/icons/delete.png';
import excelIcon  from '../components/common/icons/excel.png';
import excel1Icon from '../components/common/icons/excel1.png';

const BASE = '/api/suppliers';

export default function Supplier() {
    const [data, setData]         = useState([]);
    const [loading, setLoading]   = useState(true);
    const [selected, setSelected] = useState(null);
    const [search, setSearch]     = useState('');
    const [searchBy, setSearchBy] = useState('all');
    const [modalOpen, setModalOpen] = useState(false);
    const [editData, setEditData]   = useState(null);
    const debounceRef = useRef(null);

    const fetchData = async (keyword = '') => {
        setLoading(true);
        try {
            const url = keyword.trim() ? `${BASE}?keyword=${encodeURIComponent(keyword)}` : BASE;
            const res = await axiosClient.get(url);
            setData(res.data);
        } catch { setData([]); }
        finally  { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSearchChange = (val) => {
        setSearch(val);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => fetchData(val), 300);
    };

    const filtered = searchBy === 'all' ? data : data.filter(row => {
        const q = search.toLowerCase();
        if (searchBy === 'name')    return row.name?.toLowerCase().includes(q);
        if (searchBy === 'code')    return row.supplierCode?.toLowerCase().includes(q);
        if (searchBy === 'phone')   return row.phone?.toLowerCase().includes(q);
        if (searchBy === 'address') return row.address?.toLowerCase().includes(q);
        return true;
    });

    const handleAdd    = () => { setEditData(null); setModalOpen(true); };
    const handleEdit   = () => {
        if (!selected) return alert('Vui lòng chọn một nhà cung cấp để chỉnh sửa!');
        setEditData(selected); setModalOpen(true);
    };
    const handleDelete = async () => {
        if (!selected) return alert('Vui lòng chọn một nhà cung cấp để xóa!');
        if (!window.confirm(`Xác nhận xóa nhà cung cấp "${selected.name}"?`)) return;
        try {
            await axiosClient.delete(`${BASE}/${selected.id}`);
            setSelected(null); fetchData(search);
        } catch { alert('Xóa thất bại, vui lòng thử lại!'); }
    };

    const toolbarActions = [
        { label: 'Thêm',       iconSrc: addIcon,    onClick: handleAdd },
        { label: 'Chỉnh sửa',  iconSrc: fixIcon,    onClick: handleEdit },
        { label: 'Xóa',        iconSrc: deleteIcon, onClick: handleDelete },
        { label: 'Nhập Excel', iconSrc: excelIcon,  onClick: () => {} },
        { label: 'Xuất Excel', iconSrc: excel1Icon, onClick: () => {} },
    ];

    return (
        <div className="p-8 bg-gray-50 h-full flex flex-col">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Quản lý nhà cung cấp</h1>
            <div className="flex items-center justify-between bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
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
                <div className="flex items-center gap-3">
                    <select value={searchBy} onChange={e => setSearchBy(e.target.value)}
                        className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1192a8]/20 focus:border-[#1192a8] bg-white text-gray-600 cursor-pointer">
                        <option value="all">Tất cả</option>
                        <option value="name">Theo tên</option>
                        <option value="code">Theo mã</option>
                        <option value="phone">Theo SĐT</option>
                        <option value="address">Theo địa chỉ</option>
                    </select>
                    <input type="text" value={search} onChange={e => handleSearchChange(e.target.value)}
                        className="border border-gray-200 rounded-xl px-5 py-2.5 w-72 text-sm focus:outline-none focus:ring-2 focus:ring-[#1192a8]/20 focus:border-[#1192a8] transition-all"
                        placeholder="Nhập nội dung tìm kiếm..." />
                    <button onClick={() => { setSearch(''); fetchData(''); }}
                        className="bg-[#1192a8] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-teal-700 hover:shadow-lg hover:shadow-teal-500/30 flex items-center gap-2 transition-all active:scale-95">
                        <span className="text-lg">↻</span> Làm mới
                    </button>
                </div>
            </div>
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mt-6 flex-1">
                {loading ? (
                    <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Đang tải dữ liệu...</div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 border-b">
                            <tr className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                                <th className="px-6 py-4 text-center w-16">STT</th>
                                <th className="px-6 py-4 w-36">Mã NCC</th>
                                <th className="px-6 py-4">Tên nhà cung cấp</th>
                                <th className="px-6 py-4">Số điện thoại</th>
                                <th className="px-6 py-4">Địa chỉ</th>
                                <th className="px-6 py-4 text-right">SL đã nhập</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-sm">Không tìm thấy dữ liệu phù hợp</td></tr>
                            ) : filtered.map((row, idx) => (
                                <tr key={row.id}
                                    onClick={() => setSelected(selected?.id === row.id ? null : row)}
                                    onDoubleClick={() => { setEditData(row); setModalOpen(true); }}
                                    className={`transition-colors cursor-pointer group ${selected?.id === row.id ? 'bg-teal-50 border-l-4 border-l-[#1192a8]' : 'hover:bg-blue-50/50'}`}>
                                    <td className="px-6 py-4 text-sm text-center text-gray-400 font-medium">{idx + 1}</td>
                                    <td className="px-6 py-4 text-sm font-mono text-gray-500">{row.supplierCode}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-[#1192a8] group-hover:text-teal-600">{row.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">{row.phone || '—'}</td>
                                    <td className="px-6 py-4 text-xs text-gray-500 italic max-w-xs truncate">{row.address || '—'}</td>
                                    <td className="px-6 py-4 text-sm text-right font-semibold text-gray-700">{row.totalImportQuantity?.toLocaleString('vi-VN') || 0}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            {selected && (
                <p className="mt-2 text-xs text-gray-400 text-right">
                    Đã chọn: <span className="text-[#1192a8] font-semibold">{selected.name}</span> — Double-click để sửa nhanh
                </p>
            )}
            <SupplierModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSaved={() => fetchData(search)} editData={editData} />
        </div>
    );
}