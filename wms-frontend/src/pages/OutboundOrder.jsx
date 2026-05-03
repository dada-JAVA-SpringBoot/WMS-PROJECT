// ================================================================
// 6. OutboundOrder.jsx — thay fetch → axiosClient
// ================================================================
import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { TableToolbar } from '../components/common/SharedUI';
import axiosClient from '../api/axiosClient';
import addIcon    from '../components/common/icons/add.png';
import infoIcon   from '../components/common/icons/info.png';
import deleteIcon from '../components/common/icons/delete.png';
import excelIcon  from '../components/common/icons/excel.png';
import excel1Icon from '../components/common/icons/excel1.png';
 
export default function ExportReceipts() {
    const [isCreateOpen, setIsCreateOpen]         = useState(false);
    const [isViewDetailOpen, setIsViewDetailOpen] = useState(false);
    const [viewingVoucher, setViewingVoucher]     = useState(null);
    const [details, setDetails]                   = useState([]);
    const [exportData, setExportData]             = useState([]);
    const [isLoading, setIsLoading]               = useState(false);
    const [selectedRowId, setSelectedRowId]       = useState(null);
    const [filterStaff, setFilterStaff]           = useState('Tất cả nhân viên');
    const [filterDate, setFilterDate]             = useState('');
    const [filterCustomer, setFilterCustomer]     = useState('Tất cả khách hàng');
    const [productsFromSQL, setProductsFromSQL]   = useState([]);
 
    const customerDatabase = [
        { name: 'CÔNG TY CỔ PHẦN AUTO HOME', address: 'Số 1 Đào Duy Anh, Đống Đa, Hà Nội' },
        { name: 'Tập đoàn Hòa Phát',          address: 'Khu công nghiệp Phố Nối A, Hưng Yên' },
        { name: 'Nguyễn Văn A',               address: '123 Đường Láng, Đống Đa, Hà Nội' },
    ];
    const staffList = ['Hoàng Tất Thắng', 'Trần Nhật Sinh'];
 
    const fetchFromSQL = async () => {
        setIsLoading(true);
        try {
            const res  = await axiosClient.get('/api/outbound-orders');
            const data = res.data;
            const mappedData = data.map(item => ({
                ...item,
                id:     item.id,
                code:   item.issueCode,
                time:   item.issueDate,
                client: item.customerId ? customerDatabase[item.customerId - 1]?.name : 'Chưa rõ khách hàng',
                staff:  'Nhân viên hệ thống',
                total:  item.totalAmount || 0,
                status: item.status === 'ALLOCATED' ? 'completed' : 'cancelled',
                items:  item.items || [],
                address: item.address || '',
                note:   item.note || '',
            }));
            setExportData(mappedData);
        } catch { console.warn('Lỗi kết nối API outbound-orders'); }
        finally   { setIsLoading(false); }
    };
 
    const fetchProducts = async () => {
        try {
            const res = await axiosClient.get('/api/products');
            setProductsFromSQL(res.data);
        } catch { console.warn('Lỗi kết nối API products'); }
    };
 
    useEffect(() => { fetchFromSQL(); fetchProducts(); }, []);
 
    const [formData, setFormData] = useState({
        voucherCode: '', invoice: '', receiver: '', warehouse: 'Kho Hà Nội',
        accountingDate: '', voucherDate: '', customer: '', address: '',
        salesperson: staffList[0], note: '',
    });
 
    const handleOpenCreate = () => {
        const today   = new Date();
        const dateStr = today.toISOString().split('T')[0];
        const ts      = today.getTime().toString().slice(-4);
        setFormData({ voucherCode: `XK${dateStr.replace(/-/g, '')}-${ts}`, invoice: `HD-${ts}`, receiver: '', warehouse: 'Kho Hà Nội', accountingDate: dateStr, voucherDate: dateStr, customer: '', address: '', salesperson: staffList[0], note: '' });
        setDetails([]);
        setIsCreateOpen(true);
    };
 
    const handleImportDetailsExcel = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const data      = new Uint8Array(event.target.result);
            const workbook  = XLSX.read(data, { type: 'array' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData  = XLSX.utils.sheet_to_json(worksheet);
            const importedDetails = jsonData.map((row, i) => ({
                id: Date.now() + i, productId: '', productName: row['Tên sản phẩm'] || '',
                unit: row['ĐVT'] || '', quantity: row['Số lượng'] || 1,
                price: row['Đơn giá'] || 0, total: (row['Số lượng'] || 1) * (row['Đơn giá'] || 0),
            }));
            setDetails(prev => [...prev, ...importedDetails]);
        };
        reader.readAsArrayBuffer(file);
    };
 
    const addRow = () => setDetails(prev => [...prev, { id: Date.now(), productId: '', productName: '', unit: '', quantity: 1, price: 0, total: 0 }]);
    const removeRow = (id) => setDetails(prev => prev.filter(r => r.id !== id));
    const handleProductSelect = (id, productId) => {
        const p = productsFromSQL.find(p => p.id == productId);
        setDetails(prev => prev.map(r => r.id === id ? { ...r, productId, productName: p?.name || '', unit: p?.baseUnit || '', price: 0, total: 0 } : r));
    };
    const updateQuantity = (id, qty) => {
        setDetails(prev => prev.map(r => r.id === id ? { ...r, quantity: parseFloat(qty) || 0, total: (parseFloat(qty) || 0) * r.price } : r));
    };
    const grandTotal = details.reduce((s, r) => s + r.total, 0);
 
    const handleSave = async () => {
        if (!formData.customer) { alert('Vui lòng nhập tên khách hàng!'); return; }
        const payload = {
            issueCode:  formData.voucherCode,
            customerId: 1,
            status:     'ALLOCATED',
            issueDate:  new Date().toISOString(),
            createdBy:  1,
        };
        try {
            await axiosClient.post('/api/outbound-orders', payload);
            alert('Lưu phiếu xuất thành công!');
            setIsCreateOpen(false);
            fetchFromSQL();
        } catch { alert('Lỗi khi lưu phiếu!'); }
    };
 
    // ── Phần JSX list + modal — giữ nguyên từ file gốc ──────
    const filteredData = exportData.filter(item => {
        if (filterCustomer !== 'Tất cả khách hàng' && item.client !== filterCustomer) return false;
        if (filterStaff    !== 'Tất cả nhân viên'  && item.staff  !== filterStaff)    return false;
        if (filterDate && item.time && !item.time.startsWith(filterDate)) return false;
        return true;
    });
 
    return (
        <div className="p-6 bg-gray-50 min-h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-800">Phiếu xuất kho</h1>
                <div className="flex gap-3">
                    <button onClick={handleOpenCreate} className="px-5 py-2.5 bg-[#1192a8] text-white rounded-xl font-bold text-sm hover:bg-teal-700 shadow-md transition">+ Lập phiếu xuất</button>
                    <button onClick={fetchFromSQL}     className="px-5 py-2.5 bg-white text-gray-600 rounded-xl font-bold text-sm border border-gray-200 hover:bg-gray-50 transition">↻ Làm mới</button>
                </div>
            </div>
            <div className="flex gap-3 mb-4 flex-wrap">
                <select value={filterCustomer} onChange={e => setFilterCustomer(e.target.value)} className="border border-gray-200 rounded-xl px-4 py-2 text-sm bg-white">
                    <option>Tất cả khách hàng</option>
                    {customerDatabase.map((c, i) => <option key={i}>{c.name}</option>)}
                </select>
                <select value={filterStaff} onChange={e => setFilterStaff(e.target.value)} className="border border-gray-200 rounded-xl px-4 py-2 text-sm bg-white">
                    <option>Tất cả nhân viên</option>
                    {staffList.map((s, i) => <option key={i}>{s}</option>)}
                </select>
                <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="border border-gray-200 rounded-xl px-4 py-2 text-sm bg-white" />
            </div>
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex-1">
                {isLoading ? (
                    <div className="flex items-center justify-center h-48 text-gray-400 text-sm animate-pulse">Đang tải...</div>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                            <tr>
                                <th className="px-6 py-4">Mã phiếu</th>
                                <th className="px-6 py-4">Khách hàng</th>
                                <th className="px-6 py-4">Nhân viên</th>
                                <th className="px-6 py-4">Ngày xuất</th>
                                <th className="px-6 py-4 text-right">Tổng tiền</th>
                                <th className="px-6 py-4 text-center">Trạng thái</th>
                                <th className="px-6 py-4 text-center">Chi tiết</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredData.length === 0 ? (
                                <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">Chưa có phiếu xuất nào</td></tr>
                            ) : filteredData.map(row => (
                                <tr key={row.id} onClick={() => setSelectedRowId(row.id === selectedRowId ? null : row.id)}
                                    className={`transition-colors cursor-pointer ${row.id === selectedRowId ? 'bg-teal-50 border-l-4 border-l-[#1192a8]' : 'hover:bg-blue-50/50'}`}>
                                    <td className="px-6 py-4 font-bold text-[#1192a8]">{row.code}</td>
                                    <td className="px-6 py-4 text-gray-700">{row.client}</td>
                                    <td className="px-6 py-4 text-gray-500 text-xs">{row.staff}</td>
                                    <td className="px-6 py-4 text-gray-500 text-xs">{row.time ? new Date(row.time).toLocaleDateString('vi-VN') : '—'}</td>
                                    <td className="px-6 py-4 text-right font-bold text-gray-700">{row.total?.toLocaleString()}đ</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${row.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                            {row.status === 'completed' ? 'Hoàn thành' : 'Đã hủy'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button onClick={e => { e.stopPropagation(); setViewingVoucher(row); setIsViewDetailOpen(true); }}
                                            className="text-xs font-bold text-[#1192a8] hover:underline">Xem</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
 
            {/* Modal tạo phiếu xuất */}
            {isCreateOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center backdrop-blur-sm p-2">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[95vh] overflow-hidden">
                        <div className="bg-[#1192a8] p-4 text-white flex justify-between items-center">
                            <h2 className="font-bold uppercase tracking-widest text-sm">Lập phiếu xuất kho</h2>
                            <button onClick={() => setIsCreateOpen(false)} className="text-xl hover:text-red-200">✕</button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1 space-y-4">
                            <div className="grid grid-cols-3 gap-4 text-sm">
                                {[
                                    { label: 'Mã phiếu', key: 'voucherCode' },
                                    { label: 'Số hóa đơn', key: 'invoice' },
                                    { label: 'Người nhận', key: 'receiver' },
                                    { label: 'Ngày hạch toán', key: 'accountingDate', type: 'date' },
                                    { label: 'Ngày phiếu', key: 'voucherDate', type: 'date' },
                                    { label: 'Khách hàng', key: 'customer' },
                                ].map(f => (
                                    <div key={f.key}>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">{f.label}</label>
                                        <input type={f.type || 'text'} value={formData[f.key]} onChange={e => setFormData(p => ({ ...p, [f.key]: e.target.value }))}
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:border-[#1192a8]" />
                                    </div>
                                ))}
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-xs font-black text-gray-400 uppercase">Danh sách hàng hóa</h3>
                                    <div className="flex gap-2">
                                        <label className="cursor-pointer px-3 py-1.5 border border-gray-200 rounded text-xs font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-1">
                                            <img src={excel1Icon} className="h-3 w-3" alt="" /> Nhập từ Excel
                                            <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImportDetailsExcel} />
                                        </label>
                                        <button onClick={addRow} className="bg-[#1192a8] text-white px-4 py-1.5 rounded text-xs font-bold hover:bg-teal-700 transition">+ Thêm mặt hàng</button>
                                    </div>
                                </div>
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead className="bg-gray-50 font-bold text-gray-500 uppercase text-[9px] border-b">
                                        <tr>
                                            <th className="px-4 py-2.5 border-r">Tên sản phẩm</th>
                                            <th className="px-4 py-2.5 border-r w-20 text-center">ĐVT</th>
                                            <th className="px-4 py-2.5 border-r w-24 text-center">Số lượng</th>
                                            <th className="px-4 py-2.5 border-r w-32 text-right">Đơn giá</th>
                                            <th className="px-4 py-2.5 w-32 text-right">Thành tiền</th>
                                            <th className="w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {details.map(row => (
                                            <tr key={row.id}>
                                                <td className="px-2 py-1 border-r">
                                                    <select value={row.productId} onChange={e => handleProductSelect(row.id, e.target.value)} className="w-full outline-none bg-transparent">
                                                        <option value="">-- Chọn mặt hàng từ SQL --</option>
                                                        {productsFromSQL.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                                                    </select>
                                                </td>
                                                <td className="px-2 py-1 border-r text-center text-gray-400">{row.unit}</td>
                                                <td className="px-2 py-1 border-r"><input type="number" value={row.quantity} onChange={e => updateQuantity(row.id, e.target.value)} className="w-full text-center outline-none focus:bg-cyan-50" /></td>
                                                <td className="px-2 py-1 border-r text-right">{row.price.toLocaleString()}đ</td>
                                                <td className="px-4 py-1 font-bold text-right">{row.total.toLocaleString()}đ</td>
                                                <td className="text-center"><button onClick={() => removeRow(row.id)} className="text-red-500 hover:scale-125 transition-transform"><img src={deleteIcon} alt="del" className="h-3 w-3" /></button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="bg-gray-50 px-6 py-3 border-t flex justify-end gap-10">
                                    <span className="font-bold text-gray-500 uppercase text-[10px] mt-1">Tổng cộng tiền hàng:</span>
                                    <span className="font-black text-[#1192a8] text-xl">{grandTotal.toLocaleString()} VNĐ</span>
                                </div>
                            </div>
                        </div>
                        <div className="px-5 py-4 border-t bg-white flex justify-end gap-3">
                            <button onClick={() => setIsCreateOpen(false)} className="px-8 py-2 bg-white border border-gray-300 text-gray-700 rounded text-sm font-bold hover:bg-gray-100 uppercase">Hủy bỏ</button>
                            <button onClick={handleSave} className="px-8 py-2 bg-[#1192a8] text-white rounded text-sm font-bold hover:bg-teal-700 uppercase">Lưu phiếu</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
 