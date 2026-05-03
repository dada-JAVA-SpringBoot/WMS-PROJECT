import React, { useState, useEffect } from 'react';
import Sidebar from './components/layout/sidebar';
import Inventory from './pages/Inventory';
import Home from './pages/Home.jsx';
import Staff from './pages/Staff.jsx';
import Statistical from './pages/Statistical.jsx';
import Account from './pages/Account.jsx';
import AttributesPage from "./pages/AttributesPage.jsx";
import ImportReceiptsPage from "./pages/ImportReceipts.jsx";
import WarehouseAreaPage from "./pages/WarehouseArea.jsx";
import Supplier from './pages/Supplier.jsx';
import Client from './pages/Client.jsx';
import ExportReceipts from "./pages/OutboundOrder.jsx";
import LandingPage from './pages/LandingPage/LandingPage.jsx';

function App() {
    const [isInsideSystem, setIsInsideSystem] = useState(false);
    const [activeTab, setActiveTab] = useState('home');

    // --- ĐOẠN CODE MỚI THÊM VÀO ĐỂ LẮNG NGHE NÚT BACK CỦA TRÌNH DUYỆT ---
    useEffect(() => {
        // Lắng nghe sự kiện khi người dùng bấm nút Quay lại (Back)
        const handlePopState = () => {
            setIsInsideSystem(false); // Trả về màn hình Landing Page
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const handleEnterSystem = () => {
        // Tạo một lịch sử ảo để nút Back của trình duyệt sáng lên
        window.history.pushState({ page: 'admin' }, '', '/admin');
        setIsInsideSystem(true);
    };
    // -------------------------------------------------------------------

    const renderContent = () => {
        switch (activeTab) {
            case 'home': return <Home />;
            case 'products': return <Inventory />;
            case 'attribute': return <AttributesPage />;
            case 'warehouse-area': return <WarehouseAreaPage />;
            case 'inbound': return <ImportReceiptsPage />;
            case 'outbound': return <ExportReceipts />;
            case 'client': return <Client />;
            case 'supplier': return <Supplier />;
            case 'staff': return <Staff />;
            case 'account': return <Account />;
            case 'statistical': return <Statistical />;
            case 'authority': return <div className="p-8 text-2xl font-bold">Màn hình Phân quyền (Đang xây dựng...)</div>;
            default: return <div className="p-8 text-gray-500">Vui lòng chọn một chức năng bên menu.</div>;
        }
    };

    if (!isInsideSystem) {
        // Đảm bảo URL luôn là '/' khi ở ngoài
        if (window.location.pathname !== '/') {
            window.history.replaceState({}, '', '/');
        }
        // Gọi hàm handleEnterSystem thay vì setIsInsideSystem trực tiếp
        return <LandingPage onEnter={handleEnterSystem} />;
    }

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <main className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-auto">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
}

export default App;