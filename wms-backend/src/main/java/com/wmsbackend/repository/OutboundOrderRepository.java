package com.wmsbackend.repository;

import com.wmsbackend.entity.OutboundOrder;
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
public interface OutboundOrderRepository extends JpaRepository<OutboundOrder, Long> {

    @Query("SELECT o FROM OutboundOrder o WHERE (:companyId IS NULL OR o.companyId = :companyId)")
    Page<OutboundOrder> findAllByCompanyId(@Param("companyId") Integer companyId, Pageable pageable);

    // ── Đếm theo status (đã có từ StatisticalController) ─────────────────
    long countByStatus(String status);
    long countByStatusIn(List<String> statuses);
    long countByStatusAndCompanyId(String status, Integer companyId);
    long countByStatusInAndCompanyId(List<String> statuses, Integer companyId);

    // ════════════════════════════════════════════════════════════════════════
    // FINANCIAL STATISTICS — REVENUE QUERIES
    // Chỉ tính COMPLETED + DELIVERED (hàng đã thực sự giao/hoàn thành)
    // DRAFT + ALLOCATED không tính vào doanh thu
    // ════════════════════════════════════════════════════════════════════════

    /**
     * Tổng doanh thu xuất hàng theo khoảng ngày.
     * Dùng cho tab "Thống kê từ ngày đến ngày".
     */
    @Query("""
            SELECT COALESCE(SUM(o.totalAmount), 0)
            FROM OutboundOrder o
            WHERE o.status IN ('COMPLETED', 'DELIVERED')
              AND (:companyId IS NULL OR o.companyId = :companyId)
              AND o.issueDate >= :startDate
              AND o.issueDate <  :endDate
            """)
    BigDecimal sumRevenueByDateRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate")   LocalDateTime endDate,
            @Param("companyId") Integer companyId
    );

    /**
     * Doanh thu từng NGÀY trong khoảng ngày.
     * Returns: Object[]{ date(LocalDate), totalRevenue(BigDecimal) }
     * Dùng cho tab "Thống kê từng ngày" và "Thống kê từ ngày đến ngày".
     */
    @Query("""
            SELECT CAST(o.issueDate AS LocalDate), COALESCE(SUM(o.totalAmount), 0)
            FROM OutboundOrder o
            WHERE o.status IN ('COMPLETED', 'DELIVERED')
              AND (:companyId IS NULL OR o.companyId = :companyId)
              AND o.issueDate >= :startDate
              AND o.issueDate <  :endDate
            GROUP BY CAST(o.issueDate AS LocalDate)
            ORDER BY CAST(o.issueDate AS LocalDate)
            """)
    List<Object[]> sumRevenueGroupByDayInRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate")   LocalDateTime endDate,
            @Param("companyId") Integer companyId
    );

    /**
     * Doanh thu từng THÁNG trong một năm.
     * Returns: Object[]{ month(Integer 1-12), totalRevenue(BigDecimal) }
     * Dùng cho tab "Thống kê từng tháng trong năm".
     */
    @Query("""
            SELECT MONTH(o.issueDate), COALESCE(SUM(o.totalAmount), 0)
            FROM OutboundOrder o
            WHERE o.status IN ('COMPLETED', 'DELIVERED')
              AND (:companyId IS NULL OR o.companyId = :companyId)
              AND YEAR(o.issueDate) = :year
            GROUP BY MONTH(o.issueDate)
            ORDER BY MONTH(o.issueDate)
            """)
    List<Object[]> sumRevenueGroupByMonthInYear(@Param("year") int year, @Param("companyId") Integer companyId);

    /**
     * Doanh thu từng NĂM trong khoảng năm.
     * Returns: Object[]{ year(Integer), totalRevenue(BigDecimal) }
     * Dùng cho tab "Thống kê theo năm".
     */
    @Query("""
            SELECT YEAR(o.issueDate), COALESCE(SUM(o.totalAmount), 0)
            FROM OutboundOrder o
            WHERE o.status IN ('COMPLETED', 'DELIVERED')
              AND (:companyId IS NULL OR o.companyId = :companyId)
              AND YEAR(o.issueDate) >= :fromYear
              AND YEAR(o.issueDate) <= :toYear
            GROUP BY YEAR(o.issueDate)
            ORDER BY YEAR(o.issueDate)
            """)
    List<Object[]> sumRevenueGroupByYear(
            @Param("fromYear") int fromYear,
            @Param("toYear")   int toYear,
            @Param("companyId") Integer companyId
    );

    List<OutboundOrder> findByWaveId(Long waveId);
}
