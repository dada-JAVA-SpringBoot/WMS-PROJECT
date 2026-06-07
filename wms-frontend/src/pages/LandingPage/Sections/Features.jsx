import React from 'react';
import { useTranslation } from 'react-i18next';
import imgProduct from '../../../components/common/icons/a11.png';
import imgQlKho from '../../../components/common/icons/a10.png';
import imgSPX from '../../../components/common/icons/a8.png';
import imgSuppiler from '../../../components/common/icons/a7.png';
import imgStaff from '../../../components/common/icons/a6.png';

const Features = () => {
    const { t } = useTranslation();
    return (
        <div className="bg-white">

            <div className="text-center py-20 bg-gray-50 border-b border-gray-100">
                <h2 className="text-[#149ca8] font-bold tracking-widest text-sm mb-4 uppercase">{t('pages.Features.tag')}</h2>
                <h3 className="text-4xl font-black text-gray-900">{t('pages.Features.title')}</h3>
            </div>

            <div className="max-w-[1200px] mx-auto px-6 py-20 space-y-32">

                {/* Section 1: Quản lý Danh mục Hàng hóa */}
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Đã xóa h-[450px], giữ lại p-8 để có viền xanh dương bọc ngoài đẹp mắt */}
                    <div className="relative bg-blue-50/50 rounded-[3rem] flex items-center justify-center p-8 border border-blue-100/50 group overflow-hidden">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-cyan-400/20 rounded-full blur-3xl -z-10"></div>
                        <div className="absolute top-1/4 right-1/4 w-[200px] h-[200px] bg-purple-400/20 rounded-full blur-3xl -z-10"></div>


                        <div className="w-full bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden border-4 border-white/50">
                            <img
                                src={imgProduct}
                                alt={t('pages.Features.imgProductAlt')}
                                className="w-full h-auto block group-hover:scale-105 transition-transform duration-700"
                            />
                        </div>
                    </div>
                    <div className="space-y-6">
                        <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                            {t('pages.Features.secProductTitle')}
                        </h3>
                        <ul className="space-y-5 text-gray-600">
                            <li className="flex items-start gap-3">
                                <span className="text-green-500 bg-green-50 rounded-full p-1 mt-0.5"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg></span>
                                <span>{t('pages.Features.secProductBullet1Part1')}<span className="font-bold text-[#149ca8]">{t('pages.Features.secProductBullet1Highlight')}</span>{t('pages.Features.secProductBullet1Part2')}</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-green-500 bg-green-50 rounded-full p-1 mt-0.5"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg></span>
                                <span>{t('pages.Features.secProductBullet2Part1')}<span className="font-bold text-[#149ca8]">{t('pages.Features.secProductBullet2Highlight')}</span>{t('pages.Features.secProductBullet2Part2')}</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-green-500 bg-green-50 rounded-full p-1 mt-0.5"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg></span>
                                <span>{t('pages.Features.secProductBullet3')}</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-green-500 bg-green-50 rounded-full p-1 mt-0.5"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg></span>
                                <span>{t('pages.Features.secProductBullet4')}</span>
                            </li>
                        </ul>
                        <div className="flex gap-4 pt-6">
                            <button className="bg-[#149ca8] text-white px-6 py-3 rounded-full font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/30 flex items-center gap-2">{t('pages.Features.secProductTryForFree')} <span className="bg-white text-blue-600 rounded-full p-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg></span></button>
                        </div>
                    </div>
                </div>

                {/* Section 2: Khu vực Kho */}
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-6 order-2 lg:order-1">
                        <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                            {t('pages.Features.secWarehouseTitle')}
                        </h3>
                        <ul className="space-y-6 text-gray-600">
                            <li>
                                <div className="flex items-center gap-3 font-bold text-gray-900 mb-1">
                                    <span className="text-green-500 bg-green-50 rounded-full p-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg></span>
                                    {t('pages.Features.secWarehouseBullet1Part1')}<span className="text-[#149ca8] ml-1">{t('pages.Features.secWarehouseBullet1Highlight')}</span>{t('pages.Features.secWarehouseBullet1Part2')}
                                </div>
                                <p className="ml-9 text-sm text-gray-500">{t('pages.Features.secWarehouseBullet1Desc')}</p>
                            </li>
                            <li>
                                <div className="flex items-center gap-3 font-bold text-gray-900 mb-1">
                                    <span className="text-green-500 bg-green-50 rounded-full p-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg></span>
                                    {t('pages.Features.secWarehouseBullet2Title')}
                                </div>
                                <p className="ml-9 text-sm text-gray-500">{t('pages.Features.secWarehouseBullet2Desc')}</p>
                            </li>
                            <li>
                                <div className="flex items-center gap-3 font-bold text-gray-900 mb-1">
                                    <span className="text-green-500 bg-green-50 rounded-full p-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg></span>
                                    {t('pages.Features.secWarehouseBullet3Title')}
                                </div>
                                <p className="ml-9 text-sm text-gray-500">{t('pages.Features.secWarehouseBullet3Desc')}</p>
                            </li>
                        </ul>
                    </div>
                    <div className="relative bg-purple-50/50 rounded-[3rem] flex items-center justify-center p-8 border border-purple-100/50 order-1 lg:order-2 group overflow-hidden">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-purple-300/20 rounded-full blur-3xl -z-10"></div>
                        <div className="w-full bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden border-4 border-white/50">
                            <img
                                src={imgQlKho}
                                alt={t('pages.Features.imgWarehouseAlt')}
                                className="w-full h-auto block group-hover:scale-105 transition-transform duration-700"
                            />
                        </div>
                    </div>
                </div>

                {/* Section 3: Nhập - Xuất */}
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="relative bg-pink-50/50 rounded-[3rem] flex items-center justify-center p-8 border border-pink-100/50 group overflow-hidden">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-pink-400/20 rounded-full blur-3xl -z-10"></div>
                        <div className="w-full bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden border-4 border-white/50">
                            <img
                                src={imgSPX}
                                alt={t('pages.Features.imgInOutAlt')}
                                className="w-full h-auto block group-hover:scale-105 transition-transform duration-700"
                            />
                        </div>
                    </div>
                    <div className="space-y-6">
                        <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                            {t('pages.Features.secInOutTitle')}
                        </h3>
                        <p className="text-gray-600">{t('pages.Features.secInOutSubtitle')}</p>
                        <ul className="space-y-5 text-gray-600">
                            <li>
                                <div className="flex items-center gap-3 font-bold text-gray-900 mb-1">
                                    <span className="text-green-500 bg-green-50 rounded-full p-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg></span>
                                    {t('pages.Features.secInOutBullet1Part1')}<span className="text-[#149ca8] ml-1">{t('pages.Features.secInOutBullet1Highlight')}</span>{t('pages.Features.secInOutBullet1Part2')}
                                </div>
                                <p className="ml-9 text-sm text-gray-500">{t('pages.Features.secInOutBullet1Desc')}</p>
                            </li>
                            <li>
                                <div className="flex items-center gap-3 font-bold text-gray-900 mb-1">
                                    <span className="text-green-500 bg-green-50 rounded-full p-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg></span>
                                    {t('pages.Features.secInOutBullet2Part1')}<span className="text-[#149ca8] ml-1">{t('pages.Features.secInOutBullet2Highlight')}</span>{t('pages.Features.secInOutBullet2Part2')}
                                </div>
                                <p className="ml-9 text-sm text-gray-500">{t('pages.Features.secInOutBullet2Desc')}</p>
                            </li>
                            <li>
                                <div className="flex items-center gap-3 font-bold text-gray-900 mb-1">
                                    <span className="text-green-500 bg-green-50 rounded-full p-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg></span>
                                    {t('pages.Features.secInOutBullet3Title')}
                                </div>
                                <p className="ml-9 text-sm text-gray-500">{t('pages.Features.secInOutBullet3Desc')}</p>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Section 4: Đối tác & Thống kê */}
            <div className="bg-[#f2f8ff] py-24 group">
                <div className="max-w-[1200px] mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-6 order-2 lg:order-1">
                        <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                            {t('pages.Features.secPartnerTitlePart1')}<br/>{t('pages.Features.secPartnerTitlePart2')}
                        </h3>
                        <ul className="space-y-6 text-gray-600">
                            <li>
                                <div className="flex items-center gap-3 font-bold text-gray-900 mb-1">
                                    <span className="text-green-500 bg-green-50 rounded-full p-1 bg-white"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg></span>
                                    {t('pages.Features.secPartnerBullet1Part1')}<span className="text-[#149ca8] mx-1">{t('pages.Features.secPartnerBullet1Highlight1')}</span>{t('pages.Features.secPartnerBullet1And')}<span className="text-[#149ca8] ml-1">{t('pages.Features.secPartnerBullet1Highlight2')}</span>
                                </div>
                                <p className="ml-9 text-sm text-gray-500">{t('pages.Features.secPartnerBullet1Desc')}</p>
                            </li>
                            <li>
                                <div className="flex items-center gap-3 font-bold text-gray-900 mb-1">
                                    <span className="text-green-500 bg-green-50 rounded-full p-1 bg-white"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg></span>
                                    {t('pages.Features.secPartnerBullet2Part1')}<span className="text-[#149ca8] ml-1">{t('pages.Features.secPartnerBullet2Highlight')}</span>{t('pages.Features.secPartnerBullet2Part2')}
                                </div>
                                <p className="ml-9 text-sm text-gray-500">{t('pages.Features.secPartnerBullet2Desc')}</p>
                            </li>
                        </ul>
                    </div>

                    <div className="w-full bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden border-4 border-white/50 order-1 lg:order-2 group">
                        <img
                            src={imgSuppiler}
                            alt={t('pages.Features.imgPartnerAlt')}
                            className="w-full h-auto block group-hover:scale-105 transition-transform duration-700"
                        />
                    </div>
                </div>
            </div>

            {/* Section 5: Nhân sự & Phân quyền */}
            <div className="bg-[#fff7f0] py-24 mb-20 group">
                <div className="max-w-[1200px] mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
                    {/* Xóa p-8 để ảnh lấp đầy hoàn toàn nếu không muốn có viền */}
                    <div className="relative w-full bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden border-4 border-white/50 flex items-center justify-center p-0 group">
                        <img
                            src={imgStaff}
                            alt={t('pages.Features.imgStaffAlt')}
                            className="w-full h-auto block group-hover:scale-105 transition-transform duration-700"
                        />
                    </div>
                    <div className="space-y-6">
                        <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                            {t('pages.Features.secStaffTitle')}
                        </h3>
                        <ul className="space-y-6 text-gray-600">
                            <li className="flex items-start gap-3">
                                <span className="text-green-500 bg-green-50 rounded-full p-1 mt-1 bg-white"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg></span>
                                <span className="leading-relaxed">{t('pages.Features.secStaffBullet1Part1')}<span className="font-bold text-[#149ca8]">{t('pages.Features.secStaffBullet1Highlight1')}</span>{t('pages.Features.secStaffBullet1Part2')}<span className="font-bold text-[#149ca8]">{t('pages.Features.secStaffBullet1Highlight2')}</span>{t('pages.Features.secStaffBullet1Part3')}</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-green-500 bg-green-50 rounded-full p-1 mt-1 bg-white"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg></span>
                                <span className="leading-relaxed">{t('pages.Features.secStaffBullet2Part1')}<span className="font-bold text-[#149ca8]">{t('pages.Features.secStaffBullet2Highlight')}</span>{t('pages.Features.secStaffBullet2Part2')}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Features;