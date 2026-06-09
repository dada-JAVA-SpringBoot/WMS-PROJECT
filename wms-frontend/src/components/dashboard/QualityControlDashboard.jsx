import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axiosClient from '../../api/axiosClient';
import QCInspectionModal from '../modals/QCInspectionModal';
import SystemDialog from '../modals/SystemDialog';

export default function QualityControlDashboard({ roles, stats, inboundOrders, outboundOrders }) {
    const { t } = useTranslation();
    // ── States ──
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [detailItems, setDetailItems] = useState([]);
    const [products, setProducts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [dialog, setDialog] = useState({ isOpen: false, title: '', message: '', variant: 'info' });

    // Lọc các đơn hàng cần QC (Ví dụ: Trạng thái PENDING của Inbound)
    const safeInbound = Array.isArray(inboundOrders) ? inboundOrders : [];
    const safeOutbound = Array.isArray(outboundOrders) ? outboundOrders : [];

    const qcInbound = safeInbound.filter(o => o.status === 'PENDING' || o.status === 'ORDERED');
    const qcOutbound = safeOutbound.filter(o => o.status === 'ALLOCATED' || o.status === 'PICKING');

    // Tải danh sách sản phẩm để mapping tên
    useEffect(() => {
        axiosClient.get('/api/products').then(res => setProducts(res.data)).catch(e => console.warn(e));
    }, []);

    const handleOpenQC = async (order, type) => {
        if (type !== 'INBOUND') {
            setDialog({ isOpen: true, title: t('pages.QualityControlDashboard.notification'), message: t('pages.QualityControlDashboard.qcPriorityInbound'), variant: 'info' });
            return;
        }

        setIsLoading(true);
        try {
            const res = await axiosClient.get(`/api/inbound/${order.id}/details`);
            setDetailItems(res.data || []);
            setSelectedOrder(order);
            setIsModalOpen(true);
        } catch (error) {
            setDialog({ isOpen: true, title: t('pages.QualityControlDashboard.error'), message: t('pages.QualityControlDashboard.failedLoadDetails'), variant: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmQC = async (inspectedItems) => {
        try {
            await axiosClient.post(`/api/inbound/${selectedOrder.id}/qc`, inspectedItems);
            setDialog({ isOpen: true, title: t('pages.QualityControlDashboard.success'), message: t('pages.QualityControlDashboard.qcCompleteMsg', { code: selectedOrder.receiptCode }), variant: 'success' });
            setIsModalOpen(false);
            // Reload page to refresh dashboard lists
            setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
            setDialog({ isOpen: true, title: t('pages.QualityControlDashboard.error'), message: t('pages.QualityControlDashboard.qcFailedMsg') + (error.response?.data?.message || error.message), variant: 'error' });
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
            <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 transition-colors">
                <div>
                    <h2 className="text-xl md:text-2xl font-black text-gray-800 dark:text-gray-100 uppercase tracking-tight flex items-center gap-3">
                        <span className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400 text-xl">🛡️</span>
                        {t('pages.QualityControlDashboard.title')}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm md:text-base">{t('pages.QualityControlDashboard.description')}</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <div className="flex-1 md:flex-none text-center px-6 py-3 bg-gray-50 dark:bg-gray-700 rounded-2xl border border-gray-100 dark:border-gray-600">
                        <div className="text-2xl font-black text-purple-600 dark:text-purple-400">{qcInbound.length + qcOutbound.length}</div>
                        <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('pages.QualityControlDashboard.waitingForInspection')}</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* QC Inspection Queue */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden h-[500px] md:h-[600px] flex flex-col transition-colors">
                        <div className="p-4 md:p-6 border-b border-gray-50 dark:border-gray-700 bg-gradient-to-r from-purple-50 dark:from-purple-900/20 to-white dark:to-gray-800 flex justify-between items-center">
                            <h3 className="font-black text-gray-800 dark:text-gray-100 uppercase tracking-tight text-xs md:text-sm">{t('pages.QualityControlDashboard.inspectionQueue')}</h3>
                            <div className="flex gap-2">
                                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-[9px] md:text-[10px] font-bold rounded-full">{t('pages.QualityControlDashboard.inboundLabel')}{qcInbound.length}</span>
                                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[9px] md:text-[10px] font-bold rounded-full">{t('pages.QualityControlDashboard.outboundLabel')}{qcOutbound.length}</span>
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
                                        <p>{t('pages.QualityControlDashboard.noOrders')}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar: Useful info for QC */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-5 md:p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm transition-colors">
                        <h3 className="font-black text-gray-800 dark:text-gray-100 mb-4 border-b dark:border-gray-700 pb-2 text-[11px] md:text-sm uppercase tracking-widest">{t('pages.QualityControlDashboard.standardProcess')}</h3>
                        <ul className="space-y-4">
                            <StepItem number="1" text={t('pages.QualityControlDashboard.step1')} />
                            <StepItem number="2" text={t('pages.QualityControlDashboard.step2')} />
                            <StepItem number="3" text={t('pages.QualityControlDashboard.step3')} />
                            <StepItem number="4" text={t('pages.QualityControlDashboard.step4')} />
                        </ul>
                    </div>

                    <div className="bg-purple-600 dark:bg-purple-800 p-6 rounded-2xl text-white shadow-xl shadow-purple-100 dark:shadow-none transition-colors">
                        <h3 className="font-black text-lg mb-2 uppercase tracking-tight">{t('pages.QualityControlDashboard.fragileNote')}</h3>
                        <p className="text-purple-100 text-xs md:text-sm leading-relaxed italic">
                            {t('pages.QualityControlDashboard.fragileDesc')}
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
    const { t } = useTranslation();
    return (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-2xl border border-gray-100 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-500 hover:bg-white dark:hover:bg-gray-800 transition-all gap-4">
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xs shadow-sm shrink-0 ${type === 'INBOUND' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
                    {type === 'INBOUND' ? 'IN' : 'OUT'}
                </div>
                <div className="min-w-0">
                    <div className="text-sm font-black text-gray-800 dark:text-gray-200 truncate uppercase tracking-tight">{type === 'INBOUND' ? order.receiptCode : order.issueCode}</div>
                    <div className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase mt-0.5">{new Date(type === 'INBOUND' ? order.receiptDate : order.issueDate).toLocaleDateString('vi-VN')}</div>
                </div>
            </div>
            <button 
                onClick={onInspect}
                disabled={isLoading}
                className="px-6 py-2.5 bg-white dark:bg-gray-800 border-2 border-purple-100 dark:border-purple-900/30 rounded-xl text-[10px] md:text-xs font-black text-purple-600 dark:text-purple-400 hover:bg-purple-600 dark:hover:bg-purple-700 hover:text-white dark:hover:text-white hover:border-purple-600 dark:hover:border-purple-700 transition-all active:scale-95 shadow-sm uppercase tracking-widest disabled:opacity-50"
            >
                {isLoading ? t('pages.QualityControlDashboard.loading') : t('pages.QualityControlDashboard.inspectNow')}
            </button>
        </div>
    );
}

function StepItem({ number, text }) {
    return (
        <li className="flex gap-3 items-start">
            <span className="w-5 h-5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-black">{number}</span>
            <span className="text-[11px] md:text-xs text-gray-600 dark:text-gray-400 font-medium leading-snug">{text}</span>
        </li>
    );
}
