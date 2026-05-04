// ================================================================
// 6. SupplierController.java
// ================================================================
package com.wmsbackend.controller;

import com.wmsbackend.dto.SupplierDTO;
import com.wmsbackend.entity.Supplier;
import com.wmsbackend.service.SupplierService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/suppliers")
public class SupplierController {

    @Autowired
    private SupplierService supplierService;

    // GET — INBOUND_STAFF cần khi tra cứu NCC để tạo phiếu nhập
    //       MANAGER xem để báo cáo
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STOREKEEPER','INBOUND_STAFF')")
    public List<SupplierDTO> getSuppliers(@RequestParam(required = false) String keyword) {
        if (keyword != null && !keyword.isBlank()) return supplierService.searchSuppliers(keyword);
        return supplierService.getAllSuppliers();
    }

    // POST — chỉ ADMIN
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Supplier createSupplier(@RequestBody Supplier supplier) {
        return supplierService.createSupplier(supplier);
    }

    // PUT — chỉ ADMIN
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Supplier updateSupplier(@PathVariable Integer id, @RequestBody Supplier supplier) {
        return supplierService.updateSupplier(id, supplier);
    }

    // DELETE — chỉ ADMIN
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteSupplier(@PathVariable Integer id) {
        supplierService.deleteSupplier(id);
    }
}