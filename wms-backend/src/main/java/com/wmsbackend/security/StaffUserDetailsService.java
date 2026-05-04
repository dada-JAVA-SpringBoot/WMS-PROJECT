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
        Staff staff = staffRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy tài khoản: " + username));

        // Mỗi role được prefix "ROLE_" theo chuẩn Spring Security
        var authorities = staff.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.getRoleName()))
                .collect(Collectors.toSet());

        return User.builder()
                .username(staff.getUsername())
                .password(staff.getPassword())
                .authorities(authorities)
                .disabled(!Boolean.TRUE.equals(staff.getEnabled()))
                .build();
    }
}
 
 