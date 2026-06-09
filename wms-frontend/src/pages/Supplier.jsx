// ================================================================
// 2. Supplier.jsx — thay fetch → axiosClient
// ================================================================
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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
import { useWorkspaceRefresh } from '../hooks/useWorkspaceRefresh';
import * as XLSX from 'xlsx';
import { formatNumberByLanguage } from '../utils/formatters';

const BASE = '/api/suppliers';

export default function Supplier({ onCreateInbound }) {
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

    useWorkspaceRefresh(() => {
        fetchData(search);
    });

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
        if (selectedIds.length !== 1) return alert(t('pages.Supplier.errors.selectOneForEdit'));
        setEditData(selectedItems[0]);
        setModalOpen(true);
    };

    const handleDelete = async () => {
        if (selectedIds.length === 0) return alert(t('pages.Supplier.errors.selectAtLeastOne'));
        const names = selectedItems.map(i => i.name).join(', ');
        if (!window.confirm(t('pages.Supplier.confirmDelete', { names }))) return;

        try {
            for (const item of selectedItems) {
                await axiosClient.delete(`${BASE}/${item.id}`);
            }
            alert(t('pages.Supplier.success.delete'));
            clearSelection();
            fetchData(search);
        } catch {
            alert(t('pages.Supplier.errors.deleteError'));
        }
    };

    const handleCreateInbound = () => {
        if (selectedIds.length !== 1) return alert(t('pages.Supplier.errors.selectOneForInbound'));
        onCreateInbound?.({
            kind: 'inbound',
            source: 'supplier',
            supplier: selectedItems[0],
            products: []
        });
    };

    const handleExportExcel = async () => {
        const source = selectedItems.length > 0 ? selectedItems : filtered;
        if (!source.length) return alert(t('pages.Supplier.errors.noDataExport'));

        const sheetData = source.map((row, idx) => ({
            [t('pages.Supplier.excel.stt')]: idx + 1,
            [t('pages.Supplier.excel.code')]: row.supplierCode,
            [t('pages.Supplier.excel.name')]: row.name,
            [t('pages.Supplier.excel.phone')]: row.phone,
            [t('pages.Supplier.excel.email')]: row.email || "—",
            [t('pages.Supplier.excel.address')]: row.address,
            [t('pages.Supplier.excel.importedQuantity')]: row.totalImportQuantity || 0
        }));

        const ws = XLSX.utils.json_to_sheet(sheetData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "NhaCungCap");

        await performExport(wb, null, sheetData);
        closeExportModal();
    };

    const toolbarActions = [
        { label: t('pages.Supplier.actions.add'),       iconSrc: addIcon,    onClick: handleAdd },
        { label: t('pages.Supplier.actions.edit'),  iconSrc: fixIcon,    onClick: handleEdit },
        { label: t('pages.Supplier.actions.delete'),        iconSrc: deleteIcon, onClick: handleDelete },
        { label: t('pages.Supplier.actions.inbound'), iconSrc: inboundIcon, onClick: handleCreateInbound },
        { label: t('pages.Supplier.actions.importExcel'), iconSrc: excelIcon,  onClick: () => {} },
        { label: t('pages.Supplier.actions.exportExcel'), iconSrc: excel1Icon, onClick: () => openExportModal() },
    ];

    return (
        <div className="p-4 md:p-8 bg-[#f8f9fa] dark:bg-gray-900 h-full flex flex-col no-scrollbar transition-colors duration-300">
            <h1 className="text-xl md:text-2xl font-black text-gray-800 dark:text-gray-100 mb-4 md:mb-6 uppercase tracking-tight">{t('pages.Supplier.title')}</h1>
            
            {/* Toolbar: Action Buttons */}
            <div className="sticky top-0 z-20 flex items-center justify-between bg-white dark:bg-gray-800 p-4 md:p-5 rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 mb-4 md:mb-6 transition-colors duration-300">
                <div className="flex gap-4 md:gap-8 overflow-x-auto no-scrollbar pb-1 w-full lg:w-auto">
                    {toolbarActions.map((action, i) => (
                        <button key={i} onClick={action.onClick}
                                className="flex flex-col items-center gap-1 group bg-transparent border-none cursor-pointer transition-transform active:scale-90 shrink-0">
                            <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl group-hover:bg-gray-100 dark:group-hover:bg-gray-700 transition duration-200">
                                <img src={action.iconSrc} alt={action.label} className="w-8 h-8 object-contain dark:invert dark:hue-rotate-180 dark:opacity-90" />
                            </div>
                            <span className="text-[8px] md:text-[10px] font-bold text-[#00529c] dark:text-[#1192a8] uppercase tracking-tighter group-hover:text-[#1192a8] dark:group-hover:text-[#38bcd4] transition text-center whitespace-nowrap">
                                {action.label}
                            </span>
                        </button>
                    ))}
                </div>
                <div className="text-xs font-black text-gray-300 dark:text-gray-600 uppercase tracking-widest hidden lg:block ml-4">{t('pages.Supplier.category')}</div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white dark:bg-gray-800 p-4 md:p-5 rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col gap-4 mb-4 md:mb-6 transition-colors duration-300">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <select value={searchBy} onChange={e => setSearchBy(e.target.value)}
                        className="wms-select w-full sm:w-48 !text-sm !py-2.5 md:!py-3 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                        <option value="all">{t('pages.Supplier.searchAll')}</option>
                        <option value="name">{t('pages.Supplier.searchByName')}</option>
                        <option value="code">{t('pages.Supplier.searchByCode')}</option>
                        <option value="phone">{t('pages.Supplier.searchByPhone')}</option>
                        <option value="address">{t('pages.Supplier.searchByAddress')}</option>
                    </select>
                    <div className="relative flex-1">
                        <input type="text" value={search} onChange={e => handleSearchChange(e.target.value)}
                            className="w-full border-2 border-gray-100 dark:border-gray-600 rounded-xl px-4 py-2.5 md:py-3 text-sm outline-none focus:border-[#1192a8] bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 transition-all"
                            placeholder={t('pages.Supplier.searchPlaceholder')} />
                    </div>
                    <button onClick={() => { setSearch(''); fetchData(''); clearSelection(); }}
                        className="bg-[#1192a8] text-white px-6 py-2.5 md:py-3 rounded-xl font-black text-sm hover:bg-teal-700 shadow-lg shadow-teal-500/20 transition-all active:scale-95 flex items-center justify-center gap-2">
                        <span className="text-lg leading-none">↻</span> {t('pages.Supplier.refresh')}
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex-1 flex flex-col transition-colors duration-300">
                <div className="overflow-x-auto no-scrollbar lg:scrollbar-thin flex-1">
                    <table className="w-full text-left border-collapse min-w-[800px] md:min-w-[1000px]">
                        <thead className="bg-gray-50/80 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 sticky top-0 z-10 backdrop-blur-sm">
                            <tr className="text-[9px] md:text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                <th className="px-5 md:px-6 py-4 text-center w-16">{t('pages.Supplier.stt')}</th>
                                <th className="px-5 md:px-6 py-4 w-40 text-center">{t('pages.Supplier.code')}</th>
                                <th className="px-5 md:px-6 py-4">{t('pages.Supplier.name')}</th>
                                <th className="px-5 md:px-6 py-4 w-48">{t('pages.Supplier.phone')}</th>
                                <th className="px-5 md:px-6 py-4">{t('pages.Supplier.address')}</th>
                                <th className="px-5 md:px-6 py-4 text-right">{t('pages.Supplier.importedQuantity')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                            {loading ? (
                                <tr><td colSpan={6} className="px-6 py-20 text-center text-[#1192a8] font-bold animate-pulse uppercase text-xs tracking-widest">{t('pages.Supplier.loading')}</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-20 text-center text-gray-400 dark:text-gray-600 italic font-medium">{t('pages.Supplier.noData')}</td></tr>
                            ) : filtered.map((row, idx) => (
                                <tr key={row.id}
                                    onClick={(e) => handleRowClick(row, idx, e)}
                                    onDoubleClick={() => { setEditData(row); setModalOpen(true); }}
                                    className={`transition-colors cursor-pointer group
                                        ${selectedIds.includes(row.id)
                                    ? 'bg-cyan-50 dark:bg-[#1192a8]/15 border-l-4 border-l-[#1192a8]'
                                    : 'hover:bg-blue-50/50 dark:hover:bg-gray-700/30 border-l-4 border-l-transparent'
                                }`}>
                                    <td className="px-5 md:px-6 py-4 text-sm text-center text-gray-300 dark:text-gray-600 font-bold">{idx + 1}</td>
                                    <td className="px-5 md:px-6 py-4 text-sm font-black text-gray-500 dark:text-gray-400 text-center uppercase tracking-tight">{row.supplierCode}</td>
                                    <td className="px-5 md:px-6 py-4 text-sm font-bold text-gray-800 dark:text-gray-100 group-hover:text-[#1192a8] dark:group-hover:text-[#38bcd4] transition-colors">{row.name}</td>
                                    <td className="px-5 md:px-6 py-4 text-sm text-gray-600 dark:text-gray-400 font-mono font-bold">{row.phone || '—'}</td>
                                    <td className="px-5 md:px-6 py-4 text-xs text-gray-400 dark:text-gray-500 italic max-w-xs truncate">{row.address || '—'}</td>
                                    <td className="px-5 md:px-6 py-4 text-right font-black text-[#1192a8]">
                                        {formatNumberByLanguage(row.totalImportQuantity)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Selection hint */}
            {selectedIds.length > 0 && (
                <div className="mt-4 flex justify-between items-center bg-[#1192a8]/5 dark:bg-[#1192a8]/10 px-4 py-2 rounded-xl border border-[#1192a8]/10 dark:border-[#1192a8]/20 animate-in slide-in-from-bottom-2 duration-300">
                    <span className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-bold uppercase">{t('pages.Supplier.status')} <span className="text-[#1192a8] font-black">{t('pages.Supplier.selectedCount', { count: selectedIds.length })}</span></span>
                    <span className="text-[9px] md:text-[10px] text-[#1192a8] font-black uppercase italic animate-pulse">{t('pages.Supplier.doubleClickToEdit')}</span>
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
