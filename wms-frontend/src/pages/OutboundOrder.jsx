// ================================================================
// 6. OutboundOrder.jsx — SỬA LỖI TRIỆT ĐỂ & BỔ SUNG SẮP XẾP
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

const createEmptyDetail = () => ({ 
    id: Math.random(), productId: '', productName: '', unit: '-', quantity: 1, price: 0, total: 0 
});

const outboundStatusOptions = [
    { value: 'DRAFT', label: 'Bản nháp', color: 'bg-gray-100 text-gray-500 border-gray-200' },
    { value: 'ALLOCATED', label: 'Đã phân bổ', color: 'bg-blue-50 text-blue-700 border-blue-100' },
    { value: 'COMPLETED', label: 'Đã xuất kho', color: 'bg-green-50 text-green-700 border-green-100' },
    { value: 'CANCELED', label: 'Đã hủy', color: 'bg-red-50 text-red-600 border-red-100' }
];

export default function ExportReceipts({ workflow, clearWorkflow }) {
    const [exportData, setExportData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedRowId, setSelectedRowId] = useState(null);
    const [contextMenu, setContextMenu] = useState(null);
    
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isViewDetailOpen, setIsViewDetailOpen] = useState(false);
    const [viewingVoucher, setViewingVoucher] = useState(null);
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

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await axiosClient.get("/api/outbound-orders");
            setExportData(Array.isArray(res.data) ? res.data : []);
        } catch (e) { 
            console.error("Lỗi API Phiếu xuất:", e);
            setExportData([]);
        }
        axiosClient.get("/api/products/details").then(r => setProducts(r.data)).catch(() => {});
        axiosClient.get("/api/customers").then(r => setCustomers(r.data)).catch(() => {});
        axiosClient.get("/api/staff").then(r => setStaffs(r.data)).catch(() => {});
        setIsLoading(false);
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const getCustName = (id) => customers.find(c => c.id === id)?.name || `Đối tác #${id}`;
    const getStfName = (id) => staffs.find(s => s.id === id)?.fullName || `NV #${id}`;

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key, direction });
    };

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
                let vA = a[sortConfig.key];
                let vB = b[sortConfig.key];
                if (sortConfig.key === 'customerName') {
                    vA = getCustName(a.customerId);
                    vB = getCustName(b.customerId);
                }
                if (vA < vB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (vA > vB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return result;
    }, [exportData, searchKeyword, filterCustomer, filterStaff, customers, staffs, sortConfig]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleUpdateStatus = async (id, nextStatus) => {
        try {
            await axiosClient.put(`/api/outbound-orders/${id}/status`, { status: nextStatus });
            fetchData();
        } catch (e) {
            alert("Lỗi cập nhật: " + (e.response?.data?.message || e.message));
        }
    };

    const handleOpenCreate = (seed = []) => {
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        setFormData({
            voucherCode: `XK${dateStr.replace(/-/g, '')}${now.getSeconds()}`,
            voucherDate: dateStr, customerId: '', staffId: '', note: ''
        });
        setDetails(seed.length > 0 ? seed : [createEmptyDetail()]);
        setIsCreateOpen(true);
    };

    const handleSave = async () => {
        if (!formData.customerId) return alert("Vui lòng chọn khách hàng!");
        const valid = details.filter(d => d.productId);
        if (valid.length === 0) return alert("Vui lòng chọn sản phẩm!");
        const payload = {
            issueCode: formData.voucherCode,
            issueDate: `${formData.voucherDate}T12:00:00`,
            customerId: parseInt(formData.customerId),
            createdBy: parseInt(formData.staffId || 1),
            status: 'DRAFT',
            note: formData.note,
            totalAmount: valid.reduce((s, d) => s + d.total, 0),
            items: valid.map(d => ({
                productId: parseInt(d.productId), quantity: parseFloat(d.quantity),
                unitPrice: parseFloat(d.price), batchId: 1, locationId: 1
            }))
        };
        try {
            await axiosClient.post("/api/outbound-orders", payload);
            setIsCreateOpen(false); fetchData();
        } catch (e) { alert("Lỗi lưu: " + e.message); }
    };

    const toolbarActions = [
        { label: 'THÊM MỚI', iconSrc: addIcon, onClick: () => handleOpenCreate() },
        { label: 'LÀM MỚI', iconSrc: excel1Icon, onClick: fetchData }
    ];

    const SortIcon = ({ col }) => {
        if (sortConfig.key !== col) return <span className="opacity-20 ml-1 italic">↕</span>;
        return <span className="ml-1 text-[#1192a8] font-black">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>;
    };

    return (
        <div className="p-6 bg-[#f8f9fa] min-h-full flex flex-col text-left font-sans text-gray-800">
            <div className="sticky top-0 z-20 flex items-center justify-between bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-6 transition-all">
                <div className="flex gap-4">{toolbarActions.map((a, i) => (<ActionButton key={i} {...a} />))}</div>
                <h1 className="text-sm font-black text-gray-400 uppercase tracking-widest">Hệ thống phiếu xuất</h1>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-gray-100 mb-6 flex flex-col gap-4 shadow-sm">
                <input type="text" value={searchKeyword} onChange={e => setSearchKeyword(e.target.value)} placeholder="Tìm kiếm nhanh..." className="w-full border-2 border-gray-100 rounded-xl px-5 py-3 text-sm outline-none focus:border-[#1192a8] transition-all" />
                <div className="flex gap-6 border-t pt-4">
                    <div className="flex items-center gap-2"><span className="text-[10px] font-black text-gray-400 uppercase">Khách hàng:</span><select value={filterCustomer} onChange={e => setFilterCustomer(e.target.value)} className="wms-select !py-1.5">{customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}<option value="ALL">Tất cả</option></select></div>
                    <div className="flex items-center gap-2"><span className="text-[10px] font-black text-gray-400 uppercase">Người lập:</span><select value={filterStaff} onChange={e => setFilterStaff(e.target.value)} className="wms-select !py-1.5">{staffs.map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}<option value="ALL">Tất cả</option></select></div>
                </div>
            </div>

            <div className="flex-1 bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b text-[10px] font-black text-gray-400 uppercase">
                        <tr>
                            <th className="p-5 w-16">#</th>
                            <th className="p-5 cursor-pointer hover:text-[#1192a8]" onClick={() => requestSort('issueCode')}>Mã phiếu <SortIcon col="issueCode" /></th>
                            <th className="p-5 cursor-pointer hover:text-[#1192a8]" onClick={() => requestSort('createdAt')}>Thời gian tạo <SortIcon col="createdAt" /></th>
                            <th className="p-5 cursor-pointer hover:text-[#1192a8]" onClick={() => requestSort('customerName')}>Khách hàng <SortIcon col="customerName" /></th>
                            <th className="p-5 text-right cursor-pointer hover:text-[#1192a8]" onClick={() => requestSort('totalAmount')}>Tổng tiền <SortIcon col="totalAmount" /></th>
                            <th className="p-5 text-center w-56">Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {isLoading ? <tr><td colSpan="6" className="py-20 text-center animate-pulse text-[#1192a8] font-bold">ĐANG TẢI...</td></tr> : filteredData.map((item, idx) => (
                            <tr key={item.id} onClick={() => setSelectedRowId(item.id)} onDoubleClick={() => { setViewingVoucher(item); setIsViewDetailOpen(true); }} onContextMenu={e => { setSelectedRowId(item.id); setContextMenu({ x: e.clientX, y: e.clientY, item }); e.preventDefault(); }}
                                className={`border-b border-gray-50 cursor-pointer ${selectedRowId === item.id ? 'bg-[#1192a8]/5' : 'hover:bg-gray-50'}`}>
                                <td className="p-5 text-gray-300 font-bold">{idx + 1}</td>
                                <td className="p-5 font-black text-[#1192a8] uppercase truncate">{item.issueCode}</td>
                                <td className="p-5 text-gray-500 font-bold">{item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : '---'}</td>
                                <td className="p-5 font-bold text-gray-700">{getCustName(item.customerId)}</td>
                                <td className="p-5 text-right font-black text-teal-700">{Number(item.totalAmount || 0).toLocaleString()}đ</td>
                                <td className="p-5 text-center" onClick={e => e.stopPropagation()}>
                                    <select 
                                        value={item.status} 
                                        onChange={e => handleUpdateStatus(item.id, e.target.value)}
                                        className={`w-fit mx-auto !py-1 !px-2 !text-[10px] uppercase font-black rounded-lg border-2 ${outboundStatusOptions.find(o => o.value === item.status)?.color || ''} cursor-pointer outline-none focus:ring-2 focus:ring-[#1192a8]/20 transition-all`}
                                    >
                                        {outboundStatusOptions.map(o => <option key={o.value} value={o.value} className="bg-white text-gray-700 font-bold">{o.label}</option>)}
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <VoucherContextMenu isOpen={!!contextMenu} x={contextMenu?.x || 0} y={contextMenu?.y || 0} title="Tác vụ nhanh" actions={[{ label: 'Xem chi tiết', onClick: () => { setViewingVoucher(contextMenu.item); setIsViewDetailOpen(true); } }, { label: 'Làm mới', onClick: fetchData }]} onClose={() => setContextMenu(null)} />

            {isViewDetailOpen && viewingVoucher && (
                <div className="fixed inset-0 bg-black/60 z-[110] flex justify-center items-center backdrop-blur-sm p-4 text-left shadow-2xl animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="bg-[#1192a8] p-5 text-white flex justify-between items-center shrink-0">
                            <div><h2 className="font-bold uppercase tracking-widest text-sm">Phiêu xuất: {viewingVoucher.issueCode}</h2><p className="text-[10px] font-bold opacity-80 uppercase italic">Người lập: {getStfName(viewingVoucher.createdBy)}</p></div>
                            <button onClick={() => setIsViewDetailOpen(false)} className="text-3xl hover:text-red-200 leading-none">&times;</button>
                        </div>
                        <div className="p-8 overflow-y-auto flex-1 space-y-8 bg-gray-50/30 text-left">
                            <div className="grid grid-cols-2 gap-10 border-b pb-8">
                                <div><p className="text-[10px] text-gray-400 font-black uppercase">Khách hàng</p><p className="text-lg font-black text-gray-800">{getCustName(viewingVoucher.customerId)}</p></div>
                                <div><p className="text-[10px] text-gray-400 font-black uppercase">Thời gian tạo</p><p className="text-lg font-black text-gray-800">{viewingVoucher.createdAt ? new Date(viewingVoucher.createdAt).toLocaleString('vi-VN') : '---'}</p></div>
                            </div>
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase font-bold text-left"><tr><th className="p-3">Sản phẩm</th><th className="p-3 text-center">Số lượng</th><th className="p-3 text-right">Đơn giá</th><th className="p-3 text-right">Thành tiền</th></tr></thead>
                                <tbody className="divide-y divide-gray-100">
                                    {viewingVoucher.items?.map((row, i) => {
                                        const p = products.find(prod => prod.id === row.productId);
                                        return (<tr key={i}><td className="p-3 font-bold text-left"><p>{p?.name || `SP #${row.productId}`}</p><p className="text-[10px] text-gray-400 font-mono">{p?.sku || ''}</p></td><td className="p-3 text-center font-black text-gray-700">{row.quantity?.toLocaleString()}</td><td className="p-3 text-right text-gray-400">{Number(row.unitPrice || 0).toLocaleString()}đ</td><td className="p-3 text-right font-black text-[#1192a8]">{(row.quantity * (row.unitPrice || 0)).toLocaleString()}đ</td></tr>);
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-5 border-t bg-white text-right"><p className="text-[10px] font-black text-gray-400 uppercase">Tổng thanh toán</p><p className="text-3xl font-black text-[#1192a8]">{Number(viewingVoucher.totalAmount || 0).toLocaleString()}đ</p></div>
                    </div>
                </div>
            )}
            
            {isCreateOpen && (
                <div className="fixed inset-0 bg-black/60 z-[100] flex justify-center items-center backdrop-blur-sm p-4 animate-in slide-in-from-bottom-4 duration-300">
                    <div className="bg-white rounded-3xl w-full max-w-6xl overflow-hidden flex flex-col max-h-[95vh]">
                        <div className="bg-[#1192a8] p-5 text-white flex justify-between items-center shrink-0"><h2 className="font-bold uppercase tracking-widest text-sm text-left">Lập phiếu xuất mới</h2><button onClick={() => setIsCreateOpen(false)} className="text-3xl">&times;</button></div>
                        <div className="p-8 overflow-y-auto flex-1 space-y-8 bg-gray-50/50">
                            <div className="grid grid-cols-4 gap-6 bg-white p-6 rounded-2xl border border-gray-100">
                                <div className="text-left"><label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Khách hàng *</label><select value={formData.customerId} onChange={e => setFormData({...formData, customerId: e.target.value})} className="wms-select w-full !py-2"><option value="">-- Chọn --</option>{customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                                <div className="text-left"><label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Người xuất</label><select value={formData.staffId} onChange={e => setFormData({...formData, staffId: e.target.value})} className="wms-select !py-2 !w-full"><option value="">-- Chọn --</option>{staffs.map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}</select></div>
                                <div className="text-left"><label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Mã phiếu</label><input type="text" value={formData.voucherCode} readOnly className="wms-select w-full !py-2 bg-gray-100 opacity-70" /></div>
                                <div className="text-left"><label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Ngày lập</label><input type="date" value={formData.voucherDate} onChange={e => setFormData({...formData, voucherDate: e.target.value})} className="wms-select w-full !py-2" /></div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center"><h3 className="text-xs font-black text-gray-400 uppercase tracking-widest text-left">Hàng hóa</h3><button onClick={() => setDetails([...details, createEmptyDetail()])} className="text-[10px] font-black text-blue-600">+ THÊM DÒNG</button></div>
                                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden text-left"><table className="w-full text-xs"><thead><tr className="bg-gray-50 text-gray-400 font-bold uppercase"><th className="p-3">Sản phẩm</th><th className="p-3 text-center w-24">SL</th><th className="p-3 text-right w-32">Giá</th><th className="p-3 w-10"></th></tr></thead><tbody>{details.map((row, i) => (<tr key={row.id} className="border-t border-gray-50"><td className="p-2"><select value={row.productId} onChange={e => { const next = [...details]; next[i].productId = e.target.value; const p = products.find(it => String(it.id) === e.target.value); if(p){ next[i].productName = p.name; next[i].price = p.price || 0; } next[i].total = Number(next[i].quantity) * Number(next[i].price); setDetails(next); }} className="w-full border-none outline-none font-bold bg-transparent text-left">{products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}<option value="">-- Chọn SP --</option></select></td><td className="p-2"><input type="number" value={row.quantity} onChange={e => { const next = [...details]; next[i].quantity = e.target.value; next[i].total = Number(e.target.value) * Number(next[i].price); setDetails(next); }} className="w-full text-center font-black text-teal-600 bg-transparent outline-none" /></td><td className="p-2"><input type="number" value={row.price} onChange={e => { const next = [...details]; next[i].price = e.target.value; next[i].total = Number(next[i].quantity) * Number(e.target.value); setDetails(next); }} className="w-full text-right font-bold bg-transparent outline-none" /></td><td className="p-2 text-right"><button onClick={() => setDetails(details.filter((_, idx) => idx !== i))} className="text-red-300 text-lg">&times;</button></td></tr>))}</tbody></table></div>
                            </div>
                        </div>
                        <div className="p-6 border-t bg-white flex justify-between items-center"><div className="text-left"><p className="text-[10px] font-black text-gray-400 uppercase text-left">Tổng giá trị</p><p className="text-2xl font-black text-[#1192a8]">{details.reduce((s, r) => s + r.total, 0).toLocaleString()}đ</p></div><div className="flex gap-4"><button onClick={() => setIsCreateOpen(false)} className="text-gray-400 font-bold uppercase text-xs">Hủy</button><button onClick={handleSave} className="px-10 py-3 bg-[#1192a8] text-white rounded-2xl font-black uppercase text-xs shadow-lg">Xác nhận phiếu</button></div></div>
                    </div>
                </div>
            )}
        </div>
    );
}
