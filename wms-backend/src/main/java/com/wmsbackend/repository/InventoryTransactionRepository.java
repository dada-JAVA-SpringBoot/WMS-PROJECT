package com.wmsbackend.repository;

import com.wmsbackend.entity.InventoryTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, Long> {

    // ── Dòng chảy hàng hóa theo ngày (Dashboard chart) ────────────────────
    // Trả về: [date (String yyyy-MM-dd), transactionType, totalQuantity]
    @Query("SELECT CAST(t.createdAt AS date), t.transactionType, COALESCE(SUM(t.quantityChange), 0) " +
            "FROM InventoryTransaction t " +
            "WHERE t.createdAt >= :startDate AND t.createdAt < :endDate " +
            "GROUP BY CAST(t.createdAt AS date), t.transactionType " +
            "ORDER BY CAST(t.createdAt AS date)")
    List<Object[]> findDailyFlow(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    // ── Tổng nhập theo sản phẩm trong kỳ ──────────────────────────────────
    // Trả về: [productId, totalInbound]
    @Query("SELECT t.productId, COALESCE(SUM(t.quantityChange), 0) " +
            "FROM InventoryTransaction t " +
            "WHERE t.transactionType = 'INBOUND' " +
            "AND t.createdAt >= :startDate AND t.createdAt < :endDate " +
            "GROUP BY t.productId")
    List<Object[]> sumInboundByProductInPeriod(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    // ── Tổng xuất theo sản phẩm trong kỳ ──────────────────────────────────
    // Trả về: [productId, totalOutbound]
    @Query("SELECT t.productId, COALESCE(SUM(t.quantityChange), 0) " +
            "FROM InventoryTransaction t " +
            "WHERE t.transactionType = 'OUTBOUND' " +
            "AND t.createdAt >= :startDate AND t.createdAt < :endDate " +
            "GROUP BY t.productId")
    List<Object[]> sumOutboundByProductInPeriod(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
}
