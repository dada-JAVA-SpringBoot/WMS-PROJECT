import React, { useState, useEffect } from 'react';

export default function ImportReceiptsPage() {
    // qly state
    const [receipts, setReceipts] = useState([]); // ds tu db
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const [detailItems, setDetailItems] = useState([]); // chi tiet hang hoa

    // state danh muc tu db
    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);
    const [batches, setBatches] = useState([]);
    const [locations, setLocations] = useState([]);

    // dlieu phieu moi
    const [supplierId, setSupplierId] = useState("");
    const [referenceNumber, setReferenceNumber] = useState("");
    const [notes, setNotes] = useState("");
    const [newItems, setNewItems] = useState([{
        productId: "",
        batchId: "",
        locationId: "",
        qtyExpected: 1,
        qtyReceived: 1,
        price: 0,
        condition: "Bình thường"
    }]);

    // lay ds frontend
    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [resInbound, resSup, resPro, resBat, resLoc] = await Promise.all([
                fetch('http://localhost:8080/api/inbound'),
                fetch('http://localhost:8080/api/suppliers'),
                fetch('http://localhost:8080/api/products/details'),
                fetch('http://localhost:8080/api/batches'),
                fetch('http://localhost:8080/api/locations')
            ]);

            if (resInbound.ok) setReceipts(await resInbound.json());
            if (resSup.ok) setSuppliers(await resSup.json());
            if (resPro.ok) setProducts(await resPro.json());
            if (resBat.ok) setBatches(await resBat.json());
            if (resLoc.ok) setLocations(await resLoc.json());
        } catch (error) {
            console.error("Lỗi tải dữ liệu:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchReceipts = async () => {
        const response = await fetch('http://localhost:8080/api/inbound');
        if (response.ok) setReceipts(await response.json());
    };

    // xem chi tiet khi click
    const handleViewDetail = async (receipt) => {
        setSelectedReceipt(receipt);
        try {
            const response = await fetch(`http://localhost:8080/api/inbound/${receipt.id}/details`);
            if (response.ok) {
                const details = await response.json();
                setDetailItems(details);
                setIsDetailModalOpen(true);
            }
        } catch (error) {
            alert("Không thấy chi tiết hàng");
        }
    };

    // logic luu phieu
    const handleSaveReceipt = async () => {
        if (!supplierId || newItems.some(item => !item.productId || !item.batchId || !item.locationId)) {
            alert("Vui lòng chọn đủ");
            return;
        }

        const payload = {
            order: {
                receiptCode: "PN-" + Date.now(),
                supplierId: parseInt(supplierId),
                referenceNumber: referenceNumber,
                notes: notes,
                totalAmount: calculateTotal(),
                status: "COMPLETED",
                actualDate: new Date().toISOString(),
                createdBy: 1
            },
            details: newItems.map(item => ({
                productId: parseInt(item.productId),
                batchId: parseInt(item.batchId),
                locationId: parseInt(item.locationId),
                quantityExpected: parseFloat(item.qtyExpected),
                quantityReceived: parseFloat(item.qtyReceived),
                quantity: parseFloat(item.qtyReceived),
                unitPrice: parseFloat(item.price),
                itemCondition: item.condition
            }))
        };

        try {
            const response = await fetch('http://localhost:8080/api/inbound/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert("Thành công");
                setShowCreateModal(false);
                fetchReceipts();
                resetForm();
            }
        } catch (error) {
            alert("Lỗi kết nối Server");
        }
    };

    // xuat exel
    const handleExportExcel = () => {
        window.open('http://localhost:8080/api/inbound/export', '_blank');
    };


    const addLineItem = () => setNewItems([...newItems, { productId: "", batchId: "", locationId: "", qtyExpected: 1, qtyReceived: 1, price: 0, condition: "Bình thường" }]);
    const updateItem = (index, field, value) => {
        const updated = [...newItems];
        updated[index][field] = value;
        setNewItems(updated);
    };
    const removeLineItem = (index) => {
        if (newItems.length > 1) {
            const updated = newItems.filter((_, i) => i !== index);
            setNewItems(updated);
        } else {
            setNewItems([{ productId: "", batchId: "", locationId: "", qtyExpected: 1, qtyReceived: 1, price: 0, condition: "Bình thường" }]);
        }
    };
    const calculateTotal = () => newItems.reduce((sum, item) => sum + (item.qtyReceived * item.price), 0);
    const resetForm = () => {
        setSupplierId("");
        setReferenceNumber("");
        setNotes("");
        setNewItems([{ productId: "", batchId: "", locationId: "", qtyExpected: 1, qtyReceived: 1, price: 0, condition: "Bình thường" }]);
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen flex flex-col font-sans">
            {/* header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Quản lý Phiếu Nhập</h1>
                    <p className="text-sm text-gray-500">Dữ liệu thời gian thực từ hệ thống WMS</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleExportExcel} className="bg-green-600 text-white px-4 py-2 rounded-xl font-bold hover:shadow-lg transition-all">
                        📄 Xuất Excel
                    </button>
                    <button onClick={() => setShowCreateModal(true)} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:shadow-lg">
                        ➕ Tạo phiếu mới
                    </button>
                </div>
            </div>

            {/* bang ds*/}
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 uppercase text-[11px] font-bold">
                    <tr>
                        <th className="p-4 border-b">Mã phiếu</th>
                        <th className="p-4 border-b">Số PO/Tham chiếu</th>
                        <th className="p-4 border-b">Thời gian lập</th>
                        <th className="p-4 border-b text-right">Tổng tiền</th>
                        <th className="p-4 border-b text-center">Trạng thái</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {loading ? (
                        <tr><td colSpan="5" className="p-10 text-center text-gray-400">Đang tải dữ liệu từ kho...</td></tr>
                    ) : receipts.map((p) => (
                        <tr key={p.id} onClick={() => handleViewDetail(p)} className="hover:bg-blue-50 cursor-pointer transition">
                            <td className="p-4 font-mono font-bold text-blue-600">{p.receiptCode}</td>
                            <td className="p-4 font-medium text-gray-700">{p.referenceNumber || "N/A"}</td>
                            <td className="p-4 text-gray-500">{new Date(p.createdAt).toLocaleString()}</td>
                            <td className="p-4 text-right font-bold text-teal-700">{p.totalAmount?.toLocaleString()}đ</td>
                            <td className="p-4 text-center">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                                        p.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                        {p.status}
                                    </span>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* modal chi tiet phieu */}
            {isDetailModalOpen && selectedReceipt && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
                    <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl p-6">
                        <div className="flex justify-between items-center mb-4 border-b pb-4">
                            <h2 className="text-xl font-bold text-gray-800">Thông tin chi tiết: {selectedReceipt.receiptCode}</h2>
                            <button onClick={() => setIsDetailModalOpen(false)} className="text-2xl hover:text-red-500 transition">✕</button>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-6 text-sm text-gray-600">
                            <p><strong>Số PO:</strong> {selectedReceipt.referenceNumber}</p>
                            <p><strong>Ngày nhập thực tế:</strong> {selectedReceipt.actualDate ? new Date(selectedReceipt.actualDate).toLocaleString() : "N/A"}</p>
                            <p className="col-span-2"><strong>Ghi chú từ thủ kho:</strong> {selectedReceipt.notes || "Không có"}</p>
                        </div>
                        <table className="w-full text-sm border-collapse">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="p-2 border text-left">Sản phẩm</th>
                                <th className="p-2 border text-center">Số lô</th>
                                <th className="p-2 border text-center">Vị trí</th>
                                <th className="p-2 border text-center">Dự kiến</th>
                                <th className="p-2 border text-center">Thực nhận</th>
                                <th className="p-2 border text-center">Tình trạng</th>
                            </tr>
                            </thead>
                            <tbody>
                            {detailItems.map((item, idx) => (
                                <tr key={idx} className="border-b">
                                    <td className="p-2 border text-blue-600 font-medium">SP #{item.productId}</td>
                                    <td className="p-2 border text-center font-mono text-xs">{item.batchId}</td>
                                    <td className="p-2 border text-center text-xs">{item.locationId}</td>
                                    <td className="p-2 border text-center">{item.quantityExpected}</td>
                                    <td className="p-2 border text-center font-bold">{item.quantityReceived}</td>
                                    <td className="p-2 border text-center text-xs text-gray-500">{item.itemCondition}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* modal tao phieu */}
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
                                    <select
                                        className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 mt-1 focus:border-blue-500 outline-none"
                                        value={supplierId}
                                        onChange={(e) => setSupplierId(e.target.value)}
                                    >
                                        <option value="">-- Chọn NCC từ DB --</option>
                                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase">Số PO / Tham chiếu</label>
                                    <input className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 mt-1 focus:border-blue-500 outline-none" placeholder="Ví dụ: PO-2026-001" value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase">Ghi chú nhanh</label>
                                    <input className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 mt-1 focus:border-blue-500 outline-none" placeholder="Tình trạng xe, ghi chú..." value={notes} onChange={(e) => setNotes(e.target.value)} />
                                </div>
                            </div>

                            {/* dong them sp  */}
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
                                                <select
                                                    className="w-full border-2 border-gray-100 rounded-xl px-2 py-2 outline-none focus:border-blue-500 transition-all bg-white"
                                                    value={item.productId}
                                                    onChange={(e) => updateItem(index, 'productId', e.target.value)}
                                                >
                                                    <option value="">Chọn SP...</option>
                                                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                                </select>
                                            </td>
                                            <td className="p-2">
                                                <select
                                                    className="w-full border-2 border-gray-100 rounded-xl px-2 py-2 outline-none focus:border-blue-500 bg-white"
                                                    value={item.batchId}
                                                    onChange={(e) => updateItem(index, 'batchId', e.target.value)}
                                                >
                                                    <option value="">Chọn Lô...</option>
                                                    {batches.filter(b => b.productId == item.productId || !item.productId).map(b => (
                                                        <option key={b.id} value={b.id}>{b.batchCode}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="p-2">
                                                <select
                                                    className="w-full border-2 border-gray-100 rounded-xl px-2 py-2 outline-none focus:border-blue-500 bg-white"
                                                    value={item.locationId}
                                                    onChange={(e) => updateItem(index, 'locationId', e.target.value)}
                                                >
                                                    <option value="">Chọn Bin...</option>
                                                    {locations.map(l => <option key={l.id} value={l.id}>{l.binCode}</option>)}
                                                </select>
                                            </td>
                                            <td className="p-2">
                                                <input
                                                    type="number"
                                                    className="w-full border-2 border-gray-100 rounded-xl px-2 py-2 text-center outline-none"
                                                    value={item.qtyExpected}
                                                    onChange={(e) => updateItem(index, 'qtyExpected', e.target.value)}
                                                />
                                            </td>
                                            <td className="p-2">
                                                <input
                                                    type="number"
                                                    className="w-full border-2 border-gray-100 rounded-xl px-2 py-2 text-center font-bold text-blue-600 outline-none"
                                                    value={item.qtyReceived}
                                                    onChange={(e) => updateItem(index, 'qtyReceived', e.target.value)}
                                                />
                                            </td>
                                            <td className="p-2">
                                                <input
                                                    type="number"
                                                    className="w-full border-2 border-gray-100 rounded-xl px-2 py-2 text-right font-mono outline-none"
                                                    value={item.price}
                                                    onChange={(e) => updateItem(index, 'price', e.target.value)}
                                                />
                                            </td>
                                            <td className="p-2 text-center">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeLineItem(index);
                                                    }}
                                                    className="w-8 h-8 flex items-center justify-center rounded-full text-red-400 hover:bg-red-50 hover:text-red-600 transition-all"
                                                >✕</button>
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