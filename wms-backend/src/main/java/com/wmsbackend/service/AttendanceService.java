package com.wmsbackend.service;

import com.wmsbackend.entity.Attendance;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface AttendanceService {
    Attendance checkIn(String username, String reason, String qrToken);
    Attendance checkOut(String username);
    Attendance approveAttendance(Long id, String approvalStatus, String managerNote, String approverUsername);
    Attendance getTodayAttendance(String username);
    List<Attendance> getAllToday();
    List<Attendance> getAllAttendance(LocalDate start, LocalDate end);
    org.springframework.data.domain.Page<Attendance> getAllAttendancePaginated(LocalDate start, LocalDate end, org.springframework.data.domain.Pageable pageable);
    List<Attendance> getStaffHistory(String username);
    org.springframework.data.domain.Page<Attendance> getStaffHistoryPaginated(String username, org.springframework.data.domain.Pageable pageable);
    Map<String, Object> getAttendanceStats(String username);
}