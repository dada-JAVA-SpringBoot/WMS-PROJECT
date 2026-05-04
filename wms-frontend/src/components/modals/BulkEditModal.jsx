import React from 'react';
import { useModalDismiss } from './useModalDismiss';

export default function BulkEditModal({ isOpen, products = [], onClose, onEditOne }) {
    useModalDismiss(isOpen, onClose);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
                <div className="bg-[#1192a8] text-white px-6 py-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold uppercase tracking-wide">Chỉnh sửa nhiều sản phẩm</h2>
                        <p className="text-sm opacity-90">Chọn từng sản phẩm để mở form chỉnh sửa riêng</p>
                    </div>
                    <button onClick={onClose} className="text-white hover:text-red-200 text-3xl leading-none">&times;</button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
                    {products.length > 0 ? (
                        <div className="space-y-3">
                            {products.map((product) => {
                                const totalStock = Number(product.totalStock || 0);
                                const allocatedStock = Number(product.allocatedStock ?? product.quantityAllocated ?? product.allocated ?? 0);
                                const availableStock = product.availableStock !== undefined && product.availableStock !== null
                                    ? Number(product.availableStock)
                                    : totalStock - allocatedStock;
                                const incomingStock = Number(product.incomingStock ?? product.inboundStock ?? product.onOrderStock ?? 0);

                                return (
                                    <div key={product.id} className="bg-white border rounded-lg px-4 py-3 flex items-center justify-between">
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-gray-900 truncate">{product.sku} - {product.name}</p>
                                            <p className="text-xs text-gray-500">
                                                Barcode: {product.barcode || 'N/A'} | Khả dụng: {availableStock.toLocaleString()} | Đã phân bổ: {allocatedStock.toLocaleString()} | Đang về: {incomingStock.toLocaleString()}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => onEditOne(product)}
                                            className="ml-4 px-4 py-2 rounded-md bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition text-sm font-bold"
                                        >
                                            Mở sửa
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 py-20">
                            Không có sản phẩm nào được chọn.
                        </div>
                    )}
                </div>

                <div className="bg-white p-4 border-t flex justify-end">
                    <button onClick={onClose} className="px-6 py-2.5 bg-gray-600 text-white rounded font-bold hover:bg-gray-700 transition shadow-sm">
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}
