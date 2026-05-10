import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

function KpiCard({ label, value, icon, color }) {
    return (
        <div className="bg-white rounded-2xl border p-5 flex flex-col gap-1 shadow-sm">
            <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">{label}</span>
                <span className="text-xl">{icon}</span>
            </div>
            <div className={`text-2xl font-black ${color}`}>{value}</div>
        </div>
    );
}

function Spinner() {
    return (
        <div className="flex items-center justify-center h-64 text-gray-400 text-sm gap-2">
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Đang tải dữ liệu...
        </div>
    );
}

export default function StatisticalCustomers() {
    const [customers, setCustomers] = useState([]);
    const [keyword, setKeyword]     = useState('');
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState(null);

    const fetchCustomers = (kw = '') => {
        const token = localStorage.getItem('token');
        const params = kw.trim() ? { keyword: kw.trim() } : {};
        setLoading(true);
        axios
            .get(`${API_BASE}/api/customers`, {
                headers: { Authorization: `Bearer ${token}` },
                params,
            })
            .then(r => setCustomers(r.data))
            .catch(() => setError('Không thể tải danh sách khách hàng.'))
            .finally(() => setLoading(false));
    };

    // ✅ Mới - không warning
    useEffect(() => {
        const token = localStorage.getItem('wms_token');
        setLoading(true);
        axios
            .get(`${API_BASE}/api/customers`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then(r => setCustomers(r.data))
            .catch(() => setError('Không thể tải danh sách khách hàng.'))
            .finally(() => setLoading(false));
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchCustomers(keyword);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <KpiCard label="Tổng khách hàng" value={customers.length} icon="🏪" color="text-blue-600" />
                <KpiCard label="Đang hoạt động"  value={customers.length} icon="✅" color="text-emerald-600" />
            </div>

            <form onSubmit={handleSearch} className="flex gap-2">
                <input
                    type="text"
                    value={keyword}
                    onChange={e => setKeyword(e.target.value)}
                    placeholder="Tìm theo tên, mã, SĐT..."
                    className="flex-1 border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
                    Tìm kiếm
                </button>
                {keyword && (
                    <button type="button" onClick={() => { setKeyword(''); fetchCustomers(); }}
                            className="border px-4 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition-colors">
                        Xóa
                    </button>
                )}
            </form>

            <div className="bg-white rounded-2xl border shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                    <span className="w-1 h-5 rounded bg-blue-500 inline-block" />
                    <h3 className="text-sm font-bold text-gray-600">
                        Danh sách khách hàng
                        <span className="ml-2 text-xs font-normal text-gray-400">({customers.length} kết quả)</span>
                    </h3>
                </div>

                {loading ? <Spinner /> : error ? (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>
                ) : customers.length === 0 ? (
                    <div className="py-12 text-center text-gray-400 text-sm">Không tìm thấy khách hàng nào.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                            <tr className="text-left text-[11px] text-gray-400 uppercase border-b">
                                <th className="pb-2 pr-4">#</th>
                                <th className="pb-2 pr-4">Mã KH</th>
                                <th className="pb-2 pr-4">Tên khách hàng</th>
                                <th className="pb-2 pr-4">SĐT</th>
                                <th className="pb-2">Địa chỉ</th>
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