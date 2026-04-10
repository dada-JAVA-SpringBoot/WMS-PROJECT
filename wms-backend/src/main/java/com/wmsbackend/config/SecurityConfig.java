package com.wmsbackend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // Tắt bảo vệ CSRF
                .csrf(csrf -> csrf.disable())
                // Cho phép tất cả các request đi qua mà không cần đăng nhập
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());

        return http.build();
    }
}