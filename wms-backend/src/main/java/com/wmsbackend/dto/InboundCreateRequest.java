package com.wmsbackend.dto;

import java.math.BigDecimal;
import java.util.List;

public class InboundCreateRequest {
    private Integer supplierId;
    private Integer createdBy;
    private String referenceNumber;
    private String status;
    private String notes;
    private BigDecimal totalAmount;
    private List<ItemRequest> items;

    public Integer getSupplierId() { return supplierId; }
    public void setSupplierId(Integer supplierId) { this.supplierId = supplierId; }
    public Integer getCreatedBy() { return createdBy; }
    public void setCreatedBy(Integer createdBy) { this.createdBy = createdBy; }
    public String getReferenceNumber() { return referenceNumber; }
    public void setReferenceNumber(String referenceNumber) { this.referenceNumber = referenceNumber; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public List<ItemRequest> getItems() { return items; }
    public void setItems(List<ItemRequest> items) { this.items = items; }

    public static class ItemRequest {
        private Integer productId;
        private String batchCode;
        private java.time.LocalDate expiryDate;
        private Integer locationId;
        private BigDecimal quantityReceived;
        private BigDecimal quantityExpected;
        private BigDecimal unitPrice;
        private String itemCondition;

        public Integer getProductId() { return productId; }
        public void setProductId(Integer productId) { this.productId = productId; }
        public String getBatchCode() { return batchCode; }
        public void setBatchCode(String batchCode) { this.batchCode = batchCode; }
        public java.time.LocalDate getExpiryDate() { return expiryDate; }
        public void setExpiryDate(java.time.LocalDate expiryDate) { this.expiryDate = expiryDate; }
        public Integer getLocationId() { return locationId; }
        public void setLocationId(Integer locationId) { this.locationId = locationId; }
        public BigDecimal getQuantityReceived() { return quantityReceived; }
        public void setQuantityReceived(BigDecimal quantityReceived) { this.quantityReceived = quantityReceived; }
        public BigDecimal getQuantityExpected() { return quantityExpected; }
        public void setQuantityExpected(BigDecimal quantityExpected) { this.quantityExpected = quantityExpected; }
        public BigDecimal getUnitPrice() { return unitPrice; }
        public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
        public String getItemCondition() { return itemCondition; }
        public void setItemCondition(String itemCondition) { this.itemCondition = itemCondition; }
    }
}
