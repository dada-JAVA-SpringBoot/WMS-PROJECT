package com.wmsbackend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class InventoryDetailDTO {
    private String locCode;
    private String batchCode;
    private LocalDate expiryDate;
    private BigDecimal onHand;
    private BigDecimal allocated;

    // Constructor dùng để map kết quả từ câu query SQL
    public InventoryDetailDTO(String locCode, String batchCode, LocalDate expiryDate, BigDecimal onHand, BigDecimal allocated) {
        this.locCode = locCode;
        this.batchCode = batchCode;
        this.expiryDate = expiryDate;
        this.onHand = onHand;
        this.allocated = allocated;
    }

    // Getter Setter

    public String getLocCode() {
        return locCode;
    }

    public void setLocCode(String locCode) {
        this.locCode = locCode;
    }

    public String getBatchCode() {
        return batchCode;
    }

    public void setBatchCode(String batchCode) {
        this.batchCode = batchCode;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }

    public BigDecimal getOnHand() {
        return onHand;
    }

    public void setOnHand(BigDecimal onHand) {
        this.onHand = onHand;
    }

    public BigDecimal getAllocated() {
        return allocated;
    }

    public void setAllocated(BigDecimal allocated) {
        this.allocated = allocated;
    }
}