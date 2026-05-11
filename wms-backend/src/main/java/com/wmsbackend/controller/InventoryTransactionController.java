package com.wmsbackend.controller;

import com.wmsbackend.dto.InventoryTransactionDTO;
import com.wmsbackend.repository.InventoryTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class InventoryTransactionController {

    @Autowired
    private InventoryTransactionRepository transactionRepository;

    @GetMapping("/history")
    public List<InventoryTransactionDTO> getHistory() {
        return transactionRepository.findAllDetailed();
    }
}
