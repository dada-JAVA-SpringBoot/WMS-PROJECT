package com.wmsbackend.service.impl;

import com.wmsbackend.dto.*;
import com.wmsbackend.entity.Product;
import com.wmsbackend.repository.*;
import com.wmsbackend.service.StatisticalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class StatisticalServiceImpl implements StatisticalService {

    @Autowired private ProductRepository productRepository;
    @Autowired private InventoryRepository inventoryRepository;
    @Autowired private InventoryTransactionRepository transactionRepository;
    @Autowired private InboundOrderRepository inboundOrderRepository;
    @Autowired private OutboundOrderRepository outboundOrderRepository;
    @Autowired private LocationRepository locationRepository;
    @Autowired private BatchRepository batchRepository;

    // ════════════════════════════════════════════════════════════════════════
    // 1. Dashboard Overview
    // ════════════════════════════════════════════════════════════════════════
    @Override
    public DashboardDTO getDashboard() {
        DashboardDTO dto = new DashboardDTO();

        // ── KPI Cards ──────────────────────────────────────────────────────
        dto.setTotalSkus(productRepository.count());

        Double totalQty = inventoryRepository.sumTotalQuantityOnHand();
        dto.setTotalStockQuantity(totalQty != null ? totalQty : 0.0);

        // Tỉ lệ lấp đầy kho
        long totalLocations = locationRepository.count();
        long occupiedLocations = inventoryRepository.countDistinctLocationId();
        dto.setWarehouseOccupancyRate(
                totalLocations > 0 ? Math.round((double) occupiedLocations / totalLocations * 1000.0) / 10.0 : 0);

        // Sản phẩm dưới định mức
        dto.setLowStockCount(productRepository.countLowStockProducts());

        // Đơn nhập chờ xử lý (DRAFT, ORDERED, IN_TRANSIT)
        dto.setPendingInbound(
                inboundOrderRepository.countByStatusIn(List.of("DRAFT", "ORDERED", "IN_TRANSIT")));

        // Đơn xuất chờ xử lý (DRAFT, ALLOCATED)
        dto.setPendingOutbound(
                outboundOrderRepository.countByStatusIn(List.of("DRAFT", "ALLOCATED")));

        // ── Chart: Dòng chảy hàng hóa 7 ngày ──────────────────────────────
        dto.setDailyFlow(buildDailyFlow(7));

        // ── Top 5 sản phẩm tồn nhiều nhất ──────────────────────────────────
        dto.setTopStockProducts(buildTopStockProducts(5));

        // ── Top 5 sản phẩm sắp hết hạn ────────────────────────────────────
        dto.setNearExpiryProducts(buildNearExpiryProducts(5));

        // ── Phân bổ tồn kho theo danh mục ──────────────────────────────────
        dto.setStockByCategory(buildStockByCategory());

        return dto;
    }

    // ════════════════════════════════════════════════════════════════════════
    // 2. Inventory Stats (Tồn kho & ABC)
    // ════════════════════════════════════════════════════════════════════════
    @Override
    public InventoryStatsDTO getInventoryStats(LocalDate startDate, LocalDate endDate) {
        InventoryStatsDTO dto = new InventoryStatsDTO();

        LocalDateTime startDT = startDate.atStartOfDay();
        LocalDateTime endDT = endDate.plusDays(1).atStartOfDay(); // exclusive

        // Lấy tất cả sản phẩm active
        List<Product> products = productRepository.findAllActiveProducts();

        // Lấy tổng nhập/xuất theo sản phẩm trong kỳ
        Map<Integer, Double> inboundMap = toProductMap(
                transactionRepository.sumInboundByProductInPeriod(startDT, endDT));
        Map<Integer, Double> outboundMap = toProductMap(
                transactionRepository.sumOutboundByProductInPeriod(startDT, endDT));

        // Lấy tồn hiện tại theo sản phẩm
        Map<Integer, Double> currentStockMap = new HashMap<>();
        inventoryRepository.findProductsWithStock().forEach(row -> {
            Integer productId = (Integer) row[0];
            double qty = ((Number) row[3]).doubleValue();
            currentStockMap.put(productId, qty);
        });

        // Tính toán từng sản phẩm
        List<InventoryStatsDTO.ProductStockSummary> summaries = new ArrayList<>();
        int stt = 0;
        long lowCount = 0;
        long zeroCount = 0;

        for (Product p : products) {
            stt++;
            double inbound = inboundMap.getOrDefault(p.getId(), 0.0);
            double outbound = Math.abs(outboundMap.getOrDefault(p.getId(), 0.0));
            double endingStock = currentStockMap.getOrDefault(p.getId(), 0.0);
            // Tồn đầu kỳ = Tồn cuối kỳ - nhập + xuất
            double openingStock = endingStock - inbound + outbound;

            InventoryStatsDTO.ProductStockSummary summary = new InventoryStatsDTO.ProductStockSummary();
            summary.setStt(stt);
            summary.setSku(p.getSku());
            summary.setName(p.getName());
            summary.setCategoryName(""); // Sẽ resolve từ categoryId nếu cần
            summary.setOpeningStock(openingStock);
            summary.setInboundQty(inbound);
            summary.setOutboundQty(outbound);
            summary.setEndingStock(endingStock);
            summary.setStockValue(endingStock); // Dùng SL tồn làm giá trị (đơn giản hóa)
            summary.setAbcClass(""); // Sẽ tính sau

            summaries.add(summary);

            if (endingStock == 0) zeroCount++;
            if (p.getSafetyStock() != null && p.getSafetyStock() > 0 && endingStock < p.getSafetyStock()) {
                lowCount++;
            }
        }

        // ── Phân tích ABC ──────────────────────────────────────────────────
        List<InventoryStatsDTO.AbcItem> abcResult = calculateABC(summaries);

        // ── Tổng kết ───────────────────────────────────────────────────────
        double totalValue = summaries.stream().mapToDouble(s -> s.getStockValue()).sum();
        dto.setProductStocks(summaries);
        dto.setAbcAnalysis(abcResult);
        dto.setTotalStockValue(totalValue);
        dto.setTotalProducts(summaries.size());
        dto.setLowStockProducts(lowCount);
        dto.setZeroStockProducts(zeroCount);

        return dto;
    }

    // ════════════════════════════════════════════════════════════════════════
    // Private Helpers
    // ════════════════════════════════════════════════════════════════════════

    /**
     * Xây dựng dữ liệu dòng chảy hàng hóa N ngày gần nhất
     */
    private List<DailyFlowDTO> buildDailyFlow(int days) {
        LocalDate today = LocalDate.now();
        LocalDate startDate = today.minusDays(days - 1);
        LocalDateTime startDT = startDate.atStartOfDay();
        LocalDateTime endDT = today.plusDays(1).atStartOfDay();

        // Query từ DB
        List<Object[]> rawData = transactionRepository.findDailyFlow(startDT, endDT);

        // Map: date -> {INBOUND: qty, OUTBOUND: qty}
        Map<LocalDate, Map<String, Double>> dataMap = new LinkedHashMap<>();
        for (Object[] row : rawData) {
            LocalDate date;
            if (row[0] instanceof LocalDate) {
                date = (LocalDate) row[0];
            } else if (row[0] instanceof java.sql.Date) {
                date = ((java.sql.Date) row[0]).toLocalDate();
            } else {
                date = LocalDate.parse(row[0].toString());
            }
            String type = (String) row[1];
            double qty = ((Number) row[2]).doubleValue();
            dataMap.computeIfAbsent(date, k -> new HashMap<>()).put(type, qty);
        }

        // Tạo list đầy đủ cho N ngày (bao gồm ngày không có giao dịch)
        List<DailyFlowDTO> result = new ArrayList<>();
        for (int i = 0; i < days; i++) {
            LocalDate date = startDate.plusDays(i);
            Map<String, Double> dayData = dataMap.getOrDefault(date, Collections.emptyMap());

            DailyFlowDTO flow = new DailyFlowDTO();
            flow.setDate(date.format(DateTimeFormatter.ISO_LOCAL_DATE));
            flow.setLabel(getVietnameseDayLabel(date.getDayOfWeek()));
            flow.setInbound(dayData.getOrDefault("INBOUND", 0.0));
            flow.setOutbound(dayData.getOrDefault("OUTBOUND", 0.0));
            result.add(flow);
        }

        return result;
    }

    /**
     * Top N sản phẩm tồn nhiều nhất
     */
    private List<Map<String, Object>> buildTopStockProducts(int limit) {
        List<Object[]> raw = inventoryRepository.findTopStockProducts();
        List<Map<String, Object>> result = new ArrayList<>();
        int count = 0;
        for (Object[] row : raw) {
            if (count >= limit) break;
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("sku", row[1]);
            item.put("name", row[2]);
            item.put("totalStock", ((Number) row[3]).doubleValue());
            result.add(item);
            count++;
        }
        return result;
    }

    /**
     * Top N lô hàng sắp hết hạn (trong 30 ngày tới)
     */
    private List<Map<String, Object>> buildNearExpiryProducts(int limit) {
        LocalDate today = LocalDate.now();
        LocalDate threshold = today.plusDays(30);

        List<Object[]> raw = batchRepository.findNearExpiryBatchesWithStock(today, threshold);
        List<Map<String, Object>> result = new ArrayList<>();
        int count = 0;
        for (Object[] row : raw) {
            if (count >= limit) break;
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("name", row[0]);
            item.put("sku", row[1]);
            item.put("batchCode", row[2]);
            item.put("expiryDate", row[3] != null ? row[3].toString() : null);
            item.put("quantity", ((Number) row[4]).doubleValue());
            result.add(item);
            count++;
        }
        return result;
    }

    /**
     * Phân bổ tồn kho theo danh mục sản phẩm
     */
    private List<Map<String, Object>> buildStockByCategory() {
        List<Object[]> raw = inventoryRepository.findStockByCategory();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : raw) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("category", row[0]);
            item.put("totalStock", ((Number) row[1]).doubleValue());
            result.add(item);
        }
        return result;
    }

    /**
     * Tính phân tích ABC dựa trên giá trị tồn kho
     * A = top 80% giá trị, B = tiếp theo 15%, C = còn lại 5%
     */
    private List<InventoryStatsDTO.AbcItem> calculateABC(
            List<InventoryStatsDTO.ProductStockSummary> summaries) {

        // Sort giảm dần theo stockValue
        List<InventoryStatsDTO.ProductStockSummary> sorted = summaries.stream()
                .sorted(Comparator.comparingDouble(InventoryStatsDTO.ProductStockSummary::getStockValue).reversed())
                .collect(Collectors.toList());

        double totalValue = sorted.stream().mapToDouble(s -> s.getStockValue()).sum();
        if (totalValue <= 0) {
            // Trả về ABC rỗng
            return List.of(
                    new InventoryStatsDTO.AbcItem("A", 0, 0, 0),
                    new InventoryStatsDTO.AbcItem("B", 0, 0, 0),
                    new InventoryStatsDTO.AbcItem("C", 0, 0, 0));
        }

        double cumulative = 0;
        int aCount = 0, bCount = 0, cCount = 0;
        double aValue = 0, bValue = 0, cValue = 0;

        for (InventoryStatsDTO.ProductStockSummary s : sorted) {
            double pct = cumulative / totalValue * 100;
            if (pct < 80) {
                s.setAbcClass("A");
                aCount++;
                aValue += s.getStockValue();
            } else if (pct < 95) {
                s.setAbcClass("B");
                bCount++;
                bValue += s.getStockValue();
            } else {
                s.setAbcClass("C");
                cCount++;
                cValue += s.getStockValue();
            }
            cumulative += s.getStockValue();
        }

        List<InventoryStatsDTO.AbcItem> result = new ArrayList<>();
        result.add(new InventoryStatsDTO.AbcItem("A", aCount, aValue,
                Math.round(aValue / totalValue * 1000.0) / 10.0));
        result.add(new InventoryStatsDTO.AbcItem("B", bCount, bValue,
                Math.round(bValue / totalValue * 1000.0) / 10.0));
        result.add(new InventoryStatsDTO.AbcItem("C", cCount, cValue,
                Math.round(cValue / totalValue * 1000.0) / 10.0));

        return result;
    }

    /**
     * Chuyển List<Object[]> [productId, value] thành Map
     */
    private Map<Integer, Double> toProductMap(List<Object[]> rows) {
        Map<Integer, Double> map = new HashMap<>();
        for (Object[] row : rows) {
            Integer productId = (Integer) row[0];
            double value = ((Number) row[1]).doubleValue();
            map.put(productId, value);
        }
        return map;
    }

    /**
     * Lấy tên ngày trong tuần bằng tiếng Việt
     */
    private String getVietnameseDayLabel(DayOfWeek dow) {
        return switch (dow) {
            case MONDAY -> "Thứ 2";
            case TUESDAY -> "Thứ 3";
            case WEDNESDAY -> "Thứ 4";
            case THURSDAY -> "Thứ 5";
            case FRIDAY -> "Thứ 6";
            case SATURDAY -> "Thứ 7";
            case SUNDAY -> "CN";
        };
    }
}
