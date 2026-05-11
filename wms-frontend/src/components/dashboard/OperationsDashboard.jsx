import React from 'react';
import QuickActions from './QuickActions';
import PendingTaskTable from './PendingTaskTable';
import inboundIcon from '../common/icons/inbound.png';
import outboundIcon from '../common/icons/outbound.png';

export default function OperationsDashboard({ roles, stats, inboundOrders, outboundOrders, cycleCounts = [] }) {
    return (
        <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
            {/* Notifications for assigned tasks */}
            {cycleCounts.length > 0 && (
                <div className="bg-orange-50 border-2 border-orange-200 p-6 rounded-2xl flex items-center justify-between animate-pulse">
                    <div className="flex items-center gap-4">
                        <div className="text-3xl">📝</div>
                        <div>
                            <h3 className="font-black text-orange-800 uppercase text-sm">Nhiệm vụ kiểm kê mới!</h3>
                            <p className="text-orange-700 text-xs">Bạn có {cycleCounts.length} kế hoạch kiểm kê cần thực hiện ngay.</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => window.location.href = '/admin/cycle-counting'}
                        className="px-6 py-2 bg-orange-600 text-white rounded-xl text-xs font-black hover:bg-orange-700 transition-colors"
                    >
                        ĐI ĐẾN TRANG KIỂM KÊ
                    </button>
                </div>
            )}

            {/* Quick Access Section */}
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Trung tâm điều hành</h2>
                        <p className="text-gray-500 mt-1">Quản lý các luồng nhập xuất và theo dõi tiến độ công việc.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="px-6 py-3 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">{stats?.pendingInbound || 0}</div>
                            <span className="text-blue-700 font-bold text-sm uppercase">Đơn nhập chờ</span>
                        </div>
                        <div className="px-6 py-3 bg-red-50 rounded-2xl border border-red-100 flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">{stats?.pendingOutbound || 0}</div>
                            <span className="text-red-700 font-bold text-sm uppercase">Đơn xuất chờ</span>
                        </div>
                    </div>
                </div>
                <QuickActions roles={roles} />
            </div>

            {/* Main Workspace */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 h-[600px]">
                {/* Inbound Queue */}
                <div className="flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-50 flex items-center gap-4 bg-gradient-to-r from-blue-50 to-white">
                        <img src={inboundIcon} className="w-8 h-8 object-contain" alt="Inbound" />
                        <h3 className="font-black text-gray-800 uppercase tracking-tight">Hàng đang đến / Chờ nhập</h3>
                    </div>
                    <div className="flex-1 overflow-auto">
                        <PendingTaskTable 
                            title="Danh sách phiếu nhập" 
                            data={inboundOrders} 
                            type="inbound" 
                        />
                    </div>
                </div>

                {/* Outbound Queue */}
                <div className="flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-50 flex items-center gap-4 bg-gradient-to-r from-red-50 to-white">
                        <img src={outboundIcon} className="w-8 h-8 object-contain" alt="Outbound" />
                        <h3 className="font-black text-gray-800 uppercase tracking-tight">Đơn bốc hàng / Chờ xuất</h3>
                    </div>
                    <div className="flex-1 overflow-auto">
                        <PendingTaskTable 
                            title="Danh sách phiếu xuất" 
                            data={outboundOrders} 
                            type="outbound" 
                        />
                    </div>
                </div>
            </div>

            {/* Productivity Tips */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <TipCard 
                    icon="🔍" 
                    title="Tra cứu nhanh" 
                    desc="Nhấn Alt + S để mở nhanh thanh tìm kiếm sản phẩm bất kỳ đâu." 
                />
                <TipCard 
                    icon="📦" 
                    title="Quy tắc FEFO" 
                    desc="Hệ thống tự động gợi ý lấy hàng theo lô có ngày hết hạn sớm nhất để giảm hao hụt." 
                />
                <TipCard 
                    icon="📱" 
                    title="Quét mã vạch" 
                    desc="Sử dụng máy quét cầm tay để xác nhận nhanh số lượng thực tế khi nhập/xuất kho." 
                />
            </div>
        </div>
    );
}

function TipCard({ icon, title, desc }) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:border-[#1192a8] transition-colors group">
            <div className="text-3xl mb-4 group-hover:scale-110 transition-transform inline-block">{icon}</div>
            <h4 className="font-bold text-gray-800 mb-2">{title}</h4>
            <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
        </div>
    );
}
