import React, { useState, useEffect, useCallback } from 'react';
import Barcode from 'react-barcode';
import { useModalDismiss } from './useModalDismiss';
import TransferModal from './TransferModal';
import axiosClient from '../../api/axiosClient';

export default function ProductDetailModal({ product, onClose }) {
    const [inventoryDetails, setInventoryDetails] = useState([]);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [categories, setCategories] = useState([]);
    const [units, setUnits] = useState([]);
    
    // State cho việc chuyển kho
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [selectedStockLine, setSelectedStockLine] = useState(null);

    useModalDismiss(!!product, onClose);

    const normalizeUnitName = (value) => {
        if (!value) return '';
        const map = {
            'H?p': 'Hộp',
            'L?c': 'Lốc',
            'V?i': 'Vỉ',
            'Pallet': 'Pallet'
        };
        return map[value] || value;
    };

    const fetchInventoryDetails = useCallback(async () => {
        if (product && product.id) {
            setIsLoadingDetails(true);
            try {
                const res = await axiosClient.get(`/api/inventory/product/${product.id}`);
                setInventoryDetails(res.data);
            } catch (err) {
                console.error("Lỗi tải chi tiết:", err);
                setInventoryDetails([]);
            } finally {
                setIsLoadingDetails(false);
            }
        }
    }, [product]);

    useEffect(() => {
        fetchInventoryDetails();
    }, [fetchInventoryDetails]);

    useEffect(() => {
        const loadCategoriesAndUnits = async () => {
            try {
                const [catRes, unitRes] = await Promise.all([
                    axiosClient.get("/api/categories"),
                    axiosClient.get("/api/units")
                ]);
                setCategories(catRes.data);
                setUnits(unitRes.data);
            } catch {
                setCategories([]);
                setUnits([]);
            }
        };
        loadCategoriesAndUnits();
    }, []);

    if (!product) return null;

    // Tính toán thể tích (CBM)
    const calculateCBM = (l, w, h) => {
        if (!l || !w || !h) return "N/A";
        return ((l * w * h) / 1000000).toFixed(4) + " m³";
    };

    // Hàm format ngày giờ từ Java (ISO 8601) sang chuẩn Việt Nam
    const formatDateTime = (dateString) => {
        if (!dateString) return "Chưa cập nhật";
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    // Hàm render Label Trạng thái kinh doanh
    const renderStatusBadge = (status) => {
        if (status === 'ACTIVE') {
            return <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[11px] font-bold border border-green-200">ĐANG KINH DOANH</span>;
        }
        return <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-[11px] font-bold border border-gray-200">NGỪNG KINH DOANH</span>;
    };

    const handleOpenTransfer = (inv) => {
        setSelectedStockLine(inv);
        setIsTransferModalOpen(true);
    };

    const handleTransferSuccess = () => {
        fetchInventoryDetails();
    };

    const categoryName = product.categoryName || categories.find(item => String(item.id) === String(product.categoryId))?.name || 'Chưa gán';
    const categoryCode = product.categoryCode || categories.find(item => String(item.id) === String(product.categoryId))?.categoryCode || '';
    const unitName = units.find(item => item.name === normalizeUnitName(product.baseUnit))?.name
        || normalizeUnitName(product.baseUnit)
        || 'N/A';
    const totalStock = Number(product.totalStock || 0);
    const allocatedStock = Number(product.allocatedStock ?? 0);
    const availableStock = product.availableStock !== undefined && product.availableStock !== null
        ? Number(product.availableStock)
        : totalStock - allocatedStock;
    const incomingStock = Number(product.incomingStock ?? 0);
    const safetyStock = product.safetyStock !== undefined && product.safetyStock !== null
        ? Number(product.safetyStock)
        : null;
    const isBelowSafety = safetyStock !== null && availableStock < safetyStock;

    return (
        <>
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex justify-center items-center z-50 p-2 md:p-4">
            <div className="bg-white w-full max-w-6xl rounded-2xl md:rounded-xl shadow-2xl flex flex-col max-h-[98vh] md:max-h-[95vh] overflow-hidden">
                {/* Header */}
                <div className="bg-[#1192a8] text-white px-4 md:px-6 py-3 md:py-4 flex justify-between items-center shrink-0">
                    <div className="min-w-0">
                        <h2 className="text-base md:text-xl font-bold uppercase tracking-tight truncate">Hồ sơ chi tiết mặt hàng</h2>
                        <p className="text-[11px] md:text-sm opacity-90 truncate">{product.sku} — {product.name}</p>
                    </div>
                    <button onClick={onClose} className="text-white hover:text-red-200 text-2xl md:text-3xl leading-none ml-4">&times;</button>
                </div>

                <div className="p-3 md:p-6 overflow-y-auto flex-1 bg-gray-50 space-y-4 md:space-y-6">
                    <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
                        {/* CỘT TRÁI: Ảnh & Barcode */}
                        <div className="w-full lg:w-1/4 flex flex-col items-center bg-white p-4 md:p-5 rounded-xl border shadow-sm h-fit">
                            <div className="w-32 lg:w-full aspect-square bg-gray-50 border border-gray-200 rounded-lg flex justify-center items-center overflow-hidden mb-4 md:mb-5">
                                {product.imageUrl ? (
                                    <img
                                        src={product.imageUrl}
                                        alt={product.name}
                                        className="object-contain w-full h-full p-2"
                                        onError={(e) => { e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22200%22%20height%3D%22200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20200%20200%22%3E%3Crect%20width%3D%22200%22%20height%3D%22200%22%20fill%3D%22%23eee%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-size%3D%2218%22%20text-anchor%3D%22middle%22%20alignment-baseline%3D%22middle%22%20font-family%3D%22sans-serif%22%20fill%3D%22%23999%22%3ELoi+Anh%3C%2Ftext%3E%3C%2Fsvg%3E'; }}
                                    />
                                ) : (
                                    <div className="text-center text-gray-400">
                                        <span className="text-xs md:text-sm font-medium uppercase font-black opacity-30 tracking-widest">No Image</span>
                                    </div>
                                )}
                            </div>
                            <div className="w-full flex flex-col items-center border-t pt-4">
                                <span className="text-[10px] text-gray-400 font-black mb-2 uppercase tracking-widest">Mã Vạch Hệ Thống</span>
                                {product.barcode ? (
                                    <div className="flex flex-col items-center gap-2 max-w-full overflow-hidden">
                                        <Barcode value={product.barcode} format="CODE128" width={1.5} height={40} fontSize={12} textMargin={2} margin={0} displayValue background="#ffffff" lineColor="#000000" />
                                    </div>
                                ) : (
                                    <span className="text-[10px] text-red-400 font-bold italic uppercase">Không có mã vạch</span>
                                )}
                            </div>
                        </div>

                        {/* CỘT PHẢI: Dữ liệu Master Data */}
                        <div className="w-full lg:w-3/4 flex flex-col gap-4 md:gap-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
                                <section className="bg-white p-4 rounded-xl border shadow-sm">
                                    <h3 className="text-[#00529c] font-black border-b mb-3 pb-1 text-[11px] uppercase tracking-wider">1. Thông tin cơ bản</h3>
                                    <div className="space-y-3">
                                        <InfoRow label="Mã SKU" value={product.sku} isBold color="text-blue-700" />
                                        <InfoRow label="Mã vạch" value={product.barcode || 'N/A'} />
                                        <InfoRow label="Đơn vị" value={unitName} />
                                        <InfoRow label="Danh mục" value={categoryCode ? `${categoryCode} - ${categoryName}` : categoryName} />
                                    </div>
                                </section>
                                <section className="bg-white p-4 rounded-xl border shadow-sm">
                                    <h3 className="text-[#00529c] font-black border-b mb-3 pb-1 text-[11px] uppercase tracking-wider">2. Thông số Logistics</h3>
                                    <div className="space-y-3">
                                        <InfoRow label="Trọng lượng" value={product.weight ? `${product.weight} kg` : "N/A"} />
                                        <InfoRow label="Kích thước" value={product.length ? `${product.length}x${product.width}x${product.height} cm` : "N/A"} />
                                        <InfoRow label="Thể tích" value={calculateCBM(product.length, product.width, product.height)} color="text-teal-600 font-black" />
                                        <div className="pt-1">
                                            <span className={`text-[9px] px-2 py-0.5 rounded-lg font-black uppercase shadow-sm border ${product.isFragile ? 'bg-red-50 text-red-600 border-red-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                                                {product.isFragile ? "⚠️ Hàng dễ vỡ" : "Hàng thông thường"}
                                            </span>
                                        </div>
                                    </div>
                                </section>
                                <section className="bg-white p-4 rounded-xl border shadow-sm sm:col-span-2 xl:col-span-1">
                                    <h3 className="text-[#00529c] font-black border-b mb-3 pb-1 text-[11px] uppercase tracking-wider">3. Lưu kho & Cảnh báo</h3>
                                    <div className="space-y-3">
                                        <InfoRow label="Nhiệt độ" value={product.storageTemp || "Bình thường"} />
                                        <InfoRow label="Ngưỡng an toàn" value={safetyStock !== null ? `${safetyStock.toLocaleString()} ${unitName}` : "N/A"} />
                                        <InfoRow label="Cảnh báo" value={isBelowSafety ? "Dưới tồn an toàn" : "Bình thường"} isBold color={isBelowSafety ? "text-red-600" : "text-green-700"} />
                                    </div>
                                </section>
                            </div>

                            <section className="bg-white p-4 rounded-xl border shadow-sm">
                                <h3 className="text-[#00529c] font-black border-b mb-3 pb-1 text-[11px] uppercase tracking-wider">4. Tổng quan tồn kho</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                                    <StockMetric label="Tổng tồn" value={totalStock} unit={unitName} color="text-slate-800" />
                                    <StockMetric label="Đã phân bổ" value={allocatedStock} unit={unitName} color="text-slate-700" />
                                    <StockMetric label="Khả dụng" value={availableStock} unit={unitName} color={isBelowSafety ? "text-red-600" : "text-green-700"} />
                                    <StockMetric label="Đang về" value={incomingStock} unit={unitName} color="text-cyan-700" title="Chỉ cộng vào tồn khả dụng khi phiếu nhập hoàn tất" />
                                    <StockMetric label="An toàn" value={safetyStock} unit={unitName} color="text-amber-700" />
                                </div>
                            </section>

                            <section className="bg-white p-4 rounded-xl border shadow-sm flex-1">
                                <h3 className="text-[#00529c] font-black border-b mb-3 pb-1 text-[11px] uppercase tracking-wider">5. Nguồn gốc & Trạng thái</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-10 mt-2">
                                    <InfoRow label="Nhà cung cấp" value={product.supplierCodes || "Chưa xác định"} isBold color="text-blue-700" />
                                    <InfoRow label="Trạng thái" value={renderStatusBadge(product.status)} />
                                    <InfoRow label="Nhập gần nhất" value={formatDateTime(product.lastImportDate)} />
                                    <InfoRow label="Khởi tạo" value={formatDateTime(product.createdAt)} />
                                </div>
                            </section>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-sm md:text-lg font-black text-gray-800 flex items-center gap-2 uppercase tracking-tight">
                            <span className="w-1 h-5 md:h-6 bg-[#1192a8]"></span> Phân bổ tồn kho thực tế
                        </h3>
                        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                            <div className="overflow-x-auto no-scrollbar lg:scrollbar-thin">
                                <table className="w-full text-left text-xs md:text-sm min-w-[600px]">
                                    <thead className="bg-gray-50 text-gray-500 border-b font-black uppercase">
                                        <tr>
                                            <th className="p-3 md:p-4">Vị trí kho</th>
                                            <th className="p-3 md:p-4">Mã Lô</th>
                                            <th className="p-3 md:p-4">Hạn dùng</th>
                                            <th className="p-3 md:p-4 text-right">Khả dụng</th>
                                            <th className="p-3 md:p-4 text-right">Tổng tồn</th>
                                            <th className="p-3 md:p-4 text-center w-24 md:w-32">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                    {isLoadingDetails ? (
                                        <tr><td colSpan="6" className="p-10 text-center text-gray-400 font-medium animate-pulse">Đang truy xuất sổ kho...</td></tr>
                                    ) : inventoryDetails.length > 0 ? (
                                        inventoryDetails.map((inv, idx) => {
                                            const rowOnHand = Number(inv.onHand || 0);
                                            const rowAllocated = Number(inv.allocated || 0);
                                            const rowAvailable = rowOnHand - rowAllocated;

                                            return (
                                                <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                                                    <td className="p-3 md:p-4 font-black text-blue-700">{inv.locCode}</td>
                                                    <td className="p-3 md:p-4 font-mono text-gray-600">{inv.batchCode}</td>
                                                    <td className="p-3 md:p-4 font-bold text-gray-400">{inv.expiryDate || "---"}</td>
                                                    <td className="p-3 md:p-4 text-right font-black text-[#1192a8] text-base">{rowAvailable.toLocaleString()}</td>
                                                    <td className="p-3 md:p-4 text-right font-bold text-slate-800">{rowOnHand.toLocaleString()}</td>
                                                    <td className="p-3 md:p-4 text-center">
                                                        <button 
                                                            onClick={() => handleOpenTransfer(inv)}
                                                            disabled={rowAvailable <= 0}
                                                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all shadow-sm uppercase ${
                                                                rowAvailable > 0 
                                                                ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95' 
                                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                            }`}
                                                        >
                                                            CHUYỂN
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr><td colSpan="6" className="p-10 text-center text-gray-400 italic">Sản phẩm này hiện không có tồn kho thực tế.</td></tr>
                                    )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 border-t shrink-0 flex justify-end">
                    <button onClick={onClose} className="w-full sm:w-auto px-10 py-3 bg-[#56748a] text-white rounded-xl font-black hover:bg-slate-700 transition shadow-lg active:scale-95 uppercase text-xs tracking-widest">
                        Đóng cửa sổ
                    </button>
                </div>
            </div>
        </div>

        {selectedStockLine && (
            <TransferModal 
                isOpen={isTransferModalOpen}
                onClose={() => setIsTransferModalOpen(false)}
                product={product}
                stockLine={selectedStockLine}
                onSuccess={handleTransferSuccess}
            />
        )}
        </>
    );
}

function InfoRow({ label, value, isBold, color = "text-gray-800" }) {
    return (
        <div className="flex justify-between items-start text-xs border-b border-gray-50 pb-1 last:border-0">
            <span className="text-gray-500 font-medium">{label}:</span>
            <span className={`text-right ${isBold ? 'font-bold' : 'font-medium'} ${color} ml-2`}>{value}</span>
        </div>
    );
}

function StockMetric({ label, value, unit, color, title }) {
    const displayValue = value === null || value === undefined ? 'N/A' : Number(value).toLocaleString();

    return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3" title={title || ''}>
            <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">{label}</div>
            <div className={`text-xl font-black ${color}`}>{displayValue}</div>
            <div className="text-[11px] text-gray-500 mt-0.5">{unit}</div>
        </div>
    );
}
