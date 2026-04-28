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

    @Query("SELECT new com.wmsbackend.dto.SupplierDTO(s.id, s.supplierCode, s.name, s.phone, s.address, s.totalImportQuantity) FROM Supplier s ORDER BY s.id DESC")
    List<SupplierDTO> findAllSuppliers();

    @Query("SELECT new com.wmsbackend.dto.SupplierDTO(s.id, s.supplierCode, s.name, s.phone, s.address, s.totalImportQuantity) FROM Supplier s " +
            "WHERE LOWER(s.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(s.supplierCode) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(s.phone) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(s.address) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "ORDER BY s.id DESC")
    List<SupplierDTO> searchSuppliers(@Param("keyword") String keyword);
}