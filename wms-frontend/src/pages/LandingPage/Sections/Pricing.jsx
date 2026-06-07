import React from 'react';
import { useTranslation } from 'react-i18next';

const CheckIcon = () => (
    <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-3 shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
    </svg>
);

const BadgeNew = () => {
    const { t } = useTranslation();
    return (
        <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] px-1.5 py-0.5 rounded font-semibold ml-2 inline-block align-middle">
            {t('pages.Pricing.badgeNew')}
        </span>
    );
};

const Pricing = ({ onEnter }) => {
    const { t } = useTranslation();
    const plans = [
        {
            id: 'ho-tro',
            name: t('pages.Pricing.planSupportName'),
            price: '270.000',
            currency: 'đ',
            subtexts: [t('pages.Pricing.planSupportSubtext1')],
            buttonText: t('pages.Pricing.btnTryFree'),
            buttonStyle: 'bg-[#dcfce7] text-[#166534] hover:bg-green-200',
            description: t('pages.Pricing.planSupportDesc'),
            features: [
                { text: t('pages.Pricing.featureAccounts3') },
                { text: t('pages.Pricing.featureUnlimitedBasicFeatures') },
                { text: t('pages.Pricing.featureNoSetupFee') },
                { text: t('pages.Pricing.featureHotlineSupport') },
                { text: t('pages.Pricing.featureMaintenanceWarranty') },
                { text: t('pages.Pricing.featureBatchManagement') },
                { text: t('pages.Pricing.featurePaymentSolutions') },
                { text: t('pages.Pricing.featureShippingGateway') },
                { text: t('pages.Pricing.featureShopeeTiktok') },
                { text: t('pages.Pricing.featureFreeEInvoice'), isNew: true },
                { text: t('pages.Pricing.featureFreeDigitalSignature'), isNew: true },
                { text: t('pages.Pricing.featureFreeAccountingSoftware'), isNew: true },
            ],
        },
        {
            id: 'chuyen-nghiep',
            name: t('pages.Pricing.planProfessionalName'),
            badge: t('pages.Pricing.planProfessionalBadge'),
            price: '330.000',
            currency: 'đ',
            subtexts: [
                t('pages.Pricing.planProfessionalSubtext1'),
                t('pages.Pricing.planProfessionalSubtext2')
            ],
            buttonText: t('pages.Pricing.btnTryFree'),
            buttonStyle: 'bg-[#1877f2] text-white hover:bg-blue-700',
            highlight: true,
            description: t('pages.Pricing.planProfessionalDesc'),
            features: [
                { text: t('pages.Pricing.featureUnlimitedAccounts') },
                { text: t('pages.Pricing.featureUnlimitedBasicFeatures') },
                { text: t('pages.Pricing.featureNoSetupFee') },
                { text: t('pages.Pricing.featureHotlineSupport') },
                { text: t('pages.Pricing.featureMaintenanceWarranty') },
                { text: t('pages.Pricing.featureBatchManagement') },
                { text: t('pages.Pricing.featurePaymentSolutions') },
                { text: t('pages.Pricing.featureShippingCarriers') },
                { text: t('pages.Pricing.featureEcommerceSocial') },
                { text: t('pages.Pricing.featureTimekeeping15') },
                { text: t('pages.Pricing.featureCreateWebsite') },
                { text: t('pages.Pricing.featureSmartAnalytics') },
                { text: t('pages.Pricing.featureFreeEInvoice'), isNew: true },
                { text: t('pages.Pricing.featureFreeDigitalSignature'), isNew: true },
                { text: t('pages.Pricing.featureFreeAccountingSoftware'), isNew: true },
            ],
        },
        {
            id: 'cao-cap',
            name: t('pages.Pricing.planPremiumName'),
            price: '490.000',
            currency: 'đ',
            subtexts: [
                t('pages.Pricing.planPremiumSubtext1'),
                t('pages.Pricing.planPremiumSubtext2')
            ],
            buttonText: t('pages.Pricing.btnTryFree'),
            buttonStyle: 'bg-[#ffedd5] text-[#c2410c] hover:bg-orange-200',
            description: t('pages.Pricing.planPremiumDesc'),
            features: [
                { text: t('pages.Pricing.featureUnlimitedAccounts') },
                { text: t('pages.Pricing.featureUnlimitedBasicFeatures') },
                { text: t('pages.Pricing.featureNoSetupFee') },
                { text: t('pages.Pricing.featureMaintenanceWarranty') },
                { text: t('pages.Pricing.featureBatchManagement') },
                { text: t('pages.Pricing.featurePaymentSolutions') },
                { text: t('pages.Pricing.featureShippingCod') },
                { text: t('pages.Pricing.featureEcommerceSocial') },
                { text: t('pages.Pricing.featureTimekeeping50') },
                { text: t('pages.Pricing.featureCreateWebsite') },
                { text: t('pages.Pricing.featureVirtualAssistant') },
                { text: t('pages.Pricing.featureApiSupport') },
                { text: t('pages.Pricing.featureFreeEInvoice'), isNew: true },
                { text: t('pages.Pricing.featureFreeDigitalSignature'), isNew: true },
                { text: t('pages.Pricing.featureFreeAccountingSoftware'), isNew: true },
            ],
        }
    ];

    return (
        <section className="py-16 px-4 bg-gray-50/50 dark:bg-gray-900 flex justify-center transition-colors duration-300">
            <div className="max-w-7xl w-full">
                {/* Header */}
                <div className="text-center mb-12 hidden">
                    <h2 className="text-4xl font-black mb-4">{t('pages.Pricing.title')}</h2>
                    <p className="text-gray-500">{t('pages.Pricing.subtitle')}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`bg-white dark:bg-gray-800 rounded-2xl p-8 flex flex-col shadow-sm border transition-colors duration-300 ${
                                plan.highlight
                                    ? 'border-[#1877f2] border-2 shadow-md'
                                    : 'border-gray-100 dark:border-gray-700'
                            }`}
                        >
                            {/* Header Card */}
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-gray-800 dark:text-gray-100 font-bold uppercase text-sm">{plan.name}</h3>
                                {plan.badge && (
                                    <span className="bg-[#1877f2] text-white text-xs font-semibold px-3 py-1 rounded-full">
                                        {plan.badge}
                                    </span>
                                )}
                            </div>

                            {/* Price */}
                            <div className="mb-4">
                                <span className="text-4xl font-extrabold text-gray-900 dark:text-white">{plan.price}</span>
                                <span className="text-xl font-bold text-gray-900 dark:text-white align-top">{plan.currency}</span>
                            </div>

                            {/* Subtext */}
                            <div className="min-h-[48px] mb-6">
                                {plan.subtexts.map((text, idx) => (
                                    <p key={idx} className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{text}</p>
                                ))}
                            </div>

                            {/* Action Button */}
                            <button
                                onClick={onEnter}
                                className={`w-full py-3 rounded-full font-semibold transition-colors mb-8 ${plan.buttonStyle}`}
                            >
                                {plan.buttonText}
                            </button>

                            {/* Description */}
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 pb-6 border-b border-gray-100 dark:border-gray-700 min-h-[80px]">
                                {plan.description}
                            </p>

                            {/* Features List */}
                            <ul className="space-y-4 flex-1">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                        <CheckIcon />
                                        <span>
                                            {feature.text}
                                            {feature.isNew && <BadgeNew />}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Pricing;