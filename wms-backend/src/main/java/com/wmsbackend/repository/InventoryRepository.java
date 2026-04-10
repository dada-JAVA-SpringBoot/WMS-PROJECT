package com.wmsbackend.repository;

import com.wmsbackend.entity.Inventory;
import com.wmsbackend.dto.InventoryDetailDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    // Câu lệnh này tương đương với:
    // SELECT loc.BinCode, b.BatchCode, b.ExpiryDate, i.QuantityOnHand, i.QuantityAllocated
    // FROM Inventory i JOIN Locations loc JOIN Batches b WHERE i.ProductId = ?

    @Query("SELECT new com.wmsbackend.dto.InventoryDetailDTO(l.binCode, b.batchCode, b.expiryDate, i.quantityOnHand, i.quantityAllocated) " +
            "FROM Inventory i " +
            "JOIN Location l ON i.locationId = l.id " +
            "JOIN Batch b ON i.batchId = b.id " +
            "WHERE i.productId = :productId " +
            "ORDER BY b.expiryDate ASC") // Ưu tiên xếp lô cận Date lên đầu
    List<InventoryDetailDTO> findInventoryDetailsByProductId(@Param("productId") Integer productId);
}