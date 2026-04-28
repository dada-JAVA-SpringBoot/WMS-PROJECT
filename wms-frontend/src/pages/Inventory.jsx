import React, { useState, useEffect, useMemo } from 'react';
import ProductModal from '../components/modals/ProductModal';
import ProductDetailModal from '../components/modals/ProductDetailModal';

// Import Icons
import addIcon from '../components/common/icons/add.png';
import fixIcon from '../components/common/icons/fix.png';
import deleteIcon from '../components/common/icons/delete.png';
import infoIcon from '../components/common/icons/info.png';
import scanIcon from '../components/common/icons/scan.png';
import excelIcon from '../components/common/icons/excel.png';

export default function Inventory() {
    // 1. Quản lý State Modal
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    // 2. Quản lý State Dữ liệu
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // 3. Quản lý State Tìm kiếm
    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchType, setSearchType] = useState('Tất cả');

    // Hàm gọi API lấy danh sách sản phẩm
    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("http://localhost:8080/api/products");
            if (response.ok) {
                const data = await response.json();
                setProducts(data); // Đưa thẳng data thật vào state
            } else {
                throw new Error("Lỗi Server");
            }
        } catch (error) {
            console.warn("Không kết nối được Backend...", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Tự động load dữ liệu lần đầu
    useEffect(() => {
        fetchProducts();
    }, []);

    // 4. Logic Lọc Dữ liệu (Search Filter)
    const filteredProducts = useMemo(() => {
        if (!searchKeyword.trim()) return products;

        const keyword = searchKeyword.toLowerCase();
        return products.filter(item => {
            switch (searchType) {
                case 'Theo tên SP':
                    return item.name?.toLowerCase().includes(keyword);
                case 'Theo SKU':
                    return item.sku?.toLowerCase().includes(keyword);
                case 'Theo Mã vạch':
                    return item.barcode?.toLowerCase().includes(keyword);
                default: // 'Tất cả'
                    return (
                        item.name?.toLowerCase().includes(keyword) ||
                        item.sku?.toLowerCase().includes(keyword) ||
                        item.barcode?.toLowerCase().includes(keyword)
                    );
            }
        });
    }, [products, searchKeyword, searchType]);

    return (
        <div className="p-6 h-full flex flex-col bg-gray-50">
            {/* Thanh công cụ (Action Buttons Bar) */}
            <div className="flex items-center justify-between bg-white p-4 mb-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex gap-6">
                    <div onClick={() => setIsAddModalOpen(true)}>
                        <ActionButton iconSrc={addIcon} label="THÊM MỚI" />
                    </div>
                    <ActionButton iconSrc={fixIcon} label="SỬA" />
                    <ActionButton iconSrc={deleteIcon} label="XÓA" />
                    <ActionButton iconSrc={infoIcon} label="CHI TIẾT" />
                    <ActionButton iconSrc={scanIcon} label="QUÉT MÃ" />
                    <ActionButton iconSrc={excelIcon} label="XUẤT EXCEL" />
                </div>

                <div className="flex items-center gap-3">
                    <select
                        value={searchType}
                        onChange={(e) => setSearchType(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 bg-white"
                    >
                        <option>Tất cả</option>
                        <option>Theo tên SP</option>
                        <option>Theo SKU</option>
                        <option>Theo Mã vạch</option>
                    </select>
                    <input
                        type="text"
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        className="border border-gray-300 rounded px-4 py-1.5 w-64 text-sm focus:outline-none focus:border-blue-500"
                        placeholder="Nhập từ khóa tìm kiếm..."
                    />
                    <button
                        onClick={fetchProducts}
                        className="bg-[#1192a8] text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-teal-700 flex items-center gap-2 transition"
                    >
                        <span>↻</span> Làm mới
                    </button>
                </div>
            </div>

            {/* Khu vực Bảng dữ liệu (Table Area) */}
            <div className="bg-white flex-1 overflow-auto rounded-xl shadow-sm border border-gray-200">
                {isLoading ? (
                    <div className="flex justify-center items-center h-full text-gray-500 font-medium">
                        <span className="animate-pulse">Đang tải dữ liệu từ máy chủ...</span>
                    </div>
                ) : (
                    <table className="w-full text-center text-sm">
                        <thead className="bg-gray-100 sticky top-0 shadow-sm z-10">
                        <tr className="text-gray-700 uppercase text-xs tracking-wider">
                            <th className="p-4 font-bold text-left">Mã SKU</th>
                            <th className="p-4 font-bold text-left">Tên sản phẩm</th>
                            <th className="p-4 font-bold">Mã vạch (Barcode)</th>
                            <th className="p-4 font-bold">Đơn vị</th>
                            <th className="p-4 font-bold text-center">Trạng thái</th> {/* <-- CỘT MỚI THÊM --> */}
                            <th className="p-4 font-bold text-right">Tổng tồn kho</th>
                        </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-200">
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((item) => (
                                <tr
                                    key={item.id}
                                    onClick={() => setSelectedProduct(item)}
                                    className="hover:bg-blue-50 transition cursor-pointer text-gray-700 group"
                                >
                                    <td className="p-4 font-semibold text-blue-700 text-left group-hover:underline">{item.sku}</td>
                                    <td className="p-4 font-medium text-gray-900 text-left">{item.name}</td>
                                    <td className="p-4 text-gray-500 font-mono">{item.barcode || 'N/A'}</td>
                                    <td className="p-4">
                                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs border border-gray-200">{item.baseUnit}</span>
                                    </td>
                                    {/* <-- CỘT DỮ LIỆU MỚI THÊM --> */}
                                    <td className="p-4 text-center">
                                        {item.status === 'ACTIVE' ? (
                                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded-full">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> ACTIVE
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-500 bg-gray-50 border border-gray-200 px-2 py-1 rounded-full">
                                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> INACTIVE
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 font-bold text-right text-green-600">
                                        {item.totalStock?.toLocaleString()}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="p-8 text-gray-500 text-center">
                                    Không tìm thấy sản phẩm nào phù hợp với "{searchKeyword}".
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Nơi nhúng các Modal */}
            <ProductModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={fetchProducts}
            />

            <ProductDetailModal
                product={selectedProduct}
                onClose={() => setSelectedProduct(null)}
            />
        </div>
    );
}

// Nút Action Button dùng chung
function ActionButton({ iconSrc, label }) {
    return (
        <button className="flex flex-col items-center gap-1 group bg-transparent border-none cursor-pointer">
            <img
                src={iconSrc}
                alt={label}
                className="w-9 h-9 group-hover:scale-110 transition duration-200 drop-shadow-sm"
            />
            <span className="text-[10px] font-bold text-[#00529c] uppercase tracking-wide group-hover:text-blue-600 transition">
                {label}
            </span>
        </button>
    );
}