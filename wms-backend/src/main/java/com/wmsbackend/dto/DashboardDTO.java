package com.wmsbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardDTO {

    // ── KPI Cards ──────────────────────────────────────────────────────────
    private long totalSkus;                     // Tổng mã hàng (SKU)
    private double totalStockQuantity;          // Tổng SL tồn kho
    private double warehouseOccupancyRate;      // Tỉ lệ lấp đầy kho (%)
    private long lowStockCount;                 // Mặt hàng dưới định mức
    private long pendingInbound;                // Đơn nhập chờ xử lý
    private long pendingOutbound;               // Đơn xuất chờ xử lý

    // ── Chart: Dòng chảy hàng hóa 7 ngày ──────────────────────────────────
    private List<DailyFlowDTO> dailyFlow;

    // ── Top 5 sản phẩm tồn nhiều nhất ──────────────────────────────────────
    private List<Map<String, Object>> topStockProducts;

    // ── Top 5 sản phẩm sắp hết hạn ────────────────────────────────────────
    private List<Map<String, Object>> nearExpiryProducts;

    // ── Phân bổ tồn kho theo danh mục ──────────────────────────────────────
    private List<Map<String, Object>> stockByCategory;
}
