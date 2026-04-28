package com.wmsbackend.controller;

import com.wmsbackend.dto.SupplierDTO;
import com.wmsbackend.entity.Supplier;
import com.wmsbackend.service.SupplierService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/suppliers")
@CrossOrigin("*")
public class SupplierController {

    @Autowired
    private SupplierService supplierService;

    @GetMapping
    public List<SupplierDTO> getSuppliers(@RequestParam(required = false) String keyword) {
        if (keyword != null && !keyword.isBlank()) {
            return supplierService.searchSuppliers(keyword);
        }
        return supplierService.getAllSuppliers();
    }

    @PostMapping
    public Supplier createSupplier(@RequestBody Supplier supplier) {
        return supplierService.createSupplier(supplier);
    }

    @PutMapping("/{id}")
    public Supplier updateSupplier(@PathVariable Integer id, @RequestBody Supplier supplier) {
        return supplierService.updateSupplier(id, supplier);
    }

    @DeleteMapping("/{id}")
    public void deleteSupplier(@PathVariable Integer id) {
        supplierService.deleteSupplier(id);
    }
}