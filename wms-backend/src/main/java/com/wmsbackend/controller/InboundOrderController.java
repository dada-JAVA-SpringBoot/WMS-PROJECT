// ================================================================
// 4. InboundOrderController.java
// ================================================================
package com.wmsbackend.controller;

import com.wmsbackend.dto.StatusUpdateRequest;
import com.wmsbackend.entity.*;
import com.wmsbackend.repository.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/inbound")
public class InboundOrderController {

    private final InboundOrderRepository       orderRepo;
    private final InboundOrderDetailRepository detailRepo;
    private final InventoryRepository          inventoryRepo;
    private final BatchRepository              batchRepo;
    private final InventoryTransactionRepository transactionRepo;

    public InboundOrderController(InboundOrderRepository orderRepo,
                                  InboundOrderDetailRepository detailRepo,
                                  InventoryRepository inventoryRepo,
                                  BatchRepository batchRepo,
                                  InventoryTransactionRepository transactionRepo) {
        this.orderRepo     = orderRepo;
        this.detailRepo    = detailRepo;
        this.inventoryRepo = inventoryRepo;
        this.batchRepo     = batchRepo;
        this.transactionRepo = transactionRepo;
    }

    // GET danh sách phiếu nhập — ADMIN, MANAGER xem báo cáo
    //                            STOREKEEPER, INBOUND_STAFF thao tác
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STOREKEEPER','INBOUND_STAFF','QUALITY_CONTROL')")
    public List<InboundOrder> getAllOrders() {
        return orderRepo.findAll();
    }

    // GET chi tiết phiếu nhập
    @GetMapping("/{id}/details")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STOREKEEPER','INBOUND_STAFF','OUTBOUND_STAFF','QUALITY_CONTROL','HANDLER')")
    public List<InboundOrderDetail> getOrderDetails(@PathVariable Long id) {
        return detailRepo.findByInboundOrderId(id);
    }

    @GetMapping("/batches/{productId}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STOREKEEPER','INBOUND_STAFF','OUTBOUND_STAFF','QUALITY_CONTROL','HANDLER')")
    public List<Batch> getBatchesByProduct(@PathVariable Integer productId) {
        return batchRepo.findByProductId(productId);
    }

    // POST xác nhận nhập kho — chỉ INBOUND_STAFF thực hiện (ADMIN luôn có quyền)
    @PostMapping("/confirm")
    @PreAuthorize("hasAnyRole('ADMIN','INBOUND_STAFF')")
    @Transactional
    public String confirmInbound(@RequestBody InboundRequest request) {
        InboundOrder order = request.getOrder();
        List<InboundOrderDetail> details = request.getDetails() != null ? request.getDetails() : List.of();
        List<Batch> newBatches = request.getNewBatches() != null ? request.getNewBatches() : List.of();

        // 0. Lưu các lô hàng mới nếu có (De-duplicate để tránh lỗi)
        java.util.Set<String> processedBatches = new java.util.HashSet<>();
        for (Batch b : newBatches) {
            if (b.getBatchCode() != null && !b.getBatchCode().isBlank()) {
                String key = b.getProductId() + "_" + b.getBatchCode();
                if (processedBatches.contains(key)) continue;
                processedBatches.add(key);

                // Kiểm tra xem lô hàng này đã tồn tại trong DB chưa
                if (batchRepo.findByProductIdAndBatchCode(b.getProductId(), b.getBatchCode()).isEmpty()) {
                    batchRepo.save(b);
                }
            }
        }

        // 1. Xử lý thông tin thời gian (Kết hợp từ nhánh main và UX)
        order.setCreatedAt(LocalDateTime.now());
        if (order.getReceiptDate() == null) {
            order.setReceiptDate(LocalDateTime.now());
        }

        // Mặc định DRAFT nếu không có trạng thái gửi lên
        if (order.getStatus() == null || order.getStatus().isBlank()) {
            order.setStatus("DRAFT");
        }
        order.setTotalAmount(calculateTotalAmount(details));

        // Lưu thông tin phiếu nhập
        InboundOrder savedOrder = orderRepo.save(order);

        for (InboundOrderDetail item : details) {
            item.setInboundOrderId(savedOrder.getId());
            
            // Tìm BatchId từ BatchCode nếu BatchId chưa có hoặc bằng 0
            if ((item.getBatchId() == null || item.getBatchId() == 0) && item.getBatchCode() != null) {
                batchRepo.findByProductIdAndBatchCode(item.getProductId(), item.getBatchCode())
                        .ifPresent(b -> item.setBatchId(b.getId()));
            }

            // Mặc định BatchId = 1 (Lô mặc định) nếu vẫn không tìm thấy
            if (item.getBatchId() == null) {
                item.setBatchId(1);
            }

            detailRepo.save(item);

            // Chỉ cộng tồn kho thực tế nếu trạng thái đã hoàn thành (COMPLETED)
            if (!"COMPLETED".equalsIgnoreCase(savedOrder.getStatus())) {
                continue;
            }

            // Cập nhật hàng tồn
            Inventory stock = inventoryRepo.findByProductIdAndLocationIdAndBatchId(
                    item.getProductId(), item.getLocationId(), item.getBatchId());

            if (stock == null) {
                stock = new Inventory();
                stock.setProductId(item.getProductId());
                stock.setLocationId(item.getLocationId());
                stock.setBatchId(item.getBatchId());
                stock.setQuantityOnHand(item.getQuantityReceived());
            } else {
                BigDecimal currentQty = (stock.getQuantityOnHand() != null)
                        ? stock.getQuantityOnHand() : BigDecimal.ZERO;
                stock.setQuantityOnHand(currentQty.add(item.getQuantityReceived()));
            }
            
            inventoryRepo.save(stock);
        }

        return "Nhập kho thành công: " + savedOrder.getReceiptCode();
    }

