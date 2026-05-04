import React from 'react';

export default function Home() {
    return (
        <div className="min-h-full flex flex-col bg-[#f4f9f9]">
            {/* Phần Header (Logo & Tiêu đề) */}
            <div className="flex flex-col items-center justify-center pt-12 pb-8 px-4 bg-white">
                <h1 className="text-2xl font-extrabold text-[#1192a8] uppercase mb-4 text-center">
                    Hệ thống quản lý kho điện thoại theo mã imei
                </h1>

                <p className="text-[#1192a8] font-medium text-center max-w-3xl leading-relaxed">
                    – "Một câu triết lý nhóm" – <br/>
                    <span className="font-bold">Tập đoàn dada</span>
                </p>
            </div>

            {/* Phần 3 Thẻ Tính năng (Cards) */}
            <div className="flex-1 flex justify-center items-start pt-12 pb-16 px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl w-full">

                    {/* Card 1: Tính chính xác */}
                    <FeatureCard
                        title="TÍNH CHÍNH XÁC"
                        description="Mã IMEI là một số duy nhất được gán cho từng thiết bị điện thoại, do đó hệ thống quản lý điện thoại theo mã IMEI sẽ đảm bảo tính chính xác và độ tin cậy cao."
                    />

                    {/* Card 2: Tính bảo mật */}
                    <FeatureCard
                        title="TÍNH BẢO MẬT"
                        description="Ngăn chặn việc sử dụng các thiết bị điện thoại giả mạo hoặc bị đánh cắp. Điều này giúp tăng tính bảo mật cho các hoạt động quản lý điện thoại."
                    />

                    {/* Card 3: Tính hiệu quả */}
                    <FeatureCard
                        title="TÍNH HIỆU QUẢ"
                        description="Dễ dàng xác định được thông tin về từng thiết bị điện thoại một cách nhanh chóng và chính xác, giúp cho việc quản lý điện thoại được thực hiện một cách hiệu quả hơn."
                    />

                </div>
            </div>
        </div>
    );
}

// Sub-component cho các Thẻ để tái sử dụng code
function FeatureCard({ title, description }) {
    return (
        <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-8 flex flex-col items-center text-center transform transition duration-300 hover:-translate-y-2 hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)]">
            {/* Chỗ để bạn chèn icon minh họa */}
            <div className="w-32 h-32 border-2 border-dashed border-gray-200 rounded-full flex items-center justify-center text-gray-400 mb-6">
                [Icon]
            </div>

            <h3 className="text-xl font-bold text-[#1192a8] mb-4">
                {title}
            </h3>

            <p className="text-gray-500 text-sm leading-relaxed">
                {description}
            </p>
        </div>
    );
}
