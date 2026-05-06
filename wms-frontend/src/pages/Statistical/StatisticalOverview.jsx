import React, { useEffect, useState } from 'react';
import { useAuthFetch } from '../../hooks/useAuthFetch';
import StatMetricCard from '../../components/statistical/StatMetricCard';
import LineAreaChart from '../../components/statistical/charts/LineAreaChart';
import PanelCard from '../../components/statistical/PanelCard';
import StatisticsTable from '../../components/statistical/StatisticsTable';

export default function StatisticalOverview() {
    const authFetch = useAuthFetch();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await authFetch('/api/stats/summary');
                const json = await res.json();
                setData(json);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="p-5">Đang tải dữ liệu vận hành...</div>;

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
                    value={data?.totalStockQuantity?.toLocaleString() || 0} 
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
                    value="3" 
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

            <LineAreaChart
                title="Dòng chảy hàng hóa (Nhập vs Xuất) - 7 ngày qua"
                labels={['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN']}
                series={[
                    { label: 'Nhập kho', data: [120, 150, 80, 200, 170, 90, 40], color: '#10b981', fill: '#d1fae5', strokeWidth: 3 },
                    { label: 'Xuất kho', data: [100, 130, 110, 180, 150, 120, 30], color: '#ef4444', fill: '#fee2e2', strokeWidth: 3 },
                ]}
            />
        </div>
    );
}
