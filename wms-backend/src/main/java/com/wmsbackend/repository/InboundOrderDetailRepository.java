package com.wmsbackend.repository;

import com.wmsbackend.entity.InboundOrderDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InboundOrderDetailRepository extends JpaRepository<InboundOrderDetail, Long> {
    List<InboundOrderDetail> findByInboundOrderId(Long inboundOrderId);
    List<InboundOrderDetail> findByInboundOrderIdIn(List<Long> inboundOrderIds);
    @org.springframework.data.jpa.repository.Query("SELECT d.productId, AVG(d.unitPrice) FROM InboundOrderDetail d GROUP BY d.productId")
    List<Object[]> getAveragePricesByProduct();

    /** Tổng giá trị hàng hỏng khi nhập kho (Inbound QC) */
    @org.springframework.data.jpa.repository.Query("""
            SELECT COALESCE(SUM(d.quantityDamaged * d.unitPrice), 0)
            FROM InboundOrderDetail d
            JOIN InboundOrder o ON d.inboundOrderId = o.id
            WHERE o.status = 'COMPLETED'
              AND o.receiptDate >= :startDate
              AND o.receiptDate <  :endDate
            """)
    java.math.BigDecimal sumDamagedValueByDateRange(
            @Param("startDate") java.time.LocalDateTime startDate,
            @Param("endDate")   java.time.LocalDateTime endDate
    );

    /** Giá trị hàng hỏng theo từng ngày */
    @org.springframework.data.jpa.repository.Query("""
            SELECT CAST(o.receiptDate AS LocalDate), COALESCE(SUM(d.quantityDamaged * d.unitPrice), 0)
            FROM InboundOrderDetail d
            JOIN InboundOrder o ON d.inboundOrderId = o.id
            WHERE o.status = 'COMPLETED'
              AND o.receiptDate >= :startDate
              AND o.receiptDate <  :endDate
            GROUP BY CAST(o.receiptDate AS LocalDate)
            """)
    List<Object[]> sumDamagedValueGroupByDayInRange(
            @Param("startDate") java.time.LocalDateTime startDate,
            @Param("endDate")   java.time.LocalDateTime endDate
    );

    /** Giá trị hàng hỏng theo từng tháng */
    @org.springframework.data.jpa.repository.Query("""
            SELECT MONTH(o.receiptDate), COALESCE(SUM(d.quantityDamaged * d.unitPrice), 0)
            FROM InboundOrderDetail d
            JOIN InboundOrder o ON d.inboundOrderId = o.id
            WHERE o.status = 'COMPLETED'
              AND YEAR(o.receiptDate) = :year
            GROUP BY MONTH(o.receiptDate)
            """)
    List<Object[]> sumDamagedValueGroupByMonthInYear(@Param("year") int year);

    /** Giá trị hàng hỏng theo từng năm */
    @org.springframework.data.jpa.repository.Query("""
            SELECT YEAR(o.receiptDate), COALESCE(SUM(d.quantityDamaged * d.unitPrice), 0)
            FROM InboundOrderDetail d
            JOIN InboundOrder o ON d.inboundOrderId = o.id
            WHERE o.status = 'COMPLETED'
              AND YEAR(o.receiptDate) >= :fromYear
              AND YEAR(o.receiptDate) <= :toYear
            GROUP BY YEAR(o.receiptDate)
            """)
    List<Object[]> sumDamagedValueGroupByYear(
            @Param("fromYear") int fromYear,
            @Param("toYear")   int toYear
    );
}
