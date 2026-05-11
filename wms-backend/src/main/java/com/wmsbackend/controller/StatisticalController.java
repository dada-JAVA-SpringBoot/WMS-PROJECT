package com.wmsbackend.controller;

import com.wmsbackend.dto.DashboardDTO;
import com.wmsbackend.dto.DailyFlowDTO;
import com.wmsbackend.dto.InventoryStatsDTO;
import com.wmsbackend.dto.StatisticalSummaryDTO;
import com.wmsbackend.repository.*;
import com.wmsbackend.service.FinancialService;
import com.wmsbackend.service.StatisticalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

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
        StatisticalSummaryDTO dto = new StatisticalSummaryDTO();
        dto.setTotalSkus(productRepository.count());

        // 2. Total Stock Quantity
        Double totalQty = inventoryRepository.findAll().stream()
                .mapToDouble(i -> i.getQuantityOnHand().doubleValue()).sum();
        dto.setTotalStockQuantity(totalQty != null ? totalQty : 0.0);

        dto.setPendingInbound(inboundOrderRepository.countByStatus("PENDING"));
        dto.setPendingOutbound(outboundOrderRepository.countByStatus("PENDING"));

        long total    = locationRepository.count();
        long occupied = inventoryRepository.countDistinctLocationId();
        dto.setWarehouseOccupancyRate(total > 0 ? (double) occupied / total * 100 : 0);

        List<Map<String, Object>> stores = new ArrayList<>();
        customerRepository.findAll().stream().limit(5).forEach(c -> {
            Map<String, Object> map = new HashMap<>();
            map.put("name", c.getName());
            map.put("value", 1000000);
            stores.add(map);
        });
        dto.setTopStores(stores);
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