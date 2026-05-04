// ===== Role.java =====
package com.wmsbackend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "Roles")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "RoleName", unique = true, nullable = false, length = 50)
    private String roleName; // ADMIN, MANAGER, STOREKEEPER, INBOUND_STAFF, OUTBOUND_STAFF, CHECKER

    @Column(name = "Description")
    private String description;
}