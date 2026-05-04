import React from 'react';

import imgHelp from '../../../components/common/icons/a1.png';
import imgQL from '../../../components/common/icons/a2.png';
import imgCup from '../../../components/common/icons/cup.png';
const Hero = ({ onEnter }) => {
    return (
        <div className="animate-fade-in">

            <section className="bg-[#149ca8] text-white pt-20 pb-28 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-cyan-400/20 rounded-full translate-x-1/3 -translate-y-1/4 blur-3xl"></div>
                <div className="max-w-[1200px] mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-1.5 rounded-full text-sm font-medium">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                            Phiên bản mới nhất 2026
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black leading-tight">
                            Giải pháp quản lý Kho hàng <br/>
                            thông minh, linh hoạt
                        </h1>
                        <ul className="space-y-4 text-lg text-blue-100">
                            <li className="flex items-start gap-3"><span className="text-green-400 mt-1">✔</span> Kiểm soát tồn kho chặt chẽ, chống thất thoát 100%.</li>
                            <li className="flex items-start gap-3"><span className="text-green-400 mt-1">✔</span> Tự động hóa quy trình nhập - xuất - kiểm kê.</li>
                        </ul>
                        <div className="flex gap-4 pt-4">
                            <button onClick={onEnter} className="bg-white text-[#149ca8] px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-50 transition shadow-[0_0_40px_rgba(255,255,255,0.3)] active:scale-95">
                                Vào hệ thống quản trị
                            </button>
                        </div>
                    </div>
                    <div className="relative h-[400px] lg:h-[450px] w-full rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden border-4 border-white/30 group">
                        <img
                            src={imgQL}
                            alt="Quản lý kho"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                    </div>
                </div>
            </section>


            <section className="bg-white border-b border-gray-100">
                <div className="max-w-[1200px] mx-auto px-6 py-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-gray-100">
                        <div><h4 className="text-4xl font-black text-[#149ca8] mb-2">500+</h4><p className="text-gray-500 font-medium">Doanh nghiệp tin dùng</p></div>
                        <div><h4 className="text-4xl font-black text-[#149ca8] mb-2">99%</h4><p className="text-gray-500 font-medium">Chính xác dữ liệu</p></div>
                        <div><h4 className="text-4xl font-black text-[#149ca8] mb-2">30%</h4><p className="text-gray-500 font-medium">Tiết kiệm chi phí</p></div>
                        <div><h4 className="text-4xl font-black text-[#149ca8] mb-2">24/7</h4><p className="text-gray-500 font-medium">Hỗ trợ kỹ thuật</p></div>
                    </div>
                </div>
            </section>


            <section className="py-24 bg-gradient-to-b from-blue-50/50 to-white relative overflow-hidden">
                <div className="max-w-[1200px] mx-auto px-6 text-center">
                    <h2 className="text-[#149ca8] font-bold tracking-widest text-sm mb-4 uppercase">Trải nghiệm vượt trội</h2>
                    <h3 className="text-3xl lg:text-4xl font-black mb-10 text-gray-900">Mọi thông tin kho hàng nằm gọn trong tay bạn</h3>

                    <div className="w-full max-w-[1000px] mx-auto h-[500px] bg-white rounded-t-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-200 border-b-0 flex flex-col relative overflow-hidden">
                        <div className="h-10 bg-gray-100 border-b border-gray-200 flex items-center px-4 gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                            <div className="ml-4 bg-white px-4 py-1 rounded text-xs text-gray-400 font-medium shadow-sm">autohomewms.vn/dashboard</div>
                        </div>
                        <div className="flex-1 bg-gray-50 flex items-center justify-center flex-col text-gray-400 border-2 border-dashed border-gray-200 m-4 rounded-xl">
                            <span className="text-5xl mb-4 text-[#149ca8] opacity-50">📊</span>
                            <p className="font-medium">[Chèn ảnh chụp màn hình Trang chủ của nhóm bạn vào đây]</p>
                        </div>
                    </div>
                </div>
            </section>


            <section className="py-24 bg-white border-t border-gray-100">
                <div className="max-w-[1200px] mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-4">Số hóa toàn bộ quy trình vận hành</h2>
                        <p className="text-gray-500">Từ lúc hàng về kho đến khi giao tới tay khách hàng</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-[#eef5ff] p-8 rounded-3xl relative overflow-hidden group hover:-translate-y-2 transition-transform">
                            <div className="w-12 h-12 bg-[#149ca8] text-white rounded-xl flex items-center justify-center text-xl font-bold mb-6">1</div>
                            <h4 className="text-2xl font-bold mb-3 text-gray-900">Nhập kho (Inbound)</h4>
                            <p className="text-gray-600 mb-6">Tạo phiếu nhập từ nhà cung cấp nhanh chóng. Tự động cộng dồn số lượng và cập nhật giá trị tồn kho tức thời.</p>
                        </div>
                        <div className="bg-[#f5f3ff] p-8 rounded-3xl relative overflow-hidden group hover:-translate-y-2 transition-transform">
                            <div className="w-12 h-12 bg-purple-600 text-white rounded-xl flex items-center justify-center text-xl font-bold mb-6">2</div>
                            <h4 className="text-2xl font-bold mb-3 text-gray-900">Lưu trữ & Kiểm kê</h4>
                            <p className="text-gray-600 mb-6">Phân bổ vị trí cất hàng thông minh. Theo dõi thời gian lưu kho và hỗ trợ kiểm kê định kỳ không cần đóng cửa.</p>
                        </div>
                        <div className="bg-[#ebfaef] p-8 rounded-3xl relative overflow-hidden group hover:-translate-y-2 transition-transform">
                            <div className="w-12 h-12 bg-green-600 text-white rounded-xl flex items-center justify-center text-xl font-bold mb-6">3</div>
                            <h4 className="text-2xl font-bold mb-3 text-gray-900">Xuất kho (Outbound)</h4>
                            <p className="text-gray-600 mb-6">Tự động trừ tồn khi có phiếu xuất. Kết nối với thông tin khách hàng để điều phối xuất hàng chính xác 100%.</p>
                        </div>
                    </div>
                </div>
            </section>


            <section className="py-24 bg-gray-50 border-t border-gray-200">
                <div className="max-w-[1200px] mx-auto px-6">
                    <h2 className="text-3xl lg:text-4xl font-black text-center mb-16 text-gray-900">Tạm biệt những "cơn đau đầu" khi quản lý kho</h2>
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="relative h-[450px] rounded-[3rem] border-4 border-white shadow-xl overflow-hidden bg-red-50">
                            <img
                                src={imgHelp}
                                alt="Bài toán khó khăn trong quản lý kho"
                                className="w-full h-full object-contain p-4 hover:scale-105 transition-transform duration-500"
                            />
                        </div>
                        <div className="space-y-8">
                            <div className="flex gap-5 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-red-200 transition-colors">
                                <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-sm font-bold shrink-0">✕</div>
                                <div><h4 className="font-bold text-lg mb-1">Dữ liệu lệch pha, thất thoát hàng</h4><p className="text-gray-500">Sổ sách một đằng, hàng thực tế một nẻo gây tổn thất chi phí.</p></div>
                            </div>
                            <div className="flex gap-5 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-red-200 transition-colors">
                                <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-sm font-bold shrink-0">✕</div>
                                <div><h4 className="font-bold text-lg mb-1">Tốn hàng giờ để tìm kiếm hàng hóa</h4><p className="text-gray-500">Không nhớ vị trí cất hàng, nhân viên mới mất nhiều tuần để làm quen kho.</p></div>
                            </div>
                            <div className="flex gap-5 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-red-200 transition-colors">
                                <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-sm font-bold shrink-0">✕</div>
                                <div><h4 className="font-bold text-lg mb-1">Báo cáo chậm trễ</h4><p className="text-gray-500">Cuối tháng mới biết doanh thu và tồn kho, không kịp đưa ra quyết định.</p></div>
                            </div>
                        </div>
                    </div>
                </div>

            </section>



            <section className="bg-[#149ca8] text-white py-24 relative overflow-hidden">

                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-400/20 to-transparent"></div>

                <div className="max-w-[1200px] mx-auto px-6 relative z-10">
                    <h2 className="text-3xl lg:text-4xl font-black text-center mb-16">Ứng dụng công nghệ hiện đại</h2>
                    <div className="grid md:grid-cols-3 gap-8">


                        <div className="bg-white text-gray-800 p-8 rounded-3xl shadow-xl hover:-translate-y-2 transition-transform duration-300">

                            <div className="w-14 h-14 bg-[#149ca8] rounded-2xl flex items-center justify-center text-white text-2xl mb-6 shadow-md">
                                ✨
                            </div>
                            <h3 className="font-bold text-xl mb-4 text-gray-900">AI dự báo nhu cầu nhập hàng</h3>
                            <p className="text-gray-500 leading-relaxed text-sm">
                                Dựa trên lịch sử tiêu thụ và xu hướng thị trường, AI giúp dự báo chính xác nhu cầu nhập hàng, tránh tình trạng thừa hoặc thiếu hàng.
                            </p>
                        </div>


                        <div className="bg-white text-gray-800 p-8 rounded-3xl shadow-xl hover:-translate-y-2 transition-transform duration-300">
                            <div className="w-14 h-14 bg-[#149ca8] rounded-2xl flex items-center justify-center text-white text-2xl mb-6 shadow-md">
                                📡
                            </div>
                            <h3 className="font-bold text-xl mb-4 text-gray-900">Tích hợp RFID</h3>
                            <p className="text-gray-500 leading-relaxed text-sm">
                                Công nghệ nhận dạng tần số vô tuyến giúp theo dõi hàng hóa theo thời gian thực, nâng cao độ chính xác trong quản lý kho.
                            </p>
                        </div>


                        <div className="bg-white text-gray-800 p-8 rounded-3xl shadow-xl hover:-translate-y-2 transition-transform duration-300">
                            <div className="w-14 h-14 bg-[#149ca8] rounded-2xl flex items-center justify-center text-white text-2xl mb-6 shadow-md">
                                🕹️
                            </div>
                            <h3 className="font-bold text-xl mb-4 text-gray-900">IoT theo dõi hàng hóa</h3>
                            <p className="text-gray-500 leading-relaxed text-sm">
                                Các thiết bị IoT được tích hợp giúp theo dõi hàng hóa theo thời gian thực, cung cấp thông tin chính xác về vị trí và tình trạng hàng hóa.
                            </p>
                        </div>

                    </div>
                </div>
            </section>


            <section className="py-24 bg-[#fafbfc] border-t border-gray-100">
                <div className="max-w-[1200px] mx-auto px-6">
                    <h2 className="text-3xl lg:text-4xl font-black text-center mb-16 text-gray-900">Giải thưởng đạt được</h2>


                    <div className="flex overflow-x-auto lg:grid lg:grid-cols-5 gap-6 pb-8 lg:pb-0 snap-x snap-mandatory">


                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center min-w-[200px] snap-center hover:shadow-lg transition-shadow">
                            <div className="h-32 w-24 bg-yellow-100 rounded-lg flex items-center justify-center mb-4 text-xs text-yellow-600 border border-yellow-200">
                                <img
                                    src={imgCup}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                            </div>
                            <p className="font-bold text-gray-800 text-sm">Cúp vàng Gold Cup</p>
                        </div>


                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center min-w-[200px] snap-center hover:shadow-lg transition-shadow">
                            <div className="h-32 w-24 bg-yellow-100 rounded-lg flex items-center justify-center mb-4 text-xs text-yellow-600 border border-yellow-200">
                                <img
                                    src={imgCup}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                            </div>
                            <p className="font-bold text-gray-800 text-sm">Sao Khuê</p>
                        </div>


                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center min-w-[200px] snap-center hover:shadow-lg transition-shadow">
                            <div className="h-32 w-24 bg-gray-100 rounded-lg flex items-center justify-center mb-4 text-xs text-gray-500 border border-gray-200">
                                <img
                                    src={imgCup}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                            </div>
                            <p className="font-bold text-gray-800 text-sm">Sản phẩm ưa chuộng nhất do người tiêu dùng bình chọn</p>
                        </div>


                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center min-w-[200px] snap-center hover:shadow-lg transition-shadow">
                            <div className="h-32 w-24 bg-yellow-100 rounded-lg flex items-center justify-center mb-4 text-xs text-yellow-600 border border-yellow-200">
                                <img
                                    src={imgCup}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                            </div>
                            <p className="font-bold text-gray-800 text-sm">Giải vàng Make in Vietnam</p>
                        </div>


                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center min-w-[200px] snap-center hover:shadow-lg transition-shadow">
                            <div className="h-32 w-24 bg-yellow-100 rounded-lg flex items-center justify-center mb-4 text-xs text-yellow-600 border border-yellow-200">
                                <img
                                    src={imgCup}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                            </div>
                            <p className="font-bold text-gray-800 text-sm">Giải thưởng Chuyển Đổi Số Việt Nam VDCA</p>
                        </div>

                    </div>
                </div>
            </section>


            <section className="py-24 bg-white border-t border-gray-100">
                <div className="max-w-[1200px] mx-auto px-6">
                    <h2 className="text-3xl lg:text-4xl font-black text-center mb-16 text-gray-900">
                        Hàng ngàn doanh nghiệp đã lựa chọn AUTO HOME
                    </h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">


                        <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm bg-white hover:shadow-md transition-shadow">
                            <div className="bg-[#d2dcf0] text-center py-2.5 font-bold text-gray-800 text-sm">Dược phẩm</div>
                            <div className="p-4 grid grid-cols-2 gap-4 h-40">
                                <div className="bg-gray-50 rounded flex justify-center items-center text-xs text-gray-400">[Logo 1]</div>
                                <div className="bg-gray-50 rounded flex justify-center items-center text-xs text-gray-400">[Logo 2]</div>
                                <div className="bg-gray-50 rounded flex justify-center items-center text-xs text-gray-400">[Logo 3]</div>
                                <div className="bg-gray-50 rounded flex justify-center items-center text-xs text-gray-400">[Logo 4]</div>
                            </div>
                        </div>


                        <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm bg-white hover:shadow-md transition-shadow">
                            <div className="bg-[#d2dcf0] text-center py-2.5 font-bold text-gray-800 text-sm">Thực phẩm</div>
                            <div className="p-4 grid grid-cols-2 gap-4 h-40">
                                <div className="bg-gray-50 rounded flex justify-center items-center text-xs text-gray-400">[Logo 1]</div>
                                <div className="bg-gray-50 rounded flex justify-center items-center text-xs text-gray-400">[Logo 2]</div>
                                <div className="bg-gray-50 rounded flex justify-center items-center text-xs text-gray-400">[Logo 3]</div>
                                <div className="bg-gray-50 rounded flex justify-center items-center text-xs text-gray-400">[Logo 4]</div>
                            </div>
                        </div>


                        <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm bg-white hover:shadow-md transition-shadow">
                            <div className="bg-[#d2dcf0] text-center py-2.5 font-bold text-gray-800 text-sm">Tổng hợp</div>
                            <div className="p-4 grid grid-cols-2 gap-4 h-40">
                                <div className="bg-gray-50 rounded flex justify-center items-center text-xs text-gray-400">[Logo 1]</div>
                                <div className="bg-gray-50 rounded flex justify-center items-center text-xs text-gray-400">[Logo 2]</div>
                                <div className="bg-gray-50 rounded flex justify-center items-center text-xs text-gray-400">[Logo 3]</div>
                                <div className="bg-gray-50 rounded flex justify-center items-center text-xs text-gray-400">[Logo 4]</div>
                            </div>
                        </div>


                        <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm bg-white hover:shadow-md transition-shadow">
                            <div className="bg-[#d2dcf0] text-center py-2.5 font-bold text-gray-800 text-sm">Hóa mỹ phẩm</div>
                            <div className="p-4 grid grid-cols-2 gap-4 h-40">
                                <div className="bg-gray-50 rounded flex justify-center items-center text-xs text-gray-400">[Logo 1]</div>
                                <div className="bg-gray-50 rounded flex justify-center items-center text-xs text-gray-400">[Logo 2]</div>
                                <div className="bg-gray-50 rounded flex justify-center items-center text-xs text-gray-400">[Logo 3]</div>
                                <div className="bg-gray-50 rounded flex justify-center items-center text-xs text-gray-400">[Logo 4]</div>
                            </div>
                        </div>



                        <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm bg-white hover:shadow-md transition-shadow">
                            <div className="bg-[#d2dcf0] text-center py-2.5 font-bold text-gray-800 text-sm">Bao bì</div>
                            <div className="p-4 grid grid-cols-2 gap-4 h-40">
                                <div className="bg-gray-50 rounded flex justify-center items-center text-xs text-gray-400">[Logo 1]</div>
                                <div className="bg-gray-50 rounded flex justify-center items-center text-xs text-gray-400">[Logo 2]</div>
                                <div className="bg-gray-50 rounded flex justify-center items-center text-xs text-gray-400">[Logo 3]</div>
                                <div className="bg-gray-50 rounded flex justify-center items-center text-xs text-gray-400">[Logo 4]</div>
                            </div>
                        </div>


                        <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm bg-white hover:shadow-md transition-shadow">
                            <div className="bg-[#d2dcf0] text-center py-2.5 font-bold text-gray-800 text-sm">Nội thất</div>
                            <div className="p-4 grid grid-cols-2 gap-4 h-40">
                                <div className="bg-gray-50 rounded flex justify-center items-center text-xs text-gray-400">[Logo 1]</div>
                                <div className="bg-gray-50 rounded flex justify-center items-center text-xs text-gray-400">[Logo 2]</div>
                                <div className="bg-gray-50 rounded flex justify-center items-center text-xs text-gray-400">[Logo 3]</div>
                                <div className="bg-gray-50 rounded flex justify-center items-center text-xs text-gray-400">[Logo 4]</div>
                            </div>
                        </div>


                        <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm bg-white hover:shadow-md transition-shadow">
                            <div className="bg-[#d2dcf0] text-center py-2.5 font-bold text-gray-800 text-sm">Vật liệu xây dựng</div>
                            <div className="p-4 grid grid-cols-2 gap-4 h-40">
                                <div className="bg-gray-50 rounded flex justify-center items-center text-xs text-gray-400">[Logo 1]</div>
                                <div className="bg-gray-50 rounded flex justify-center items-center text-xs text-gray-400">[Logo 2]</div>
                                <div className="bg-gray-50 rounded flex justify-center items-center text-xs text-gray-400">[Logo 3]</div>
                                <div className="bg-gray-50 rounded flex justify-center items-center text-xs text-gray-400">[Logo 4]</div>
                            </div>
                        </div>


                        <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm bg-white hover:shadow-md transition-shadow">
                            <div className="bg-[#d2dcf0] text-center py-2.5 font-bold text-gray-800 text-sm">Máy móc thiết bị</div>
                            <div className="p-4 grid grid-cols-2 gap-4 h-40">
                                <div className="bg-gray-50 rounded flex justify-center items-center text-xs text-gray-400">[Logo 1]</div>
                                <div className="bg-gray-50 rounded flex justify-center items-center text-xs text-gray-400">[Logo 2]</div>
                                <div className="bg-gray-50 rounded flex justify-center items-center text-xs text-gray-400">[Logo 3]</div>
                                <div className="bg-gray-50 rounded flex justify-center items-center text-xs text-gray-400">[Logo 4]</div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
};

export default Hero;