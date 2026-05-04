// ===== Staff.java (cập nhật — thêm trường đăng nhập + ManyToMany Roles) =====
package com.wmsbackend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "Staff")
@Getter @Setter
@NoArgsConstructor
public class Staff {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // ── Thông tin cá nhân ──────────────────────────────────
    @Column(name = "EmployeeCode", unique = true, nullable = false)
    private String employeeCode;

    @Column(name = "FullName", nullable = false)
    private String fullName;

    @Column(name = "Gender")
    private String gender = "MALE";

    @Column(name = "DateOfBirth")
    private LocalDate dateOfBirth;

    @Column(name = "Phone")
    private String phone;

    @Column(name = "Email")
    private String email;

    @Column(name = "HireDate")
    private LocalDate hireDate;

    @Column(name = "ContractType")
    private String contractType = "FULL_TIME";

    @Column(name = "WarehouseRole")
    private String warehouseRole = "INBOUND_STAFF";

    @Column(name = "WorkStatus")
    private String workStatus = "OFF_SHIFT";

    @Column(name = "Notes")
    private String notes;

    @Column(name = "CreatedAt", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    // ── Trường đăng nhập (mới thêm) ───────────────────────
    @Column(name = "Username", unique = true, length = 100)
    private String username;

    @Column(name = "Password", length = 255)
    private String password;   // BCrypt hash

    @Column(name = "Enabled")
    private Boolean enabled = true;

    // ── Phân quyền (Many-to-Many với Roles) ───────────────
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "Staff_Roles",
            joinColumns        = @JoinColumn(name = "StaffId"),
            inverseJoinColumns = @JoinColumn(name = "RoleId")
    )
    private Set<Role> roles = new HashSet<>();
}