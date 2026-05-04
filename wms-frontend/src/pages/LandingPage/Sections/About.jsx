import React from 'react';

const About = () => {
    return (
        <section className="py-24 bg-[#f4f8fb]">
            <div className="max-w-6xl mx-auto px-6">

                <div className="text-center mb-20 max-w-4xl mx-auto">
                    <h2 className="text-4xl font-black mb-10 text-[#002f5d]">Về WMS PROJECT</h2>
                    <div className="bg-[#1192a8]/5 p-12 rounded-[3rem] border border-[#1192a8]/10">
                        <p className="text-xl text-gray-700 leading-relaxed italic">
                            Hãy để WMS đồng hành kinh doanh cùng bạn
                        </p>
                        <div className="mt-12 flex justify-around border-t border-gray-200 pt-10">
                            <div>
                                <div className="text-3xl font-black text-[#1192a8]">500+</div>
                                <div className="text-gray-500 text-sm">Khách hàng</div>
                            </div>
                            <div>
                                <div className="text-3xl font-black text-[#1192a8]">10+</div>
                                <div className="text-gray-500 text-sm">Năm kinh nghiệm</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* sứ mệnh */}
                <div className="mb-32">
                    <h2 className="text-4xl font-bold text-center text-[#002f5d] mb-16">Sứ mệnh</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
                        <div>
                            <h3 className="text-2xl font-bold text-[#002f5d] mb-4">Mục đích của chúng tôi là</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Cung cấp giải pháp công nghệ nhằm giúp các doanh nghiệp vừa, nhỏ và siêu nhỏ kinh doanh dễ dàng và hiệu quả hơn
                            </p>
                        </div>
                        <div className="flex justify-center">
                            <div className="w-80 h-64 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500">
                                [ẢNH]
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
                        <div className="order-2 md:order-1 flex justify-center">
                            <div className="w-80 h-64 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500">
                                [ẢNH]
                            </div>
                        </div>
                        <div className="order-1 md:order-2">
                            <h3 className="text-2xl font-bold text-[#002f5d] mb-4">Chúng tôi làm cho cuộc sống</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Tốt đẹp hơn thông qua phát triển, cải tiến và phổ biến công nghệ vì lợi ích cộng đồng.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
                        <div>
                            <h3 className="text-2xl font-bold text-[#002f5d] mb-4">Lập trường của chúng tôi là</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Lấy khách hàng làm trung tâm. Chúng tôi cam kết tận tâm tạo ra sản phẩm và dịch vụ chất lượng.
                            </p>
                        </div>
                        <div className="flex justify-center">
                            <div className="w-80 h-64 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500">
                                [ẢNH]
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
                        <div className="order-2 md:order-1 flex justify-center">
                            <div className="w-80 h-64 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500">
                                [ẢNH]
                            </div>
                        </div>
                        <div className="order-1 md:order-2">
                            <h3 className="text-2xl font-bold text-[#002f5d] mb-4">Chúng tôi cam kết xây dựng</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Môi trường làm việc công bằng, hiệu quả và cơ hội phát triển cho tất cả các thành viên.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h3 className="text-2xl font-bold text-[#002f5d] mb-4">Chúng tôi cam kết</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Chia sẻ thành công. Cùng chung trách nhiệm
                            </p>
                        </div>
                        <div className="flex justify-center">
                            <div className="w-80 h-64 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500">
                                [ẢNH]
                            </div>
                        </div>
                    </div>
                </div>

                {/* tầm nhìn */}
                <div className="mb-32 text-center">
                    <h2 className="text-4xl font-bold text-[#002f5d] mb-4">Tầm nhìn</h2>
                    <p className="text-[#00a651] font-semibold text-lg max-w-3xl mx-auto mb-12">
                        WMS PROJECT là nền tảng cung cấp giải pháp công nghệ cho doanh nghiệp phổ biến tại Đông Nam Á
                    </p>
                    <div className="flex justify-center">
                        <div className="w-[500px] h-[400px] bg-gray-200 rounded-xl flex items-center justify-center text-gray-500">
                            [ẢNH]
                        </div>
                    </div>
                </div>

                {/* giá trij cốt lõi */}
                <div>
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-[#002f5d] mb-4">Giá trị cốt lõi</h2>
                        <p className="text-[#00a651] font-semibold text-lg">
                            "Chúng tôi trân trọng"
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
                        <div>
                            <h3 className="text-2xl font-bold text-[#002f5d] mb-4">Khách hàng</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Khách hàng là trung tâm, đặt nhu cầu và kỳ vọng của khách hàng là kim chỉ nam cho mọi hành động.<br/>
                                Số lượng khách hàng sử dụng và sự hài lòng của khách hàng là thước đo thành công của chúng tôi.
                            </p>
                        </div>
                        <div className="flex justify-center">
                            <div className="w-80 h-64 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500">
                                [ẢNH]
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
                        <div className="order-2 md:order-1 flex justify-center">
                            <div className="w-80 h-64 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500">
                                [ẢNH]
                            </div>
                        </div>
                        <div className="order-1 md:order-2">
                            <h3 className="text-2xl font-bold text-[#002f5d] mb-4">Chất lượng</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Tất cả sản phẩm, dịch vụ của chúng tôi tạo ra đều phù hợp nhu cầu khách hàng với chi phí phải chăng và đơn giản.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
                        <div>
                            <h3 className="text-2xl font-bold text-[#002f5d] mb-4">Tinh thần đồng đội</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Chúng ta là một để mang lại lợi ích cho khách hàng.
                            </p>
                        </div>
                        <div className="flex justify-center">
                            <div className="w-80 h-64 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500">
                                [ẢNH]
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
                        <div className="order-2 md:order-1 flex justify-center">
                            <div className="w-80 h-64 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500">
                                [ẢNH]
                            </div>
                        </div>
                        <div className="order-1 md:order-2">
                            <h3 className="text-2xl font-bold text-[#002f5d] mb-4">Integrity</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Chúng tôi trân trọng lời nói của mình.<br/>
                                Lời nói của chúng tôi đi đôi với hành động cụ thể.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h3 className="text-2xl font-bold text-[#002f5d] mb-4">Tinh thần trách nhiệm</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Chúng tôi luôn xem mình là gốc rễ của mọi vấn đề.<br/>
                                Chúng tôi luôn kỷ luật trong công việc của mình.
                            </p>
                        </div>
                        <div className="flex justify-center">
                            <div className="w-80 h-64 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500">
                                [ẢNH]
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default About;