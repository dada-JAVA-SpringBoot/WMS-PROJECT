// ===== StaffRepository.java (cập nhật — thêm các method cần cho auth) =====
package com.wmsbackend.repository;

import com.wmsbackend.dto.StaffDTO;
import com.wmsbackend.entity.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StaffRepository extends JpaRepository<Staff, Integer> {

    // ── Auth ──────────────────────────────────────────────
    Optional<Staff> findByUsername(String username);
    boolean existsByUsername(String username);
    boolean existsByEmployeeCode(String employeeCode);

    // ── Queries hiện tại (giữ nguyên) ─────────────────────
    @Query("SELECT new com.wmsbackend.dto.StaffDTO(s.id, s.employeeCode, s.fullName, s.gender, " +
            "s.dateOfBirth, s.phone, s.email, s.hireDate, s.contractType, s.warehouseRole, s.workStatus, s.notes) " +
            "FROM Staff s ORDER BY s.id DESC")
    List<StaffDTO> findAllStaff();

    @Query("SELECT new com.wmsbackend.dto.StaffDTO(s.id, s.employeeCode, s.fullName, s.gender, " +
            "s.dateOfBirth, s.phone, s.email, s.hireDate, s.contractType, s.warehouseRole, s.workStatus, s.notes) " +
            "FROM Staff s WHERE " +
            "LOWER(s.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(s.employeeCode) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(s.phone) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(s.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(s.warehouseRole) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "ORDER BY s.id DESC")
    List<StaffDTO> searchStaff(@Param("keyword") String keyword);
}