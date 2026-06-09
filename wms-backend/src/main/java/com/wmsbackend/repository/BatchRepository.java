package com.wmsbackend.repository;

import com.wmsbackend.entity.Batch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BatchRepository extends JpaRepository<Batch, Integer> {

    List<Batch> findByProductId(Integer productId);
    Optional<Batch> findByProductIdAndBatchCode(Integer productId, String batchCode);

    // ── Lô hàng sắp hết hạn (còn tồn kho) ────────────────────────────────
    // Trả về: [productName, sku, batchCode, expiryDate, totalQty]
    @Query("SELECT p.name, p.sku, b.batchCode, b.expiryDate, COALESCE(SUM(i.quantityOnHand), 0) " +
            "FROM Batch b " +
            "JOIN Product p ON b.productId = p.id " +
            "JOIN Inventory i ON i.batchId = b.id AND i.productId = p.id " +
            "WHERE (:companyId IS NULL OR b.companyId = :companyId) " +
            "AND (:companyId IS NULL OR p.companyId = :companyId) " +
            "AND (:companyId IS NULL OR i.companyId = :companyId) " +
            "AND b.expiryDate <= :thresholdDate AND b.expiryDate >= :today " +
            "GROUP BY p.name, p.sku, b.batchCode, b.expiryDate " +
            "HAVING SUM(i.quantityOnHand) > 0 " +
            "ORDER BY b.expiryDate ASC")
    List<Object[]> findNearExpiryBatchesWithStock(
            @Param("today") LocalDate today,
            @Param("thresholdDate") LocalDate thresholdDate,
            @Param("companyId") Integer companyId);
}
