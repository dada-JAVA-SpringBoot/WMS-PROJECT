import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Sidebar            from './components/layout/sidebar';
import Login              from './pages/LoginPage.jsx';
import Inventory          from './pages/Inventory';
import Home               from './pages/Home.jsx';
import Staff              from './pages/Staff.jsx';
import Statistical        from './pages/Statistical.jsx';
import Account            from './pages/Account.jsx';
import AttributesPage     from './pages/AttributesPage.jsx';
import ImportReceiptsPage from './pages/ImportReceipts.jsx';
import WarehouseAreaPage  from './pages/WarehouseArea.jsx';
import Supplier           from './pages/Supplier.jsx';
import Client             from './pages/Client.jsx';
import ExportReceipts     from './pages/OutboundOrder.jsx';
import LandingPage        from './pages/LandingPage/LandingPage.jsx';
import PrivateRoute       from './components/PrivateRoute';
import UnauthorizedPage   from './pages/UnauthorizedPage.jsx';

// ── Layout chính cho khu vực quản trị ──────────────────────────────────────
function AdminLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [workflow, setWorkflow] = useState(null);

    const openWorkflow = (nextWorkflow) => {
        if (!nextWorkflow?.kind) return;
        setWorkflow(nextWorkflow);
        navigate(nextWorkflow.kind === 'inbound' ? '/admin/inbound' : '/admin/outbound');
    };

    const clearWorkflow = () => setWorkflow(null);

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <Sidebar user={user} onLogout={logout} />
            <main className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-auto">
                    <Routes>
                        <Route path="home" element={<Home />} />
                        <Route path="products" element={
                            <Inventory 
                                onCreateInbound={openWorkflow} 
                                onCreateOutbound={openWorkflow} 
                            />
                        } />
                        <Route path="attribute" element={
                            <PrivateRoute roles={['ADMIN']}>
                                <AttributesPage />
                            </PrivateRoute>
                        } />
                        <Route path="warehouse-area" element={
                            <PrivateRoute roles={['ADMIN','MANAGER','STOREKEEPER']}>
                                <WarehouseAreaPage onCreateInbound={openWorkflow} />
                            </PrivateRoute>
                        } />
                        <Route path="inbound" element={
                            <PrivateRoute roles={['ADMIN','MANAGER','STOREKEEPER','INBOUND_STAFF']}>
                                <ImportReceiptsPage 
                                    workflow={workflow} 
                                    clearWorkflow={clearWorkflow} 
                                    openWorkflow={openWorkflow} 
                                />
                            </PrivateRoute>
                        } />
                        <Route path="outbound" element={
                            <PrivateRoute roles={['ADMIN','MANAGER','STOREKEEPER','OUTBOUND_STAFF']}>
                                <ExportReceipts 
                                    workflow={workflow} 
                                    clearWorkflow={clearWorkflow} 
                                    openWorkflow={openWorkflow} 
                                />
                            </PrivateRoute>
                        } />
                        <Route path="client" element={
                            <PrivateRoute roles={['ADMIN','MANAGER','OUTBOUND_STAFF']}>
                                <Client onCreateOutbound={openWorkflow} />
                            </PrivateRoute>
                        } />
                        <Route path="supplier" element={
                            <PrivateRoute roles={['ADMIN','MANAGER','STOREKEEPER','INBOUND_STAFF']}>
                                <Supplier onCreateInbound={openWorkflow} />
                            </PrivateRoute>
                        } />
                        <Route path="staff" element={
                            <PrivateRoute roles={['ADMIN']}>
                                <Staff onCreateInbound={openWorkflow} onCreateOutbound={openWorkflow} />
                            </PrivateRoute>
                        } />
                        <Route path="account" element={
                            <PrivateRoute roles={['ADMIN']}>
                                <Account />
                            </PrivateRoute>
                        } />
                        <Route path="statistical" element={
                            <PrivateRoute roles={['ADMIN','MANAGER','STOREKEEPER','CHECKER']}>
                                <Statistical />
                            </PrivateRoute>
                        } />
                        <Route path="authority" element={
                            <PrivateRoute roles={['ADMIN']}>
                                <div className="p-8 text-2xl font-bold">Màn hình Phân quyền (Đang xây dựng...)</div>
                            </PrivateRoute>
                        } />
                        {/* Fallback cho admin */}
                        <Route path="*" element={<Navigate to="home" replace />} />
                    </Routes>
                </div>
            </main>
        </div>
    );
}

// ── AppContent: Phân luồng Landing / Login / Admin ─────────────────────────
function AppContent() {
    const { loading } = useAuth();
    const navigate = useNavigate();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50 text-gray-400 text-sm">
                Đang khởi tạo...
            </div>
        );
    }

    return (
        <Routes>
            {/* 1. Landing Page */}
            <Route path="/" element={<LandingPage onEnter={() => navigate('/admin/home')} />} />

            {/* 2. Login Page */}
            <Route path="/login" element={<Login onLoginSuccess={() => navigate('/admin/home')} />} />

            {/* 3. Unauthorized Page */}
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* 4. Admin Area (Protected) */}
            <Route path="/admin/*" element={
                <PrivateRoute>
                    <AdminLayout />
                </PrivateRoute>
            } />

            {/* 5. Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}
