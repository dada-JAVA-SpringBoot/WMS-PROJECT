import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';

const KpiCard = ({ label, value, icon, color }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 flex flex-col gap-1 shadow-sm transition-colors duration-300">
        <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">{label}</span>
            <span className="text-xl">{icon}</span>
        </div>
        <div className={`text-2xl font-black ${color}`}>{value}</div>
    </div>
);

const Spinner = () => (
    <div className="flex items-center justify-center h-64 text-gray-400 dark:text-gray-500 text-sm gap-2">
        <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        Đang tải dữ liệu...
    </div>
);

const STATUS_MAP = {
    DRAFT:     { label: 'Bản nháp',   cls: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'           },
    ALLOCATED: { label: 'Đã phân bổ', cls: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'        },
    COMPLETED: { label: 'Hoàn thành', cls: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' },
    CANCELED:  { label: 'Đã hủy',     cls: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'            },
};

const StatusBadge = ({ status }) => {
    const s = STATUS_MAP[status?.toUpperCase()] || { label: status || 'N/A', cls: 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400' };
    return (
        <span className={`px-2 py-1 rounded-md text-[11px] font-bold tracking-wide ${s.cls}`}>
            {s.label}
        </span>
    );
};

export default function StatisticalOrders() {
    const [activeTab, setActiveTab] = useState('inbound');
    const [orders, setOrders]       = useState([]);
    const [keyword, setKeyword]     = useState('');
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState(null);

    const fetchOrders = (kw = '', tab = activeTab) => {
        const endpoint = tab === 'inbound' ? '/api/inbound' : '/api/outbound-orders';
        axiosClient
            .get(endpoint, {
                params: kw.trim() ? { keyword: kw.trim() } : {},
            })
            .then(r => {
                setOrders(Array.isArray(r.data) ? r.data : (r.data?.content ?? []));
            })
            .catch(() => setError(`Không thể tải danh sách phiếu ${tab === 'inbound' ? 'nhập' : 'xuất'}.`))
            .finally(() => setLoading(false));
    };

    const handleTabChange = (newTab) => {
        setActiveTab(newTab);
        setKeyword('');
        setLoading(true);
        fetchOrders('', newTab);
    };

    useEffect(() => {
        fetchOrders('', activeTab);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        setLoading(true);
        fetchOrders(keyword, activeTab);
    };

    const completedCount = orders.filter(o => o.status?.toUpperCase() === 'COMPLETED').length;

    return (
        <div className="p-6 space-y-6 bg-[#f8f9fa] dark:bg-gray-900 min-h-screen transition-colors duration-300">

            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                {[
                    { key: 'inbound',  label: 'Phiếu Nhập Kho' },
                    { key: 'outbound', label: 'Phiếu Xuất Kho'  },
                ].map(t => (
                    <button key={t.key} onClick={() => handleTabChange(t.key)}
                            className={`pb-2 px-2 text-sm font-bold border-b-2 transition-colors
                            ${activeTab === t.key
                                ? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-4">
                <KpiCard
                    label={`Tổng phiếu ${activeTab === 'inbound' ? 'nhập' : 'xuất'}`}
                    value={orders.length}
                    icon="📄"
                    color="text-blue-600 dark:text-blue-400"
                />
                <KpiCard
                    label="Hoàn thành"
                    value={completedCount}
                    icon="✅"
                    color="text-emerald-600 dark:text-emerald-400"
                />
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2">
                <input
                    type="text"
                    value={keyword}
                    onChange={e => setKeyword(e.target.value)}
                    placeholder="Tìm theo mã phiếu, ngày, trạng thái..."
                    className="flex-1 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-700 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
                />
                <button type="submit"
                        className="bg-blue-600 dark:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors">
                    Tìm kiếm
                </button>
                {keyword && (
                    <button type="button"
                            onClick={() => { setKeyword(''); setLoading(true); fetchOrders('', activeTab); }}
                            className="border border-gray-200 dark:border-gray-600 px-4 py-2 rounded-xl text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        Xóa
                    </button>
                )}
            </form>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 transition-colors duration-300">
                <div className="flex items-center gap-2 mb-4">
                    <span className="w-1 h-5 rounded bg-blue-500 dark:bg-blue-400 inline-block" />
                    <h3 className="text-sm font-bold text-gray-600 dark:text-gray-300">
                        {activeTab === 'inbound' ? 'Danh sách phiếu nhập' : 'Danh sách phiếu xuất'}
                        <span className="ml-2 text-xs font-normal text-gray-400 dark:text-gray-500">({orders.length} kết quả)</span>
                    </h3>
                </div>

                {loading ? <Spinner /> : error ? (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">{error}</div>
                ) : orders.length === 0 ? (
                    <div className="py-12 text-center text-gray-400 dark:text-gray-600 text-sm">Không tìm thấy dữ liệu.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                            <tr className="text-left text-[11px] text-gray-400 dark:text-gray-500 uppercase border-b border-gray-100 dark:border-gray-700">
                                <th className="pb-2 pr-4">#</th>
                                <th className="pb-2 pr-4">Mã Phiếu</th>
                                <th className="pb-2 pr-4">Ngày tạo</th>
                                <th className="pb-2 pr-4">{activeTab === 'inbound' ? 'Nhà cung cấp' : 'Khách hàng'}</th>
                                <th className="pb-2 pr-4 text-right">Tổng tiền</th>
                                <th className="pb-2">Trạng thái</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                            {orders.map((o, i) => (
                                <tr key={o.id ?? i} className="hover:bg-blue-50/50 dark:hover:bg-gray-700/30 transition-colors">
                                    <td className="py-2.5 pr-4 text-gray-400 dark:text-gray-600 text-xs">{i + 1}</td>
                                    <td className="py-2.5 pr-4 font-mono text-xs text-blue-600 dark:text-blue-400 font-semibold">
                                        {o.orderCode || o.code || o.issueCode || o.receiptCode || '—'}
                                    </td>
                                    <td className="py-2.5 pr-4 text-gray-800 dark:text-gray-200">
                                        {o.createdDate || o.createdAt || o.date || '—'}
                                    </td>
                                    <td className="py-2.5 pr-4 font-semibold text-gray-800 dark:text-gray-100 max-w-[200px] truncate">
                                        {activeTab === 'inbound'
                                            ? (o.supplier?.name || o.supplierName || '—')
                                            : (o.customer?.name || o.customerName || '—')}
                                    </td>
                                    <td className="py-2.5 pr-4 text-gray-500 dark:text-gray-400 text-right font-medium">
                                        {(o.totalAmount || o.totalValue)
                                            ? `${(o.totalAmount || o.totalValue).toLocaleString('vi-VN')} đ`
                                            : '—'}
                                    </td>
                                    <td className="py-2.5">
                                        <StatusBadge status={o.status} />
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}