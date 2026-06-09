package com.wmsbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StatisticalSummaryDTO {
    // Overview Metrics
    private long totalSkus;
    private double totalStockQuantity;
    private long pendingInbound;
    private long pendingOutbound;
    private double warehouseOccupancyRate; // % locations occupied

    // Inventory Metrics
    private List<Map<String, Object>> lowStockItems; // List of {name, sku, current, safety}
    private List<Map<String, Object>> abcAnalysis;  // List of {category, value, percentage}

    // Performance
    private List<Map<String, Object>> topStores;   // List of {name, totalValue}
    private List<Map<String, Object>> topSuppliers; // List of {name, totalValue}
}
