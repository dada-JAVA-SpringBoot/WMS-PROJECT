// ===== RegisterRequest.java =====
package com.wmsbackend.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter @Setter
public class RegisterRequest {
    private String employeeCode;
    private String fullName;
    private String username;
    private String password;
    private String gender;
    private String phone;
    private String email;
    private String contractType;
    private String warehouseRole;
    private List<String> roleNames; // ["INBOUND_STAFF"] hoặc ["ADMIN","MANAGER"]
}