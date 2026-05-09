// ================================================================
// 5. ImportReceipts.jsx — ĐƠN GIẢN HÓA & NÂNG CẤP TRUY VẾT & SẮP XẾP
// ================================================================
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { ActionButton } from '../components/common/SharedUI';
import VoucherContextMenu from '../components/modals/VoucherContextMenu';
import axiosClient from '../api/axiosClient';
import addIcon from '../components/common/icons/add.png';
import infoIcon from '../components/common/icons/info.png';
import excelIcon  from '../components/common/icons/excel.png';
import excel1Icon from '../components/common/icons/excel1.png';

const createEmptyLineItem = () => ({
    productId: "", batchId: "", locationId: "", qtyExpected: 1, qtyReceived: 1, price: 0, condition: "Bình thường"
});

const createEmptyBatchDraft = () => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    productId: "", batchCode: "", manufactureDate: "", expiryDate: ""
});

const inboundStatusOptions = [
    { value: 'DRAFT', label: 'Nháp', color: 'bg-gray-100 text-gray-600 border-gray-200' },
    { value: 'ORDERED', label: 'Đã đặt', color: 'bg-blue-50 text-blue-600 border-blue-100' },
    { value: 'IN_TRANSIT', label: 'Đang về', color: 'bg-amber-50 text-amber-600 border-amber-100' },
    { value: 'COMPLETED', label: 'Đã nhập', color: 'bg-green-50 text-green-700 border-green-100' },
    { value: 'CANCELED', label: 'Đã hủy', color: 'bg-red-50 text-red-600 border-red-100' }
];

