import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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

const createEmptyDetail = () => ({
    id: Math.random(),
    productId: '',
    productName: '',
    batchId: '',
    batchCode: '',
    locationId: '',
    binCode: '',
    unit: '-',
    quantity: 1,
    price: 0,
    total: 0
});


export default function ExportReceipts({ workflow, clearWorkflow }) {
    const { t } = useTranslation();
    const { user } = useAuth();
    const reactLocation = useLocation();

    const outboundStatusOptions = useMemo(() => [
        { value: 'DRAFT', label: t('pages.OutboundOrder.status.DRAFT'), color: 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600' },
        { value: 'ALLOCATED', label: t('pages.OutboundOrder.status.ALLOCATED'), color: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' },
        { value: 'PENDING', label: t('pages.OutboundOrder.status.PENDING'), color: 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800' },
        { value: 'COMPLETED', label: t('pages.OutboundOrder.status.COMPLETED'), color: 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' },
        { value: 'CANCELED', label: t('pages.OutboundOrder.status.CANCELED'), color: 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800' }
    ], [t]);
    const [exportData, setExportData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [contextMenu, setContextMenu] = useState(null);

    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [activeScanTarget, setActiveScanTarget] = useState('SEARCH');
    const [activeItemIndex, setActiveItemIndex] = useState(null);

    const [dialog, setDialog] = useState({ isOpen: false, title: '', message: '', variant: 'info' });
    const showMsg = (title, message, variant = 'info') => setDialog({ isOpen: true, title, message, variant });

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isViewDetailOpen, setIsViewDetailOpen] = useState(false);
    const [viewingVoucher, setViewingVoucher] = useState(null);

    const [isQCModalOpen, setIsQCModalOpen] = useState(false);
    const [pendingQCOrder, setPendingQCOrder] = useState(null);
    const [qcItems, setQCItems] = useState([]);

    const [details, setDetails] = useState([createEmptyDetail()]);
    const [formData, setFormData] = useState({
        voucherCode: '', voucherDate: '', customerId: '', staffId: '', note: ''
    });

    const [products, setProducts] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [staffs, setStaffs] = useState([]);

    const [searchKeyword, setSearchKeyword] = useState("");
    const [filterCustomer, setFilterCustomer] = useState("ALL");
    const [filterStaff, setFilterStaff] = useState("ALL");
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

    const roles = user?.roles || [];
    const allowedCreatorRoles = ['ADMIN', 'MANAGER', 'STOREKEEPER', 'WAREHOUSE_KEEPER', 'OUTBOUND_STAFF'];
    const canCreate = roles.some(r => allowedCreatorRoles.includes(r));

    useEffect(() => {
        const params = new URLSearchParams(reactLocation.search);
        const searchCode = params.get('search');
        if (searchCode) { setSearchKeyword(searchCode); }
    }, [reactLocation.search]);

    const handleScanSuccess = async (decodedText) => {
        setIsScannerOpen(false);
        const code = decodedText.trim();
        if (activeScanTarget === 'SEARCH') {
            setSearchKeyword(code);
        } else if (activeScanTarget === 'ITEM' && activeItemIndex !== null) {
            try {
                const res = await axiosClient.get(`/api/products/search?keyword=${code}`);
                if (res.data && res.data.length > 0) {
                    const prod = res.data[0];
                    const updated = [...details];
                    updated[activeItemIndex] = { ...updated[activeItemIndex], productId: prod.id, productName: prod.name, unit: prod.baseUnit || '-', price: prod.price || 0, total: Number(updated[activeItemIndex].quantity) * Number(prod.price || 0) };
                    setDetails(updated);
                }
            } catch (error) { console.error("Lỗi quét mã:", error); }
        }
    };

    const filteredStaffs = useMemo(() => staffs.filter(s => s.roles?.some(r => allowedCreatorRoles.includes(r))), [staffs]);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await axiosClient.get("/api/outbound-orders");
            setExportData(Array.isArray(res.data) ? res.data : []);
        } catch (error) { console.error("Lỗi API Phiếu xuất:", error); setExportData([]); }
        axiosClient.get("/api/products/details").then(r => setProducts(r.data)).catch(() => {});
        axiosClient.get("/api/customers").then(r => setCustomers(r.data)).catch(() => {});
        axiosClient.get("/api/staff/names").then(r => setStaffs(r.data)).catch(() => {});
        setIsLoading(false);
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const getCustName = (id) => customers.find(c => c.id === id)?.name || t('pages.OutboundOrder.partnerPlaceholder', { id });
    const getStfName = (id) => staffs.find(s => s.id === id)?.fullName || t('pages.OutboundOrder.staffPlaceholder', { id });

    const filteredData = useMemo(() => {
        let result = (exportData || []).filter(item => {
            const kw = searchKeyword.toLowerCase().trim();
            const client = getCustName(item.customerId).toLowerCase();
            const code = (item.issueCode || "").toLowerCase();
            const matchesKw = !kw || (code.includes(kw) || client.includes(kw));
            const matchesCust = filterCustomer === "ALL" || String(item.customerId) === filterCustomer;
            const matchesStf = filterStaff === "ALL" || String(item.createdBy) === filterStaff;
            return matchesKw && matchesCust && matchesStf;
        });
        if (sortConfig.key) {
            result.sort((a, b) => {
                let vA = a[sortConfig.key]; let vB = b[sortConfig.key];
                if (sortConfig.key === 'customerName') { vA = getCustName(a.customerId); vB = getCustName(b.customerId); }
                if (vA < vB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (vA > vB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return result;
    }, [exportData, searchKeyword, filterCustomer, filterStaff, customers, staffs, sortConfig]);

    const { selectedIds, handleRowClick, clearSelection, selectedItems } = useSelection(filteredData, (item) => {
        setViewingVoucher(item);
        setIsViewDetailOpen(true);
    });
    const { isExportModalOpen, exportFileName, setExportFileName, openExportModal, closeExportModal, performExport, detectBestExportMode } = useExcelExport('danh_sach_phieu_xuat.xlsx');

    useEffect(() => {
        if (workflow && workflow.kind === 'outbound') {
            if (!canCreate) { showMsg(t('pages.OutboundOrder.dialog.denied'), t('pages.OutboundOrder.dialog.noPermissionCreate'), "info"); clearWorkflow(); return; }
            const now = new Date(); const dateStr = now.toISOString().split('T')[0];
            setFormData({ voucherCode: `XK${dateStr.replace(/-/g, '')}${now.getSeconds()}`, voucherDate: dateStr, customerId: workflow.customerId || '', staffId: '', note: '' });
            if (workflow.products && workflow.products.length > 0) {
                const seed = workflow.products.map(p => ({ id: Math.random(), productId: p.id, productName: p.name, unit: p.baseUnit || '-', quantity: 1, price: p.price || 0, total: p.price || 0, batchId: '', batchCode: '', locationId: '', binCode: '' }));
                setDetails(seed);
            } else { setDetails([createEmptyDetail()]); }
            setIsCreateOpen(true);
            setTimeout(() => clearWorkflow(), 0);
        }
    }, [workflow, clearWorkflow, products, canCreate]);

    const handleUpdateStatus = async (id, nextStatus) => {
        const order = exportData.find(o => o.id === id);
        if (nextStatus === 'COMPLETED') {
            const canApprove = roles.some(r => ['ADMIN', 'MANAGER', 'QUALITY_CONTROL'].includes(r));
            if (!canApprove) {
                showMsg(t('pages.OutboundOrder.dialog.denied'), t('pages.OutboundOrder.dialog.noPermissionApprove'), "info");
                return;
            }
            try {
                const res = await axiosClient.get(`/api/outbound-orders/${id}/details`);
                setPendingQCOrder(order);
                setQCItems(res.data.map(it => ({ ...it, quantityReceived: it.quantity })));
                setIsQCModalOpen(true);
                return;
            } catch (error) {
                showMsg(t('pages.OutboundOrder.dialog.error'), t('pages.OutboundOrder.dialog.cannotLoadDetails'), "info");
                return;
            }
        }
        try { await axiosClient.put(`/api/outbound-orders/${id}/status`, { status: nextStatus }); fetchData(); }
        catch (error) { showMsg(t('pages.OutboundOrder.dialog.error'), t('pages.OutboundOrder.dialog.updateError', { message: error.response?.data?.message || error.message }), "info"); }
    };

    const handleConfirmQCResult = async (inspectionData) => {
        try {
            await axiosClient.post(`/api/outbound-orders/${pendingQCOrder.id}/qc`);
            setIsQCModalOpen(false); setPendingQCOrder(null); fetchData();
            showMsg(t('pages.OutboundOrder.dialog.success'), t('pages.OutboundOrder.dialog.qcSuccess'), "info");
        } catch (error) {
            showMsg(t('pages.OutboundOrder.dialog.error'), t('pages.OutboundOrder.dialog.qcError', { message: error.response?.data || error.message }), "info");
        }
    };

    const handleOpenCreate = (seed = []) => {
        const now = new Date(); const dateStr = now.toISOString().split('T')[0];
        setFormData({ voucherCode: `XK${dateStr.replace(/-/g, '')}${Date.now().toString().slice(-6)}`, voucherDate: dateStr, customerId: '', staffId: '', note: '' });
        setDetails(seed.length > 0 ? seed : [createEmptyDetail()]); setIsCreateOpen(true);
    };

    const handleFEFOSuggestion = async (index) => {
        const item = details[index];
        if (!item.productId || !item.quantity) return showMsg(t('pages.OutboundOrder.dialog.missingInfo'), t('pages.OutboundOrder.dialog.selectProductQty'), "info");
        try {
            const res = await axiosClient.get(`/api/inventory/suggest-fefo?productId=${item.productId}&quantity=${item.quantity}`);
            const suggestions = res.data;
            if (!suggestions || suggestions.length === 0) { showMsg(t('pages.OutboundOrder.dialog.outOfStock'), t('pages.OutboundOrder.dialog.noInventoryAvailable'), "info"); return; }
            const newDetails = [...details]; const baseItem = { ...item };
            const suggestedRows = suggestions.map(s => ({ id: Math.random(), productId: baseItem.productId, productName: baseItem.productName, unit: baseItem.unit, price: baseItem.price, batchId: s.batchId, batchCode: s.batchCode, locationId: s.locationId, binCode: s.binCode, quantity: s.suggestedQuantity, total: Number(s.suggestedQuantity) * Number(baseItem.price) }));
            newDetails.splice(index, 1, ...suggestedRows); setDetails(newDetails);
            if (suggestions.reduce((sum, s) => sum + s.suggestedQuantity, 0) < item.quantity) { showMsg(t('pages.OutboundOrder.dialog.warning'), t('pages.OutboundOrder.dialog.lowStock'), "info"); }
        } catch (error) { showMsg(t('pages.OutboundOrder.dialog.error'), t('pages.OutboundOrder.dialog.fefoError', { message: error.message }), "info"); }
    };

    const handleConfirmQC = async (id) => {
        try {
            await axiosClient.post(`/api/outbound-orders/${id}/qc`);
            setIsViewDetailOpen(false);
            fetchData();
            showMsg(t('pages.OutboundOrder.dialog.success'), t('pages.OutboundOrder.dialog.qcSuccess'), "info");
        } catch (error) {
            showMsg(t('pages.OutboundOrder.dialog.error'), t('pages.OutboundOrder.dialog.qcError', { message: error.response?.data || error.message }), "info");
        }
    };

    const handleSave = async () => {
        if (!formData.customerId) return showMsg(t('pages.OutboundOrder.dialog.missingInfo'), t('pages.OutboundOrder.dialog.selectCustomer'), "info");
        const valid = details.filter(d => d.productId && d.batchId && d.locationId);
        if (valid.length === 0) return showMsg(t('pages.OutboundOrder.dialog.missingInfo'), t('pages.OutboundOrder.dialog.selectProductFefo'), "info");
        const payload = {
            issueCode: formData.voucherCode, issueDate: `${formData.voucherDate}T12:00:00`, customerId: parseInt(formData.customerId), createdBy: parseInt(formData.staffId || user?.id || 1), status: 'DRAFT', note: formData.note, totalAmount: valid.reduce((s, d) => s + d.total, 0),
            items: valid.map(d => ({ productId: parseInt(d.productId), quantity: parseFloat(d.quantity), unitPrice: parseFloat(d.price), batchId: parseInt(d.batchId), locationId: parseInt(d.locationId) }))
        };
        try { await axiosClient.post("/api/outbound-orders", payload); setIsCreateOpen(false); fetchData(); showMsg(t('pages.OutboundOrder.dialog.success'), t('pages.OutboundOrder.dialog.saveSuccess'), "info"); }
        catch (error) { showMsg(t('pages.OutboundOrder.dialog.error'), t('pages.OutboundOrder.dialog.saveError', { message: error.message }), "info"); }
    };

    const handleExportExcel = async (mode) => {
        const source = mode === 'selected' ? selectedItems : filteredData;
        if (!source.length) return showMsg(t('pages.OutboundOrder.dialog.error'), t('pages.OutboundOrder.dialog.noData'), "info");
        const sheetData = source.map((row, idx) => ({
            [t('pages.OutboundOrder.excel.stt')]: idx + 1,
            [t('pages.OutboundOrder.excel.voucherCode')]: row.issueCode,
            [t('pages.OutboundOrder.excel.createdDate')]: row.createdAt ? new Date(row.createdAt).toLocaleString('vi-VN') : '---',
            [t('pages.OutboundOrder.excel.customer')]: getCustName(row.customerId),
            [t('pages.OutboundOrder.excel.totalAmount')]: row.totalAmount,
            [t('pages.OutboundOrder.excel.status')]: outboundStatusOptions.find(o => o.value === row.status)?.label || row.status,
            [t('pages.OutboundOrder.excel.creator')]: getStfName(row.createdBy)
        }));
        const ws = XLSX.utils.json_to_sheet(sheetData); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, t('pages.OutboundOrder.excel.sheetName'));
        await performExport(wb, null, sheetData); closeExportModal();
    };

    const toolbarActions = useMemo(() => [
        ...(canCreate ? [{ label: t('pages.OutboundOrder.toolbar.addNew'), iconSrc: addIcon, onClick: () => handleOpenCreate() }] : []),
        { label: t('pages.OutboundOrder.toolbar.scan'), iconSrc: scanIcon, onClick: () => { setActiveScanTarget('SEARCH'); setIsScannerOpen(true); } },
        { label: t('pages.OutboundOrder.toolbar.detail'), iconSrc: infoIcon, onClick: () => { if (selectedIds.length !== 1) return showMsg(t('pages.OutboundOrder.dialog.required'), t('pages.OutboundOrder.dialog.selectOneReceipt'), "info"); setViewingVoucher(selectedItems[0]); setIsViewDetailOpen(true); }},
        { label: t('pages.OutboundOrder.toolbar.excel'), iconSrc: excelIcon, onClick: () => {
            const bestMode = detectBestExportMode(selectedIds.length, filteredData.length);
            openExportModal(bestMode);
        }},
        { label: t('pages.OutboundOrder.toolbar.refresh'), iconSrc: excel1Icon, onClick: () => { fetchData(); clearSelection(); } }
    ], [canCreate, selectedIds, selectedItems, filteredData, detectBestExportMode, openExportModal, t]);

    const SortIcon = ({ col }) => { if (sortConfig.key !== col) return <span className="opacity-20 ml-1 italic">↕</span>; return <span className="ml-1 text-[#1192a8] font-black">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>; };
    const requestSort = (key) => { let direction = 'asc'; if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc'; setSortConfig({ key, direction }); };

    const handleContextMenu = (e, item) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, item });
    };

    const contextActions = useMemo(() => {
        if (!contextMenu?.item) return [];
        const item = contextMenu.item;
        return [
            { label: t('pages.OutboundOrder.contextMenu.detail'), onClick: () => { setViewingVoucher(item); setIsViewDetailOpen(true); } },
            { label: t('pages.OutboundOrder.contextMenu.duplicate'), onClick: () => {
                const seed = item.items?.map(it => {
                    const p = products.find(prod => prod.id === it.productId);
                    return { ...createEmptyDetail(), productId: it.productId, productName: p?.name || '', unit: p?.baseUnit || '-', quantity: it.quantity, price: it.unitPrice, total: it.quantity * it.unitPrice };
                }) || [];
                handleOpenCreate(seed);
            }},
            { label: t('pages.OutboundOrder.contextMenu.excel'), onClick: () => {
                const sheetData = [{
                    [t('pages.OutboundOrder.excel.voucherCode')]: item.issueCode,
                    [t('pages.OutboundOrder.excel.createdDate')]: new Date(item.createdAt).toLocaleString(),
                    [t('pages.OutboundOrder.excel.customer')]: getCustName(item.customerId),
                    [t('pages.OutboundOrder.excel.totalAmount')]: item.totalAmount,
                    [t('pages.OutboundOrder.excel.status')]: item.status
                }];
                const ws = XLSX.utils.json_to_sheet(sheetData); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, t('pages.OutboundOrder.excel.detailSheetName'));
                XLSX.writeFile(wb, `PhieuXuat_${item.issueCode}.xlsx`);
            }},
            ...( ['PENDING', 'ALLOCATED', 'DRAFT'].includes(item.status) ? [{ label: t('pages.OutboundOrder.contextMenu.approveQc'), onClick: () => handleConfirmQC(item.id), danger: true }] : [])
        ];
    }, [contextMenu, products, customers, t]);

    return (
        <div className="p-6 bg-[#f8f9fa] dark:bg-gray-900 min-h-full flex flex-col text-left font-sans transition-colors duration-300" onContextMenu={e => e.preventDefault()}>
            <SystemDialog isOpen={dialog.isOpen} title={dialog.title} message={dialog.message} variant={dialog.variant} onClose={() => setDialog({ ...dialog, isOpen: false })} />
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
                title={t('pages.OutboundOrder.contextMenu.title')}
                subtitle={contextMenu?.item?.issueCode}
                actions={contextActions}
                onClose={() => setContextMenu(null)}
            />
            <div className="sticky top-0 z-20 flex items-center justify-between bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm p-4 md:p-5 rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 mb-4 md:mb-6 transition-colors duration-300">
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1 w-full lg:w-auto">
                    {toolbarActions.map((a, i) => (<ActionButton key={i} {...a} />))}
                </div>
                <h1 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest hidden lg:block">{t('pages.OutboundOrder.title')}</h1>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 md:p-5 rounded-2xl md:rounded-3xl border border-gray-100 dark:border-gray-700 mb-4 md:mb-6 flex flex-col gap-4 shadow-sm transition-colors duration-300">
                <input type="text" value={searchKeyword} onChange={e => setSearchKeyword(e.target.value)} placeholder={t('pages.OutboundOrder.searchPlaceholder')} className="w-full border-2 border-gray-100 dark:border-gray-600 rounded-xl px-4 md:px-5 py-2.5 md:py-3 text-sm outline-none focus:border-[#1192a8] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all" />
                <div className="flex flex-wrap gap-x-6 gap-y-3 border-t border-gray-100 dark:border-gray-700 pt-4">
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] md:text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('pages.OutboundOrder.filter.customer')}</span>
                        <select value={filterCustomer} onChange={e => setFilterCustomer(e.target.value)} className="wms-select !py-1 md:!py-1.5 !text-[10px] md:!text-sm min-w-[120px] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                            <option value="ALL">{t('pages.OutboundOrder.filter.all')}</option>
                            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] md:text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('pages.OutboundOrder.filter.creator')}</span>
                        <select value={filterStaff} onChange={e => setFilterStaff(e.target.value)} className="wms-select !py-1 md:!py-1.5 !text-[10px] md:!text-sm min-w-[120px] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                            <option value="ALL">{t('pages.OutboundOrder.filter.all')}</option>
                            {staffs.map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm flex flex-col transition-colors duration-300">
                <div className="overflow-x-auto flex-1 no-scrollbar lg:scrollbar-thin">
                    <table className="w-full text-left min-w-[800px] md:min-w-[1000px]">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 text-[9px] md:text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase sticky top-0 z-10">
                            <tr>
                                <th className="p-4 md:p-5 w-16">#</th>
                                <th className="p-4 md:p-5 cursor-pointer hover:text-[#1192a8]" onClick={() => requestSort('issueCode')}>{t('pages.OutboundOrder.table.voucherCode')} <SortIcon col="issueCode" /></th>
                                <th className="p-4 md:p-5 cursor-pointer hover:text-[#1192a8]" onClick={() => requestSort('createdAt')}>{t('pages.OutboundOrder.table.createdTime')} <SortIcon col="createdAt" /></th>
                                <th className="p-4 md:p-5 cursor-pointer hover:text-[#1192a8]" onClick={() => requestSort('customerName')}>{t('pages.OutboundOrder.table.customer')} <SortIcon col="customerName" /></th>
                                <th className="p-4 md:p-5 text-right">{t('pages.OutboundOrder.table.totalAmount')}</th>
                                <th className="p-4 md:p-5 text-center w-32 md:w-56">{t('pages.OutboundOrder.table.status')}</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {isLoading ? (
                                <tr><td colSpan="6" className="py-20 text-center animate-pulse text-gray-400 dark:text-gray-500">{t('pages.OutboundOrder.table.loading')}</td></tr>
                            ) : filteredData.map((item, idx) => (
                                <tr key={item.id} 
                                    onClick={(e) => handleRowClick(item, idx, e)} 
                                    onDoubleClick={() => { setViewingVoucher(item); setIsViewDetailOpen(true); }} 
                                    onContextMenu={(e) => handleContextMenu(e, item)}
                                    className={`border-b border-gray-50 dark:border-gray-700/50 cursor-pointer transition-colors ${selectedIds.includes(item.id) ? 'bg-[#1192a8]/5 dark:bg-[#1192a8]/10' : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'}`}>
                                    <td className="p-4 md:p-5 text-gray-300 dark:text-gray-600 font-bold">{idx + 1}</td>
                                    <td className="p-4 md:p-5 font-black text-[#1192a8] uppercase truncate">{item.issueCode}</td>
                                    <td className="p-4 md:p-5 text-gray-500 dark:text-gray-400 font-bold">{item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : '---'}</td>
                                    <td className="p-4 md:p-5 font-bold text-gray-700 dark:text-gray-200">{getCustName(item.customerId)}</td>
                                    <td className="p-4 md:p-5 text-right font-black text-teal-700 dark:text-teal-400">{Number(item.totalAmount || 0).toLocaleString()}đ</td>
                                    <td className="p-4 md:p-5 text-center" onClick={e => e.stopPropagation()}>
                                        <select value={item.status} onChange={e => handleUpdateStatus(item.id, e.target.value)} className={`!py-1 !px-2 !text-[9px] md:!text-[10px] uppercase font-black rounded-lg border-2 ${outboundStatusOptions.find(o => o.value === item.status)?.color || ''}`}>
                                            {outboundStatusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal: View Detail */}
            {isViewDetailOpen && viewingVoucher && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[110] flex justify-center items-center p-2 md:p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[95vh] md:max-h-[90vh] shadow-2xl transition-colors duration-300">
                        <div className="bg-[#1192a8] p-4 md:p-5 text-white flex justify-between items-center shrink-0">
                            <div>
                                <h2 className="font-bold uppercase tracking-widest text-xs md:text-sm">{t('pages.OutboundOrder.detailModal.receipt', { code: viewingVoucher.issueCode })}</h2>
                                <p className="text-[9px] md:text-[10px] font-bold opacity-80 uppercase italic">{t('pages.OutboundOrder.detailModal.creator', { name: getStfName(viewingVoucher.createdBy) })}</p>
                            </div>
                            <button onClick={() => setIsViewDetailOpen(false)} className="text-2xl md:text-3xl leading-none">&times;</button>
                        </div>
                        <div className="p-4 md:p-8 overflow-y-auto flex-1 space-y-6 md:space-y-8 bg-gray-50/30 dark:bg-gray-900/30">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-10 border-b border-gray-100 dark:border-gray-700 pb-6 md:pb-8">
                                <div><p className="text-[9px] md:text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase">{t('pages.OutboundOrder.detailModal.customer')}</p><p className="text-base md:text-lg font-black text-gray-800">{getCustName(viewingVoucher.customerId)}</p></div>
                                <div><p className="text-[9px] md:text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase">{t('pages.OutboundOrder.detailModal.createdTime')}</p><p className="text-base md:text-lg font-black text-gray-800">{viewingVoucher.createdAt ? new Date(viewingVoucher.createdAt).toLocaleString('vi-VN') : '---'}</p></div>
                            </div>
                            <div className="overflow-x-auto no-scrollbar">
                                <table className="w-full text-xs md:text-sm text-left min-w-[500px]">
                                    <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-400 dark:text-gray-500 text-[9px] md:text-[10px] uppercase font-bold">
                                        <tr>
                                            <th className="p-3">{t('pages.OutboundOrder.detailModal.product')}</th>
                                            <th className="p-3 text-center">{t('pages.OutboundOrder.detailModal.quantity')}</th>
                                            <th className="p-3 text-right">{t('pages.OutboundOrder.detailModal.unitPrice')}</th>
                                            <th className="p-3 text-right">{t('pages.OutboundOrder.detailModal.total')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {viewingVoucher.items?.map((row, i) => { 
                                            const p = products.find(prod => prod.id === row.productId); 
                                            return (
                                                <tr key={i}>
                                                    <td className="p-3 font-bold text-left text-gray-800 dark:text-gray-200"><p>{p?.name || t('pages.OutboundOrder.productPlaceholder', { id: row.productId })}</p></td>
                                                    <td className="p-3 text-center font-black text-gray-700 dark:text-gray-300">{row.quantity?.toLocaleString()}</td>
                                                    <td className="p-3 text-right text-gray-400 dark:text-gray-500">{Number(row.unitPrice || 0).toLocaleString()}đ</td>
                                                    <td className="p-3 text-right font-black text-[#1192a8]">{(row.quantity * (row.unitPrice || 0)).toLocaleString()}đ</td>
                                                </tr>
                                            ); 
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="p-4 md:p-5 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 flex justify-between items-center shrink-0 transition-colors duration-300">
                            <div className="flex gap-2">
                                {['PENDING', 'ALLOCATED', 'DRAFT'].includes(viewingVoucher.status) && (
                                    <button 
                                        onClick={() => handleConfirmQC(viewingVoucher.id)}
                                        className="px-4 py-2 bg-rose-600 text-white rounded-xl font-bold uppercase text-[10px] shadow-lg shadow-rose-600/20 hover:scale-105 transition-all"
                                    >
                                        {t('pages.OutboundOrder.detailModal.approveQc')}
                                    </button>
                                )}
                            </div>
                            <div className="text-right font-black text-2xl md:text-3xl text-[#1192a8]">
                                {Number(viewingVoucher.totalAmount || 0).toLocaleString()}đ
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Create */}
            {isCreateOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100] flex justify-center items-center p-2 md:p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl w-full max-w-[98%] md:max-w-[95%] overflow-hidden flex flex-col max-h-[98vh] md:max-h-[95vh] shadow-2xl transition-colors duration-300">
                        <div className="bg-[#1192a8] p-4 md:p-5 text-white flex justify-between items-center shrink-0">
                            <h2 className="font-bold uppercase tracking-widest text-xs md:text-sm text-left">{t('pages.OutboundOrder.createModal.title')}</h2>
                            <button onClick={() => setIsCreateOpen(false)} className="text-2xl md:text-3xl leading-none">&times;</button>
                        </div>
                        <div className="p-4 md:p-8 overflow-y-auto flex-1 space-y-6 md:space-y-8 bg-gray-50/50 dark:bg-gray-900/30">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm text-left">
                                <div>
                                    <label className="text-[9px] md:text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase block mb-1">{t('pages.OutboundOrder.createModal.customer')} *</label>
                                    <select value={formData.customerId} onChange={e => setFormData({...formData, customerId: e.target.value})} className="wms-select w-full !py-2 !text-xs md:!text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                                        <option value="">{t('pages.OutboundOrder.createModal.selectPlaceholder')}</option>
                                        {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[9px] md:text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase block mb-1">{t('pages.OutboundOrder.createModal.creator')}</label>
                                    <select value={formData.staffId} onChange={e => setFormData({...formData, staffId: e.target.value})} className="wms-select !py-2 !w-full !text-xs md:!text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                                        <option value="">{t('pages.OutboundOrder.createModal.selectPlaceholder')}</option>
                                        {filteredStaffs.map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[9px] md:text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase block mb-1">{t('pages.OutboundOrder.createModal.voucherCode')}</label>
                                    <input type="text" value={formData.voucherCode} readOnly className="wms-select w-full !py-2 bg-gray-100 dark:bg-gray-700/50 opacity-70 !text-xs md:!text-sm dark:text-gray-400" />
                                </div>
                                <div>
                                    <label className="text-[9px] md:text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase block mb-1">{t('pages.OutboundOrder.createModal.createdDate')}</label>
                                    <input type="date" value={formData.voucherDate} onChange={e => setFormData({...formData, voucherDate: e.target.value})} className="wms-select w-full !py-2 !text-xs md:!text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200" />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-[10px] md:text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-left">{t('pages.OutboundOrder.createModal.productHeader')}</h3>
                                    <button onClick={() => setDetails([...details, createEmptyDetail()])} className="text-[9px] md:text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase hover:underline">{t('pages.OutboundOrder.createModal.addRow')}</button>
                                </div>
                                <div className="bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl border border-gray-100 dark:border-gray-700 overflow-x-auto no-scrollbar text-left">
                                    <table className="w-full text-[10px] md:text-xs text-left min-w-[1000px]">
                                        <thead>
                                        <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-400 dark:text-gray-500 font-bold uppercase">
                                            <th className="p-3">{t('pages.OutboundOrder.createModal.product')}</th>
                                            <th className="p-3">{t('pages.OutboundOrder.createModal.fefoSuggestion')}</th>
                                            <th className="p-3 text-center w-20 md:w-24">{t('pages.OutboundOrder.createModal.quantity')}</th>
                                            <th className="p-3 text-right w-28 md:w-32">{t('pages.OutboundOrder.createModal.price')}</th>
                                            <th className="p-3 w-10"></th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {details.map((row, i) => (
                                            <tr key={row.id} className="border-t border-gray-50 dark:border-gray-700 group">
                                                <td className="p-2">
                                                    <select value={row.productId} onChange={e => { const next = [...details]; next[i].productId = e.target.value; const p = products.find(it => String(it.id) === e.target.value); if(p){ next[i].productName = p.name; next[i].price = p.price || 0; } next[i].total = Number(next[i].quantity) * Number(next[i].price); setDetails(next); }} className="w-full border-none outline-none font-bold bg-transparent dark:text-gray-200 text-left">
                                                        <option value="">-- SP --</option>{products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                                    </select>
                                                </td>
                                                <td className="p-2 min-w-[200px]">
                                                    <div className="flex items-center gap-2">
                                                        {row.batchCode ? (
                                                            <div className="flex flex-col text-left">
                                                                <span className="font-black text-[#1192a8]">Lô: {row.batchCode}</span>
                                                                <span className="text-[9px] text-gray-400 dark:text-gray-500">Vị trí: {row.binCode}</span>
                                                            </div>
                                                        ) : (
                                                            <button onClick={() => handleFEFOSuggestion(i)} className="text-[9px] font-black text-rose-500 hover:text-rose-700 bg-rose-50 dark:bg-rose-900/20 px-2 py-1 rounded-lg border border-rose-100 dark:border-rose-800 animate-pulse">⚡ GỢI Ý FEFO</button>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-2">
                                                    <input type="number" value={row.quantity} onChange={e => { const next = [...details]; next[i].quantity = e.target.value; next[i].total = Number(e.target.value) * Number(next[i].price); setDetails(next); }} className="w-full text-center font-black text-teal-600 dark:text-teal-400 bg-transparent outline-none" />
                                                </td>
                                                <td className="p-2">
                                                    <input type="number" value={row.price} onChange={e => { const next = [...details]; next[i].price = e.target.value; next[i].total = Number(next[i].quantity) * Number(e.target.value); setDetails(next); }} className="w-full text-right font-bold bg-transparent outline-none dark:text-gray-300" />
                                                </td>
                                                <td className="p-2 text-right">
                                                    <div className="flex items-center gap-2 justify-end">
                                                        <button onClick={() => { setActiveScanTarget('ITEM'); setActiveItemIndex(i); setIsScannerOpen(true); }} className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-colors shrink-0">
                                                            <img src={scanIcon} className="w-4 h-4 object-contain opacity-60" alt="Scan" />
                                                        </button>
                                                        <button onClick={() => setDetails(details.filter((_, idx) => idx !== i))} className="text-red-300 dark:text-red-500 text-lg hover:text-red-500 dark:hover:text-red-400 transition-colors shrink-0 leading-none">&times;</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 md:p-6 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col sm:flex-row justify-between items-stretch sm:items-center shrink-0 gap-4 transition-colors duration-300">
                            <div className="text-left"><p className="text-[9px] md:text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase">{t('pages.OutboundOrder.createModal.totalValue')}</p><p className="text-xl md:text-2xl font-black text-[#1192a8]">{details.reduce((s, r) => s + r.total, 0).toLocaleString()}đ</p></div>
                            <div className="flex gap-4"><button onClick={() => setIsCreateOpen(false)} className="flex-1 sm:flex-none text-gray-400 dark:text-gray-500 font-bold uppercase text-[10px] md:text-xs hover:text-gray-600 dark:hover:text-gray-300">{t('pages.OutboundOrder.createModal.cancel')}</button><button onClick={handleSave} className="flex-1 sm:flex-none px-6 md:px-10 py-2.5 md:py-3 bg-[#1192a8] text-white rounded-xl md:rounded-2xl font-black uppercase text-[10px] md:text-xs shadow-lg shadow-[#1192a8]/20 transition-all hover:scale-105 active:scale-95">{t('pages.OutboundOrder.createModal.confirm')}</button></div>
                        </div>
                    </div>
                </div>
            )}

            {isQCModalOpen && (
                <QCInspectionModal isOpen={isQCModalOpen} onClose={() => { setIsQCModalOpen(false); setPendingQCOrder(null); }} items={qcItems} products={products} onConfirm={handleConfirmQCResult} />
            )}
        </div>
    );
}