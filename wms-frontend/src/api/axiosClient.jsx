// src/api/axiosClient.js
import axios from 'axios';

const axiosClient = axios.create({
    baseURL: '', // Để trống vì các file gọi API đã có sẵn tiền tố /api
    timeout: 30000, // Tăng timeout cho VPS
});

// ── Request interceptor: tự động gắn JWT vào mọi request ──────────────────
axiosClient.interceptors.request.use(
    (config) => {
        // Debug URL (có thể xóa sau)
        console.log(`[Axios Request] ${config.method.toUpperCase()} ${config.url}`);
        
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
