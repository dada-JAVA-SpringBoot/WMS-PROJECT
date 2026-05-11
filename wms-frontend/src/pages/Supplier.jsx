// ================================================================
// 2. Supplier.jsx — thay fetch → axiosClient
// ================================================================
import React, { useState, useEffect, useRef, useMemo } from 'react';
import SupplierModal from '../components/modals/SupplierModal';
import ExportExcelModal from '../components/modals/ExportExcelModal';
import axiosClient from '../api/axiosClient';
import addIcon    from '../components/common/icons/add.png';
import fixIcon    from '../components/common/icons/fix.png';
import deleteIcon from '../components/common/icons/delete.png';
import inboundIcon from '../components/common/icons/inbound.png';
import excelIcon  from '../components/common/icons/excel.png';
import excel1Icon from '../components/common/icons/excel1.png';
import { useSelection } from '../hooks/useSelection';
import { useExcelExport } from '../hooks/useExcelExport';
import * as XLSX from 'xlsx';

const BASE = '/api/suppliers';

export default function Supplier({ onCreateInbound }) {
    const [data, setData]         = useState([]);
    const [loading, setLoading]   = useState(true);
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

    const handleSearchChange = (val) => {
        setSearch(val);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            fetchData(val);
        }, 500);
    };

    const filtered = useMemo(() => {
        if (searchBy === 'all') return data;
        return data.filter(row => {
            const q = search.toLowerCase();
            if (searchBy === 'name')    return (row.name || '').toLowerCase().includes(q);
            if (searchBy === 'code')    return (row.supplierCode || '').toLowerCase().includes(q);
            if (searchBy === 'phone')   return (row.phone || '').toLowerCase().includes(q);
            if (searchBy === 'address') return (row.address || '').toLowerCase().includes(q);
            return true;
        });
    }, [data, search, searchBy]);

    const {
        selectedIds,
        handleRowClick,
        clearSelection,
        selectedItems
    } = useSelection(filtered, (row) => {
        setEditData(row);
        setModalOpen(true);
    });

    const {
        isExportModalOpen,
        exportFileName,
        setExportFileName,
        openExportModal,
        closeExportModal,
        performExport,
        detectBestExportMode
    } = useExcelExport('danh_sach_nha_cung_cap.xlsx');

    const handleAdd = () => {
        setEditData(null);
        setModalOpen(true);
    };

    const handleEdit = () => {
        if (selectedIds.length !== 1) return alert('Vui lòng chọn duy nhất một nhà cung cấp để chỉnh sửa!');
        setEditData(selectedItems[0]);
        setModalOpen(true);
    };

    const handleDelete = async () => {
        if (selectedIds.length === 0) return alert('Vui lòng chọn ít nhất một nhà cung cấp!');
        const names = selectedItems.map(i => i.name).join(', ');
        if (!window.confirm(`Xác nhận xóa các nhà cung cấp: "${names}" khỏi hệ thống?`)) return;

        try {
            for (const item of selectedItems) {
                await axiosClient.delete(`${BASE}/${item.id}`);
            }
            alert("Xóa thành công!");
            clearSelection();
            fetchData(search);
        } catch {
            alert('Lỗi khi xóa nhà cung cấp hoặc lỗi kết nối!');
        }
    };

    const handleCreateInbound = () => {
        if (selectedIds.length !== 1) return alert('Vui lòng chọn duy nhất một nhà cung cấp để lập phiếu nhập!');
        onCreateInbound?.({
            kind: 'inbound',
            source: 'supplier',
            supplier: selectedItems[0],
            products: []
        });
    };

    const handleExportExcel = async () => {
        const source = selectedItems.length > 0 ? selectedItems : filtered;
        if (!source.length) return alert('Không có dữ liệu để xuất!');

        const sheetData = source.map((row, idx) => ({
            "STT": idx + 1,
            "Mã NCC": row.supplierCode,
            "Tên nhà cung cấp": row.name,
            "Số điện thoại": row.phone,
            "Email": row.email || "—",
            "Địa chỉ": row.address,
            "Số lượng đã nhập": row.totalImportQuantity || 0
        }));

        const ws = XLSX.utils.json_to_sheet(sheetData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "NhaCungCap");
        
        await performExport(wb, null, sheetData);
        closeExportModal();
    };

    const toolbarActions = [
        { label: 'Thêm',       iconSrc: addIcon,    onClick: handleAdd },
        { label: 'Chỉnh sửa',  iconSrc: fixIcon,    onClick: handleEdit },
        { label: 'Xóa',        iconSrc: deleteIcon, onClick: handleDelete },
        { label: 'Phiếu nhập', iconSrc: inboundIcon, onClick: handleCreateInbound },
        { label: 'Nhập Excel', iconSrc: excelIcon,  onClick: () => {} },
        { label: 'Xuất Excel', iconSrc: excel1Icon, onClick: () => openExportModal() },
    ];

    return (
        <div className="p-4 md:p-8 bg-[#f8f9fa] h-full flex flex-col no-scrollbar">
            <h1 className="text-xl md:text-2xl font-black text-gray-800 mb-4 md:mb-6 uppercase tracking-tight">Quản lý nhà cung cấp</h1>
            
            {/* Toolbar: Action Buttons */}
            <div className="sticky top-0 z-20 flex items-center justify-between bg-white p-4 md:p-5 rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 mb-4 md:mb-6">
                <div className="flex gap-4 md:gap-8 overflow-x-auto no-scrollbar pb-1 w-full lg:w-auto">
                    {toolbarActions.map((action, i) => (
                        <button key={i} onClick={action.onClick}
                            className="flex flex-col items-center gap-1 group bg-transparent border-none cursor-pointer transition-transform active:scale-90 shrink-0">
                            <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl group-hover:bg-gray-100 transition duration-200">
                                <img src={action.iconSrc} alt={action.label} className="w-7 h-7 md:w-9 md:h-9 object-contain" />
                            </div>
                            <span className="text-[8px] md:text-[10px] font-bold text-[#00529c] uppercase tracking-tighter group-hover:text-[#1192a8] transition text-center whitespace-nowrap">{action.label}</span>
                        </button>
                    ))}
                </div>
                <div className="text-xs font-black text-gray-300 uppercase tracking-widest hidden lg:block ml-4">Danh mục nhà cung cấp</div>
            </div>

            {/* Filter Bar: Moved below toolbar for mobile */}
            <div className="bg-white p-4 md:p-5 rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-4 mb-4 md:mb-6">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <select value={searchBy} onChange={e => setSearchBy(e.target.value)}
                        className="wms-select w-full sm:w-48 !text-sm !py-2.5 md:!py-3 bg-white">
                        <option value="all">Tất cả kiểu tìm</option>
                        <option value="name">Tên nhà cung cấp</option>
                        <option value="code">Theo mã NCC</option>
                        <option value="phone">Theo SĐT</option>
                        <option value="address">Theo địa chỉ</option>
                    </select>
                    <div className="relative flex-1">
                        <input type="text" value={search} onChange={e => handleSearchChange(e.target.value)}
                            className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 md:py-3 text-sm outline-none focus:border-[#1192a8] transition-all bg-white"
                            placeholder="Nhập nội dung tìm kiếm nhà cung cấp..." />
                    </div>
                    <button onClick={() => { setSearch(''); fetchData(''); clearSelection(); }}
                        className="bg-[#1192a8] text-white px-6 py-2.5 md:py-3 rounded-xl font-black text-sm hover:bg-teal-700 shadow-lg shadow-teal-500/20 transition-all active:scale-95 flex items-center justify-center gap-2">
                        <span className="text-lg leading-none">↻</span> Làm mới
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex-1 flex flex-col">
                <div className="overflow-x-auto no-scrollbar lg:scrollbar-thin flex-1">
                    <table className="w-full text-left border-collapse min-w-[800px] md:min-w-[1000px]">
                        <thead className="bg-gray-50/80 border-b sticky top-0 z-10 backdrop-blur-sm">
                            <tr className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                <th className="px-5 md:px-6 py-4 text-center w-16">STT</th>
                                <th className="px-5 md:px-6 py-4 w-40 text-center">Mã NCC</th>
                                <th className="px-5 md:px-6 py-4">Tên nhà cung cấp</th>
                                <th className="px-5 md:px-6 py-4 w-48">Số điện thoại</th>
                                <th className="px-5 md:px-6 py-4">Địa chỉ</th>
                                <th className="px-5 md:px-6 py-4 text-right">SL đã nhập</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan={6} className="px-6 py-20 text-center text-[#1192a8] font-bold animate-pulse uppercase text-xs tracking-widest">Đang kết nối cơ sở dữ liệu...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-20 text-center text-gray-400 italic font-medium">Không tìm thấy nhà cung cấp phù hợp.</td></tr>
                            ) : filtered.map((row, idx) => (
                                <tr key={row.id}
                                    onClick={(e) => handleRowClick(row, idx, e)}
                                    onDoubleClick={() => { setEditData(row); setModalOpen(true); }}
                                    className={`transition-colors cursor-pointer group ${selectedIds.includes(row.id) ? 'bg-cyan-50 border-l-4 border-l-[#1192a8]' : 'hover:bg-blue-50/50'}`}>
                                    <td className="px-5 md:px-6 py-4 text-sm text-center text-gray-300 font-bold">{idx + 1}</td>
                                    <td className="px-5 md:px-6 py-4 text-sm font-black text-gray-500 text-center uppercase tracking-tight">{row.supplierCode}</td>
                                    <td className="px-5 md:px-6 py-4 text-sm font-bold text-gray-800 group-hover:text-[#1192a8] transition-colors">{row.name}</td>
                                    <td className="px-5 md:px-6 py-4 text-sm text-gray-600 font-mono font-bold">{row.phone || '—'}</td>
                                    <td className="px-5 md:px-6 py-4 text-xs text-gray-400 italic max-w-xs truncate">{row.address || '—'}</td>
                                    <td className="px-5 md:px-6 py-4 text-right font-black text-[#1192a8]">
                                        {row.totalImportQuantity?.toLocaleString('vi-VN') || 0}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {selectedIds.length > 0 && (
                <div className="mt-4 flex justify-between items-center bg-[#1192a8]/5 px-4 py-2 rounded-xl border border-[#1192a8]/10 animate-in slide-in-from-bottom-2 duration-300">
                    <span className="text-[10px] md:text-xs text-gray-500 font-bold uppercase">Trình trạng: <span className="text-[#1192a8] font-black">{selectedIds.length} nhà cung cấp được chọn</span></span>
                    <span className="text-[9px] md:text-[10px] text-[#1192a8] font-black uppercase italic animate-pulse">Chạm 2 lần để sửa nhanh</span>
                </div>
            )}
            <SupplierModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSaved={() => fetchData(search)} editData={editData} />
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