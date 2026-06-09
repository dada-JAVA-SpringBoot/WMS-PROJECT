import i18n from '../i18n';

// Mid-market USD/VND rate from XE/Wise as of 2026-06-08.
export const USD_VND_RATE = 26298.94;

export function getDisplayLanguage(language = i18n.language) {
    return String(language || '').startsWith('en') ? 'en' : 'vi';
}

export function getDisplayLocale(language = i18n.language) {
    return getDisplayLanguage(language) === 'en' ? 'en-US' : 'vi-VN';
}

export function getCurrencyCode(language = i18n.language) {
    return getDisplayLanguage(language) === 'en' ? 'USD' : 'VND';
}

export function getCurrencySymbol(language = i18n.language) {
    return getDisplayLanguage(language) === 'en' ? '$' : 'đ';
}

export function toDisplayCurrencyValue(value, language = i18n.language) {
    const number = Number(value);
    if (Number.isNaN(number)) return NaN;
    return getDisplayLanguage(language) === 'en' ? number / USD_VND_RATE : number;
}

export function formatNumberByLanguage(value, language = i18n.language, options = {}) {
    if (value === null || value === undefined || value === '') return '—';
    const number = Number(value);
    if (Number.isNaN(number)) return '—';

    return new Intl.NumberFormat(getDisplayLocale(language), {
        maximumFractionDigits: 0,
        ...options,
    }).format(number);
}

export function formatDateByLanguage(value, language = i18n.language, options = {}) {
    if (!value) return '—';
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '—';

    return new Intl.DateTimeFormat(getDisplayLocale(language), options).format(date);
}

export function formatCurrencyExact(value, language = i18n.language, options = {}) {
    if (value === null || value === undefined || value === '') return '—';
    const converted = toDisplayCurrencyValue(value, language);
    if (Number.isNaN(converted)) return '—';

    if (getDisplayLanguage(language) === 'en') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
            ...options,
        }).format(converted);
    }

    return `${new Intl.NumberFormat('vi-VN', {
        maximumFractionDigits: 0,
        ...options,
    }).format(converted)}đ`;
}

export function formatCurrencyShort(value, language = i18n.language) {
    if (value === null || value === undefined || value === '') return '—';

    const converted = toDisplayCurrencyValue(value, language);
    if (Number.isNaN(converted)) return '—';
    if (converted === 0 || Math.abs(converted) < 1) return '0';

    const isNegative = converted < 0;
    const absValue = Math.abs(converted);
    const isEnglish = getDisplayLanguage(language) === 'en';
    let formatted = '';

    if (absValue >= 1000000000) {
        const scaled = parseFloat((absValue / 1000000000).toFixed(1));
        formatted = isEnglish ? `$${scaled}B` : `${scaled} tỷ`;
    } else if (absValue >= 1000000) {
        const scaled = parseFloat((absValue / 1000000).toFixed(1));
        formatted = isEnglish ? `$${scaled}M` : `${scaled} tr`;
    } else if (absValue >= 1000) {
        const scaled = parseFloat((absValue / 1000).toFixed(1));
        formatted = isEnglish ? `$${scaled}K` : `${scaled} k`;
    } else {
        formatted = isEnglish
            ? `$${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(absValue)}`
            : formatNumberByLanguage(absValue, language);
    }

    return isNegative ? `-${formatted}` : formatted;
}
