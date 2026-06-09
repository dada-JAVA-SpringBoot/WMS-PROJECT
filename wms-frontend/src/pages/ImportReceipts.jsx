import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useWorkspaceRefresh } from '../hooks/useWorkspaceRefresh';
import * as XLSX from 'xlsx';
import { ActionButton } from '../components/common/SharedUI';
import VoucherContextMenu from '../components/modals/VoucherContextMenu';
import ExportExcelModal from '../components/modals/ExportExcelModal';
import QCInspectionModal from '../components/modals/QCInspectionModal';
import SystemDialog from '../components/modals/SystemDialog';
import ScannerModal from '../components/modals/ScannerModal';
import axiosClient from '../api/axiosClient';
import addIcon from '../components/common/icons/add.png';
import infoIcon from '../components/common/icons/info.png';
import excelIcon  from '../components/common/icons/excel.png';
import excel1Icon from '../components/common/icons/excel1.png';
import scanIcon from '../components/common/icons/scan.png';
import { useSelection } from '../hooks/useSelection';
import { useExcelExport } from '../hooks/useExcelExport';
import { useAuth } from '../context/AuthContext';
import { formatCurrencyExact, formatDateByLanguage, formatNumberByLanguage } from '../utils/formatters';

const createEmptyLineItem = () => ({
    productId: "", batchCode: "", expiryDate: "", locationId: "", qtyExpected: 1, qtyReceived: 1, price: 0, condition: "Bình thường", isNewBatch: false
});

