package com.wmsbackend.controller;

import com.wmsbackend.dto.InventoryDetailDTO;
import com.wmsbackend.repository.InventoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@CrossOrigin(origins = "*") // Cho phép React gọi API
public class InventoryController {

    @Autowired
    private InventoryRepository inventoryRepository;

    // API lấy chi tiết tồn kho theo ID Sản phẩm
    @GetMapping("/product/{productId}")
    public List<InventoryDetailDTO> getInventoryDetails(@PathVariable Integer productId) {
        return inventoryRepository.findInventoryDetailsByProductId(productId);
    }
}