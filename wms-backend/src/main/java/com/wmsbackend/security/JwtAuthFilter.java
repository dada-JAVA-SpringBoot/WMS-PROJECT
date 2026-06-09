// ===== JwtAuthFilter.java =====
package com.wmsbackend.security;

import com.wmsbackend.util.TimeUtils;
import com.wmsbackend.entity.Staff;
import com.wmsbackend.repository.StaffRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    @Autowired private JwtUtil jwtUtil;
    @Autowired private StaffUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {
        try {
            String authHeader = request.getHeader("Authorization");

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                String username = jwtUtil.extractUsername(token);

                if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                    if (jwtUtil.isTokenValid(token, userDetails)) {
                        StaffRepository repo = com.wmsbackend.config.ApplicationContextHolder.getContext().getBean(StaffRepository.class);
                        Staff staff = repo.findByUsername(username).orElse(null);

                        boolean globalAdmin = staff != null && staff.getRoles().stream().anyMatch(r -> "ADMIN".equals(r.getRoleName()));
                        Integer companyId = (staff != null) ? staff.getCompanyId() : null;
                        String headerCompanyId = request.getHeader("X-Workspace-Company-Id");
                        if (globalAdmin && headerCompanyId != null && !headerCompanyId.isBlank() && !"null".equals(headerCompanyId)) {
                            try {
                                companyId = Integer.valueOf(headerCompanyId.trim());
                            } catch (NumberFormatException ignored) {}
                        }

                        WorkspaceContext.setGlobalAdmin(globalAdmin);
                        WorkspaceContext.setCurrentCompanyId(companyId);

                        // Logic xác định Consolidated View (Xem hợp nhất dữ liệu cho HQ/Admin)
                        boolean isConsolidated = false;
                        if (globalAdmin) {
                            if (companyId == null) {
                                isConsolidated = true;
                            } else {
                                try {
                                    com.wmsbackend.repository.CompanyRepository companyRepo = 
                                        com.wmsbackend.config.ApplicationContextHolder.getContext().getBean(com.wmsbackend.repository.CompanyRepository.class);
                                    isConsolidated = companyRepo.findById(companyId)
                                            .map(c -> c.getParentCompanyId() == null)
                                            .orElse(true);
                                } catch (Exception ignored) {}
                            }
                        }
                        WorkspaceContext.setConsolidatedView(isConsolidated);

                        var authToken = new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities());
                        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authToken);

                        // Cập nhật LastActiveAt cho Staff (Real-time tracking)
                        try {
                            StaffRepository staffRepo = com.wmsbackend.config.ApplicationContextHolder.getContext().getBean(StaffRepository.class);
                            staffRepo.findByUsername(username).ifPresent(found -> {
                                found.setLastActiveAt(TimeUtils.now());
                                staffRepo.save(found);
                            });
                        } catch (Exception e) {
                            // Bỏ qua lỗi cập nhật activity để không chặn request chính
                        }
                    }
                }
            }
        } catch (Exception e) {
            // Token không hợp lệ — vẫn tiếp tục request, nhưng không set auth
        }

        try {
            chain.doFilter(request, response);
        } finally {
            WorkspaceContext.clear();
        }
    }
}
