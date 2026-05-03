import React from 'react';

const Features = () => {
    return (
        <div className="bg-white">


            <div className="text-center py-20 bg-gray-50 border-b border-gray-100">
                <h2 className="text-[#149ca8] font-bold tracking-widest text-sm mb-4 uppercase">Chức năng cốt lõi</h2>
                <h3 className="text-4xl font-black text-gray-900">Giải pháp toàn diện cho mọi quy trình</h3>
            </div>

            <div className="max-w-[1200px] mx-auto px-6 py-20 space-y-32">

                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="relative h-[450px] bg-blue-50/50 rounded-[3rem] flex items-center justify-center p-8 border border-blue-100/50">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-cyan-400/20 rounded-full blur-3xl -z-10"></div>
                        <div className="absolute top-1/4 right-1/4 w-[200px] h-[200px] bg-purple-400/20 rounded-full blur-3xl -z-10"></div>

                        <div className="w-full h-full bg-white rounded-2xl shadow-xl border border-gray-100 flex items-center justify-center text-gray-400 font-medium">
                            [Chèn ảnh màn hình Quản lý Sản phẩm]
                        </div>
                    </div>
                    <div className="space-y-6">
                        <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                            Quản lý Danh mục Hàng hóa chi tiết
                        </h3>
                        <ul className="space-y-5 text-gray-600">
                            <li className="flex items-start gap-3">
                                <span className="text-green-500 bg-green-50 rounded-full p-1 mt-0.5"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg></span>
                                <span>Tạo và quản lý danh sách <span className="font-bold text-[#149ca8]">Sản phẩm</span> với thông tin, hình ảnh đầy đủ.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-green-500 bg-green-50 rounded-full p-1 mt-0.5"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg></span>
                                <span>Thiết lập linh hoạt các <span className="font-bold text-[#149ca8]">Thuộc tính</span> (màu sắc, kích thước, quy cách...).</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-green-500 bg-green-50 rounded-full p-1 mt-0.5"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg></span>
                                <span>Phân loại hàng hóa khoa học, dễ dàng tìm kiếm và truy xuất.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-green-500 bg-green-50 rounded-full p-1 mt-0.5"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg></span>
                                <span>Quản lý mã vạch/QR code riêng biệt cho từng phân loại sản phẩm.</span>
                            </li>
                        </ul>
                        <div className="flex gap-4 pt-6">
                            <button className="bg-[#149ca8] text-white px-6 py-3 rounded-full font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/30 flex items-center gap-2">Dùng thử miễn phí <span className="bg-white text-blue-600 rounded-full p-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg></span></button>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-6 order-2 lg:order-1">
                        <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                            Thiết lập & Kiểm soát Khu vực Kho
                        </h3>
                        <ul className="space-y-6 text-gray-600">
                            <li>
                                <div className="flex items-center gap-3 font-bold text-gray-900 mb-1">
                                    <span className="text-green-500 bg-green-50 rounded-full p-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg></span>
                                    Định vị <span className="text-[#149ca8] ml-1">Khu vực kho</span> rõ ràng
                                </div>
                                <p className="ml-9 text-sm text-gray-500">Phân chia chi tiết các dãy, kệ, tầng để dễ dàng định vị hàng hóa.</p>
                            </li>
                            <li>
                                <div className="flex items-center gap-3 font-bold text-gray-900 mb-1">
                                    <span className="text-green-500 bg-green-50 rounded-full p-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg></span>
                                    Tối ưu không gian thực tế
                                </div>
                                <p className="ml-9 text-sm text-gray-500">Sơ đồ hóa vị trí đặt hàng, tận dụng tối đa diện tích lưu trữ.</p>
                            </li>
                            <li>
                                <div className="flex items-center gap-3 font-bold text-gray-900 mb-1">
                                    <span className="text-green-500 bg-green-50 rounded-full p-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg></span>
                                    Sắp xếp thông minh
                                </div>
                                <p className="ml-9 text-sm text-gray-500">Hỗ trợ sắp xếp hàng hóa khoa học, tránh nhầm lẫn vị trí lấy/cất hàng.</p>
                            </li>
                        </ul>
                    </div>
                    <div className="relative h-[450px] bg-purple-50/50 rounded-[3rem] flex items-center justify-center p-8 border border-purple-100/50 order-1 lg:order-2">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-purple-300/20 rounded-full blur-3xl -z-10"></div>
                        <div className="w-full h-full bg-white rounded-2xl shadow-xl border border-gray-100 flex items-center justify-center text-gray-400 font-medium">
                            [Chèn ảnh màn hình Khu vực kho]
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="relative h-[450px] bg-pink-50/50 rounded-[3rem] flex items-center justify-center p-8 border border-pink-100/50">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-pink-400/20 rounded-full blur-3xl -z-10"></div>
                        <div className="w-full h-full bg-white rounded-2xl shadow-xl border border-gray-100 flex items-center justify-center text-gray-400 font-medium">
                            [Chèn ảnh màn hình Lập phiếu]
                        </div>
                    </div>
                    <div className="space-y-6">
                        <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                            Vận hành luồng Nhập - Xuất chính xác
                        </h3>
                        <p className="text-gray-600">Kiểm soát chặt chẽ mọi biến động hàng hóa ra vào kho:</p>
                        <ul className="space-y-5 text-gray-600">
                            <li>
                                <div className="flex items-center gap-3 font-bold text-gray-900 mb-1">
                                    <span className="text-green-500 bg-green-50 rounded-full p-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg></span>
                                    Xử lý <span className="text-[#149ca8] ml-1">Phiếu nhập</span> nhanh chóng
                                </div>
                                <p className="ml-9 text-sm text-gray-500">Tạo và phê duyệt phiếu nhập từ nhà cung cấp dễ dàng.</p>
                            </li>
                            <li>
                                <div className="flex items-center gap-3 font-bold text-gray-900 mb-1">
                                    <span className="text-green-500 bg-green-50 rounded-full p-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg></span>
                                    Điều phối <span className="text-[#149ca8] ml-1">Phiếu xuất</span> linh hoạt
                                </div>
                                <p className="ml-9 text-sm text-gray-500">Xuất kho xuất xác, liên kết chặt chẽ với thông tin đơn hàng.</p>
                            </li>
                            <li>
                                <div className="flex items-center gap-3 font-bold text-gray-900 mb-1">
                                    <span className="text-green-500 bg-green-50 rounded-full p-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg></span>
                                    Cập nhật tồn kho tự động
                                </div>
                                <p className="ml-9 text-sm text-gray-500">Hệ thống tự cộng/trừ tồn kho ngay khi phiếu được duyệt.</p>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="bg-[#f2f8ff] py-24">
                <div className="max-w-[1200px] mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-6 order-2 lg:order-1">
                        <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                            Quản lý Đối tác & <br/>Thống kê trực quan
                        </h3>
                        <ul className="space-y-6 text-gray-600">
                            <li>
                                <div className="flex items-center gap-3 font-bold text-gray-900 mb-1">
                                    <span className="text-green-500 bg-green-50 rounded-full p-1 bg-white"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg></span>
                                    Hồ sơ <span className="text-[#149ca8] mx-1">Khách hàng</span> & <span className="text-[#149ca8] ml-1">Nhà cung cấp</span>
                                </div>
                                <p className="ml-9 text-sm text-gray-500">Lưu trữ đồng bộ, theo dõi công nợ và lịch sử giao dịch chi tiết.</p>
                            </li>
                            <li>
                                <div className="flex items-center gap-3 font-bold text-gray-900 mb-1">
                                    <span className="text-green-500 bg-green-50 rounded-full p-1 bg-white"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg></span>
                                    Báo cáo <span className="text-[#149ca8] ml-1">Thống kê</span> thông minh
                                </div>
                                <p className="ml-9 text-sm text-gray-500">Biểu đồ trực quan về lượng xuất/nhập/tồn theo thời gian thực.</p>
                            </li>
                        </ul>
                    </div>
                    <div className="h-[400px] w-full bg-white rounded-2xl shadow-xl border border-gray-100 flex items-center justify-center text-gray-400 font-medium order-1 lg:order-2">
                        [Chèn ảnh màn hình Thống kê]
                    </div>
                </div>
            </div>


            <div className="bg-[#fff7f0] py-24 mb-20">
                <div className="max-w-[1200px] mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
                    <div className="relative h-[450px] bg-white rounded-2xl shadow-xl flex items-center justify-center p-8 border border-gray-100">
                        <div className="w-full h-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-400 font-medium">
                            [Chèn ảnh màn hình Phân quyền]
                        </div>
                    </div>
                    <div className="space-y-6">
                        <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                            Quản trị Nhân sự & Phân quyền bảo mật
                        </h3>
                        <ul className="space-y-6 text-gray-600">
                            <li className="flex items-start gap-3">
                                <span className="text-green-500 bg-green-50 rounded-full p-1 mt-1 bg-white"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg></span>
                                <span className="leading-relaxed">Quản lý hồ sơ <span className="font-bold text-[#149ca8]">Nhân viên</span> và cấp phát <span className="font-bold text-[#149ca8]">Tài khoản</span> truy cập an toàn cho từng cá nhân.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-green-500 bg-green-50 rounded-full p-1 mt-1 bg-white"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg></span>
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