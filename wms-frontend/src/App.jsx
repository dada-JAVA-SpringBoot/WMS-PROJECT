import React, { useState } from 'react';
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

function App() {
    // 1. Chỉ khai báo State một lần
    const [activeTab, setActiveTab] = useState('home');

    // 2. Hàm hiển thị nội dung (Switch-case gọn gàng)
    const renderContent = () => {
        switch (activeTab) {
            case 'home':
                return <Home />;
            case 'products':
                return <Inventory />;
            case 'attribute':
                return <AttributesPage />;
            case 'warehouse-area':
                return <WarehouseAreaPage />;
            case 'inbound':
                return <ImportReceiptsPage />;
            case 'outbound':
                return <ExportReceipts />;
            case 'client':
                return <Client />;
            case 'supplier':
                return <Supplier />;
            case 'staff':
                return <Staff />;
            case 'account':
                return <Account />;
            case 'statistical':
                return <Statistical />;
            case 'authority':
                return <div className="p-8 text-2xl font-bold">Màn hình Phân quyền (Đang xây dựng...)</div>;
            default:
                return <div className="p-8 text-gray-500">Vui lòng chọn một chức năng bên menu.</div>;
        }
    };

    // 3. Layout chuẩn: 1 Sidebar và 1 Main content
    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Cột trái: Sidebar cố định */}
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Cột phải: Nội dung chính */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-auto">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
}

export default App;