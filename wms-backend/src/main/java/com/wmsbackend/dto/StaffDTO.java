// ===== StaffDTO.java =====
package com.wmsbackend.dto;

import java.time.LocalDate;

public class StaffDTO {
    private Integer id;
    private String employeeCode;
    private String fullName;
    private String gender;
    private LocalDate dateOfBirth;
    private String phone;
    private String email;
    private LocalDate hireDate;
    private String contractType;
    private String warehouseRole;
    private String workStatus;
    private String notes;
    private String username;
    private Boolean enabled;
    private String avatar;
    private java.util.List<String> roles;
    private String shiftStartTime;
    private String shiftEndTime;
    private java.time.LocalDateTime lastActiveAt;

    public StaffDTO() {}

    public StaffDTO(Integer id, String employeeCode, String fullName, String gender,
                    LocalDate dateOfBirth, String phone, String email, LocalDate hireDate,
                    String contractType, String warehouseRole, String workStatus, String notes,
                    String username, Boolean enabled, String avatar, java.time.LocalDateTime lastActiveAt) {
        this.id = id;
        this.employeeCode = employeeCode;
        this.fullName = fullName;
        this.gender = gender;
        this.dateOfBirth = dateOfBirth;
        this.phone = phone;
        this.email = email;
        this.hireDate = hireDate;
        this.contractType = contractType;
        this.warehouseRole = warehouseRole;
        this.workStatus = workStatus;
        this.notes = notes;
        this.username = username;
        this.enabled = enabled;
        this.avatar = avatar;
        this.lastActiveAt = lastActiveAt;
    }

    // Constructor full bao gồm cả Roles và Shift cho stream mapping
    public StaffDTO(Integer id, String employeeCode, String fullName, String gender,
                    LocalDate dateOfBirth, String phone, String email, LocalDate hireDate,
                    String contractType, String warehouseRole, String workStatus, String notes,
                    String username, Boolean enabled, String avatar, java.util.List<String> roles, 
                    String shiftStartTime, String shiftEndTime, java.time.LocalDateTime lastActiveAt) {
        this(id, employeeCode, fullName, gender, dateOfBirth, phone, email, hireDate, contractType, warehouseRole, workStatus, notes, username, enabled, avatar, lastActiveAt);
        this.roles = roles;
        this.shiftStartTime = shiftStartTime;
        this.shiftEndTime = shiftEndTime;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getEmployeeCode() { return employeeCode; }
    public void setEmployeeCode(String employeeCode) { this.employeeCode = employeeCode; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public LocalDate getHireDate() { return hireDate; }
    public void setHireDate(LocalDate hireDate) { this.hireDate = hireDate; }

    public String getContractType() { return contractType; }
    public void setContractType(String contractType) { this.contractType = contractType; }

    public String getWarehouseRole() { return warehouseRole; }
    public void setWarehouseRole(String warehouseRole) { this.warehouseRole = warehouseRole; }

    public String getWorkStatus() { return workStatus; }
    public void setWorkStatus(String workStatus) { this.workStatus = workStatus; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public Boolean getEnabled() { return enabled; }
    public void setEnabled(Boolean enabled) { this.enabled = enabled; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }

    public java.util.List<String> getRoles() { return roles; }
    public void setRoles(java.util.List<String> roles) { this.roles = roles; }

    public String getShiftStartTime() { return shiftStartTime; }
    public void setShiftStartTime(String shiftStartTime) { this.shiftStartTime = shiftStartTime; }

    public String getShiftEndTime() { return shiftEndTime; }
    public void setShiftEndTime(String shiftEndTime) { this.shiftEndTime = shiftEndTime; }

    public java.time.LocalDateTime getLastActiveAt() { return lastActiveAt; }
    public void setLastActiveAt(java.time.LocalDateTime lastActiveAt) { this.lastActiveAt = lastActiveAt; }
}