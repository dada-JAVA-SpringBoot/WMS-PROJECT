package com.wmsbackend.controller;

import com.wmsbackend.dto.CycleCountCreateRequest;
import com.wmsbackend.dto.CycleCountDetailDTO;
import com.wmsbackend.entity.*;
import com.wmsbackend.repository.*;
import com.wmsbackend.util.TimeUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
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
        plan.setCreatedAt(TimeUtils.now());
        plan.setAssignedTo(request.getAssignedTo()); 
        
        final CycleCountPlan savedPlan = planRepository.save(plan);

        List<Inventory> targets;
        if (request.getZone() != null && !request.getZone().isEmpty() && !request.getZone().equalsIgnoreCase("ALL")) {
            targets = inventoryRepository.findByLocationZone(request.getZone());
        } else {
            targets = inventoryRepository.findAll();
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
                Inventory inv = inventoryRepository.findByProductIdAndLocationIdAndBatchId(d.getProductId(), d.getLocationId(), d.getBatchId());
                if (inv != null) {
                    inv.setQuantityOnHand(d.getCountedQty());
                    inventoryRepository.save(inv);

                    InventoryTransaction tx = new InventoryTransaction();
                    tx.setProductId(d.getProductId());
                    tx.setLocationId(d.getLocationId());
                    tx.setBatchId(d.getBatchId());
                    tx.setTransactionType("ADJUSTMENT");
                    tx.setQuantityChange(d.getVariance());
                    tx.setReferenceId(plan.getId());
                    tx.setCreatedBy(plan.getCreatedBy());
                    tx.setCreatedAt(TimeUtils.now());
                    transactionRepository.save(tx);
                }
            }
        }

        plan.setStatus("COMPLETED");
        plan.setCompletedAt(TimeUtils.now());
        planRepository.save(plan);
    }
}
