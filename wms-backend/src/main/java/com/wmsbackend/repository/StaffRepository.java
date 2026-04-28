package com.wmsbackend.repository;

import com.wmsbackend.dto.StaffDTO;
import com.wmsbackend.entity.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StaffRepository extends JpaRepository<Staff, Integer> {

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
