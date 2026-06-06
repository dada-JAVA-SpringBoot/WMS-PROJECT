// ================================================================
// 4. InboundOrderController.java - CLEAN VERSION
// ================================================================
package com.wmsbackend.controller;

import com.wmsbackend.dto.InboundCreateRequest;
import com.wmsbackend.dto.QCStatusUpdateRequest;
import com.wmsbackend.entity.*;
import com.wmsbackend.repository.*;
import com.wmsbackend.util.TimeUtils;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inbound")
public class InboundOrderController {

    private final InboundOrderRepository       orderRepo;
    private final InboundOrderDetailRepository detailRepo;
    private final InventoryRepository          inventoryRepo;
    private final BatchRepository              batchRepo;
    private final InventoryTransactionRepository transactionRepo;
    private final SupplierRepository           supplierRepo;

    public InboundOrderController(InboundOrderRepository orderRepo,
                                  InboundOrderDetailRepository detailRepo,
                                  InventoryRepository inventoryRepo,
                                  BatchRepository batchRepo,
                                  InventoryTransactionRepository transactionRepo,
                                  SupplierRepository supplierRepo) {
        this.orderRepo     = orderRepo;
        this.detailRepo    = detailRepo;
        this.inventoryRepo = inventoryRepo;
        this.batchRepo     = batchRepo;
        this.transactionRepo = transactionRepo;
        this.supplierRepo = supplierRepo;
    }

    // 1. GET ALL
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STOREKEEPER','WAREHOUSE_KEEPER','INBOUND_STAFF','QUALITY_CONTROL')")
    public List<InboundOrder> getAll() {
        return orderRepo.findAll();
    }

    // 2. GET DETAILS
    @GetMapping("/{id}/details")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STOREKEEPER','INBOUND_STAFF','OUTBOUND_STAFF','QUALITY_CONTROL','HANDLER')")
    public List<InboundOrderDetail> getDetails(@PathVariable Long id) {
        return detailRepo.findByInboundOrderId(id);
    }

    // 3. GET BATCHES
    @GetMapping("/batches/{productId}")
    public List<Batch> getBatches(@PathVariable Integer productId) {
        return batchRepo.findByProductId(productId);
    }

    // 4. CREATE ORDER
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STOREKEEPER','INBOUND_STAFF')")
    @Transactional
    public InboundOrder create(@RequestBody InboundCreateRequest req) {
        InboundOrder order = new InboundOrder();
        order.setSupplierId(req.getSupplierId());
        order.setCreatedBy(req.getCreatedBy());
        order.setReferenceNumber(req.getReferenceNumber());
        order.setStatus(req.getStatus() != null ? req.getStatus() : "DRAFT");
        order.setNotes(req.getNotes());
        order.setTotalAmount(req.getTotalAmount());
        
        if (order.getReceiptCode() == null || order.getReceiptCode().isBlank()) {
            order.setReceiptCode("PN-" + System.currentTimeMillis());
        }
        
        order.setCreatedAt(TimeUtils.now());
        if ("COMPLETED".equalsIgnoreCase(order.getStatus())) {
            order.setReceiptDate(TimeUtils.now());
        }
        
        InboundOrder savedOrder = orderRepo.save(order);

        if (req.getItems() != null) {
            for (InboundCreateRequest.ItemRequest itemReq : req.getItems()) {
                InboundOrderDetail detail = new InboundOrderDetail();
                detail.setInboundOrderId(savedOrder.getId());
                detail.setProductId(itemReq.getProductId());
                detail.setQuantityExpected(itemReq.getQuantityExpected());
                detail.setQuantityReceived(itemReq.getQuantityReceived());
                detail.setUnitPrice(itemReq.getUnitPrice());
                detail.setItemCondition(itemReq.getItemCondition());
                detail.setLocationId(itemReq.getLocationId());

                Batch batch = batchRepo.findByProductIdAndBatchCode(itemReq.getProductId(), itemReq.getBatchCode())
                        .orElse(null);
                if (batch == null) {
                    batch = new Batch();
                    batch.setProductId(itemReq.getProductId());
                    batch.setBatchCode(itemReq.getBatchCode());
                    batch.setExpiryDate(itemReq.getExpiryDate() != null ? itemReq.getExpiryDate() : java.time.LocalDate.now().plusYears(1));
                    batch.setCreatedAt(TimeUtils.now());
                    batch = batchRepo.save(batch);
                }
                detail.setBatchId(batch.getId());
                detailRepo.save(detail);
            }
        }
        
        if ("COMPLETED".equalsIgnoreCase(savedOrder.getStatus())) {
            applyInventoryDelta(savedOrder, 1);
            updateSupplierStats(savedOrder, 1);
        }

        return savedOrder;
    }

