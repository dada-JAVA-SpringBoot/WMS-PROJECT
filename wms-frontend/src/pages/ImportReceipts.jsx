// ================================================================
// 5. ImportReceipts.jsx — thay fetch → axiosClient
// ================================================================
import React, { useState, useEffect } from 'react';
import { ActionButton } from '../components/common/SharedUI';
import VoucherContextMenu from '../components/modals/VoucherContextMenu';
import axiosClient from '../api/axiosClient';
import addIcon from '../components/common/icons/add.png';
import infoIcon from '../components/common/icons/info.png';
import excelIcon from '../components/common/icons/excel.png';
import excel1Icon from '../components/common/icons/excel1.png';

const createEmptyLineItem = () => ({
    productId: "",
    batchId: "",
    locationId: "",
    qtyExpected: 1,
    qtyReceived: 1,
    price: 0,
    condition: "Bình thường"
});

const createEmptyBatchDraft = () => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    productId: "",
    batchCode: "",
    manufactureDate: "",
    expiryDate: ""
});

const STORAGE_TYPE_LABELS = {
    NORMAL: 'Bình thường',
    COLD: 'Kho lạnh',
    CHILLED: 'Kho mát',
    FROZEN: 'Kho đông',
    BULK: 'Kho bulk',
    QUARANTINE: 'Cách ly'
};

const inboundStatusOptions = [
    { value: 'DRAFT', label: 'Nháp' },
    { value: 'ORDERED', label: 'Đã đặt' },
    { value: 'IN_TRANSIT', label: 'Đang vận chuyển' },
    { value: 'COMPLETED', label: 'Đã nhập' },
    { value: 'CANCELED', label: 'Đã hủy' }
];

