// ===== StaffUserDetailsService.java =====
package com.wmsbackend.security;

import com.wmsbackend.entity.Staff;
import com.wmsbackend.repository.StaffRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
public class StaffUserDetailsService implements UserDetailsService {

    @Autowired
    private StaffRepository staffRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        System.out.println("StaffUserDetailsService đang tìm user: " + username);
        Staff staff = staffRepository.findByUsername(username)
                .orElseThrow(() -> {
                    System.out.println("KHÔNG tìm thấy user: " + username);
                    return new UsernameNotFoundException("Không tìm thấy tài khoản: " + username);
                });

        System.out.println("Tìm thấy user: " + username + " với mật khẩu hash: " + staff.getPassword());
        
        // Mỗi role được prefix "ROLE_" theo chuẩn Spring Security
        var authorities = staff.getRoles().stream()
                .map(role -> {
                    String roleWithPrefix = "ROLE_" + role.getRoleName();
                    System.out.println("Gán quyền: " + roleWithPrefix + " cho user: " + username);
                    return new SimpleGrantedAuthority(roleWithPrefix);
                })
                .collect(Collectors.toSet());

        if (authorities.isEmpty()) {
            System.out.println("CẢNH BÁO: User " + username + " không có bất kỳ quyền (role) nào!");
        }

        return User.builder()
                .username(staff.getUsername())
                .password(staff.getPassword())
                .authorities(authorities)
                .disabled(!Boolean.TRUE.equals(staff.getEnabled()))
                .build();
    }
}
 
 