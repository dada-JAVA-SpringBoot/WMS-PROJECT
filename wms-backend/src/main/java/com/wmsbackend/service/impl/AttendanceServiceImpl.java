package com.wmsbackend.service.impl;

import com.wmsbackend.entity.Attendance;
import com.wmsbackend.entity.Staff;
import com.wmsbackend.entity.WorkShift;
import com.wmsbackend.repository.AttendanceRepository;
import com.wmsbackend.repository.StaffRepository;
import com.wmsbackend.repository.WorkShiftRepository;
import com.wmsbackend.repository.CompanyRepository;
import com.wmsbackend.service.AttendanceService;
import com.wmsbackend.security.WorkspaceContext;
import com.wmsbackend.util.TimeUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
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
    @Autowired private CompanyRepository companyRepository;

    private boolean isHQContext() {
        Integer companyId = WorkspaceContext.getCurrentCompanyId();
        if (companyId == null) return true;
        return companyRepository.findById(companyId)
                .map(c -> c.getParentCompanyId() == null)
                .orElse(false);
    }

    private WorkShift resolveShift(Integer companyId) {
        if (companyId != null) {
            return workShiftRepository.findFirstByCompanyIdOrderByIdAsc(companyId)
                    .or(() -> workShiftRepository.findFirstByCompanyIdIsNullOrderByIdAsc())
                    .orElse(null);
        }
        return workShiftRepository.findFirstByCompanyIdIsNullOrderByIdAsc()
                .or(() -> workShiftRepository.findAll().stream().findFirst())
                .orElse(null);
    }

    @Value("${jwt.secret}")
    private String jwtSecret;

    private void validateQrToken(String qrToken) {
        if (qrToken == null || !qrToken.contains(":")) {
            throw new RuntimeException("Mã QR không hợp lệ!");
        }
        try {
            String[] parts = qrToken.split(":");
            long timestamp = Long.parseLong(parts[0]);
            String receivedHmac = parts[1];

            // 1. Kiểm tra thời gian (10 giây)
            long now = System.currentTimeMillis();
            if (Math.abs(now - timestamp) > 10000) {
                throw new RuntimeException("Mã QR đã hết hạn! Vui lòng quét mã mới.");
            }

            // 2. Kiểm tra chữ ký (HMAC-SHA256)
            String data = String.valueOf(timestamp);
            javax.crypto.spec.SecretKeySpec secretKey = new javax.crypto.spec.SecretKeySpec(
                    jwtSecret.getBytes(java.nio.charset.StandardCharsets.UTF_8), "HmacSHA256");
            javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA256");
            mac.init(secretKey);
            byte[] hmacBytes = mac.doFinal(data.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            
            StringBuilder sb = new StringBuilder();
            for (byte b : hmacBytes) {
                sb.append(String.format("%02x", b));
            }
            String calculatedHmac = sb.toString();

            if (!calculatedHmac.equalsIgnoreCase(receivedHmac)) {
                throw new RuntimeException("Mã QR không hợp lệ (Sai chữ ký)!");
            }
        } catch (Exception e) {
            if (e instanceof RuntimeException) throw (RuntimeException) e;
            throw new RuntimeException("Lỗi xác thực mã QR: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public Attendance checkIn(String username, String reason, String qrToken) {
        // Validate QR Token
        validateQrToken(qrToken);

        Staff staff = staffRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (staff.getRoles().stream().anyMatch(r -> "ADMIN".equals(r.getRoleName()))) {
            return null;
        }

        LocalDate today = TimeUtils.now().toLocalDate();
        Integer companyId = staff.getCompanyId();
        if (attendanceRepository.findByStaffAndWorkDateAndCompanyId(staff, today, companyId).isPresent()) {
            throw new RuntimeException("Bạn đã check-in hôm nay rồi!");
        }

        Attendance attendance = new Attendance();
        attendance.setStaff(staff);
        attendance.setCompanyId(companyId);
        attendance.setWorkDate(today);
        attendance.setCheckInTime(TimeUtils.now());
        attendance.setLateReason(reason);
        
        WorkShift shift = resolveShift(companyId);
        
        if (shift != null) {
            LocalTime nowTime = TimeUtils.now().toLocalTime();
            if (nowTime.isAfter(shift.getStartTime().plusMinutes(shift.getGracePeriodMinutes()))) {
                long late = Duration.between(shift.getStartTime(), nowTime).toMinutes();
                attendance.setLateMinutes((int) late);
                attendance.setStatus("LATE");
                attendance.setApprovalStatus("APPROVED"); // Tự động duyệt, quản lý chỉ xem lịch sử
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

        if (!WorkspaceContext.isGlobalAdmin() && !isHQContext()) {
            Integer currentCompanyId = WorkspaceContext.getCurrentCompanyId();
            if (currentCompanyId != null && attendance.getCompanyId() != null
                    && !currentCompanyId.equals(attendance.getCompanyId())) {
                throw new RuntimeException("Không có quyền duyệt chấm công của công ty khác");
            }
        }

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
                .orElseGet(() -> attendanceRepository.findByStaffAndWorkDateAndCompanyId(staff, TimeUtils.now().toLocalDate(), staff.getCompanyId()).orElse(null));
        if (attendance == null) {
            throw new RuntimeException("Bạn chưa check-in!");
        }

        if (!WorkspaceContext.isGlobalAdmin() && !isHQContext()) {
            Integer currentCompanyId = WorkspaceContext.getCurrentCompanyId();
            if (currentCompanyId != null && attendance.getCompanyId() != null
                    && !currentCompanyId.equals(attendance.getCompanyId())) {
                throw new RuntimeException("Không có quyền thao tác chấm công của công ty khác");
            }
        }

        if (attendance.getCheckOutTime() != null) {
            throw new RuntimeException("Bạn đã check-out rồi!");
        }

        attendance.setCheckOutTime(TimeUtils.now());
        
        WorkShift shift = resolveShift(staff.getCompanyId());
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
        return attendanceRepository.findByStaffAndWorkDateAndCompanyId(staff, TimeUtils.now().toLocalDate(), staff.getCompanyId()).orElse(null);
    }

    @Override
    public List<Attendance> getAllToday() {
        Integer companyId = WorkspaceContext.getCurrentCompanyId();
        if (isHQContext()) return attendanceRepository.findByWorkDate(TimeUtils.now().toLocalDate());
        return attendanceRepository.findByWorkDateAndCompanyId(TimeUtils.now().toLocalDate(), companyId);
    }

    @Override
    public List<Attendance> getAllAttendance(LocalDate start, LocalDate end) {
        Integer companyId = WorkspaceContext.getCurrentCompanyId();
        boolean consolidated = isHQContext();
        if (start != null && end != null) {
            return consolidated
                    ? attendanceRepository.findByWorkDateBetween(start, end)
                    : attendanceRepository.findByWorkDateBetweenAndCompanyId(start, end, companyId);
        }
        return consolidated
                ? attendanceRepository.findAllByCompanyScope(null) // Sử dụng query có ORDER BY mặc định
                : attendanceRepository.findByCompanyIdOrderByWorkDateDesc(companyId);
    }

    @Override
    public org.springframework.data.domain.Page<Attendance> getAllAttendancePaginated(LocalDate start, LocalDate end, org.springframework.data.domain.Pageable pageable) {
        Integer companyId = WorkspaceContext.getCurrentCompanyId();
        boolean consolidated = isHQContext();
        // Đối với pagination, ta ưu tiên dùng query findAllByCompanyScope có Pageable
        return attendanceRepository.findAllByCompanyScope(consolidated ? null : companyId, pageable);
    }

    @Override
    public List<Attendance> getStaffHistory(String username) {
        Staff staff = staffRepository.findByUsername(username).orElseThrow();
        return attendanceRepository.findByStaffAndCompanyIdOrderByWorkDateDesc(staff, staff.getCompanyId());
    }

    @Override
    public org.springframework.data.domain.Page<Attendance> getStaffHistoryPaginated(String username, org.springframework.data.domain.Pageable pageable) {
        Staff staff = staffRepository.findByUsername(username).orElseThrow();
        return attendanceRepository.findByStaff(staff, pageable);
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
