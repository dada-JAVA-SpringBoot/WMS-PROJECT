// ================================================================
// 3. MasterDataController.java
// ================================================================
package com.wmsbackend.controller;

import com.wmsbackend.entity.*;
import com.wmsbackend.repository.*;
import com.wmsbackend.security.WorkspaceContext;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

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
        Integer companyId = WorkspaceContext.getCurrentCompanyId();
        return supplierRepo.findAll().stream()
                .filter(s -> companyId == null || companyId.equals(s.getCompanyId()))
                .collect(Collectors.toList());
    }

    // GET batches — cần khi nhập/xuất/kiểm kê
    @GetMapping("/batches")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STOREKEEPER','INBOUND_STAFF','OUTBOUND_STAFF','CHECKER','QUALITY_CONTROL')")
    public List<Batch> getAllBatches() {
        Integer companyId = WorkspaceContext.getCurrentCompanyId();
        return batchRepo.findAll().stream()
                .filter(b -> companyId == null || companyId.equals(b.getCompanyId()))
                .collect(Collectors.toList());
    }

    @PostMapping("/batches")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STOREKEEPER','INBOUND_STAFF')")
    public Batch createBatch(@RequestBody Batch batch) {
        return batchRepo.save(batch);
    }
}
