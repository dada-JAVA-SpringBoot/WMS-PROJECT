package com.wmsbackend.repository;

import com.wmsbackend.entity.Inventory;
import com.wmsbackend.dto.InventoryDetailDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import jakarta.persistence.LockModeType;

import java.util.List;
import java.util.Collection;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    // Câu lệnh này tương đương với:
    // SELECT loc.BinCode, b.BatchCode, b.ExpiryDate, i.QuantityOnHand, i.QuantityAllocated
    // FROM Inventory i JOIN Locations loc JOIN Batches b WHERE i.ProductId = ?
    Inventory findByProductIdAndLocationIdAndBatchId(Integer productId, Integer locationId, Integer batchId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT i FROM Inventory i WHERE i.productId = :productId AND i.locationId = :locationId AND i.batchId = :batchId")
    Optional<Inventory> findAndLockByProductIdAndLocationIdAndBatchId(
            @Param("productId") Integer productId, 
            @Param("locationId") Integer locationId, 
            @Param("batchId") Integer batchId
    );

    @Query("SELECT i FROM Inventory i JOIN Location l ON i.locationId = l.id WHERE l.zone = :zone")
    List<Inventory> findByLocationZone(@Param("zone") String zone);

    List<Inventory> findByLocationIdIn(Collection<Integer> locationIds);

    @Query("SELECT COUNT(DISTINCT i.locationId) FROM Inventory i WHERE i.quantityOnHand > 0")
    long countDistinctLocationId();

    @Query("SELECT new com.wmsbackend.dto.InventoryDetailDTO(p.id, i.locationId, i.batchId, l.binCode, b.batchCode, b.expiryDate, i.quantityOnHand, i.quantityAllocated, p.name, p.sku) " +
            "FROM Inventory i " +
            "JOIN Location l ON i.locationId = l.id " +
            "JOIN Batch b ON i.batchId = b.id " +
            "JOIN Product p ON i.productId = p.id " +
            "WHERE i.productId = :productId " +
            "ORDER BY b.expiryDate ASC") // Ưu tiên xếp lô cận Date lên đầu
    List<InventoryDetailDTO> findInventoryDetailsByProductId(@Param("productId") Integer productId);

    @Query("SELECT new com.wmsbackend.dto.InventoryDetailDTO(p.id, i.locationId, i.batchId, l.binCode, b.batchCode, b.expiryDate, i.quantityOnHand, i.quantityAllocated, p.name, p.sku) " +
            "FROM Inventory i " +
            "JOIN Location l ON i.locationId = l.id " +
            "JOIN Batch b ON i.batchId = b.id " +
            "JOIN Product p ON i.productId = p.id " +
            "WHERE i.locationId = :locationId")
    List<InventoryDetailDTO> findInventoryDetailsByLocationId(@Param("locationId") Integer locationId);

    // ── Dashboard queries ──────────────────────────────────────────────────

    @Query("SELECT COALESCE(SUM(i.quantityOnHand), 0) FROM Inventory i")
    java.math.BigDecimal sumTotalQuantityOnHand();

    @Query("SELECT pc.name, COALESCE(SUM(i.quantityOnHand), 0) " +
            "FROM Inventory i " +
            "JOIN Product p ON i.productId = p.id " +
            "JOIN ProductCategory pc ON p.categoryId = pc.id " +
            "GROUP BY pc.name " +
            "ORDER BY SUM(i.quantityOnHand) DESC")
    List<Object[]> findStockByCategory();

    @Query("SELECT p.id, p.sku, p.name, COALESCE(SUM(i.quantityOnHand), 0) " +
            "FROM Inventory i " +
            "JOIN Product p ON i.productId = p.id " +
            "GROUP BY p.id, p.sku, p.name " +
            "ORDER BY SUM(i.quantityOnHand) DESC")
    List<Object[]> findTopStockProducts();

    @Query("SELECT p.id, p.sku, p.name, COALESCE(SUM(i.quantityOnHand), 0) " +
            "FROM Inventory i " +
            "JOIN Product p ON i.productId = p.id " +
            "GROUP BY p.id, p.sku, p.name " +
            "HAVING SUM(i.quantityOnHand) > 0")
    List<Object[]> findProductsWithStock();
}
