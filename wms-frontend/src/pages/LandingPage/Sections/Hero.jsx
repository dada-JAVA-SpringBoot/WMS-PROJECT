import React from 'react';
import { useTranslation } from 'react-i18next';

import imgHelp from '../../../components/common/icons/a1.png';
import imgQL from '../../../components/common/icons/a13.png';
import cup1 from '../../../components/common/icons/cup.jpg';
import cup2 from '../../../components/common/icons/cup2.jpg';
import cup3 from '../../../components/common/icons/cup3.jpg';
import cup4 from '../../../components/common/icons/cup4.jpg';
import cup5 from '../../../components/common/icons/cup5.jpg';
import imgLogo from '../../../components/common/icons/a12.png';
import imgHero from '../../../components/common/icons/a5.png';
import imgProduct from "../../../components/common/icons/a11.png";

import duoc1 from '../../../components/common/icons/duoc1.jpg';
import duoc2 from '../../../components/common/icons/duoc2.jpg';
import duoc3 from '../../../components/common/icons/duoc3.jpg';
import duoc4 from '../../../components/common/icons/duoc4.png';

import tp1 from '../../../components/common/icons/thucpham1.png';
import tp2 from '../../../components/common/icons/thucpham2.png';
import tp3 from '../../../components/common/icons/thucpham3.jpg';
import tp4 from '../../../components/common/icons/thucpham4.jpg';

import cn1 from '../../../components/common/icons/congnghe1.jpg';
import cn2 from '../../../components/common/icons/congnghe2.jpg';
import cn3 from '../../../components/common/icons/congnghe3.png';
import cn4 from '../../../components/common/icons/congnghe4..png';

import qa1 from '../../../components/common/icons/quanao1.png';
import qa2 from '../../../components/common/icons/quanao2.jpg';
import qa3 from '../../../components/common/icons/quanao3.png';
import qa4 from '../../../components/common/icons/quanao4.jpg';

import td1 from '../../../components/common/icons/tieudung1.png';
import td2 from '../../../components/common/icons/tieudung2.jpg';
import td3 from '../../../components/common/icons/tieudung3.png';
import td4 from '../../../components/common/icons/tieudung4.png';

import xd1 from '../../../components/common/icons/xaydung1.png';
import xd2 from '../../../components/common/icons/xaydung2.png';
import xd3 from '../../../components/common/icons/xaydung3.jpg';
import xd4 from '../../../components/common/icons/xaydung4.jpg';

import oto1 from '../../../components/common/icons/oto1.jpg';
import oto2 from '../../../components/common/icons/oto2.jpg';
import oto3 from '../../../components/common/icons/oto3.png';
import oto4 from '../../../components/common/icons/oto4.jpg';

import mp1 from '../../../components/common/icons/mypham1.jpg';
import mp2 from '../../../components/common/icons/mypham2.jpg';
import mp3 from '../../../components/common/icons/mypham3.png';
import mp4 from '../../../components/common/icons/mypham4.png';

