package com.wmsbackend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "Attendance")
@Getter @Setter
@NoArgsConstructor
public class Attendance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "StaffId", nullable = false)
    private Staff staff;

    @Column(name = "CompanyId")
    private Integer companyId;

    @Column(name = "WorkDate", nullable = false)
    private LocalDate workDate;

    @Column(name = "CheckInTime")
    private LocalDateTime checkInTime;

    @Column(name = "CheckOutTime")
    private LocalDateTime checkOutTime;

    @Column(name = "LateMinutes")
    private Integer lateMinutes = 0;

    @Column(name = "OvertimeMinutes")
    private Integer overtimeMinutes = 0;

    @Column(name = "Status")
    private String status; // PRESENT, LATE, ABSENT, ON_LEAVE

    @Column(name = "LateReason")
    private String lateReason;

    @Column(name = "ApprovalStatus")
    private String approvalStatus; // PENDING, APPROVED, REJECTED

    @Column(name = "Note")
    private String note;
}
