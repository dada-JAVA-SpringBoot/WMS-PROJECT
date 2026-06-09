import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useTheme } from '../../context/ThemeContext';

import Hero from './Sections/Hero';
import Features from './Sections/Features';
import Pricing from './Sections/Pricing';
import About from './Sections/About';

export default function LandingPage({ onEnter, onLogin }) {
    const { t, i18n } = useTranslation();
    const [view, setView] = useState('home');
    const { theme, toggleTheme } = useTheme();

    const renderContent = () => {
        switch (view) {
            case 'features': return <Features />;
            case 'pricing': return <Pricing onEnter={onEnter} />;
            case 'about': return <About />;
            default: return <Hero onEnter={onEnter} />;
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 font-sans text-gray-800 dark:text-gray-100 scroll-smooth relative transition-colors duration-300">

            <header className="bg-white dark:bg-gray-800 sticky top-0 z-50 border-b border-gray-100 dark:border-gray-700 shadow-sm transition-colors duration-300">
                <div className="max-w-[1400px] mx-auto px-6 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-12">
                        <div
                            className="text-2xl font-black flex items-center gap-2 cursor-pointer"
                            onClick={() => setView('home')}
                        >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-blue-500"></div>
                            <span className="text-[#149ca8]">AUTO HOME WMS</span>
                        </div>

                        <nav className="hidden lg:flex gap-8 text-[15px] font-bold text-gray-500 dark:text-gray-300">
                            <button onClick={() => setView('home')} className={`transition-colors ${view === 'home' ? 'text-[#149ca8]' : 'hover:text-[#149ca8]'}`}>{t('landing.home')}</button>
                            <button onClick={() => setView('features')} className={`transition-colors ${view === 'features' ? 'text-[#149ca8]' : 'hover:text-[#149ca8]'}`}>{t('landing.features')}</button>
                            <button onClick={() => setView('pricing')} className={`transition-colors ${view === 'pricing' ? 'text-[#149ca8]' : 'hover:text-[#149ca8]'}`}>{t('landing.pricing')}</button>
                            <button onClick={() => setView('about')} className={`transition-colors ${view === 'about' ? 'text-[#149ca8]' : 'hover:text-[#149ca8]'}`}>{t('landing.about')}</button>
                        </nav>
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        {/* Language Switcher */}
                        <div className="flex bg-gray-100 dark:bg-gray-800 p-0.5 rounded-full border border-gray-200 dark:border-gray-700 mr-2 shadow-inner">
                            <button
                                onClick={() => i18n.changeLanguage('vi')}
                                className={`px-2.5 py-1 rounded-full text-xs font-black transition-all ${
                                    i18n.language?.startsWith('vi')
                                    ? 'bg-[#149ca8] text-white shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-[#149ca8]'
                                }`}
                            >
                                VI
                            </button>
                            <button
                                onClick={() => i18n.changeLanguage('en')}
                                className={`px-2.5 py-1 rounded-full text-xs font-black transition-all ${
                                    i18n.language?.startsWith('en')
                                    ? 'bg-[#149ca8] text-white shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-[#149ca8]'
                                }`}
                            >
                                EN
                            </button>
                        </div>

                        <button
                            onClick={toggleTheme}
                            className="p-2 text-xl rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                            title={theme === 'dark' ? "Bật chế độ sáng" : "Bật chế độ tối"}
                        >
                            {theme === 'dark' ? '☀️' : '🌙'}
                        </button>

                        <button onClick={onLogin ?? onEnter} className="px-6 py-2 border-2 border-[#149ca8] text-[#149ca8] rounded-full font-bold hover:bg-blue-50 dark:hover:bg-gray-700 transition active:scale-95">
                            {t('landing.login')}
                        </button>
                        <button onClick={onEnter} className="px-6 py-2 bg-[#149ca8] text-white rounded-full font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/30 active:scale-95">
                            {t('landing.try_free')}
                        </button>
                    </div>
                </div>
            </header>

            <main className="min-h-[70vh]">
                {renderContent()}
            </main>

            <footer className="bg-[#f8f9fa] dark:bg-gray-900 pt-16 pb-8 border-t border-gray-200 dark:border-gray-800 text-sm text-gray-600 dark:text-gray-400 mt-20 transition-colors duration-300">
                <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    <div className="lg:col-span-2 space-y-4">
                        <div className="text-2xl font-black text-gray-800 dark:text-white flex items-center gap-2 mb-6">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-yellow-400 to-blue-500"></div> AUTO HOME
                        </div>
                        <p><strong>{t('landing.head_office')}:</strong> {t('landing.address')}</p>
                        <p>✉️ contact@autohome.com.vn</p>
                        <p>📞 {t('landing.sales_call')}: <strong>0904 885 833</strong></p>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-4">{t('landing.product')}</h4>
                        <ul className="space-y-3">
                            <li><button onClick={() => setView('features')} className="hover:text-blue-600 transition-colors">{t('landing.key_features')}</button></li>
                            <li><button onClick={() => setView('pricing')} className="hover:text-blue-600 transition-colors">{t('landing.pricing_plans')}</button></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-4">{t('landing.support')}</h4>
                        <ul className="space-y-3">
                            <li><a href="#" className="hover:text-blue-600 transition-colors">{t('landing.docs')}</a></li>
                            <li><a href="#" className="hover:text-blue-600 transition-colors">{t('landing.privacy')}</a></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-[1200px] mx-auto px-6 flex justify-between items-center border-t border-gray-200 dark:border-gray-800 pt-8">
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