export default function ImportReceiptsPage({ workflow, clearWorkflow }) {
    const { t } = useTranslation();
    const { user } = useAuth();
    const reactLocation = useLocation();

    const [receipts, setReceipts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const [detailItems, setDetailItems] = useState([]);
    const [contextMenu, setContextMenu] = useState(null);

    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [activeScanTarget, setActiveScanTarget] = useState('SEARCH');
    const [activeItemIndex, setActiveItemIndex] = useState(null);

    const [dialog, setDialog] = useState({ isOpen: false, title: '', message: '', variant: 'info', onConfirm: null });
    const showMsg = (title, message, variant = 'info', onConfirm = null) => setDialog({ isOpen: true, title, message, variant, onConfirm });

    const [isQCModalOpen, setIsQCModalOpen] = useState(false);
    const [pendingQCReceipt, setPendingQCReceipt] = useState(null);
    const [qcItems, setQCItems] = useState([]);

    const [filterKeyword, setFilterKeyword] = useState('');
    const [filterSupplier, setFilterSupplier] = useState('ALL');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);
    const [locations, setLocations] = useState([]);
    const [staffs, setStaffs] = useState([]);
    const [productBatches, setProductBatches] = useState({});

    const inboundStatusOptions = useMemo(() => ([
        { value: 'DRAFT', label: t('pages.ImportReceipts.status_draft'), color: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600' },
        { value: 'ORDERED', label: t('pages.ImportReceipts.status_ordered'), color: 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' },
        { value: 'IN_TRANSIT', label: t('pages.ImportReceipts.status_in_transit'), color: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800' },
        { value: 'PENDING', label: t('pages.ImportReceipts.status_pending'), color: 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800' },
        { value: 'COMPLETED', label: t('pages.ImportReceipts.status_completed'), color: 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' },
        { value: 'CANCELED', label: t('pages.ImportReceipts.status_canceled'), color: 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800' }
    ]), [t]);

    const [supplierId, setSupplierId] = useState("");
    const [createdById, setCreatedById] = useState("");
    const [referenceNumber, setReferenceNumber] = useState("");
    const [receiptStatus, setReceiptStatus] = useState("DRAFT");
    const [notes, setNotes] = useState("");
    const [newItems, setNewItems] = useState([createEmptyLineItem()]);

    const roles = user?.roles || [];
    const allowedCreatorRoles = ['ADMIN', 'MANAGER', 'STOREKEEPER', 'WAREHOUSE_KEEPER', 'INBOUND_STAFF'];
    const canCreate = roles.some(r => allowedCreatorRoles.includes(r));

    useEffect(() => {
        const params = new URLSearchParams(reactLocation.search);
        const searchCode = params.get('search');
        if (searchCode) {
            setFilterKeyword(searchCode);
        }
    }, [reactLocation.search]);

    const handleScanSuccess = async (decodedText) => {
        setIsScannerOpen(false);
        const code = decodedText.trim();
        if (activeScanTarget === 'SEARCH') {
            setFilterKeyword(code);
        } else if (activeScanTarget === 'ITEM' && activeItemIndex !== null) {
            try {
                const res = await axiosClient.get(`/api/products/search?keyword=${code}`);
                if (res.data && res.data.length > 0) {
                    const prod = res.data[0];
                    const updated = [...newItems];
                    updated[activeItemIndex] = { ...updated[activeItemIndex], productId: prod.id, price: prod.price || 0 };
                    setNewItems(updated);
                    fetchBatches(prod.id);
                }
            } catch (error) { console.error("Lỗi quét mã:", error); }
        }
    };

    const filteredStaffs = useMemo(() => staffs.filter(s => s.roles?.some(r => allowedCreatorRoles.includes(r))), [staffs]);

    const fetchReceipts = useCallback(async (reset = false) => {
        setLoading(true);
        const currentPage = reset ? 0 : page;
        try {
            const res = await axiosClient.get(`/api/inbound?page=${currentPage}&size=20`);
            const data = res.data;
            const newReceipts = data.content || [];
            if (reset) {
                setReceipts(newReceipts);
            } else {
                setReceipts(prev => [...prev, ...newReceipts]);
            }
            setHasMore(!data.last);
            if (!reset) setPage(prev => prev + 1);
        } catch (error) { console.error('Lỗi tải phiếu nhập:', error); }
        finally { setLoading(false); }
    }, [page]);

    const fetchMasterData = useCallback(async () => {
        try {
            const results = await Promise.allSettled([
                axiosClient.get('/api/suppliers'),
                axiosClient.get('/api/products'),
                axiosClient.get('/api/locations'),
                axiosClient.get('/api/staff/names')
            ]);
            if (results[0].status === 'fulfilled') setSuppliers(results[0].value.data);
            if (results[1].status === 'fulfilled') setProducts(results[1].value.data);
            if (results[2].status === 'fulfilled') setLocations(results[3].value.data); // Fixed index error in original? 0,1,2,3
            if (results[3].status === 'fulfilled') setStaffs(results[4].value.data); // Fixed index error in original? 0,1,2,3,4
        } catch (error) { console.error('Lỗi tải master data:', error); }
    }, []);

    // Re-correcting indexes based on results array
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [rRes, sRes, pRes, lRes, stRes] = await Promise.all([
                axiosClient.get('/api/inbound?page=0&size=20'),
                axiosClient.get('/api/suppliers'),
                axiosClient.get('/api/products'),
                axiosClient.get('/api/locations'),
                axiosClient.get('/api/staff/names')
            ]);
            setReceipts(rRes.data.content || []);
            setHasMore(!rRes.data.last);
            setPage(1);
            setSuppliers(sRes.data);
            setProducts(pRes.data);
            setLocations(lRes.data);
            setStaffs(stRes.data);
        } catch (error) { console.error('Lỗi tải dữ liệu:', error); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleLoadMore = () => {
        fetchReceipts(false);
    };

    const filteredReceipts = useMemo(() => {
        let result = receipts.filter(r => {
            const kw = filterKeyword.toLowerCase().trim();
            const sName = suppliers.find(s => s.id === r.supplierId)?.name || '';
            const matchesKw = !kw || ((r.receiptCode || '').toLowerCase().includes(kw) || sName.toLowerCase().includes(kw));
            const matchesSup = filterSupplier === 'ALL' || String(r.supplierId) === filterSupplier;
            const matchesSta = filterStatus === 'ALL' || r.status === filterStatus;
            return matchesKw && matchesSup && matchesSta;
        });
        if (sortConfig.key) {
            result.sort((a, b) => {
                let vA = a[sortConfig.key]; let vB = b[sortConfig.key];
                if (sortConfig.key === 'supplierName') {
                    vA = suppliers.find(s => s.id === a.supplierId)?.name || '';
                    vB = suppliers.find(s => s.id === b.supplierId)?.name || '';
                }
                if (vA < vB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (vA > vB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return result;
    }, [receipts, filterKeyword, filterSupplier, filterStatus, suppliers, sortConfig]);

    const { selectedIds, handleRowClick, clearSelection, selectedItems } = useSelection(filteredReceipts, (item) => {
        setSelectedReceipt(item);
        axiosClient.get(`/api/inbound/${item.id}/details`).then(res => {
            setDetailItems(res.data);
            setIsDetailModalOpen(true);
        });
    });
    const { isExportModalOpen, exportFileName, setExportFileName, openExportModal, closeExportModal, performExport, detectBestExportMode } = useExcelExport('danh_sach_phieu_nhap.xlsx');

    const fetchBatches = async (productId) => {
        if (!productId || productBatches[productId]) return;
        try {
            const res = await axiosClient.get(`/api/inbound/batches/${productId}`);
            setProductBatches(prev => ({ ...prev, [productId]: res.data }));
        } catch (error) { console.error("Lỗi lấy lô hàng:", error); }
    };

    useEffect(() => {
        if (workflow && workflow.kind === 'inbound') {
            if (!canCreate) { showMsg(t('pages.ImportReceipts.dialogAccessDenied'), t('pages.ImportReceipts.alertNoPermissionCreate'), "info"); clearWorkflow(); return; }
            setShowCreateModal(true);
            let items = [createEmptyLineItem()];
            if (workflow.products && workflow.products.length > 0) {
                items = workflow.products.map(p => { fetchBatches(p.id); return { ...createEmptyLineItem(), productId: p.id, price: p.price || 0, locationId: workflow.targetLocation?.id || "" }; });
            } else if (workflow.targetLocation) { items = [{ ...createEmptyLineItem(), locationId: workflow.targetLocation.id }]; }
            setNewItems(items);
            setTimeout(() => clearWorkflow(), 0);
        }
    }, [workflow, clearWorkflow, canCreate]);

    const getStaffName = (id) => staffs.find(s => s.id === id)?.fullName || `${t('pages.ImportReceipts.staffShort')} #${id}`;
    const requestSort = (key) => {
        let direction = 'asc'; if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key, direction });
    };

    const handleUpdateStatus = (id, nextStatus) => {
        const receipt = receipts.find(r => r.id === id);
        if (nextStatus === 'COMPLETED') {
            const canApprove = roles.some(r => ['ADMIN', 'MANAGER', 'STOREKEEPER', 'QUALITY_CONTROL'].includes(r));
            if (!canApprove) {
                showMsg(t('pages.ImportReceipts.dialogAccessDenied'), t('pages.ImportReceipts.alertNoPermissionComplete'), "info");
                return;
            }
        }

        const statusLabel = inboundStatusOptions.find(o => o.value === nextStatus)?.label || nextStatus;
        showMsg(
            t('pages.ImportReceipts.confirmUpdateStatusTitle'),
            t('pages.ImportReceipts.confirmUpdateStatusMsg', { code: receipt.receiptCode, status: statusLabel }),
            "confirm",
            () => executeUpdateStatus(id, nextStatus)
        );
    };

    const executeUpdateStatus = async (id, nextStatus) => {
        if (nextStatus === 'COMPLETED') {
            try {
                const res = await axiosClient.get(`/api/inbound/${id}/details`);
                const receipt = receipts.find(r => r.id === id);
                setPendingQCReceipt(receipt);
                setQCItems(res.data);
                setIsQCModalOpen(true);
                return;
            } catch (error) {
                showMsg(t('pages.ImportReceipts.dialogError'), t('pages.ImportReceipts.alertLoadDetailsQCError'), "info");
                return;
            }
        }
        try {
            await axiosClient.put(`/api/inbound/${id}/status`, { status: nextStatus });
            fetchData();
        } catch (error) {
            showMsg(t('pages.ImportReceipts.dialogError'), t('pages.ImportReceipts.alertUpdateStatusError'), "info");
        }
    };

    const handleConfirmQC = async (inspectionData) => {
        try {
            await axiosClient.put(`/api/inbound/${pendingQCReceipt.id}/status`, { status: 'COMPLETED', details: inspectionData });
            setIsQCModalOpen(false); setPendingQCReceipt(null); fetchData();
            showMsg(t('pages.ImportReceipts.dialogSuccess'), t('pages.ImportReceipts.alertQCSuccess'), "info");
        } catch (error) { showMsg(t('pages.ImportReceipts.dialogError'), t('pages.ImportReceipts.alertQCError') + (error.response?.data?.message || error.message), "info"); }
    };

    const handleSaveReceipt = async () => {
        if (!supplierId) return showMsg(t('pages.ImportReceipts.dialogMissingInfo'), t('pages.ImportReceipts.alertSelectSupplier'), "info");
        const validItems = newItems.filter(item => item.productId && item.batchCode && item.locationId);
        if (validItems.length === 0) return showMsg(t('pages.ImportReceipts.dialogMissingInfo'), t('pages.ImportReceipts.alertAtLeastOneItem'), "info");
        const payload = {
            supplierId: parseInt(supplierId), createdBy: parseInt(createdById || user?.id || 1),
            referenceNumber: referenceNumber, status: receiptStatus, notes: notes,
            totalAmount: validItems.reduce((sum, item) => sum + (item.qtyReceived * item.price), 0),
            items: validItems.map(item => ({
                productId: parseInt(item.productId), batchCode: item.batchCode, expiryDate: item.expiryDate,
                locationId: parseInt(item.locationId), quantityReceived: parseFloat(item.qtyReceived),
                quantityExpected: parseFloat(item.qtyReceived), unitPrice: parseFloat(item.price), itemCondition: item.condition
            }))
        };
        try {
            await axiosClient.post('/api/inbound', payload);
            showMsg(t('pages.ImportReceipts.dialogSuccess'), t('pages.ImportReceipts.alertCreateSuccess'), "info");
            setShowCreateModal(false); setNewItems([createEmptyLineItem()]);
            setSupplierId(""); setReferenceNumber(""); setNotes(""); fetchData();
        } catch (error) { showMsg(t('pages.ImportReceipts.dialogError'), t('pages.ImportReceipts.alertSaveError') + (error.response?.data?.message || error.message), "info"); }
    };

    const handleExportExcel = async (mode) => {
        const source = mode === 'selected' ? selectedItems : filteredReceipts;
        if (!source.length) return showMsg(t('pages.ImportReceipts.dialogError'), t('pages.ImportReceipts.alertNoDataToExport'), "info");
        const sheetData = source.map((row, idx) => ({
            "STT": idx + 1, "Mã phiếu": row.receiptCode, "Ngày tạo": formatDateByLanguage(row.createdAt),
            "Nhà cung cấp": suppliers.find(s => s.id === row.supplierId)?.name || '---', "Tổng tiền": row.totalAmount,
            "Trạng thái": t('pages.ImportReceipts.status_' + row.status.toLowerCase(), { defaultValue: row.status }), "Người lập": getStaffName(row.createdBy)
        }));
        const ws = XLSX.utils.json_to_sheet(sheetData); const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "PhieuNhap");
        await performExport(wb, null, sheetData); closeExportModal();
    };

    const toolbarActions = [
        ...(canCreate ? [{ label: t('pages.ImportReceipts.btnCreate'), iconSrc: addIcon, onClick: () => setShowCreateModal(true) }] : []),
        { label: t('pages.ImportReceipts.btnScan'), iconSrc: scanIcon, onClick: () => { setActiveScanTarget('SEARCH'); setIsScannerOpen(true); } },
        { label: t('pages.ImportReceipts.btnDetails'), iconSrc: infoIcon, onClick: () => {
            if (selectedIds.length !== 1) return showMsg(t('pages.ImportReceipts.dialogRequired'), t('pages.ImportReceipts.alertSelectOneForDetails'), "info");
            const r = selectedItems[0]; setSelectedReceipt(r); 
            axiosClient.get(`/api/inbound/${r.id}/details`).then(res => { setDetailItems(res.data); setIsDetailModalOpen(true); });
        }},
        { label: t('pages.ImportReceipts.btnExport'), iconSrc: excelIcon, onClick: () => {
            const bestMode = detectBestExportMode(selectedIds.length, filteredReceipts.length);
            openExportModal(bestMode);
        }},
        { label: t('pages.ImportReceipts.btnRefresh'), iconSrc: excel1Icon, onClick: () => { fetchData(); clearSelection(); } }
    ];

    const SortIcon = ({ col }) => {
        if (sortConfig.key !== col) return <span className="opacity-20 ml-1 italic">↕</span>;
        return <span className="ml-1 text-[#1192a8] font-black">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>;
    };

    const handleContextMenu = (e, item) => {
        e.preventDefault();
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            item: item
        });
    };

    const contextActions = useMemo(() => {
        if (!contextMenu?.item) return [];
        const item = contextMenu.item;
        return [
            { label: t('pages.ImportReceipts.ctxViewDetails'), onClick: () => {
                setSelectedReceipt(item);
                axiosClient.get(`/api/inbound/${item.id}/details`).then(res => {
                    setDetailItems(res.data);
                    setIsDetailModalOpen(true);
                });
            }},
            { label: t('pages.ImportReceipts.ctxExportExcelThis'), onClick: () => {
                const sheetData = [{ "Mã phiếu": item.receiptCode, "Ngày tạo": formatDateByLanguage(item.createdAt), "Nhà cung cấp": suppliers.find(s => s.id === item.supplierId)?.name, "Tổng tiền": item.totalAmount, "Trạng thái": item.status }];
                const ws = XLSX.utils.json_to_sheet(sheetData); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Detail");
                XLSX.writeFile(wb, `PhieuNhap_${item.receiptCode}.xlsx`);
            }},
            ...(item.status === 'PENDING' ? [{ label: t('pages.ImportReceipts.ctxApproveQC'), onClick: () => handleUpdateStatus(item.id, 'COMPLETED'), danger: true }] : [])
        ];
    }, [contextMenu, suppliers, t]);

    return (
        <div className="p-6 bg-[#f8f9fa] dark:bg-gray-900 min-h-full flex flex-col text-left font-sans transition-colors duration-300" onContextMenu={e => e.preventDefault()}>
            <SystemDialog 
                isOpen={dialog.isOpen} 
                title={dialog.title} 
                message={dialog.message} 
                variant={dialog.variant} 
                onConfirm={dialog.onConfirm}
                confirmLabel={t('common.confirm')}
                cancelLabel={t('common.cancel')}
                onClose={() => setDialog({ ...dialog, isOpen: false })} 
            />
            <ScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} onScanSuccess={handleScanSuccess} />
            <ExportExcelModal
                isOpen={isExportModalOpen}
                onClose={closeExportModal}
                onConfirm={handleExportExcel}
                fileName={exportFileName}
                setFileName={setExportFileName}
            />
            <VoucherContextMenu 
                isOpen={!!contextMenu} 
                x={contextMenu?.x} 
                y={contextMenu?.y} 
                title={t('pages.ImportReceipts.ctxMenuTitle')}
                subtitle={contextMenu?.item?.receiptCode}
                actions={contextActions}
                onClose={() => setContextMenu(null)}
            />

            <div className="sticky top-0 z-20 flex items-center justify-between bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm p-4 md:p-5 rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 mb-4 md:mb-6 transition-colors duration-300">
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1 w-full lg:w-auto">
                    {toolbarActions.map((a, i) => <ActionButton key={i} {...a} />)}
                </div>
                <div className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest hidden lg:block">{t('pages.ImportReceipts.headerSubtitle')}</div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 md:p-5 rounded-2xl md:rounded-3xl border border-gray-100 dark:border-gray-700 mb-4 md:mb-6 flex flex-col gap-4 shadow-sm transition-colors duration-300">
                <input type="text" value={filterKeyword} onChange={e => setFilterKeyword(e.target.value)} placeholder={t('pages.ImportReceipts.searchPlaceholder')} className="w-full border-2 border-gray-100 dark:border-gray-600 rounded-xl px-4 md:px-5 py-2.5 md:py-3 text-sm outline-none focus:border-[#1192a8] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all" />
                <div className="flex flex-wrap gap-x-6 gap-y-3 border-t border-gray-100 dark:border-gray-700 pt-4">
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] md:text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('pages.ImportReceipts.filterSupplierLabel')}</span>
                        <select value={filterSupplier} onChange={e => setFilterSupplier(e.target.value)} className="wms-select !py-1 md:!py-1.5 !text-[10px] md:!text-sm min-w-[120px] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                            <option value="ALL">{t('pages.ImportReceipts.optionAll')}</option>
                            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] md:text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('pages.ImportReceipts.filterStatusLabel')}</span>
                        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="wms-select !py-1 md:!py-1.5 !text-[10px] md:!text-sm min-w-[120px] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                            <option value="ALL">{t('pages.ImportReceipts.optionAll')}</option>
                            {inboundStatusOptions.map(o => <option key={o.value} value={o.value}>{t('pages.ImportReceipts.status_' + o.value.toLowerCase())}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm flex flex-col transition-colors duration-300">
                <div className="overflow-x-auto flex-1 no-scrollbar lg:scrollbar-thin">
                    <table className="w-full text-left min-w-[800px] md:min-w-[1000px]">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 text-[9px] md:text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase sticky top-0 z-10">
                            <tr>
                                <th className="p-4 md:p-5 w-16">#</th>
                                <th className="p-4 md:p-5 cursor-pointer hover:text-[#1192a8]" onClick={() => requestSort('receiptCode')}>{t('pages.ImportReceipts.colReceiptCode')} <SortIcon col="receiptCode" /></th>
                                <th className="p-4 md:p-5 cursor-pointer hover:text-[#1192a8]" onClick={() => requestSort('createdAt')}>{t('pages.ImportReceipts.colCreatedAt')} <SortIcon col="createdAt" /></th>
                                <th className="p-4 md:p-5 cursor-pointer hover:text-[#1192a8]" onClick={() => requestSort('supplierName')}>{t('pages.ImportReceipts.colSupplier')} <SortIcon col="supplierName" /></th>
                                <th className="p-4 md:p-5 text-right">{t('pages.ImportReceipts.colTotalAmount')}</th>
                                <th className="p-4 md:p-5 text-center w-32 md:w-48">{t('pages.ImportReceipts.colStatus')}</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-gray-50 dark:divide-gray-700/50">
                            {loading && receipts.length === 0 ? <tr><td colSpan="6" className="py-20 text-center animate-pulse text-gray-400 dark:text-gray-500">{t('pages.ImportReceipts.loadingText')}</td></tr> : filteredReceipts.map((item, idx) => (
                                <tr key={item.id} 
                                    onClick={(e) => handleRowClick(item, idx, e)} 
                                    onDoubleClick={() => { setSelectedReceipt(item); axiosClient.get(`/api/inbound/${item.id}/details`).then(res => { setDetailItems(res.data); setIsDetailModalOpen(true); }); }} 
                                    onContextMenu={(e) => handleContextMenu(e, item)}
                                    className={`cursor-pointer transition-colors ${selectedIds.includes(item.id) ? 'bg-[#1192a8]/5 dark:bg-[#1192a8]/10' : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'}`}>
                                    <td className="p-4 md:p-5 text-gray-300 dark:text-gray-600 font-bold">{idx + 1}</td>
                                    <td className="p-4 md:p-5 font-black text-[#1192a8] uppercase">{item.receiptCode}</td>
                                    <td className="p-4 md:p-5 text-gray-500 dark:text-gray-400 font-bold">{formatDateByLanguage(item.createdAt)}</td>
                                    <td className="p-4 md:p-5 font-bold text-gray-700 dark:text-gray-200">{suppliers.find(s => s.id === item.supplierId)?.name || '---'}</td>
                                    <td className="p-4 md:p-5 text-right font-black text-teal-700 dark:text-teal-400">{formatCurrencyExact(item.totalAmount)}</td>
                                    <td className="p-4 md:p-5 text-center" onClick={e => e.stopPropagation()}><select value={item.status} onChange={e => handleUpdateStatus(item.id, e.target.value)} className={`!py-1 !px-2 !text-[9px] md:!text-[10px] uppercase font-black rounded-lg border-2 ${inboundStatusOptions.find(o => o.value === item.status)?.color || ''}`}>{inboundStatusOptions.map(o => <option key={o.value} value={o.value}>{t('pages.ImportReceipts.status_' + o.value.toLowerCase())}</option>)}</select></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {hasMore && (
                    <div className="p-4 flex justify-center border-t dark:border-gray-700">
                        <button
                            onClick={handleLoadMore}
                            disabled={loading}
                            className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-8 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-gray-600 transition-all disabled:opacity-50"
                        >
                            {loading ? t('common.loading') : t('common.loadMore')}
                        </button>
                    </div>
                )}
            </div>

            {isDetailModalOpen && selectedReceipt && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[110] flex justify-center items-center p-2 md:p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[95vh] md:max-h-[90vh] shadow-2xl transition-colors duration-300">
                        <div className="bg-[#1192a8] p-4 md:p-5 text-white flex justify-between items-center shrink-0">
                            <div>
                                <h2 className="font-bold uppercase tracking-widest text-xs md:text-sm">{t('pages.ImportReceipts.detailModalTitle', { code: selectedReceipt.receiptCode })}</h2>
                                <p className="text-[9px] md:text-[10px] font-bold opacity-80 uppercase italic">{t('pages.ImportReceipts.detailModalCreatedBy', { name: getStaffName(selectedReceipt.createdBy) })}</p>
                            </div>
                            <button onClick={() => setIsDetailModalOpen(false)} className="text-2xl md:text-3xl leading-none">&times;</button>
                        </div>
                        <div className="p-4 md:p-8 overflow-y-auto flex-1 space-y-6 md:space-y-8 bg-gray-50/30 dark:bg-gray-900/30">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-10 border-b border-gray-100 dark:border-gray-700 pb-6 md:pb-8">
                                <div><p className="text-[9px] md:text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase">{t('pages.ImportReceipts.detailModalSupplier')}</p><p className="text-base md:text-lg font-black text-gray-800">{suppliers.find(s => s.id === selectedReceipt.supplierId)?.name}</p></div>
                                <div><p className="text-[9px] md:text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase">{t('pages.ImportReceipts.detailModalCreatedAt')}</p><p className="text-base md:text-lg font-black text-gray-800">{formatDateByLanguage(selectedReceipt.createdAt)}</p></div>
                            </div>
                            <div className="overflow-x-auto no-scrollbar">
                                <table className="w-full text-xs md:text-sm text-left min-w-[600px]">
                                    <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-400 dark:text-gray-500 text-[9px] md:text-[10px] uppercase font-bold">
                                        <tr>
                                            <th className="p-3">{t('pages.ImportReceipts.detailColProduct')}</th>
                                            <th className="p-3 text-center">{t('pages.ImportReceipts.detailColExpected')}</th>
                                            <th className="p-3 text-center">{t('pages.ImportReceipts.detailColReceived')}</th>
                                            <th className="p-3 text-center text-teal-600 dark:text-teal-400">{t('pages.ImportReceipts.detailColIntact')}</th>
                                            <th className="p-3 text-center text-rose-500 dark:text-rose-400">{t('pages.ImportReceipts.detailColDamaged')}</th>
                                            <th className="p-3 text-right">{t('pages.ImportReceipts.detailColUnitPrice')}</th>
                                            <th className="p-3 text-right">{t('pages.ImportReceipts.detailColSubtotal')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {detailItems.map((item, i) => {
                                        const p = products.find(prod => prod.id === item.productId);
                                        const qtyShow = item.quantityIntact != null ? item.quantityIntact : item.quantityReceived;
                                        return (
                                            <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                                                <td className="p-3"><p className="font-bold text-gray-800 dark:text-gray-200">{p?.name || `SP #${item.productId}`}</p></td>
                                                <td className="p-3 text-center text-gray-400 dark:text-gray-500">{formatNumberByLanguage(item.quantityExpected)}</td>
                                                <td className="p-3 text-center font-bold text-gray-800 dark:text-gray-300">{formatNumberByLanguage(item.quantityReceived)}</td>
                                                <td className="p-3 text-center font-black text-teal-600 bg-teal-50/20 dark:text-teal-400 dark:bg-teal-900/20">{formatNumberByLanguage(item.quantityIntact)}</td>
                                                <td className="p-3 text-center font-black text-rose-600 bg-rose-50/20 dark:text-rose-400 dark:bg-rose-900/20">{formatNumberByLanguage(item.quantityDamaged)}</td>
                                                <td className="p-3 text-right text-gray-400 dark:text-gray-500">{formatCurrencyExact(item.unitPrice)}</td>
                                                <td className="p-3 text-right font-black text-[#1192a8]">{formatCurrencyExact(qtyShow * item.unitPrice)}</td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="p-4 md:p-5 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-right font-black text-2xl md:text-3xl text-teal-700 dark:text-teal-400 transition-colors duration-300">{formatCurrencyExact(selectedReceipt.totalAmount)}</div>
                    </div>
                </div>
            )}

            {showCreateModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100] flex justify-center items-center p-2 md:p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl w-full max-w-[98%] md:max-w-[95%] overflow-hidden flex flex-col max-h-[98vh] md:max-h-[95vh] shadow-2xl transition-colors duration-300">
                        <div className="bg-[#1192a8] p-4 md:p-5 text-white flex justify-between items-center shrink-0">
                            <h2 className="font-bold uppercase tracking-widest text-xs md:text-sm text-left">{t('pages.ImportReceipts.createModalTitle')}</h2>
                            <button onClick={() => setShowCreateModal(false)} className="text-2xl md:text-3xl leading-none">&times;</button>
                        </div>
                        <div className="p-4 md:p-8 overflow-y-auto flex-1 space-y-6 md:space-y-8 bg-gray-50/50 dark:bg-gray-900/30">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm text-left">
                                <div><label className="text-[9px] md:text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase block mb-1 text-left">{t('pages.ImportReceipts.createLabelSupplier')}</label><select value={supplierId} onChange={e => setSupplierId(e.target.value)} className="wms-select w-full !py-2 !text-xs md:!text-sm"><option value="">{t('pages.ImportReceipts.selectPlaceholder')}</option>{suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                                <div><label className="text-[9px] md:text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase block mb-1 text-left">{t('pages.ImportReceipts.createLabelCreatedBy')}</label><select value={createdById} onChange={e => setCreatedById(e.target.value)} className="wms-select w-full !py-2 !text-xs md:!text-sm"><option value="">{t('pages.ImportReceipts.selectPlaceholder')}</option>{filteredStaffs.map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}</select></div>
                                <div><label className="text-[9px] md:text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase block mb-1 text-left">{t('pages.ImportReceipts.createLabelReference')}</label><input type="text" value={referenceNumber} onChange={e => setReferenceNumber(e.target.value)} className="wms-select w-full !py-2 border-2 !text-xs md:!text-sm" /></div>
                                <div><label className="text-[9px] md:text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase block mb-1 text-left">{t('pages.ImportReceipts.createLabelStatus')}</label><select value={receiptStatus} onChange={e => setReceiptStatus(e.target.value)} className="wms-select w-full !py-2 !text-xs md:!text-sm">{inboundStatusOptions.map(o => <option key={o.value} value={o.value}>{t('pages.ImportReceipts.status_' + o.value.toLowerCase())}</option>)}</select></div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center"><h3 className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest text-left">{t('pages.ImportReceipts.createSectionItems')}</h3><button onClick={() => setNewItems([...newItems, createEmptyLineItem()])} className="text-[9px] md:text-[10px] font-black text-[#1192a8] hover:underline uppercase">{t('pages.ImportReceipts.createBtnAddRow')}</button></div>
                                <div className="bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl border border-gray-100 dark:border-gray-700 overflow-x-auto no-scrollbar"><table className="w-full text-[10px] md:text-xs min-w-[1000px] text-left"><thead><tr className="bg-gray-50 text-gray-400 font-bold uppercase"><th className="p-3">{t('pages.ImportReceipts.detailColProduct')}</th><th className="p-3 w-40 md:w-48">{t('pages.ImportReceipts.createTableColBatch')}</th><th className="p-3">{t('pages.ImportReceipts.createTableColExpiry')}</th><th className="p-3">{t('pages.ImportReceipts.createTableColLocation')}</th><th className="p-3 text-center w-20 md:w-24">{t('pages.ImportReceipts.createTableColQty')}</th><th className="p-3 text-right w-28 md:w-32">{t('pages.ImportReceipts.createTableColPrice')}</th><th className="p-3"></th></tr></thead>
                                    <tbody>{newItems.map((item, i) => (
                                        <tr key={i} className="group">
                                            <td className="p-2"><select value={item.productId} onChange={e => { const next=[...newItems]; next[i].productId=e.target.value; next[i].batchCode = ""; next[i].expiryDate = ""; next[i].isNewBatch = false; setNewItems(next); fetchBatches(e.target.value); }} className="w-full border-none outline-none font-bold text-gray-800 bg-transparent text-left"><option value="">{t('pages.ImportReceipts.selectProductPlaceholder')}</option>{products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></td>
                                            <td className="p-2"><div className="flex items-center gap-1">{item.isNewBatch ? <input type="text" value={item.batchCode} onChange={e => { const next=[...newItems]; next[i].batchCode=e.target.value; setNewItems(next); }} placeholder={t('pages.ImportReceipts.inputNewBatchPlaceholder')} className="w-full border border-teal-200 rounded px-2 py-1 bg-teal-50/30 text-teal-800 font-bold" /> : <select value={item.batchCode} onChange={e => { const next=[...newItems]; next[i].batchCode=e.target.value; const b = productBatches[item.productId]?.find(it => it.batchCode === e.target.value); if(b) next[i].expiryDate = b.expiryDate ? b.expiryDate.split('T')[0] : ""; setNewItems(next); }} className="w-full border border-gray-100 rounded px-2 py-1 bg-gray-50/50"><option value="">{t('pages.ImportReceipts.selectBatchPlaceholder')}</option>{productBatches[item.productId]?.map(b => <option key={b.id} value={b.batchCode}>{b.batchCode}</option>)}</select>}<button onClick={() => { const next=[...newItems]; next[i].isNewBatch = !next[i].isNewBatch; next[i].batchCode=""; next[i].expiryDate=""; setNewItems(next); }} className={`w-7 h-7 md:w-8 md:h-8 shrink-0 rounded-lg flex items-center justify-center font-black transition-all ${item.isNewBatch ? 'bg-orange-100 text-orange-600' : 'bg-[#1192a8]/10 text-[#1192a8]'}`}>{item.isNewBatch ? "×" : "+"}</button></div></td>
                                            <td className="p-2"><input type="date" value={item.expiryDate} onChange={e => { const next=[...newItems]; next[i].expiryDate=e.target.value; setNewItems(next); }} readOnly={!item.isNewBatch && item.batchCode !== ""} className={`w-full border border-gray-100 rounded px-2 py-1 ${!item.isNewBatch && item.batchCode !== "" ? 'bg-gray-100 opacity-60' : 'bg-gray-50/50'}`} /></td>
                                            <td className="p-2"><select value={item.locationId} onChange={e => { const next=[...newItems]; next[i].locationId=e.target.value; setNewItems(next); }} className="w-full border-none outline-none font-medium bg-transparent"><option value="">{t('pages.ImportReceipts.selectLocationPlaceholder')}</option>{locations.map(loc => <option key={loc.id} value={loc.id}>{loc.binCode} ({loc.zone})</option>)}</select></td>
                                            <td className="p-2"><input type="number" value={item.qtyReceived} onChange={e => { const next=[...newItems]; next[i].qtyReceived=e.target.value; setNewItems(next); }} className="w-full border-none outline-none text-center font-black text-teal-600 bg-transparent" /></td>
                                            <td className="p-2"><input type="number" value={item.price} onChange={e => { const next=[...newItems]; next[i].price=e.target.value; setNewItems(next); }} className="w-full border-none outline-none text-right font-bold bg-transparent" /></td>
                                            <td className="p-2 text-right"><div className="flex items-center justify-end gap-2 md:gap-2"><button onClick={() => { setActiveScanTarget('ITEM'); setActiveItemIndex(i); setIsScannerOpen(true); }} className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-cyan-50 transition-colors shrink-0"><img src={scanIcon} className="w-4 h-4 object-contain opacity-60 dark:invert dark:hue-rotate-180 dark:opacity-90" alt="Scan" /></button><button onClick={() => setNewItems(newItems.filter((_, idx) => idx !== i))} className="text-red-300 text-lg hover:text-red-500 transition-colors shrink-0 leading-none">&times;</button></div></td>
                                        </tr>
                                    ))}</tbody>
                                </table></div>
                            </div>
                        </div>
                        <div className="p-4 md:p-6 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col sm:flex-row justify-between items-stretch sm:items-center shrink-0 gap-4 transition-colors duration-300">
                            <div className="text-left"><p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase">{t('pages.ImportReceipts.createLabelTotal')}</p><p className="text-xl md:text-2xl font-black text-[#1192a8]">{formatCurrencyExact(newItems.reduce((s, i) => s + (i.qtyReceived * i.price), 0))}</p></div>
                            <div className="flex gap-4"><button onClick={() => setShowCreateModal(false)} className="flex-1 sm:flex-none text-gray-400 font-bold uppercase text-[10px] md:text-xs hover:text-gray-600">{t('pages.ImportReceipts.createBtnCancel')}</button><button onClick={handleSaveReceipt} className="flex-1 sm:flex-none px-6 md:px-10 py-2.5 md:py-3 bg-[#1192a8] text-white rounded-xl md:rounded-2xl font-black uppercase text-[10px] md:text-xs shadow-xl shadow-[#1192a8]/20 transition-all hover:scale-105 active:scale-95">{t('pages.ImportReceipts.createBtnSubmit')}</button></div>
                        </div>
                    </div>
                </div>
            )}

            {isQCModalOpen && (
                <QCInspectionModal
                    isOpen={isQCModalOpen}
                    onClose={() => { setIsQCModalOpen(false); setPendingQCReceipt(null); }}
                    items={qcItems}
                    products={products}
                    onConfirm={handleConfirmQC}
                />
            )}
        </div>
    );
}
