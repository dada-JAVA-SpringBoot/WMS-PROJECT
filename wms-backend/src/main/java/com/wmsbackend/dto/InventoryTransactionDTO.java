package com.wmsbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryTransactionDTO {
    private Long id;
    private Integer productId;
    private String productName;
    private String productSku;
    
    private Integer locationId;
    private String binCode;
    private String zone;
    
    private Integer batchId;
    private String batchCode;
    
    private String transactionType;
    private BigDecimal quantityChange;
    private Long referenceId;
    
    private Integer createdBy;
    private String staffName;
    private LocalDateTime createdAt;

    // Robust explicit constructor for JPQL
    public InventoryTransactionDTO(Object id, Object productId, String productName, String productSku, 
                                 Object locationId, String binCode, String zone, 
                                 Object batchId, String batchCode, 
                                 String transactionType, Object quantityChange, Object referenceId, 
                                 Object createdBy, String staffName, Object createdAt) {
        this.id = id != null ? ((Number) id).longValue() : null;
        this.productId = productId != null ? ((Number) productId).intValue() : null;
        this.productName = productName;
        this.productSku = productSku;
        this.locationId = locationId != null ? ((Number) locationId).intValue() : null;
        this.binCode = binCode;
        this.zone = zone;
        this.batchId = batchId != null ? ((Number) batchId).intValue() : null;
        this.batchCode = batchCode;
        this.transactionType = transactionType;
        this.quantityChange = quantityChange != null ? (java.math.BigDecimal) quantityChange : null;
        this.referenceId = referenceId != null ? ((Number) referenceId).longValue() : null;
        this.createdBy = createdBy != null ? ((Number) createdBy).intValue() : null;
        this.staffName = staffName;
        this.createdAt = (java.time.LocalDateTime) createdAt;
    }
}
