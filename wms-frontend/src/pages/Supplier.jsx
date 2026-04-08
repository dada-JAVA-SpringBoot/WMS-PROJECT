import React from 'react';
import { TableToolbar, IconPlaceholder } from '../components/common/SharedUI';
import addIcon from "../components/common/icons/add.png";
import infoIcon from "../components/common/icons/info.png";
import deleteIcon from "../components/common/icons/delete.png";
import excelIcon from "../components/common/icons/excel.png";
import excel1Icon from "../components/common/icons/excel1.png";

export default function Supplier() {
    const suppliers = [
        { id: 1, name: 'Công Ty TNHH Thế Giới Di Động', address: 'Quận Tân Bình, TP. HCM', email: 'lienhe@thegioididong.com', phone: '02835100100' },
        { id: 2, name: 'Công ty Vivo Việt Nam', address: 'Quận 7, TPHCM', email: 'contact@paviet.vn', phone: '19009477' },
        { id: 3, name: 'Công ty TNHH Bao La', address: 'Quận Bình Thạnh, TP. HCM', email: 'contact@baola.vn', phone: '02835119060' },
        { id: 4, name: 'Công ty Nokia', address: 'Quận 1, TP. HCM', email: 'chau.nguyen@nokia.com', phone: '02838236894' },
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
        <div className="p-8 bg-gray-50 h-full flex flex-col">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Quản lý nhà cung cấp</h1>

            <TableToolbar actions={toolbarActions} />

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mt-6 flex-1">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b">
                    <tr className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                        <th className="px-6 py-4 text-center w-24">Mã NCC</th>
                        <th className="px-6 py-4">Tên nhà cung cấp</th>
                        <th className="px-6 py-4">Địa chỉ</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4 text-right">Số điện thoại</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                    {suppliers.map((item) => (
                        <tr key={item.id} className="hover:bg-blue-50/50 transition-colors cursor-pointer group">
                            <td className="px-6 py-4 text-sm text-center text-gray-400 font-medium">{item.id}</td>
                            <td className="px-6 py-4 text-sm font-bold text-[#1192a8] group-hover:text-teal-600">{item.name}</td>
                            <td className="px-6 py-4 text-xs text-gray-500 italic max-w-xs truncate">{item.address}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{item.email}</td>
                            <td className="px-6 py-4 text-sm text-right font-mono text-gray-700">{item.phone}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}