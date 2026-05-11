package com.wmsbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WavePickingItemDTO {
    private String binCode;
    private String zone;
    private String aisle;
    private String rack;
    private String level;
    
    private Integer locationId;
    private Integer productId;
    private String productName;
    private String productSku;
    
    private String batchCode;
    private BigDecimal totalQuantity;
    
    private String orderCodes; // Comma separated codes
}
