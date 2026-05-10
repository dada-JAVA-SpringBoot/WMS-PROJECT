package com.wmsbackend.controller;

import com.wmsbackend.dto.StaffDTO;
import com.wmsbackend.entity.Staff;
import com.wmsbackend.repository.StaffRepository;
import com.wmsbackend.service.StaffService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/staff")
@CrossOrigin("*")
public class StaffController {

    @Autowired private StaffService staffService;
    @Autowired private StaffRepository staffRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    // GET đầy đủ thông tin — ADMIN & MANAGER
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public List<StaffDTO> getStaff(@RequestParam(required = false) String keyword) {
        if (keyword != null && !keyword.isBlank()) return staffService.searchStaff(keyword);
        return staffService.getAllStaff();
    }

    // GET danh sách tên thu gọn — TẤT CẢ NHÂN VIÊN ĐỀU XEM ĐƯỢC
    // Sử dụng HashMap thủ công để tránh lỗi tương thích phiên bản Java hoặc lỗi inference
    @GetMapping("/names")
    @PreAuthorize("isAuthenticated()")
    public List<Map<String, Object>> getStaffNames() {
        return staffService.getAllStaff().stream().map(s -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", s.getId());
            map.put("fullName", s.getFullName());
            return map;
        }).collect(Collectors.toList());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Staff createStaff(@RequestBody Staff staff) {
        return staffService.createStaff(staff);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Staff updateStaff(@PathVariable Integer id, @RequestBody Staff staff) {
        return staffService.updateStaff(id, staff);
    }

    @Autowired private com.wmsbackend.service.FileService fileService;

    @PostMapping(value = "/{id}/avatar", consumes = {"multipart/form-data"})
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<?> updateAvatar(@PathVariable Integer id, @RequestPart("file") org.springframework.web.multipart.MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "File không hợp lệ hoặc trống"));
        }
        try {
            // Lấy thông tin cũ để xóa file cũ trên ổ cứng
            Staff staff = staffRepository.findById(id).orElseThrow();
            String oldPath = staff.getAvatar();

            String fileUrl = fileService.saveAvatar(file, id, oldPath);
            staffService.updateAvatar(id, fileUrl);
            return ResponseEntity.ok(Map.of("message", "Cập nhật ảnh thành công", "url", fileUrl));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Lỗi lưu file: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteStaff(@PathVariable Integer id) {
        staffService.deleteStaff(id);
    }

    @PostMapping("/{id}/reset-password")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<?> resetPassword(@PathVariable Integer id, @RequestBody Map<String, String> body) {
        Staff staff = staffRepository.findById(id).orElseThrow();
        
        // Kiểm tra bảo mật: MANAGER không được sửa ADMIN
        boolean targetIsAdmin = staff.getRoles().stream().anyMatch(r -> r.getRoleName().equals("ADMIN"));
        boolean currentUserIsAdmin = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        
        if (targetIsAdmin && !currentUserIsAdmin) {
            return ResponseEntity.status(403).body(Map.of("message", "Quản lý không có quyền thay đổi mật khẩu của Quản trị viên"));
        }

        staff.setPassword(passwordEncoder.encode(body.get("newPassword")));
        staffRepository.save(staff);
        return ResponseEntity.ok(Map.of("message", "Đặt lại mật khẩu thành công"));
    }

    @PostMapping("/{id}/toggle-enabled")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<?> toggleEnabled(@PathVariable Integer id) {
        Staff staff = staffRepository.findById(id).orElseThrow();

        // Kiểm tra bảo mật: MANAGER không được vô hiệu hóa ADMIN
        boolean targetIsAdmin = staff.getRoles().stream().anyMatch(r -> r.getRoleName().equals("ADMIN"));
        boolean currentUserIsAdmin = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (targetIsAdmin && !currentUserIsAdmin) {
            return ResponseEntity.status(403).body(Map.of("message", "Quản lý không có quyền vô hiệu hóa tài khoản của Quản trị viên"));
        }

        staff.setEnabled(!Boolean.TRUE.equals(staff.getEnabled()));
        staffRepository.save(staff);
        return ResponseEntity.ok(Map.of("message", staff.getEnabled() ? "Đã kích hoạt" : "Đã vô hiệu hóa"));
    }
}