import React, { useState, useEffect, useCallback } from 'react';
import axiosClient from '../api/axiosClient';
import { ActionButton } from '../components/common/SharedUI';
import SystemDialog from '../components/modals/SystemDialog';
import addIcon from '../components/common/icons/add.png';
import excel1Icon from '../components/common/icons/excel1.png';
import outboundIcon from '../components/common/icons/outbound.png';

export default function WavePicking() {
    const [waves, setWaves] = useState([]);
    const [pendingOrders, setPendingOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrders, setSelectedOrders] = useState([]);
    const [pickingList, setPickingList] = useState(null);
    const [activeWave, setActiveWave] = useState(null);

    const [dialog, setDialog] = useState({ isOpen: false, title: '', message: '', variant: 'info' });
    const showMsg = (title, message, variant = 'info') => setDialog({ isOpen: true, title, message, variant });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [wavesRes, ordersRes] = await Promise.all([
                axiosClient.get('/api/waves'),
                axiosClient.get('/api/outbound-orders')
            ]);
            setWaves(wavesRes.data);
            setPendingOrders(ordersRes.data.filter(o => o.status === 'ALLOCATED'));
        } catch (error) {
            console.error("Lỗi tải dữ liệu Wave Picking:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCreateWave = async () => {
        if (selectedOrders.length === 0) return showMsg("Yêu cầu", "Vui lòng chọn ít nhất một đơn hàng để tạo Wave.", "info");

        try {
            await axiosClient.post('/api/waves', { orderIds: selectedOrders, note: `Wave created on ${new Date().toLocaleString()}` });
            showMsg("Thành công", "Đã tạo đợt lấy hàng (Wave) mới!", "info");
            setSelectedOrders([]);
            fetchData();
        } catch (error) {
            showMsg("Lỗi", "Không thể tạo Wave: " + error.message, "info");
        }
    };

    const viewPickingList = async (wave) => {
        try {
            const res = await axiosClient.get(`/api/waves/${wave.id}/picking-list`);
            setPickingList(res.data);
            setActiveWave(wave);
        } catch (error) {
            showMsg("Lỗi", "Không thể tải danh sách lấy hàng.", "info");
        }
    };

    const handleCompleteWave = async (waveId) => {
        try {
            await axiosClient.put(`/api/waves/${waveId}/complete`);
            showMsg("Thành công", "Đã hoàn thành đợt lấy hàng!", "info");
            setPickingList(null);
            setActiveWave(null);
            fetchData();
        } catch (error) {
            showMsg("Lỗi", "Không thể hoàn thành Wave.", "info");
        }
    };

    const toggleOrder = (id) => {
        setSelectedOrders(prev => prev.includes(id) ? prev.filter(oid => oid !== id) : [...prev, id]);
    };

    return (
        <div className="p-4 md:p-6 bg-[#f8f9fa] dark:bg-gray-900 min-h-full flex flex-col text-left font-sans text-gray-800 dark:text-gray-100 no-scrollbar transition-colors duration-300">
            <SystemDialog
                isOpen={dialog.isOpen}
                title={dialog.title}
                message={dialog.message}
                variant={dialog.variant}
                onClose={() => setDialog({ ...dialog, isOpen: false })}
            />

            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6 md:mb-8 transition-all">
                <div>
                    <h1 className="text-xl md:text-2xl font-black text-gray-800 dark:text-gray-100 uppercase tracking-tight">Wave Picking</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm font-medium">Gộp nhiều đơn hàng để tối ưu quãng đường di chuyển của nhân viên kho.</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 md:p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex gap-4 shrink-0 transition-colors duration-300">
                    <ActionButton label="TẠO WAVE" iconSrc={addIcon} onClick={handleCreateWave} disabled={selectedOrders.length === 0} />
                    <ActionButton label="LÀM MỚI" iconSrc={excel1Icon} onClick={fetchData} />
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8 flex-1">

                {/* 1. Đơn hàng sẵn sàng để gom Wave */}
                <div className="xl:col-span-1 bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col h-[500px] md:h-[700px] transition-colors duration-300">
                    <div className="p-4 md:p-6 border-b border-gray-50 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/50 rounded-t-2xl md:rounded-t-3xl">
                        <h3 className="font-black text-gray-800 dark:text-gray-100 uppercase text-[10px] md:text-xs tracking-widest flex items-center gap-2">
                            <span>📋</span> Đơn sẵn sàng ({pendingOrders.length})
                        </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto no-scrollbar p-3 md:p-4 space-y-3">
                        {pendingOrders.map(order => (
                            <div
                                key={order.id}
                                onClick={() => toggleOrder(order.id)}
                                className={`p-3 md:p-4 rounded-xl md:rounded-2xl border-2 transition-all cursor-pointer
                                    ${selectedOrders.includes(order.id)
                                    ? 'border-[#1192a8] bg-cyan-50 dark:bg-[#1192a8]/15'
                                    : 'border-gray-50 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-500'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-black text-[#1192a8] dark:text-[#38bcd4] text-sm">{order.issueCode}</span>
                                    <input
                                        type="checkbox"
                                        checked={selectedOrders.includes(order.id)}
                                        readOnly
                                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-[#1192a8] focus:ring-[#1192a8]"
                                    />
                                </div>
                                <div className="text-[9px] md:text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">{new Date(order.issueDate).toLocaleDateString('vi-VN')}</div>
                                <div className="text-[11px] md:text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">KH: Đối tác #{order.customerId}</div>
                            </div>
                        ))}
                        {pendingOrders.length === 0 && (
                            <div className="py-20 text-center text-gray-300 dark:text-gray-600 italic text-sm">
                                Không có đơn hàng nào chờ gom Wave.
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. Danh sách Wave hiện có */}
                <div className="xl:col-span-2 space-y-6 md:space-y-8 flex flex-col h-auto md:h-[700px]">

                    {/* Bảng Waves */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden flex-1 flex flex-col h-[400px] md:h-auto transition-colors duration-300">
                        <div className="p-4 md:p-6 border-b border-gray-50 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/50">
                            <h3 className="font-black text-gray-800 dark:text-gray-100 uppercase text-[10px] md:text-xs tracking-widest flex items-center gap-2">
                                <span>🌊</span> Các đợt lấy hàng (Waves)
                            </h3>
                        </div>
                        <div className="flex-1 overflow-x-auto no-scrollbar lg:scrollbar-thin">
                            <table className="w-full text-left min-w-[600px]">
                                <thead className="bg-gray-50/80 dark:bg-gray-700/50 text-[9px] md:text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase sticky top-0 z-10 backdrop-blur-sm">
                                <tr>
                                    <th className="p-4 md:p-5">Mã Wave</th>
                                    <th className="p-4 md:p-5">Ngày tạo</th>
                                    <th className="p-4 md:p-5">Trạng thái</th>
                                    <th className="p-4 md:p-5 text-right">Thao tác</th>
                                </tr>
                                </thead>
                                <tbody className="text-xs md:text-sm divide-y divide-gray-50 dark:divide-gray-700/50">
                                {waves.map(wave => (
                                    <tr key={wave.id} className="hover:bg-blue-50/50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="p-4 md:p-5 font-black text-gray-700 dark:text-gray-200">{wave.waveCode}</td>
                                        <td className="p-4 md:p-5 text-gray-500 dark:text-gray-400">{new Date(wave.createdAt).toLocaleString('vi-VN')}</td>
                                        <td className="p-4 md:p-5">
                                                <span className={`px-2 md:px-3 py-1 rounded-full text-[9px] md:text-[10px] font-black uppercase border
                                                    ${wave.status === 'COMPLETED'
                                                    ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-100 dark:border-green-800'
                                                    : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800'
                                                }`}>
                                                    {wave.status}
                                                </span>
                                        </td>
                                        <td className="p-4 md:p-5 text-right">
                                            <button
                                                onClick={() => viewPickingList(wave)}
                                                className="px-3 md:px-4 py-1.5 md:py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black text-[#1192a8] dark:text-[#38bcd4] hover:bg-cyan-50 dark:hover:bg-[#1192a8]/15 transition-colors shadow-sm active:scale-95"
                                            >
                                                CHI TIẾT
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* 3. Chi tiết Picking List khi nhấn xem */}
                    {pickingList && (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl border-2 border-[#1192a8] shadow-xl overflow-hidden flex flex-col h-[500px] animate-in slide-in-from-bottom duration-300 transition-colors">
                            <div className="p-4 md:p-6 border-b border-gray-100 dark:border-gray-700 bg-[#1192a8] text-white flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 shrink-0">
                                <div className="min-w-0">
                                    <h3 className="font-black uppercase tracking-widest text-xs md:text-sm truncate">Picking List: {activeWave?.waveCode}</h3>
                                    <p className="text-[9px] md:text-[10px] opacity-80 uppercase font-bold">Lộ trình tối ưu (Sắp xếp theo Vị trí)</p>
                                </div>
                                {activeWave?.status !== 'COMPLETED' && (
                                    <button
                                        onClick={() => handleCompleteWave(activeWave.id)}
                                        className="px-6 py-2 bg-white text-[#1192a8] rounded-xl text-[10px] md:text-xs font-black hover:bg-cyan-50 shadow-lg active:scale-95 uppercase tracking-tighter"
                                    >
                                        Xác nhận hoàn tất
                                    </button>
                                )}
                            </div>
                            <div className="flex-1 overflow-x-auto no-scrollbar lg:scrollbar-thin">
                                <table className="w-full text-left min-w-[700px]">
                                    <thead className="bg-gray-50/80 dark:bg-gray-700/50 text-[9px] md:text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase sticky top-0 z-10 backdrop-blur-sm">
                                    <tr>
                                        <th className="p-4">Vị trí (Bin)</th>
                                        <th className="p-4">Sản phẩm / SKU</th>
                                        <th className="p-4">Lô</th>
                                        <th className="p-4 text-right">SL cần lấy</th>
                                        <th className="p-4">Cho các đơn</th>
                                    </tr>
                                    </thead>
                                    <tbody className="text-xs md:text-sm divide-y divide-gray-50 dark:divide-gray-700/50">
                                    {pickingList.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-blue-50/50 dark:hover:bg-gray-700/30 transition-colors">
                                            <td className="p-4">
                                                <span className="font-black text-[#1192a8] dark:text-[#38bcd4] text-sm md:text-base uppercase">{item.binCode}</span>
                                                <div className="text-[8px] md:text-[9px] text-gray-400 dark:text-gray-500 font-bold uppercase">{item.zone} - {item.aisle}/{item.rack}/{item.level}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-bold text-gray-800 dark:text-gray-100 uppercase truncate max-w-[150px]" title={item.productName}>{item.productName}</div>
                                                <div className="text-[9px] md:text-[10px] font-mono text-gray-400 dark:text-gray-500">{item.productSku}</div>
                                            </td>
                                            <td className="p-4 font-mono font-bold text-gray-500 dark:text-gray-400">{item.batchCode}</td>
                                            <td className="p-4 text-right">
                                                <span className="text-lg md:text-xl font-black text-red-600 dark:text-red-400">{item.totalQuantity}</span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {item.orderCodes.split(', ').map(code => (
                                                        <span key={code} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[8px] md:text-[9px] font-bold text-gray-500 dark:text-gray-400">{code}</span>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}