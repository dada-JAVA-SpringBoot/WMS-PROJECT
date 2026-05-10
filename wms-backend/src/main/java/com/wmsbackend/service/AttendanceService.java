package com.wmsbackend.service;

import com.wmsbackend.entity.Attendance;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface AttendanceService {
    Attendance checkIn(String username, String reason);
    Attendance checkOut(String username);
    Attendance approveAttendance(Long id, String approvalStatus, String managerNote, String approverUsername);
    Attendance getTodayAttendance(String username);
    List<Attendance> getAllToday();
    List<Attendance> getAllAttendance(LocalDate start, LocalDate end);
    List<Attendance> getStaffHistory(String username);
    Map<String, Object> getAttendanceStats(String username);
}