import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';
import ExecutiveDashboard from '../components/dashboard/ExecutiveDashboard';
import OperationsDashboard from '../components/dashboard/OperationsDashboard';
import StorageDashboard from '../components/dashboard/StorageDashboard';
import QualityControlDashboard from '../components/dashboard/QualityControlDashboard';
import SmartAssistant from '../components/common/SmartAssistant';
import { getRoleLabel } from '../api/roleUtils';

export default function Home() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [inboundOrders, setInboundOrders] = useState([]);
    const [outboundOrders, setOutboundOrders] = useState([]);
    const [cycleCounts, setCycleCounts] = useState([]);
    const [loading, setLoading] = useState(true);

    const roles = user?.roles || [];

    // Xác định Dashboard phù hợp nhất cho User
    const dashboardType = useMemo(() => {
        if (roles.some(r => ['ADMIN', 'MANAGER'].includes(r))) return 'EXECUTIVE';
        if (roles.some(r => ['STOREKEEPER', 'INVENTORY_CHECKER', 'HANDLER', 'WAREHOUSE_KEEPER'].includes(r))) return 'STORAGE';
        if (roles.some(r => ['INBOUND_STAFF', 'OUTBOUND_STAFF'].includes(r))) return 'OPERATIONS';
        if (roles.some(r => ['QUALITY_CONTROL'].includes(r))) return 'QC';
        return 'NONE'; // Không có dashboard phù hợp
    }, [roles]);

    useEffect(() => {
        fetchData();
    }, [user, dashboardType]);

    const fetchData = async () => {
        if (dashboardType === 'NONE') {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            // 1. Dashboard Stats
            try {
                const statsRes = await axiosClient.get('/api/stats/dashboard');
                setStats(statsRes.data);
            } catch (e) {
                console.warn("Lỗi tải thông số Dashboard:", e.message);
            }

            // 2. Pending Inbound Orders
            const canSeeInbound = roles.some(r => ['ADMIN', 'MANAGER', 'STOREKEEPER', 'WAREHOUSE_KEEPER', 'INBOUND_STAFF', 'QUALITY_CONTROL'].includes(r));
            if (canSeeInbound) {
                try {
                    const inRes = await axiosClient.get('/api/inbound');
                    setInboundOrders(inRes.data || []);
                } catch (e) {
                    console.warn("Lỗi tải danh sách phiếu nhập:", e.message);
                }
            }

            // 3. Pending Outbound Orders
            const canSeeOutbound = roles.some(r => ['ADMIN', 'MANAGER', 'STOREKEEPER', 'WAREHOUSE_KEEPER', 'INBOUND_STAFF', 'OUTBOUND_STAFF', 'QUALITY_CONTROL'].includes(r));
            if (canSeeOutbound) {
                try {
                    const outRes = await axiosClient.get('/api/outbound-orders');
                    setOutboundOrders(outRes.data || []);
                } catch (e) {
                    console.warn("Lỗi tải danh sách phiếu xuất:", e.message);
                }
            }

            // 4. Assigned Cycle Counts
            const canSeeCounting = roles.some(r => ['ADMIN', 'MANAGER', 'STOREKEEPER', 'WAREHOUSE_KEEPER', 'CHECKER'].includes(r));
            if (canSeeCounting && user?.id) {
                try {
                    const ccRes = await axiosClient.get('/api/cycle-counts');
                    const assigned = (ccRes.data || []).filter(p =>
                        p.status !== 'COMPLETED' && String(p.assignedTo) === String(user.id)
                    );
                    setCycleCounts(assigned);
                } catch (e) {
                    console.warn("Lỗi tải danh sách kiểm kê:", e.message);
                }
            }
        } catch (error) {
            console.error("Lỗi tổng quát khi tải dữ liệu dashboard:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full bg-[#f8fafc] dark:bg-gray-900 transition-colors duration-300">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1192a8]"></div>
                    <span className="text-gray-500 dark:text-gray-400 font-bold animate-pulse uppercase text-xs tracking-widest">Đang khởi tạo không gian làm việc...</span>
                </div>
            </div>
        );
    }

    if (dashboardType === 'NONE') {
        return (
            <div className="min-h-full flex items-center justify-center bg-[#f8fafc] dark:bg-gray-900 p-6 transition-colors duration-300">
                <div className="max-w-md text-center">
                    <div className="text-6xl mb-6">🔒</div>
                    <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100 mb-2">Truy cập hạn chế</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">
                        Tài khoản của bạn ({getRoleLabel(roles)}) hiện không có bảng điều khiển tùy chỉnh.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full bg-[#f8fafc] dark:bg-gray-900 p-6 lg:p-8 relative transition-colors duration-300">
            {/* Header summary */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 border-b border-gray-100 dark:border-gray-700 pb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-800 dark:text-gray-100 tracking-tight">
                        Chào <span className="text-[#1192a8]">{user?.fullName || user?.username}</span>!
                    </h1>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-xs font-bold text-gray-500 dark:text-gray-300 shadow-sm">
                            {getRoleLabel(roles)}
                        </span>
                        <span className="text-gray-400 dark:text-gray-500 text-xs">•</span>
                        <span className="text-gray-400 dark:text-gray-500 text-xs font-medium uppercase tracking-wider">
                            {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="text-right hidden md:block">
                        <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tighter leading-none mb-1">Mã nhân viên</div>
                        <div className="text-sm font-black text-gray-700 dark:text-gray-200">{user?.employeeCode || '---'}</div>
                    </div>
                    <div className="w-12 h-12 bg-[#1192a8] rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-teal-100 dark:shadow-teal-900/30">
                        {(user?.fullName || user?.username || 'U').charAt(0).toUpperCase()}
                    </div>
                </div>
            </div>

            {/* Dashboards */}
            {dashboardType === 'EXECUTIVE' && <ExecutiveDashboard stats={stats} roles={roles} />}
            {dashboardType === 'STORAGE' && <StorageDashboard stats={stats} roles={roles} cycleCounts={cycleCounts} />}
            {dashboardType === 'OPERATIONS' && (
                <OperationsDashboard
                    roles={roles}
                    stats={stats}
                    inboundOrders={inboundOrders.filter(o => ['DRAFT', 'PENDING', 'ORDERED'].includes(o.status))}
                    outboundOrders={outboundOrders.filter(o => ['DRAFT', 'ALLOCATED', 'PICKING'].includes(o.status))}
                    cycleCounts={cycleCounts}
                />
            )}
            {dashboardType === 'QC' && (
                <QualityControlDashboard
                    roles={roles}
                    stats={stats}
                    inboundOrders={inboundOrders}
                    outboundOrders={outboundOrders}
                />
            )}

            {/* Expert System Mascot */}
            <SmartAssistant
                stats={stats}
                inboundOrders={inboundOrders}
                outboundOrders={outboundOrders}
                cycleCounts={cycleCounts}
            />
        </div>
    );
}