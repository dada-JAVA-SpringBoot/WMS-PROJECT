package com.wmsbackend.controller;

import com.wmsbackend.entity.Staff;
import com.wmsbackend.repository.StaffRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/debug")
public class DebugController {

    @Autowired 
    private StaffRepository staffRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/check-admin")
    public Map<String, Object> checkAdmin() {
        Optional<Staff> adminOpt = staffRepository.findByUsername("admin");
        Map<String, Object> response = new HashMap<>();

        if (adminOpt.isPresent()) {
            Staff admin = adminOpt.get();
            response.put("status", "success");
            response.put("username", admin.getUsername());
            
            // THỬ KIỂM TRA MẬT KHẨU TRỰC TIẾP
            String testPass = "Admin@123";
            boolean isMatch = passwordEncoder.matches(testPass, admin.getPassword());
            
            response.put("test_password_used", testPass);
            response.put("is_password_match", isMatch);
            response.put("raw_hash_in_db", admin.getPassword());
            
            if (!isMatch) {
                response.put("suggestion", "Mật khẩu trong DB không khớp với 'Admin@123'. Hãy dùng lệnh SQL bên dưới để cập nhật lại.");
                response.put("fix_sql", "UPDATE Staff SET Password = '" + passwordEncoder.encode(testPass) + "' WHERE Username = 'admin';");
            }
        } else {
            response.put("status", "error");
            response.put("message", "KHÔNG tìm thấy user 'admin'");
        }
        
        return response;
    }
}
