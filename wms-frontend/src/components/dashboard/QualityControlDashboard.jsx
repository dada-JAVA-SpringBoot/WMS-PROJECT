import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import QCInspectionModal from '../modals/QCInspectionModal';
import SystemDialog from '../modals/SystemDialog';

export default function QualityControlDashboard({ roles, stats, inboundOrders, outboundOrders }) {
    // ── States ──
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [detailItems, setDetailItems] = useState([]);
    const [products, setProducts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [dialog, setDialog] = useState({ isOpen: false, title: '', message: '', variant: 'info' });

    // Lọc các đơn hàng cần QC (Ví dụ: Trạng thái PENDING của Inbound)
    const qcInbound = inboundOrders.filter(o => o.status === 'PENDING' || o.status === 'ORDERED');
    const qcOutbound = outboundOrders.filter(o => o.status === 'ALLOCATED' || o.status === 'PICKING');

    // Tải danh sách sản phẩm để mapping tên
    useEffect(() => {
        axiosClient.get('/api/products').then(res => setProducts(res.data)).catch(e => console.warn(e));
    }, []);

    const handleOpenQC = async (order, type) => {
        if (type !== 'INBOUND') {
            setDialog({ isOpen: true, title: 'Thông báo', message: 'Hiện tại hệ thống ưu tiên quy trình QC cho hàng Nhập kho. QC hàng xuất sẽ được cập nhật sớm.', variant: 'info' });
            return;
        }

        setIsLoading(true);
        try {
            const res = await axiosClient.get(`/api/inbound/${order.id}/details`);
            setDetailItems(res.data || []);
            setSelectedOrder(order);
            setIsModalOpen(true);
        } catch (error) {
            setDialog({ isOpen: true, title: 'Lỗi', message: 'Không thể tải chi tiết đơn hàng để kiểm duyệt.', variant: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmQC = async (inspectedItems) => {
        try {
            await axiosClient.post(`/api/inbound/${selectedOrder.id}/qc`, inspectedItems);
            setDialog({ isOpen: true, title: 'Thành công', message: `Đã hoàn tất kiểm duyệt phiếu ${selectedOrder.receiptCode}. Dữ liệu đã được cập nhật vào kho.`, variant: 'success' });
            setIsModalOpen(false);
            // Reload page to refresh dashboard lists
            setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
            setDialog({ isOpen: true, title: 'Lỗi', message: 'Cập nhật QC thất bại: ' + (error.response?.data?.message || error.message), variant: 'error' });
        }
    };

    return (
        <div className="space-y-8 animate-in slide-in-from-right duration-500">
            <SystemDialog 
                isOpen={dialog.isOpen} 
                title={dialog.title} 
                message={dialog.message} 
                variant={dialog.variant} 
                onClose={() => setDialog({ ...dialog, isOpen: false })} 
                onConfirm={() => setDialog({ ...dialog, isOpen: false })}
            />

            {/* Header: Focus on Quality Assurance */}
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h2 className="text-xl md:text-2xl font-black text-gray-800 uppercase tracking-tight flex items-center gap-3">
                        <span className="p-2 bg-purple-100 rounded-lg text-purple-600 text-xl">🛡️</span>
                        Kiểm soát chất lượng (QC)
                    </h2>
                    <p className="text-gray-500 mt-1 text-sm md:text-base">Đảm bảo hàng hóa nhập xuất đúng tiêu chuẩn và số lượng.</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <div className="flex-1 md:flex-none text-center px-6 py-3 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="text-2xl font-black text-purple-600">{qcInbound.length + qcOutbound.length}</div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Đợi kiểm duyệt</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* QC Inspection Queue */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-[500px] md:h-[600px] flex flex-col">
                        <div className="p-4 md:p-6 border-b border-gray-50 bg-gradient-to-r from-purple-50 to-white flex justify-between items-center">
                            <h3 className="font-black text-gray-800 uppercase tracking-tight text-xs md:text-sm">Hàng đợi kiểm định</h3>
                            <div className="flex gap-2">
                                <span className="px-3 py-1 bg-purple-100 text-purple-700 text-[9px] md:text-[10px] font-bold rounded-full">NHẬP: {qcInbound.length}</span>
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-[9px] md:text-[10px] font-bold rounded-full">XUẤT: {qcOutbound.length}</span>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto no-scrollbar p-3 md:p-4">
                            <div className="space-y-4">
                                {qcInbound.length > 0 ? qcInbound.map(order => (
                                    <QCItem key={order.id} order={order} type="INBOUND" onInspect={() => handleOpenQC(order, 'INBOUND')} isLoading={isLoading && selectedOrder?.id === order.id} />
                                )) : qcOutbound.length > 0 ? qcOutbound.map(order => (
                                    <QCItem key={order.id} order={order} type="OUTBOUND" onInspect={() => handleOpenQC(order, 'OUTBOUND')} />
                                )) : (
                                    <div className="h-64 flex flex-col items-center justify-center text-gray-400 italic text-sm">
                                        <p>Hiện không có đơn hàng nào cần kiểm định.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar: Useful info for QC */}
                <div className="space-y-6">
                    <div className="bg-white p-5 md:p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="font-black text-gray-800 mb-4 border-b pb-2 text-[11px] md:text-sm uppercase tracking-widest">Quy trình QC chuẩn</h3>
                        <ul className="space-y-4">
                            <StepItem number="1" text="Đối chiếu thực tế với phiếu giao hàng của nhà cung cấp." />
                            <StepItem number="2" text="Kiểm tra bao bì, nhãn mác và hạn sử dụng sản phẩm." />
                            <StepItem number="3" text="Phân loại hàng nguyên vẹn và hàng lỗi/hỏng." />
                            <StepItem number="4" text="Xác nhận trạng thái trên hệ thống để hoàn tất phiếu." />
                        </ul>
                    </div>

                    <div className="bg-purple-600 p-6 rounded-2xl text-white shadow-xl shadow-purple-100">
                        <h3 className="font-black text-lg mb-2 uppercase tracking-tight">Lưu ý hàng dễ vỡ</h3>
                        <p className="text-purple-100 text-xs md:text-sm leading-relaxed italic">
                            "Cần kiểm tra kỹ các lô hàng điện tử nhạy cảm. Báo cáo ngay nếu phát hiện va đập bên ngoài thùng hàng."
                        </p>
                    </div>
                </div>
            </div>

            {/* Modal Kiểm định */}
            {isModalOpen && (
                <QCInspectionModal 
                    isOpen={isModalOpen} 
                    onClose={() => setIsModalOpen(false)} 
                    items={detailItems} 
                    products={products} 
                    onConfirm={handleConfirmQC} 
                />
            )}
        </div>
    );
}

function QCItem({ order, type, onInspect, isLoading }) {
    return (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-purple-300 hover:bg-white transition-all gap-4">
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xs shadow-sm shrink-0 ${type === 'INBOUND' ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}>
                    {type === 'INBOUND' ? 'IN' : 'OUT'}
                </div>
                <div className="min-w-0">
                    <div className="text-sm font-black text-gray-800 truncate uppercase tracking-tight">{type === 'INBOUND' ? order.receiptCode : order.issueCode}</div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">{new Date(type === 'INBOUND' ? order.receiptDate : order.issueDate).toLocaleDateString('vi-VN')}</div>
                </div>
            </div>
            <button 
                onClick={onInspect}
                disabled={isLoading}
                className="px-6 py-2.5 bg-white border-2 border-purple-100 rounded-xl text-[10px] md:text-xs font-black text-purple-600 hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-all active:scale-95 shadow-sm uppercase tracking-widest disabled:opacity-50"
            >
                {isLoading ? 'ĐANG TẢI...' : 'KIỂM TRA NGAY'}
            </button>
        </div>
    );
}

function StepItem({ number, text }) {
    return (
        <li className="flex gap-3 items-start">
            <span className="w-5 h-5 bg-purple-100 text-purple-600 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-black">{number}</span>
            <span className="text-[11px] md:text-xs text-gray-600 font-medium leading-snug">{text}</span>
        </li>
    );
}
