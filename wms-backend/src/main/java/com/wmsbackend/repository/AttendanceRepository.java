package com.wmsbackend.repository;

import com.wmsbackend.entity.Attendance;
import com.wmsbackend.entity.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    Optional<Attendance> findByStaffAndWorkDate(Staff staff, LocalDate workDate);
    Optional<Attendance> findByStaffAndWorkDateAndCompanyId(Staff staff, LocalDate workDate, Integer companyId);
    List<Attendance> findByWorkDate(LocalDate date);
    List<Attendance> findByWorkDateAndCompanyId(LocalDate date, Integer companyId);
    
    // Pagination support
    Page<Attendance> findAll(Pageable pageable);
    Page<Attendance> findByCompanyId(Integer companyId, Pageable pageable);
    Page<Attendance> findByStaff(Staff staff, Pageable pageable);
    
    List<Attendance> findByWorkDateBetween(LocalDate start, LocalDate end);
    List<Attendance> findByWorkDateBetweenAndCompanyId(LocalDate start, LocalDate end, Integer companyId);
    List<Attendance> findByStaffOrderByWorkDateDesc(Staff staff);
    List<Attendance> findByStaffAndCompanyIdOrderByWorkDateDesc(Staff staff, Integer companyId);
    List<Attendance> findByCompanyIdOrderByWorkDateDesc(Integer companyId);

    @Query("SELECT a FROM Attendance a WHERE (:companyId IS NULL OR a.companyId = :companyId) ORDER BY a.workDate DESC, a.checkInTime DESC")
    List<Attendance> findAllByCompanyScope(@Param("companyId") Integer companyId);

    @Query("SELECT a FROM Attendance a WHERE (:companyId IS NULL OR a.companyId = :companyId)")
    Page<Attendance> findAllByCompanyScope(@Param("companyId") Integer companyId, Pageable pageable);
}
