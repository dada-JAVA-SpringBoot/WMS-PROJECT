package com.wmsbackend.repository;

import com.wmsbackend.entity.InboundOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InboundOrderRepository extends JpaRepository<InboundOrder, Long> {

    // ── Đếm theo status (đã có từ StatisticalController) ─────────────────
    List<InboundOrder> findByStatusIn(List<String> statuses);
    long countByStatus(String status);

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
              AND o.receiptDate >= :startDate
              AND o.receiptDate <  :endDate
            """)
    BigDecimal sumCostByDateRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate")   LocalDateTime endDate
    );

    /**
     * Chi phí từng NGÀY trong khoảng ngày.
     * Returns: Object[]{ date(LocalDate), totalCost(BigDecimal) }
     * Dùng cho tab "Thống kê từng ngày" và "Thống kê từ ngày đến ngày".
     */
    @Query("""
            SELECT CAST(o.receiptDate AS LocalDate), COALESCE(SUM(o.totalAmount), 0)
            FROM InboundOrder o
            WHERE o.status = 'COMPLETED'
              AND o.receiptDate >= :startDate
              AND o.receiptDate <  :endDate
            GROUP BY CAST(o.receiptDate AS LocalDate)
            ORDER BY CAST(o.receiptDate AS LocalDate)
            """)
    List<Object[]> sumCostGroupByDayInRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate")   LocalDateTime endDate
    );

    /**
     * Chi phí từng THÁNG trong một năm.
     * Returns: Object[]{ month(Integer 1-12), totalCost(BigDecimal) }
     * Dùng cho tab "Thống kê từng tháng trong năm".
     */
    @Query("""
            SELECT MONTH(o.receiptDate), COALESCE(SUM(o.totalAmount), 0)
            FROM InboundOrder o
            WHERE o.status = 'COMPLETED'
              AND YEAR(o.receiptDate) = :year
            GROUP BY MONTH(o.receiptDate)
            ORDER BY MONTH(o.receiptDate)
            """)
    List<Object[]> sumCostGroupByMonthInYear(@Param("year") int year);

    /**
     * Chi phí từng NĂM trong khoảng năm.
     * Returns: Object[]{ year(Integer), totalCost(BigDecimal) }
     * Dùng cho tab "Thống kê theo năm".
     */
    @Query("""
            SELECT YEAR(o.receiptDate), COALESCE(SUM(o.totalAmount), 0)
            FROM InboundOrder o
            WHERE o.status = 'COMPLETED'
              AND YEAR(o.receiptDate) >= :fromYear
              AND YEAR(o.receiptDate) <= :toYear
            GROUP BY YEAR(o.receiptDate)
            ORDER BY YEAR(o.receiptDate)
            """)
    List<Object[]> sumCostGroupByYear(
            @Param("fromYear") int fromYear,
            @Param("toYear")   int toYear
    );
}
