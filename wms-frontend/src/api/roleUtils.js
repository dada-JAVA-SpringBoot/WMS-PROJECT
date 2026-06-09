export const ROLE_MAP = {
    ADMIN:             'Quản trị viên',
    MANAGER:           'Quản lý kho',
    ACCOUNTANT:        'Kế toán kho',
    STOREKEEPER:       'Thủ kho',
    WAREHOUSE_KEEPER:  'Thủ kho',
    INBOUND_STAFF:     'Nhân viên nhập kho',
    OUTBOUND_STAFF:    'Nhân viên xuất kho',
    QUALITY_CONTROL:   'Kiểm duyệt (QC)',
    INVENTORY_CHECKER: 'Kiểm kê viên',
    HANDLER:           'Nhân viên điều chuyển',
    INTERN:            'Thực tập sinh',
};

/**
 * Lấy nhãn tiếng Việt cho danh sách các vai trò (roles)
 * @param {string[]} roles - Danh sách vai trò (vùng admin, manager, ...)
 * @returns {string} - Nhãn hiển thị
 */
export const getRoleLabel = (roles) => {
    if (!roles || !roles.length) return 'Nhân viên';
    
    // Nếu có ADMIN, ưu tiên hiện Quản trị viên
    if (roles.includes('ADMIN')) return ROLE_MAP.ADMIN;
    
    // Nếu có nhiều quyền, lấy quyền đầu tiên tìm thấy trong map
    for (const r of roles) {
        if (ROLE_MAP[r]) return ROLE_MAP[r];
    }
    
    return roles[0] || 'Nhân viên';
};