export default function ImportReceiptsPage({ workflow, clearWorkflow }) {
    const [receipts, setReceipts] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const [selectedReceiptId, setSelectedReceiptId] = useState(null);
    const [detailItems, setDetailItems] = useState([]); 
    const [contextMenu, setContextMenu] = useState(null);
    
    // --- BỘ LỌC VÀ TÌM KIẾM ---
    const [filterKeyword, setFilterKeyword] = useState('');
    const [filterSupplier, setFilterSupplier] = useState('ALL');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);
    const [batches, setBatches] = useState([]);
    const [locations, setLocations] = useState([]);
    const [staffs, setStaffs] = useState([]);

    const [supplierId, setSupplierId] = useState("");
    const [createdById, setCreatedById] = useState("");
    const [referenceNumber, setReferenceNumber] = useState("");
    const [receiptStatus, setReceiptStatus] = useState("DRAFT");
    const [notes, setNotes] = useState("");
    const [newItems, setNewItems] = useState([createEmptyLineItem()]);
    const [newBatchDrafts, setNewBatchDrafts] = useState([createEmptyBatchDraft()]);

    const fetchData = useCallback(async () => {
        try {
            const [resIn, resSup, resPro, resBat, resLoc, resStaff] = await Promise.all([
                axiosClient.get('/api/inbound'),
                axiosClient.get('/api/suppliers'),
                axiosClient.get('/api/products/details'),
                axiosClient.get('/api/batches'),
                axiosClient.get('/api/locations'),
                axiosClient.get('/api/staff')
            ]);
            setReceipts(resIn.data); setSuppliers(resSup.data); setProducts(resPro.data);
            setBatches(resBat.data); setLocations(resLoc.data); setStaffs(resStaff.data);
        } catch { console.error('Lỗi tải dữ liệu'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const getStaffName = (id) => staffs.find(s => s.id === id)?.fullName || `NV #${id}`;

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key, direction });
    };

    const filteredReceipts = useMemo(() => {
        let result = receipts.filter(r => {
            const kw = filterKeyword.toLowerCase().trim();
            const sName = suppliers.find(s => s.id === r.supplierId)?.name || '';
            const matchesKw = !kw || (r.receiptCode?.toLowerCase().includes(kw) || sName.toLowerCase().includes(kw));
            const matchesSup = filterSupplier === 'ALL' || String(r.supplierId) === filterSupplier;
            const matchesSta = filterStatus === 'ALL' || r.status === filterStatus;
            return matchesKw && matchesSup && matchesSta;
        });

        if (sortConfig.key) {
            result.sort((a, b) => {
                let vA = a[sortConfig.key];
                let vB = b[sortConfig.key];
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

    const handleUpdateStatus = async (id, nextStatus) => {
        try {
            await axiosClient.put(`/api/inbound/${id}/status`, { status: nextStatus });
            fetchData();
        } catch { alert('Lỗi cập nhật trạng thái'); }
    };

    const handleSaveReceipt = async () => {
        if (!supplierId || !createdById) return alert("Vui lòng chọn NCC và Nhân viên!");
        const payload = {
            order: {
                receiptCode: 'PN' + Date.now().toString().slice(-8),
                supplierId: parseInt(supplierId), referenceNumber, notes,
                totalAmount: newItems.reduce((s, i) => s + (i.qtyReceived * i.price), 0),
                status: receiptStatus, createdBy: parseInt(createdById)
            },
            details: newItems.map(item => ({
                productId: parseInt(item.productId), batchId: parseInt(item.batchId), locationId: parseInt(item.locationId),
                quantityExpected: parseFloat(item.qtyExpected), quantityReceived: parseFloat(item.qtyReceived),
                quantity: parseFloat(item.qtyReceived), unitPrice: parseFloat(item.price), itemCondition: item.condition
            })),
            newBatches: newBatchDrafts.filter(b => b.productId && b.batchCode)
        };
        try {
            await axiosClient.post('/api/inbound/confirm', payload);
            setShowCreateModal(false); fetchData();
            setNewItems([createEmptyLineItem()]); setNewBatchDrafts([createEmptyBatchDraft()]);
        } catch { alert('Lỗi lưu phiếu nhập'); }
    };

    const toolbarActions = [
        { label: 'THÊM MỚI', iconSrc: addIcon, onClick: () => setShowCreateModal(true) },
        { label: 'CHI TIẾT', iconSrc: infoIcon, onClick: () => {
            const r = receipts.find(i => i.id === selectedReceiptId);
            if(r) { setSelectedReceipt(r); axiosClient.get(`/api/inbound/${r.id}/details`).then(res => { setDetailItems(res.data); setIsDetailModalOpen(true); }); }
        }},
        { label: 'LÀM MỚI', iconSrc: excel1Icon, onClick: fetchData }
    ];

    const SortIcon = ({ col }) => {
        if (sortConfig.key !== col) return <span className="opacity-20 ml-1 italic">↕</span>;
        return <span className="ml-1 text-[#1192a8] font-black">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>;
    };

    return (
        <div className="p-6 bg-[#f8f9fa] min-h-full flex flex-col text-left">
            <div className="sticky top-0 z-20 flex items-center justify-between bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-6">
                <div className="flex gap-4">{toolbarActions.map((a, i) => <ActionButton key={i} {...a} />)}</div>
                <div className="text-xs font-black text-gray-400 uppercase tracking-widest">Hệ thống phiếu nhập kho</div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-gray-100 mb-6 flex flex-col gap-4 shadow-sm">
                <input type="text" value={filterKeyword} onChange={e => setFilterKeyword(e.target.value)} placeholder="Tìm theo mã phiếu hoặc nhà cung cấp..." className="w-full border-2 border-gray-100 rounded-xl px-5 py-3 text-sm outline-none focus:border-[#1192a8] transition-all" />
                <div className="flex gap-6 border-t pt-4">
                    <div className="flex items-center gap-2"><span className="text-[10px] font-black text-gray-400 uppercase">Nhà cung cấp:</span><select value={filterSupplier} onChange={e => setFilterSupplier(e.target.value)} className="wms-select !py-1.5">{suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}<option value="ALL">Tất cả</option></select></div>
                    <div className="flex items-center gap-2"><span className="text-[10px] font-black text-gray-400 uppercase">Trạng thái:</span><select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="wms-select !py-1.5">{inboundStatusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}<option value="ALL">Tất cả</option></select></div>
                </div>
            </div>

            <div className="flex-1 bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b text-[10px] font-black text-gray-400 uppercase">
                        <tr>
                            <th className="p-5 w-16">#</th>
                            <th className="p-5 cursor-pointer hover:text-[#1192a8] transition-colors" onClick={() => requestSort('receiptCode')}>Mã phiếu <SortIcon col="receiptCode" /></th>
                            <th className="p-5 cursor-pointer hover:text-[#1192a8] transition-colors" onClick={() => requestSort('createdAt')}>Thời gian <SortIcon col="createdAt" /></th>
                            <th className="p-5 cursor-pointer hover:text-[#1192a8] transition-colors" onClick={() => requestSort('supplierName')}>Nhà cung cấp <SortIcon col="supplierName" /></th>
                            <th className="p-5 text-right cursor-pointer hover:text-[#1192a8] transition-colors" onClick={() => requestSort('totalAmount')}>Tổng tiền <SortIcon col="totalAmount" /></th>
                            <th className="p-5 text-center w-48">Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {loading ? <tr><td colSpan="6" className="py-20 text-center animate-pulse">ĐANG TẢI...</td></tr> : filteredReceipts.map((item, idx) => (
                            <tr key={item.id} onClick={() => setSelectedReceiptId(item.id)} onDoubleClick={() => { setSelectedReceiptId(item.id); axiosClient.get(`/api/inbound/${item.id}/details`).then(res => { setDetailItems(res.data); setSelectedReceipt(item); setIsDetailModalOpen(true); }); }} onContextMenu={e => { setSelectedReceiptId(item.id); setContextMenu({ x: e.clientX, y: e.clientY, item }); e.preventDefault(); }}
                                className={`border-b border-gray-50 cursor-pointer ${selectedReceiptId === item.id ? 'bg-[#1192a8]/5' : 'hover:bg-gray-50'}`}>
                                <td className="p-5 text-gray-300 font-bold">{idx + 1}</td>
                                <td className="p-5 font-black text-[#1192a8] uppercase">{item.receiptCode}</td>
                                <td className="p-5 text-gray-500 font-bold">{item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : '---'}</td>
                                <td className="p-5 font-bold text-gray-700">{suppliers.find(s => s.id === item.supplierId)?.name || '---'}</td>
                                <td className="p-5 text-right font-black text-teal-700">{Number(item.totalAmount || 0).toLocaleString()}đ</td>
                                <td className="p-5 text-center" onClick={e => e.stopPropagation()}>
                                    <select value={item.status} onChange={e => handleUpdateStatus(item.id, e.target.value)}
                                        className={`w-fit mx-auto !py-1 !px-2 !text-[10px] uppercase font-black rounded-lg border-2 ${inboundStatusOptions.find(o => o.value === item.status)?.color || ''} cursor-pointer outline-none transition-all`}>
                                        {inboundStatusOptions.map(o => <option key={o.value} value={o.value} className="bg-white text-gray-700 font-bold">{o.label}</option>)}
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <VoucherContextMenu isOpen={!!contextMenu} x={contextMenu?.x || 0} y={contextMenu?.y || 0} title="Tác vụ nhanh" actions={[{ label: 'Xem chi tiết', onClick: () => { setSelectedReceipt(contextMenu.item); axiosClient.get(`/api/inbound/${contextMenu.item.id}/details`).then(res => { setDetailItems(res.data); setIsDetailModalOpen(true); }); } }, { label: 'Làm mới', onClick: fetchData }]} onClose={() => setContextMenu(null)} />

            {isDetailModalOpen && selectedReceipt && (
                <div className="fixed inset-0 bg-black/60 z-[110] flex justify-center items-center backdrop-blur-sm p-4 text-left">
                    <div className="bg-white rounded-3xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="bg-[#1192a8] p-5 text-white flex justify-between items-center">
                            <div><h2 className="font-bold uppercase tracking-widest text-sm text-left">Phiếu nhập: {selectedReceipt.receiptCode}</h2><p className="text-[10px] font-bold opacity-80 uppercase italic">Người lập: {getStaffName(selectedReceipt.createdBy)}</p></div>
                            <button onClick={() => setIsDetailModalOpen(false)} className="text-3xl">&times;</button>
                        </div>
                        <div className="p-8 overflow-y-auto flex-1 space-y-8 bg-gray-50/30">
                            <div className="grid grid-cols-2 gap-10 border-b pb-8 text-left">
                                <div><p className="text-[10px] text-gray-400 font-black uppercase">Nhà cung cấp</p><p className="text-lg font-black text-gray-800">{suppliers.find(s => s.id === selectedReceipt.supplierId)?.name}</p></div>
                                <div><p className="text-[10px] text-gray-400 font-black uppercase">Thời gian tạo</p><p className="text-lg font-black text-gray-800">{new Date(selectedReceipt.createdAt).toLocaleString('vi-VN')}</p></div>
                            </div>
                            <table className="w-full text-sm text-left"><thead className="bg-gray-50 text-gray-400 text-[10px] uppercase font-bold"><tr><th className="p-3">Sản phẩm</th><th className="p-3 text-center">Số lượng</th><th className="p-3 text-right">Đơn giá</th><th className="p-3 text-right">Thành tiền</th></tr></thead>
                                <tbody className="divide-y divide-gray-100">
                                    {detailItems.map((item, i) => { const p = products.find(prod => prod.id === item.productId); return (<tr key={i}><td className="p-3 font-bold">{p?.name || `SP #${item.productId}`}</td><td className="p-3 text-center font-black">{item.quantityReceived.toLocaleString()}</td><td className="p-3 text-right text-gray-400">{Number(item.unitPrice).toLocaleString()}đ</td><td className="p-3 text-right font-black text-[#1192a8]">{(item.quantityReceived * item.unitPrice).toLocaleString()}đ</td></tr>); })}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-5 border-t bg-white text-right"><p className="text-[10px] font-black text-gray-400 uppercase">Tổng giá trị</p><p className="text-3xl font-black text-teal-700">{Number(selectedReceipt.totalAmount || 0).toLocaleString()}đ</p></div>
                    </div>
                </div>
            )}
            
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/60 z-[100] flex justify-center items-center backdrop-blur-sm p-4 animate-in slide-in-from-bottom-4 duration-300">
                    <div className="bg-white rounded-3xl w-full max-w-6xl overflow-hidden flex flex-col max-h-[95vh]">
                        <div className="bg-[#1192a8] p-5 text-white flex justify-between items-center"><h2 className="font-bold uppercase tracking-widest text-sm">Lập phiếu nhập mới</h2><button onClick={() => setShowCreateModal(false)} className="text-3xl">&times;</button></div>
                        <div className="p-8 overflow-y-auto flex-1 space-y-8 bg-gray-50/50">
                            <div className="grid grid-cols-4 gap-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-left">
                                <div><label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Nhà cung cấp</label><select value={supplierId} onChange={e => setSupplierId(e.target.value)} className="wms-select w-full !py-2"><option value="">-- Chọn --</option>{suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                                <div><label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Người lập</label><select value={createdById} onChange={e => setCreatedById(e.target.value)} className="wms-select w-full !py-2"><option value="">-- Chọn --</option>{staffs.map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}</select></div>
                                <div><label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Số tham chiếu</label><input type="text" value={referenceNumber} onChange={e => setReferenceNumber(e.target.value)} className="wms-select w-full !py-2 !bg-none border-2" /></div>
                                <div><label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Trạng thái</label><select value={receiptStatus} onChange={e => setReceiptStatus(e.target.value)} className="wms-select w-full !py-2">{inboundStatusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
                            </div>
                            <div className="space-y-4 text-left">
                                <div className="flex justify-between items-center"><h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Danh mục hàng hóa</h3><button onClick={() => setNewItems([...newItems, createEmptyLineItem()])} className="text-[10px] font-black text-[#1192a8] hover:underline">+ THÊM DÒNG</button></div>
                                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden"><table className="w-full text-xs text-left"><thead><tr className="bg-gray-50 text-gray-400 font-bold uppercase"><th className="p-3">Sản phẩm</th><th className="p-3 text-center">SL Thực nhập</th><th className="p-3 text-right">Đơn giá</th><th className="p-3"></th></tr></thead>
                                    <tbody>{newItems.map((item, i) => (<tr key={i} className="border-t border-gray-50"><td className="p-2"><select value={item.productId} onChange={e => { const next=[...newItems]; next[i].productId=e.target.value; setNewItems(next); }} className="w-full border-none outline-none font-bold text-gray-800 bg-transparent text-left"><option value="">-- Chọn SP --</option>{products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></td><td className="p-2"><input type="number" value={item.qtyReceived} onChange={e => { const next=[...newItems]; next[i].qtyReceived=e.target.value; setNewItems(next); }} className="w-full border-none outline-none text-center font-black text-teal-600 bg-transparent" /></td><td className="p-2"><input type="number" value={item.price} onChange={e => { const next=[...newItems]; next[i].price=e.target.value; setNewItems(next); }} className="w-full border-none outline-none text-right font-bold bg-transparent" /></td><td className="p-2"><button onClick={() => setNewItems(newItems.filter((_, idx) => idx !== i))} className="text-red-300 text-lg">&times;</button></td></tr>))}</tbody>
                                </table></div>
                            </div>
                        </div>
                        <div className="p-6 border-t bg-white flex justify-between items-center"><div className="text-left"><p className="text-[10px] font-black text-gray-400 uppercase">Tổng cộng</p><p className="text-2xl font-black text-teal-700">{newItems.reduce((s, i) => s + (i.qtyReceived * i.price), 0).toLocaleString()}đ</p></div><div className="flex gap-4"><button onClick={() => setShowCreateModal(false)} className="text-gray-400 font-bold uppercase text-xs hover:text-gray-600">Hủy</button><button onClick={handleSaveReceipt} className="px-10 py-3 bg-[#1192a8] text-white rounded-2xl font-black uppercase text-xs shadow-xl shadow-[#1192a8]/20 transition-all hover:scale-105 active:scale-95 transition-all">Xác nhận nhập</button></div></div>
                    </div>
                </div>
            )}
        </div>
    );
}
