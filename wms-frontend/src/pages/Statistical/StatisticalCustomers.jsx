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
            {t('pages.StatisticalCustomers.loading')}
        </div>
    );
};

export default function StatisticalCustomers() {
    const { t } = useTranslation();
    const [customers, setCustomers] = useState([]);
    const [keyword, setKeyword]     = useState('');
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState(null);

    const fetchCustomers = (kw = '') => {
        const params = kw.trim() ? { keyword: kw.trim() } : {};
        axiosClient
            .get(`/api/customers`, {
                params,
            })
            .then(r => setCustomers(r.data))
            .catch(() => setError(t('pages.StatisticalCustomers.loadError')))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        setLoading(true);
        fetchCustomers(keyword);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <KpiCard label={t('pages.StatisticalCustomers.kpiTotal')} value={customers.length} icon="🏪" color="text-blue-600" />
                <KpiCard label={t('pages.StatisticalCustomers.kpiActive')}  value={customers.length} icon="✅" color="text-emerald-600" />
            </div>

            <form onSubmit={handleSearch} className="flex gap-2">
                <input
                    type="text"
                    value={keyword}
                    onChange={e => setKeyword(e.target.value)}
                    placeholder={t('pages.StatisticalCustomers.placeholderSearch')}
                    className="flex-1 border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
                    {t('pages.StatisticalCustomers.btnSearch')}
                </button>
                {keyword && (
                    <button type="button" onClick={() => { setKeyword(''); fetchCustomers(); }}
                            className="border px-4 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition-colors">
                        {t('pages.StatisticalCustomers.btnClear')}
                    </button>
                )}
            </form>

            <div className="bg-white rounded-2xl border shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                    <span className="w-1 h-5 rounded bg-blue-500 inline-block" />
                    <h3 className="text-sm font-bold text-gray-600">
                        {t('pages.StatisticalCustomers.tblTitle')}
                        <span className="ml-2 text-xs font-normal text-gray-400">
                            {t('pages.StatisticalCustomers.results', { count: customers.length })}
                        </span>
                    </h3>
                </div>

                {loading ? <Spinner /> : error ? (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>
                ) : customers.length === 0 ? (
                    <div className="py-12 text-center text-gray-400 text-sm">{t('pages.StatisticalCustomers.noData')}</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                            <tr className="text-left text-[11px] text-gray-400 uppercase border-b">
                                <th className="pb-2 pr-4">#</th>
                                <th className="pb-2 pr-4">{t('pages.StatisticalCustomers.colCode')}</th>
                                <th className="pb-2 pr-4">{t('pages.StatisticalCustomers.colName')}</th>
                                <th className="pb-2 pr-4">{t('pages.StatisticalCustomers.colPhone')}</th>
                                <th className="pb-2">{t('pages.StatisticalCustomers.colAddress')}</th>
                            </tr>
                            </thead>
                            <tbody>
                            {customers.map((c, i) => (
                                <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                                    <td className="py-2.5 pr-4 text-gray-400 text-xs">{i + 1}</td>
                                    <td className="py-2.5 pr-4 font-mono text-xs text-gray-500">{c.customerCode}</td>
                                    <td className="py-2.5 pr-4 font-semibold text-gray-800">{c.name}</td>
                                    <td className="py-2.5 pr-4 text-gray-500">{c.phone || '—'}</td>
                                    <td className="py-2.5 text-gray-500 max-w-[240px] truncate">{c.address || '—'}</td>
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