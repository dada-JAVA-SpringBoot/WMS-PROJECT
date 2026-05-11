// ===== LoginResponse.java =====
package com.wmsbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private Integer id;
    private String username;
    private String fullName;
    private String employeeCode;
    private String avatar;
    private List<String> roles;
}