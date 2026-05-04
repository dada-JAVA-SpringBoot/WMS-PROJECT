// ===== StaffController.java (cập nhật — thêm endpoint reset-password + toggle-enabled) =====
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

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/staff")
@CrossOrigin("*")
public class StaffController {

    @Autowired private StaffService staffService;
    @Autowired private StaffRepository staffRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<StaffDTO> getStaff(@RequestParam(required = false) String keyword) {
        if (keyword != null && !keyword.isBlank()) return staffService.searchStaff(keyword);
        return staffService.getAllStaff();
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

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteStaff(@PathVariable Integer id) {
        staffService.deleteStaff(id);
    }

    // ── Đặt lại mật khẩu (ADMIN) ──────────────────────────
    @PostMapping("/{id}/reset-password")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> resetPassword(@PathVariable Integer id,
                                           @RequestBody Map<String, String> body) {
        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên"));
        staff.setPassword(passwordEncoder.encode(body.get("newPassword")));
        staffRepository.save(staff);
        return ResponseEntity.ok(Map.of("message", "Đặt lại mật khẩu thành công"));
    }

    // ── Bật/Tắt tài khoản (ADMIN) ─────────────────────────
    @PostMapping("/{id}/toggle-enabled")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> toggleEnabled(@PathVariable Integer id) {
        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên"));
        staff.setEnabled(!Boolean.TRUE.equals(staff.getEnabled()));
        staffRepository.save(staff);
        String status = staff.getEnabled() ? "Đã kích hoạt" : "Đã vô hiệu hóa";
        return ResponseEntity.ok(Map.of("message", status));
    }
}