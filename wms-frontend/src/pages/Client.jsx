// ================================================================
// 1. Client.jsx — thay fetch → axiosClient
// ================================================================
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import ClientModal from '../components/modals/ClientModal';
import ExportExcelModal from '../components/modals/ExportExcelModal';
import axiosClient from '../api/axiosClient';
import addIcon    from '../components/common/icons/add.png';
import fixIcon    from '../components/common/icons/fix.png';
import deleteIcon from '../components/common/icons/delete.png';
import outboundIcon from '../components/common/icons/outbound.png';
import excelIcon  from '../components/common/icons/excel.png';
import excel1Icon from '../components/common/icons/excel1.png';
import { useSelection } from '../hooks/useSelection';
import { useExcelExport } from '../hooks/useExcelExport';
import * as XLSX from 'xlsx';

const BASE = '/api/customers';

export default function Client({ onCreateOutbound }) {
    const { t } = useTranslation();
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

    const filtered = useMemo(() => {
        if (searchBy === 'all') return data;
        return data.filter(row => {
            const q = search.toLowerCase();
            if (searchBy === 'name')    return (row.name || '').toLowerCase().includes(q);
            if (searchBy === 'code')    return (row.customerCode || '').toLowerCase().includes(q);
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
    } = useExcelExport('danh_sach_khach_hang.xlsx');

    const handleAdd    = () => { setEditData(null); setModalOpen(true); };
    const handleEdit   = () => {
        if (selectedIds.length !== 1) return alert(t('pages.Client.alertSelectOneToEdit'));
        setEditData(selectedItems[0]); setModalOpen(true);
    };
    
    const handleDelete = async () => {
        if (selectedIds.length === 0) return alert(t('pages.Client.alertSelectAtLeastOneToDelete'));
        const names = selectedItems.map(i => i.name).join(', ');
        if (!window.confirm(t('pages.Client.confirmDelete', { names }))) return;
        try {
            for (const item of selectedItems) {
                await axiosClient.delete(`${BASE}/${item.id}`);
            }
            clearSelection();
            fetchData(search);
        } catch { 
            alert(t('pages.Client.alertDeleteFailed')); 
        }
    };

    const handleCreateOutbound = () => {
        if (selectedIds.length !== 1) return alert(t('pages.Client.alertSelectOneToCreateOutbound'));
        onCreateOutbound?.({
            kind: 'outbound',
            source: 'customer',
            customer: selectedItems[0],
            products: []
        });
    };

    const handleExportExcel = async () => {
        const source = selectedItems.length > 0 ? selectedItems : filtered;
        if (!source.length) return alert(t('pages.Client.alertNoDataToExport'));

        const sheetData = source.map((row, idx) => ({
            "STT": idx + 1,
            "Mã khách hàng": row.customerCode,
            "Tên khách hàng": row.name,
            "Số điện thoại": row.phone,
            "Email": row.email || "—",
            "Địa chỉ": row.address
        }));

        const ws = XLSX.utils.json_to_sheet(sheetData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "KhachHang");
        
        await performExport(wb, null, sheetData);
        closeExportModal();
    };

    // ── Toolbar actions ─────────────────────────────────────
    const toolbarActions = [
        { label: t('pages.Client.add'),       iconSrc: addIcon,    onClick: handleAdd },
        { label: t('pages.Client.edit'),  iconSrc: fixIcon,    onClick: handleEdit },
        { label: t('pages.Client.delete'),        iconSrc: deleteIcon, onClick: handleDelete },
        { label: t('pages.Client.outboundReceipt'), iconSrc: outboundIcon, onClick: handleCreateOutbound },
        { label: t('pages.Client.importExcel'), iconSrc: excelIcon,  onClick: () => {} },
        { label: t('pages.Client.exportExcel'), iconSrc: excel1Icon, onClick: () => openExportModal() },
    ];

    return (
        <div className="p-4 md:p-8 bg-[#f8f9fa] h-full flex flex-col no-scrollbar">
            <h1 className="text-xl md:text-2xl font-black text-gray-800 mb-4 md:mb-6 uppercase tracking-tight">{t('pages.Client.title')}</h1>
            
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
                <div className="text-xs font-black text-gray-300 uppercase tracking-widest hidden lg:block ml-4">{t("pages.Client.partnerCategory")}</div>
            </div>

            {/* Filter Bar: Moved below toolbar for mobile */}
            <div className="bg-white p-4 md:p-5 rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-4 mb-4 md:mb-6">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <select value={searchBy} onChange={e => setSearchBy(e.target.value)}
                        className="wms-select w-full sm:w-48 !text-sm !py-2.5 md:!py-3 bg-white">
                        <option value="all">{t('pages.Client.searchAll')}</option>
                        <option value="name">{t('pages.Client.searchByName')}</option>
                        <option value="code">{t('pages.Client.searchByCode')}</option>
                        <option value="phone">{t('pages.Client.searchByPhone')}</option>
                        <option value="address">{t('pages.Client.searchByAddress')}</option>
                    </select>
                    <div className="relative flex-1">
                        <input type="text" value={search} onChange={e => handleSearchChange(e.target.value)}
                            className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 md:py-3 text-sm outline-none focus:border-[#1192a8] transition-all bg-white"
                            placeholder={t('pages.Client.searchPlaceholder')} />
                    </div>
                    <button onClick={() => { setSearch(''); fetchData(''); clearSelection(); }}
                        className="bg-[#1192a8] text-white px-6 py-2.5 md:py-3 rounded-xl font-black text-sm hover:bg-teal-700 shadow-lg shadow-teal-500/20 transition-all active:scale-95 flex items-center justify-center gap-2">
                        <span className="text-lg leading-none">↻</span> {t("pages.Client.refresh")}
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex-1 flex flex-col">
                <div className="overflow-x-auto no-scrollbar lg:scrollbar-thin flex-1">
                    <table className="w-full text-left border-collapse min-w-[800px] md:min-w-[1000px]">
                        <thead className="bg-gray-50/80 border-b sticky top-0 z-10 backdrop-blur-sm">
                            <tr className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                <th className="px-5 md:px-6 py-4 text-center w-16">{t('pages.Client.no')}</th>
                                <th className="px-5 md:px-6 py-4 w-40">{t('pages.Client.customerCode')}</th>
                                <th className="px-5 md:px-6 py-4">{t('pages.Client.customerName')}</th>
                                <th className="px-5 md:px-6 py-4 w-48">{t('pages.Client.phoneNumber')}</th>
                                <th className="px-5 md:px-6 py-4">{t('pages.Client.contactAddress')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-20 text-center text-[#1192a8] font-bold animate-pulse uppercase text-xs tracking-widest">{t('pages.Client.loadingData')}</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-20 text-center text-gray-400 italic font-medium">{t('pages.Client.noCustomerFound')}</td></tr>
                            ) : filtered.map((row, idx) => (
                                <tr key={row.id}
                                    onClick={(e) => handleRowClick(row, idx, e)}
                                    onDoubleClick={() => { setEditData(row); setModalOpen(true); }}
                                    className={`transition-colors cursor-pointer group ${selectedIds.includes(row.id) ? 'bg-teal-50 border-l-4 border-l-[#1192a8]' : 'hover:bg-blue-50/50'}`}>
                                    <td className="px-5 md:px-6 py-4 text-sm text-center text-gray-300 font-bold">{idx + 1}</td>
                                    <td className="px-5 md:px-6 py-4 text-sm font-black text-[#1192a8] uppercase tracking-tight">{row.customerCode}</td>
                                    <td className="px-5 md:px-6 py-4 text-sm font-bold text-gray-800 group-hover:text-[#1192a8] transition-colors">{row.name}</td>
                                    <td className="px-5 md:px-6 py-4 text-sm text-gray-600 font-mono font-bold">{row.phone || '—'}</td>
                                    <td className="px-5 md:px-6 py-4 text-xs text-gray-400 italic max-w-xs truncate">{row.address || '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {selectedIds.length > 0 && (
                <div className="mt-4 flex justify-between items-center bg-[#1192a8]/5 px-4 py-2 rounded-xl border border-[#1192a8]/10 animate-in slide-in-from-bottom-2 duration-300">
                    <span className="text-[10px] md:text-xs text-gray-500 font-bold uppercase">
                        {t('pages.Client.status')}{' '}
                        <span className="text-[#1192a8] font-black">
                            {selectedIds.length} {t('pages.Client.customersSelected')}
                        </span>
                    </span>
                    <span className="text-[9px] md:text-[10px] text-[#1192a8] font-black uppercase italic animate-pulse">
                        {t('pages.Client.doubleClickToEdit')}
                    </span>
                </div>
            )}
            <ClientModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSaved={() => fetchData(search)} editData={editData} />
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