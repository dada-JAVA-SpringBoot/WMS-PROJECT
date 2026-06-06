package com.wmsbackend.service.impl;

import com.wmsbackend.dto.*;
import com.wmsbackend.entity.Product;
import com.wmsbackend.repository.*;
import com.wmsbackend.service.StatisticalService;
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

    @Override
    public DashboardDTO getDashboard() {
        DashboardDTO dto = new DashboardDTO();
        dto.setTotalSkus(productRepository.count());
        BigDecimal totalQty = inventoryRepository.sumTotalQuantityOnHand();
        dto.setTotalStockQuantity(totalQty != null ? totalQty.doubleValue() : 0.0);

        Long totalCapacity = locationRepository.sumTotalCapacity();
        dto.setWarehouseOccupancyRate(
                (totalCapacity != null && totalCapacity > 0) 
                ? Math.round((totalQty != null ? totalQty.doubleValue() : 0.0) / totalCapacity * 100.0 * 10.0) / 10.0 
                : 0);

        dto.setLowStockCount(productRepository.countLowStockProducts());
        dto.setPendingInbound(
                inboundOrderRepository.countByStatusIn(List.of("DRAFT", "ORDERED", "IN_TRANSIT", "PENDING")));
        dto.setPendingOutbound(
                outboundOrderRepository.countByStatusIn(List.of("DRAFT", "ALLOCATED", "PENDING")));

        dto.setDailyFlow(buildDailyFlow(7));
        dto.setTopStockProducts(buildTopStockProducts(5));
        dto.setNearExpiryProducts(buildNearExpiryProducts(5));
        dto.setStockByCategory(buildStockByCategory());
        return dto;
    }

    @Override
    public InventoryStatsDTO getInventoryStats(LocalDate startDate, LocalDate endDate) {
        InventoryStatsDTO dto = new InventoryStatsDTO();
        LocalDateTime startDT = startDate.atStartOfDay();
        LocalDateTime endDT = endDate.plusDays(1).atStartOfDay();

        List<Product> products = productRepository.findAllActiveProducts();
        Map<Integer, Double> inboundMap = toProductMap(transactionRepository.sumInboundByProductInPeriod(startDT, endDT));
        Map<Integer, Double> outboundMap = toProductMap(transactionRepository.sumOutboundByProductInPeriod(startDT, endDT));
        Map<Integer, Double> adjustmentMap = toProductMap(transactionRepository.sumAdjustmentsByProductInPeriod(startDT, endDT));

        Map<Integer, Double> currentStockMap = new HashMap<>();
        inventoryRepository.findProductsWithStock().forEach(row -> {
            Integer productId = ((Number) row[0]).intValue();
            double qty = ((Number) row[3]).doubleValue();
            currentStockMap.put(productId, qty);
        });

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
        
        List<com.wmsbackend.entity.InboundOrder> completedOrders = inboundOrderRepository.findByStatus("COMPLETED").stream()
            .filter(o -> o.getReceiptDate() != null && !o.getReceiptDate().isBefore(startDT) && o.getReceiptDate().isBefore(endDT))
            .collect(Collectors.toList());

        if (!completedOrders.isEmpty()) {
            List<Long> orderIds = completedOrders.stream().map(com.wmsbackend.entity.InboundOrder::getId).collect(Collectors.toList());
            List<com.wmsbackend.entity.InboundOrderDetail> allQcDetails = inboundOrderRepository.findDetailsByOrderIdIn(orderIds);
            Map<Long, com.wmsbackend.entity.InboundOrder> orderMap = completedOrders.stream().collect(Collectors.toMap(com.wmsbackend.entity.InboundOrder::getId, o -> o));

            for (com.wmsbackend.entity.InboundOrderDetail det : allQcDetails) {
                if (det.getQuantityDamaged() != null && det.getQuantityDamaged().doubleValue() > 0) {
                    com.wmsbackend.entity.InboundOrder order = orderMap.get(det.getInboundOrderId());
                    Product prod = products.stream().filter(pr -> pr.getId().equals(det.getProductId())).findFirst().orElse(null);
                    InventoryStatsDTO.LossDetail ld = new InventoryStatsDTO.LossDetail();
                    ld.setDate(order != null ? order.getReceiptDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "---");
                    ld.setType("KIỂM ĐỊNH (QC)");
                    ld.setProductName(prod != null ? prod.getName() : "Sản phẩm #" + det.getProductId());
                    ld.setSku(prod != null ? prod.getSku() : "N/A");
                    ld.setQuantity(det.getQuantityDamaged().doubleValue());
                    ld.setReason(det.getQcNotes() != null ? det.getQcNotes() : "Hàng lỗi khi nhập");
                    ld.setReferenceCode(order != null ? order.getReceiptCode() : "N/A");
                    lossDetails.add(ld);
                }
            }
        }

        transactionRepository.findAll().stream() 
            .filter(t -> t.getTransactionType().equals("ADJUSTMENT") && 
                         t.getQuantityChange() != null && t.getQuantityChange().doubleValue() < 0 &&
                         t.getCreatedAt() != null && !t.getCreatedAt().isBefore(startDT) && t.getCreatedAt().isBefore(endDT))
            .forEach(tx -> {
                Product prod = products.stream().filter(pr -> pr.getId().equals(tx.getProductId())).findFirst().orElse(null);
                InventoryStatsDTO.LossDetail ld = new InventoryStatsDTO.LossDetail();
                ld.setDate(tx.getCreatedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
                ld.setType("KIỂM KÊ / ĐIỀU CHỈNH");
                ld.setProductName(prod != null ? prod.getName() : "Sản phẩm #" + tx.getProductId());
                ld.setSku(prod != null ? prod.getSku() : "N/A");
                ld.setQuantity(Math.abs(tx.getQuantityChange().doubleValue()));
                ld.setReason("Sai lệch khi kiểm đếm thực tế");
                ld.setReferenceCode("TX-" + tx.getId());
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

    private List<DailyFlowDTO> buildDailyFlow(int days) {
        LocalDate today = TimeUtils.now().toLocalDate();
        LocalDate startDate = today.minusDays(days - 1);
        LocalDateTime startDT = startDate.atStartOfDay();
        LocalDateTime endDT = today.plusDays(1).atStartOfDay();

        List<Object[]> rawData = transactionRepository.findDailyFlow(startDT, endDT);
        Map<LocalDate, Map<String, Double>> dataMap = new LinkedHashMap<>();
        for (Object[] row : rawData) {
            LocalDate date;
            if (row[0] instanceof LocalDate) date = (LocalDate) row[0];
            else if (row[0] instanceof java.sql.Date) date = ((java.sql.Date) row[0]).toLocalDate();
            else date = LocalDate.parse(row[0].toString());
            String type = (String) row[1];
            double qty = Math.abs(((Number) row[2]).doubleValue());
            dataMap.computeIfAbsent(date, k -> new HashMap<>()).put(type, qty);
        }

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

    private List<Map<String, Object>> buildNearExpiryProducts(int limit) {
        LocalDate today = TimeUtils.now().toLocalDate();
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
