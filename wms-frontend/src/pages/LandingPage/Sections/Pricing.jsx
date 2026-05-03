import React from 'react';

const CheckIcon = () => (
    <svg className="w-4 h-4 text-gray-400 mr-3 shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
    </svg>
);

const BadgeNew = () => (
    <span className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0.5 rounded font-semibold ml-2 inline-block align-middle">
    Mới
  </span>
);

const Pricing = ({ onEnter }) => {
    const plans = [
        {
            id: 'ho-tro',
            name: 'GÓI HỖ TRỢ',
            price: '270.000',
            currency: 'đ',
            subtexts: ['1 chi nhánh/tháng'],
            buttonText: 'Dùng thử miễn phí',
            buttonStyle: 'bg-[#dcfce7] text-[#166534] hover:bg-green-200',
            description: 'Dành cho mô hình kinh doanh nhỏ & vận hành đơn giản.',
            features: [
                { text: '3 tài khoản truy cập' },
                { text: 'Không giới hạn tính năng cơ bản' },
                { text: 'Không phí khởi tạo' },
                { text: 'Hỗ trợ qua tổng đài' },
                { text: 'Quản lý bảo trì, bảo hành' },
                { text: 'Quản lý hàng hóa theo imei' },
                { text: 'Giải pháp thanh toán Napas VietQR/ Visa/ Master' },
                { text: 'Cổng vận chuyển ' },
                { text: 'Bán hàng online trên Shopee, TikTok Shop' },
                { text: 'Miễn phí hóa đơn điện tử ', isNew: true },
                { text: 'Miễn phí chữ ký số', isNew: true },
                { text: 'Miễn phí phần mềm kế toán', isNew: true },
            ],
        },
        {
            id: 'chuyen-nghiep',
            name: 'GÓI CHUYÊN NGHIỆP',
            badge: 'Phổ biến',
            price: '330.000',
            currency: 'đ',
            subtexts: [
                'Quản lý nhiều chi nhánh: 270k/ +1 chi nhánh',
                'Quản lý nhiều kho: 150k/ +1 kho'
            ],
            buttonText: 'Dùng thử miễn phí',
            buttonStyle: 'bg-[#1877f2] text-white hover:bg-blue-700',
            highlight: true,
            description: 'Dành cho mô hình kinh doanh chuyên nghiệp, chuyên môn hóa quy trình.',
            features: [
                { text: 'Không giới hạn tài khoản truy cập' },
                { text: 'Không giới hạn tính năng cơ bản' },
                { text: 'Không phí khởi tạo' },
                { text: 'Hỗ trợ qua tổng đài' },
                { text: 'Quản lý bảo trì, bảo hành' },
                { text: 'Quản lý hàng hóa theo imei' },
                { text: 'Giải pháp thanh toán Napas VietQR/ Visa/ Master' },
                { text: 'Hỗ trợ liên kết các hãng vận chuyển' },
                { text: 'Bán hàng online trên sàn TMĐT, TikTok, Facebook, Instagram, Zalo' },
                { text: 'Chấm công, tính lương 15 NV/ cửa hàng' },
                { text: 'Tạo website bán hàng' },
                { text: 'Phân tích kinh doanh thông minh' },
                { text: 'Miễn phí hóa đơn điện tử ', isNew: true },
                { text: 'Miễn phí chữ ký số', isNew: true },
                { text: 'Miễn phí phần mềm kế toán', isNew: true },
            ],
        },
        {
            id: 'cao-cap',
            name: 'GÓI CAO CẤP',
            price: '490.000',
            currency: 'đ',
            subtexts: [
                'Quản lý nhiều chi nhánh: 375k/ +1 chi nhánh',
                'Quản lý nhiều kho: 150k/ +1 kho'
            ],
            buttonText: 'Dùng thử miễn phí',
            buttonStyle: 'bg-[#ffedd5] text-[#c2410c] hover:bg-orange-200',
            description: 'Dành cho mô hình kinh doanh lớn, phức tạp & cần dịch vụ cao cấp.',
            features: [
                { text: 'Không giới hạn tài khoản truy cập' },
                { text: 'Không giới hạn tính năng cơ bản' },
                { text: 'Không phí khởi tạo' },
                { text: 'Quản lý bảo trì, bảo hành' },
                { text: 'Quản lý hàng hóa theo imei' },
                { text: 'Giải pháp thanh toán Napas VietQR/ Visa/ Master' },
                { text: 'Liên kết các hãng vận chuyển & COD siêu tốc' },
                { text: 'Bán hàng online trên sàn TMĐT, TikTok, Facebook, Instagram, Zalo' },
                { text: 'Chấm công, tính lương 50 NV/ cửa hàng' },
                { text: 'Tạo website bán hàng' },
                { text: 'Phân tích kinh doanh thông minh với AI' },
                { text: 'Hỗ trợ kết nối API' },
                { text: 'Miễn phí hóa đơn điện tử ', isNew: true },
                { text: 'Miễn phí chữ ký số', isNew: true },
                { text: 'Miễn phí phần mềm kế toán', isNew: true },
            ],
        }
    ];

    return (
        <section className="py-16 px-4 bg-gray-50/50 flex justify-center">
            <div className="max-w-7xl w-full">
                {/* Header */}
                <div className="text-center mb-12 hidden">
                    <h2 className="text-4xl font-black mb-4">Bảng giá dịch vụ</h2>
                    <p className="text-gray-500">Phù hợp cho mọi quy mô doanh nghiệp</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`bg-white rounded-2xl p-8 flex flex-col shadow-sm border ${
                                plan.highlight ? 'border-[#1877f2] border-2 shadow-md' : 'border-gray-100'
                            }`}
                        >
                            {/* Header Card */}
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-gray-800 font-bold uppercase text-sm">{plan.name}</h3>
                                {plan.badge && (
                                    <span className="bg-[#1877f2] text-white text-xs font-semibold px-3 py-1 rounded-full">
                    {plan.badge}
                  </span>
                                )}
                            </div>

                            {/* Price */}
                            <div className="mb-4">
                                <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                                <span className="text-xl font-bold text-gray-900 align-top">{plan.currency}</span>
                            </div>

                            {/* Subtext */}
                            <div className="min-h-[48px] mb-6">
                                {plan.subtexts.map((text, idx) => (
                                    <p key={idx} className="text-sm text-gray-600 leading-relaxed">{text}</p>
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
                            <p className="text-sm text-gray-500 mb-6 pb-6 border-b border-gray-100 min-h-[80px]">
                                {plan.description}
                            </p>

                            {/* Features List */}
                            <ul className="space-y-4 flex-1">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start text-sm text-gray-700 leading-relaxed">
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