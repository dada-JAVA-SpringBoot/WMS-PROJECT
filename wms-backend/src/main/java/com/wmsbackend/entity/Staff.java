package com.wmsbackend.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "Staff")
public class Staff {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "EmployeeCode", unique = true, nullable = false)
    private String employeeCode;

    @Column(name = "FullName", nullable = false)
    private String fullName;

    @Column(name = "Gender")
    private String gender = "MALE"; // MALE | FEMALE

    @Column(name = "DateOfBirth")
    private LocalDate dateOfBirth;

    @Column(name = "Phone")
    private String phone;

    @Column(name = "Email")
    private String email;

    @Column(name = "HireDate")
    private LocalDate hireDate;

    @Column(name = "ContractType")
    private String contractType = "FULL_TIME"; // FULL_TIME | PART_TIME | PROBATION | INTERN

    @Column(name = "WarehouseRole")
    private String warehouseRole = "INBOUND_STAFF";
    // WAREHOUSE_MANAGER | WAREHOUSE_KEEPER | INBOUND_STAFF | OUTBOUND_STAFF | INVENTORY_CHECKER

    @Column(name = "WorkStatus")
    private String workStatus = "OFF_SHIFT"; // ON_SHIFT | OFF_SHIFT | RESIGNED

    @Column(name = "Notes")
    private String notes;

    @Column(name = "CreatedAt", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    // ── Getters & Setters ──────────────────────────────────

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

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}