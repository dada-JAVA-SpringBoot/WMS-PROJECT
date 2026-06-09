// ===== src/pages/UnauthorizedPage.jsx =====
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useTranslation } from 'react-i18next';

export default function UnauthorizedPage() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <div className="text-6xl mb-4">🔒</div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">{t('pages.UnauthorizedPage.title')}</h1>
                <p className="text-gray-500 mb-6">{t('pages.UnauthorizedPage.description')}</p>
                <button onClick={() => navigate(-1)}
                    className="px-6 py-2.5 bg-[#1192a8] text-white rounded-xl font-bold hover:bg-teal-700 transition-all">
                    {t('pages.UnauthorizedPage.backButton')}
                </button>
            </div>
        </div>
    );
}
