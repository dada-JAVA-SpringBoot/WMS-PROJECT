package com.wmsbackend.controller;

import com.wmsbackend.dto.DashboardDTO;
import com.wmsbackend.dto.DailyFlowDTO;
import com.wmsbackend.dto.InventoryStatsDTO;
import com.wmsbackend.dto.StatisticalSummaryDTO;
import com.wmsbackend.entity.Inventory;
import com.wmsbackend.entity.Product;
import com.wmsbackend.entity.Supplier;
import com.wmsbackend.repository.*;
import com.wmsbackend.service.FinancialService;
import com.wmsbackend.service.StatisticalService;
import com.wmsbackend.security.WorkspaceContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/stats")
public class StatisticalController {

    @Autowired private StatisticalService statisticalService;
    @Autowired private FinancialService financialService;

    // ── Legacy Repositories (giữ lại cho endpoint /summary cũ) ─────────────
    @Autowired private ProductRepository productRepository;
    @Autowired private InventoryRepository inventoryRepository;
    @Autowired private InboundOrderRepository inboundOrderRepository;
    @Autowired private OutboundOrderRepository outboundOrderRepository;
    @Autowired private LocationRepository locationRepository;
    @Autowired private CustomerRepository customerRepository;
    @Autowired private SupplierRepository supplierRepository;

    // ════════════════════════════════════════════════════════════════════════
    // 1. Dashboard Overview (MỚI)
    // ════════════════════════════════════════════════════════════════════════
    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STOREKEEPER','INBOUND_STAFF','OUTBOUND_STAFF','QUALITY_CONTROL')")
    public DashboardDTO getDashboard() {
        return statisticalService.getDashboard();
    }

    // ════════════════════════════════════════════════════════════════════════
    // 2. Inventory Stats & ABC (MỚI)
    // ════════════════════════════════════════════════════════════════════════
    @GetMapping("/inventory")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STOREKEEPER','INBOUND_STAFF','OUTBOUND_STAFF','QUALITY_CONTROL','HANDLER','CHECKER')")
    public ResponseEntity<?> getInventoryStats(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {

        try {
            LocalDate start, end;
            try {
                start = (startDate != null && !startDate.isBlank()) ? LocalDate.parse(startDate) : LocalDate.now().withDayOfMonth(1);
                end   = (endDate != null && !endDate.isBlank())   ? LocalDate.parse(endDate)   : LocalDate.now();
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Định dạng ngày không hợp lệ (YYYY-MM-DD)"));
            }

            return ResponseEntity.ok(statisticalService.getInventoryStats(start, end));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", "Lỗi xử lý thống kê: " + e.getMessage()));
        }
    }
    // ════════════════════════════════════════════════════════════════════════
    // 3. Legacy endpoint (giữ tương thích ngược)
    // ════════════════════════════════════════════════════════════════════════
    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public StatisticalSummaryDTO getSummary() {
        Integer companyId = WorkspaceContext.getCurrentCompanyId();
        StatisticalSummaryDTO dto = new StatisticalSummaryDTO();
        List<Product> products = productRepository.findAll().stream()
                .filter(p -> companyId == null || companyId.equals(p.getCompanyId()))
                .collect(Collectors.toList());
        dto.setTotalSkus(products.size());

        Map<Integer, BigDecimal> stockByProduct = inventoryRepository.findAll().stream()
                .filter(i -> companyId == null || companyId.equals(i.getCompanyId()))
                .collect(Collectors.groupingBy(
                        Inventory::getProductId,
                        Collectors.reducing(BigDecimal.ZERO,
                                i -> i.getQuantityOnHand() != null ? i.getQuantityOnHand() : BigDecimal.ZERO,
                                BigDecimal::add)));

        double totalQty = stockByProduct.values().stream()
                .mapToDouble(BigDecimal::doubleValue)
                .sum();
        dto.setTotalStockQuantity(totalQty);

        List<String> pendingInboundStatuses = List.of("DRAFT", "ORDERED", "IN_TRANSIT", "PENDING");
        List<String> pendingOutboundStatuses = List.of("DRAFT", "ALLOCATED", "PENDING");
        dto.setPendingInbound(companyId == null
                ? inboundOrderRepository.countByStatusIn(pendingInboundStatuses)
                : inboundOrderRepository.countByStatusInAndCompanyId(pendingInboundStatuses, companyId));
        dto.setPendingOutbound(companyId == null
                ? outboundOrderRepository.countByStatusIn(pendingOutboundStatuses)
                : outboundOrderRepository.countByStatusInAndCompanyId(pendingOutboundStatuses, companyId));

        Long totalCapacity = locationRepository.findAll().stream()
                .filter(l -> companyId == null || companyId.equals(l.getCompanyId()))
                .mapToLong(l -> l.getCapacity() != null ? l.getCapacity() : 0)
                .sum();
        dto.setWarehouseOccupancyRate(
                (totalCapacity != null && totalCapacity > 0) 
                ? (totalQty / totalCapacity * 100) 
                : 0);

        List<Map<String, Object>> lowStockItems = products.stream()
                .filter(p -> p.getSafetyStock() != null && p.getSafetyStock() > 0)
                .filter(p -> stockByProduct.getOrDefault(p.getId(), BigDecimal.ZERO).doubleValue() < p.getSafetyStock())
                .limit(5)
                .map(p -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("name", p.getName());
                    item.put("sku", p.getSku());
                    item.put("current", stockByProduct.getOrDefault(p.getId(), BigDecimal.ZERO).doubleValue());
                    item.put("safety", p.getSafetyStock());
                    return item;
                })
                .collect(Collectors.toList());
        dto.setLowStockItems(lowStockItems);

        InventoryStatsDTO inventoryStats = statisticalService.getInventoryStats(
                LocalDate.now().withDayOfMonth(1),
                LocalDate.now());
        List<Map<String, Object>> abcAnalysis = inventoryStats.getAbcAnalysis().stream()
                .map(item -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("category", item.getClassName());
                    map.put("value", item.getTotalValue());
                    map.put("percentage", item.getPercentage());
                    map.put("count", item.getProductCount());
                    return map;
                })
                .collect(Collectors.toList());
        dto.setAbcAnalysis(abcAnalysis);

