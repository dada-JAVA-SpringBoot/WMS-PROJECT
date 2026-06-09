package com.wmsbackend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "CycleCountPlans")
@Data
@NoArgsConstructor
public class CycleCountPlan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "PlanCode", unique = true, nullable = false, length = 50)
    private String planCode;

    @Column(name = "Status", length = 20)
    private String status = "CREATED"; // CREATED, IN_PROGRESS, COMPLETED, CANCELED

    @Column(name = "CompanyId")
    private Integer companyId;

    @Column(name = "CreatedBy")
    private Integer createdBy;

    @Column(name = "AssignedTo")
    private Integer assignedTo;

    @Column(name = "ScheduledDate")
    private LocalDateTime scheduledDate;

    @Column(name = "CreatedAt", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "CompletedAt")
    private LocalDateTime completedAt;

    @Column(name = "Note", length = 500)
    private String note;
}
