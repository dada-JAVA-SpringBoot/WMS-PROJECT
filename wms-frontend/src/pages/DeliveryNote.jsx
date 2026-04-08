import React from 'react';
import { TableToolbar } from '../components/common/SharedUI';
import addIcon from '../components/common/icons/add.png';
import fixIcon from '../components/common/icons/fix.png';
import deleteIcon from '../components/common/icons/delete.png';
import infoIcon from '../components/common/icons/info.png';
import excelIcon from '../components/common/icons/excel.png';
import excel1Icon from '../components/common/icons/excel1.png';


export default function ExportReceipts() {
    const exportData = [
        { id: 1, code: 'PX23', client: 'Nguyễn Văn A', staff: 'Trần Nhật Sinh', time: '10/05/2023 09:15', total: '5.200.000đ' },
        { id: 2, code: 'PX21', client: 'Trần Nhất Nhất', staff: 'Trần Nhật Sinh', time: '10/05/2023 10:30', total: '12.000.000đ' },
        { id: 3, code: 'PX20', client: 'Hoàng Gia Bo', staff: 'Lê Hải Yến', time: '09/05/2023 14:20', total: '8.500.000đ' },
    ];

    const toolbarActions = [
        {
            label: 'Thêm',
            iconSrc: addIcon,
            onClick: () => alert('Thêm phiếu xuất')
        },
        {
            label: 'Chi tiết',
            iconSrc: infoIcon,
            onClick: () => {}
        },
        {
            label: 'Hủy phiếu',
            iconSrc: deleteIcon,
            onClick: () => {}
        },
        {
          label: 'Nhập Excel',
          iconSrc: excelIcon,
          onClick: () => {}
        },
        {
            label: 'Xuất Excel',
            iconSrc: excel1Icon,
            onClick: () => {}
        },
    ];

    return (
        <div className="p-6 bg-[#f8f9fa] min-h-full flex flex-col text-left">
            <h1 className="text-2xl font-bold text-[#2d3748] mb-6 px-2">Quản lý phiếu xuất</h1>

            <TableToolbar actions={toolbarActions} />

            <div className="flex gap-6 mt-6 flex-1">
                <div className="w-72 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-fit">
                    <div className="flex items-center gap-2 mb-6">
                        <span className="text-xl">🛒</span>
                        <h2 className="font-bold text-gray-800 uppercase text-sm tracking-wider">Bộ lọc tìm kiếm</h2>
                    </div>

                    <div className="space-y-4">
                        <FilterInput label="KHÁCH HÀNG" type="select" options={['Tất cả', 'Nguyễn Văn A', 'Trần Nhất Nhất']} />
                        <FilterInput label="NHÂN VIÊN XUẤT" type="select" options={['Tất cả', 'Trần Nhật Sinh', 'Lê Hải Yến']} />
                        <FilterInput label="TỪ NGÀY" type="date" />
                        <FilterInput label="ĐẾN NGÀY" type="date" />
                        <FilterInput label="TỪ SỐ TIỀN (VND)" type="number" placeholder="0" />
                        <FilterInput label="ĐẾN SỐ TIỀN (VND)" type="number" placeholder="0" />
                    </div>
                </div>

                <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-[#fcfcfc] border-b border-gray-100">
                        <tr className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                            <th className="px-6 py-4 text-center w-16">STT</th>
                            <th className="px-4 py-4 w-24">Mã Phiếu</th>
                            <th className="px-6 py-4">Khách Hàng</th>
                            <th className="px-6 py-4">Nhân viên xuất</th>
                            <th className="px-6 py-4">Thời gian</th>
                            <th className="px-6 py-4 text-right">Tổng tiền</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                        {exportData.map((item) => (
                            <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group cursor-pointer">
                                <td className="px-6 py-5 text-sm text-center text-gray-400 font-bold">{item.id}</td>
                                <td className="px-4 py-5 text-xs font-bold text-gray-500 bg-gray-50/50 text-center rounded-md">{item.code}</td>
                                <td className="px-6 py-5 text-sm font-bold text-gray-700">{item.client}</td>
                                <td className="px-6 py-5 text-sm text-gray-500">{item.staff}</td>
                                <td className="px-6 py-5 text-xs text-gray-400 leading-tight">{item.time}</td>
                                <td className="px-6 py-5 text-sm text-right font-black text-[#1192a8]">{item.total}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

const FilterInput = ({ label, type, options, placeholder }) => (
    <div className="flex flex-col gap-1.5 text-left">
        <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">{label}</label>
        {type === 'select' ? (
            <select className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#1192a8] bg-white text-gray-600">
                {options.map((opt, i) => <option key={i}>{opt}</option>)}
            </select>
        ) : (
            <input
                type={type}
                placeholder={placeholder}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#1192a8]"
            />
        )}
    </div>
);