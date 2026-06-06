import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function SmartAssistant({ stats, inboundOrders, outboundOrders, cycleCounts }) {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    const roles = user?.roles || [];
    
    // Expert System Analysis Logic (Heuristic-based)
    const analysis = useMemo(() => {
        if (!user) return null;
        
        const tasks = [];
        const recommendations = [];

        // 1. Phân tích cho Quản lý & Kế toán
        if (roles.includes('ADMIN') || roles.includes('MANAGER') || roles.includes('ACCOUNTANT')) {
            const occupancy = stats?.warehouseOccupancyRate || 0;
            if (occupancy > 85) recommendations.push("Kho đã gần đầy ( >85% ). Cân nhắc tối ưu hóa vị trí hoặc xuất bớt hàng cũ.");
            if (stats?.lowStockCount > 0) recommendations.push(`Có ${stats.lowStockCount} mặt hàng dưới định mức an toàn. Cần lên kế hoạch nhập hàng.`);
            
            if (roles.includes('ACCOUNTANT')) {
                recommendations.push("Kiểm tra báo cáo tồn kho giá trị cao để tối ưu dòng vốn.");
            } else {
                tasks.push(`Theo dõi ${inboundOrders.length} đơn nhập và ${outboundOrders.length} đơn xuất đang xử lý.`);
            }
        }

        // 2. Phân tích cho Thủ kho / Kiểm kê / Nhân viên kho / Nhân viên điều chuyển
        if (roles.includes('STOREKEEPER') || roles.includes('WAREHOUSE_KEEPER') || roles.includes('INVENTORY_CHECKER') || roles.includes('CHECKER') || roles.includes('HANDLER')) {
            if (cycleCounts.length > 0) {
                tasks.push(`Hoàn thành ${cycleCounts.length} đợt kiểm kê được giao.`);
                recommendations.push("Ưu tiên kiểm kê trước giờ xuất hàng cao điểm để đảm bảo số liệu chính xác.");
            }
            if (stats?.nearExpiryProducts?.length > 0) {
                recommendations.push(`Có ${stats.nearExpiryProducts.length} lô hàng sắp hết hạn. Cần kiểm tra tình trạng thực tế để ưu tiên xuất.`);
            }
            if (roles.includes('HANDLER')) {
                recommendations.push("Theo dõi các vị trí trống để tối ưu hóa việc sắp xếp hàng hóa khi điều chuyển.");
            }
        }

        // 3. Phân tích cho Nhân viên Nhập/Xuất & QC
        if (roles.includes('INBOUND_STAFF') || roles.includes('OUTBOUND_STAFF') || roles.includes('QUALITY_CONTROL')) {
            const pendingIn = inboundOrders.filter(o => o.status === 'PENDING' || o.status === 'DRAFT' || o.status === 'ORDERED').length;
            const pendingOut = outboundOrders.filter(o => o.status === 'ALLOCATED' || o.status === 'PICKING' || o.status === 'DRAFT').length;
            
            if (roles.includes('QUALITY_CONTROL')) {
                const needsQC = inboundOrders.filter(o => o.status === 'PENDING' || o.status === 'ORDERED').length;
                if (needsQC > 0) tasks.push(`Có ${needsQC} lô hàng nhập mới cần kiểm duyệt chất lượng.`);
            } else {
                if (pendingIn > 0) tasks.push(`Xử lý ${pendingIn} phiếu nhập kho đang đợi.`);
                if (pendingOut > 0) tasks.push(`Chuẩn bị hàng cho ${pendingOut} lệnh xuất kho.`);
            }
            
            if (pendingIn + pendingOut > 10) recommendations.push("Lượng đơn hàng hôm nay khá lớn. Hãy sử dụng Wave Picking để tăng tốc độ lấy hàng.");
        }

        return { tasks, recommendations };
    }, [user, roles, stats, inboundOrders, outboundOrders, cycleCounts]);

    if (!user) return null;

    return (
        <div className="fixed bottom-8 right-8 z-[200] flex flex-col items-end gap-4">
            {/* Popover */}
            {isOpen && (
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-80 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                    <div className="bg-gradient-to-r from-[#1192a8] to-teal-600 p-6 text-white">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-black uppercase tracking-tight text-sm">Trợ lý công việc thông minh</h3>
                            <button onClick={() => setIsOpen(false)} className="opacity-60 hover:opacity-100">×</button>
                        </div>
                        <p className="text-[10px] text-teal-50 opacity-80 uppercase font-bold">Phân tích công việc ngày: {new Date().toLocaleDateString('vi-VN')}</p>
                    </div>
                    
                    <div className="p-6 space-y-6 max-h-[400px] overflow-auto">
                        {/* Tasks Section */}
                        <div>
                            <h4 className="text-[10px] font-black text-gray-400 uppercase mb-3 tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> Mục tiêu hôm nay
                            </h4>
                            <ul className="space-y-3">
                                {analysis?.tasks.length > 0 ? analysis.tasks.map((t, i) => (
                                    <li key={i} className="text-xs font-bold text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                                        {t}
                                    </li>
                                )) : (
                                    <li className="text-xs text-gray-400 italic">Hôm nay không có nhiệm vụ khẩn cấp nào.</li>
                                )}
                            </ul>
                        </div>

                        {/* Analysis Section */}
                        <div>
                            <h4 className="text-[10px] font-black text-gray-400 uppercase mb-3 tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span> Phân tích & Gợi ý
                            </h4>
                            <ul className="space-y-3">
                                {analysis?.recommendations.map((r, i) => (
                                    <li key={i} className="text-xs font-medium text-gray-600 leading-relaxed flex gap-2">
                                        <span className="text-orange-500">💡</span>
                                        {r}
                                    </li>
                                ))}
                                {analysis?.recommendations.length === 0 && (
                                    <li className="text-xs text-gray-400 italic">Hệ thống chưa ghi nhận rủi ro nào cần xử lý.</li>
                                )}
                            </ul>
                        </div>
                    </div>

                    <div className="p-4 bg-gray-50 border-t flex justify-center">
                        <span className="text-[9px] font-bold text-gray-400 uppercase">Được hỗ trợ bởi Trợ lý ảo thông minh WMS</span>
                    </div>
                </div>
            )}

            {/* Floating Toggle Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-90 ${isOpen ? 'bg-gray-800 rotate-90' : 'bg-[#1192a8] animate-bounce-slow'}`}
            >
                {isOpen ? (
                    <span className="text-white text-2xl font-light">×</span>
                ) : (
                    <div className="relative">
                        <span className="text-3xl">🤖</span>
                        { (analysis?.tasks.length > 0) && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black text-white">
                                {analysis.tasks.length}
                            </span>
                        )}
                    </div>
                )}
            </button>
        </div>
    );
}
