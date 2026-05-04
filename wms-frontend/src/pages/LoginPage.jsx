// src/pages/Login.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login({ onLoginSuccess }) {
    const { login } = useAuth();

    const [form, setForm]       = useState({ username: '', password: '' });
    const [error, setError]     = useState('');
    const [loading, setLoading] = useState(false);
    const [showPwd, setShowPwd] = useState(false);

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (error) setError('');
    };

    const handleSubmit = async () => {
        if (!form.username.trim()) { setError('Vui lòng nhập tên đăng nhập'); return; }
        if (!form.password)        { setError('Vui lòng nhập mật khẩu');       return; }

        setLoading(true);
        try {
            const user = await login(form.username.trim(), form.password);
            onLoginSuccess(user); // báo App.jsx chuyển sang Home
        } catch (err) {
            const msg = err.response?.data?.message ?? err.message ?? 'Đăng nhập thất bại';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => { if (e.key === 'Enter') handleSubmit(); };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#00529c] via-[#0369a1] to-[#1192a8] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">

                {/* ── Header ── */}
                <div className="bg-gradient-to-r from-[#00529c] to-[#1192a8] px-8 py-8 text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-4xl">🏭</span>
                    </div>
                    <h1 className="text-white text-2xl font-black tracking-tight">WMS System</h1>
                    <p className="text-white/70 text-sm mt-1">Hệ thống quản lý kho hàng</p>
                </div>

                {/* ── Form ── */}
                <div className="px-8 py-8 space-y-5">

                    {/* Username */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Tên đăng nhập
                        </label>
                        <input
                            type="text"
                            value={form.username}
                            onChange={e => handleChange('username', e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Nhập username..."
                            autoFocus
                            autoComplete="username"
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                                       focus:outline-none focus:ring-2 focus:ring-[#1192a8]/25
                                       focus:border-[#1192a8] transition-all"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Mật khẩu
                        </label>
                        <div className="relative">
                            <input
                                type={showPwd ? 'text' : 'password'}
                                value={form.password}
                                onChange={e => handleChange('password', e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Nhập mật khẩu..."
                                autoComplete="current-password"
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm
                                           focus:outline-none focus:ring-2 focus:ring-[#1192a8]/25
                                           focus:border-[#1192a8] transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPwd(p => !p)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400
                                           hover:text-gray-600 text-lg select-none"
                                tabIndex={-1}
                            >
                                {showPwd ? '🙈' : '👁️'}
                            </button>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm
                                        px-4 py-3 rounded-xl flex items-center gap-2">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full bg-[#1192a8] text-white py-3 rounded-xl font-bold text-sm
                                   hover:bg-teal-700 hover:shadow-lg hover:shadow-teal-500/30
                                   transition-all active:scale-95
                                   disabled:opacity-60 disabled:cursor-not-allowed
                                   flex items-center justify-center gap-2"
                    >
                        {loading && <span className="animate-spin text-base">↻</span>}
                        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </button>

                    <p className="text-center text-xs text-gray-400">
                        Tài khoản mặc định:{' '}
                        <span className="font-mono font-bold text-gray-600">admin / Admin@123</span>
                    </p>
                </div>
            </div>
        </div>
    );
}