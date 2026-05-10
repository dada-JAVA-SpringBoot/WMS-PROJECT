import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import StatMetricCard from '../../components/statistical/StatMetricCard';
import LineAreaChart from '../../components/statistical/charts/LineAreaChart';
import PanelCard from '../../components/statistical/PanelCard';
import StatisticsTable from '../../components/statistical/StatisticsTable';

export default function StatisticalOverview() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axiosClient.get('/api/stats/dashboard');
                setData(res.data);
            } catch (err) {
                console.error('Không tải được dữ liệu dashboard:', err);
                setError('Không thể tải dữ liệu. Vui lòng thử lại.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="p-5">Đang tải dữ liệu vận hành...</div>;
    if (error) return <div className="p-5 text-red-500">{error}</div>;

    // Dữ liệu chart từ API
    const chartLabels = data?.dailyFlow?.map(f => f.label) || [];
    const chartInbound = data?.dailyFlow?.map(f => f.inbound) || [];
    const chartOutbound = data?.dailyFlow?.map(f => f.outbound) || [];

    // Cột cho bảng Top sản phẩm tồn nhiều
    const topStockColumns = [
        { key: 'stt', label: 'STT', minWidth: 60 },
        { key: 'sku', label: 'SKU', minWidth: 120 },
        { key: 'name', label: 'Tên sản phẩm', minWidth: 260 },
        { key: 'totalStock', label: 'Tồn kho', minWidth: 120 },
    ];
    const topStockRows = (data?.topStockProducts || []).map((item, i) => ({
        id: i,
        stt: i + 1,
        sku: item.sku,
        name: item.name,
        totalStock: Number(item.totalStock).toLocaleString('vi-VN'),
    }));

    // Cột cho bảng sản phẩm sắp hết hạn
    const expiryColumns = [
        { key: 'stt', label: 'STT', minWidth: 60 },
        { key: 'name', label: 'Sản phẩm', minWidth: 220 },
        { key: 'batchCode', label: 'Lô hàng', minWidth: 140 },
        { key: 'expiryDate', label: 'Hạn sử dụng', minWidth: 140 },
        { key: 'quantity', label: 'Tồn kho', minWidth: 100 },
    ];
    const expiryRows = (data?.nearExpiryProducts || []).map((item, i) => ({
        id: i,
        stt: i + 1,
        name: item.name,
        batchCode: item.batchCode,
        expiryDate: item.expiryDate,
        quantity: Number(item.quantity).toLocaleString('vi-VN'),
    }));

    // Cột cho bảng phân bổ theo danh mục
    const categoryColumns = [
        { key: 'stt', label: 'STT', minWidth: 60 },
        { key: 'category', label: 'Danh mục', minWidth: 260 },
        { key: 'totalStock', label: 'Tổng tồn kho', minWidth: 160 },
    ];
    const categoryRows = (data?.stockByCategory || []).map((item, i) => ({
        id: i,
        stt: i + 1,
        category: item.category,
        totalStock: Number(item.totalStock).toLocaleString('vi-VN'),
    }));

    return (
        <div className="space-y-5 p-5">
            {/* KPI Cards Row 1: Inventory Health */}
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-4">
                <StatMetricCard 
                    icon="📦" 
                    value={data?.totalSkus || 0} 
                    label="Tổng số mã hàng (SKU)" 
                    circleClass="bg-blue-500 text-white" 
                />
                <StatMetricCard 
                    icon="📊" 
                    value={Number(data?.totalStockQuantity || 0).toLocaleString('vi-VN')} 
                    label="Tổng sản phẩm tồn kho" 
                    circleClass="bg-green-500 text-white" 
                />
                <StatMetricCard 
                    icon="🏢" 
                    value={`${data?.warehouseOccupancyRate?.toFixed(1) || 0}%`} 
                    label="Tỉ lệ lấp đầy kho" 
                    circleClass="bg-purple-500 text-white" 
                />
                <StatMetricCard 
                    icon="⚠️" 
                    value={data?.lowStockCount || 0} 
                    label="Mặt hàng dưới định mức" 
                    circleClass="bg-red-500 text-white" 
                />
            </div>

            {/* KPI Cards Row 2: Operational Flow */}
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                <div className="grid grid-cols-2 gap-5">
                    <StatMetricCard 
                        icon="📥" 
                        value={data?.pendingInbound || 0} 
                        label="Đơn nhập chờ xử lý" 
                        circleClass="bg-orange-400 text-white" 
                    />
                    <StatMetricCard 
                        icon="📤" 
                        value={data?.pendingOutbound || 0} 
                        label="Đơn xuất chờ xử lý" 
                        circleClass="bg-indigo-400 text-white" 
                    />
                </div>
                <PanelCard className="flex items-center justify-center bg-white p-5 italic text-gray-500">
                    Gợi ý: "Tỉ lệ lấp đầy kho đạt {data?.warehouseOccupancyRate?.toFixed(1)}%. Hãy xem xét tối ưu hóa vị trí sắp xếp hàng."
                </PanelCard>
            </div>

            {/* Chart: Dòng chảy hàng hóa 7 ngày (dữ liệu thực từ API) */}
            {chartLabels.length > 0 && (
                <LineAreaChart
                    title="Dòng chảy hàng hóa (Nhập vs Xuất) - 7 ngày qua"
                    labels={chartLabels}
                    series={[
                        { label: 'Nhập kho', data: chartInbound, color: '#10b981', fill: '#d1fae5', strokeWidth: 3 },
                        { label: 'Xuất kho', data: chartOutbound, color: '#ef4444', fill: '#fee2e2', strokeWidth: 3 },
                    ]}
                />
            )}

            {/* Tables Row: Top tồn kho & Sắp hết hạn */}
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                <PanelCard className="overflow-hidden">
                    <div className="border-b border-slate-200 px-6 py-4">
                        <h3 className="text-[17px] font-semibold text-slate-900">
                            🏆 Top sản phẩm tồn kho nhiều nhất
                        </h3>
                    </div>
                    <StatisticsTable
                        columns={topStockColumns}
                        rows={topStockRows}
                        scrollHeight="300px"
                    />
                    {topStockRows.length === 0 && (
                        <div className="p-6 text-center text-gray-400">Chưa có dữ liệu tồn kho</div>
                    )}
                </PanelCard>

                <PanelCard className="overflow-hidden">
                    <div className="border-b border-slate-200 px-6 py-4">
                        <h3 className="text-[17px] font-semibold text-slate-900">
                            ⏰ Lô hàng sắp hết hạn (30 ngày tới)
                        </h3>
                    </div>
                    <StatisticsTable
                        columns={expiryColumns}
                        rows={expiryRows}
                        scrollHeight="300px"
                    />
                    {expiryRows.length === 0 && (
                        <div className="p-6 text-center text-gray-400">Không có lô hàng sắp hết hạn</div>
                    )}
                </PanelCard>
            </div>

            {/* Table: Phân bổ tồn kho theo danh mục */}
            <PanelCard className="overflow-hidden">
                <div className="border-b border-slate-200 px-6 py-4">
                    <h3 className="text-[17px] font-semibold text-slate-900">
                        📁 Phân bổ tồn kho theo danh mục
                    </h3>
                </div>
                <StatisticsTable
                    columns={categoryColumns}
                    rows={categoryRows}
                    scrollHeight="300px"
                />
                {categoryRows.length === 0 && (
                    <div className="p-6 text-center text-gray-400">Chưa có dữ liệu</div>
                )}
            </PanelCard>
        </div>
    );
}
