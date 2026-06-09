// ===== StaffRepository.java =====
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

    // ── Queries cập nhật ──────────────────────────────────
    @Query("SELECT s FROM Staff s WHERE (:companyId IS NULL OR s.companyId = :companyId) ORDER BY s.id DESC")
    List<Staff> findAllByCompanyId(@Param("companyId") Integer companyId);

    @Query("SELECT s FROM Staff s WHERE (" +
            "LOWER(s.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(s.employeeCode) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(s.phone) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(s.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(s.warehouseRole) LIKE LOWER(CONCAT('%', :keyword, '%'))" +
            ") AND (:companyId IS NULL OR s.companyId = :companyId) " +
            "ORDER BY s.id DESC")
    List<Staff> searchStaffByCompany(@Param("keyword") String keyword, @Param("companyId") Integer companyId);

    long countByCompanyId(Integer companyId);
}