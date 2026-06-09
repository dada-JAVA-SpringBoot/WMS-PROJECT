package com.wmsbackend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class FEFOSuggestionDTO {
    private Integer locationId;
    private String binCode;
    private Integer batchId;
    private String batchCode;
    private LocalDate expiryDate;
    private BigDecimal suggestedQuantity;

    public FEFOSuggestionDTO(Integer locationId, String binCode, Integer batchId, String batchCode, LocalDate expiryDate, BigDecimal suggestedQuantity) {
        this.locationId = locationId;
        this.binCode = binCode;
        this.batchId = batchId;
        this.batchCode = batchCode;
        this.expiryDate = expiryDate;
        this.suggestedQuantity = suggestedQuantity;
    }

    // Getters and Setters
    public Integer getLocationId() { return locationId; }
    public void setLocationId(Integer locationId) { this.locationId = locationId; }

    public String getBinCode() { return binCode; }
    public void setBinCode(String binCode) { this.binCode = binCode; }

    public Integer getBatchId() { return batchId; }
    public void setBatchId(Integer batchId) { this.batchId = batchId; }

    public String getBatchCode() { return batchCode; }
    public void setBatchCode(String batchCode) { this.batchCode = batchCode; }

    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }

    public BigDecimal getSuggestedQuantity() { return suggestedQuantity; }
    public void setSuggestedQuantity(BigDecimal suggestedQuantity) { this.suggestedQuantity = suggestedQuantity; }
}
