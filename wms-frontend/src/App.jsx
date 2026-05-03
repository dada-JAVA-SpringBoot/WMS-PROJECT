// src/App.jsx
import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';

import Sidebar          from './components/layout/sidebar';
import Login            from './pages/Login';
import Inventory        from './pages/Inventory';
import Home             from './pages/Home.jsx';
import Staff            from './pages/Staff.jsx';
import Statistical      from './pages/Statistical.jsx';
import Account          from './pages/Account.jsx';
import AttributesPage   from './pages/AttributesPage.jsx';
import ImportReceiptsPage from './pages/ImportReceipts.jsx';
import WarehouseAreaPage  from './pages/WarehouseArea.jsx';
import Supplier         from './pages/Supplier.jsx';
import Client           from './pages/Client.jsx';
import ExportReceipts   from './pages/OutboundOrder.jsx';

// ── Trang 403 inline ──────────────────────────────────────────────────────
function ForbiddenPage({ onBack }) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Không có quyền truy cập</h2>
            <p className="text-gray-500 mb-6">Bạn không có quyền xem trang này.</p>
            <button onClick={onBack}
                className="px-6 py-2.5 bg-[#1192a8] text-white rounded-xl font-bold
                           hover:bg-teal-700 transition-all">
                ← Quay lại
            </button>
        </div>
    );
}

// ── Map: activeTab → roles được phép vào (empty = tất cả role) ────────────
const TAB_PERMISSIONS = {
    home:          [],                                              // tất cả
    products:      ['ADMIN','MANAGER','STOREKEEPER','INBOUND_STAFF','OUTBOUND_STAFF','CHECKER'],
    attribute:     ['ADMIN'],
    'warehouse-area': ['ADMIN','MANAGER','STOREKEEPER'],
    inbound:       ['ADMIN','MANAGER','STOREKEEPER','INBOUND_STAFF'],
    outbound:      ['ADMIN','MANAGER','STOREKEEPER','OUTBOUND_STAFF'],
    client:        ['ADMIN','MANAGER','OUTBOUND_STAFF'],
    supplier:      ['ADMIN','MANAGER','STOREKEEPER','INBOUND_STAFF'],
    staff:         ['ADMIN'],
    account:       ['ADMIN'],
    statistical:   ['ADMIN','MANAGER','STOREKEEPER','CHECKER'],
    authority:     ['ADMIN'],
};

// ── AppContent: dùng sau khi có AuthProvider ──────────────────────────────
function AppContent() {
    const { user, loading, logout, hasAnyRole } = useAuth();
    const [activeTab, setActiveTab] = useState('home');
    const [prevTab,   setPrevTab]   = useState('home');

    // Đang khởi tạo — tránh flash màn hình
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50 text-gray-400 text-sm">
                Đang khởi tạo...
            </div>
        );
    }

    // Chưa đăng nhập → hiển thị Login
    if (!user) {
        return <Login onLoginSuccess={() => setActiveTab('home')} />;
    }

    // ── Xử lý chuyển tab có kiểm tra quyền ───────────────────────────────
    const handleSetActiveTab = (tab) => {
        const allowed = TAB_PERMISSIONS[tab] ?? [];
        if (allowed.length === 0 || hasAnyRole(...allowed)) {
            setPrevTab(activeTab);
            setActiveTab(tab);
        } else {
            // Vẫn set tab để hiển thị ForbiddenPage, lưu prevTab để quay lại
            setPrevTab(activeTab);
            setActiveTab('__forbidden__');
        }
    };

    // ── Render content theo activeTab ─────────────────────────────────────
    const renderContent = () => {
        if (activeTab === '__forbidden__') {
            return <ForbiddenPage onBack={() => setActiveTab(prevTab)} />;
        }

        switch (activeTab) {
            case 'home':          return <Home />;
            case 'products':      return <Inventory />;
            case 'attribute':     return <AttributesPage />;
            case 'warehouse-area': return <WarehouseAreaPage />;
            case 'inbound':       return <ImportReceiptsPage />;
            case 'outbound':      return <ExportReceipts />;
            case 'client':        return <Client />;
            case 'supplier':      return <Supplier />;
            case 'staff':         return <Staff />;
            case 'account':       return <Account />;
            case 'statistical':   return <Statistical />;
            case 'authority':
                return <div className="p-8 text-2xl font-bold">Màn hình Phân quyền (Đang xây dựng...)</div>;
            default:
                return <div className="p-8 text-gray-500">Vui lòng chọn một chức năng bên menu.</div>;
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar — truyền thêm user để ẩn/hiện menu theo role */}
            <Sidebar
                activeTab={activeTab}
                setActiveTab={handleSetActiveTab}
                user={user}
                onLogout={logout}
            />

            {/* Main content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-auto">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
}

// ── App root: bọc AuthProvider ────────────────────────────────────────────
export default function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}