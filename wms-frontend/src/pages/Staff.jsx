import React, { useState } from 'react';
import ProductModal from '../components/modals/ProductModal';

import addIcon from '../components/common/icons/add.png';
import fixIcon from '../components/common/icons/fix.png';
import deleteIcon from '../components/common/icons/delete.png';
import infoIcon from '../components/common/icons/info.png';
import scanIcon from '../components/common/icons/scan.png';
import excelIcon from '../components/common/icons/excel.png';

export default function Staff(){

    const [isModalOpen, setIsModalOpen] = useState(false);

    const mockData = [
            { id: 1, name: 'Nguyen Van A', sex: 'nam', birth: '2003-12-20', phone: '0387913347', mail: 'nguyenvana@gmail.com'},
            { id: 2, name: 'Nguyen Van A', sex: 'nam', birth: '2003-12-20', phone: '0387913347', mail: 'nguyenvana@gmail.com'},
            { id: 3, name: 'Nguyen Van A', sex: 'nam', birth: '2003-12-20', phone: '0387913347', mail: 'nguyenvana@gmail.com'},
            { id: 4, name: 'Nguyen Van A', sex: 'nam', birth: '2003-12-20', phone: '0387913347', mail: 'nguyenvana@gmail.com'},
            { id: 5, name: 'Nguyen Van A', sex: 'nam', birth: '2003-12-20', phone: '0387913347', mail: 'nguyenvana@gmail.com'},
            { id: 6, name: 'Nguyen Van A', sex: 'nam', birth: '2003-12-20', phone: '0387913347', mail: 'nguyenvana@gmail.com'},
        ];

    return(
        <div className="p-6 h-full flex flex-col bg-gray-50">
        <div className="flex items-center justify-between bg-white p-4 mb-4 rounded-xl shadow-sm">

                        <div className="flex gap-6">
                            <div onClick={() => setIsModalOpen(true)}>
                                <ActionButton iconSrc={addIcon} label="THÊM" />
                            </div>
                            <ActionButton iconSrc={fixIcon} label="SỬA" />
                            <ActionButton iconSrc={deleteIcon} label="XÓA" />
                            <ActionButton iconSrc={infoIcon} label="CHI TIẾT" />
                            <ActionButton iconSrc={scanIcon} label="XEM DS" />
                            <ActionButton iconSrc={excelIcon} label="XUẤT EXCEL" />
                        </div>

                        <div className="flex items-center gap-3">
                            <select className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 bg-white">
                                <option>Tất cả</option>
                                <option>Theo tên</option>
                                <option>Theo mã</option>
                            </select>
                            <input
                                type="text"
                                className="border border-gray-300 rounded px-4 py-1.5 w-64 text-sm focus:outline-none focus:border-blue-500"
                                placeholder="Nhập nội dung tìm kiếm..."
                            />
                            <button className="bg-[#1192a8] text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-teal-700 flex items-center gap-2 transition">
                                <span>↻</span> Làm mới
                            </button>
                        </div>
                    </div>

                    <div className="bg-white flex-1 overflow-auto rounded-xl shadow-sm">
                                    <table className="w-full text-center text-sm">
                                        <thead className="bg-gray-50 sticky top-0 shadow-sm">
                                        <tr className="text-gray-700">
                                            <th className="p-4 font-bold">Mã nhân viên</th>
                                            <th className="p-4 font-bold">Họ tên</th>
                                            <th className="p-4 font-bold">Giơ tính</th>
                                            <th className="p-4 font-bold">Ngày sinh</th>
                                            <th className="p-4 font-bold">SĐT</th>
                                            <th className="p-4 font-bold">Email</th>
                                        </tr>
                                        </thead>

                                        <tbody className="divide-y divide-gray-200">
                                        {mockData.map((item) => (
                                            <tr key={item.id} className="hover:bg-blue-50 transition cursor-pointer text-gray-600">
                                                <td className="p-3">{item.id}</td>
                                                <td className="p-3 font-medium text-gray-800">{item.name}</td>
                                                <td className="p-3">{item.sex}</td>
                                                <td className="p-3">{item.birth}</td>
                                                <td className="p-3">{item.phone}</td>
                                                <td className="p-3">{item.mail}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>


        </div>
    );
}

function ActionButton({ iconSrc, label }) {
    return (
        <button className="flex flex-col items-center gap-1 group bg-transparent border-none cursor-pointer">
            <img
                src={iconSrc}
                alt={label}
                className="w-10 h-10 group-hover:scale-110 transition duration-200"
            />
            <span className="text-[11px] font-bold text-[#00529c] uppercase tracking-wide group-hover:text-blue-600 transition">
                {label}
            </span>
        </button>
    );
}