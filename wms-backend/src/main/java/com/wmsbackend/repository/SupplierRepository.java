// ===== SupplierRepository.java =====
package com.wmsbackend.repository;

import com.wmsbackend.dto.SupplierDTO;
import com.wmsbackend.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Integer> {

    @Query("SELECT new com.wmsbackend.dto.SupplierDTO(s.id, s.supplierCode, s.name, s.phone, s.address, " +
            "CAST((SELECT COALESCE(SUM(iod.quantityReceived), 0) FROM InboundOrderDetail iod " +
            "JOIN InboundOrder io ON iod.inboundOrderId = io.id WHERE io.supplierId = s.id) AS java.lang.Integer)) " +
            "FROM Supplier s " +
            "WHERE (:companyId IS NULL OR s.companyId = :companyId) ORDER BY s.id DESC")
    List<SupplierDTO> findAllSuppliers(@Param("companyId") Integer companyId);

    @Query("SELECT new com.wmsbackend.dto.SupplierDTO(s.id, s.supplierCode, s.name, s.phone, s.address, " +
            "CAST((SELECT COALESCE(SUM(iod.quantityReceived), 0) FROM InboundOrderDetail iod " +
            "JOIN InboundOrder io ON iod.inboundOrderId = io.id WHERE io.supplierId = s.id) AS java.lang.Integer)) " +
            "FROM Supplier s " +
            "WHERE ((LOWER(s.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(s.supplierCode) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(s.phone) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(s.address) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "AND (:companyId IS NULL OR s.companyId = :companyId)) " +
            "ORDER BY s.id DESC")
    List<SupplierDTO> searchSuppliers(@Param("keyword") String keyword, @Param("companyId") Integer companyId);
}
