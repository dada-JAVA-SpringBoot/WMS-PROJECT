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
        const getDashboardData = async () => {
            try {
                const res = await axiosClient.get('/api/stats/dashboard');
                setData(res.data);
            } catch (error) {
                console.error('Không tải được dữ liệu dashboard:', error);
                setError('Không thể tải dữ liệu. Vui lòng thử lại.');
            } finally {
                setLoading(false);
            }
        };
        getDashboardData();
    }, []);

    if (loading) return (
        <div className="p-5 text-gray-600 dark:text-gray-400 transition-colors duration-300">
            Đang tải dữ liệu vận hành...
        </div>
    );
    if (error) return (
        <div className="p-5 text-red-500 dark:text-red-400 transition-colors duration-300">
            {error}
        </div>
    );

    // Dữ liệu chart từ API
    const chartLabels   = data?.dailyFlow?.map(f => f.label)    || [];
    const chartInbound  = data?.dailyFlow?.map(f => f.inbound)  || [];
    const chartOutbound = data?.dailyFlow?.map(f => f.outbound) || [];

    // Cột cho bảng Top sản phẩm tồn nhiều
    const topStockColumns = [
        { key: 'stt',        label: 'STT',          minWidth: 60  },
        { key: 'sku',        label: 'SKU',          minWidth: 120 },
        { key: 'name',       label: 'Tên sản phẩm', minWidth: 260 },
        { key: 'totalStock', label: 'Tồn kho',      minWidth: 120 },
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
        { key: 'stt',        label: 'STT',          minWidth: 60  },
        { key: 'name',       label: 'Sản phẩm',     minWidth: 220 },
        { key: 'batchCode',  label: 'Lô hàng',      minWidth: 140 },
        { key: 'expiryDate', label: 'Hạn sử dụng',  minWidth: 140 },
        { key: 'quantity',   label: 'Tồn kho',      minWidth: 100 },
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
        { key: 'stt',        label: 'STT',          minWidth: 60  },
        { key: 'category',   label: 'Danh mục',     minWidth: 260 },
        { key: 'totalStock', label: 'Tổng tồn kho', minWidth: 160 },
    ];
    const categoryRows = (data?.stockByCategory || []).map((item, i) => ({
        id: i,
        stt: i + 1,
        category: item.category,
        totalStock: Number(item.totalStock).toLocaleString('vi-VN'),
    }));

    return (
        <div className="space-y-5 p-5 bg-[#f8f9fa] dark:bg-gray-900 min-h-full transition-colors duration-300">

            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <StatMetricCard icon="📦" value={data?.totalSkus || 0}                                        label="Tổng mã hàng (SKU)"    circleClass="bg-blue-500 text-white"    />
                <StatMetricCard icon="📊" value={Number(data?.totalStockQuantity || 0).toLocaleString('vi-VN')} label="Tổng tồn kho (sp)"     circleClass="bg-green-500 text-white"   />
                <StatMetricCard icon="🏢" value={`${data?.warehouseOccupancyRate?.toFixed(1) || 0}%`}          label="Tỉ lệ lấp đầy kho"    circleClass="bg-purple-500 text-white"  />
                <StatMetricCard icon="⚠️" value={data?.lowStockCount || 0}                                     label="Hàng dưới định mức"    circleClass="bg-red-500 text-white"     />
                <StatMetricCard icon="📥" value={data?.pendingInbound || 0}                                    label="Đơn nhập chờ duyệt"    circleClass="bg-orange-400 text-white"  />
                <StatMetricCard icon="📤" value={data?.pendingOutbound || 0}                                   label="Đơn xuất chờ duyệt"    circleClass="bg-indigo-400 text-white"  />
            </div>

            {/* Smart Suggestion Alert Bar */}
            <div className="bg-cyan-50/50 dark:bg-cyan-900/20 border border-cyan-100 dark:border-cyan-800 rounded-2xl p-4 flex items-center gap-3 text-cyan-800 dark:text-cyan-300 text-sm font-semibold shadow-sm transition-colors duration-300">
                <span className="text-xl">💡</span>
                <p>
                    Gợi ý tối ưu: Tỉ lệ lấp đầy kho hiện đạt{' '}
                    <span className="font-extrabold text-cyan-600 dark:text-cyan-400">
                        {data?.warehouseOccupancyRate?.toFixed(1)}%
                    </span>.{' '}
                    {data?.warehouseOccupancyRate > 75
                        ? " Sức chứa kho đang ở mức cao. Hãy xem xét sắp xếp lại vị trí lưu kho hoặc lên kế hoạch giải phóng các mặt hàng tồn lâu ngày để tối ưu không gian."
                        : " Diện tích lưu trữ còn trống khá rộng rãi, kho sẵn sàng tiếp nhận thêm lượng hàng nhập mới lớn."}
                </p>
            </div>

            {/* Chart */}
            {chartLabels.length > 0 && (
                <LineAreaChart
                    title="Dòng chảy hàng hóa (Nhập vs Xuất) - 7 ngày qua"
                    labels={chartLabels}
                    series={[
                        { label: 'Nhập kho', data: chartInbound,  color: '#10b981', fill: '#d1fae5', strokeWidth: 3 },
                        { label: 'Xuất kho', data: chartOutbound, color: '#ef4444', fill: '#fee2e2', strokeWidth: 3 },
                    ]}
                />
            )}

            {/* Tables Row: Top tồn kho & Sắp hết hạn */}
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                <PanelCard className="overflow-hidden">
                    <div className="border-b border-slate-200 dark:border-gray-700 px-6 py-4">
                        <h3 className="text-[17px] font-semibold text-slate-900 dark:text-gray-100">
                            🏆 Top sản phẩm tồn kho nhiều nhất
                        </h3>
                    </div>
                    <StatisticsTable columns={topStockColumns} rows={topStockRows} scrollHeight="300px" />
                    {topStockRows.length === 0 && (
                        <div className="p-6 text-center text-gray-400 dark:text-gray-600">Chưa có dữ liệu tồn kho</div>
                    )}
                </PanelCard>

                <PanelCard className="overflow-hidden">
                    <div className="border-b border-slate-200 dark:border-gray-700 px-6 py-4">
                        <h3 className="text-[17px] font-semibold text-slate-900 dark:text-gray-100">
                            ⏰ Lô hàng sắp hết hạn (30 ngày tới)
                        </h3>
                    </div>
                    <StatisticsTable columns={expiryColumns} rows={expiryRows} scrollHeight="300px" />
                    {expiryRows.length === 0 && (
                        <div className="p-6 text-center text-gray-400 dark:text-gray-600">Không có lô hàng sắp hết hạn</div>
                    )}
                </PanelCard>
            </div>

            {/* Table: Phân bổ tồn kho theo danh mục */}
            <PanelCard className="overflow-hidden">
                <div className="border-b border-slate-200 dark:border-gray-700 px-6 py-4">
                    <h3 className="text-[17px] font-semibold text-slate-900 dark:text-gray-100">
                        📁 Phân bổ tồn kho theo danh mục
                    </h3>
                </div>
                <StatisticsTable columns={categoryColumns} rows={categoryRows} scrollHeight="300px" />
                {categoryRows.length === 0 && (
                    <div className="p-6 text-center text-gray-400 dark:text-gray-600">Chưa có dữ liệu</div>
                )}
            </PanelCard>
        </div>
    );
}