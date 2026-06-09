// ===== AuthController.java =====
package com.wmsbackend.controller;

import com.wmsbackend.dto.LoginRequest;
import com.wmsbackend.dto.LoginResponse;
import com.wmsbackend.dto.RegisterRequest;
import com.wmsbackend.entity.Role;
import com.wmsbackend.entity.Staff;
import com.wmsbackend.entity.Company;
import com.wmsbackend.repository.CompanyRepository;
import com.wmsbackend.repository.RoleRepository;
import com.wmsbackend.repository.StaffRepository;
import com.wmsbackend.security.JwtUtil;
import com.wmsbackend.security.StaffUserDetailsService;
import com.wmsbackend.security.WorkspaceContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
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
public class AuthController {

    @Autowired private AuthenticationManager authManager;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private StaffUserDetailsService userDetailsService;
    @Autowired private StaffRepository staffRepository;
    @Autowired private RoleRepository roleRepository;
    @Autowired private CompanyRepository companyRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private MessageSource messageSource;

    private String getMessage(String code) {
        try {
            return messageSource.getMessage(code, null, LocaleContextHolder.getLocale());
        } catch (Exception e) {
            return code;
        }
    }

    // ── ĐĂNG NHẬP ─────────────────────────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        System.out.println("Đang đăng nhập user: " + request.getUsername());
        try {
            authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
            System.out.println("Xác thực thành công cho: " + request.getUsername());
        } catch (AuthenticationException e) {
            System.out.println("Xác thực thất bại: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", getMessage("auth.login.incorrect")));
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());
        Staff staff = staffRepository.findByUsername(request.getUsername()).orElseThrow();
        boolean globalAdmin = staff.getRoles().stream().anyMatch(role -> "ADMIN".equals(role.getRoleName()));
        String token = jwtUtil.generateToken(userDetails, staff.getCompanyId(), globalAdmin);

        List<String> roles = userDetails.getAuthorities().stream()
                .map(a -> a.getAuthority().replace("ROLE_", ""))
                .toList();

        Company company = staff.getCompanyId() != null ? companyRepository.findById(staff.getCompanyId()).orElse(null) : null;

        return ResponseEntity.ok(new LoginResponse(
                token, staff.getId(), staff.getUsername(), staff.getFullName(), staff.getEmployeeCode(), staff.getAvatar(),
                staff.getCompanyId(),
                company != null ? company.getCompanyCode() : null,
                company != null ? company.getCompanyName() : (globalAdmin ? "GLOBAL" : null),
                globalAdmin,
                roles
        ));
    }

    // ── ĐĂNG KÝ TÀI KHOẢN MỚI (chỉ ADMIN) ───────────────────────────────
    @PostMapping("/register")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (staffRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", getMessage("auth.username.exists")));
        }
        if (staffRepository.existsByEmployeeCode(request.getEmployeeCode())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", getMessage("auth.employee_code.exists")));
        }

        Integer targetCompanyId = WorkspaceContext.isGlobalAdmin()
                ? (request.getCompanyId() != null ? request.getCompanyId() : WorkspaceContext.getCurrentCompanyId())
                : WorkspaceContext.getCurrentCompanyId();

        if (targetCompanyId == null && !WorkspaceContext.isGlobalAdmin()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Thiếu công ty con cho tài khoản mới"));
        }

        // Lấy roles từ DB
        Set<Role> roles = new HashSet<>();
        for (String roleName : request.getRoleNames()) {
            if (!WorkspaceContext.isGlobalAdmin() && "ADMIN".equals(roleName)) {
                continue;
            }
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
        staff.setCompanyId(targetCompanyId);
        staff.setWorkStatus("OFF_SHIFT");
        staff.setEnabled(true);
        staff.setRoles(roles);

        staffRepository.save(staff);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", getMessage("auth.register.success")));
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
            return ResponseEntity.badRequest().body(Map.of("message", getMessage("auth.password.incorrect")));
        }
        staff.setPassword(passwordEncoder.encode(newPass));
        staffRepository.save(staff);
        return ResponseEntity.ok(Map.of("message", getMessage("auth.password.success")));
    }

    // ── LẤY THÔNG TIN USER HIỆN TẠI (/me) ────────────────────────────────
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        String token    = authHeader.substring(7);
        String username = jwtUtil.extractUsername(token);
        Staff staff     = staffRepository.findByUsername(username).orElseThrow();
        List<String> roles = jwtUtil.extractRoles(token);
        Company company = staff.getCompanyId() != null ? companyRepository.findById(staff.getCompanyId()).orElse(null) : null;
        return ResponseEntity.ok(new LoginResponse(
                token, staff.getId(), staff.getUsername(), staff.getFullName(), staff.getEmployeeCode(), staff.getAvatar(),
                staff.getCompanyId(),
                company != null ? company.getCompanyCode() : null,
                company != null ? company.getCompanyName() : null,
                roles.stream().anyMatch("ADMIN"::equals),
                roles
        ));
    }
}
 
