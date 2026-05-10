import portraitDefault from './icons/avatar.png';

export const getAvatarSrc = (avatarData) => {
    // Nếu là base64 (cho các trường hợp preview hoặc cũ), dùng luôn
    if (avatarData && String(avatarData).startsWith('data:image')) {
        return avatarData;
    }
    
    // Nếu là đường dẫn file từ server (ví dụ: /uploads/avatars/...)
    if (avatarData && String(avatarData).startsWith('/uploads/')) {
        // Trong môi trường dev, backend chạy ở port 8080
        return `http://localhost:8080${avatarData}`;
    }
    
    // Ngược lại dùng ảnh placeholder mặc định
    return portraitDefault;
};
