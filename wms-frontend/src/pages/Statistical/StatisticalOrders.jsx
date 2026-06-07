import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axiosClient from '../../api/axiosClient';

const KpiCard = ({ label, value, icon, color }) => (
    <div className="bg-white rounded-2xl border p-5 flex flex-col gap-1 shadow-sm">
        <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">{label}</span>
            <span className="text-xl">{icon}</span>
        </div>
        <div className={`text-2xl font-black ${color}`}>{value}</div>
    </div>
);

const Spinner = () => {
    const { t } = useTranslation();
    return (
        <div className="flex items-center justify-center h-64 text-gray-400 text-sm gap-2">
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            {t('pages.StatisticalOrders.loading')}
        </div>
    );
};

const STATUS_MAP = {
    DRAFT:     { key: 'draft',     cls: 'bg-gray-100 text-gray-600'     },
    ALLOCATED: { key: 'allocated', cls: 'bg-blue-100 text-blue-700'     },
    COMPLETED: { key: 'completed', cls: 'bg-emerald-100 text-emerald-700' },
    CANCELED:  { key: 'canceled',  cls: 'bg-red-100 text-red-600'       },
};

const StatusBadge = ({ status }) => {
    const { t } = useTranslation();
    const config = STATUS_MAP[status?.toUpperCase()] || { key: null, cls: 'bg-gray-100 text-gray-500' };
    const label = config.key ? t(`pages.StatisticalOrders.status.${config.key}`) : (status || 'N/A');
    return (
        <span className={`px-2 py-1 rounded-md text-[11px] font-bold tracking-wide ${config.cls}`}>
            {label}
        </span>
    );
};

export default function StatisticalOrders() {
    const { t } = useTranslation();
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
            .catch(() => {
                const typeText = tab === 'inbound'
                    ? t('pages.StatisticalOrders.inboundText')
                    : t('pages.StatisticalOrders.outboundText');
                setError(t('pages.StatisticalOrders.loadError', { type: typeText }));
            })
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

    const completedCount = orders.filter(o =>
        o.status?.toUpperCase() === 'COMPLETED'
    ).length;

    return (
        <div className="p-6 space-y-6 bg-[#f8fafc] min-h-screen">
            <div className="flex gap-4 border-b pb-2">
                {[
                    { key: 'inbound',  label: t('pages.StatisticalOrders.tabInbound') },
                    { key: 'outbound', label: t('pages.StatisticalOrders.tabOutbound')  },
                ].map(tabItem => (
                    <button key={tabItem.key} onClick={() => handleTabChange(tabItem.key)}
                            className={`pb-2 px-2 text-sm font-bold border-b-2 transition-colors
                            ${activeTab === tabItem.key
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                        {tabItem.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <KpiCard
                    label={t('pages.StatisticalOrders.kpiTotal', { type: activeTab === 'inbound' ? t('pages.StatisticalOrders.inboundText') : t('pages.StatisticalOrders.outboundText') })}
                    value={orders.length}
                    icon="📄"
                    color="text-blue-600"
                />
                <KpiCard
                    label={t('pages.StatisticalOrders.kpiCompleted')}
                    value={completedCount}
                    icon="✅"
                    color="text-emerald-600"
                />
            </div>

            <form onSubmit={handleSearch} className="flex gap-2">
                <input
                    type="text"
                    value={keyword}
                    onChange={e => setKeyword(e.target.value)}
                    placeholder={t('pages.StatisticalOrders.placeholderSearch')}
                    className="flex-1 border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                <button type="submit"
                        className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
                    {t('pages.StatisticalOrders.btnSearch')}
                </button>
                {keyword && (
                    <button type="button"
                            onClick={() => { setKeyword(''); setLoading(true); fetchOrders('', activeTab); }}
                            className="border px-4 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition-colors">
                        {t('pages.StatisticalOrders.btnClear')}
                    </button>
                )}
            </form>

            <div className="bg-white rounded-2xl border shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                    <span className="w-1 h-5 rounded bg-blue-500 inline-block" />
                    <h3 className="text-sm font-bold text-gray-600">
                        {activeTab === 'inbound' ? t('pages.StatisticalOrders.tblTitleInbound') : t('pages.StatisticalOrders.tblTitleOutbound')}
                        <span className="ml-2 text-xs font-normal text-gray-400"> {t('pages.StatisticalOrders.results', { count: orders.length })}</span>
                    </h3>
                </div>

                {loading ? <Spinner /> : error ? (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>
                ) : orders.length === 0 ? (
                    <div className="py-12 text-center text-gray-400 text-sm">{t('pages.StatisticalOrders.noData')}</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                            <tr className="text-left text-[11px] text-gray-400 uppercase border-b">
                                <th className="pb-2 pr-4">#</th>
                                <th className="pb-2 pr-4">{t('pages.StatisticalOrders.colCode')}</th>
                                <th className="pb-2 pr-4">{t('pages.StatisticalOrders.colCreatedDate')}</th>
                                <th className="pb-2 pr-4">{activeTab === 'inbound' ? t('pages.StatisticalOrders.colSupplier') : t('pages.StatisticalOrders.colCustomer')}</th>
                                <th className="pb-2 pr-4 text-right">{t('pages.StatisticalOrders.colTotal')}</th>
                                <th className="pb-2">{t('pages.StatisticalOrders.colStatus')}</th>
                            </tr>
                            </thead>
                            <tbody>
                            {orders.map((o, i) => (
                                <tr key={o.id ?? i} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                                    <td className="py-2.5 pr-4 text-gray-400 text-xs">{i + 1}</td>
                                    <td className="py-2.5 pr-4 font-mono text-xs text-blue-600 font-semibold">
                                        {o.orderCode || o.code || o.issueCode || o.receiptCode || '—'}
                                    </td>
                                    <td className="py-2.5 pr-4 text-gray-800">
                                        {o.createdDate || o.createdAt || o.date || '—'}
                                    </td>
                                    <td className="py-2.5 pr-4 font-semibold text-gray-800 max-w-[200px] truncate">
                                        {activeTab === 'inbound'
                                            ? (o.supplier?.name || o.supplierName || '—')
                                            : (o.customer?.name || o.customerName || '—')}
                                    </td>
                                    <td className="py-2.5 pr-4 text-gray-500 text-right font-medium">
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