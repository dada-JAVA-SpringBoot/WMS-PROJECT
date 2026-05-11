package com.wmsbackend.controller;

import com.wmsbackend.dto.CycleCountCreateRequest;
import com.wmsbackend.dto.CycleCountDetailDTO;
import com.wmsbackend.entity.*;
import com.wmsbackend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cycle-counts")
public class CycleCountController {

    @Autowired private CycleCountPlanRepository planRepository;
    @Autowired private CycleCountDetailRepository detailRepository;
    @Autowired private InventoryRepository inventoryRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private LocationRepository locationRepository;
    @Autowired private BatchRepository batchRepository;
    @Autowired private InventoryTransactionRepository transactionRepository;

    @GetMapping
    public List<CycleCountPlan> getAllPlans() {
        return planRepository.findAll();
    }

    @PostMapping
    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STOREKEEPER','WAREHOUSE_KEEPER')")
    public CycleCountPlan createPlan(@RequestBody CycleCountCreateRequest request) {
        CycleCountPlan plan = new CycleCountPlan();
        plan.setPlanCode("CC-" + System.currentTimeMillis());
        plan.setNote(request.getNote());
        plan.setStatus("CREATED");
        plan.setCreatedAt(LocalDateTime.now());
        plan.setAssignedTo(request.getAssignedTo()); // New field
        
        final CycleCountPlan savedPlan = planRepository.save(plan);

        // ... rest of inventory fetching ...
        List<Inventory> allInventory = inventoryRepository.findAll();
        List<Inventory> targets;
        if (request.getZone() != null && !request.getZone().isEmpty() && !request.getZone().equalsIgnoreCase("ALL")) {
            List<Integer> validLocationIds = locationRepository.findAll().stream()
                    .filter(l -> l.getZone() != null && l.getZone().equalsIgnoreCase(request.getZone()))
                    .map(Location::getId).collect(Collectors.toList());
            targets = allInventory.stream().filter(inv -> validLocationIds.contains(inv.getLocationId())).collect(Collectors.toList());
        } else {
            targets = allInventory;
        }

        for (Inventory inv : targets) {
            CycleCountDetail detail = new CycleCountDetail();
            detail.setPlanId(savedPlan.getId());
            detail.setLocationId(inv.getLocationId());
            detail.setProductId(inv.getProductId());
            detail.setBatchId(inv.getBatchId());
            detail.setSystemQty(inv.getQuantityOnHand());
            detail.setCountedQty(inv.getQuantityOnHand()); 
            detail.setVariance(BigDecimal.ZERO);
            detailRepository.save(detail);
        }
        return savedPlan;
    }

    @GetMapping("/{id}/details")
    public List<CycleCountDetailDTO> getPlanDetails(@PathVariable Long id) {
        return detailRepository.findByPlanId(id).stream().map(d -> {
            Product p = productRepository.findById(d.getProductId()).orElse(null);
            Location l = locationRepository.findById(d.getLocationId()).orElse(null);
            Batch b = batchRepository.findById(d.getBatchId()).orElse(null);
            
            return CycleCountDetailDTO.builder()
                    .id(d.getId())
                    .planId(d.getPlanId())
                    .locationId(d.getLocationId())
                    .binCode(l != null ? l.getBinCode() : "Unknown")
                    .zone(l != null ? l.getZone() : "")
                    .productId(d.getProductId())
                    .productName(p != null ? p.getName() : "Unknown")
                    .productSku(p != null ? p.getSku() : "Unknown")
                    .batchId(d.getBatchId())
                    .batchCode(b != null ? b.getBatchCode() : "Unknown")
                    .systemQty(d.getSystemQty())
                    .countedQty(d.getCountedQty())
                    .variance(d.getVariance())
                    .note(d.getNote())
                    .build();
        }).collect(Collectors.toList());
    }

    @PutMapping("/details/{detailId}")
    @Transactional
    public void updateCount(@PathVariable Long detailId, @RequestParam BigDecimal countedQty, @RequestParam(required = false) String note) {
        CycleCountDetail detail = detailRepository.findById(detailId).orElseThrow();
        detail.setCountedQty(countedQty);
        detail.setVariance(countedQty.subtract(detail.getSystemQty()));
        detail.setNote(note);
        detailRepository.save(detail);
        
        // Update plan status to IN_PROGRESS if it was CREATED
        CycleCountPlan plan = planRepository.findById(detail.getPlanId()).orElse(null);
        if (plan != null && plan.getStatus().equals("CREATED")) {
            plan.setStatus("IN_PROGRESS");
            planRepository.save(plan);
        }
    }

    @PostMapping("/{id}/complete")
    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public void completePlan(@PathVariable Long id) {
        CycleCountPlan plan = planRepository.findById(id).orElseThrow();
        if (plan.getStatus().equals("COMPLETED")) return;

        List<CycleCountDetail> details = detailRepository.findByPlanId(id);
        for (CycleCountDetail d : details) {
            if (d.getVariance().compareTo(BigDecimal.ZERO) != 0) {
                // Adjust Inventory
                Inventory inv = inventoryRepository.findByProductIdAndLocationIdAndBatchId(d.getProductId(), d.getLocationId(), d.getBatchId());
                if (inv != null) {
                    inv.setQuantityOnHand(d.getCountedQty());
                    inventoryRepository.save(inv);

                    // Record Transaction
                    InventoryTransaction tx = new InventoryTransaction();
                    tx.setProductId(d.getProductId());
                    tx.setLocationId(d.getLocationId());
                    tx.setBatchId(d.getBatchId());
                    tx.setTransactionType("ADJUSTMENT");
                    tx.setQuantityChange(d.getVariance());
                    tx.setReferenceId(plan.getId());
                    tx.setCreatedBy(plan.getCreatedBy());
                    transactionRepository.save(tx);
                }
            }
        }

        plan.setStatus("COMPLETED");
        plan.setCompletedAt(LocalDateTime.now());
        planRepository.save(plan);
    }
}
