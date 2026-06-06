package com.wmsbackend.controller;

import com.wmsbackend.dto.LocationOverviewDTO;
import com.wmsbackend.entity.InboundOrder;
import com.wmsbackend.entity.InboundOrderDetail;
import com.wmsbackend.entity.Inventory;
import com.wmsbackend.entity.Location;
import com.wmsbackend.repository.InboundOrderDetailRepository;
import com.wmsbackend.repository.InboundOrderRepository;
import com.wmsbackend.repository.InventoryRepository;
import com.wmsbackend.repository.LocationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.annotation.PostConstruct;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping({"/api/location-overview", "/api/locations"})
public class LocationOverviewController {

    private final LocationRepository locationRepo;
    private final InventoryRepository inventoryRepo;
    private final InboundOrderRepository inboundOrderRepo;
    private final InboundOrderDetailRepository inboundDetailRepo;
    private final com.wmsbackend.repository.WarehouseRepository warehouseRepo;

    public LocationOverviewController(LocationRepository locationRepo,
                                      InventoryRepository inventoryRepo,
                                      InboundOrderRepository inboundOrderRepo,
                                      InboundOrderDetailRepository inboundDetailRepo,
                                      com.wmsbackend.repository.WarehouseRepository warehouseRepo) {
        this.locationRepo = locationRepo;
        this.inventoryRepo = inventoryRepo;
        this.inboundOrderRepo = inboundOrderRepo;
        this.inboundDetailRepo = inboundDetailRepo;
        this.warehouseRepo = warehouseRepo;
    }

