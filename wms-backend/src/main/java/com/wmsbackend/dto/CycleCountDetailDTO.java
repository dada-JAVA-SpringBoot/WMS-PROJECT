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
public class CycleCountDetailDTO {
    private Long id;
    private Long planId;
    
    private Integer locationId;
    private String binCode;
    private String zone;
    
    private Integer productId;
    private String productName;
    private String productSku;
    
    private Integer batchId;
    private String batchCode;
    
    private BigDecimal systemQty;
    private BigDecimal countedQty;
    private BigDecimal variance;
    private String note;
}
