package com.wmsbackend.repository;

import com.wmsbackend.entity.InboundOrder;
import com.wmsbackend.entity.InboundOrderDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InboundOrderRepository extends JpaRepository<InboundOrder, Long> {

    @Query("SELECT o FROM InboundOrder o WHERE (:companyId IS NULL OR o.companyId = :companyId)")
    Page<InboundOrder> findAllByCompanyId(@Param("companyId") Integer companyId, Pageable pageable);

    // ── Đếm theo status ───────────────────────────────────────────────────
    List<InboundOrder> findByStatus(String status);
    List<InboundOrder> findByStatusIn(List<String> statuses);
    long countByStatus(String status);
    long countByStatusIn(List<String> statuses);
    long countByStatusAndCompanyId(String status, Integer companyId);
    long countByStatusInAndCompanyId(List<String> statuses, Integer companyId);

    /** Lấy chi tiết của một phiếu nhập */
    @Query("SELECT d FROM InboundOrderDetail d WHERE d.inboundOrderId = :orderId")
    List<InboundOrderDetail> findDetailsByOrderId(@Param("orderId") Long orderId);

    /** Lấy chi tiết của nhiều phiếu nhập */
    @Query("SELECT d FROM InboundOrderDetail d WHERE d.inboundOrderId IN :orderIds")
    List<InboundOrderDetail> findDetailsByOrderIdIn(@Param("orderIds") List<Long> orderIds);

    /** Lấy phiếu nhập COMPLETED trong khoảng ngày — không load toàn bộ bảng */
    @Query("SELECT o FROM InboundOrder o WHERE o.status = 'COMPLETED' " +
            "AND (:companyId IS NULL OR o.companyId = :companyId) " +
            "AND o.receiptDate >= :startDate AND o.receiptDate < :endDate")
    List<InboundOrder> findCompletedOrdersInRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("companyId") Integer companyId);

    // ════════════════════════════════════════════════════════════════════════
    // FINANCIAL STATISTICS — COST QUERIES
    // ════════════════════════════════════════════════════════════════════════

    /**
     * Tổng chi phí nhập hàng theo khoảng ngày.
     * Dùng cho tab "Thống kê từ ngày đến ngày".
     */
    @Query("""
            SELECT COALESCE(SUM(o.totalAmount), 0)
            FROM InboundOrder o
            WHERE o.status = 'COMPLETED'
              AND (:companyId IS NULL OR o.companyId = :companyId)
              AND o.receiptDate >= :startDate
              AND o.receiptDate <  :endDate
            """)
    BigDecimal sumCostByDateRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate")   LocalDateTime endDate,
            @Param("companyId") Integer companyId
    );

    /**
     * Chi phí từng NGÀY trong khoảng ngày.
     * Returns: Object[]{ date(LocalDate), totalCost(BigDecimal) }
     */
    @Query("""
            SELECT CAST(o.receiptDate AS LocalDate), COALESCE(SUM(o.totalAmount), 0)
            FROM InboundOrder o
            WHERE o.status = 'COMPLETED'
              AND (:companyId IS NULL OR o.companyId = :companyId)
              AND o.receiptDate >= :startDate
              AND o.receiptDate <  :endDate
            GROUP BY CAST(o.receiptDate AS LocalDate)
            ORDER BY CAST(o.receiptDate AS LocalDate)
            """)
    List<Object[]> sumCostGroupByDayInRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate")   LocalDateTime endDate,
            @Param("companyId") Integer companyId
    );

    /**
     * Chi phí từng THÁNG trong một năm.
     * Returns: Object[]{ month(Integer 1-12), totalCost(BigDecimal) }
     */
    @Query("""
            SELECT MONTH(o.receiptDate), COALESCE(SUM(o.totalAmount), 0)
            FROM InboundOrder o
            WHERE o.status = 'COMPLETED'
              AND (:companyId IS NULL OR o.companyId = :companyId)
              AND YEAR(o.receiptDate) = :year
            GROUP BY MONTH(o.receiptDate)
            ORDER BY MONTH(o.receiptDate)
            """)
    List<Object[]> sumCostGroupByMonthInYear(@Param("year") int year, @Param("companyId") Integer companyId);

    /**
     * Chi phí từng NĂM trong khoảng năm.
     * Returns: Object[]{ year(Integer), totalCost(BigDecimal) }
     */
    @Query("""
            SELECT YEAR(o.receiptDate), COALESCE(SUM(o.totalAmount), 0)
            FROM InboundOrder o
            WHERE o.status = 'COMPLETED'
              AND (:companyId IS NULL OR o.companyId = :companyId)
              AND YEAR(o.receiptDate) >= :fromYear
              AND YEAR(o.receiptDate) <= :toYear
            GROUP BY YEAR(o.receiptDate)
            ORDER BY YEAR(o.receiptDate)
            """)
    List<Object[]> sumCostGroupByYear(
            @Param("fromYear") int fromYear,
            @Param("toYear")   int toYear,
            @Param("companyId") Integer companyId
    );
}
