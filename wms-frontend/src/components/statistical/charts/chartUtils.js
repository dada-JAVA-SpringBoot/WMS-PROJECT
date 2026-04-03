export function formatCurrencyShort(value) {
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)} tỷ`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(0)}tr`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
    return `${value}`;
}

export function formatCurrencyVN(value) {
    return `${new Intl.NumberFormat('vi-VN').format(value)}đ`;
}
