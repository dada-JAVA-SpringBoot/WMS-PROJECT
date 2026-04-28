package com.wmsbackend.controller;

import com.wmsbackend.entity.*;
import com.wmsbackend.repository.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class MasterDataController {

    private final SupplierRepository supplierRepo;
    private final ProductRepository productRepo;
    private final BatchRepository batchRepo;
    private final LocationRepository locationRepo;

    public MasterDataController(SupplierRepository supplierRepo,
                                ProductRepository productRepo,
                                BatchRepository batchRepo,
                                LocationRepository locationRepo) {
        this.supplierRepo = supplierRepo;
        this.productRepo = productRepo;
        this.batchRepo = batchRepo;
        this.locationRepo = locationRepo;
    }

    @GetMapping("/master-data/suppliers")
    public List<Supplier> getAllSuppliers() {
        return supplierRepo.findAll();
    }

    @GetMapping("/products")
    public List<Product> getAllProducts() {
        return productRepo.findAll();
    }

    @GetMapping("/batches")
    public List<Batch> getAllBatches() {
        return batchRepo.findAll();
    }

    @GetMapping("/locations")
    public List<Location> getAllLocations() {
        return locationRepo.findAll();
    }
}