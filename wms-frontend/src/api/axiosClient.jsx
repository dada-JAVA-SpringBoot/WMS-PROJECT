// src/api/axiosClient.js
import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'http://localhost:8080',
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000,
});

// ── Request interceptor: tự động gắn JWT vào mọi request ──────────────────
axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('wms_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ── Response interceptor: xử lý lỗi 401/403 toàn cục ─────────────────────
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;

        if (status === 401) {
            // Token hết hạn hoặc không hợp lệ — xóa storage và reload về Login
            localStorage.removeItem('wms_token');
            localStorage.removeItem('wms_user');
            window.dispatchEvent(new Event('wms:unauthorized'));
        }

        if (status === 403) {
            // Có token nhưng không đủ quyền
            window.dispatchEvent(new Event('wms:forbidden'));
        }

        return Promise.reject(error);
    }
);

export default axiosClient;
