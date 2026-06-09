import React from 'react';
import { useTranslation } from 'react-i18next';
import img5sao from '../../../components/common/icons/a14.png';
import img15 from "../../../components/common/icons/a15.png";
import img16 from "../../../components/common/icons/a16.png";
import img17 from "../../../components/common/icons/a17.png";
import img18 from "../../../components/common/icons/a18.png";
import img19 from "../../../components/common/icons/a19.png";
import img20 from "../../../components/common/icons/a20.png";
import img21 from "../../../components/common/icons/a21.png";
import img22 from "../../../components/common/icons/a22.png";
import img23 from "../../../components/common/icons/a23.png";
import img24 from "../../../components/common/icons/a24.png";

const About = () => {
    const { t } = useTranslation();
    return (
        <section className="py-24 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <div className="max-w-6xl mx-auto px-6">

                {/* Header */}
                <div className="text-center mb-20 max-w-4xl mx-auto">
                    <h2 className="text-4xl font-black mb-10 text-[#002f5d] dark:text-white">{t('pages.About.title')}</h2>
                    <div className="bg-[#1192a8]/5 dark:bg-[#1192a8]/10 p-12 rounded-[3rem] border border-[#1192a8]/10 dark:border-[#1192a8]/20">
                        <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed italic">
                            {t('pages.About.subtitle')}
                        </p>
                        <div className="mt-12 flex justify-around border-t border-gray-200 dark:border-gray-700 pt-10">
                            <div>
                                <div className="text-3xl font-black text-[#1192a8]">500+</div>
                                <div className="text-gray-500 dark:text-gray-400 text-sm">{t('pages.About.statsCustomers')}</div>
                            </div>
                            <div>
                                <div className="text-3xl font-black text-[#1192a8]">10+</div>
                                <div className="text-gray-500 dark:text-gray-400 text-sm">{t('pages.About.statsExperience')}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sứ mệnh */}
                <div className="mb-32">
                    <h2 className="text-4xl font-bold text-center text-[#002f5d] dark:text-white mb-16">{t('pages.About.missionTitle')}</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
                        <div>
                            <h3 className="text-2xl font-bold text-[#002f5d] dark:text-white mb-4">{t('pages.About.missionPurposeTitle')}</h3>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                {t('pages.About.missionPurposeDescription')}
                            </p>
                        </div>
                        <div className="flex justify-center">
                            <div className="w-80 h-64 bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden flex items-center justify-center text-gray-500">
                                <img
                                    src={img15}
                                    alt={t('pages.About.altText')}
                                    className="w-full h-auto block hover:scale-105 transition-transform duration-700"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
                        <div className="order-2 md:order-1 flex justify-center">
                            <div className="w-80 h-64 bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden flex items-center justify-center text-gray-500">
                                <img
                                    src={img22}
                                    alt={t('pages.About.altText')}
                                    className="w-full h-auto block hover:scale-105 transition-transform duration-700"
                                />
                            </div>
                        </div>
                        <div className="order-1 md:order-2">
                            <h3 className="text-2xl font-bold text-[#002f5d] dark:text-white mb-4">{t('pages.About.missionLifeTitle')}</h3>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                {t('pages.About.missionLifeDescription')}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
                        <div>
                            <h3 className="text-2xl font-bold text-[#002f5d] dark:text-white mb-4">{t('pages.About.missionStanceTitle')}</h3>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                {t('pages.About.missionStanceDescription')}
                            </p>
                        </div>
                        <div className="flex justify-center">
                            <div className="w-80 h-64 bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden flex items-center justify-center text-gray-500">
                                <img
                                    src={img5sao}
                                    alt={t('pages.About.altText')}
                                    className="w-full h-auto block hover:scale-105 transition-transform duration-700"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
                        <div className="order-2 md:order-1 flex justify-center">
                            <div className="w-80 h-64 bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden flex items-center justify-center text-gray-500">
                                <img
                                    src={img24}
                                    alt={t('pages.About.altText')}
                                    className="w-full h-auto block hover:scale-105 transition-transform duration-700"
                                />
                            </div>
                        </div>
                        <div className="order-1 md:order-2">
                            <h3 className="text-2xl font-bold text-[#002f5d] dark:text-white mb-4">{t('pages.About.missionWorkplaceTitle')}</h3>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                {t('pages.About.missionWorkplaceDescription')}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h3 className="text-2xl font-bold text-[#002f5d] dark:text-white mb-4">{t('pages.About.missionCommitmentTitle')}</h3>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                {t('pages.About.missionCommitmentDescription')}
                            </p>
                        </div>
                        <div className="flex justify-center">
                            <div className="w-80 h-64 bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden flex items-center justify-center text-gray-500">
                                <img
                                    src={img23}
                                    alt={t('pages.About.altText')}
                                    className="w-full h-auto block hover:scale-105 transition-transform duration-700"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tầm nhìn */}
                <div className="mb-32 text-center">
                    <h2 className="text-4xl font-bold text-[#002f5d] dark:text-white mb-4">{t('pages.About.visionTitle')}</h2>
                    <p className="text-[#00a651] font-semibold text-lg max-w-3xl mx-auto mb-12">
                        {t('pages.About.visionDescription')}
                    </p>
                    <div className="flex justify-center">
                        <div className="w-[500px] bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden flex items-center justify-center">
                            <img
                                src={img17}
                                alt={t('pages.About.altText')}
                                className="w-full h-auto block hover:scale-105 transition-transform duration-700"
                            />
                        </div>
                    </div>
                </div>

                {/* Giá trị cốt lõi */}
                <div>
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-[#002f5d] dark:text-white mb-4">{t('pages.About.coreValuesTitle')}</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
                        <div>
                            <h3 className="text-2xl font-bold text-[#002f5d] dark:text-white mb-4">{t('pages.About.coreValuesCustomerTitle')}</h3>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                {t('pages.About.coreValuesCustomerDesc1')}<br/>
                                {t('pages.About.coreValuesCustomerDesc2')}
                            </p>
                        </div>
                        <div className="flex justify-center">
                            <div className="w-80 h-64 bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden flex items-center justify-center">
                                <img
                                    src={img20}
                                    alt={t('pages.About.altText')}
                                    className="w-full h-auto block hover:scale-105 transition-transform duration-700"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
                        <div className="order-2 md:order-1 flex justify-center">
                            <div className="w-80 h-64 bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden flex items-center justify-center">
                                <img
                                    src={img21}
                                    alt={t('pages.About.altText')}
                                    className="w-full h-auto block hover:scale-105 transition-transform duration-700"
                                />
                            </div>
                        </div>
                        <div className="order-1 md:order-2">
                            <h3 className="text-2xl font-bold text-[#002f5d] dark:text-white mb-4">{t('pages.About.coreValuesQualityTitle')}</h3>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                {t('pages.About.coreValuesQualityDescription')}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
                        <div>
                            <h3 className="text-2xl font-bold text-[#002f5d] dark:text-white mb-4">{t('pages.About.coreValuesTeamworkTitle')}</h3>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                {t('pages.About.coreValuesTeamworkDescription')}
                            </p>
                        </div>
                        <div className="flex justify-center">
                            <div className="w-80 h-64 bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden flex items-center justify-center">
                                <img
                                    src={img18}
                                    alt={t('pages.About.altText')}
                                    className="w-full h-auto block hover:scale-105 transition-transform duration-700"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
                        <div className="order-2 md:order-1 flex justify-center">
                            <div className="w-80 h-64 bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden flex items-center justify-center">
                                <img
                                    src={img19}
                                    alt={t('pages.About.altText')}
                                    className="w-full h-auto block hover:scale-105 transition-transform duration-700"
                                />
                            </div>
                        </div>
                        <div className="order-1 md:order-2">
                            <h3 className="text-2xl font-bold text-[#002f5d] dark:text-white mb-4">{t('pages.About.coreValuesIntegrityTitle')}</h3>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                {t('pages.About.coreValuesIntegrityDesc1')}<br/>
                                {t('pages.About.coreValuesIntegrityDesc2')}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h3 className="text-2xl font-bold text-[#002f5d] dark:text-white mb-4">{t('pages.About.coreValuesResponsibilityTitle')}</h3>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                {t('pages.About.coreValuesResponsibilityDesc1')}<br/>
                                {t('pages.About.coreValuesResponsibilityDesc2')}
                            </p>
                        </div>
                        <div className="flex justify-center">
                            <div className="w-80 h-64 bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden flex items-center justify-center text-gray-500">
                                <img
                                    src={img16}
                                    alt={t('pages.About.altText')}
                                    className="w-full h-auto block hover:scale-105 transition-transform duration-700"
                                />
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default About;