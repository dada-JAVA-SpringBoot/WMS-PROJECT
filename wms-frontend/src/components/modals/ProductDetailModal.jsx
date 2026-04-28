import React, { useState, useEffect } from 'react';
import Barcode from 'react-barcode'; // Import thư viện vẽ mã vạch

export default function ProductDetailModal({ product, onClose }) {
    const [inventoryDetails, setInventoryDetails] = useState([]);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    useEffect(() => {
        if (product && product.id) {
            setIsLoadingDetails(true);
            fetch(`http://localhost:8080/api/inventory/product/${product.id}`)
                .then(res => {
                    if (!res.ok) throw new Error("Lỗi Server");
                    return res.json();
                })
                .then(data => setInventoryDetails(data))
                .catch(err => {
                    console.error("Lỗi tải chi tiết:", err);
                    setInventoryDetails([]);
                })
                .finally(() => setIsLoadingDetails(false));
        }
    }, [product]);

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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white w-full max-w-6xl rounded-xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
                {/* Header */}
                <div className="bg-[#1192a8] text-white px-6 py-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold uppercase tracking-tight">Hồ sơ chi tiết mặt hàng</h2>
                        <p className="text-sm opacity-90">{product.sku} — {product.name}</p>
                    </div>
                    <button onClick={onClose} className="text-white hover:text-red-200 text-3xl leading-none">&times;</button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
                    {/* KHU VỰC THÔNG TIN CHÍNH (Chia 2 cột: Trái cho Ảnh/Mã vạch, Phải cho Data) */}
                    <div className="flex gap-6 mb-8">

                        {/* CỘT TRÁI: Ảnh & Barcode */}
                        <div className="w-1/4 flex flex-col items-center bg-white p-5 rounded-lg border shadow-sm h-fit">
                            {/* Khung Ảnh */}
                            <div className="w-full aspect-square bg-gray-50 border border-gray-200 rounded-lg flex justify-center items-center overflow-hidden mb-5">
                                {product.imageUrl ? (
                                    <img
                                        src={product.imageUrl}
                                        alt={product.name}
                                        className="object-contain w-full h-full p-2"
                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/300?text=Loi+Anh'; }} // Xử lý nếu link hỏng
                                    />
                                ) : (
                                    <div className="text-center text-gray-400">
                                        {/* SVG placeholder giữ nguyên như cũ */}
                                        <span className="text-sm font-medium">Chưa có ảnh</span>
                                    </div>
                                )}
                            </div>

                            {/* Khung Mã Vạch (Barcode) */}
                            <div className="w-full flex flex-col items-center border-t pt-4">
                                <span className="text-xs text-gray-500 font-bold mb-2 uppercase">Mã Vạch Hệ Thống</span>
                                {product.barcode ? (
                                    <Barcode
                                        value={product.barcode}
                                        width={1.8}      // Độ rộng của các sọc
                                        height={50}      // Chiều cao sọc
                                        fontSize={14}    // Cỡ chữ số bên dưới
                                        background="#ffffff"
                                        lineColor="#000000"
                                    />
                                ) : (
                                    <span className="text-sm text-red-500 font-medium italic">Không có mã vạch</span>
                                )}
                            </div>
                        </div>

                        {/* CỘT PHẢI: Dữ liệu Master Data */}
                        <div className="w-3/4 flex flex-col gap-5">

                            {/* --- HÀNG TRÊN: 3 Khối thông tin hiện tại --- */}
                            <div className="grid grid-cols-3 gap-5">
                                {/* Nhóm 1: Thông tin Master Data */}
                                <section className="bg-white p-4 rounded-lg border shadow-sm">
                                    <h3 className="text-[#00529c] font-bold border-b mb-3 pb-1 text-sm uppercase">1. Thông tin cơ bản</h3>
                                    <div className="space-y-3">
                                        <InfoRow label="Mã SKU" value={product.sku} isBold color="text-blue-700" />
                                        <InfoRow label="Đơn vị tính" value={product.baseUnit} />
                                        <InfoRow label="Danh mục" value={`Nhóm ${product.categoryId}`} />
                                        <InfoRow label="Quy cách đóng gói" value="Tiêu chuẩn" />
                                    </div>
                                </section>

                                {/* Nhóm 2: Thông số Logistics */}
                                <section className="bg-white p-4 rounded-lg border shadow-sm">
                                    <h3 className="text-[#00529c] font-bold border-b mb-3 pb-1 text-sm uppercase">2. Thông số Logistics</h3>
                                    <div className="space-y-3">
                                        <InfoRow label="Trọng lượng" value={product.weight ? `${product.weight} kg` : "N/A"} />
                                        <InfoRow label="Kích thước" value={product.length ? `${product.length}x${product.width}x${product.height} cm` : "N/A"} />
                                        <InfoRow label="Thể tích (CBM)" value={calculateCBM(product.length, product.width, product.height)} color="text-teal-600 font-bold" />
                                        <div className="pt-1">
                                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase shadow-sm ${product.isFragile ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-gray-100 text-gray-500'}`}>
                                                {product.isFragile ? "⚠️ Hàng dễ vỡ" : "Hàng thông thường"}
                                            </span>
                                        </div>
                                    </div>
                                </section>

                                {/* Nhóm 3: Điều kiện & Cảnh báo */}
                                <section className="bg-white p-4 rounded-lg border shadow-sm">
                                    <h3 className="text-[#00529c] font-bold border-b mb-3 pb-1 text-sm uppercase">3. Lưu kho & Cảnh báo</h3>
                                    <div className="space-y-3">
                                        <InfoRow label="Nhiệt độ bảo quản" value={product.storageTemp || "Bình thường"} />
                                        <InfoRow label="Ngưỡng an toàn" value={product.safetyStock ? `${product.safetyStock} ${product.baseUnit}` : "0"} />
                                        <div className="mt-3 p-2 bg-[#f0f7ff] rounded border border-blue-200">
                                            <p className="text-[10px] text-blue-800 font-bold uppercase mb-1">Tổng tồn kho khả dụng</p>
                                            <p className="text-2xl font-black text-blue-600">{product.totalStock?.toLocaleString()} <span className="text-sm font-normal text-blue-800">{product.baseUnit}</span></p>
                                        </div>
                                    </div>
                                </section>
                            </div>

                            {/* --- HÀNG DƯỚI: Nguồn gốc & Lịch sử giao dịch --- */}
                            <section className="bg-white p-4 rounded-lg border shadow-sm flex-1">
                                <h3 className="text-[#00529c] font-bold border-b mb-3 pb-1 text-sm uppercase">4. Nguồn gốc & Lịch sử giao dịch</h3>
                                <div className="grid grid-cols-2 gap-x-10 gap-y-3 mt-4">
                                    <InfoRow
                                        label="Nhà cung cấp"
                                        value={product.supplierCodes || "Chưa xác định"}
                                        isBold
                                        color="text-blue-700"
                                    />
                                    <InfoRow
                                        label="Ngày nhập gần nhất"
                                        // formatDateTime là hàm chúng ta đã viết để xử lý LocalDateTime từ Java
                                        value={formatDateTime(product.lastImportDate)}
                                    />
                                    <InfoRow
                                        label="Ngày khởi tạo hồ sơ"
                                        value={formatDateTime(product.createdAt)}
                                    />
                                    <div className="flex justify-between items-start text-xs">
                                        <span className="text-gray-500 font-medium">Trạng thái:</span>
                                        <span className="text-right ml-2">{renderStatusBadge(product.status)}</span>
                                    </div>
                                </div>
                            </section>

                        </div>
                    </div>

                    {/* KHU VỰC BẢNG CHI TIẾT TỒN KHO */}
                    <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <span className="w-1 h-6 bg-[#1192a8]"></span> Phân bổ tồn kho thực tế (Theo Vị trí & Số lô)
                    </h3>
                    <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-100 text-gray-700 border-b">
                            <tr>
                                <th className="p-4 font-bold">Vị trí (Bin Location)</th>
                                <th className="p-4 font-bold">Mã Lô (Batch No.)</th>
                                <th className="p-4 font-bold">Hạn sử dụng</th>
                                <th className="p-4 font-bold text-right">Tồn thực tế</th>
                                <th className="p-4 font-bold text-right text-orange-600">Đang giữ chỗ</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                            {isLoadingDetails ? (
                                <tr><td colSpan="5" className="p-10 text-center text-gray-400 font-medium animate-pulse">Đang truy xuất dữ liệu từ sổ kho...</td></tr>
                            ) : inventoryDetails.length > 0 ? (
                                inventoryDetails.map((inv, idx) => (
                                    <tr key={idx} className="hover:bg-blue-50 transition-colors">
                                        <td className="p-4 font-bold text-blue-700">{inv.locCode}</td>
                                        <td className="p-4 font-mono text-gray-600 bg-gray-50">{inv.batchCode}</td>
                                        <td className="p-4 font-medium text-gray-800">{inv.expiryDate || "N/A"}</td>
                                        <td className="p-4 text-right font-black text-green-600 text-base">{inv.onHand?.toLocaleString()}</td>
                                        <td className="p-4 text-right font-bold text-orange-500">{inv.allocated?.toLocaleString()}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="5" className="p-10 text-center text-gray-500 italic">Sản phẩm này hiện không có tồn kho tại bất kỳ vị trí nào.</td></tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-white p-4 border-t rounded-b-xl flex justify-end">
                    <button onClick={onClose} className="px-8 py-2.5 bg-gray-600 text-white rounded font-bold hover:bg-gray-700 transition shadow-sm">
                        ĐÓNG CỬA SỔ
                    </button>
                </div>
            </div>
        </div>
    );
}

// Component phụ hiển thị dòng thông tin
function InfoRow({ label, value, isBold, color = "text-gray-800" }) {
    return (
        <div className="flex justify-between items-start text-xs border-b border-gray-50 pb-1 last:border-0">
            <span className="text-gray-500 font-medium">{label}:</span>
            <span className={`text-right ${isBold ? 'font-bold' : 'font-medium'} ${color} ml-2`}>{value}</span>
        </div>
    );
}