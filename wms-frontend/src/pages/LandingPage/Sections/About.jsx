import React from 'react';
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
    return (
        <section className="py-24 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <div className="max-w-6xl mx-auto px-6">

                {/* Header */}
                <div className="text-center mb-20 max-w-4xl mx-auto">
                    <h2 className="text-4xl font-black mb-10 text-[#002f5d] dark:text-white">Về WMS PROJECT</h2>
                    <div className="bg-[#1192a8]/5 dark:bg-[#1192a8]/10 p-12 rounded-[3rem] border border-[#1192a8]/10 dark:border-[#1192a8]/20">
                        <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed italic">
                            Hãy để WMS đồng hành kinh doanh cùng bạn
                        </p>
                        <div className="mt-12 flex justify-around border-t border-gray-200 dark:border-gray-700 pt-10">
                            <div>
                                <div className="text-3xl font-black text-[#1192a8]">500+</div>
                                <div className="text-gray-500 dark:text-gray-400 text-sm">Khách hàng</div>
                            </div>
                            <div>
                                <div className="text-3xl font-black text-[#1192a8]">10+</div>
                                <div className="text-gray-500 dark:text-gray-400 text-sm">Năm kinh nghiệm</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sứ mệnh */}
                <div className="mb-32">
                    <h2 className="text-4xl font-bold text-center text-[#002f5d] dark:text-white mb-16">Sứ mệnh</h2>

                    {[
                        {
                            title: 'Mục đích của chúng tôi là',
                            text: 'Cung cấp giải pháp công nghệ nhằm giúp các doanh nghiệp vừa, nhỏ và siêu nhỏ kinh doanh dễ dàng và hiệu quả hơn',
                            img: img15,
                            alt: 'Mục đích WMS',
                            imgRight: true,
                        },
                        {
                            title: 'Chúng tôi làm cho cuộc sống',
                            text: 'Tốt đẹp hơn thông qua phát triển, cải tiến và phổ biến công nghệ vì lợi ích cộng đồng.',
                            img: img22,
                            alt: 'Cuộc sống tốt đẹp hơn',
                            imgRight: false,
                        },
                        {
                            title: 'Lập trường của chúng tôi là',
                            text: 'Lấy khách hàng làm trung tâm. Chúng tôi cam kết tận tâm tạo ra sản phẩm và dịch vụ chất lượng.',
                            img: img5sao,
                            alt: 'Lập trường WMS',
                            imgRight: true,
                        },
                        {
                            title: 'Chúng tôi cam kết xây dựng',
                            text: 'Môi trường làm việc công bằng, hiệu quả và cơ hội phát triển cho tất cả các thành viên.',
                            img: img24,
                            alt: 'Môi trường làm việc',
                            imgRight: false,
                        },
                        {
                            title: 'Chúng tôi cam kết',
                            text: 'Chia sẻ thành công. Cùng chung trách nhiệm',
                            img: img23,
                            alt: 'Chia sẻ thành công',
                            imgRight: true,
                        },
                    ].map((item, idx) => (
                        <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
                            <div className={item.imgRight ? '' : 'order-2 md:order-1'}>
                                {item.imgRight ? (
                                    <>
                                        <h3 className="text-2xl font-bold text-[#002f5d] dark:text-white mb-4">{item.title}</h3>
                                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{item.text}</p>
                                    </>
                                ) : (
                                    <div className="flex justify-center">
                                        <div className="w-80 h-64 bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden flex items-center justify-center">
                                            <img src={item.img} alt={item.alt} className="w-full h-auto block hover:scale-105 transition-transform duration-700" />
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className={item.imgRight ? '' : 'order-1 md:order-2'}>
                                {item.imgRight ? (
                                    <div className="flex justify-center">
                                        <div className="w-80 h-64 bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden flex items-center justify-center">
                                            <img src={item.img} alt={item.alt} className="w-full h-auto block hover:scale-105 transition-transform duration-700" />
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <h3 className="text-2xl font-bold text-[#002f5d] dark:text-white mb-4">{item.title}</h3>
                                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{item.text}</p>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tầm nhìn */}
                <div className="mb-32 text-center">
                    <h2 className="text-4xl font-bold text-[#002f5d] dark:text-white mb-4">Tầm nhìn</h2>
                    <p className="text-[#00a651] font-semibold text-lg max-w-3xl mx-auto mb-12">
                        WMS PROJECT là nền tảng cung cấp giải pháp công nghệ cho doanh nghiệp phổ biến tại Đông Nam Á
                    </p>
                    <div className="flex justify-center">
                        <div className="w-[500px] bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden flex items-center justify-center">
                            <img src={img17} alt="Tầm nhìn WMS" className="w-full h-auto block hover:scale-105 transition-transform duration-700" />
                        </div>
                    </div>
                </div>

                {/* Giá trị cốt lõi */}
                <div>
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-[#002f5d] dark:text-white mb-4">Giá trị cốt lõi</h2>
                        <p className="text-[#00a651] font-semibold text-lg">
                            "Chúng tôi trân trọng"
                        </p>
                    </div>

                    {[
                        {
                            title: 'Khách hàng',
                            text: 'Khách hàng là trung tâm, đặt nhu cầu và kỳ vọng của khách hàng là kim chỉ nam cho mọi hành động.\nSố lượng khách hàng sử dụng và sự hài lòng của khách hàng là thước đo thành công của chúng tôi.',
                            img: img20,
                            alt: 'Khách hàng',
                            imgRight: true,
                        },
                        {
                            title: 'Chất lượng',
                            text: 'Tất cả sản phẩm, dịch vụ của chúng tôi tạo ra đều phù hợp nhu cầu khách hàng với chi phí phải chăng và đơn giản.',
                            img: img21,
                            alt: 'Chất lượng',
                            imgRight: false,
                        },
                        {
                            title: 'Tinh thần đồng đội',
                            text: 'Chúng ta là một để mang lại lợi ích cho khách hàng.',
                            img: img18,
                            alt: 'Tinh thần đồng đội',
                            imgRight: true,
                        },
                        {
                            title: 'Integrity',
                            text: 'Chúng tôi trân trọng lời nói của mình.\nLời nói của chúng tôi đi đôi với hành động cụ thể.',
                            img: img19,
                            alt: 'Integrity',
                            imgRight: false,
                        },
                        {
                            title: 'Tinh thần trách nhiệm',
                            text: 'Chúng tôi luôn xem mình là gốc rễ của mọi vấn đề.\nChúng tôi luôn kỷ luật trong công việc của mình.',
                            img: img16,
                            alt: 'Tinh thần trách nhiệm',
                            imgRight: true,
                        },
                    ].map((item, idx) => (
                        <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
                            <div className={item.imgRight ? '' : 'order-2 md:order-1'}>
                                {item.imgRight ? (
                                    <>
                                        <h3 className="text-2xl font-bold text-[#002f5d] dark:text-white mb-4">{item.title}</h3>
                                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">{item.text}</p>
                                    </>
                                ) : (
                                    <div className="flex justify-center">
                                        <div className="w-80 h-64 bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden flex items-center justify-center">
                                            <img src={item.img} alt={item.alt} className="w-full h-auto block hover:scale-105 transition-transform duration-700" />
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className={item.imgRight ? '' : 'order-1 md:order-2'}>
                                {item.imgRight ? (
                                    <div className="flex justify-center">
                                        <div className="w-80 h-64 bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden flex items-center justify-center">
                                            <img src={item.img} alt={item.alt} className="w-full h-auto block hover:scale-105 transition-transform duration-700" />
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <h3 className="text-2xl font-bold text-[#002f5d] dark:text-white mb-4">{item.title}</h3>
                                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">{item.text}</p>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default About;