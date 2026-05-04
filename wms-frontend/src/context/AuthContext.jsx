// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext(null);

// ── Helper: giải mã token lấy thông tin user ──────────────────────────────
function parseToken(token) {
    try {
        const decoded = jwtDecode(token);
        // Payload từ JwtUtil.java: { sub: username, roles: [...], exp: ... }
        return {
            token,
            username:     decoded.sub,
            roles:        decoded.roles ?? [],       // ['ADMIN'] hoặc ['INBOUND_STAFF', ...]
            exp:          decoded.exp,
        };
    } catch {
        return null;
    }
}

// ── Helper: kiểm tra token còn hạn không ─────────────────────────────────
function isTokenExpired(token) {
    try {
        const { exp } = jwtDecode(token);
        // exp tính bằng giây, Date.now() bằng ms
        return Date.now() >= exp * 1000;
    } catch {
        return true;
    }
}

export function AuthProvider({ children }) {
    const [user, setUser]       = useState(null);   // { token, username, roles, exp, fullName, employeeCode }
    const [loading, setLoading] = useState(true);

    // ── Khôi phục session khi reload trang ────────────────────────────────
    useEffect(() => {
        const token    = localStorage.getItem('wms_token');
        const userJson = localStorage.getItem('wms_user');

        if (token && !isTokenExpired(token) && userJson) {
            try {
                const stored  = JSON.parse(userJson);
                const decoded = parseToken(token);
                if (decoded) setUser({ ...stored, ...decoded });
            } catch {
                localStorage.removeItem('wms_token');
                localStorage.removeItem('wms_user');
            }
        } else {
            // Token hết hạn — dọn sạch
            localStorage.removeItem('wms_token');
            localStorage.removeItem('wms_user');
        }
        setLoading(false);
    }, []);

    // ── Lắng nghe sự kiện 401 từ axiosClient ─────────────────────────────
    useEffect(() => {
        const handleUnauthorized = () => logout();
        window.addEventListener('wms:unauthorized', handleUnauthorized);
        return () => window.removeEventListener('wms:unauthorized', handleUnauthorized);
    }, []);

    // ── Đăng nhập ─────────────────────────────────────────────────────────
    const login = useCallback(async (username, password) => {
        // Dùng axios trực tiếp (không gắn token vì đây là public endpoint)
        const res  = await axiosClient.post('/api/auth/login', { username, password });
        const data = res.data;
        // data = { token, username, fullName, employeeCode, roles }

        const decoded = parseToken(data.token);
        const userObj = {
            token:        data.token,
            username:     data.username,
            fullName:     data.fullName,
            employeeCode: data.employeeCode,
            roles:        data.roles ?? decoded?.roles ?? [],
            exp:          decoded?.exp,
        };

        localStorage.setItem('wms_token', data.token);
        localStorage.setItem('wms_user',  JSON.stringify(userObj));
        setUser(userObj);
        return userObj;
    }, []);

    // ── Đăng xuất ─────────────────────────────────────────────────────────
    const logout = useCallback(() => {
        localStorage.removeItem('wms_token');
        localStorage.removeItem('wms_user');
        setUser(null);
    }, []);

    // ── Kiểm tra quyền ───────────────────────────────────────────────────
    const hasRole     = useCallback((role)    => user?.roles?.includes(role)        ?? false, [user]);
    const hasAnyRole  = useCallback((...roles) => roles.some(r => user?.roles?.includes(r)) ?? false, [user]);
    const isAdmin     = useCallback(() => hasRole('ADMIN'),                                   [hasRole]);
    const isManager   = useCallback(() => hasAnyRole('ADMIN', 'MANAGER'),                     [hasAnyRole]);

    const value = {
        user,
        loading,
        login,
        logout,
        hasRole,
        hasAnyRole,
        isAdmin,
        isManager,
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// Hook tiện dụng
export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth phải dùng bên trong <AuthProvider>');
    return ctx;
};