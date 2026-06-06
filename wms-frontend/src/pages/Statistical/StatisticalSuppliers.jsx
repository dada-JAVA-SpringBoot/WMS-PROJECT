import React, { useState, useEffect } from 'react';
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

const Spinner = () => (
    <div className="flex items-center justify-center h-64 text-gray-400 text-sm gap-2">
        <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        Đang tải dữ liệu...
    </div>
);

export default function StatisticalSuppliers() {
    const [suppliers, setSuppliers] = useState([]);
    const [keyword, setKeyword]     = useState('');
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState(null);

    const fetchSuppliers = (kw = '') => {
        const params = kw.trim() ? { keyword: kw.trim() } : {};
        axiosClient
            .get(`/api/suppliers`, {
                params,
            })
            .then(r => setSuppliers(r.data))
            .catch(() => setError('Không thể tải danh sách nhà cung cấp.'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { 
        fetchSuppliers(); 
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        setLoading(true);
        fetchSuppliers(keyword);
    };

    const totalImport = suppliers.reduce((s, x) => s + (x.totalImportQuantity || 0), 0);
    const topSupplier = suppliers.length
        ? [...suppliers].sort((a, b) => (b.totalImportQuantity || 0) - (a.totalImportQuantity || 0))[0]
        : null;

    const fmt = (n) => (n || 0).toLocaleString('vi-VN');

    return (
        <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <KpiCard
                    label="Tổng nhà cung cấp"
                    value={suppliers.length}
                    icon="🏭"
                    color="text-indigo-600"
                />
                <KpiCard
                    label="Tổng SL đã nhập"
                    value={fmt(totalImport)}
                    icon="📦"
                    color="text-amber-600"
                />
                <KpiCard
                    label="NCC lớn nhất"
                    value={topSupplier?.name ?? '—'}
                    icon="🏆"
                    color="text-emerald-600"
                />
            </div>

            <form onSubmit={handleSearch} className="flex gap-2">
                <input
                    type="text"
                    value={keyword}
                    onChange={e => setKeyword(e.target.value)}
                    placeholder="Tìm theo tên, mã, SĐT..."
                    className="flex-1 border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
                <button
                    type="submit"
                    className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
                >
                    Tìm kiếm
                </button>
                {keyword && (
                    <button
                        type="button"
                        onClick={() => { setKeyword(''); fetchSuppliers(); }}
                        className="border px-4 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                        Xóa
                    </button>
                )}
            </form>

            <div className="bg-white rounded-2xl border shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                    <span className="w-1 h-5 rounded bg-indigo-500 inline-block" />
                    <h3 className="text-sm font-bold text-gray-600">
                        Danh sách nhà cung cấp
                        <span className="ml-2 text-xs font-normal text-gray-400">
                            ({suppliers.length} kết quả)
                        </span>
                    </h3>
                </div>

                {loading ? (
                    <Spinner />
                ) : error ? (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>
                ) : suppliers.length === 0 ? (
                    <div className="py-12 text-center text-gray-400 text-sm">Không tìm thấy nhà cung cấp nào.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                            <tr className="text-left text-[11px] text-gray-400 uppercase border-b">
                                <th className="pb-2 pr-4">#</th>
                                <th className="pb-2 pr-4">Mã NCC</th>
                                <th className="pb-2 pr-4">Tên nhà cung cấp</th>
                                <th className="pb-2 pr-4">SĐT</th>
                                <th className="pb-2 pr-4">Địa chỉ</th>
                                <th className="pb-2 text-right">Tổng SL nhập</th>
                            </tr>
                            </thead>
                            <tbody>
                            {suppliers.map((s, i) => (
                                <tr key={s.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                                    <td className="py-2.5 pr-4 text-gray-400 text-xs">{i + 1}</td>
                                    <td className="py-2.5 pr-4 font-mono text-xs text-gray-500">{s.supplierCode}</td>
                                    <td className="py-2.5 pr-4 font-semibold text-gray-800">{s.name}</td>
                                    <td className="py-2.5 pr-4 text-gray-500">{s.phone || '—'}</td>
                                    <td className="py-2.5 pr-4 text-gray-500 max-w-[200px] truncate">{s.address || '—'}</td>
                                    <td className="py-2.5 text-right">
                                        <span className="font-bold text-indigo-600">{fmt(s.totalImportQuantity)}</span>
                                        <span className="text-gray-400 text-xs ml-1">sp</span>
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