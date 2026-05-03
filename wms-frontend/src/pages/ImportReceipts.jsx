// ================================================================
// 5. ImportReceipts.jsx — thay fetch → axiosClient
// ================================================================
import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
 
export default function ImportReceiptsPage() {
    const [receipts, setReceipts]           = useState([]);
    const [loading, setLoading]             = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedReceipt, setSelectedReceipt]     = useState(null);
    const [detailItems, setDetailItems]     = useState([]);
    const [suppliers, setSuppliers]         = useState([]);
    const [products, setProducts]           = useState([]);
    const [batches, setBatches]             = useState([]);
    const [locations, setLocations]         = useState([]);
    const [supplierId, setSupplierId]       = useState('');
    const [referenceNumber, setReferenceNumber] = useState('');
    const [notes, setNotes]                 = useState('');
    const [newItems, setNewItems]           = useState([{
        productId: '', batchId: '', locationId: '', qtyExpected: 1, qtyReceived: 1, price: 0, condition: 'Bình thường'
    }]);
 
    useEffect(() => { fetchInitialData(); }, []);
 
    const fetchInitialData = async () => {
        try {
            const [resInbound, resSup, resPro, resBat, resLoc] = await Promise.all([
                axiosClient.get('/api/inbound'),
                axiosClient.get('/api/suppliers'),
                axiosClient.get('/api/products/details'),
                axiosClient.get('/api/batches'),
                axiosClient.get('/api/locations'),
            ]);
            setReceipts(resInbound.data);
            setSuppliers(resSup.data);
            setProducts(resPro.data);
            setBatches(resBat.data);
            setLocations(resLoc.data);
        } catch (error) {
            console.error('Lỗi tải dữ liệu:', error);
        } finally {
            setLoading(false);
        }
    };
 
    const fetchReceipts = async () => {
        const res = await axiosClient.get('/api/inbound');
        setReceipts(res.data);
    };
 
    const handleViewDetail = async (receipt) => {
        setSelectedReceipt(receipt);
        try {
            const res = await axiosClient.get(`/api/inbound/${receipt.id}/details`);
            setDetailItems(res.data);
            setIsDetailModalOpen(true);
        } catch { alert('Không thấy chi tiết hàng'); }
    };
 
    const calculateTotal = () => newItems.reduce((sum, item) => sum + (parseFloat(item.qtyReceived) || 0) * (parseFloat(item.price) || 0), 0);
 
    const handleSaveReceipt = async () => {
        if (!supplierId || newItems.some(item => !item.productId || !item.batchId || !item.locationId)) {
            alert('Vui lòng chọn đủ'); return;
        }
        const payload = {
            order: {
                receiptCode: 'PN-' + Date.now(),
                supplierId: parseInt(supplierId),
                referenceNumber,
                notes,
                totalAmount: calculateTotal(),
                status: 'COMPLETED',
                actualDate: new Date().toISOString(),
                createdBy: 1,
            },
            details: newItems.map(item => ({
                productId:         parseInt(item.productId),
                batchId:           parseInt(item.batchId),
                locationId:        parseInt(item.locationId),
                quantityExpected:  parseFloat(item.qtyExpected),
                quantityReceived:  parseFloat(item.qtyReceived),
                quantity:          parseFloat(item.qtyReceived),
                unitPrice:         parseFloat(item.price),
                itemCondition:     item.condition,
            })),
        };
        try {
            await axiosClient.post('/api/inbound/confirm', payload);
            alert('Thành công');
            setShowCreateModal(false);
            fetchReceipts();
            resetForm();
        } catch { alert('Lỗi kết nối Server'); }
    };
 
    const handleExportExcel = () => {
        // Mở URL có kèm token trong header không được qua window.open
        // Giải pháp: dùng axiosClient để tải file blob
        axiosClient.get('/api/inbound/export', { responseType: 'blob' })
            .then(res => {
                const url = window.URL.createObjectURL(new Blob([res.data]));
                const a   = document.createElement('a');
                a.href = url; a.download = 'inbound_export.xlsx'; a.click();
                window.URL.revokeObjectURL(url);
            })
            .catch(() => alert('Xuất Excel thất bại'));
    };
 
    const addLineItem    = () => setNewItems([...newItems, { productId: '', batchId: '', locationId: '', qtyExpected: 1, qtyReceived: 1, price: 0, condition: 'Bình thường' }]);
    const removeLineItem = (i) => setNewItems(newItems.filter((_, idx) => idx !== i));
    const updateItem     = (i, field, value) => { const u = [...newItems]; u[i] = { ...u[i], [field]: value }; setNewItems(u); };
    const resetForm      = () => { setSupplierId(''); setReferenceNumber(''); setNotes(''); setNewItems([{ productId: '', batchId: '', locationId: '', qtyExpected: 1, qtyReceived: 1, price: 0, condition: 'Bình thường' }]); };
 
    // ── JSX giữ nguyên hoàn toàn từ file gốc ─────────────────
    // (Không thay đổi gì ở phần return — chỉ thay fetch ở trên)
    return (
        <div className="p-6 bg-gray-50 min-h-full">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Phiếu nhập kho</h1>
                <div className="flex gap-3">
                    <button onClick={() => setShowCreateModal(true)} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition shadow-md">+ Lập phiếu nhập</button>
                    <button onClick={handleExportExcel} className="px-5 py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition shadow-md">↓ Xuất Excel</button>
                    <button onClick={fetchInitialData} className="px-5 py-2.5 bg-[#1192a8] text-white rounded-xl font-bold text-sm hover:bg-teal-700 transition">↻ Làm mới</button>
                </div>
            </div>
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-48 text-gray-400 text-sm animate-pulse">Đang tải dữ liệu...</div>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                            <tr>
                                <th className="px-6 py-4">Mã phiếu</th>
                                <th className="px-6 py-4">Ngày tạo</th>
                                <th className="px-6 py-4">Trạng thái</th>
                                <th className="px-6 py-4 text-center">Chi tiết</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {receipts.length === 0 ? (
                                <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-400">Chưa có phiếu nhập nào</td></tr>
                            ) : receipts.map(r => (
                                <tr key={r.id} className="hover:bg-blue-50/50 transition cursor-pointer">
                                    <td className="px-6 py-4 font-bold text-[#1192a8]">{r.receiptCode}</td>
                                    <td className="px-6 py-4 text-gray-500 text-xs">{r.createdAt ? new Date(r.createdAt).toLocaleDateString('vi-VN') : '—'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${r.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : r.status === 'CANCELED' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {r.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button onClick={() => handleViewDetail(r)} className="text-xs font-bold text-[#1192a8] hover:underline">Xem chi tiết</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
 
            {/* Modal tạo phiếu — giữ nguyên JSX từ file gốc */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-3xl w-full max-w-[95vw] max-h-[90vh] flex flex-col shadow-2xl">
                        <div className="p-6 bg-blue-600 text-white rounded-t-3xl flex justify-between items-center">
                            <h2 className="text-xl font-bold">Lập Phiếu Nhập Kho (Mới)</h2>
                            <button onClick={() => setShowCreateModal(false)} className="hover:rotate-90 transition">✕</button>
                        </div>
                        <div className="p-6 overflow-auto space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase">Nhà cung cấp</label>
                                    <select className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 mt-1 focus:border-blue-500 outline-none" value={supplierId} onChange={e => setSupplierId(e.target.value)}>
                                        <option value="">-- Chọn NCC từ DB --</option>
                                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase">Số PO / Tham chiếu</label>
                                    <input className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 mt-1 focus:border-blue-500 outline-none" placeholder="Ví dụ: PO-2026-001" value={referenceNumber} onChange={e => setReferenceNumber(e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase">Ghi chú nhanh</label>
                                    <input className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 mt-1 focus:border-blue-500 outline-none" placeholder="Tình trạng xe, ghi chú..." value={notes} onChange={e => setNotes(e.target.value)} />
                                </div>
                            </div>
                            <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold">
                                        <tr>
                                            <th className="p-3 text-left">Sản phẩm</th>
                                            <th className="p-3 text-center w-32">Số Lô (Batch)</th>
                                            <th className="p-3 text-center w-32">Vị trí (Bin)</th>
                                            <th className="p-3 text-center w-24">Dự kiến</th>
                                            <th className="p-3 text-center w-24">Thực nhận</th>
                                            <th className="p-3 text-right w-32">Đơn giá (đ)</th>
                                            <th className="p-3 text-center w-16">Xóa</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {newItems.map((item, index) => (
                                            <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="p-2">
                                                    <select className="w-full border-2 border-gray-100 rounded-xl px-2 py-2 outline-none focus:border-blue-500 bg-white" value={item.productId} onChange={e => updateItem(index, 'productId', e.target.value)}>
                                                        <option value="">Chọn SP...</option>
                                                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                                    </select>
                                                </td>
                                                <td className="p-2">
                                                    <select className="w-full border-2 border-gray-100 rounded-xl px-2 py-2 outline-none focus:border-blue-500 bg-white" value={item.batchId} onChange={e => updateItem(index, 'batchId', e.target.value)}>
                                                        <option value="">Chọn Lô...</option>
                                                        {batches.filter(b => b.productId == item.productId || !item.productId).map(b => <option key={b.id} value={b.id}>{b.batchCode}</option>)}
                                                    </select>
                                                </td>
                                                <td className="p-2">
                                                    <select className="w-full border-2 border-gray-100 rounded-xl px-2 py-2 outline-none focus:border-blue-500 bg-white" value={item.locationId} onChange={e => updateItem(index, 'locationId', e.target.value)}>
                                                        <option value="">Chọn Bin...</option>
                                                        {locations.map(l => <option key={l.id} value={l.id}>{l.binCode}</option>)}
                                                    </select>
                                                </td>
                                                <td className="p-2"><input type="number" className="w-full border-2 border-gray-100 rounded-xl px-2 py-2 text-center outline-none" value={item.qtyExpected} onChange={e => updateItem(index, 'qtyExpected', e.target.value)} /></td>
                                                <td className="p-2"><input type="number" className="w-full border-2 border-gray-100 rounded-xl px-2 py-2 text-center font-bold text-blue-600 outline-none" value={item.qtyReceived} onChange={e => updateItem(index, 'qtyReceived', e.target.value)} /></td>
                                                <td className="p-2"><input type="number" className="w-full border-2 border-gray-100 rounded-xl px-2 py-2 text-right font-mono outline-none" value={item.price} onChange={e => updateItem(index, 'price', e.target.value)} /></td>
                                                <td className="p-2 text-center">
                                                    <button type="button" onClick={() => removeLineItem(index)} className="w-8 h-8 flex items-center justify-center rounded-full text-red-400 hover:bg-red-50 hover:text-red-600 transition-all">✕</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <button onClick={addLineItem} className="text-blue-600 font-bold text-sm hover:underline">+ Thêm sản phẩm mới vào danh sách</button>
                        </div>
                        <div className="p-6 border-t flex justify-between items-center bg-gray-50 rounded-b-3xl">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Tổng giá trị dự kiến</span>
                                <span className="text-2xl font-black text-teal-700">{calculateTotal().toLocaleString()}đ</span>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setShowCreateModal(false)} className="px-6 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition">Hủy bỏ</button>
                                <button onClick={handleSaveReceipt} className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">Xác nhận nhập kho thực tế</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
 