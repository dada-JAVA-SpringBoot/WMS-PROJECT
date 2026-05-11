import React from 'react';
import { useModalDismiss } from './useModalDismiss';

export default function BulkEditModal({ isOpen, products = [], onClose, onEditOne }) {
    useModalDismiss(isOpen, onClose);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex justify-center items-center z-50 p-2 md:p-4">
            <div className="bg-white w-full max-w-4xl rounded-2xl md:rounded-xl shadow-2xl flex flex-col max-h-[98vh] md:max-h-[90vh] overflow-hidden">
                <div className="bg-[#1192a8] text-white px-4 md:px-6 py-3 md:py-4 flex justify-between items-center shrink-0">
                    <div className="min-w-0">
                        <h2 className="text-base md:text-xl font-bold uppercase tracking-wide truncate">Sửa nhiều sản phẩm</h2>
                        <p className="text-[10px] md:text-sm opacity-90 truncate">Chọn sản phẩm để mở form chỉnh sửa riêng</p>
                    </div>
                    <button onClick={onClose} className="text-white hover:text-red-200 text-2xl md:text-3xl leading-none ml-4">&times;</button>
                </div>

                <div className="p-3 md:p-6 overflow-y-auto flex-1 bg-gray-50">
                    {products.length > 0 ? (
                        <div className="space-y-2 md:space-y-3">
                            {products.map((product) => {
                                const totalStock = Number(product.totalStock || 0);
                                const allocatedStock = Number(product.allocatedStock ?? product.quantityAllocated ?? product.allocated ?? 0);
                                const availableStock = product.availableStock !== undefined && product.availableStock !== null
                                    ? Number(product.availableStock)
                                    : totalStock - allocatedStock;
                                const incomingStock = Number(product.incomingStock ?? product.inboundStock ?? product.onOrderStock ?? 0);

                                return (
                                    <div key={product.id} className="bg-white border rounded-xl px-3 md:px-4 py-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-sm">
                                        <div className="min-w-0">
                                            <p className="text-xs md:text-sm font-black text-gray-900 truncate uppercase tracking-tight">{product.sku} - {product.name}</p>
                                            <div className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-[9px] md:text-xs text-gray-500 font-bold uppercase">
                                                <span className="bg-gray-100 px-1.5 py-0.5 rounded">BC: {product.barcode || 'N/A'}</span>
                                                <span className="bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded">K/D: {availableStock.toLocaleString()}</span>
                                                <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">P/B: {allocatedStock.toLocaleString()}</span>
                                                <span className="bg-cyan-50 text-cyan-700 px-1.5 py-0.5 rounded">VỀ: {incomingStock.toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => onEditOne(product)}
                                            className="px-6 py-2.5 rounded-lg bg-[#1192a8]/10 text-[#1192a8] border border-[#1192a8]/20 hover:bg-[#1192a8] hover:text-white transition-all text-[10px] md:text-xs font-black uppercase tracking-widest shadow-sm active:scale-95 shrink-0"
                                        >
                                            Chỉnh sửa
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center text-gray-400 py-20 font-bold uppercase text-xs tracking-widest animate-pulse">
                            Không có sản phẩm được chọn.
                        </div>
                    )}
                </div>

                <div className="bg-white p-4 border-t flex justify-end shrink-0">
                    <button onClick={onClose} className="w-full sm:w-auto px-10 py-3 bg-gray-500 text-white rounded-xl font-black hover:bg-gray-600 transition shadow-lg active:scale-95 uppercase text-xs tracking-widest">
                        Đóng cửa sổ
                    </button>
                </div>
            </div>
        </div>
    );
}
