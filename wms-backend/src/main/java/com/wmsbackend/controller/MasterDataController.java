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

    @PostMapping("/batches")
    public Batch createBatch(@RequestBody Batch batch) {
        return batchRepo.save(batch);
    }

    @GetMapping("/locations")
    public List<Location> getAllLocations() {
        return locationRepo.findAll();
    }

    @PostMapping("/locations")
    public Location createLocation(@RequestBody Location location) {
        return locationRepo.save(location);
    }

    @PutMapping("/locations/{id}")
    public Location updateLocation(@PathVariable Integer id, @RequestBody Location location) {
        Location existing = locationRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Location not found: " + id));

        existing.setWarehouseId(location.getWarehouseId());
        existing.setZone(location.getZone());
        existing.setAisle(location.getAisle());
        existing.setRack(location.getRack());
        existing.setLevel(location.getLevel());
        existing.setBinCode(location.getBinCode());
        existing.setCapacity(location.getCapacity());
        existing.setStorageType(location.getStorageType());

        return locationRepo.save(existing);
    }

    @DeleteMapping("/locations/{id}")
    public void deleteLocation(@PathVariable Integer id) {
        locationRepo.deleteById(id);
    }
}
