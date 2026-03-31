import React, { useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import Inventory from './pages/Inventory';
import Home from "./pages/Home.jsx";

function App() {
    // Trạng thái lưu tab đang được chọn, mặc định mở tab Sản phẩm (products)
    const [activeTab, setActiveTab] = useState('products');

    // Hàm hiển thị nội dung động dựa vào tab đang chọn
    const renderContent = () => {
        switch (activeTab) {
            case 'products':
                return <Inventory />;
            case 'home':
                return <Home />;
            case 'attribute':
                return <div className="p-8 text-2xl font-bold">Màn hình Thuộc tính (Đang xây dựng...)</div>;
            case 'warehouse-area':
                return <div className="p-8 text-2xl font-bold">Màn hình Khu vực kho (Đang xây dựng...)</div>;
            case 'inbound':
                return <div className="p-8 text-2xl font-bold">Màn hình Phiếu nhập (Đang xây dựng...)</div>;
            case 'outbound':
                return <div className="p-8 text-2xl font-bold">Màn hình Phiếu xuất (Đang xây dựng...)</div>;
            case 'client':
                return <div className="p-8 text-2xl font-bold">Màn hình Khách hàng (Đang xây dựng...)</div>;
            case 'supplier':
                return <div className="p-8 text-2xl font-bold">Màn hình Nhà cung cấp (Đang xây dựng...)</div>;
            case 'staff':
                return <div className="p-8 text-2xl font-bold">Màn hình Nhân viên (Đang xây dựng...)</div>;
            case 'account':
                return <div className="p-8 text-2xl font-bold">Màn hình Tài khoản (Đang xây dựng...)</div>;
            case 'statistical':
                return <div className="p-8 text-2xl font-bold">Màn hình Thống kê (Đang xây dựng...)</div>;
            case 'authority':
                return <div className="p-8 text-2xl font-bold">Màn hình Phân quyền (Đang xây dựng...)</div>;
            default:
                return <div className="p-8 text-gray-500">Vui lòng chọn một chức năng bên menu.</div>;
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Cột trái: Sidebar cố định */}
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Cột phải: Nội dung chính */}
            <main className="flex-1 flex flex-col overflow-hidden">

                {/* Vùng hiển thị nội dung các trang (có scroll nếu nội dung dài) */}
                <div className="flex-1 overflow-auto">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
}

export default App;