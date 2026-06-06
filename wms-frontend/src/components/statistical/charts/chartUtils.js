export function formatCurrencyShort(value) {
    if (value === 0 || Math.abs(value) < 1) return '0';
    const isNegative = value < 0;
    const absValue = Math.abs(value);
    let formatted = '';
    
    if (absValue >= 1000000000) {
        formatted = `${parseFloat((absValue / 1000000000).toFixed(1))} tỷ`;
    } else if (absValue >= 1000000) {
        formatted = `${parseFloat((absValue / 1000000).toFixed(1))}tr`;
    } else if (absValue >= 1000) {
        formatted = `${parseFloat((absValue / 1000).toFixed(1))}k`;
    } else {
        formatted = `${absValue}`;
    }
    
    return isNegative ? `-${formatted}` : formatted;
}

export function formatCurrencyVN(value) {
    return `${new Intl.NumberFormat('vi-VN').format(value)}đ`;
}
