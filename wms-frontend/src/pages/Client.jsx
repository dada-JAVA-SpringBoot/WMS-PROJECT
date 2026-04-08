import React from 'react';
import { TableToolbar, IconPlaceholder } from '../components/common/SharedUI';
import addIcon from "../components/common/icons/add.png";
import infoIcon from "../components/common/icons/info.png";
import deleteIcon from "../components/common/icons/delete.png";
import excelIcon from "../components/common/icons/excel.png";
import fixIcon from "../components/common/icons/fix.png";
import excel1Icon from "../components/common/icons/excel1.png";

export default function Client() {
    const data = [
        { id: 1, name: 'Nguyễn Văn A', phone: '0387913347', address: 'Bình Định' },
        { id: 2, name: 'Trần Nhất Nhất', phone: '0123456789', address: 'TP.HCM' },
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
            label: 'Xóa',
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
        <div className="p-8 bg-gray-50 h-full">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Quản lý khách hàng</h1>

            <TableToolbar actions={toolbarActions} />

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mt-6">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                    <tr className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <th className="px-6 py-4 text-center">Mã</th>
                        <th className="px-6 py-4">Tên khách hàng</th>
                        <th className="px-6 py-4">Số điện thoại</th>
                        <th className="px-6 py-4">Địa chỉ</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                    {data.map((row) => (
                        <tr key={row.id} className="hover:bg-blue-50/50 transition cursor-pointer">
                            <td className="px-6 py-4 text-sm text-center text-gray-400">{row.id}</td>
                            <td className="px-6 py-4 text-sm font-bold text-[#1192a8]">{row.name}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{row.phone}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{row.address}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}