// ================================================================
// 2. InventoryController.java
// ================================================================
package com.wmsbackend.controller;

import com.wmsbackend.dto.InventoryDetailDTO;
import com.wmsbackend.repository.InventoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    @Autowired
    private InventoryRepository inventoryRepository;

    // GET — STOREKEEPER và CHECKER chuyên xem tồn kho
    //       ADMIN, MANAGER xem để quản lý/báo cáo
    //       INBOUND_STAFF, OUTBOUND_STAFF cần xem trước khi nhập/xuất
    @GetMapping("/product/{productId}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STOREKEEPER','INBOUND_STAFF','OUTBOUND_STAFF','CHECKER')")
    public List<InventoryDetailDTO> getInventoryDetails(@PathVariable Integer productId) {
        return inventoryRepository.findInventoryDetailsByProductId(productId);
    }
}