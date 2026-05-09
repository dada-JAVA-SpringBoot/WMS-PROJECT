package com.wmsbackend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "OutboundOrderDetails")
public class OutboundOrderDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "OutboundOrderId", nullable = false)
    private Long outboundOrderId;

    @Column(name = "ProductId", nullable = false)
    private Integer productId;

    @Column(name = "BatchId", nullable = false)
    private Integer batchId;

    @Column(name = "LocationId", nullable = false)
    private Integer locationId;

    @Column(name = "Quantity", nullable = false)
    private BigDecimal quantity;

    @Column(name = "UnitPrice")
    private BigDecimal unitPrice;

    // Getter Setter

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getOutboundOrderId() {
        return outboundOrderId;
    }

    public void setOutboundOrderId(Long outboundOrderId) {
        this.outboundOrderId = outboundOrderId;
    }

    public Integer getProductId() {
        return productId;
    }

    public void setProductId(Integer productId) {
        this.productId = productId;
    }

    public Integer getBatchId() {
        return batchId;
    }

    public void setBatchId(Integer batchId) {
        this.batchId = batchId;
    }

    public Integer getLocationId() {
        return locationId;
    }

    public void setLocationId(Integer locationId) {
        this.locationId = locationId;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }
}