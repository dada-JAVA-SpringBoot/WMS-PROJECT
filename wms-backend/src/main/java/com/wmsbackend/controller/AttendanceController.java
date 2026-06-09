package com.wmsbackend.controller;

import com.wmsbackend.entity.Attendance;
import com.wmsbackend.security.JwtUtil;
import com.wmsbackend.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    @Autowired private AttendanceService attendanceService;
    @Autowired private JwtUtil jwtUtil;

    @PostMapping("/check-in")
    public ResponseEntity<?> checkIn(@RequestHeader("Authorization") String authHeader,
                                    @RequestBody(required = false) java.util.Map<String, String> body) {
        String username = jwtUtil.extractUsername(authHeader.substring(7));
        String reason = body != null ? body.get("reason") : null;
        String qrToken = body != null ? body.get("qrToken") : null;
        return ResponseEntity.ok(attendanceService.checkIn(username, reason, qrToken));
    }

    @PostMapping("/{id}/approve")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<?> approve(@PathVariable Long id, 
                                    @RequestBody java.util.Map<String, String> body,
                                    org.springframework.security.core.Authentication auth) {
        String status = body.get("status"); // APPROVED or REJECTED
        String note = body.get("note");
        String approverUsername = auth.getName();
        return ResponseEntity.ok(attendanceService.approveAttendance(id, status, note, approverUsername));
    }

    @PostMapping("/check-out")
    public ResponseEntity<?> checkOut(@RequestHeader("Authorization") String authHeader) {
        String username = jwtUtil.extractUsername(authHeader.substring(7));
        return ResponseEntity.ok(attendanceService.checkOut(username));
    }

    @GetMapping("/today")
    public ResponseEntity<?> getToday(@RequestHeader("Authorization") String authHeader) {
        String username = jwtUtil.extractUsername(authHeader.substring(7));
        return ResponseEntity.ok(attendanceService.getTodayAttendance(username));
    }

    @GetMapping("/history")
    public ResponseEntity<?> getHistory(@RequestHeader("Authorization") String authHeader,
                                      @RequestParam(defaultValue = "0") int page,
                                      @RequestParam(defaultValue = "20") int size) {
        String username = jwtUtil.extractUsername(authHeader.substring(7));
        if (page >= 0 && size > 0) {
            org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by("workDate").descending());
            return ResponseEntity.ok(attendanceService.getStaffHistoryPaginated(username, pageable));
        }
        return ResponseEntity.ok(attendanceService.getStaffHistory(username));
    }

    @GetMapping("/admin/all-today")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public List<Attendance> getAllToday() {
        return attendanceService.getAllToday();
    }

    @GetMapping("/admin/all")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<?> getAll(@RequestParam(required = false) String start,
                                  @RequestParam(required = false) String end,
                                  @RequestParam(defaultValue = "0") int page,
                                  @RequestParam(defaultValue = "20") int size) {
        java.time.LocalDate startDate = (start != null && !start.isBlank()) ? java.time.LocalDate.parse(start) : null;
        java.time.LocalDate endDate = (end != null && !end.isBlank()) ? java.time.LocalDate.parse(end) : null;
        
        // Nếu truyền page và size thì dùng pagination
        if (page >= 0 && size > 0) {
            org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by("workDate").descending().and(org.springframework.data.domain.Sort.by("checkInTime").descending()));
            return ResponseEntity.ok(attendanceService.getAllAttendancePaginated(startDate, endDate, pageable));
        }
        
        return ResponseEntity.ok(attendanceService.getAllAttendance(startDate, endDate));
    }
}