    // 5. UPDATE STATUS / QC
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STOREKEEPER','QUALITY_CONTROL')")
    @Transactional
    public String updateStatus(@PathVariable Long id, @RequestBody QCStatusUpdateRequest request) {
        InboundOrder order = orderRepo.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu nhập"));

        String currentStatus = order.getStatus() != null ? order.getStatus() : "DRAFT";
        String nextStatus = request.getStatus() != null ? request.getStatus().trim().toUpperCase() : "";
        
        if (nextStatus.isBlank()) return "Trạng thái không hợp lệ";

        if (request.getDetails() != null && !request.getDetails().isEmpty()) {
            for (InboundOrderDetail qcItem : request.getDetails()) {
                detailRepo.findById(qcItem.getId()).ifPresent(dbItem -> {
                    dbItem.setQuantityIntact(qcItem.getQuantityIntact());
                    dbItem.setQuantityDamaged(qcItem.getQuantityDamaged());
                    dbItem.setQualityRating(qcItem.getQualityRating());
                    dbItem.setQcNotes(qcItem.getQcNotes());
                    detailRepo.save(dbItem);
                });
            }
        }

        if (!currentStatus.equalsIgnoreCase("COMPLETED") && nextStatus.equals("COMPLETED")) {
            if (order.getReceiptDate() == null) order.setReceiptDate(TimeUtils.now());
            applyInventoryDelta(order, 1); 
            updateSupplierStats(order, 1);
        } else if (currentStatus.equalsIgnoreCase("COMPLETED") && !nextStatus.equals("COMPLETED")) {
            applyInventoryDelta(order, -1); 
            updateSupplierStats(order, -1);
        }

        order.setStatus(nextStatus);
        orderRepo.save(order);
        return "Đã cập nhật trạng thái phiếu " + order.getReceiptCode();
    }

    // 6. QUICK QC CONFIRM
    @PostMapping("/{id}/qc")
    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN','QUALITY_CONTROL','MANAGER')")
    public String confirmQC(@PathVariable Long id, @RequestBody List<InboundOrderDetail> inspectedItems) {
        InboundOrder order = orderRepo.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu nhập"));
        
        if (inspectedItems != null) {
            for (InboundOrderDetail item : inspectedItems) {
                detailRepo.findById(item.getId()).ifPresent(dbItem -> {
                    dbItem.setQuantityIntact(item.getQuantityIntact());
                    dbItem.setQuantityDamaged(item.getQuantityDamaged());
                    dbItem.setQualityRating(item.getQualityRating());
                    dbItem.setQcNotes(item.getQcNotes());
                    detailRepo.save(dbItem);
                });
            }
        }

        if (order.getReceiptDate() == null) order.setReceiptDate(TimeUtils.now());
        applyInventoryDelta(order, 1);
        updateSupplierStats(order, 1);
        order.setStatus("COMPLETED");
        orderRepo.save(order);
        
        return "Kiểm duyệt thành công phiếu " + order.getReceiptCode();
    }

    // 7. CANCEL / DELETE
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public String cancelOrder(@PathVariable Long id) {
        InboundOrder order = orderRepo.findById(id).orElse(null);
        if (order != null) {
            if ("COMPLETED".equalsIgnoreCase(order.getStatus())) {
                applyInventoryDelta(order, -1);
                updateSupplierStats(order, -1);
            }
            order.setStatus("CANCELED");
            orderRepo.save(order);
            return "Đã hủy phiếu " + order.getReceiptCode();
        }
        return "Không tìm thấy";
    }

    private void updateSupplierStats(InboundOrder order, int direction) {
        if (order.getSupplierId() == null) return;
        supplierRepo.findById(order.getSupplierId()).ifPresent(s -> {
            List<InboundOrderDetail> details = detailRepo.findByInboundOrderId(order.getId());
            double totalQty = details.stream()
                    .mapToDouble(d -> (d.getQuantityIntact() != null ? d.getQuantityIntact() : 
                                      (d.getQuantityReceived() != null ? d.getQuantityReceived() : BigDecimal.ZERO)).doubleValue())
                    .sum();
            int current = s.getTotalImportQuantity() != null ? s.getTotalImportQuantity() : 0;
            s.setTotalImportQuantity(current + (int)(totalQty * direction));
            supplierRepo.save(s);
        });
    }

    private void applyInventoryDelta(InboundOrder order, int direction) {
        List<InboundOrderDetail> details = detailRepo.findByInboundOrderId(order.getId());
        for (InboundOrderDetail item : details) {
            BigDecimal delta = item.getQuantityIntact() != null ? item.getQuantityIntact() : 
                              (item.getQuantityReceived() != null ? item.getQuantityReceived() : BigDecimal.ZERO);
            if (delta.compareTo(BigDecimal.ZERO) <= 0) continue;

            Inventory stock = inventoryRepo.findAndLockByProductIdAndLocationIdAndBatchId(
                    item.getProductId(), item.getLocationId(), item.getBatchId()).orElse(null);

            if (stock == null) {
                if (direction < 0) continue; 
                stock = new Inventory();
                stock.setProductId(item.getProductId());
                stock.setLocationId(item.getLocationId());
                stock.setBatchId(item.getBatchId());
                stock.setQuantityOnHand(delta);
            } else {
                BigDecimal currentQty = stock.getQuantityOnHand() != null ? stock.getQuantityOnHand() : BigDecimal.ZERO;
                BigDecimal nextQty = currentQty.add(delta.multiply(BigDecimal.valueOf(direction)));
                stock.setQuantityOnHand(nextQty.max(BigDecimal.ZERO));
            }
            inventoryRepo.save(stock);

            InventoryTransaction tx = new InventoryTransaction();
            tx.setProductId(item.getProductId());
            tx.setLocationId(item.getLocationId());
            tx.setBatchId(item.getBatchId());
            tx.setTransactionType(direction > 0 ? "INBOUND" : "ADJUSTMENT");
            tx.setQuantityChange(delta.multiply(BigDecimal.valueOf(direction)));
            tx.setReferenceId(order.getId());
            tx.setCreatedBy(order.getCreatedBy());
            tx.setCreatedAt(TimeUtils.now());
            transactionRepo.save(tx);
        }
    }
}
