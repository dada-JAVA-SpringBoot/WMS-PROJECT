// ================================================================
// 2. InventoryController.java
// ================================================================
package com.wmsbackend.controller;

import com.wmsbackend.dto.InventoryDetailDTO;
import com.wmsbackend.dto.InventoryTransferRequestDTO;
import com.wmsbackend.repository.InventoryRepository;
import com.wmsbackend.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

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
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STOREKEEPER','INBOUND_STAFF','OUTBOUND_STAFF','CHECKER')")
    public List<InventoryDetailDTO> getInventoryDetails(@PathVariable Integer productId) {
        return inventoryRepository.findInventoryDetailsByProductId(productId);
    }

    // API di chuyển tồn kho
    @PostMapping("/transfer")
    public void transferInventory(@RequestBody InventoryTransferRequestDTO request) {
        inventoryService.transferInventory(request);
    }
}