        List<Map<String, Object>> stores = customerRepository.findAll().stream()
                .filter(c -> companyId == null || companyId.equals(c.getCompanyId()))
                .limit(5)
                .map(c -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("name", c.getName());
                    map.put("value", 1000000);
                    return map;
                })
                .collect(Collectors.toList());
        dto.setTopStores(stores);

        List<Map<String, Object>> suppliers = supplierRepository.findAll().stream()
                .filter(s -> companyId == null || companyId.equals(s.getCompanyId()))
                .limit(5)
                .map(s -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("name", s.getName());
                    map.put("value", 1000000);
                    return map;
                })
                .collect(Collectors.toList());
        dto.setTopSuppliers(suppliers);
        return dto;
    }

    // ── /finance  — summary cards (giữ nguyên) ───────────────────────────
    @GetMapping("/finance")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STOREKEEPER','INBOUND_STAFF','OUTBOUND_STAFF','QUALITY_CONTROL','HANDLER')")
    public ResponseEntity<?> getFinancialSummary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        if (from.isAfter(to))
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Ngày bắt đầu không được lớn hơn ngày kết thúc"));

        return ResponseEntity.ok(financialService.getSummary(from, to));
    }

    // ── /finance/by-day  — chart theo ngày ───────────────────────────────
    @GetMapping("/finance/by-day")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STOREKEEPER','INBOUND_STAFF','OUTBOUND_STAFF','QUALITY_CONTROL','HANDLER')")
    public ResponseEntity<?> getFinanceByDay(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        if (from.isAfter(to))
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Ngày bắt đầu không được lớn hơn ngày kết thúc"));

        return ResponseEntity.ok(financialService.getByDay(from, to));
    }

    // ── /finance/by-month — chart theo tháng ─────────────────────────────
    @GetMapping("/finance/by-month")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STOREKEEPER','INBOUND_STAFF','OUTBOUND_STAFF','QUALITY_CONTROL','HANDLER')")
    public ResponseEntity<?> getFinanceByMonth(@RequestParam int year) {
        return ResponseEntity.ok(financialService.getByMonth(year));
    }

    // ── /finance/by-year  — chart theo năm ───────────────────────────────
    @GetMapping("/finance/by-year")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STOREKEEPER','INBOUND_STAFF','OUTBOUND_STAFF','QUALITY_CONTROL','HANDLER')")
    public ResponseEntity<?> getFinanceByYear(
            @RequestParam int fromYear,
            @RequestParam int toYear) {

        if (fromYear > toYear)
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Năm bắt đầu không được lớn hơn năm kết thúc"));

        return ResponseEntity.ok(financialService.getByYear(fromYear, toYear));
    }
}
