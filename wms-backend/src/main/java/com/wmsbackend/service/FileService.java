package com.wmsbackend.service;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileService {

    public String saveAvatar(MultipartFile file, Integer staffId, String oldAvatarPath) throws IOException {
        // 1. Xóa ảnh cũ nếu có để tiết kiệm dung lượng
        deleteOldAvatar(oldAvatarPath);

        String uploadDir = "uploads/avatars";
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Tạo tên file duy nhất: staff_ID_UUID.extension
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
        String fileExtension = "";
        int i = originalFileName.lastIndexOf('.');
        if (i > 0) {
            fileExtension = originalFileName.substring(i);
        }
        String fileName = "staff_" + staffId + "_" + UUID.randomUUID().toString() + fileExtension;

        Path targetLocation = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        // Trả về đường dẫn truy cập qua HTTP
        return "/uploads/avatars/" + fileName;
    }

    private void deleteOldAvatar(String oldPath) {
        if (oldAvatarPathValid(oldPath)) {
            try {
                // Chuyển /uploads/avatars/abc.jpg thành đường dẫn vật lý
                String relativePath = oldPath.startsWith("/") ? oldPath.substring(1) : oldPath;
                Path filePath = Paths.get(relativePath).toAbsolutePath().normalize();
                Files.deleteIfExists(filePath);
                System.out.println(">>> Deleted old avatar: " + filePath);
            } catch (Exception e) {
                System.err.println(">>> Failed to delete old avatar: " + e.getMessage());
            }
        }
    }

    private boolean oldAvatarPathValid(String path) {
        return path != null && !path.isEmpty() && !path.equals("default") && path.startsWith("/uploads/");
    }
}
