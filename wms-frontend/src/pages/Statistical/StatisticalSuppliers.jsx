import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axiosClient from '../../api/axiosClient';
import { formatNumberByLanguage } from '../../utils/formatters';

const KpiCard = ({ label, value, icon, color }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 flex flex-col gap-1 shadow-sm transition-colors duration-300">
        <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">{label}</span>
            <span className="text-xl">{icon}</span>
        </div>
        <div className={`text-2xl font-black ${color}`}>{value}</div>
    </div>
);

const Spinner = () => {
    const { t } = useTranslation();
    return (
        <div className="flex items-center justify-center h-64 text-gray-400 dark:text-gray-500 text-sm gap-2">
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            {t('pages.StatisticalSuppliers.loading')}
        </div>
    );
};

import { useWorkspaceRefresh } from '../../hooks/useWorkspaceRefresh';

export default function StatisticalSuppliers() {
    const { t } = useTranslation();
    const [suppliers, setSuppliers] = useState([]);
    const [keyword, setKeyword]     = useState('');
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState(null);

    const fetchSuppliers = (kw = '') => {
        const params = kw.trim() ? { keyword: kw.trim() } : {};
        axiosClient
            .get(`/api/suppliers`, { params })
            .then(r => setSuppliers(r.data))
            .catch(() => setError(t('pages.StatisticalSuppliers.loadError')))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchSuppliers();
    }, []);

    useWorkspaceRefresh(fetchSuppliers);

    const handleSearch = (e) => {
        e.preventDefault();
        setLoading(true);
        fetchSuppliers(keyword);
    };

    const totalImport = suppliers.reduce((s, x) => s + (x.totalImportQuantity || 0), 0);
    const topSupplier = suppliers.length
        ? [...suppliers].sort((a, b) => (b.totalImportQuantity || 0) - (a.totalImportQuantity || 0))[0]
        : null;

    return (
        <div className="p-6 space-y-6 bg-[#f8f9fa] dark:bg-gray-900 min-h-full transition-colors duration-300">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <KpiCard
                    label={t('pages.StatisticalSuppliers.kpiTotal')}
                    value={suppliers.length}
                    icon="🏭"
                    color="text-indigo-600 dark:text-indigo-400"
                />
                <KpiCard
                    label={t('pages.StatisticalSuppliers.kpiImport')}
                    value={formatNumberByLanguage(totalImport)}
                    icon="📦"
                    color="text-amber-600 dark:text-amber-400"
                />
                <KpiCard
                    label={t('pages.StatisticalSuppliers.kpiTop')}
                    value={topSupplier?.name ?? '—'}
                    icon="🏆"
                    color="text-emerald-600 dark:text-emerald-400"
                />
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2">
                <input
                    type="text"
                    value={keyword}
                    onChange={e => setKeyword(e.target.value)}
                    placeholder={t('pages.StatisticalSuppliers.placeholderSearch')}
                    className="flex-1 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-700 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
                />
                <button
                    type="submit"
                    className="bg-indigo-600 dark:bg-indigo-700 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
                >
                    {t('pages.StatisticalSuppliers.btnSearch')}
                </button>
                {keyword && (
                    <button
                        type="button"
                        onClick={() => { setKeyword(''); fetchSuppliers(); }}
                        className="border border-gray-200 dark:border-gray-600 px-4 py-2 rounded-xl text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        {t('pages.StatisticalSuppliers.btnClear')}
                    </button>
                )}
            </form>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 transition-colors duration-300">
                <div className="flex items-center gap-2 mb-4">
                    <span className="w-1 h-5 rounded bg-indigo-500 dark:bg-indigo-400 inline-block" />
                    <h3 className="text-sm font-bold text-gray-600 dark:text-gray-300">
                        {t('pages.StatisticalSuppliers.tblTitle')}
                        <span className="ml-2 text-xs font-normal text-gray-400 dark:text-gray-500">
                            {t('pages.StatisticalSuppliers.results', { count: suppliers.length })}
                        </span>
                    </h3>
                </div>

                {loading ? (
                    <Spinner />
                ) : error ? (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">{error}</div>
                ) : suppliers.length === 0 ? (
                    <div className="py-12 text-center text-gray-400 dark:text-gray-600 text-sm">{t('pages.StatisticalSuppliers.noData')}</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                            <tr className="text-left text-[11px] text-gray-400 dark:text-gray-500 uppercase border-b border-gray-100 dark:border-gray-700">
                                <th className="pb-2 pr-4">#</th>
                                <th className="pb-2 pr-4">{t('pages.StatisticalSuppliers.colCode')}</th>
                                <th className="pb-2 pr-4">{t('pages.StatisticalSuppliers.colName')}</th>
                                <th className="pb-2 pr-4">{t('pages.StatisticalSuppliers.colPhone')}</th>
                                <th className="pb-2 pr-4">{t('pages.StatisticalSuppliers.colAddress')}</th>
                                <th className="pb-2 text-right">{t('pages.StatisticalSuppliers.colImportQty')}</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                            {suppliers.map((s, i) => (
                                <tr key={s.id} className="hover:bg-blue-50/50 dark:hover:bg-gray-700/30 transition-colors">
                                    <td className="py-2.5 pr-4 text-gray-400 dark:text-gray-600 text-xs">{i + 1}</td>
                                    <td className="py-2.5 pr-4 font-mono text-xs text-gray-500 dark:text-gray-400">{s.supplierCode}</td>
                                    <td className="py-2.5 pr-4 font-semibold text-gray-800 dark:text-gray-100">{s.name}</td>
                                    <td className="py-2.5 pr-4 text-gray-500 dark:text-gray-400">{s.phone || '—'}</td>
                                    <td className="py-2.5 pr-4 text-gray-500 dark:text-gray-400 max-w-[200px] truncate">{s.address || '—'}</td>
                                    <td className="py-2.5 text-right">
                                        <span className="font-bold text-indigo-600 dark:text-indigo-400">{formatNumberByLanguage(s.totalImportQuantity)}</span>
                                        <span className="text-gray-400 dark:text-gray-500 text-xs ml-1">{t('pages.StatisticalSuppliers.unitPcs')}</span>
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
