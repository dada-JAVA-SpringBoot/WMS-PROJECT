// ===== AuthController.java =====
package com.wmsbackend.controller;

import com.wmsbackend.dto.LoginRequest;
import com.wmsbackend.dto.LoginResponse;
import com.wmsbackend.dto.RegisterRequest;
import com.wmsbackend.entity.Role;
import com.wmsbackend.entity.Staff;
import com.wmsbackend.repository.RoleRepository;
import com.wmsbackend.repository.StaffRepository;
import com.wmsbackend.security.JwtUtil;
import com.wmsbackend.security.StaffUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
public class AuthController {

    @Autowired private AuthenticationManager authManager;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private StaffUserDetailsService userDetailsService;
    @Autowired private StaffRepository staffRepository;
    @Autowired private RoleRepository roleRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    // ── ĐĂNG NHẬP ─────────────────────────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Tên đăng nhập hoặc mật khẩu không đúng"));
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());
        String token = jwtUtil.generateToken(userDetails);

        Staff staff = staffRepository.findByUsername(request.getUsername()).orElseThrow();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(a -> a.getAuthority().replace("ROLE_", ""))
                .toList();

        return ResponseEntity.ok(new LoginResponse(
                token, staff.getUsername(), staff.getFullName(), staff.getEmployeeCode(), roles
        ));
    }

    // ── ĐĂNG KÝ TÀI KHOẢN MỚI (chỉ ADMIN) ───────────────────────────────
    @PostMapping("/register")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (staffRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Tên đăng nhập đã tồn tại"));
        }
        if (staffRepository.existsByEmployeeCode(request.getEmployeeCode())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Mã nhân viên đã tồn tại"));
        }

        // Lấy roles từ DB
        Set<Role> roles = new HashSet<>();
        for (String roleName : request.getRoleNames()) {
            roleRepository.findByRoleName(roleName).ifPresent(roles::add);
        }
        if (roles.isEmpty()) {
            roleRepository.findByRoleName("INBOUND_STAFF").ifPresent(roles::add);
        }

        Staff staff = new Staff();
        staff.setEmployeeCode(request.getEmployeeCode());
        staff.setFullName(request.getFullName());
        staff.setUsername(request.getUsername());
        staff.setPassword(passwordEncoder.encode(request.getPassword()));
        staff.setGender(request.getGender() != null ? request.getGender() : "MALE");
        staff.setPhone(request.getPhone());
        staff.setEmail(request.getEmail());
        staff.setContractType(request.getContractType() != null ? request.getContractType() : "FULL_TIME");
        staff.setWarehouseRole(request.getWarehouseRole() != null ? request.getWarehouseRole() : "INBOUND_STAFF");
        staff.setWorkStatus("OFF_SHIFT");
        staff.setEnabled(true);
        staff.setRoles(roles);

        staffRepository.save(staff);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Tạo tài khoản thành công"));
    }

    // ── ĐỔI MẬT KHẨU (nhân viên tự đổi) ─────────────────────────────────
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestBody Map<String, String> body,
            @RequestHeader("Authorization") String authHeader) {
        String token    = authHeader.substring(7);
        String username = jwtUtil.extractUsername(token);
        String oldPass  = body.get("oldPassword");
        String newPass  = body.get("newPassword");

        Staff staff = staffRepository.findByUsername(username).orElseThrow();
        if (!passwordEncoder.matches(oldPass, staff.getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Mật khẩu hiện tại không đúng"));
        }
        staff.setPassword(passwordEncoder.encode(newPass));
        staffRepository.save(staff);
        return ResponseEntity.ok(Map.of("message", "Đổi mật khẩu thành công"));
    }

    // ── LẤY THÔNG TIN USER HIỆN TẠI (/me) ────────────────────────────────
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        String token    = authHeader.substring(7);
        String username = jwtUtil.extractUsername(token);
        Staff staff     = staffRepository.findByUsername(username).orElseThrow();
        List<String> roles = jwtUtil.extractRoles(token);
        return ResponseEntity.ok(new LoginResponse(
                token, staff.getUsername(), staff.getFullName(), staff.getEmployeeCode(), roles
        ));
    }
}
 