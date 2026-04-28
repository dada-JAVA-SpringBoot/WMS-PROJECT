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

    public StaffDTO() {}

    public StaffDTO(Integer id, String employeeCode, String fullName, String gender,
                    LocalDate dateOfBirth, String phone, String email, LocalDate hireDate,
                    String contractType, String warehouseRole, String workStatus, String notes) {
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
}