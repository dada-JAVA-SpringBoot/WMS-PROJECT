package com.wmsbackend.dto;

import java.math.BigDecimal;
import java.util.List;

public class OutboundCreateRequest {
    private String issueCode;
    private java.time.LocalDateTime issueDate;
    private Integer customerId;
    private Integer createdBy;
    private String status;
    private String note;
    private BigDecimal totalAmount;
    private List<ItemRequest> items;

    public String getIssueCode() { return issueCode; }
    public void setIssueCode(String issueCode) { this.issueCode = issueCode; }
    public java.time.LocalDateTime getIssueDate() { return issueDate; }
    public void setIssueDate(java.time.LocalDateTime issueDate) { this.issueDate = issueDate; }
    public Integer getCustomerId() { return customerId; }
    public void setCustomerId(Integer customerId) { this.customerId = customerId; }
    public Integer getCreatedBy() { return createdBy; }
    public void setCreatedBy(Integer createdBy) { this.createdBy = createdBy; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public List<ItemRequest> getItems() { return items; }
    public void setItems(List<ItemRequest> items) { this.items = items; }

    public static class ItemRequest {
        private Integer productId;
        private BigDecimal quantity;
        private BigDecimal unitPrice;
        private Integer batchId;
        private Integer locationId;

        public Integer getProductId() { return productId; }
        public void setProductId(Integer productId) { this.productId = productId; }
        public BigDecimal getQuantity() { return quantity; }
        public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }
        public BigDecimal getUnitPrice() { return unitPrice; }
        public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
        public Integer getBatchId() { return batchId; }
        public void setBatchId(Integer batchId) { this.batchId = batchId; }
        public Integer getLocationId() { return locationId; }
        public void setLocationId(Integer locationId) { this.locationId = locationId; }
    }
}
