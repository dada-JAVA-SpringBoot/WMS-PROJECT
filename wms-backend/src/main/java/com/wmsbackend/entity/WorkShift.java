package com.wmsbackend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.LocalTime;

@Entity
@Table(name = "WorkShifts")
@Getter @Setter
@NoArgsConstructor
public class WorkShift {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ShiftName", nullable = false)
    private String shiftName;

    @Column(name = "StartTime", nullable = false)
    private LocalTime startTime;

    @Column(name = "EndTime", nullable = false)
    private LocalTime endTime;

    @Column(name = "GracePeriodMinutes")
    private Integer gracePeriodMinutes = 15; // Thời gian cho phép trễ (phút)

    @Column(name = "CompanyId")
    private Integer companyId;
}
