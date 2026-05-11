package com.wmsbackend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "CycleCountDetails")
@Data
@NoArgsConstructor
public class CycleCountDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "PlanId", nullable = false)
    private Long planId;

    @Column(name = "LocationId", nullable = false)
    private Integer locationId;

    @Column(name = "ProductId", nullable = false)
    private Integer productId;

    @Column(name = "BatchId", nullable = false)
    private Integer batchId;

    @Column(name = "SystemQty", precision = 18, scale = 2)
    private BigDecimal systemQty;

    @Column(name = "CountedQty", precision = 18, scale = 2)
    private BigDecimal countedQty;

    @Column(name = "Variance", precision = 18, scale = 2)
    private BigDecimal variance;

    @Column(name = "Note", length = 255)
    private String note;
}
