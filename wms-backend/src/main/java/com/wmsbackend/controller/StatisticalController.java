package com.wmsbackend.controller;

import com.wmsbackend.dto.StatisticalSummaryDTO;
import com.wmsbackend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stats")
public class StatisticalController {

    @Autowired private ProductRepository productRepository;
    @Autowired private InventoryRepository inventoryRepository;
    @Autowired private InboundOrderRepository inboundOrderRepository;
    @Autowired private OutboundOrderRepository outboundOrderRepository;
    @Autowired private LocationRepository locationRepository;
    @Autowired private CustomerRepository customerRepository;
    @Autowired private SupplierRepository supplierRepository;

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public StatisticalSummaryDTO getSummary() {
        StatisticalSummaryDTO dto = new StatisticalSummaryDTO();

        // 1. Basic Counts
        dto.setTotalSkus(productRepository.count());
        
        // 2. Total Stock Quantity
        Double totalQty = inventoryRepository.findAll().stream()
                .mapToDouble(i -> i.getQuantityOnHand().doubleValue())
                .sum();
        dto.setTotalStockQuantity(totalQty != null ? totalQty : 0.0);

        // 3. Pending Orders
        dto.setPendingInbound(inboundOrderRepository.countByStatus("PENDING")); // Giả sử status PENDING
        dto.setPendingOutbound(outboundOrderRepository.countByStatus("PENDING"));

        // 4. Warehouse Occupancy
        long totalLocations = locationRepository.count();
        long occupiedLocations = inventoryRepository.countDistinctLocationId(); // Cần thêm method này
        dto.setWarehouseOccupancyRate(totalLocations > 0 ? (double) occupiedLocations / totalLocations * 100 : 0);

        // 5. Mock Top Stores (Ví dụ đơn giản, sau này có thể dùng JPQL)
        List<Map<String, Object>> stores = new ArrayList<>();
        customerRepository.findAll().stream().limit(5).forEach(c -> {
            Map<String, Object> map = new HashMap<>();
            map.put("name", c.getName());
            map.put("value", 1000000); // Dummy value
            stores.add(map);
        });
        dto.setTopStores(stores);

        return dto;
    }
}
