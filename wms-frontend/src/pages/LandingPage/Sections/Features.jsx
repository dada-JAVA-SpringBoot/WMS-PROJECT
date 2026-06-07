import React from 'react';
import imgProduct from '../../../components/common/icons/a11.png';
import imgQlKho from '../../../components/common/icons/a10.png';
import imgSPX from '../../../components/common/icons/a8.png';
import imgSuppiler from '../../../components/common/icons/a7.png';
import imgStaff from '../../../components/common/icons/a6.png';

const Features = () => {
    return (
        <div className="bg-white dark:bg-gray-900 transition-colors duration-300">

            <div className="text-center py-20 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 transition-colors duration-300">
                <h2 className="text-[#149ca8] font-bold tracking-widest text-sm mb-4 uppercase">Chức năng cốt lõi</h2>
                <h3 className="text-4xl font-black text-gray-900 dark:text-white">Giải pháp toàn diện cho mọi quy trình</h3>
            </div>

            <div className="max-w-[1200px] mx-auto px-6 py-20 space-y-32">

                {/* Section 1 */}
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="relative bg-blue-50/50 dark:bg-blue-900/20 rounded-[3rem] flex items-center justify-center p-8 border border-blue-100/50 dark:border-blue-800/50 group overflow-hidden">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-cyan-400/20 rounded-full blur-3xl -z-10"></div>
                        <div className="absolute top-1/4 right-1/4 w-[200px] h-[200px] bg-purple-400/20 rounded-full blur-3xl -z-10"></div>
                        <div className="w-full bg-white dark:bg-gray-700 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden border-4 border-white/50">
                            <img src={imgProduct} alt="Màn hình Quản lý Danh mục Sản phẩm" className="w-full h-auto block group-hover:scale-105 transition-transform duration-700" />
                        </div>
                    </div>
                    <div className="space-y-6">
                        <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
                            Quản lý Danh mục Hàng hóa chi tiết
                        </h3>
                        <ul className="space-y-5 text-gray-600 dark:text-gray-300">
                            <li className="flex items-start gap-3">
                                <span className="text-green-500 bg-green-50 dark:bg-green-900/30 rounded-full p-1 mt-0.5"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg></span>
                                <span>Tạo và quản lý danh sách <span className="font-bold text-[#149ca8]">Sản phẩm</span> với thông tin, hình ảnh đầy đủ.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-green-500 bg-green-50 dark:bg-green-900/30 rounded-full p-1 mt-0.5"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg></span>
                                <span>Thiết lập linh hoạt các <span className="font-bold text-[#149ca8]">Thuộc tính</span> (màu sắc, kích thước, quy cách...).</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-green-500 bg-green-50 dark:bg-green-900/30 rounded-full p-1 mt-0.5"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg></span>
                                <span>Phân loại hàng hóa khoa học, dễ dàng tìm kiếm và truy xuất.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-green-500 bg-green-50 dark:bg-green-900/30 rounded-full p-1 mt-0.5"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg></span>
                                <span>Quản lý mã vạch/QR code riêng biệt cho từng phân loại sản phẩm.</span>
                            </li>
                        </ul>
                        <div className="flex gap-4 pt-6">
                            <button className="bg-[#149ca8] text-white px-6 py-3 rounded-full font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/30 flex items-center gap-2">Dùng thử miễn phí <span className="bg-white text-blue-600 rounded-full p-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg></span></button>
                        </div>
                    </div>
                </div>

                {/* Section 2 */}
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-6 order-2 lg:order-1">
                        <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
                            Thiết lập & Kiểm soát Khu vực Kho
                        </h3>
                        <ul className="space-y-6 text-gray-600 dark:text-gray-300">
                            <li>
                                <div className="flex items-center gap-3 font-bold text-gray-900 dark:text-white mb-1">
                                    <span className="text-green-500 bg-green-50 dark:bg-green-900/30 rounded-full p-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg></span>
                                    Định vị <span className="text-[#149ca8] ml-1">Khu vực kho</span> rõ ràng
                                </div>
                                <p className="ml-9 text-sm text-gray-500 dark:text-gray-400">Phân chia chi tiết các dãy, kệ, tầng để dễ dàng định vị hàng hóa.</p>
                            </li>
                            <li>
                                <div className="flex items-center gap-3 font-bold text-gray-900 dark:text-white mb-1">
                                    <span className="text-green-500 bg-green-50 dark:bg-green-900/30 rounded-full p-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg></span>
                                    Tối ưu không gian thực tế
                                </div>
                                <p className="ml-9 text-sm text-gray-500 dark:text-gray-400">Sơ đồ hóa vị trí đặt hàng, tận dụng tối đa diện tích lưu trữ.</p>
                            </li>
                            <li>
                                <div className="flex items-center gap-3 font-bold text-gray-900 dark:text-white mb-1">
                                    <span className="text-green-500 bg-green-50 dark:bg-green-900/30 rounded-full p-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg></span>
                                    Sắp xếp thông minh
                                </div>
                                <p className="ml-9 text-sm text-gray-500 dark:text-gray-400">Hỗ trợ sắp xếp hàng hóa khoa học, tránh nhầm lẫn vị trí lấy/cất hàng.</p>
                            </li>
                        </ul>
                    </div>
                    <div className="relative bg-purple-50/50 dark:bg-purple-900/20 rounded-[3rem] flex items-center justify-center p-8 border border-purple-100/50 dark:border-purple-800/50 order-1 lg:order-2 group overflow-hidden">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-purple-300/20 rounded-full blur-3xl -z-10"></div>
                        <div className="w-full bg-white dark:bg-gray-700 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden border-4 border-white/50">
                            <img src={imgQlKho} alt="Sơ đồ Khu vực Kho hàng" className="w-full h-auto block group-hover:scale-105 transition-transform duration-700" />
                        </div>
                    </div>
                </div>

                {/* Section 3 */}
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="relative bg-pink-50/50 dark:bg-pink-900/20 rounded-[3rem] flex items-center justify-center p-8 border border-pink-100/50 dark:border-pink-800/50 group overflow-hidden">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-pink-400/20 rounded-full blur-3xl -z-10"></div>
                        <div className="w-full bg-white dark:bg-gray-700 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden border-4 border-white/50">
                            <img src={imgSPX} alt="Màn hình Vận hành Nhập Xuất kho" className="w-full h-auto block group-hover:scale-105 transition-transform duration-700" />
                        </div>
                    </div>
                    <div className="space-y-6">
                        <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
                            Vận hành luồng Nhập - Xuất chính xác
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">Kiểm soát chặt chẽ mọi biến động hàng hóa ra vào kho:</p>
                        <ul className="space-y-5 text-gray-600 dark:text-gray-300">
                            <li>
                                <div className="flex items-center gap-3 font-bold text-gray-900 dark:text-white mb-1">
                                    <span className="text-green-500 bg-green-50 dark:bg-green-900/30 rounded-full p-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg></span>
                                    Xử lý <span className="text-[#149ca8] ml-1">Phiếu nhập</span> nhanh chóng
                                </div>
                                <p className="ml-9 text-sm text-gray-500 dark:text-gray-400">Tạo và phê duyệt phiếu nhập từ nhà cung cấp dễ dàng.</p>
                            </li>
                            <li>
                                <div className="flex items-center gap-3 font-bold text-gray-900 dark:text-white mb-1">
                                    <span className="text-green-500 bg-green-50 dark:bg-green-900/30 rounded-full p-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg></span>
                                    Điều phối <span className="text-[#149ca8] ml-1">Phiếu xuất</span> linh hoạt
                                </div>
                                <p className="ml-9 text-sm text-gray-500 dark:text-gray-400">Xuất kho chính xác, liên kết chặt chẽ với thông tin đơn hàng.</p>
                            </li>
                            <li>
                                <div className="flex items-center gap-3 font-bold text-gray-900 dark:text-white mb-1">
                                    <span className="text-green-500 bg-green-50 dark:bg-green-900/30 rounded-full p-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg></span>
                                    Cập nhật tồn kho tự động
                                </div>
                                <p className="ml-9 text-sm text-gray-500 dark:text-gray-400">Hệ thống tự cộng/trừ tồn kho ngay khi phiếu được duyệt.</p>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Section 4 */}
            <div className="bg-[#f2f8ff] dark:bg-gray-800 py-24 group transition-colors duration-300">
                <div className="max-w-[1200px] mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-6 order-2 lg:order-1">
                        <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
                            Quản lý Đối tác & <br/>Thống kê trực quan
                        </h3>
                        <ul className="space-y-6 text-gray-600 dark:text-gray-300">
                            <li>
                                <div className="flex items-center gap-3 font-bold text-gray-900 dark:text-white mb-1">
                                    <span className="text-green-500 bg-green-50 dark:bg-green-900/30 rounded-full p-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg></span>
                                    Hồ sơ <span className="text-[#149ca8] mx-1">Khách hàng</span> & <span className="text-[#149ca8] ml-1">Nhà cung cấp</span>
                                </div>
                                <p className="ml-9 text-sm text-gray-500 dark:text-gray-400">Lưu trữ đồng bộ, theo dõi công nợ và lịch sử giao dịch chi tiết.</p>
                            </li>
                            <li>
                                <div className="flex items-center gap-3 font-bold text-gray-900 dark:text-white mb-1">
                                    <span className="text-green-500 bg-green-50 dark:bg-green-900/30 rounded-full p-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg></span>
                                    Báo cáo <span className="text-[#149ca8] ml-1">Thống kê</span> thông minh
                                </div>
                                <p className="ml-9 text-sm text-gray-500 dark:text-gray-400">Biểu đồ trực quan về lượng xuất/nhập/tồn theo thời gian thực.</p>
                            </li>
                        </ul>
                    </div>
                    <div className="w-full bg-white dark:bg-gray-700 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden border-4 border-white/50 order-1 lg:order-2 group">
                        <img src={imgSuppiler} alt="Màn hình Báo cáo Thống kê kho hàng" className="w-full h-auto block group-hover:scale-105 transition-transform duration-700" />
                    </div>
                </div>
            </div>

            {/* Section 5 */}
            <div className="bg-[#fff7f0] dark:bg-gray-900 py-24 mb-20 group transition-colors duration-300">
                <div className="max-w-[1200px] mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
                    <div className="relative w-full bg-white dark:bg-gray-700 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden border-4 border-white/50 flex items-center justify-center p-0 group">
                        <img src={imgStaff} alt="Màn hình Quản lý và Phân quyền Nhân viên" className="w-full h-auto block group-hover:scale-105 transition-transform duration-700" />
                    </div>
                    <div className="space-y-6">
                        <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
                            Quản trị Nhân sự & Phân quyền bảo mật
                        </h3>
                        <ul className="space-y-6 text-gray-600 dark:text-gray-300">
                            <li className="flex items-start gap-3">
                                <span className="text-green-500 bg-green-50 dark:bg-green-900/30 rounded-full p-1 mt-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg></span>
                                <span className="leading-relaxed">Quản lý hồ sơ <span className="font-bold text-[#149ca8]">Nhân viên</span> và cấp phát <span className="font-bold text-[#149ca8]">Tài khoản</span> truy cập an toàn cho từng cá nhân.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-green-500 bg-green-50 dark:bg-green-900/30 rounded-full p-1 mt-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg></span>
                                <span className="leading-relaxed">Hệ thống <span className="font-bold text-[#149ca8]">Phân quyền</span> chi tiết: Giới hạn tính năng và phạm vi nhìn thấy dữ liệu theo vai trò (Thủ kho, Kế toán, Quản lý...).</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Features;