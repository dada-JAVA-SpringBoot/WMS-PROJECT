import React from 'react';
import { useNavigate } from 'react-router-dom';
import KPICards from './KPICards';
import InventoryAlerts from './InventoryAlerts';
import QuickActions from './QuickActions';

export default function StorageDashboard({ stats, roles, cycleCounts = [] }) {
    const navigate = useNavigate();
    const activeCounts = cycleCounts.filter(p => p.status !== 'COMPLETED');

    return (
        <div className="space-y-8 animate-in zoom-in duration-500">
            {/* Notifications for assigned tasks */}
            {activeCounts.length > 0 && (
                <div className="bg-orange-50 border-2 border-orange-200 p-6 rounded-2xl flex items-center justify-between animate-pulse shadow-lg shadow-orange-100/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-2xl">📝</div>
                        <div>
                            <h3 className="font-black text-orange-800 uppercase text-sm tracking-tight">Bạn có nhiệm vụ kiểm kê!</h3>
                            <p className="text-orange-700 text-xs font-medium">Có {activeCounts.length} kế hoạch kiểm kê đang đợi bạn xử lý.</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => navigate('/admin/cycle-counting')}
                        className="px-6 py-3 bg-orange-600 text-white rounded-xl text-xs font-black hover:bg-orange-700 transition-all active:scale-95 shadow-md shadow-orange-200"
                    >
                        KIỂM KÊ NGAY
                    </button>
                </div>
            )}

            {/* Header: Occupancy focus */}
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-8">
                <div className="relative w-32 h-32 flex-shrink-0">
                    <svg className="w-full h-full" viewBox="0 0 36 36">
                        <path
                            className="text-gray-100"
                            strokeDasharray="100, 100"
                            strokeWidth="3"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                            className="text-[#1192a8]"
                            strokeDasharray={`${stats?.warehouseOccupancyRate || 0}, 100`}
                            strokeWidth="3"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-black text-gray-800">{stats?.warehouseOccupancyRate || 0}%</span>
                        <span className="text-[8px] font-bold text-gray-400 uppercase">Lấp đầy</span>
                    </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Quản lý kho hàng & Sức chứa</h2>
                    <p className="text-gray-500 mt-1 max-w-2xl">
                        Kho hiện đang sử dụng <span className="font-bold text-[#1192a8]">{stats?.warehouseOccupancyRate}%</span> tổng sức chứa. 
                        Có <span className="font-bold text-orange-600">{stats?.lowStockCount}</span> mặt hàng cần bổ sung và <span className="font-bold text-red-600">{stats?.nearExpiryProducts?.length || 0}</span> lô hàng sắp hết hạn.
                    </p>
                </div>
            </div>

            {/* KPIs for Storekeeper */}
            <KPICards data={stats} roles={roles} />

            {/* Critical Alerts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <InventoryAlerts 
                        nearExpiry={stats?.nearExpiryProducts} 
                        topStock={stats?.topStockProducts} 
                    />
                </div>
                
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Thao tác kho</h3>
                        <QuickActions roles={roles} />
                    </div>

                    <div className="bg-orange-50 border border-orange-100 p-6 rounded-2xl">
                        <h3 className="font-bold text-orange-800 mb-2 flex items-center gap-2">
                            <span>💡</span> Lưu ý sắp xếp
                        </h3>
                        <p className="text-sm text-orange-700 leading-relaxed">
                            Khu vực A đang có tỉ lệ lấp đầy cao (95%). Hãy cân nhắc điều chuyển hàng hóa sang Khu vực B để tối ưu không gian vận hành.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
