package com.wmsbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryStatsDTO {

    // ── Bảng tồn kho theo sản phẩm ────────────────────────────────────────
    private List<ProductStockSummary> productStocks;

    // ── Phân tích ABC ──────────────────────────────────────────────────────
    private List<AbcItem> abcAnalysis;

    // ── Tổng kết ───────────────────────────────────────────────────────────
    private double totalStockValue;
    private long totalProducts;
    private long lowStockProducts;
    private long zeroStockProducts;

    // ════════════════════════════════════════════════════════════════════════
    // Inner DTO: Tồn kho theo sản phẩm
    // ════════════════════════════════════════════════════════════════════════
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductStockSummary {
        private int stt;
        private String sku;
        private String name;
        private String categoryName;
        private double openingStock;    // Tồn đầu kỳ
        private double inboundQty;      // Nhập trong kỳ
        private double outboundQty;     // Xuất trong kỳ
        private double endingStock;     // Tồn cuối kỳ
        private double stockValue;      // Giá trị tồn (tồn × đơn giá TB)
        private String abcClass;        // "A" / "B" / "C"
    }

    // ════════════════════════════════════════════════════════════════════════
    // Inner DTO: Phân tích ABC
    // ════════════════════════════════════════════════════════════════════════
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AbcItem {
        private String className;       // "A", "B", "C"
        private int productCount;
        private double totalValue;
        private double percentage;      // % giá trị so với tổng
    }
}
