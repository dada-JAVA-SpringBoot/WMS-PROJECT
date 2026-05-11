import React from 'react';
import { useAuth } from '../context/AuthContext';
import { getAvatarSrc } from '../components/common/avatarUtils';
import { getRoleLabel } from '../api/roleUtils';

const Account = () => {

    const InfoRow = ({ label, value, isMono = false }) => (
        <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</label>
            <div className={`bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 ${isMono ? 'font-mono text-[#1192a8]' : ''}`}>
                {value || '---'}
            </div>
        </div>
    );

    return (
        <div className="p-4 lg:p-8 bg-gray-50 min-h-full flex flex-col items-center">
            <div className="w-full max-w-3xl bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
                {/* Header Decoration */}
                <div className="h-32 bg-gradient-to-r from-[#1192a8] to-teal-600 relative">
                    <div className="absolute -bottom-12 left-8 lg:left-12">
                        <div className="w-24 h-24 lg:w-32 lg:h-32 bg-white rounded-[32px] p-1.5 shadow-xl">
                            <div className="w-full h-full rounded-[26px] overflow-hidden border-2 border-gray-50">
                                <img
                                    src={getAvatarSrc(user?.avatar)}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-16 pb-12 px-8 lg:px-12 text-left">
                    <div className="mb-10">
                        <h2 className="text-2xl lg:text-3xl font-black text-gray-800 tracking-tight">{user?.fullName}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            <span className="text-[11px] font-black text-[#1192a8] uppercase tracking-[0.2em]">
                                {getRoleLabel(user?.roles)}
                            </span>
                        </div>
                        <p className="mt-4 text-xs text-gray-400 font-medium italic">
                            * Ảnh chân dung và thông tin tài khoản được quản lý bởi Quản trị viên (ADMIN/MANAGER).
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InfoRow label="Mã nhân viên" value={user?.employeeCode} isMono={true} />
                        <InfoRow label="Tên đăng nhập" value={user?.username} isMono={true} />
                        <div className="md:col-span-2">
                            <div className="h-px bg-gray-100 my-2"></div>
                        </div>
                        <InfoRow label="Email liên hệ" value={user?.email || `${user?.username}@wms.com`} />
                        <InfoRow label="Số điện thoại" value={user?.phone || 'Chưa cập nhật'} />
                    </div>

                    <div className="mt-12 p-6 bg-teal-50/50 rounded-3xl border border-teal-100/50">
                        <h3 className="text-xs font-black text-teal-800 uppercase tracking-widest mb-4">Hướng dẫn bảo mật</h3>
                        <ul className="text-xs text-teal-700/80 space-y-2 font-medium">
                            <li className="flex gap-2">
                                <span className="text-teal-500">•</span>
                                Không chia sẻ tài khoản cho người khác sử dụng.
                            </li>
                            <li className="flex gap-2">
                                <span className="text-teal-500">•</span>
                                Liên hệ Quản trị viên nếu bạn quên mật khẩu hoặc cần thay đổi thông tin cá nhân.
                            </li>
                            <li className="flex gap-2">
                                <span className="text-teal-500">•</span>
                                Luôn đăng xuất khỏi hệ thống sau khi kết thúc ca làm việc trên thiết bị công cộng.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Account;