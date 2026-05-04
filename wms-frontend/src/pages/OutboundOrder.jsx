// ================================================================
// 6. OutboundOrder.jsx — thay fetch → axiosClient
// ================================================================
import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { ActionButton } from '../components/common/SharedUI';
import VoucherContextMenu from '../components/modals/VoucherContextMenu';
import axiosClient from '../api/axiosClient';
import addIcon from '../components/common/icons/add.png';
import infoIcon from '../components/common/icons/info.png';
import deleteIcon from '../components/common/icons/delete.png';
import excelIcon  from '../components/common/icons/excel.png';
import excel1Icon from '../components/common/icons/excel1.png';
import fixIcon    from '../components/common/icons/fix.png';

const createEmptyDetail = () => ({ id: Date.now(), productId: '', productName: '', unit: '-', quantity: 1, price: 0, total: 0 });

export default function ExportReceipts({ workflow, clearWorkflow }) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isViewDetailOpen, setIsViewDetailOpen] = useState(false);
    const [viewingVoucher, setViewingVoucher] = useState(null);
    const [details, setDetails] = useState([]);
    const [exportData, setExportData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedRowId, setSelectedRowId] = useState(null);
    const [contextMenu, setContextMenu] = useState(null);
    
    // States cho bộ lọc
    const [filterStaff, setFilterStaff] = useState("Tất cả nhân viên");
    const [filterDate, setFilterDate] = useState("");
    const [filterCustomer, setFilterCustomer] = useState("Tất cả khách hàng");

    // Dữ liệu danh mục từ backend
    const [productsFromSQL, setProductsFromSQL] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [staffs, setStaffs] = useState([]);

    const fetchFromSQL = async () => {
        setIsLoading(true);
        try {
            const response = await axiosClient.get("/api/outbound-orders");
            const data = response.data;
            const mappedData = data.map(item => {
                const customerName = item.customerId
                    ? customers.find(customer => customer.id === item.customerId)?.name || "Chưa rõ khách hàng"
                    : "Chưa rõ khách hàng";
                const staffName = item.createdBy
                    ? staffs.find(staff => staff.id === item.createdBy)?.fullName || "Nhân viên hệ thống"
                    : "Nhân viên hệ thống";

                return {
                    ...item,
                    id: item.id,
                    code: item.issueCode,
                    time: item.issueDate,
                    client: customerName,
                    staff: staffName,
                    total: item.totalAmount || 0,
                    status: item.status === 'ALLOCATED' ? 'completed' : 'cancelled',
                    items: item.items || [],
                    address: item.address || "",
                    note: item.note || ""
                };
            });
            setExportData(mappedData);
        } catch (error) {
            console.warn("Lỗi kết nối API outbound-orders", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await axiosClient.get('/api/products');
            setProductsFromSQL(res.data);
        } catch { 
            console.warn('Lỗi kết nối API products'); 
        }
    };

    const fetchCustomers = async () => {
        try {
            const res = await axiosClient.get("/api/customers");
            setCustomers(res.data);
        } catch (error) {
            console.warn("Lỗi kết nối API customers");
        }
    };

    const fetchStaffs = async () => {
        try {
            const res = await axiosClient.get("/api/staff");
            setStaffs(res.data);
        } catch (error) {
            console.warn("Lỗi kết nối API staff");
        }
    };

    const closeContextMenu = () => setContextMenu(null);

    useEffect(() => {
        fetchFromSQL();
        fetchProducts();
        fetchCustomers();
        fetchStaffs();
    }, []);

    // Cập nhật lại tên KH và Staff khi danh mục tải xong
    useEffect(() => {
        if (!customers.length || !exportData.length) return;
        setExportData(prev => prev.map(item => ({
            ...item,
            client: item.customerId
                ? customers.find(customer => customer.id === item.customerId)?.name || item.client
                : item.client
        })));
    }, [customers]);

    useEffect(() => {
        if (!staffs.length || !exportData.length) return;
        setExportData(prev => prev.map(item => ({
            ...item,
            staff: item.createdBy
                ? staffs.find(staff => staff.id === item.createdBy)?.fullName || item.staff
                : item.staff
        })));
    }, [staffs]);

    // Lắng nghe workflow từ các màn hình khác chuyển sang
    useEffect(() => {
        if (workflow?.kind !== 'outbound') {
            return;
        }

        const nextDetails = workflow.products?.length ? workflow.products.map((product, index) => ({
            id: Date.now() + index,
            productId: product.id,
            productName: product.name || '',
            unit: product.baseUnit || '-',
            quantity: 1,
            price: product.price || 0,
            total: product.price || 0
        })) : [];

        handleOpenCreate({
            seedDetails: nextDetails,
            customer: workflow.customer || null,
            staff: workflow.staff || null
        });
        clearWorkflow?.();
    }, [workflow, clearWorkflow]);

    const [formData, setFormData] = useState({
        voucherCode: '',
        invoice: '',
        receiver: '',
        warehouse: 'Kho Hà Nội',
        accountingDate: '',
        voucherDate: '',
        customerId: '',
        customer: '',
        address: '',
        staffId: '',
        salesperson: '',
        note: ''
    });

    const handleOpenCreate = ({ seedDetails = [], customer = null, staff = null } = {}) => {
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];
        const timeStamp = today.getTime().toString().slice(-4);

        setFormData({
            voucherCode: `XK${dateStr.replace(/-/g, '')}-${timeStamp}`,
            invoice: `HD-${timeStamp}`,
            receiver: '',
            warehouse: 'Kho Hà Nội',
            accountingDate: dateStr,
            voucherDate: dateStr,
            customerId: customer?.id || '',
            customer: customer?.name || '',
            address: customer?.address || '',
            staffId: staff?.id || '',
            salesperson: staff?.fullName || '',
            note: ''
        });
        setDetails(seedDetails.length > 0 ? seedDetails : []);
        setIsCreateOpen(true);
    };

    const handleImportDetailsExcel = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            const importedDetails = jsonData.map((row, index) => {
                const excelName = row["Tên sản phẩm"] ? String(row["Tên sản phẩm"]).trim() : "";
                const product = productsFromSQL.find(p => p.name.trim() === excelName);
                const quantity = parseInt(row["Số lượng"]) || 0;
                const price = parseInt(row["Đơn giá"]) || (product ? product.price || 0 : 0);

                return {
                    id: Date.now() + index,
                    productId: product ? product.id : `NEW_${index}_${Date.now()}`,
                    productName: excelName,
                    unit: row["ĐVT"] || (product ? product.baseUnit : '-'),
                    quantity: quantity, price: price, total: quantity * price
                };
            });

            setDetails([...details, ...importedDetails]);
            e.target.value = null;
        };
        reader.readAsArrayBuffer(file);
    };

    const handleCancelVoucher = () => {
        if (!selectedRowId) return alert("Vui lòng click chọn một phiếu trong bảng trước khi hủy!");
        if (window.confirm("Bạn có chắc chắn muốn hủy phiếu này không?")) {
            setExportData(exportData.map(item =>
                item.id === selectedRowId ? { ...item, status: 'cancelled' } : item
            ));
            setSelectedRowId(null);
        }
    };

    const handleCustomerInputChange = (e) => {
        const value = e.target.value;
        const foundCustomer = customers.find(c => c.name === value);
        setFormData({
            ...formData,
            customer: value,
            customerId: foundCustomer?.id || '',
            address: foundCustomer ? foundCustomer.address : formData.address
        });
    };

    const handleStaffInputChange = (e) => {
        const value = e.target.value;
        const foundStaff = staffs.find(s => s.fullName === value);
        setFormData({
            ...formData,
            salesperson: value,
            staffId: foundStaff?.id || ''
        });
    };

    const handleProductSelect = (rowId, productId) => {
        const item = productsFromSQL.find(p => p.id == productId);
        if (item) {
            setDetails(details.map(row => row.id === rowId ? {
                ...row, productId: item.id, productName: item.name, unit: item.baseUnit,
                price: item.price || 0, total: (item.price || 0) * row.quantity
            } : row));
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const addRow = () => {
        setDetails([...details, createEmptyDetail()]);
    };

    const updateQuantity = (rowId, qty) => {
        const quantity = parseInt(qty) || 0;
        setDetails(details.map(row => row.id === rowId ? { ...row, quantity: quantity, total: row.price * quantity } : row));
    };

    const removeRow = (id) => setDetails(details.filter(row => row.id !== id));
    const grandTotal = details.reduce((sum, row) => sum + row.total, 0);

    const handleSave = async () => {
        if (!formData.customer) return alert("Vui lòng nhập tên khách hàng!");
        if (details.length === 0) return alert("Vui lòng thêm ít nhất 1 mặt hàng!");

        const dateToSave = formData.voucherDate ? `${formData.voucherDate}T00:00:00` : null;
        const foundCustomer = customers.find(c => c.name === formData.customer);
        const customerIdToSend = formData.customerId || foundCustomer?.id || 1;
        const foundStaff = staffs.find(s => s.fullName === formData.salesperson);
        const staffIdToSend = formData.staffId || foundStaff?.id || 1;

        // Cập nhật giao diện ngay lập tức
        const newVoucherUI = {
            id: Date.now(),
            code: formData.voucherCode,
            time: formData.voucherDate,
            client: formData.customer,
            staff: formData.salesperson,
            total: grandTotal,
            status: 'completed',
            items: [...details],
            address: formData.address,
            note: formData.note
        };

        setExportData([newVoucherUI, ...exportData]);
        setIsCreateOpen(false);

        const dataForJava = {
            issueCode: formData.voucherCode,
            issueDate: dateToSave,
            customerId: customerIdToSend,
            createdBy: staffIdToSend,
            status: 'ALLOCATED',
            note: formData.note,
            totalAmount: grandTotal,
            items: details.map(d => ({
                productId: d.productId,
                quantity: d.quantity,
                price: d.price
            }))
        };

        try {
            await axiosClient.post("/api/outbound-orders", dataForJava);
        } catch (error) {
            console.warn("Lỗi khi lưu phiếu xuất:", error);
        }
    };

    const handleViewDetail = () => {
        if (!selectedRowId) return alert("Vui lòng click chọn một phiếu trong bảng trước!");
        const voucher = exportData.find(item => item.id === selectedRowId);
        if (voucher) {
            setViewingVoucher(voucher);
            setIsViewDetailOpen(true);
        }
    };

    const handleOpenSelectedDetail = () => {
        handleViewDetail();
    };

    const handleCreateNew = () => {
        handleOpenCreate();
    };

    const handleRefresh = () => {
        fetchFromSQL();
        fetchCustomers();
        fetchStaffs();
    };

    const handleRowContextMenu = (event, item) => {
        event.preventDefault();
        event.stopPropagation();

        const menuWidth = 256;
        const menuHeight = 220;
        const x = Math.min(event.clientX, window.innerWidth - menuWidth - 12);
        const openAbove = event.clientY + menuHeight > window.innerHeight;
        const rawY = openAbove ? event.clientY - menuHeight - 12 : event.clientY;
        const y = Math.max(12, Math.min(rawY, window.innerHeight - menuHeight - 12));

        if (selectedRowId !== item.id) {
            setSelectedRowId(item.id);
        }

        setContextMenu({
            x: Math.max(12, x),
            y: Math.max(12, y),
            item
        });
    };

    const handleExportExcel = () => {
        if (exportData.length === 0) return alert("Không có dữ liệu để xuất!");
        const dataToExport = filteredData.map((item, index) => ({
            "STT": index + 1, "Số chứng từ": item.code, "Ngày chứng từ": item.time,
            "Khách hàng": item.client, "Địa chỉ": item.address || "", "Nhân viên xuất": item.staff,
            "Tổng tiền": item.total, "Trạng thái": item.status === 'cancelled' ? "Đã hủy" : "Hoàn thành", "Ghi chú": item.note || ""
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wscols = [ { wch: 5 }, { wch: 20 }, { wch: 15 }, { wch: 30 }, { wch: 30 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 20 } ];
        ws['!cols'] = wscols;
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "DanhSachPhieuXuat");
        XLSX.writeFile(wb, `PhieuXuatKho_${new Date().toISOString().slice(0,10)}.xlsx`);
    };

    const toolbarActions = [
        { label: 'Thêm', iconSrc: addIcon, onClick: handleCreateNew },
        { label: 'Chi tiết', iconSrc: infoIcon, onClick: handleOpenSelectedDetail },
        { label: 'Hủy phiếu', iconSrc: deleteIcon, onClick: handleCancelVoucher },
        { label: 'Xuất Excel', iconSrc: excelIcon, onClick: handleExportExcel },
        { label: 'Làm mới', iconSrc: excel1Icon, onClick: handleRefresh },
    ];

    const filteredData = exportData.filter(item => {
        const matchCustomer = !filterCustomer || filterCustomer === "Tất cả khách hàng" || (item.client && item.client.toLowerCase().includes(filterCustomer.toLowerCase()));
        const matchStaff = !filterStaff || filterStaff === "Tất cả nhân viên" || (item.staff && item.staff.toLowerCase().includes(filterStaff.toLowerCase()));
        const matchDate = !filterDate || item.time === filterDate || (item.time && item.time.startsWith(filterDate));
        return matchCustomer && matchStaff && matchDate;
    });

    return (
        <div className="p-6 bg-[#f8f9fa] min-h-full flex flex-col text-left font-sans text-gray-800">
            <div className="flex items-center justify-between bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-6">
                <div className="flex gap-8">
                    {toolbarActions.map((action, index) => (
                        <ActionButton key={index} {...action} />
                    ))}
                </div>
                <div className="text-sm font-bold text-gray-700">Quản lý phiếu xuất</div>
            </div>

            <div className="flex gap-6 mt-6 flex-1 overflow-hidden">
                <div className="w-64 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-fit text-xs shrink-0 text-left">
                    <div className="flex items-center gap-2 mb-6 text-[#1192a8]">
                        <span className="text-xl">🔍</span>
                        <h2 className="font-bold uppercase tracking-wider text-sm">Bộ lọc tìm kiếm</h2>
                    </div>

                    <div className="space-y-6">
                        <div className="flex flex-col gap-1.5 text-left">
                            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">KHÁCH HÀNG</label>
                            <select
                                value={filterCustomer}
                                onChange={(e) => setFilterCustomer(e.target.value)}
                                className="border border-[#1192a8] rounded-2xl px-4 py-2 text-[11px] outline-none focus:ring-1 focus:ring-[#1192a8] bg-white text-gray-600 w-full shadow-sm"
                            >
                                <option value="Tất cả khách hàng">Tất cả khách hàng</option>
                                {customers.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                            </select>
                        </div>

                        <div className="flex flex-col gap-1.5 text-left">
                            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">NHÂN VIÊN XUẤT</label>
                            <select
                                value={filterStaff}
                                onChange={(e) => setFilterStaff(e.target.value)}
                                className="border border-[#1192a8] rounded-2xl px-4 py-2 text-[11px] outline-none focus:ring-1 focus:ring-[#1192a8] bg-white text-gray-600 w-full shadow-sm"
                            >
                                <option value="Tất cả nhân viên">Tất cả nhân viên</option>
                                {staffs.map(s => <option key={s.id} value={s.fullName}>{s.fullName}</option>)}
                            </select>
                        </div>

                        <div className="flex flex-col gap-2 text-left">
                            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Ngày chứng từ</label>
                            <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="border border-[#1192a8] rounded-2xl px-4 py-2 text-[11px] outline-none focus:ring-1 focus:ring-[#1192a8]" />
                        </div>
                    </div>

                    <button onClick={() => { setFilterCustomer("Tất cả khách hàng"); setFilterStaff("Tất cả nhân viên"); setFilterDate(""); }} className="w-full mt-8 py-3 border border-dashed border-[#1192a8] text-[#1192a8] rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-cyan-50 transition-all shadow-sm">
                        Làm mới bộ lọc
                    </button>
                </div>

                <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-x-auto overflow-y-hidden">
                    <table className="w-full text-left table-auto min-w-[1000px]">
                        <thead className="bg-[#fcfcfc] border-b text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                        <tr>
                            <th className="px-6 py-4 text-center w-16">STT</th>
                            <th className="px-4 py-4 w-40">Số CT</th>
                            <th className="px-4 py-4 w-32">Ngày CT</th>
                            <th className="px-6 py-4">Khách Hàng</th>
                            <th className="px-6 py-4 w-48">Nhân viên xuất</th>
                            <th className="px-4 py-4 text-right w-40">Tổng tiền</th>
                            <th className="px-6 py-4 text-center w-32">Trạng thái</th>
                        </tr>
                        </thead>
                        <tbody className="text-sm">
                        {isLoading ? (
                            <tr><td colSpan="7" className="py-20 text-center text-[#1192a8] font-bold animate-pulse">ĐANG KẾT NỐI SERVER DỮ LIỆU...</td></tr>
                        ) : filteredData.length > 0 ? filteredData.map((item, index) => (
                        <tr
                            key={item.id}
                            onClick={() => setSelectedRowId(selectedRowId === item.id ? null : item.id)}
                            onDoubleClick={() => {
                                setSelectedRowId(item.id);
                                const voucher = exportData.find(row => row.id === item.id);
                                if (voucher) {
                                    setViewingVoucher(voucher);
                                    setIsViewDetailOpen(true);
                                }
                            }}
                            onContextMenu={(e) => handleRowContextMenu(e, item)}
                            className={`transition-all cursor-pointer border-b border-gray-50 ${
                                selectedRowId === item.id ? 'bg-cyan-100 shadow-inner' : 'bg-white hover:bg-slate-50'
                            }`}
                        >
                                <td className="px-6 py-5 text-center text-gray-400 font-bold">{index + 1}</td>
                                <td className="px-4 py-5 font-bold text-[#1192a8] uppercase truncate tracking-wider">{item.code}</td>
                                <td className="px-4 py-5 text-gray-600 font-medium">{item.time ? new Date(item.time).toLocaleDateString('vi-VN') : '---'}</td>
                                <td className="px-6 py-5 font-bold text-gray-700">{item.client}</td>
                                <td className="px-6 py-5 text-gray-600">{item.staff}</td>
                                <td className="px-4 py-5 text-right font-black text-[#1192a8] text-base">{item.total.toLocaleString()}đ</td>
                                <td className="px-6 py-5 text-center">
                                    {item.status === 'cancelled' ? (
                                        <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-sm whitespace-nowrap">● Đã hủy</span>
                                    ) : (
                                        <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-sm whitespace-nowrap">● Đã thêm</span>
                                    )}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="7" className="py-28 text-center text-gray-300 italic">
                                    <div className="flex flex-col items-center gap-3">
                                        <span className="text-5xl opacity-20">📄</span>
                                        <p className="text-gray-400">Chưa có dữ liệu phiếu xuất kho.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal tạo phiếu xuất */}
            {isCreateOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center backdrop-blur-sm p-2">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[95vh] overflow-hidden">
                        <div className="bg-[#1192a8] p-4 text-white flex justify-between items-center">
                            <h2 className="font-bold uppercase tracking-widest text-sm">Lập phiếu xuất kho</h2>
                            <button onClick={() => setIsCreateOpen(false)} className="text-xl hover:text-red-200">✕</button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 space-y-6">
                            <div className="border border-[#1192a8] rounded-sm overflow-hidden">
                                <div className="bg-[#1192a8] text-white px-3 py-1.5 text-xs font-bold uppercase flex items-center gap-2">
                                    <img src={addIcon} alt="add" className="h-3 w-3 brightness-0 invert" />
                                    Thông tin chung
                                </div>
                                <div className="p-5 grid grid-cols-2 gap-x-10 gap-y-4">
                                    <div className="space-y-4">
                                        <div className="flex flex-col gap-1 text-left">
                                            <label className="text-xs text-gray-500 font-semibold">Số chứng từ</label>
                                            <input type="text" name="voucherCode" value={formData.voucherCode} onChange={handleFormChange} className="w-full border border-gray-300 rounded-sm px-2.5 py-1.5 text-sm outline-none focus:border-[#1192a8]" />
                                        </div>
                                        <div className="flex flex-col gap-1 text-left">
                                            <label className="text-xs text-gray-500 font-semibold">Hóa đơn</label>
                                            <input type="text" name="invoice" value={formData.invoice} onChange={handleFormChange} className="w-full border border-gray-300 rounded-sm px-2.5 py-1.5 text-sm outline-none" />
                                        </div>
                                        <div className="flex flex-col gap-1 text-left">
                                            <label className="text-xs text-gray-500 font-semibold">Tên khách hàng</label>
                                                <input list="customer-list" value={formData.customer} onChange={handleCustomerInputChange} className="w-full border border-gray-300 rounded-sm px-2.5 py-1.5 text-sm outline-none focus:border-[#1192a8]" />
                                            <datalist id="customer-list">
                                                {customers.map(c => <option key={c.id} value={c.name} />)}
                                            </datalist>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-1 text-left">
                                                <label className="text-xs text-gray-500 font-semibold">* Ngày chứng từ</label>
                                                <input type="date" name="voucherDate" value={formData.voucherDate} onChange={handleFormChange} className="w-full border border-gray-300 rounded-sm px-2.5 py-1.5 text-sm outline-none" />
                                            </div>
                                            <div className="flex flex-col gap-1 text-left">
                                                <label className="text-xs text-gray-500 font-semibold">Nhân viên xuất</label>
                                                <input
                                                    list="staff-list"
                                                    name="salesperson"
                                                    value={formData.salesperson}
                                                    onChange={handleStaffInputChange}
                                                    className="w-full border border-gray-300 rounded-sm px-2 py-1.5 text-sm outline-none focus:border-[#1192a8]"
                                                />
                                                <datalist id="staff-list">
                                                    {staffs.map(s => <option key={s.id} value={s.fullName} />)}
                                                </datalist>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1 text-left">
                                            <label className="text-xs text-gray-500 font-semibold">Địa chỉ</label>
                                            <input type="text" name="address" value={formData.address} onChange={handleFormChange} className="w-full border border-gray-300 rounded-sm px-2.5 py-1.5 text-sm outline-none" />
                                        </div>
                                        <div className="flex flex-col gap-1 text-left pt-1">
                                            <label className="text-xs text-gray-500 font-semibold">Ghi chú</label>
                                            <textarea name="note" value={formData.note} onChange={handleFormChange} rows="1" className="w-full border border-gray-300 rounded-sm px-2.5 py-1.5 text-sm outline-none focus:border-[#1192a8]"></textarea>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-xs font-black text-gray-400 uppercase">Danh sách hàng hóa</h3>
                                    <div className="flex gap-2">
                                        <label className="bg-white border border-green-600 text-green-600 px-3 py-1.5 rounded-sm text-[10px] font-bold hover:bg-green-50 cursor-pointer flex items-center gap-1 uppercase">
                                            <img src={excel1Icon} className="h-3 w-3" alt="" /> Nhập từ Excel
                                            <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleImportDetailsExcel} />
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
                                                <td className="px-2 py-1 border-r text-left">
                                                    <select value={row.productId} onChange={(e) => handleProductSelect(row.id, e.target.value)} className="w-full outline-none bg-transparent text-left">
                                                        <option value="">-- Chọn mặt hàng từ SQL --</option>
                                                        {productsFromSQL.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                                                    </select>
                                                </td>
                                                <td className="px-2 py-1 border-r text-center text-gray-400">{row.unit}</td>
                                                <td className="px-2 py-1 border-r"><input type="number" value={row.quantity} onChange={e => updateQuantity(row.id, e.target.value)} className="w-full text-center outline-none focus:bg-cyan-50" /></td>
                                                <td className="px-2 py-1 border-r text-right">{row.price.toLocaleString()}đ</td>
                                                <td className="px-4 py-1 font-bold text-right text-gray-700">{row.total.toLocaleString()}đ</td>
                                                <td className="text-center">
                                                    <button onClick={() => removeRow(row.id)} className="text-red-500 font-bold hover:scale-125 transition-transform"><img src={deleteIcon} alt="del" className="h-3 w-3" /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-end gap-10">
                                <span className="font-bold text-gray-500 uppercase text-[10px] mt-1">Tổng cộng tiền hàng:</span>
                                <span className="font-black text-[#1192a8] text-xl">{grandTotal.toLocaleString()} VNĐ</span>
                            </div>
                        </div>

                        <div className="px-5 py-4 border-t border-gray-200 bg-white flex justify-end gap-3">
                            <button onClick={() => setIsCreateOpen(false)} className="px-8 py-2 bg-white border border-gray-300 text-gray-700 rounded-sm text-sm font-bold hover:bg-gray-100 uppercase transition-colors">Hủy bỏ</button>
                            <button onClick={handleSave} className="px-8 py-2 bg-[#1192a8] text-white rounded-sm text-sm font-bold shadow-md hover:bg-[#0e7a8c] uppercase transition-colors">Lưu phiếu</button>
                        </div>
                    </div>
                </div>
            )}

            {isViewDetailOpen && viewingVoucher && (
                <div className="fixed inset-0 bg-black/60 z-[60] flex justify-center items-center backdrop-blur-sm p-4 text-left">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[800px] overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="bg-[#1192a8] p-4 text-white flex justify-between items-center">
                            <h2 className="font-bold uppercase tracking-widest text-sm">Chi tiết chứng từ: {viewingVoucher.code}</h2>
                            <button onClick={() => setIsViewDetailOpen(false)} className="text-xl hover:text-red-200">✕</button>
                        </div>
                        <div className="p-8 overflow-y-auto space-y-8">
                            <div className="grid grid-cols-2 gap-10 text-sm border-b pb-6">
                                <div className="space-y-2">
                                    <p><span className="text-gray-400 font-bold uppercase text-[10px]">Khách hàng:</span> <br/><span className="text-base font-bold text-gray-800">{viewingVoucher.client}</span></p>
                                    <p><span className="text-gray-400 font-bold uppercase text-[10px]">Địa chỉ:</span> <br/><span className="text-gray-600">{viewingVoucher.address || '---'}</span></p>
                                </div>
                                <div className="space-y-2">
                                    <p><span className="text-gray-400 font-bold uppercase text-[10px]">Ngày xuất:</span> <br/><span className="font-bold text-gray-800">{viewingVoucher.time ? new Date(viewingVoucher.time).toLocaleDateString('vi-VN') : '---'}</span></p>
                                    <p><span className="text-gray-400 font-bold uppercase text-[10px]">Người lập:</span> <br/><span className="font-bold text-gray-800">{viewingVoucher.staff}</span></p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Danh sách hàng hóa</h3>
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 text-gray-500 text-[10px] uppercase font-bold text-left">
                                    <tr>
                                        <th className="p-3">Sản phẩm</th>
                                        <th className="p-3 text-center">ĐVT</th>
                                        <th className="p-3 text-center">SL</th>
                                        <th className="p-3 text-right">Đơn giá</th>
                                        <th className="p-3 text-right">Thành tiền</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                    {viewingVoucher.items?.map((row, i) => (
                                        <tr key={i} className="text-gray-700">
                                            <td className="p-3 font-bold">{row.productName}</td>
                                            <td className="p-3 text-center text-gray-500">{row.unit || '-'}</td>
                                            <td className="p-3 text-center font-bold">{row.quantity}</td>
                                            <td className="p-3 text-right">{row.price ? row.price.toLocaleString() : '0'}đ</td>
                                            <td className="p-3 text-right font-black text-[#1192a8]">{row.total ? row.total.toLocaleString() : '0'}đ</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex justify-between items-end pt-6 border-t">
                                <div className="text-left text-xs italic text-gray-400">Ghi chú: {viewingVoucher.note || '---'}</div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Tổng cộng thanh toán</p>
                                    <p className="text-3xl font-black text-[#1192a8]">{viewingVoucher.total ? viewingVoucher.total.toLocaleString() : '0'} VNĐ</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <VoucherContextMenu
                isOpen={!!contextMenu}
                x={contextMenu?.x || 0}
                y={contextMenu?.y || 0}
                title="Tác vụ phiếu xuất"
                subtitle={contextMenu?.item?.code || ''}
                actions={[
                    { label: 'Chi tiết', onClick: () => { closeContextMenu(); handleViewDetail(); } },
                    { label: 'Tạo mới', onClick: () => { closeContextMenu(); handleCreateNew(); } },
                    { label: 'Hủy phiếu', danger: true, onClick: () => { closeContextMenu(); handleCancelVoucher(); } },
                    { label: 'Xuất Excel', onClick: () => { closeContextMenu(); handleExportExcel(); } },
                    { label: 'Làm mới', onClick: () => { closeContextMenu(); handleRefresh(); } }
                ]}
                onClose={closeContextMenu}
            />
        </div>
    );
}