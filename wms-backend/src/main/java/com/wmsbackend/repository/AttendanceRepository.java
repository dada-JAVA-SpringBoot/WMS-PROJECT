package com.wmsbackend.repository;

import com.wmsbackend.entity.Attendance;
import com.wmsbackend.entity.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    Optional<Attendance> findByStaffAndWorkDate(Staff staff, LocalDate workDate);
    List<Attendance> findByWorkDate(LocalDate date);
    List<Attendance> findByWorkDateBetween(LocalDate start, LocalDate end);
    List<Attendance> findByStaffOrderByWorkDateDesc(Staff staff);
}