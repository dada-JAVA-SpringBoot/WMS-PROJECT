// ================================================================
// 2. InventoryController.java
// ================================================================
package com.wmsbackend.controller;

import com.wmsbackend.dto.FEFOSuggestionDTO;
import com.wmsbackend.dto.InventoryDetailDTO;
import com.wmsbackend.dto.InventoryTransferRequestDTO;
import com.wmsbackend.repository.InventoryRepository;
import com.wmsbackend.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private InventoryService inventoryService;

    // GET — STOREKEEPER và CHECKER chuyên xem tồn kho
    //       ADMIN, MANAGER xem để quản lý/báo cáo
    //       INBOUND_STAFF, OUTBOUND_STAFF cần xem trước khi nhập/xuất
    // (API lấy chi tiết tồn kho theo ID Sản phẩm)
    @GetMapping("/product/{productId}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STOREKEEPER','INBOUND_STAFF','OUTBOUND_STAFF','CHECKER','QUALITY_CONTROL')")
    public List<InventoryDetailDTO> getInventoryDetails(@PathVariable Integer productId) {
        return inventoryRepository.findInventoryDetailsByProductId(productId);
    }

    @GetMapping("/location/{locationId}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STOREKEEPER','INBOUND_STAFF','OUTBOUND_STAFF','CHECKER','QUALITY_CONTROL')")
    public List<InventoryDetailDTO> getInventoryByLocation(@PathVariable Integer locationId) {
        return inventoryRepository.findInventoryDetailsByLocationId(locationId);
    }

    /**
     * Thuật toán FEFO (First Expired, First Out)
     * Gợi ý bốc hàng dựa trên ngày hết hạn sớm nhất.
     */
    @GetMapping("/suggest-fefo")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STOREKEEPER','OUTBOUND_STAFF','QUALITY_CONTROL')")
    public List<FEFOSuggestionDTO> suggestFEFO(@RequestParam Integer productId, @RequestParam BigDecimal quantity) {
        // Lấy danh sách tồn kho chi tiết, đã được ORDER BY expiryDate ASC trong Repository
        List<InventoryDetailDTO> stocks = inventoryRepository.findInventoryDetailsByProductId(productId);
        
        List<FEFOSuggestionDTO> suggestions = new ArrayList<>();
        BigDecimal remaining = quantity;

        for (InventoryDetailDTO stock : stocks) {
            if (remaining.compareTo(BigDecimal.ZERO) <= 0) break;

            // Tính số lượng khả dụng (OnHand - Allocated)
            BigDecimal available = stock.getOnHand().subtract(stock.getAllocated());
            if (available.compareTo(BigDecimal.ZERO) <= 0) continue;

            // Lấy lượng nhỏ nhất giữa lượng cần và lượng có
            BigDecimal take = available.min(remaining);
            
            suggestions.add(new FEFOSuggestionDTO(
                stock.getLocationId(),
                stock.getLocCode(),
                stock.getBatchId(),
                stock.getBatchCode(),
                stock.getExpiryDate(),
                take
            ));

            remaining = remaining.subtract(take);
        }

        return suggestions;
    }

    // API di chuyển tồn kho
    @PostMapping("/transfer")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STOREKEEPER')")
    public void transferInventory(@RequestBody InventoryTransferRequestDTO request) {
        inventoryService.transferInventory(request);
    }
}