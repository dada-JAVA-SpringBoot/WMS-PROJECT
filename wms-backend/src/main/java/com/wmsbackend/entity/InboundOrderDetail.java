package com.wmsbackend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "InboundOrderDetails")
public class InboundOrderDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "InboundOrderId", nullable = false)
    private Long inboundOrderId;

    @Column(name = "ProductId", nullable = false)
    private Integer productId;

    @Column(name = "BatchId", nullable = false)
    private Integer batchId;

    @Column(name = "LocationId", nullable = false)
    private Integer locationId;

    @Column(name = "Quantity", nullable = false)
    private BigDecimal quantityReceived;

    @Column(name = "QuantityExpected")
    private BigDecimal quantityExpected;

    @Column(name = "UnitPrice")
    private BigDecimal unitPrice;

    @Column(name = "ItemCondition", length = 100)
    private String itemCondition;

    // Getter Setter

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getInboundOrderId() {
        return inboundOrderId;
    }

    public void setInboundOrderId(Long inboundOrderId) {
        this.inboundOrderId = inboundOrderId;
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

    public BigDecimal getQuantityReceived() {
        return quantityReceived;
    }

    public void setQuantityReceived(BigDecimal quantityReceived) {
        this.quantityReceived = quantityReceived;
    }

    public void setQuantity(BigDecimal quantityReceived) {
        this.quantityReceived = quantityReceived;
    }

    public BigDecimal getQuantityExpected() {
        return quantityExpected;
    }

    public void setQuantityExpected(BigDecimal quantityExpected) {
        this.quantityExpected = quantityExpected;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }

    public String getItemCondition() {
        return itemCondition;
    }

    public void setItemCondition(String itemCondition) {
        this.itemCondition = itemCondition;
    }
}
