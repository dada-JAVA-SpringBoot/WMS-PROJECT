import portraitDefault from './icons/avatar.png';

export const getAvatarSrc = (avatarData) => {
    // Nếu là base64 (cho các trường hợp preview hoặc cũ), dùng luôn
    if (avatarData && String(avatarData).startsWith('data:image')) {
        return avatarData;
    }
    
    // Nếu là đường dẫn file từ server (ví dụ: /uploads/avatars/...)
    if (avatarData && String(avatarData).startsWith('/uploads/')) {
        return avatarData;
    }
    
    // Ngược lại dùng ảnh placeholder mặc định
    return portraitDefault;
};
