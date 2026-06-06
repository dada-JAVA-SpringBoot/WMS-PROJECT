import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import axiosClient from './api/axiosClient';

import Sidebar            from './components/layout/sidebar.jsx';
import Login              from './pages/LoginPage.jsx';
import Inventory          from './pages/Inventory.jsx';
import Home               from './pages/Home.jsx';
import Staff              from './pages/Staff.jsx';
import Statistical        from './pages/Statistical.jsx';
import Account            from './pages/Account.jsx';
import AccountManagement   from './pages/AccountManagement.jsx';
import AttendanceHistory  from './pages/AttendanceHistory.jsx';
import AttendanceManagement from './pages/AttendanceManagement.jsx';
import ImportReceiptsPage from './pages/ImportReceipts.jsx';
import WarehouseAreaPage  from './pages/WarehouseArea.jsx';
import Supplier           from './pages/Supplier.jsx';
import Client             from './pages/Client.jsx';
import ExportReceipts     from './pages/OutboundOrder.jsx';
import TransactionHistory from './pages/TransactionHistory.jsx';
import WavePicking        from './pages/WavePicking.jsx';
import CycleCounting      from './pages/CycleCounting.jsx';
import LandingPage        from './pages/LandingPage/LandingPage.jsx';
import PrivateRoute       from './components/PrivateRoute.jsx';
import UnauthorizedPage   from './pages/UnauthorizedPage.jsx';
import AttendanceModal    from './components/modals/AttendanceModal.jsx';
import { getAvatarSrc }    from './components/common/avatarUtils';

import { ContextMenuProvider } from './context/ContextMenuContext';
import GlobalContextMenu from './components/modals/GlobalContextMenu';
import ScannerModal      from './components/modals/ScannerModal';
import ProductDetailModal from './components/modals/ProductDetailModal';
import SystemDialog       from './components/modals/SystemDialog';