    // DELETE hủy phiếu nhập — chỉ ADMIN (hủy cần phê duyệt cấp cao nhất)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public String cancelOrder(@PathVariable Long id) {
        InboundOrder order = orderRepo.findById(id).orElse(null);
        if (order != null) {
            // Trừ lại kho nếu hủy phiếu đã hoàn thành
            if ("COMPLETED".equalsIgnoreCase(order.getStatus())) {
                applyInventoryDelta(order.getId(), -1);
            }
            order.setStatus("CANCELED");
            orderRepo.save(order);
            return "Đã hủy phiếu " + order.getReceiptCode();
        }
        return "Không tìm thấy";
    }

    // Cập nhật trạng thái linh hoạt
    @PutMapping("/{id}/status")
    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STOREKEEPER','QUALITY_CONTROL')")
    public String updateStatus(@PathVariable Long id, @RequestBody QCStatusUpdateRequest request) {
        InboundOrder order = orderRepo.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu nhập"));

        String currentStatus = order.getStatus() != null ? order.getStatus() : "DRAFT";
        String nextStatus = request.getStatus() != null ? request.getStatus().trim().toUpperCase() : "";
        
        if (nextStatus.isBlank()) return "Trạng thái không hợp lệ";

        // Nếu có thông tin QC đi kèm, cập nhật chi tiết phiếu
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
            detailRepo.flush(); // Bắt buộc flush để applyInventoryDelta thấy dữ liệu mới
        }

        // Logic cộng/trừ hàng tồn tự động khi trạng thái thay đổi sang COMPLETED
        if (!currentStatus.equalsIgnoreCase("COMPLETED") && nextStatus.equals("COMPLETED")) {
            if (order.getReceiptDate() == null) order.setReceiptDate(LocalDateTime.now());
            applyInventoryDelta(order.getId(), 1); 
        } else if (currentStatus.equalsIgnoreCase("COMPLETED") && !nextStatus.equals("COMPLETED")) {
            applyInventoryDelta(order.getId(), -1); 
        }

        order.setStatus(nextStatus);
        orderRepo.save(order);
        return "Đã cập nhật trạng thái phiếu " + order.getReceiptCode();
    }

    private void applyInventoryDelta(Long inboundOrderId, int direction) {
        List<InboundOrderDetail> details = detailRepo.findByInboundOrderId(inboundOrderId);
        for (InboundOrderDetail item : details) {
            // Khi cộng kho, ưu tiên dùng số lượng nguyên vẹn (QuantityIntact) nếu có, 
            // nếu không thì dùng số lượng nhận thực tế (QuantityReceived)
            BigDecimal delta = item.getQuantityIntact() != null ? item.getQuantityIntact() : 
                              (item.getQuantityReceived() != null ? item.getQuantityReceived() : BigDecimal.ZERO);
            
            if (delta.compareTo(BigDecimal.ZERO) <= 0) continue;

            Inventory stock = inventoryRepo.findByProductIdAndLocationIdAndBatchId(
                    item.getProductId(), item.getLocationId(), item.getBatchId());

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

            // GHI LỊCH SỬ KHO (Inventory Transaction)
            InventoryTransaction tx = new InventoryTransaction();
            tx.setProductId(item.getProductId());
            tx.setLocationId(item.getLocationId());
            tx.setBatchId(item.getBatchId());
            tx.setTransactionType(direction > 0 ? "INBOUND" : "ADJUSTMENT");
            tx.setQuantityChange(delta.multiply(BigDecimal.valueOf(direction)));
            tx.setReferenceId(inboundOrderId);
            transactionRepo.save(tx);
        }
    }

    private BigDecimal calculateTotalAmount(List<InboundOrderDetail> details) {
        BigDecimal total = BigDecimal.ZERO;
        for (InboundOrderDetail item : details) {
            BigDecimal quantity = item.getQuantityReceived() != null ? item.getQuantityReceived() : BigDecimal.ZERO;
            BigDecimal unitPrice = item.getUnitPrice() != null ? item.getUnitPrice() : BigDecimal.ZERO;
            total = total.add(quantity.multiply(unitPrice));
        }
        return total;
    }

    @PostMapping("/{id}/qc")
    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN','QUALITY_CONTROL','MANAGER')")
    public String confirmQC(@PathVariable Long id, @RequestBody List<InboundOrderDetail> inspectedItems) {
        InboundOrder order = orderRepo.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu nhập"));
        
        for (InboundOrderDetail item : inspectedItems) {
            detailRepo.findById(item.getId()).ifPresent(dbItem -> {
                dbItem.setQuantityIntact(item.getQuantityIntact());
                dbItem.setQuantityDamaged(item.getQuantityDamaged());
                dbItem.setQualityRating(item.getQualityRating());
                dbItem.setQcNotes(item.getQcNotes());
                detailRepo.save(dbItem);
            });
        }
        detailRepo.flush();

        // Đảm bảo có ngày nhập phiếu để thống kê thấy dữ liệu
        if (order.getReceiptDate() == null) {
            order.setReceiptDate(LocalDateTime.now());
        }

        // Chuyển sang COMPLETED để cộng kho
        applyInventoryDelta(order.getId(), 1);

        order.setStatus("COMPLETED");
        orderRepo.save(order);
        
        return "Kiểm duyệt thành công phiếu " + order.getReceiptCode();
    }

    // GET xuất Excel — ADMIN, MANAGER, STOREKEEPER
    @GetMapping("/export")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STOREKEEPER')")
    public void exportToExcel() {
        System.out.println("Đang xuất Excel...");
    }
}

// Model hỗ trợ mở rộng cho QC
class QCStatusUpdateRequest {
    private String status;
    private List<InboundOrderDetail> details;

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public List<InboundOrderDetail> getDetails() { return details; }
    public void setDetails(List<InboundOrderDetail> details) { this.details = details; }
}

// Model hỗ trợ
class InboundRequest {
    private InboundOrder order;
    private List<InboundOrderDetail> details;
    private List<Batch> newBatches;

    public InboundRequest() {}

    public InboundOrder getOrder() { return order; }
    public void setOrder(InboundOrder order) { this.order = order; }

    public List<InboundOrderDetail> getDetails() { return details; }
    public void setDetails(List<InboundOrderDetail> details) { this.details = details; }

    public List<Batch> getNewBatches() { return newBatches; }
    public void setNewBatches(List<Batch> newBatches) { this.newBatches = newBatches; }
}