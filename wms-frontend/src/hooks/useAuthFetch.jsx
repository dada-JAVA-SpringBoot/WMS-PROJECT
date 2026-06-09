// ===== src/hooks/useAuthFetch.js =====
// Hook tiện lợi — tự động gắn JWT vào mọi request
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export function useAuthFetch() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const authFetch = async (url, options = {}) => {
        const res = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {}),
                Authorization: `Bearer ${user?.token}`,
            },
        });

        // Token hết hạn hoặc không hợp lệ
        if (res.status === 401) {
            logout();
            navigate('/login');
            throw new Error('Phiên đăng nhập đã hết hạn');
        }
        if (res.status === 403) {
            navigate('/unauthorized');
            throw new Error('Không có quyền thực hiện thao tác này');
        }

        return res;
    };

    return authFetch;
}