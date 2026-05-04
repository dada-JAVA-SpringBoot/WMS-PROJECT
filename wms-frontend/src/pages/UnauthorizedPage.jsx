// ===== src/pages/UnauthorizedPage.jsx =====
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function UnauthorizedPage() {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <div className="text-6xl mb-4">🔒</div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Không có quyền truy cập</h1>
                <p className="text-gray-500 mb-6">Bạn không có quyền xem trang này.</p>
                <button onClick={() => navigate(-1)}
                    className="px-6 py-2.5 bg-[#1192a8] text-white rounded-xl font-bold hover:bg-teal-700 transition-all">
                    ← Quay lại
                </button>
            </div>
        </div>
    );
}
