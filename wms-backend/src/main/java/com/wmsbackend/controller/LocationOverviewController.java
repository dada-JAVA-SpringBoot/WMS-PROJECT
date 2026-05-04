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
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/location-overview")
@CrossOrigin(origins = "http://localhost:5173")
public class LocationOverviewController {

    private final LocationRepository locationRepo;
    private final InventoryRepository inventoryRepo;
    private final InboundOrderRepository inboundOrderRepo;
    private final InboundOrderDetailRepository inboundDetailRepo;

    public LocationOverviewController(LocationRepository locationRepo,
                                      InventoryRepository inventoryRepo,
                                      InboundOrderRepository inboundOrderRepo,
                                      InboundOrderDetailRepository inboundDetailRepo) {
        this.locationRepo = locationRepo;
        this.inventoryRepo = inventoryRepo;
        this.inboundOrderRepo = inboundOrderRepo;
        this.inboundDetailRepo = inboundDetailRepo;
    }

    @GetMapping
    public List<LocationOverviewDTO> getOverview() {
        List<Location> locations = locationRepo.findAll();
        List<Integer> locationIds = locations.stream().map(Location::getId).toList();

        Map<Integer, BigDecimal> onHandMap = new HashMap<>();
        Map<Integer, BigDecimal> allocatedMap = new HashMap<>();

        for (Inventory stock : inventoryRepo.findByLocationIdIn(locationIds)) {
            onHandMap.merge(stock.getLocationId(), safe(stock.getQuantityOnHand()), BigDecimal::add);
            allocatedMap.merge(stock.getLocationId(), safe(stock.getQuantityAllocated()), BigDecimal::add);
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

        return locations.stream().map(location -> {
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

            String[] status = resolveStatus(onHand, allocated, expected, capacity, utilization);
            dto.setStatusCode(status[0]);
            dto.setStatusLabel(status[1]);
            return dto;
        }).toList();
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