export default function ImportReceiptsPage({ workflow, clearWorkflow }) {
    // Quản lý state danh sách
    const [receipts, setReceipts] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const [selectedReceiptId, setSelectedReceiptId] = useState(null);
    const [detailItems, setDetailItems] = useState([]); 
    const [contextMenu, setContextMenu] = useState(null);
    
    // Quản lý state bộ lọc
    const [filterType, setFilterType] = useState('Tất cả');
    const [filterKeyword, setFilterKeyword] = useState('');
    const [filterSupplier, setFilterSupplier] = useState('Tất cả nhà cung cấp');
    const [filterStaff, setFilterStaff] = useState('ALL');
    const [filterDate, setFilterDate] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');

    // State danh mục từ DB
    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);
    const [batches, setBatches] = useState([]);
    const [locations, setLocations] = useState([]);
    const [staffs, setStaffs] = useState([]);

    // Dữ liệu tạo phiếu mới
    const [supplierId, setSupplierId] = useState("");
    const [createdById, setCreatedById] = useState("");
    const [referenceNumber, setReferenceNumber] = useState("");
    const [receiptStatus, setReceiptStatus] = useState("DRAFT");
    const [notes, setNotes] = useState("");
    const [newItems, setNewItems] = useState([createEmptyLineItem()]);
    const [newBatchDrafts, setNewBatchDrafts] = useState([createEmptyBatchDraft()]);

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (!createdById && staffs.length > 0) {
            setCreatedById(String(staffs[0].id));
        }
    }, [staffs, createdById]);

    // Lắng nghe tín hiệu workflow (Tạo phiếu nhập từ màn hình khác)
    useEffect(() => {
        if (workflow?.kind !== 'inbound') {
            return;
        }

        setShowCreateModal(true);
        setSupplierId(workflow.supplier?.id ? String(workflow.supplier.id) : "");
        setCreatedById(workflow.staff?.id ? String(workflow.staff.id) : "");
        setReferenceNumber("");
        setReceiptStatus("DRAFT");
        setNotes("");
        setNewItems(
            workflow.products?.length
                ? workflow.products.map((product) => ({
                    ...createEmptyLineItem(),
                    productId: String(product.id || "")
                }))
                : [createEmptyLineItem()]
        );
        setNewBatchDrafts([createEmptyBatchDraft()]);
        clearWorkflow?.();
    }, [workflow, clearWorkflow]);

    // Dùng Promise.all với axiosClient để tải dữ liệu song song
    const fetchInitialData = async () => {
        try {
            const [resInbound, resSup, resPro, resBat, resLoc, resStaff] = await Promise.all([
                axiosClient.get('/api/inbound'),
                axiosClient.get('/api/suppliers'),
                axiosClient.get('/api/products/details'),
                axiosClient.get('/api/batches'),
                axiosClient.get('/api/locations'),
                axiosClient.get('/api/staff')
            ]);

            setReceipts(resInbound.data);
            setSuppliers(resSup.data);
            setProducts(resPro.data);
            setBatches(resBat.data);
            setLocations(resLoc.data);
            setStaffs(resStaff.data);
        } catch (error) {
            console.error('Lỗi tải dữ liệu:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchReceipts = async () => {
        try {
            const res = await axiosClient.get('/api/inbound');
            setReceipts(res.data);
        } catch (error) {
            console.error("Lỗi khi làm mới phiếu nhập", error);
        }
    };

    const closeContextMenu = () => setContextMenu(null);

    const handleViewDetail = async (receipt) => {
        setSelectedReceipt(receipt);
        try {
            const res = await axiosClient.get(`/api/inbound/${receipt.id}/details`);
            setDetailItems(res.data);
            setIsDetailModalOpen(true);
        } catch { 
            alert('Không thấy chi tiết hàng'); 
        }
    };

    const calculateTotal = () => newItems.reduce((sum, item) => sum + (parseFloat(item.qtyReceived) || 0) * (parseFloat(item.price) || 0), 0);

    const handleSaveReceipt = async () => {
        if (!supplierId || !createdById || newItems.some(item => !item.productId || !item.batchId || !item.locationId)) {
            alert("Vui lòng chọn đủ thông tin bắt buộc (Nhà cung cấp, Nhân viên, Sản phẩm, Lô, Vị trí)");
            return;
        }
        
        const payload = {
            order: {
                receiptCode: 'PN-' + Date.now(),
                supplierId: parseInt(supplierId),
                referenceNumber,
                notes,
                totalAmount: calculateTotal(),
                status: receiptStatus,
                receiptDate: new Date().toISOString(),
                createdBy: parseInt(createdById || workflow?.staff?.id || 1)
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
            alert('Lưu phiếu nhập thành công');
            setShowCreateModal(false);
            fetchReceipts();
            resetForm();
        } catch { 
            alert('Lỗi kết nối Server khi lưu phiếu'); 
        }
    };

    // Xuất Excel an toàn qua Blob (kèm Token bảo mật)
    const handleExportExcel = () => {
        axiosClient.get('/api/inbound/export', { responseType: 'blob' })
            .then(res => {
                const url = window.URL.createObjectURL(new Blob([res.data]));
                const a   = document.createElement('a');
                a.href = url; 
                a.download = `Danh_sach_phieu_nhap_${new Date().toISOString().slice(0, 10)}.xlsx`; 
                a.click();
                window.URL.revokeObjectURL(url);
            })
            .catch(() => alert('Xuất Excel thất bại'));
    };

    // --- LOGIC LÔ HÀNG NHÁP ---
    const addBatchDraft = () => setNewBatchDrafts([...newBatchDrafts, createEmptyBatchDraft()]);
    const updateBatchDraft = (index, field, value) => {
        const updated = [...newBatchDrafts];
        updated[index][field] = value;
        setNewBatchDrafts(updated);
    };
    const removeBatchDraft = (index) => {
        if (newBatchDrafts.length > 1) {
            setNewBatchDrafts(newBatchDrafts.filter((_, i) => i !== index));
        } else {
            setNewBatchDrafts([createEmptyBatchDraft()]);
        }
    };
    
    const saveBatchDrafts = async () => {
        const batchesToCreate = newBatchDrafts.filter(batch => batch.productId && batch.batchCode && batch.expiryDate);
        if (!batchesToCreate.length) {
            alert("Vui lòng nhập đầy đủ thông tin cho ít nhất một lô (Sản phẩm, Mã lô, Hạn dùng).");
            return;
        }

        try {
            for (const batch of batchesToCreate) {
                await axiosClient.post('/api/batches', {
                    productId: parseInt(batch.productId),
                    batchCode: batch.batchCode,
                    manufactureDate: batch.manufactureDate || null,
                    expiryDate: batch.expiryDate
                });
            }
            setNewBatchDrafts([createEmptyBatchDraft()]);
            await fetchInitialData(); // Reload lại danh mục lô
            alert("Đã thêm lô mới thành công.");
        } catch (error) {
            alert("Không thể lưu lô mới. Vui lòng kiểm tra lại mã lô có bị trùng không.");
        }
    };

    // --- LOGIC DÒNG CHI TIẾT ---
    const addLineItem = () => setNewItems([...newItems, createEmptyLineItem()]);
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
            setNewItems([createEmptyLineItem()]);
        }
    };

    const handleOpenSelectedDetail = () => {
        if (!selectedReceiptId) {
            alert('Vui lòng chọn một phiếu trong bảng trước!');
            return;
        }
        const receipt = receipts.find(item => item.id === selectedReceiptId);
        if (receipt) {
            handleViewDetail(receipt);
        }
    };

    const handleCreateNew = () => setShowCreateModal(true);
    const handleRefresh = () => fetchReceipts();

    // Mapping ID sang Tên
    const getSupplierName = (supplierId) => {
        if (!supplierId) return 'Chưa rõ NCC';
        return suppliers.find(item => item.id === supplierId)?.name || 'Chưa rõ NCC';
    };

    const getStaffName = (staffId) => {
        if (!staffId) return 'Chưa rõ nhân viên';
        const staff = staffs.find(item => item.id === staffId);
        return staff ? `${staff.employeeCode} - ${staff.fullName}` : 'Chưa rõ nhân viên';
    };

    const getProductName = (productId) => {
        if (!productId) return `SP #${productId || 'N/A'}`;
        return products.find(item => item.id === productId)?.name || `SP #${productId}`;
    };

    const getBatchCode = (batchId) => {
        if (!batchId) return `Lô #${batchId || 'N/A'}`;
        return batches.find(item => item.id === batchId)?.batchCode || `Lô #${batchId}`;
    };

    const getLocationName = (locationId) => {
        if (!locationId) return `Vị trí #${locationId || 'N/A'}`;
        return locations.find(item => item.id === locationId)?.binCode || `Vị trí #${locationId}`;
    };

    const getStatusLabel = (status) => {
        return inboundStatusOptions.find(item => item.value === String(status || '').toUpperCase())?.label || status || 'N/A';
    };

    const handleUpdateReceiptStatus = async (receiptId, nextStatus) => {
        try {
            await axiosClient.put(`/api/inbound/${receiptId}/status`, { status: nextStatus });
            await fetchReceipts();
            if (selectedReceipt?.id === receiptId) {
                setSelectedReceipt((current) => current ? { ...current, status: nextStatus } : current);
            }
        } catch (error) {
            alert('Không thể cập nhật trạng thái phiếu.');
            await fetchReceipts();
        }
    };

    const handleRowContextMenu = (event, receipt) => {
        event.preventDefault();
        event.stopPropagation();

        const menuWidth = 256;
        const menuHeight = 208;
        const x = Math.min(event.clientX, window.innerWidth - menuWidth - 12);
        const openAbove = event.clientY + menuHeight > window.innerHeight;
        const rawY = openAbove ? event.clientY - menuHeight - 12 : event.clientY;
        const y = Math.max(12, Math.min(rawY, window.innerHeight - menuHeight - 12));

        if (selectedReceiptId !== receipt.id) {
            setSelectedReceiptId(receipt.id);
        }

        setContextMenu({
            x: Math.max(12, x),
            y: Math.max(12, y),
            receipt
        });
    };

    const toolbarActions = [
        { label: 'Tạo mới', iconSrc: addIcon, onClick: handleCreateNew },
        { label: 'Chi tiết', iconSrc: infoIcon, onClick: handleOpenSelectedDetail },
        { label: 'Xuất Excel', iconSrc: excelIcon, onClick: handleExportExcel },
        { label: 'Làm mới', iconSrc: excel1Icon, onClick: handleRefresh }
    ];

    const filteredReceipts = receipts.filter((receipt) => {
        const supplierName = getSupplierName(receipt.supplierId);
        const staffName = getStaffName(receipt.createdBy);
        const keyword = filterKeyword.trim().toLowerCase();
        const receiptDate = receipt.receiptDate ? new Date(receipt.receiptDate).toISOString().slice(0, 10) : '';

        const matchesType = (() => {
            if (!keyword) return true;
            switch (filterType) {
                case 'Theo mã phiếu':
                    return String(receipt.receiptCode || '').toLowerCase().includes(keyword);
                case 'Theo số tham chiếu':
                    return String(receipt.referenceNumber || '').toLowerCase().includes(keyword);
                case 'Theo nhà cung cấp':
                    return supplierName.toLowerCase().includes(keyword);
                default:
                    return (
                        String(receipt.receiptCode || '').toLowerCase().includes(keyword) ||
                        String(receipt.referenceNumber || '').toLowerCase().includes(keyword) ||
                        supplierName.toLowerCase().includes(keyword)
                    );
            }
        })();

        const matchesSupplier = filterSupplier === 'Tất cả nhà cung cấp' || supplierName === filterSupplier;
        const matchesStaff = filterStaff === 'ALL' || String(receipt.createdBy || '') === filterStaff || staffName === filterStaff;
        const matchesDate = !filterDate || receiptDate === filterDate;
        const matchesStatus = filterStatus === 'ALL' || String(receipt.status || '').toUpperCase() === filterStatus;

        return matchesType && matchesSupplier && matchesStaff && matchesDate && matchesStatus;
    });

    const resetForm = () => {
        setSupplierId("");
        setCreatedById("");
        setReferenceNumber("");
        setReceiptStatus("DRAFT");
        setNotes("");
        setNewItems([createEmptyLineItem()]);
        setNewBatchDrafts([createEmptyBatchDraft()]);
    };

    return (
        <div className="p-6 bg-[#f8f9fa] min-h-full flex flex-col text-left font-sans text-gray-800">
            <div className="flex items-center justify-between bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-6">
                <div className="flex gap-8">
                    {toolbarActions.map((action, index) => (
                        <ActionButton key={index} {...action} />
                    ))}
                </div>
                <div className="text-sm font-bold text-gray-700">Quản lý phiếu nhập</div>
            </div>

            <div className="flex gap-6 mt-6 flex-1 overflow-hidden">
                <div className="w-64 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-fit text-xs shrink-0 text-left">
                    <div className="flex items-center gap-2 mb-6 text-[#1192a8]">
                        <span className="text-xl">🔍</span>
                        <h2 className="font-bold uppercase tracking-wider text-sm">Bộ lọc tìm kiếm</h2>
                    </div>

                        <div className="space-y-5">
                        <div className="flex flex-col gap-1.5 text-left">
                            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">KIỂU TÌM</label>
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="border border-[#1192a8] rounded-2xl px-4 py-2 text-[11px] outline-none focus:ring-1 focus:ring-[#1192a8] bg-white text-gray-600 w-full shadow-sm"
                            >
                                <option value="Tất cả">Tất cả</option>
                                <option value="Theo mã phiếu">Theo mã phiếu</option>
                                <option value="Theo số tham chiếu">Theo số tham chiếu</option>
                                <option value="Theo nhà cung cấp">Theo nhà cung cấp</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-1.5 text-left">
                            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">TỪ KHÓA</label>
                            <input
                                type="text"
                                value={filterKeyword}
                                onChange={(e) => setFilterKeyword(e.target.value)}
                                placeholder="Nhập mã phiếu, PO, NCC..."
                                className="border border-[#1192a8] rounded-2xl px-4 py-2 text-[11px] outline-none focus:ring-1 focus:ring-[#1192a8] bg-white text-gray-600 w-full shadow-sm"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5 text-left">
                            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">NHÀ CUNG CẤP</label>
                            <select
                                value={filterSupplier}
                                onChange={(e) => setFilterSupplier(e.target.value)}
                                className="border border-[#1192a8] rounded-2xl px-4 py-2 text-[11px] outline-none focus:ring-1 focus:ring-[#1192a8] bg-white text-gray-600 w-full shadow-sm"
                            >
                                <option value="Tất cả nhà cung cấp">Tất cả nhà cung cấp</option>
                                {suppliers.map(item => (
                                    <option key={item.id} value={item.name}>{item.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-1.5 text-left">
                            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">NHÂN VIÊN NHẬP</label>
                            <select
                                value={filterStaff}
                                onChange={(e) => setFilterStaff(e.target.value)}
                                className="border border-[#1192a8] rounded-2xl px-4 py-2 text-[11px] outline-none focus:ring-1 focus:ring-[#1192a8] bg-white text-gray-600 w-full shadow-sm"
                            >
                                <option value="ALL">Tất cả nhân viên</option>
                                {staffs.map(staff => (
                                    <option key={staff.id} value={String(staff.id)}>
                                        {staff.employeeCode} - {staff.fullName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-1.5 text-left">
                            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">TRẠNG THÁI</label>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="border border-[#1192a8] rounded-2xl px-4 py-2 text-[11px] outline-none focus:ring-1 focus:ring-[#1192a8] bg-white text-gray-600 w-full shadow-sm"
                            >
                                <option value="ALL">Tất cả</option>
                                <option value="COMPLETED">Đã nhập</option>
                                <option value="CANCELED">Đã hủy</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-1.5 text-left">
                            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">NGÀY LẬP</label>
                            <input
                                type="date"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                                className="border border-[#1192a8] rounded-2xl px-4 py-2 text-[11px] outline-none focus:ring-1 focus:ring-[#1192a8] bg-white text-gray-600 w-full shadow-sm"
                            />
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            setFilterType('Tất cả');
                            setFilterKeyword('');
                            setFilterSupplier('Tất cả nhà cung cấp');
                            setFilterStaff('ALL');
                            setFilterDate('');
                            setFilterStatus('ALL');
                        }}
                        className="w-full mt-8 py-3 border border-dashed border-[#1192a8] text-[#1192a8] rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-cyan-50 transition-all shadow-sm"
                    >
                        Làm mới bộ lọc
                    </button>
                </div>

                {/* Bảng danh sách phiếu nhập */}
                <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 uppercase text-[11px] font-bold">
                        <tr>
                            <th className="p-4 border-b">Mã phiếu</th>
                            <th className="p-4 border-b">Số PO/Tham chiếu</th>
                            <th className="p-4 border-b">Thời gian lập</th>
                            <th className="p-4 border-b text-left">Nhà cung cấp</th>
                            <th className="p-4 border-b text-right">Tổng tiền</th>
                            <th className="p-4 border-b text-center">Trạng thái</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan="6" className="p-10 text-center text-gray-400">Đang tải dữ liệu từ kho...</td></tr>
                        ) : filteredReceipts.length > 0 ? filteredReceipts.map((p) => (
                            <tr
                                key={p.id}
                                onClick={() => setSelectedReceiptId(selectedReceiptId === p.id ? null : p.id)}
                                onDoubleClick={() => handleViewDetail(p)}
                                onContextMenu={(e) => handleRowContextMenu(e, p)}
                                className={`cursor-pointer transition ${
                                    selectedReceiptId === p.id ? 'bg-blue-100' : 'hover:bg-blue-50'
                                }`}
                            >
                                <td className="p-4 font-mono font-bold text-blue-600">{p.receiptCode}</td>
                                <td className="p-4 font-medium text-gray-700">{p.referenceNumber || "N/A"}</td>
                                <td className="p-4 text-gray-500">{p.receiptDate ? new Date(p.receiptDate).toLocaleString() : '---'}</td>
                                <td className="p-4 text-gray-700">{getSupplierName(p.supplierId)}</td>
                                <td className="p-4 text-right font-bold text-teal-700">{Number(p.totalAmount || 0).toLocaleString()}đ</td>
                                <td className="p-4 text-center">
                                    <select
                                        value={String(p.status || 'DRAFT').toUpperCase()}
                                        onChange={(e) => handleUpdateReceiptStatus(p.id, e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        className={`w-full max-w-[150px] mx-auto rounded-full border px-3 py-1 text-[10px] font-bold uppercase outline-none ${
                                            String(p.status || '').toUpperCase() === 'COMPLETED'
                                                ? 'border-green-200 bg-green-50 text-green-700'
                                                : String(p.status || '').toUpperCase() === 'CANCELED'
                                                    ? 'border-red-200 bg-red-50 text-red-700'
                                                    : 'border-gray-200 bg-gray-50 text-gray-700'
                                        }`}
                                    >
                                        {inboundStatusOptions.map((option) => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="6" className="p-10 text-center text-gray-400">Không có phiếu nhập phù hợp.</td></tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal chi tiết phiếu nhập */}
            {isDetailModalOpen && selectedReceipt && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
                    <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl p-6">
                        <div className="flex justify-between items-center mb-4 border-b pb-4">
                            <h2 className="text-xl font-bold text-gray-800">Thông tin chi tiết: {selectedReceipt.receiptCode}</h2>
                            <button onClick={() => setIsDetailModalOpen(false)} className="text-2xl hover:text-red-500 transition">✕</button>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-6 text-sm text-gray-600">
                            <p><strong>Mã phiếu:</strong> {selectedReceipt.receiptCode || "N/A"}</p>
                            <p><strong>Số PO / Tham chiếu:</strong> {selectedReceipt.referenceNumber || "N/A"}</p>
                            <p><strong>Nhà cung cấp:</strong> {getSupplierName(selectedReceipt.supplierId)}</p>
                            <p><strong>Ngày lập:</strong> {selectedReceipt.receiptDate ? new Date(selectedReceipt.receiptDate).toLocaleString() : "N/A"}</p>
                            <p><strong>Người lập:</strong> {getStaffName(selectedReceipt.createdBy)}</p>
                            <p><strong>Trạng thái:</strong> {getStatusLabel(selectedReceipt.status)}</p>
                            <p><strong>Ngày tạo hệ thống:</strong> {selectedReceipt.createdAt ? new Date(selectedReceipt.createdAt).toLocaleString() : "N/A"}</p>
                            <p><strong>Tổng tiền:</strong> {Number(selectedReceipt.totalAmount || 0).toLocaleString()}đ</p>
                            <p className="col-span-2"><strong>Ghi chú:</strong> {selectedReceipt.notes || "Không có"}</p>
                        </div>
                        <table className="w-full text-sm border-collapse">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="p-2 border text-left">Sản phẩm</th>
                                <th className="p-2 border text-left">Số lô</th>
                                <th className="p-2 border text-left">Vị trí</th>
                                <th className="p-2 border text-center">Dự kiến</th>
                                <th className="p-2 border text-center">Thực nhận</th>
                                <th className="p-2 border text-right">Đơn giá</th>
                                <th className="p-2 border text-right">Thành tiền</th>
                                <th className="p-2 border text-center">Tình trạng</th>
                            </tr>
                            </thead>
                            <tbody>
                            {detailItems.map((item, idx) => (
                                <tr key={idx} className="border-b">
                                    <td className="p-2 border text-blue-600 font-medium">{getProductName(item.productId)}</td>
                                    <td className="p-2 border text-left font-mono text-xs">{getBatchCode(item.batchId)}</td>
                                    <td className="p-2 border text-left text-xs">{getLocationName(item.locationId)}</td>
                                    <td className="p-2 border text-center">{item.quantityExpected}</td>
                                    <td className="p-2 border text-center font-bold">{item.quantityReceived}</td>
                                    <td className="p-2 border text-right">{Number(item.unitPrice || 0).toLocaleString()}đ</td>
                                    <td className="p-2 border text-right font-bold">{(Number(item.quantityReceived || 0) * Number(item.unitPrice || 0)).toLocaleString()}đ</td>
                                    <td className="p-2 border text-center text-xs text-gray-500">{item.itemCondition}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <VoucherContextMenu
                isOpen={!!contextMenu}
                x={contextMenu?.x || 0}
                y={contextMenu?.y || 0}
                title="Tác vụ phiếu nhập"
                subtitle={contextMenu?.receipt?.receiptCode || ''}
                actions={[
                    { label: 'Chi tiết', onClick: () => { closeContextMenu(); handleViewDetail(contextMenu.receipt); } },
                    { label: 'Tạo mới', onClick: () => { closeContextMenu(); handleCreateNew(); } },
                    { label: 'Xuất Excel', onClick: () => { closeContextMenu(); handleExportExcel(); } },
                    { label: 'Làm mới', onClick: () => { closeContextMenu(); handleRefresh(); } }
                ]}
                onClose={closeContextMenu}
            />

            {/* Modal tạo phiếu mới */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-3xl w-full max-w-[95vw] max-h-[90vh] flex flex-col shadow-2xl">
                        <div className="p-6 bg-blue-600 text-white rounded-t-3xl flex justify-between items-center">
                            <h2 className="text-xl font-bold">Lập Phiếu Nhập Kho (Mới)</h2>
                            <button onClick={() => setShowCreateModal(false)} className="hover:rotate-90 transition">✕</button>
                        </div>
                        <div className="p-6 overflow-auto space-y-4">
                            <div className="grid grid-cols-4 gap-4">
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
                                    <label className="text-xs font-bold text-gray-400 uppercase">Trạng thái phiếu</label>
                                    <select
                                        className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 mt-1 focus:border-blue-500 outline-none bg-white"
                                        value={receiptStatus}
                                        onChange={(e) => setReceiptStatus(e.target.value)}
                                    >
                                        <option value="DRAFT">Nháp</option>
                                        <option value="ORDERED">Đã đặt</option>
                                        <option value="IN_TRANSIT">Đang vận chuyển</option>
                                        <option value="COMPLETED">Đã nhập</option>
                                        <option value="CANCELED">Đã hủy</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase">Nhân viên nhập</label>
                                    <select
                                        className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 mt-1 focus:border-blue-500 outline-none bg-white"
                                        value={createdById}
                                        onChange={(e) => setCreatedById(e.target.value)}
                                    >
                                        <option value="">-- Chọn nhân viên --</option>
                                        {staffs.map((staff) => (
                                            <option key={staff.id} value={staff.id}>
                                                {staff.employeeCode} - {staff.fullName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase">Ghi chú nhanh</label>
                                <input className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 mt-1 focus:border-blue-500 outline-none" placeholder="Tình trạng xe, ghi chú..." value={notes} onChange={(e) => setNotes(e.target.value)} />
                            </div>

                            <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm bg-white">
                                <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Thêm lô mới cho sản phẩm</h3>
                                        <p className="text-[11px] text-gray-400 mt-1">Tạo lô trong database trước khi gán vào chi tiết phiếu nhập.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={saveBatchDrafts}
                                        className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition"
                                    >
                                        Lưu lô mới
                                    </button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold">
                                        <tr>
                                            <th className="p-3 text-left">Sản phẩm</th>
                                            <th className="p-3 text-left">Mã lô</th>
                                            <th className="p-3 text-center w-36">Ngày SX</th>
                                            <th className="p-3 text-center w-36">Hạn dùng</th>
                                            <th className="p-3 text-center w-16">Xóa</th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                        {newBatchDrafts.map((batch, index) => (
                                            <tr key={batch.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="p-2">
                                                    <select
                                                        className="w-full border-2 border-gray-100 rounded-xl px-2 py-2 outline-none focus:border-blue-500 bg-white"
                                                        value={batch.productId}
                                                        onChange={(e) => updateBatchDraft(index, 'productId', e.target.value)}
                                                    >
                                                        <option value="">Chọn SP...</option>
                                                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                                    </select>
                                                </td>
                                                <td className="p-2">
                                                    <input
                                                        type="text"
                                                        className="w-full border-2 border-gray-100 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
                                                        value={batch.batchCode}
                                                        onChange={(e) => updateBatchDraft(index, 'batchCode', e.target.value)}
                                                        placeholder="VD: LOT-2026-001"
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <input
                                                        type="date"
                                                        className="w-full border-2 border-gray-100 rounded-xl px-2 py-2 text-center outline-none focus:border-blue-500"
                                                        value={batch.manufactureDate}
                                                        onChange={(e) => updateBatchDraft(index, 'manufactureDate', e.target.value)}
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <input
                                                        type="date"
                                                        className="w-full border-2 border-gray-100 rounded-xl px-2 py-2 text-center outline-none focus:border-blue-500"
                                                        value={batch.expiryDate}
                                                        onChange={(e) => updateBatchDraft(index, 'expiryDate', e.target.value)}
                                                    />
                                                </td>
                                                <td className="p-2 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeBatchDraft(index)}
                                                        className="w-8 h-8 flex items-center justify-center rounded-full text-red-400 hover:bg-red-50 hover:text-red-600 transition-all"
                                                    >
                                                        ✕
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="p-4 border-t bg-white">
                                    <button
                                        type="button"
                                        onClick={addBatchDraft}
                                        className="text-blue-600 font-bold text-sm hover:underline"
                                    >
                                        + Thêm lô mới
                                    </button>
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
                                                        {locations.map(l => (
                                                            <option key={l.id} value={l.id}>
                                                                {l.binCode} [{l.containerType || 'N/A'}] (Sức chứa: {l.quantityOnHand || 0}/{l.capacity || 0})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="p-2">
                                                    <input
                                                        type="number"
                                                        className="w-full border-2 border-gray-100 rounded-xl px-2 py-2 text-center outline-none focus:bg-blue-50"
                                                        value={item.qtyExpected}
                                                        onChange={(e) => updateItem(index, 'qtyExpected', e.target.value)}
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <input
                                                        type="number"
                                                        className="w-full border-2 border-gray-100 rounded-xl px-2 py-2 text-center font-bold text-blue-600 outline-none focus:bg-blue-50"
                                                        value={item.qtyReceived}
                                                        onChange={(e) => updateItem(index, 'qtyReceived', e.target.value)}
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <input
                                                        type="number"
                                                        className="w-full border-2 border-gray-100 rounded-xl px-2 py-2 text-right font-mono outline-none focus:bg-blue-50"
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