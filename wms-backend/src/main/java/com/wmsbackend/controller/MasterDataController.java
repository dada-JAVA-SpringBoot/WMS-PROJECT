// ================================================================
// 3. MasterDataController.java
// ================================================================
package com.wmsbackend.controller;

import com.wmsbackend.entity.*;
import com.wmsbackend.repository.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class MasterDataController {

    private final SupplierRepository supplierRepo;
    private final ProductRepository  productRepo;
    private final BatchRepository    batchRepo;
    private final LocationRepository locationRepo;

    public MasterDataController(SupplierRepository supplierRepo,
                                ProductRepository productRepo,
                                BatchRepository batchRepo,
                                LocationRepository locationRepo) {
        this.supplierRepo = supplierRepo;
        this.productRepo  = productRepo;
        this.batchRepo    = batchRepo;
        this.locationRepo = locationRepo;
    }

    @GetMapping("/master-data/suppliers")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STOREKEEPER','INBOUND_STAFF')")
    public List<Supplier> getAllSuppliers() {
        return supplierRepo.findAll();
    }

    // GET batches — cần khi nhập/xuất/kiểm kê
    @GetMapping("/batches")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STOREKEEPER','INBOUND_STAFF','OUTBOUND_STAFF','CHECKER','QUALITY_CONTROL')")
    public List<Batch> getAllBatches() {
        return batchRepo.findAll();
    }

    @PostMapping("/batches")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STOREKEEPER','INBOUND_STAFF')")
    public Batch createBatch(@RequestBody Batch batch) {
        return batchRepo.save(batch);
    }
}