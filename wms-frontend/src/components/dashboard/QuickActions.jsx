import React from 'react';
import { useNavigate } from 'react-router-dom';
import inboundIcon from '../common/icons/inbound.png';
import outboundIcon from '../common/icons/outbound.png';
import storageIcon from '../common/icons/storage-stacks.png';
import inventoryIcon from '../common/icons/product.png';

export default function QuickActions({ roles }) {
    const navigate = useNavigate();

    const actions = [
        {
            label: 'Nhập kho',
            icon: inboundIcon,
            path: '/admin/inbound',
            roles: ['ADMIN', 'MANAGER', 'INBOUND_STAFF', 'STOREKEEPER'],
            color: 'bg-blue-600'
        },
        {
            label: 'Xuất kho',
            icon: outboundIcon,
            path: '/admin/outbound',
            roles: ['ADMIN', 'MANAGER', 'OUTBOUND_STAFF', 'STOREKEEPER'],
            color: 'bg-red-600'
        },
        {
            label: 'Chuyển kho',
            icon: storageIcon,
            path: '/admin/warehouse-area',
            roles: ['ADMIN', 'MANAGER', 'STOREKEEPER', 'HANDLER'],
            color: 'bg-teal-600'
        },
        {
            label: 'Kiểm kê',
            icon: inventoryIcon,
            path: '/admin/cycle-counting',
            roles: ['ADMIN', 'MANAGER', 'INVENTORY_CHECKER', 'STOREKEEPER'],
            color: 'bg-purple-600'
        }
    ];

    const allowedActions = actions.filter(action => 
        action.roles.some(role => roles.includes(role))
    );

    return (
        <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Thao tác nhanh</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {allowedActions.map((action, idx) => (
                    <button
                        key={idx}
                        onClick={() => navigate(action.path)}
                        className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group"
                    >
                        <div className={`w-12 h-12 rounded-lg ${action.color} bg-opacity-10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                            <img src={action.icon} className="w-8 h-8 object-contain" alt={action.label} />
                        </div>
                        <span className="text-gray-700 font-medium">{action.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
