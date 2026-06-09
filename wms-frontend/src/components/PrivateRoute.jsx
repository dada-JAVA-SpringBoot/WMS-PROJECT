// ===== src/components/PrivateRoute.jsx =====
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Bảo vệ route theo role.
 * Dùng: <PrivateRoute roles={['ADMIN']}> <StaffPage /> </PrivateRoute>
 *        <PrivateRoute> <Dashboard /> </PrivateRoute>  ← chỉ cần đăng nhập
 */
export default function PrivateRoute({ children, roles }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) return (
        <div className="flex items-center justify-center h-screen text-gray-400">
            Đang tải...
        </div>
    );

    if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

    if (roles && !roles.some(r => user.roles?.includes(r))) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
}

