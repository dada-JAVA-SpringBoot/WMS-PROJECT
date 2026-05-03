import React, { useState } from 'react';


import Hero from './Sections/Hero';
import Features from './Sections/Features';
import Pricing from './Sections/Pricing';
import About from './Sections/About';

export default function LandingPage({ onEnter }) {

    const [view, setView] = useState('home');


    const renderContent = () => {
        switch (view) {
            case 'features': return <Features />;
            case 'pricing': return <Pricing onEnter={onEnter} />;
            case 'about': return <About />;
            default: return <Hero onEnter={onEnter} />;
        }
    };

    return (
        <div className="min-h-screen bg-white font-sans text-gray-800 scroll-smooth relative">


            <header className="bg-white sticky top-0 z-50 border-b border-gray-100 shadow-sm">
                <div className="max-w-[1400px] mx-auto px-6 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-12">
                        {/* Logo */}
                        <div
                            className="text-2xl font-black flex items-center gap-2 cursor-pointer"
                            onClick={() => setView('home')}
                        >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-blue-500"></div>
                            <span className="text-[#149ca8]">AUTO HOME WMS</span>
                        </div>


                        <nav className="hidden lg:flex gap-8 text-[15px] font-bold text-gray-500">
                            <button onClick={() => setView('home')} className={`transition-colors ${view === 'home' ? 'text-[#149ca8]' : 'hover:text-[#149ca8]'}`}>Trang chủ</button>
                            <button onClick={() => setView('features')} className={`transition-colors ${view === 'features' ? 'text-[#149ca8]' : 'hover:text-[#149ca8]'}`}>Tính năng</button>
                            <button onClick={() => setView('pricing')} className={`transition-colors ${view === 'pricing' ? 'text-[#149ca8]' : 'hover:text-[#149ca8]'}`}>Bảng giá</button>
                            <button onClick={() => setView('about')} className={`transition-colors ${view === 'about' ? 'text-[#149ca8]' : 'hover:text-[#149ca8]'}`}>Giới thiệu</button>
                        </nav>
                    </div>


                    <div className="hidden md:flex items-center gap-4">
                        <button onClick={onEnter} className="px-6 py-2 border-2 border-[#149ca8] text-[#149ca8] rounded-full font-bold hover:bg-blue-50 transition active:scale-95">
                            Đăng nhập
                        </button>
                        <button onClick={onEnter} className="px-6 py-2 bg-[#149ca8] text-white rounded-full font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/30 active:scale-95">
                            Dùng thử miễn phí
                        </button>
                    </div>
                </div>
            </header>


            <main className="min-h-[70vh]">
                {renderContent()}
            </main>


            <footer className="bg-[#f8f9fa] pt-16 pb-8 border-t border-gray-200 text-sm text-gray-600 mt-20">
                <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    <div className="lg:col-span-2 space-y-4">
                        <div className="text-2xl font-black text-gray-800 flex items-center gap-2 mb-6">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-yellow-400 to-blue-500"></div> AUTO HOME
                        </div>
                        <p><strong>Trụ sở chính:</strong> Tầng 9, tòa nhà Technosoft, phố Duy Tân, Cầu Giấy, Hà Nội</p>
                        <p>✉️ contact@autohome.com.vn</p>
                        <p>📞 Tư vấn bán hàng: <strong>0904 885 833</strong></p>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 mb-4">Sản phẩm</h4>
                        <ul className="space-y-3">
                            <li><button onClick={() => setView('features')} className="hover:text-blue-600 transition-colors">Tính năng nổi bật</button></li>
                            <li><button onClick={() => setView('pricing')} className="hover:text-blue-600 transition-colors">Bảng giá dịch vụ</button></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 mb-4">Hỗ trợ</h4>
                        <ul className="space-y-3">
                            <li><a href="#" className="hover:text-blue-600 transition-colors">Tài liệu sử dụng</a></li>
                            <li><a href="#" className="hover:text-blue-600 transition-colors">Chính sách bảo mật</a></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-[1200px] mx-auto px-6 flex justify-between items-center border-t border-gray-200 pt-8">
                    <p>Copyright © 2026 AUTO HOME JSC. All rights reserved.</p>
                </div>
            </footer>


            <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
                <button className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600 transition font-bold text-xs">
                    Zalo
                </button>
                <button className="w-12 h-12 bg-white-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition font-bold text-xl">
                    📞
                </button>
            </div>

        </div>
    );
}