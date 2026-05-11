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
        const rawRoles = decoded.roles ?? [];
        const cleanRoles = rawRoles.map(r => r.startsWith('ROLE_') ? r.replace('ROLE_', '') : r);
        
        return {
            token,
            username:     decoded.sub,
            roles:        cleanRoles,       // ['ADMIN'] hoặc ['INBOUND_STAFF', ...]
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
    const [user, setUser] = useState(() => {
        try {
            const token    = localStorage.getItem('wms_token');
            const userJson = localStorage.getItem('wms_user');

            if (token && !isTokenExpired(token) && userJson) {
                const stored  = JSON.parse(userJson) || {};
                const decoded = parseToken(token);
                if (decoded) {
                    return { 
                        token,
                        username:     decoded.username || stored.username,
                        fullName:     stored.fullName || 'User',
                        employeeCode: stored.employeeCode || '---',
                        avatar:       stored.avatar || 'default',
                        roles:        decoded.roles || stored.roles || [],
                        exp:          decoded.exp,
                    };
                }
            }
        } catch (e) {
            console.error("Auth init error:", e);
        }
        localStorage.removeItem('wms_token');
        localStorage.removeItem('wms_user');
        return null;
    });

    const [loading] = useState(false);

    const logout = useCallback(() => {
        localStorage.removeItem('wms_token');
        localStorage.removeItem('wms_user');
        setUser(null);
    }, []);

    useEffect(() => {
        const handleUnauthorized = () => logout();
        window.addEventListener('wms:unauthorized', handleUnauthorized);
        return () => window.removeEventListener('wms:unauthorized', handleUnauthorized);
    }, [logout]);

    const login = useCallback(async (username, password) => {
        const res  = await axiosClient.post('/api/auth/login', { username, password });
        const data = res.data || {};

        const decoded = parseToken(data.token);
        if (!decoded) throw new Error("Invalid token received from server");

        const userObj = {
            token:        data.token,
            id:           data.id, // Store numeric ID
            username:     data.username || decoded.username,
            fullName:     data.fullName || 'User',
            employeeCode: data.employeeCode || '---',
            avatar:       data.avatar || 'default',
            roles:        data.roles || decoded.roles || [],
            exp:          decoded.exp,
        };

        localStorage.setItem('wms_token', data.token);
        localStorage.setItem('wms_user',  JSON.stringify(userObj));
        setUser(userObj);
        return userObj;
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
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth phải dùng bên trong <AuthProvider>');
    return ctx;
};