const Hero = ({ onEnter }) => {
    const { t } = useTranslation();
    return (
        <div className="animate-fade-in">

            {/* Hero Banner */}
            <section className="bg-[#149ca8] dark:bg-[#0d6e78] text-white pt-20 pb-28 relative overflow-hidden transition-colors duration-300">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-cyan-400/20 rounded-full translate-x-1/3 -translate-y-1/4 blur-3xl"></div>
                <div className="max-w-[1200px] mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-1.5 rounded-full text-sm font-medium">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                            {t('pages.Hero.version')}
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-black leading-tight">
                            {t('pages.Hero.titlePart1')} <br/>
                            {t('pages.Hero.titlePart2')}
                        </h1>
                        <ul className="space-y-4 text-lg text-blue-100">
                            <li className="flex items-start gap-3"><span className="text-green-400 mt-1">✔</span> {t('pages.Hero.bullet1')}</li>
                            <li className="flex items-start gap-3"><span className="text-green-400 mt-1">✔</span> {t('pages.Hero.bullet2')}</li>
                        </ul>
                        <div className="flex gap-4 pt-4">
                            <button onClick={onEnter} className="bg-white text-[#149ca8] px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-50 transition shadow-[0_0_40px_rgba(255,255,255,0.3)] active:scale-95">
                                {t('pages.Hero.adminAccess')}
                            </button>
                        </div>
                    </div>
                    <div className="relative h-[400px] lg:h-[450px] w-full rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden border-4 border-white/30 group">
                        <img
                            src={imgQL}
                            alt={t('pages.Hero.imgWarehouseAlt')}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 transition-colors duration-300">
                <div className="max-w-[1200px] mx-auto px-6 py-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-gray-100 dark:divide-gray-700">
                        <div><h4 className="text-4xl font-black text-[#149ca8] mb-2">500+</h4><p className="text-gray-500 font-medium">{t('pages.Hero.statsCompanies')}</p></div>
                        <div><h4 className="text-4xl font-black text-[#149ca8] mb-2">99%</h4><p className="text-gray-500 font-medium">{t('pages.Hero.statsAccuracy')}</p></div>
                        <div><h4 className="text-4xl font-black text-[#149ca8] mb-2">30%</h4><p className="text-gray-500 font-medium">{t('pages.Hero.statsSavings')}</p></div>
                        <div><h4 className="text-4xl font-black text-[#149ca8] mb-2">24/7</h4><p className="text-gray-500 font-medium">{t('pages.Hero.statsSupport')}</p></div>
                    </div>
                </div>
            </section>

            {/* Dashboard Preview */}
            <section className="py-24 bg-gradient-to-b from-blue-50/50 to-white dark:from-gray-800 dark:to-gray-900 relative overflow-hidden transition-colors duration-300">
                <div className="max-w-[1200px] mx-auto px-6 text-center">
                    <h2 className="text-[#149ca8] font-bold tracking-widest text-sm mb-4 uppercase">{t('pages.Hero.tag')}</h2>
                    <h3 className="text-3xl lg:text-4xl font-black mb-10 text-gray-900 dark:text-white">{t('pages.Hero.experienceTitle')}</h3>

                    <div className="w-full max-w-[1000px] mx-auto h-[500px] bg-white dark:bg-gray-700 rounded-t-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-200 dark:border-gray-600 border-b-0 flex flex-col relative overflow-hidden transition-colors duration-300">
                        <div className="h-10 bg-gray-100 dark:bg-gray-600 border-b border-gray-200 dark:border-gray-500 flex items-center px-4 gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                            <div className="ml-4 bg-white dark:bg-gray-500 px-4 py-1 rounded text-xs text-gray-400 dark:text-gray-200 font-medium shadow-sm">autohomewms.vn/dashboard</div>
                        </div>
                        <div className="w-full bg-white dark:bg-gray-700 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden border-4 border-white/50">
                            <img
                                src={imgHero}
                                alt={t('pages.Hero.imgHomeAlt')}

                                className="w-full h-auto block group-hover:scale-105 transition-transform duration-700"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Process */}
            <section className="py-24 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700 transition-colors duration-300">
                <div className="max-w-[1200px] mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-4">{t('pages.Hero.processTitle')}</h2>
                        <p className="text-gray-500 dark:text-gray-400">{t('pages.Hero.processSubtitle')}</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-[#eef5ff] dark:bg-blue-900/30 p-8 rounded-3xl relative overflow-hidden group hover:-translate-y-2 transition-transform">
                            <div className="w-12 h-12 bg-[#149ca8] text-white rounded-xl flex items-center justify-center text-xl font-bold mb-6">1</div>
                            <h4 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">{t('pages.Hero.processStepInboundTitle')}</h4>
                            <p className="text-gray-600 dark:text-gray-300 mb-6">{t('pages.Hero.processStepInboundDesc')}</p>
                        </div>
                        <div className="bg-[#f5f3ff] dark:bg-purple-900/30 p-8 rounded-3xl relative overflow-hidden group hover:-translate-y-2 transition-transform">
                            <div className="w-12 h-12 bg-purple-600 text-white rounded-xl flex items-center justify-center text-xl font-bold mb-6">2</div>
                            <h4 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">{t('pages.Hero.processStepInventoryTitle')}</h4>
                            <p className="text-gray-600 dark:text-gray-300 mb-6">{t('pages.Hero.processStepInventoryDesc')}</p>
                        </div>
                        <div className="bg-[#ebfaef] dark:bg-green-900/30 p-8 rounded-3xl relative overflow-hidden group hover:-translate-y-2 transition-transform">
                            <div className="w-12 h-12 bg-green-600 text-white rounded-xl flex items-center justify-center text-xl font-bold mb-6">3</div>
                            <h4 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">{t('pages.Hero.processStepOutboundTitle')}</h4>
                            <p className="text-gray-600 dark:text-gray-300 mb-6">{t('pages.Hero.processStepOutboundDesc')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pain Points */}
            <section className="py-24 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
                <div className="max-w-[1200px] mx-auto px-6">
                    <h2 className="text-3xl lg:text-4xl font-black text-center mb-16 text-gray-900 dark:text-white">{t('pages.Hero.painPointsTitle')}</h2>
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="relative h-[450px] rounded-[3rem] border-4 border-white dark:border-gray-600 shadow-xl overflow-hidden bg-red-50 dark:bg-gray-700">
                            <img
                                src={imgHelp}
                                alt={t('pages.Hero.painPointsImgAlt')}
                                className="w-full h-full object-contain p-4 hover:scale-105 transition-transform duration-500"
                            />
                        </div>
                        <div className="space-y-8">
                            <div className="flex gap-5 bg-white dark:bg-gray-700 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-600 hover:border-red-200 dark:hover:border-red-400 transition-colors">
                                <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 flex items-center justify-center text-sm font-bold shrink-0">✕</div>
                                <div><h4 className="font-bold text-lg mb-1 text-gray-900 dark:text-white">{t('pages.Hero.painPointsDiscrepancyTitle')}</h4><p className="text-gray-500 dark:text-gray-400">{t('pages.Hero.painPointsDiscrepancyDesc')}</p></div>
                            </div>
                            <div className="flex gap-5 bg-white dark:bg-gray-700 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-600 hover:border-red-200 dark:hover:border-red-400 transition-colors">
                                <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 flex items-center justify-center text-sm font-bold shrink-0">✕</div>
                                <div><h4 className="font-bold text-lg mb-1 text-gray-900 dark:text-white">{t('pages.Hero.painPointsSearchTimeTitle')}</h4><p className="text-gray-500 dark:text-gray-400">{t('pages.Hero.painPointsSearchTimeDesc')}</p></div>
                            </div>
                            <div className="flex gap-5 bg-white dark:bg-gray-700 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-600 hover:border-red-200 dark:hover:border-red-400 transition-colors">
                                <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 flex items-center justify-center text-sm font-bold shrink-0">✕</div>
                                <div><h4 className="font-bold text-lg mb-1 text-gray-900 dark:text-white">{t('pages.Hero.painPointsDelayedReportsTitle')}</h4><p className="text-gray-500 dark:text-gray-400">{t('pages.Hero.painPointsDelayedReportsDesc')}</p></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tools */}
            <section className="bg-[#149ca8] dark:bg-[#0d6e78] text-white py-24 relative overflow-hidden transition-colors duration-300">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-400/20 to-transparent"></div>
                <div className="max-w-[1200px] mx-auto px-6 relative z-10">
                    <h2 className="text-3xl lg:text-4xl font-black text-center mb-16">{t('pages.Hero.toolsTitle')}</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 p-8 rounded-3xl shadow-xl hover:-translate-y-2 transition-transform duration-300">
                            <div className="w-14 h-14 bg-[#149ca8] rounded-2xl flex items-center justify-center text-white text-2xl mb-6 shadow-md">
                                🤖
                            </div>
                            <h3 className="font-bold text-xl mb-4 text-gray-900 dark:text-white">{t('pages.Hero.toolsVirtualAssistantTitle')}</h3>
                            <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm">
                                {t('pages.Hero.toolsVirtualAssistantDesc')}
                            </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 p-8 rounded-3xl shadow-xl hover:-translate-y-2 transition-transform duration-300">
                            <div className="w-14 h-14 bg-[#149ca8] rounded-2xl flex items-center justify-center text-white text-2xl mb-6 shadow-md">
                                📸
                            </div>
                            <h3 className="font-bold text-xl mb-4 text-gray-900 dark:text-white">{t('pages.Hero.toolsBarcodeScannerTitle')}</h3>
                            <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm">
                                {t('pages.Hero.toolsBarcodeScannerDesc')}
                            </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 p-8 rounded-3xl shadow-xl hover:-translate-y-2 transition-transform duration-300">
                            <div className="w-14 h-14 bg-[#149ca8] rounded-2xl flex items-center justify-center text-white text-2xl mb-6 shadow-md">
                                📊
                            </div>
                            <h3 className="font-bold text-xl mb-4 text-gray-900 dark:text-white">{t('pages.Hero.toolsStatisticsTitle')}</h3>
                            <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm">
                                {t('pages.Hero.toolsStatisticsDesc')}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Awards */}
            <section className="py-24 bg-[#fafbfc] dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700 transition-colors duration-300">
                <div className="max-w-[1200px] mx-auto px-6">
                    <h2 className="text-3xl lg:text-4xl font-black text-center mb-16 text-gray-900 dark:text-white">{t('pages.Hero.awardsTitle')}</h2>
                    <div className="flex overflow-x-auto lg:grid lg:grid-cols-5 gap-6 pb-8 lg:pb-0 snap-x snap-mandatory">
                        {[
                            { name: t('pages.Hero.awardGoldCup'), icon: cup1 },
                            { name: t('pages.Hero.awardSaoKhue'), icon: cup2 },
                            { name: t('pages.Hero.awardMostPopular'), icon: cup3 },
                            { name: t('pages.Hero.awardMakeInVietnam'), icon: cup4 },
                            { name: t('pages.Hero.awardDigitalTransformation'), icon: cup5 }
                        ].map((award, index) => (
                            <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center min-w-[200px] snap-center hover:shadow-lg transition-shadow">
                                <div className="h-32 w-24 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4 overflow-hidden border border-gray-100 dark:border-gray-600 group">
                                    <img src={award.icon} alt={award.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" />
                                </div>
                                <p className="font-bold text-gray-800 dark:text-gray-200 text-sm">{award.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Industries */}
            <section className="py-24 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700 transition-colors duration-300">
                <div className="max-w-[1200px] mx-auto px-6">
                    <h2 className="text-3xl lg:text-4xl font-black text-center mb-16 text-gray-900 dark:text-white">
                        {t('pages.Hero.businessesTitle')}
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { id: "Pharma", name: t('pages.Hero.industryPharma') },
                            { id: "FnB", name: t('pages.Hero.industryFnB') },
                            { id: "Tech", name: t('pages.Hero.industryTech') },
                            { id: "Fashion", name: t('pages.Hero.industryFashion') },
                            { id: "Consumer", name: t('pages.Hero.industryConsumer') },
                            { id: "Construction", name: t('pages.Hero.industryConstruction') },
                            { id: "Automotive", name: t('pages.Hero.industryAutomotive') },
                            { id: "Beauty", name: t('pages.Hero.industryBeauty') }
                        ].map((item, index) => {
                            const isPharma = item.id === "Pharma";
                            const isFood = item.id === "FnB";
                            const isTech = item.id === "Tech";
                            const isFashion = item.id === "Fashion";
                            const isConsumer = item.id === "Consumer";
                            const isConstruction = item.id === "Construction";
                            const isOto = item.id === "Automotive";
                            const isMyPham = item.id === "Beauty";

                            const getIcon = (pos) => {
                                if (isPharma) return [duoc1, duoc2, duoc3, duoc4][pos];
                                if (isFood) return [tp1, tp2, tp3, tp4][pos];
                                if (isTech) return [cn1, cn2, cn3, cn4][pos];
                                if (isFashion) return [qa1, qa2, qa3, qa4][pos];
                                if (isConsumer) return [td1, td2, td3, td4][pos];
                                if (isConstruction) return [xd1, xd2, xd3, xd4][pos];
                                if (isOto) return [oto1, oto2, oto3, oto4][pos];
                                if (isMyPham) return [mp1, mp2, mp3, mp4][pos];
                                return imgLogo;
                            };


                            return (
                                <div key={index} className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm bg-white dark:bg-gray-800 hover:shadow-md transition-shadow">
                                    <div className="bg-[#d2dcf0] dark:bg-gray-700 text-center py-2.5 font-bold text-gray-800 dark:text-gray-200 text-sm">{item.name}</div>
                                    <div className="p-4 grid grid-cols-2 gap-4">
                                        {[0, 1, 2, 3].map((pos) => (
                                            <div key={pos} className="aspect-square group bg-gray-50 dark:bg-gray-700 rounded flex justify-center items-center overflow-hidden">
                                                <img src={getIcon(pos)} alt={`Logo ${pos + 1}`} className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-700" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

        </div>
    );
};

export default Hero;