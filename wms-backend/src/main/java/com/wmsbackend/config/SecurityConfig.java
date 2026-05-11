// ===== SecurityConfig.java (viết lại hoàn toàn) =====
package com.wmsbackend.config;

import com.wmsbackend.security.JwtAuthFilter;
import com.wmsbackend.security.StaffUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.http.HttpMethod;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity   // Cho phép dùng @PreAuthorize trên từng method
public class SecurityConfig {

    @Autowired private JwtAuthFilter jwtAuthFilter;
    @Autowired private StaffUserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public — chỉ cho phép login/register/debug/uploads
                        .requestMatchers("/api/auth/**", "/api/debug/**", "/uploads/**").permitAll()

                        // ── Phân quyền theo API ─────────────────────────────────────
                        // Quản lý nhân viên: ADMIN, MANAGER, QC (xem)
                        .requestMatchers(HttpMethod.GET, "/api/staff/names").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/staff/**").hasAnyRole("ADMIN", "MANAGER", "QUALITY_CONTROL")
                        .requestMatchers("/api/staff/**").hasAnyRole("ADMIN", "MANAGER")

                        // Quản lý nhà cung cấp: ADMIN, MANAGER, STOREKEEPER, INBOUND_STAFF, QC
                        .requestMatchers("/api/suppliers/**").hasAnyRole("ADMIN", "MANAGER", "STOREKEEPER", "INBOUND_STAFF", "QUALITY_CONTROL")

                        // Quản lý khách hàng: ADMIN, MANAGER, OUTBOUND_STAFF, QC
                        .requestMatchers("/api/customers/**").hasAnyRole("ADMIN", "MANAGER", "OUTBOUND_STAFF", "QUALITY_CONTROL")

                        // Sản phẩm: xem được từ STOREKEEPER trở lên, sửa/xóa cần MANAGER+
                        .requestMatchers(HttpMethod.GET, "/api/products/**")
                        .hasAnyRole("ADMIN","MANAGER","STOREKEEPER","INBOUND_STAFF","OUTBOUND_STAFF","CHECKER","QUALITY_CONTROL")
                        .requestMatchers(HttpMethod.POST, "/api/products/**").hasAnyRole("ADMIN","MANAGER")
                        .requestMatchers(HttpMethod.PUT, "/api/products/**").hasAnyRole("ADMIN","MANAGER")
                        .requestMatchers(HttpMethod.DELETE, "/api/products/**").hasRole("ADMIN")

                        // Nhập kho: INBOUND_STAFF trở lên
                        .requestMatchers("/api/inbound/**")
                        .hasAnyRole("ADMIN","MANAGER","STOREKEEPER","WAREHOUSE_KEEPER","INBOUND_STAFF","QUALITY_CONTROL")

                        // Lịch sử giao dịch: ACCOUNTANT trở lên
                        .requestMatchers("/api/transactions/**")
                        .hasAnyRole("ADMIN","MANAGER","STOREKEEPER","WAREHOUSE_KEEPER","ACCOUNTANT")

                        // Xuất kho: OUTBOUND_STAFF trở lên
                        .requestMatchers("/api/outbound-orders/**")
                        .hasAnyRole("ADMIN","MANAGER","STOREKEEPER","WAREHOUSE_KEEPER","INBOUND_STAFF","OUTBOUND_STAFF","QUALITY_CONTROL")

                        // Wave Picking: STOREKEEPER trở lên
                        .requestMatchers("/api/waves/**")
                        .hasAnyRole("ADMIN","MANAGER","STOREKEEPER","WAREHOUSE_KEEPER")

                        // Kiểm kê (Cycle Counting): STOREKEEPER trở lên
                        .requestMatchers("/api/cycle-counts/**")
                        .hasAnyRole("ADMIN","MANAGER","STOREKEEPER","WAREHOUSE_KEEPER","CHECKER")

                        // Tồn kho & kiểm kê: mọi role đều xem được
                        .requestMatchers("/api/inventory/**")
                        .hasAnyRole("ADMIN","MANAGER","STOREKEEPER","WAREHOUSE_KEEPER","INBOUND_STAFF","OUTBOUND_STAFF","CHECKER","QUALITY_CONTROL")

                        // Thống kê: ADMIN, MANAGER, QC, STOREKEEPER
                        .requestMatchers("/api/stats/**").hasAnyRole("ADMIN", "MANAGER", "STOREKEEPER", "WAREHOUSE_KEEPER", "INBOUND_STAFF", "OUTBOUND_STAFF", "QUALITY_CONTROL")

                        // Tất cả request còn lại cần đăng nhập
                        .anyRequest().authenticated()
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173"));
        config.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}