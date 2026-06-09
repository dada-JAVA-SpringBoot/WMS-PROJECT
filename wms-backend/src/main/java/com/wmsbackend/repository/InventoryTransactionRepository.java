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
    @Query("SELECT CAST(t.createdAt AS date), t.transactionType, COALESCE(SUM(t.quantityChange), 0) " +
            "FROM InventoryTransaction t " +
            "WHERE (:companyId IS NULL OR t.companyId = :companyId) " +
            "AND t.createdAt >= :startDate AND t.createdAt < :endDate " +
            "GROUP BY CAST(t.createdAt AS date), t.transactionType " +
            "ORDER BY CAST(t.createdAt AS date)")
    List<Object[]> findDailyFlow(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("companyId") Integer companyId);

    // ── Tổng nhập theo sản phẩm trong kỳ ──────────────────────────────────
    @Query("SELECT t.productId, COALESCE(SUM(t.quantityChange), 0) " +
            "FROM InventoryTransaction t " +
            "WHERE t.transactionType = 'INBOUND' " +
            "AND (:companyId IS NULL OR t.companyId = :companyId) " +
            "AND t.createdAt >= :startDate AND t.createdAt < :endDate " +
            "GROUP BY t.productId")
    List<Object[]> sumInboundByProductInPeriod(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("companyId") Integer companyId);

    // ── Tổng xuất theo sản phẩm trong kỳ ──────────────────────────────────
    @Query("SELECT t.productId, COALESCE(SUM(t.quantityChange), 0) " +
            "FROM InventoryTransaction t " +
            "WHERE t.transactionType = 'OUTBOUND' " +
            "AND (:companyId IS NULL OR t.companyId = :companyId) " +
            "AND t.createdAt >= :startDate AND t.createdAt < :endDate " +
            "GROUP BY t.productId")
    List<Object[]> sumOutboundByProductInPeriod(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("companyId") Integer companyId);

    // ── Tổng điều chỉnh (ADJUSTMENT) theo sản phẩm trong kỳ ──────────────────
    @Query("SELECT t.productId, COALESCE(SUM(t.quantityChange), 0) " +
            "FROM InventoryTransaction t " +
            "WHERE t.transactionType = 'ADJUSTMENT' " +
            "AND (:companyId IS NULL OR t.companyId = :companyId) " +
            "AND t.createdAt >= :startDate AND t.createdAt < :endDate " +
            "GROUP BY t.productId")
    List<Object[]> sumAdjustmentsByProductInPeriod(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("companyId") Integer companyId);

    // ── Thống kê hao hụt (Shrinkage) ──────────────────────────────────
    @Query("SELECT t.productId, SUM(t.quantityChange) " +
            "FROM InventoryTransaction t " +
            "WHERE t.transactionType = 'ADJUSTMENT' " +
            "AND t.quantityChange < 0 " +
            "AND (:companyId IS NULL OR t.companyId = :companyId) " +
            "AND t.createdAt >= :startDate AND t.createdAt < :endDate " +
            "GROUP BY t.productId")
    List<Object[]> findNegativeAdjustmentsByProduct(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("companyId") Integer companyId);

    @Query("SELECT CAST(t.createdAt AS date), t.productId, SUM(t.quantityChange) " +
            "FROM InventoryTransaction t " +
            "WHERE t.transactionType = 'ADJUSTMENT' " +
            "AND t.quantityChange < 0 " +
            "AND (:companyId IS NULL OR t.companyId = :companyId) " +
            "AND t.createdAt >= :startDate AND t.createdAt < :endDate " +
            "GROUP BY CAST(t.createdAt AS date), t.productId")
    List<Object[]> findNegativeAdjustmentsByDay(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("companyId") Integer companyId);

    @Query("SELECT MONTH(t.createdAt), t.productId, SUM(t.quantityChange) " +
            "FROM InventoryTransaction t " +
            "WHERE t.transactionType = 'ADJUSTMENT' " +
            "AND t.quantityChange < 0 " +
            "AND (:companyId IS NULL OR t.companyId = :companyId) " +
            "AND YEAR(t.createdAt) = :year " +
            "GROUP BY MONTH(t.createdAt), t.productId")
    List<Object[]> findNegativeAdjustmentsByMonth(@Param("year") int year, @Param("companyId") Integer companyId);

    @Query("SELECT YEAR(t.createdAt), t.productId, SUM(t.quantityChange) " +
            "FROM InventoryTransaction t " +
            "WHERE t.transactionType = 'ADJUSTMENT' " +
            "AND t.quantityChange < 0 " +
            "AND (:companyId IS NULL OR t.companyId = :companyId) " +
            "AND YEAR(t.createdAt) >= :fromYear AND YEAR(t.createdAt) <= :toYear " +
            "GROUP BY YEAR(t.createdAt), t.productId")
    List<Object[]> findNegativeAdjustmentsByYear(
            @Param("fromYear") int fromYear,
            @Param("toYear") int toYear,
            @Param("companyId") Integer companyId);

    @Query("SELECT YEAR(t.createdAt), t.productId, SUM(t.quantityChange) " +
            "FROM InventoryTransaction t " +
            "WHERE t.transactionType = 'OUTBOUND' " +
            "AND (:companyId IS NULL OR t.companyId = :companyId) " +
            "AND YEAR(t.createdAt) >= :fromYear AND YEAR(t.createdAt) <= :toYear " +
            "GROUP BY YEAR(t.createdAt), t.productId")
    List<Object[]> sumOutboundQtyGroupByYear(
            @Param("fromYear") int fromYear,
            @Param("toYear") int toYear,
            @Param("companyId") Integer companyId);

    @Query("SELECT CAST(t.createdAt AS date), t.productId, SUM(t.quantityChange) " +
            "FROM InventoryTransaction t " +
            "WHERE t.transactionType = 'OUTBOUND' " +
            "AND (:companyId IS NULL OR t.companyId = :companyId) " +
            "AND t.createdAt >= :startDate AND t.createdAt < :endDate " +
            "GROUP BY CAST(t.createdAt AS date), t.productId")
    List<Object[]> sumOutboundQtyGroupByDay(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("companyId") Integer companyId);

    @Query("SELECT MONTH(t.createdAt), t.productId, SUM(t.quantityChange) " +
            "FROM InventoryTransaction t " +
            "WHERE t.transactionType = 'OUTBOUND' " +
            "AND (:companyId IS NULL OR t.companyId = :companyId) " +
            "AND YEAR(t.createdAt) = :year " +
            "GROUP BY MONTH(t.createdAt), t.productId")
    List<Object[]> sumOutboundQtyGroupByMonthInYear(@Param("year") int year, @Param("companyId") Integer companyId);

    // ── Lịch sử giao dịch chi tiết ─────────────────────────────────────────
    @Query("SELECT new com.wmsbackend.dto.InventoryTransactionDTO(" +
            "t.id, t.productId, p.name, p.sku, " +
            "t.locationId, l.binCode, l.zone, " +
            "t.batchId, b.batchCode, " +
            "t.transactionType, t.quantityChange, t.referenceId, " +
            "t.createdBy, s.fullName, t.createdAt) " +
            "FROM InventoryTransaction t " +
            "JOIN Product p ON p.id = t.productId " +
            "JOIN Location l ON l.id = t.locationId " +
            "JOIN Batch b ON b.id = t.batchId " +
            "LEFT JOIN Staff s ON s.id = t.createdBy " +
            "ORDER BY t.createdAt DESC")
    List<com.wmsbackend.dto.InventoryTransactionDTO> findAllDetailed();
}