// ── Layout chính cho khu vực quản trị ──────────────────────────────────────
function AdminLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    
    // Safety check: Nếu chưa có user thì không render để tránh crash
    if (!user) return null;

    const [workflow, setWorkflow] = useState(null);
    const [showAttendance, setShowAttendance] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Global Scanner States
    const [isGlobalScannerOpen, setIsGlobalScannerOpen] = useState(false);
    const [scannedProduct, setScannedProduct] = useState(null);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [dialog, setDialog] = useState({ isOpen: false, title: '', message: '' });

    useEffect(() => {
        const handleOpenScanner = () => setIsGlobalScannerOpen(true);
        const handleKeyDown = (e) => {
            if (e.key === 'F2') {
                e.preventDefault();
                setIsGlobalScannerOpen(true);
            }
        };

        window.addEventListener('wms:open-global-scanner', handleOpenScanner);
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('wms:open-global-scanner', handleOpenScanner);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const handleGlobalScan = async (decodedText) => {
        setIsGlobalScannerOpen(false);
        const code = decodedText.trim();
        
        try {
            // 1. Thử tìm sản phẩm theo SKU/Barcode
            const prodRes = await axiosClient.get(`/api/products/search?keyword=${code}`);
            if (prodRes.data && prodRes.data.length > 0) {
                setScannedProduct(prodRes.data[0]);
                setIsProductModalOpen(true);
                return;
            }

            // 2. Thử tìm theo Mã vị trí (BinCode)
            const locRes = await axiosClient.get(`/api/locations/overview`);
            const foundLoc = locRes.data.find(l => l.binCode === code);
            if (foundLoc) {
                navigate('/admin/warehouse-area');
                // Có thể thêm logic highlight vị trí ở đây
                return;
            }

            // 3. Thử tìm theo Mã phiếu (Inbound/Outbound)
            if (code.startsWith('PN') || code.startsWith('XK') || code.startsWith('WV')) {
                if (code.startsWith('PN')) navigate(`/admin/inbound?search=${code}`);
                else if (code.startsWith('XK')) navigate(`/admin/outbound?search=${code}`);
                else if (code.startsWith('WV')) navigate(`/admin/wave-picking?search=${code}`);
                return;
            }

            setDialog({ isOpen: true, title: 'Không tìm thấy', message: `Mã "${code}" không khớp với bất kỳ Sản phẩm, Vị trí hoặc Phiếu nào trong hệ thống.` });
        } catch (e) {
            console.error("Lỗi khi xử lý quét mã:", e);
        }
    };

    const openWorkflow = (nextWorkflow) => {
        if (!nextWorkflow?.kind) return;
        setWorkflow(nextWorkflow);
        navigate(nextWorkflow.kind === 'inbound' ? '/admin/inbound' : '/admin/outbound');
    };

    const clearWorkflow = () => setWorkflow(null);

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden relative">
            <SystemDialog 
                isOpen={dialog.isOpen} 
                title={dialog.title} 
                message={dialog.message} 
                onClose={() => setDialog({ ...dialog, isOpen: false })} 
            />
            <Sidebar 
                user={user} 
                onLogout={logout} 
                isOpen={isSidebarOpen} 
                onClose={() => setIsSidebarOpen(false)} 
            />
            
            <main className="flex-1 flex flex-col overflow-hidden w-full">
                {/* Mobile Header Toggle */}
                <div className="lg:hidden bg-white border-b p-4 flex items-center justify-between shrink-0">
                    <button 
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        <div className="w-6 h-0.5 bg-[#1192a8] mb-1.5"></div>
                        <div className="w-6 h-0.5 bg-[#1192a8] mb-1.5"></div>
                        <div className="w-4 h-0.5 bg-[#1192a8]"></div>
                    </button>
                    <h1 className="text-[#1192a8] font-black text-sm tracking-widest uppercase">WMS System</h1>
                    <div className="w-10 h-10 bg-gray-100 rounded-full overflow-hidden border border-gray-200 shadow-sm">
                        <img src={getAvatarSrc(user?.avatar)} alt="User" className="w-full h-full object-cover" />
                    </div>
                </div>

                <div className="flex-1 overflow-auto bg-gray-50 no-scrollbar p-0">
                    <Routes>                        <Route path="home" element={<Home />} />
                        <Route path="products" element={
                            <Inventory onCreateInbound={openWorkflow} onCreateOutbound={openWorkflow} />
                        } />
                        <Route path="warehouse-area" element={
                            <PrivateRoute roles={['ADMIN','MANAGER','STOREKEEPER','HANDLER','QUALITY_CONTROL']}>
                                <WarehouseAreaPage onCreateInbound={openWorkflow} />
                            </PrivateRoute>
                        } />
                        <Route path="inbound" element={
                            <PrivateRoute roles={['ADMIN','MANAGER','STOREKEEPER','INBOUND_STAFF','ACCOUNTANT','QUALITY_CONTROL']}>
                                <ImportReceiptsPage workflow={workflow} clearWorkflow={clearWorkflow} openWorkflow={openWorkflow} />
                            </PrivateRoute>
                        } />
                        <Route path="outbound" element={
                            <PrivateRoute roles={['ADMIN','MANAGER','STOREKEEPER','OUTBOUND_STAFF','ACCOUNTANT','QUALITY_CONTROL']}>
                                <ExportReceipts workflow={workflow} clearWorkflow={clearWorkflow} openWorkflow={openWorkflow} />
                            </PrivateRoute>
                        } />
                        <Route path="attendance" element={
                            <PrivateRoute roles={['ADMIN','MANAGER','STOREKEEPER','INBOUND_STAFF','OUTBOUND_STAFF','CHECKER','ACCOUNTANT','HANDLER','QUALITY_CONTROL']}>
                                <AttendanceHistory />
                            </PrivateRoute>
                        } />
                        <Route path="attendance-manage" element={
                            <PrivateRoute roles={['ADMIN','MANAGER']}>
                                <AttendanceManagement />
                            </PrivateRoute>
                        } />
                        <Route path="client" element={
                            <PrivateRoute roles={['ADMIN','MANAGER','OUTBOUND_STAFF','ACCOUNTANT']}>
                                <Client onCreateOutbound={openWorkflow} />
                            </PrivateRoute>
                        } />
                        <Route path="supplier" element={
                            <PrivateRoute roles={['ADMIN','MANAGER','STOREKEEPER','INBOUND_STAFF','ACCOUNTANT']}>
                                <Supplier onCreateInbound={openWorkflow} />
                            </PrivateRoute>
                        } />
                        <Route path="staff" element={
                            <PrivateRoute roles={['ADMIN','MANAGER']}>
                                <Staff onCreateInbound={openWorkflow} onCreateOutbound={openWorkflow} />
                            </PrivateRoute>
                        } />
                        <Route path="account" element={
                            <PrivateRoute roles={['ADMIN','MANAGER']}>
                                <AccountManagement />
                            </PrivateRoute>
                        } />
                        <Route path="statistical" element={
                            <PrivateRoute roles={['ADMIN','MANAGER','ACCOUNTANT']}>
                                <Statistical />
                            </PrivateRoute>
                        } />
                        <Route path="transactions" element={
                            <PrivateRoute roles={['ADMIN','MANAGER','STOREKEEPER','ACCOUNTANT']}>
                                <TransactionHistory />
                            </PrivateRoute>
                        } />
                        <Route path="wave-picking" element={
                            <PrivateRoute roles={['ADMIN','MANAGER','STOREKEEPER']}>
                                <WavePicking />
                            </PrivateRoute>
                        } />
                        <Route path="cycle-counting" element={
                            <PrivateRoute roles={['ADMIN','MANAGER','STOREKEEPER','CHECKER']}>
                                <CycleCounting />
                            </PrivateRoute>
                        } />
                        <Route path="authority" element={
                            <PrivateRoute roles={['ADMIN']}>
                                <div className="p-8 text-2xl font-bold">Màn hình Phân quyền (Đang xây dựng...)</div>
                            </PrivateRoute>
                        } />
                        <Route path="*" element={<Navigate to="home" replace />} />
                    </Routes>
                </div>
            </main>
            {/* Modal chấm công tự động cho nhân viên */}
            {showAttendance && user && !user.roles.includes('ADMIN') && (
                <AttendanceModal user={user} onClose={() => setShowAttendance(false)} />
            )}
            
            {/* Global Modals */}
            <ScannerModal 
                isOpen={isGlobalScannerOpen} 
                onClose={() => setIsGlobalScannerOpen(false)} 
                onScanSuccess={handleGlobalScan} 
            />
            {scannedProduct && (
                <ProductDetailModal 
                    isOpen={isProductModalOpen} 
                    onClose={() => { setIsProductModalOpen(false); setScannedProduct(null); }} 
                    product={scannedProduct} 
                />
            )}

            {/* Global Context Menu */}
            <GlobalContextMenu />
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
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#1192a8] border-t-transparent rounded-full animate-spin"></div>
                    <p className="font-bold tracking-widest text-[#1192a8] animate-pulse">WMS SYSTEM LOADING...</p>
                </div>
            </div>
        );
    }

    return (
        <Routes>
            {/* 1. Landing Page */}
            <Route path="/" element={<LandingPage onEnter={() => navigate('/admin/home')} onLogin={() => navigate('/login')} />} />

            {/* 2. Login Page */}
            <Route path="/login" element={<Login onLoginSuccess={() => navigate('/admin/home')} />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="/admin/*" element={
                <PrivateRoute>
                    <AdminLayout />
                </PrivateRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <ContextMenuProvider>
                <AppContent />
            </ContextMenuProvider>
        </AuthProvider>
    );
}