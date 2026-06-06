package com.wmsbackend.controller;

import com.wmsbackend.dto.WaveCreateRequest;
import com.wmsbackend.dto.WavePickingItemDTO;
import com.wmsbackend.entity.OutboundOrder;
import com.wmsbackend.entity.OutboundOrderDetail;
import com.wmsbackend.entity.Wave;
import com.wmsbackend.repository.*;
import com.wmsbackend.util.TimeUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/waves")
public class WaveController {

    @Autowired private WaveRepository waveRepository;
    @Autowired private OutboundOrderRepository orderRepository;
    @Autowired private OutboundOrderDetailRepository orderDetailRepository;
    @Autowired private LocationRepository locationRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private BatchRepository batchRepository;
    @Autowired private InventoryRepository inventoryRepository;
    @Autowired private InventoryTransactionRepository transactionRepository;

    @GetMapping
    public List<Wave> getAllWaves() {
        return waveRepository.findAll();
    }

    @PostMapping
    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public Wave createWave(@RequestBody WaveCreateRequest request) {
        Wave wave = new Wave();
        wave.setWaveCode("WV-" + System.currentTimeMillis());
        wave.setNote(request.getNote());
        wave.setStatus("CREATED");
        wave.setCreatedAt(TimeUtils.now());
        
        final Wave savedWave = waveRepository.save(wave);

        List<OutboundOrder> orders = orderRepository.findAllById(request.getOrderIds());
        for (OutboundOrder order : orders) {
            order.setWaveId(savedWave.getId());
            order.setStatus("PICKING");
            orderRepository.save(order);
        }

        return savedWave;
    }

    @GetMapping("/{id}/picking-list")
    public List<WavePickingItemDTO> getPickingList(@PathVariable Long id) {
        List<OutboundOrder> orders = orderRepository.findByWaveId(id);
        
        // Group items by Location + Product + Batch
        Map<String, WavePickingItemDTO> pickingMap = new HashMap<>();

        for (OutboundOrder order : orders) {
            List<OutboundOrderDetail> details = orderDetailRepository.findByOutboundOrderId(order.getId());
            for (OutboundOrderDetail item : details) {
                String key = item.getLocationId() + "-" + item.getProductId() + "-" + item.getBatchId();
                
                WavePickingItemDTO dto = pickingMap.getOrDefault(key, new WavePickingItemDTO());
                
                if (dto.getBinCode() == null) {
                    var loc = locationRepository.findById(item.getLocationId()).orElse(null);
                    var prod = productRepository.findById(item.getProductId()).orElse(null);
                    var batch = batchRepository.findById(item.getBatchId()).orElse(null);
                    
                    dto.setProductId(item.getProductId());
                    dto.setProductName(prod != null ? prod.getName() : "Unknown");
                    dto.setProductSku(prod != null ? prod.getSku() : "Unknown");
                    dto.setLocationId(item.getLocationId());
                    dto.setBinCode(loc != null ? loc.getBinCode() : "Unknown");
                    dto.setZone(loc != null ? loc.getZone() : "");
                    dto.setAisle(loc != null ? loc.getAisle() : "");
                    dto.setRack(loc != null ? loc.getRack() : "");
                    dto.setLevel(loc != null ? loc.getLevel() : "");
                    dto.setBatchCode(batch != null ? batch.getBatchCode() : "Unknown");
                    dto.setTotalQuantity(BigDecimal.ZERO);
                    dto.setOrderCodes("");
                }
                
                dto.setTotalQuantity(dto.getTotalQuantity().add(item.getQuantity()));
                String currentCodes = dto.getOrderCodes();
                if (!currentCodes.contains(order.getIssueCode())) {
                    dto.setOrderCodes(currentCodes.isEmpty() ? order.getIssueCode() : currentCodes + ", " + order.getIssueCode());
                }
                
                pickingMap.put(key, dto);
            }
        }

        // Sort by Location Path (Zone -> Aisle -> Rack -> Level -> Bin) for optimal walking path
        return pickingMap.values().stream()
                .sorted(Comparator.comparing(WavePickingItemDTO::getZone, Comparator.nullsLast(Comparator.naturalOrder()))
                        .thenComparing(WavePickingItemDTO::getAisle, Comparator.nullsLast(Comparator.naturalOrder()))
                        .thenComparing(WavePickingItemDTO::getRack, Comparator.nullsLast(Comparator.naturalOrder()))
                        .thenComparing(WavePickingItemDTO::getLevel, Comparator.nullsLast(Comparator.naturalOrder()))
                        .thenComparing(WavePickingItemDTO::getBinCode, Comparator.nullsLast(Comparator.naturalOrder())))
                .collect(Collectors.toList());
    }

    @PutMapping("/{id}/complete")
    @Transactional
    public void completeWave(@PathVariable Long id) {
        Wave wave = waveRepository.findById(id).orElseThrow();
        if ("COMPLETED".equalsIgnoreCase(wave.getStatus())) return;

        wave.setStatus("COMPLETED");
        wave.setCompletedAt(TimeUtils.now());
        waveRepository.save(wave);

        List<OutboundOrder> orders = orderRepository.findByWaveId(id);
        for (OutboundOrder order : orders) {
            // Chuyển sang PENDING (Đang duyệt/QC) thay vì COMPLETED luôn
            // Hàng vẫn giữ nguyên ở trạng thái ALLOCATED trong Inventory
            // Cho đến khi admin/QC bấm duyệt từng phiếu.
            if ("PICKING".equalsIgnoreCase(order.getStatus())) {
                order.setStatus("PENDING");
                orderRepository.save(order);
            }
        }
    }
}
