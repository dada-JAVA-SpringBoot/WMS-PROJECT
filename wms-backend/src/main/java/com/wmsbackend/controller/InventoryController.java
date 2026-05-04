package com.wmsbackend.controller;

import com.wmsbackend.dto.InventoryDetailDTO;
import com.wmsbackend.dto.InventoryTransferRequestDTO;
import com.wmsbackend.repository.InventoryRepository;
import com.wmsbackend.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@CrossOrigin(origins = "*") // Cho phép React gọi API
public class InventoryController {

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private InventoryService inventoryService;

    // API lấy chi tiết tồn kho theo ID Sản phẩm
    @GetMapping("/product/{productId}")
    public List<InventoryDetailDTO> getInventoryDetails(@PathVariable Integer productId) {
        return inventoryRepository.findInventoryDetailsByProductId(productId);
    }

    // API di chuyển tồn kho
    @PostMapping("/transfer")
    public void transferInventory(@RequestBody InventoryTransferRequestDTO request) {
        inventoryService.transferInventory(request);
    }
}