    @PostConstruct
    public void initDefaultWarehouse() {
        try {
            if (warehouseRepo.count() == 0) {
                com.wmsbackend.entity.Warehouse wh = new com.wmsbackend.entity.Warehouse();
                wh.setWarehouseCode("WH-001");
                wh.setName("Kho mặc định");
                wh.setAddress("Hệ thống");
                warehouseRepo.save(wh);
                System.out.println(">>> Đã tạo kho mặc định WH-001 thành công.");
            }
        } catch (Exception e) {
            System.err.println(">>> CẢNH BÁO: Không thể khởi tạo kho mặc định: " + e.getMessage());
            // Không ném ngoại lệ để ứng dụng vẫn có thể khởi động
        }
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STOREKEEPER','INBOUND_STAFF','OUTBOUND_STAFF','QUALITY_CONTROL','CHECKER','HANDLER')")
    public ResponseEntity<List<LocationOverviewDTO>> getOverview() {
        List<Location> locations = locationRepo.findAll();
        if (locations.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }
        List<Integer> locationIds = locations.stream().map(Location::getId).toList();

        Map<Integer, BigDecimal> onHandMap = new HashMap<>();
        Map<Integer, BigDecimal> allocatedMap = new HashMap<>();

        try {
            for (Inventory stock : inventoryRepo.findByLocationIdIn(locationIds)) {
                onHandMap.merge(stock.getLocationId(), safe(stock.getQuantityOnHand()), BigDecimal::add);
                allocatedMap.merge(stock.getLocationId(), safe(stock.getQuantityAllocated()), BigDecimal::add);
            }
        } catch (Exception e) {
            System.err.println(">>> Lỗi khi truy vấn tồn kho theo vị trí: " + e.getMessage());
        }

        Set<Long> pendingOrderIds = inboundOrderRepo.findByStatusIn(List.of("ORDERED", "IN_TRANSIT"))
                .stream()
                .map(InboundOrder::getId)
                .collect(Collectors.toSet());

        Map<Integer, BigDecimal> expectedMap = new HashMap<>();
        if (!pendingOrderIds.isEmpty()) {
            for (InboundOrderDetail detail : inboundDetailRepo.findByInboundOrderIdIn(pendingOrderIds.stream().toList())) {
                BigDecimal expectedQty = safe(detail.getQuantityExpected());
                if (expectedQty.compareTo(BigDecimal.ZERO) <= 0) {
                    expectedQty = safe(detail.getQuantityReceived());
                }
                expectedMap.merge(detail.getLocationId(), expectedQty, BigDecimal::add);
            }
        }

        List<LocationOverviewDTO> dtos = locations.stream().map(location -> {
            BigDecimal onHand = safe(onHandMap.get(location.getId()));
            BigDecimal allocated = safe(allocatedMap.get(location.getId()));
            BigDecimal expected = safe(expectedMap.get(location.getId()));
            BigDecimal capacity = BigDecimal.valueOf(location.getCapacity() != null && location.getCapacity() > 0 ? location.getCapacity() : 100);
            BigDecimal occupied = onHand.add(allocated);
            BigDecimal utilization = capacity.compareTo(BigDecimal.ZERO) > 0
                    ? occupied.multiply(BigDecimal.valueOf(100)).divide(capacity, 2, java.math.RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;

            LocationOverviewDTO dto = new LocationOverviewDTO();
            dto.setId(location.getId());
            dto.setWarehouseId(location.getWarehouseId());
            dto.setZone(location.getZone());
            dto.setAisle(location.getAisle());
            dto.setRack(location.getRack());
            dto.setLevel(location.getLevel());
            dto.setBinCode(location.getBinCode());
            dto.setStorageType(location.getStorageType());
            dto.setContainerType(location.getContainerType());
            dto.setQuantityOnHand(onHand);
            dto.setQuantityAllocated(allocated);
            dto.setQuantityExpected(expected);
            dto.setCapacity(capacity);
            dto.setUtilizationPercent(utilization);

            String[] statusArr = resolveStatus(onHand, allocated, expected, capacity, utilization);
            dto.setStatusCode(statusArr[0]);
            dto.setStatusLabel(statusArr[1]);
            return dto;
        }).toList();

        return ResponseEntity.ok(dtos);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<Location> createLocation(@RequestBody Location location) {
        if (location.getWarehouseId() == null) {
            // Gán kho mặc định nếu không có
            warehouseRepo.findAll().stream().findFirst().ifPresent(wh -> location.setWarehouseId(wh.getId()));
        }
        return ResponseEntity.ok(locationRepo.save(location));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<Location> updateLocation(@PathVariable Integer id, @RequestBody Location updated) {
        return locationRepo.findById(id).map(existing -> {
            existing.setWarehouseId(updated.getWarehouseId());
            existing.setZone(updated.getZone());
            existing.setAisle(updated.getAisle());
            existing.setRack(updated.getRack());
            existing.setLevel(updated.getLevel());
            existing.setBinCode(updated.getBinCode());
            existing.setCapacity(updated.getCapacity());
            existing.setStorageType(updated.getStorageType());
            existing.setContainerType(updated.getContainerType());
            return ResponseEntity.ok(locationRepo.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteLocation(@PathVariable Integer id) {
        if (!locationRepo.existsById(id)) return ResponseEntity.notFound().build();
        try {
            locationRepo.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

    @GetMapping("/overview")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STOREKEEPER')")
    public ResponseEntity<List<LocationOverviewDTO>> getOverviewAlias() {
        return getOverview();
    }

    private BigDecimal safe(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private String[] resolveStatus(BigDecimal onHand, BigDecimal allocated, BigDecimal expected, BigDecimal capacity, BigDecimal utilization) {
        BigDecimal occupied = onHand.add(allocated);
        if (expected.compareTo(BigDecimal.ZERO) > 0 && occupied.compareTo(BigDecimal.ZERO) == 0) {
            return new String[]{"EXPECTED", "Hàng dự kiến"};
        }
        if (allocated.compareTo(BigDecimal.ZERO) > 0 && onHand.compareTo(BigDecimal.ZERO) == 0) {
            return new String[]{"ALLOCATED", "Đã phân bổ"};
        }
        if (occupied.compareTo(BigDecimal.ZERO) == 0) {
            return new String[]{"EMPTY", "Trống"};
        }
        if (utilization.compareTo(BigDecimal.valueOf(90)) >= 0 || occupied.compareTo(capacity) >= 0) {
            return new String[]{"FULL", "Đã chật"};
        }
        return new String[]{"OCCUPIED", "Đang dùng"};
    }
}
