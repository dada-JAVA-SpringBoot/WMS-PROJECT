package com.wmsbackend.service.impl;

import com.wmsbackend.dto.*;
import com.wmsbackend.entity.InboundOrder;
import com.wmsbackend.entity.InboundOrderDetail;
import com.wmsbackend.entity.Product;
import com.wmsbackend.entity.Company;
import com.wmsbackend.repository.*;
import com.wmsbackend.service.StatisticalService;
import com.wmsbackend.security.WorkspaceContext;
import com.wmsbackend.util.TimeUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
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
    @Autowired private CompanyRepository companyRepository;

    @Override
    public DashboardDTO getDashboard() {
        final Integer filterId = WorkspaceContext.getFilterCompanyId();

        DashboardDTO dto = new DashboardDTO();

        // ── Tổng số SKU (query DB trực tiếp) ─────────────────────────────
        dto.setTotalSkus(productRepository.countByCompany(filterId));

        // ── Tổng tồn kho (DB aggregate) ───────────────────────────────────
        java.math.BigDecimal totalQtyBD = inventoryRepository.sumTotalQuantityOnHandByCompany(filterId);
        double totalQty = totalQtyBD != null ? totalQtyBD.doubleValue() : 0.0;
        dto.setTotalStockQuantity(totalQty);

        // ── Tỷ lệ sử dụng kho (DB aggregate capacity) ────────────────────
        Long totalCapacity = inventoryRepository.sumTotalCapacityByCompany(filterId);
        dto.setWarehouseOccupancyRate(
                (totalCapacity != null && totalCapacity > 0)
                ? Math.round(totalQty / totalCapacity * 100.0 * 10.0) / 10.0
                : 0);

        // ── Low stock (dùng query DB chuyên dụng) ─────────────────────────
        // Lấy map stockQty theo productId từ DB
        Map<Integer, Double> stockMap = new HashMap<>();
        inventoryRepository.sumStockByProductIdForCompany(filterId)
                .forEach(row -> stockMap.put(((Number) row[0]).intValue(), ((Number) row[1]).doubleValue()));

        List<Product> products = productRepository.findActiveByCompany(filterId);
        long lowCount = products.stream()
                .filter(p -> p.getSafetyStock() != null && p.getSafetyStock() > 0)
                .filter(p -> stockMap.getOrDefault(p.getId(), 0.0) < p.getSafetyStock())
                .count();
        dto.setLowStockCount(lowCount);

        // ── Đơn nhập/xuất đang chờ (countByStatusIn — không load object) ─
        List<String> pendingInboundStatuses = List.of("DRAFT", "ORDERED", "IN_TRANSIT", "PENDING");
        List<String> pendingOutboundStatuses = List.of("DRAFT", "ALLOCATED", "PENDING");
        if (filterId == null) {
            dto.setPendingInbound(inboundOrderRepository.countByStatusIn(pendingInboundStatuses));
            dto.setPendingOutbound(outboundOrderRepository.countByStatusIn(pendingOutboundStatuses));
        } else {
            dto.setPendingInbound(inboundOrderRepository.countByStatusInAndCompanyId(pendingInboundStatuses, filterId));
            dto.setPendingOutbound(outboundOrderRepository.countByStatusInAndCompanyId(pendingOutboundStatuses, filterId));
        }

        dto.setDailyFlow(buildDailyFlow(7, filterId));
        dto.setTopStockProducts(buildTopStockProducts(5, filterId));
        dto.setNearExpiryProducts(buildNearExpiryProducts(5, filterId));
        dto.setStockByCategory(buildStockByCategory(filterId));
        return dto;
    }

    @Override
    public InventoryStatsDTO getInventoryStats(LocalDate startDate, LocalDate endDate) {
        InventoryStatsDTO dto = new InventoryStatsDTO();
        LocalDateTime startDT = startDate.atStartOfDay();
        LocalDateTime endDT = endDate.plusDays(1).atStartOfDay();
        final Integer filterId = WorkspaceContext.getFilterCompanyId();

        List<Product> products = productRepository.findActiveByCompany(filterId);
        Map<Integer, Double> inboundMap = toProductMap(transactionRepository.sumInboundByProductInPeriod(startDT, endDT, filterId));
        Map<Integer, Double> outboundMap = toProductMap(transactionRepository.sumOutboundByProductInPeriod(startDT, endDT, filterId));
        Map<Integer, Double> adjustmentMap = toProductMap(transactionRepository.sumAdjustmentsByProductInPeriod(startDT, endDT, filterId));

        // Dùng DB aggregate thay vì findAll() + filter
        Map<Integer, Double> currentStockMap = new HashMap<>();
        inventoryRepository.sumStockByProductIdForCompany(filterId)
                .forEach(row -> currentStockMap.put(((Number) row[0]).intValue(), ((Number) row[1]).doubleValue()));

        List<InventoryStatsDTO.ProductStockSummary> summaries = new ArrayList<>();
        int stt = 0;
        long lowCount = 0;
        long zeroCount = 0;

        for (Product p : products) {
            stt++;
            double inbound = inboundMap.getOrDefault(p.getId(), 0.0);
            double outbound = Math.abs(outboundMap.getOrDefault(p.getId(), 0.0));
            double adjustment = adjustmentMap.getOrDefault(p.getId(), 0.0);
            double endingStock = currentStockMap.getOrDefault(p.getId(), 0.0);
            double openingStock = endingStock - inbound + outbound - adjustment;

            InventoryStatsDTO.ProductStockSummary summary = new InventoryStatsDTO.ProductStockSummary();
            summary.setStt(stt);
            summary.setSku(p.getSku());
            summary.setName(p.getName());
            summary.setCategoryName(""); 
            summary.setOpeningStock(openingStock);
            summary.setInboundQty(inbound);
            summary.setOutboundQty(outbound);
            summary.setEndingStock(endingStock);
            summary.setStockValue(endingStock); 
            summary.setAbcClass(""); 
            summaries.add(summary);

            if (endingStock == 0) zeroCount++;
            if (p.getSafetyStock() != null && p.getSafetyStock() > 0 && endingStock < p.getSafetyStock()) {
                lowCount++;
            }
        }

        List<InventoryStatsDTO.AbcItem> abcResult = calculateABC(summaries);
        List<InventoryStatsDTO.LossDetail> lossDetails = new ArrayList<>();
        
        // Index sản phẩm theo ID để tra cứu nhanh trong cả 2 block loss
        Map<Integer, Product> productIndex = products.stream().collect(Collectors.toMap(Product::getId, p -> p, (a, b) -> a));

        // Dùng DB query thay vì findAll() + Java filter
        List<InboundOrder> completedOrders = inboundOrderRepository.findCompletedOrdersInRange(startDT, endDT, filterId);

        if (!completedOrders.isEmpty()) {
            List<Long> orderIds = completedOrders.stream().map(InboundOrder::getId).collect(Collectors.toList());
            List<InboundOrderDetail> allQcDetails = inboundOrderRepository.findDetailsByOrderIdIn(orderIds);
            Map<Long, InboundOrder> orderMap = completedOrders.stream().collect(Collectors.toMap(InboundOrder::getId, o -> o));

            for (InboundOrderDetail det : allQcDetails) {
                if (det.getQuantityDamaged() != null && det.getQuantityDamaged().doubleValue() > 0) {
                    InboundOrder order = orderMap.get(det.getInboundOrderId());
                    Product prod = productIndex.get(det.getProductId());
                    InventoryStatsDTO.LossDetail ld = new InventoryStatsDTO.LossDetail();
                    ld.setDate(order != null ? order.getReceiptDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "---");
                    ld.setType("QC");
                    ld.setProductName(prod != null ? prod.getName() : "Sản phẩm #" + det.getProductId());
                    ld.setSku(prod != null ? prod.getSku() : "N/A");
                    ld.setQuantity(det.getQuantityDamaged().doubleValue());
                    ld.setReason(det.getQcNotes() != null ? det.getQcNotes() : "Hàng lỗi khi nhập");
                    ld.setReferenceCode(order != null ? order.getReceiptCode() : "N/A");
                    lossDetails.add(ld);
                }
            }
        }

        // Dùng query DB có điều kiện thay vì findAll()
        transactionRepository.findNegativeAdjustmentsByDay(startDT, endDT, filterId).stream()
            .forEach(row -> {
                // row: Object[]{date, productId, sumQty}
                Integer productId = ((Number) row[1]).intValue();
                double qty = ((Number) row[2]).doubleValue();
                // Cần lấy chi tiết từng transaction — dùng dữ liệu aggregate để hiển thị tổng theo ngày
                Product prod = productIndex.get(productId);
                LocalDate date;
                if (row[0] instanceof LocalDate) date = (LocalDate) row[0];
                else if (row[0] instanceof java.sql.Date) date = ((java.sql.Date) row[0]).toLocalDate();
                else date = LocalDate.parse(row[0].toString());
                InventoryStatsDTO.LossDetail ld = new InventoryStatsDTO.LossDetail();
                ld.setDate(date.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
                ld.setType("ADJUSTMENT");
                ld.setProductName(prod != null ? prod.getName() : "Sản phẩm #" + productId);
                ld.setSku(prod != null ? prod.getSku() : "N/A");
                ld.setQuantity(Math.abs(qty));
                ld.setReason("Sai lệch khi kiểm đếm thực tế");
                ld.setReferenceCode("ADJ-" + date);
                lossDetails.add(ld);
            });

        double totalValue = summaries.stream().mapToDouble(s -> s.getStockValue()).sum();
        dto.setProductStocks(summaries);
        dto.setAbcAnalysis(abcResult);
        dto.setLossDetails(lossDetails);
        dto.setTotalStockValue(totalValue);
        dto.setTotalProducts(summaries.size());
        dto.setLowStockProducts(lowCount);
        dto.setZeroStockProducts(zeroCount);
        return dto;
    }

    private List<DailyFlowDTO> buildDailyFlow(int days, Integer filterId) {
        LocalDate today = TimeUtils.now().toLocalDate();
        LocalDate startDate = today.minusDays(days - 1);
        LocalDateTime startDT = startDate.atStartOfDay();
        LocalDateTime endDT = today.plusDays(1).atStartOfDay();

        // Dùng query DB đã có trong repo thay vì findAll()
        List<Object[]> rawData = transactionRepository.findDailyFlow(startDT, endDT, filterId);

        Map<LocalDate, Map<String, Double>> dataMap = new LinkedHashMap<>();
        for (Object[] row : rawData) {
            LocalDate date;
            if (row[0] instanceof LocalDate) date = (LocalDate) row[0];
            else if (row[0] instanceof java.sql.Date) date = ((java.sql.Date) row[0]).toLocalDate();
            else date = LocalDate.parse(row[0].toString());
            String type = (String) row[1];
            double qty = Math.abs(((Number) row[2]).doubleValue());
            dataMap.computeIfAbsent(date, k -> new HashMap<>()).merge(type, qty, Double::sum);
        }

        List<DailyFlowDTO> result = new ArrayList<>();
        for (int i = 0; i < days; i++) {
            LocalDate date = startDate.plusDays(i);
            Map<String, Double> dayData = dataMap.getOrDefault(date, Collections.emptyMap());
            DailyFlowDTO flow = new DailyFlowDTO();
            flow.setDate(date.format(DateTimeFormatter.ISO_LOCAL_DATE));
            flow.setLabel(String.valueOf(date.getDayOfWeek().getValue()));
            flow.setInbound(dayData.getOrDefault("INBOUND", 0.0));
            flow.setOutbound(dayData.getOrDefault("OUTBOUND", 0.0));
            result.add(flow);
        }
        return result;
    }

    private List<Map<String, Object>> buildTopStockProducts(int limit, Integer filterId) {
        // Dùng DB query thay vì findAll() + Java grouping
        List<Object[]> raw = inventoryRepository.findTopStockProductsByCompany(filterId);
        List<Map<String, Object>> result = new ArrayList<>();
        int count = 0;
        for (Object[] row : raw) {
            if (count >= limit) break;
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("sku",        row[1]);  // p.sku
            item.put("name",       row[2]);  // p.name
            item.put("totalStock", ((Number) row[3]).doubleValue()); // SUM(quantityOnHand)
            result.add(item);
            count++;
        }
        return result;
    }

    private List<Map<String, Object>> buildNearExpiryProducts(int limit, Integer filterId) {
        LocalDate today = TimeUtils.now().toLocalDate();
        LocalDate threshold = today.plusDays(30);
        List<Object[]> raw = batchRepository.findNearExpiryBatchesWithStock(today, threshold, filterId);
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

    private List<Map<String, Object>> buildStockByCategory(Integer filterId) {
        // Dùng DB query thay vì findAll() + Java grouping
        List<Object[]> raw = inventoryRepository.findStockByCategoryForCompany(filterId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : raw) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("category",   row[0]); // pc.name
            item.put("totalStock", ((Number) row[1]).doubleValue());
            result.add(item);
        }
        return result;
    }

    private List<InventoryStatsDTO.AbcItem> calculateABC(List<InventoryStatsDTO.ProductStockSummary> summaries) {
        List<InventoryStatsDTO.ProductStockSummary> sorted = summaries.stream()
                .sorted(Comparator.comparingDouble(InventoryStatsDTO.ProductStockSummary::getStockValue).reversed())
                .collect(Collectors.toList());
        double totalValue = sorted.stream().mapToDouble(s -> s.getStockValue()).sum();
        if (totalValue <= 0) return List.of(new InventoryStatsDTO.AbcItem("A", 0, 0, 0), new InventoryStatsDTO.AbcItem("B", 0, 0, 0), new InventoryStatsDTO.AbcItem("C", 0, 0, 0));

        double cumulative = 0;
        int aCount = 0, bCount = 0, cCount = 0;
        double aValue = 0, bValue = 0, cValue = 0;
        for (InventoryStatsDTO.ProductStockSummary s : sorted) {
            cumulative += s.getStockValue();
            double pct = cumulative / totalValue * 100;
            if (pct <= 80) { s.setAbcClass("A"); aCount++; aValue += s.getStockValue(); }
            else if (pct <= 95) { s.setAbcClass("B"); bCount++; bValue += s.getStockValue(); }
            else { s.setAbcClass("C"); cCount++; cValue += s.getStockValue(); }
        }
        List<InventoryStatsDTO.AbcItem> result = new ArrayList<>();
        result.add(new InventoryStatsDTO.AbcItem("A", aCount, aValue, Math.round(aValue / totalValue * 1000.0) / 10.0));
        result.add(new InventoryStatsDTO.AbcItem("B", bCount, bValue, Math.round(bValue / totalValue * 1000.0) / 10.0));
        result.add(new InventoryStatsDTO.AbcItem("C", cCount, cValue, Math.round(cValue / totalValue * 1000.0) / 10.0));
        return result;
    }

    private Map<Integer, Double> toProductMap(List<Object[]> rows) {
        Map<Integer, Double> map = new HashMap<>();
        for (Object[] row : rows) {
            Integer productId = ((Number) row[0]).intValue();
            double value = ((Number) row[1]).doubleValue();
            map.put(productId, value);
        }
        return map;
    }

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
