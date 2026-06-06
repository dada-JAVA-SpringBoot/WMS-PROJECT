package com.wmsbackend.service.impl;

import com.wmsbackend.entity.Attendance;
import com.wmsbackend.entity.Staff;
import com.wmsbackend.entity.WorkShift;
import com.wmsbackend.repository.AttendanceRepository;
import com.wmsbackend.repository.StaffRepository;
import com.wmsbackend.repository.WorkShiftRepository;
import com.wmsbackend.service.AttendanceService;
import com.wmsbackend.util.TimeUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AttendanceServiceImpl implements AttendanceService {

    @Autowired private AttendanceRepository attendanceRepository;
    @Autowired private StaffRepository staffRepository;
    @Autowired private WorkShiftRepository workShiftRepository;

    @Override
    @Transactional
    public Attendance checkIn(String username, String reason) {
        Staff staff = staffRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (staff.getRoles().stream().anyMatch(r -> "ADMIN".equals(r.getRoleName()))) {
            return null;
        }

        LocalDate today = TimeUtils.now().toLocalDate();
        if (attendanceRepository.findByStaffAndWorkDate(staff, today).isPresent()) {
            throw new RuntimeException("Bạn đã check-in hôm nay rồi!");
        }

        Attendance attendance = new Attendance();
        attendance.setStaff(staff);
        attendance.setWorkDate(today);
        attendance.setCheckInTime(TimeUtils.now());
        attendance.setLateReason(reason);
        
        WorkShift shift = workShiftRepository.findAll().stream().findFirst().orElse(null);
        
        if (shift != null) {
            LocalTime nowTime = TimeUtils.now().toLocalTime();
            if (nowTime.isAfter(shift.getStartTime().plusMinutes(shift.getGracePeriodMinutes()))) {
                long late = Duration.between(shift.getStartTime(), nowTime).toMinutes();
                attendance.setLateMinutes((int) late);
                attendance.setStatus("LATE");
                attendance.setApprovalStatus("PENDING");
            } else {
                attendance.setStatus("PRESENT");
                attendance.setApprovalStatus("APPROVED");
            }
        } else {
            attendance.setStatus("PRESENT");
            attendance.setApprovalStatus("APPROVED");
        }

        staff.setWorkStatus("ON_SHIFT");
        staffRepository.save(staff);
        
        return attendanceRepository.save(attendance);
    }

    @Override
    @Transactional
    public Attendance approveAttendance(Long id, String status, String managerNote, String approverUsername) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bản ghi chấm công"));
        
        Staff approver = staffRepository.findByUsername(approverUsername)
                .orElseThrow(() -> new RuntimeException("Người duyệt không tồn tại"));

        if (attendance.getStaff().getUsername().equals(approverUsername)) {
            throw new RuntimeException("Bạn không thể tự duyệt chấm công của chính mình!");
        }

        boolean recordIsManager = attendance.getStaff().getRoles().stream()
                .anyMatch(r -> "MANAGER".equals(r.getRoleName()));
        boolean approverIsAdmin = approver.getRoles().stream()
                .anyMatch(r -> "ADMIN".equals(r.getRoleName()));

        if (recordIsManager && !approverIsAdmin) {
            throw new RuntimeException("Chỉ Quản trị viên (ADMIN) mới có quyền duyệt cho Quản lý (MANAGER)");
        }

        attendance.setApprovalStatus(status);
        attendance.setNote(managerNote);
        return attendanceRepository.save(attendance);
    }

    @Override
    @Transactional
    public Attendance checkOut(String username) {
        Staff staff = staffRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Attendance attendance = attendanceRepository.findByStaffAndWorkDate(staff, TimeUtils.now().toLocalDate())
                .orElseThrow(() -> new RuntimeException("Bạn chưa check-in!"));

        if (attendance.getCheckOutTime() != null) {
            throw new RuntimeException("Bạn đã check-out rồi!");
        }

        attendance.setCheckOutTime(TimeUtils.now());
        
        WorkShift shift = workShiftRepository.findAll().stream().findFirst().orElse(null);
        if (shift != null) {
            LocalTime nowTime = TimeUtils.now().toLocalTime();
            if (nowTime.isAfter(shift.getEndTime())) {
                long ot = Duration.between(shift.getEndTime(), nowTime).toMinutes();
                attendance.setOvertimeMinutes((int) ot);
            }
        }

        staff.setWorkStatus("OFF_SHIFT");
        staffRepository.save(staff);
        
        return attendanceRepository.save(attendance);
    }

    @Override
    public Attendance getTodayAttendance(String username) {
        Staff staff = staffRepository.findByUsername(username).orElseThrow();
        return attendanceRepository.findByStaffAndWorkDate(staff, TimeUtils.now().toLocalDate()).orElse(null);
    }

    @Override
    public List<Attendance> getAllToday() {
        return attendanceRepository.findByWorkDate(TimeUtils.now().toLocalDate());
    }

    @Override
    public List<Attendance> getAllAttendance(LocalDate start, LocalDate end) {
        if (start != null && end != null) {
            return attendanceRepository.findByWorkDateBetween(start, end);
        }
        return attendanceRepository.findAll();
    }

    @Override
    public List<Attendance> getStaffHistory(String username) {
        Staff staff = staffRepository.findByUsername(username).orElseThrow();
        return attendanceRepository.findByStaffOrderByWorkDateDesc(staff);
    }

    @Override
    public Map<String, Object> getAttendanceStats(String username) {
        List<Attendance> history = getStaffHistory(username);
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalDays", history.size());
        stats.put("lateDays", history.stream().filter(a -> "LATE".equals(a.getStatus())).count());
        stats.put("totalOT", history.stream().mapToInt(a -> a.getOvertimeMinutes()).sum());
        return stats;
    }
}
