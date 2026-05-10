package com.wmsbackend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "OutboundOrders")
public class OutboundOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "IssueCode", unique = true, nullable = false, length = 50)
    private String issueCode;

    @Column(name = "CustomerId")
    private Integer customerId;

    @Column(name = "Status", length = 20)
    private String status;

    @Column(name = "IssueDate")
    private LocalDateTime issueDate;

    @Column(name = "CreatedBy")
    private Integer createdBy;

    @Column(name = "CreatedAt", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "TotalAmount")
    private java.math.BigDecimal totalAmount;

    @Column(name = "Note", length = 500)
    private String note;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "OutboundOrderId")
    private java.util.List<OutboundOrderDetail> items = new java.util.ArrayList<>();

    // Getter Setter

    public java.util.List<OutboundOrderDetail> getItems() {
        return items;
    }

    public void setItems(java.util.List<OutboundOrderDetail> items) {
        this.items = items;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getIssueCode() {
        return issueCode;
    }

    public void setIssueCode(String issueCode) {
        this.issueCode = issueCode;
    }

    public Integer getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Integer customerId) {
        this.customerId = customerId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getIssueDate() {
        return issueDate;
    }

    public void setIssueDate(LocalDateTime issueDate) {
        this.issueDate = issueDate;
    }

    public Integer getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(Integer createdBy) {
        this.createdBy = createdBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public java.math.BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(java.math.BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}