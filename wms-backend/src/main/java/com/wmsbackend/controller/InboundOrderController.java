// ================================================================
// 4. InboundOrderController.java
// ================================================================
package com.wmsbackend.controller;

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

    public InboundOrderController(InboundOrderRepository orderRepo,
                                  InboundOrderDetailRepository detailRepo,
                                  InventoryRepository inventoryRepo) {
        this.orderRepo     = orderRepo;
        this.detailRepo    = detailRepo;
        this.inventoryRepo = inventoryRepo;
    }

    // GET danh sách phiếu nhập — ADMIN, MANAGER xem báo cáo
    //                            STOREKEEPER, INBOUND_STAFF thao tác
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STOREKEEPER','INBOUND_STAFF')")
    public List<InboundOrder> getAllOrders() {
        return orderRepo.findAll();
    }

    // GET chi tiết phiếu nhập
    @GetMapping("/{id}/details")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STOREKEEPER','INBOUND_STAFF')")
    public List<InboundOrderDetail> getOrderDetails(@PathVariable Long id) {
        return detailRepo.findByInboundOrderId(id);
    }

    // POST xác nhận nhập kho — chỉ INBOUND_STAFF thực hiện (ADMIN luôn có quyền)
    @PostMapping("/confirm")
    @PreAuthorize("hasAnyRole('ADMIN','INBOUND_STAFF')")
    @Transactional
    public String confirmInbound(@RequestBody InboundRequest request) {
        InboundOrder order = request.getOrder();
        List<InboundOrderDetail> details = request.getDetails() != null ? request.getDetails() : List.of();

        // Xử lý thông tin thời gian (Kết hợp từ nhánh main và UX)
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
    public String updateStatus(@PathVariable Long id, @RequestBody StatusUpdateRequest request) {
        InboundOrder order = orderRepo.findById(id).orElse(null);
        if (order == null) {
            return "Không tìm thấy";
        }

        String currentStatus = order.getStatus() != null ? order.getStatus() : "DRAFT";
        String nextStatus = request.getStatus() != null ? request.getStatus().trim().toUpperCase() : "";
        if (nextStatus.isBlank()) {
            return "Trạng thái không hợp lệ";
        }

        // Logic cộng/trừ hàng tồn tự động khi trạng thái thay đổi
        if (!currentStatus.equalsIgnoreCase("COMPLETED") && nextStatus.equals("COMPLETED")) {
            applyInventoryDelta(order.getId(), 1); // Chuyển sang hoàn thành -> Cộng kho
        } else if (currentStatus.equalsIgnoreCase("COMPLETED") && !nextStatus.equals("COMPLETED")) {
            applyInventoryDelta(order.getId(), -1); // Rời khỏi trạng thái hoàn thành -> Trừ kho
        }

        order.setStatus(nextStatus);
        orderRepo.save(order);
        return "Đã cập nhật trạng thái phiếu " + order.getReceiptCode();
    }

    private void applyInventoryDelta(Long inboundOrderId, int direction) {
        List<InboundOrderDetail> details = detailRepo.findByInboundOrderId(inboundOrderId);
        for (InboundOrderDetail item : details) {
            BigDecimal delta = item.getQuantityReceived() != null ? item.getQuantityReceived() : BigDecimal.ZERO;
            Inventory stock = inventoryRepo.findByProductIdAndLocationIdAndBatchId(
                    item.getProductId(), item.getLocationId(), item.getBatchId());

            if (stock == null) {
                if (direction < 0) {
                    continue; // Không có kho để trừ
                }
                stock = new Inventory();
                stock.setProductId(item.getProductId());
                stock.setLocationId(item.getLocationId());
                stock.setBatchId(item.getBatchId());
                stock.setQuantityOnHand(delta);
            } else {
                BigDecimal currentQty = stock.getQuantityOnHand() != null ? stock.getQuantityOnHand() : BigDecimal.ZERO;
                BigDecimal nextQty = currentQty.add(delta.multiply(BigDecimal.valueOf(direction)));
                stock.setQuantityOnHand(nextQty.max(BigDecimal.ZERO)); // Đảm bảo số lượng không bị âm
            }
            inventoryRepo.save(stock);
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

    // GET xuất Excel — ADMIN, MANAGER, STOREKEEPER
    @GetMapping("/export")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STOREKEEPER')")
    public void exportToExcel() {
        System.out.println("Đang xuất Excel...");
    }
}

// Model hỗ trợ
class InboundRequest {
    private InboundOrder order;
    private List<InboundOrderDetail> details;

    public InboundRequest() {}

    public InboundOrder getOrder() { return order; }
    public void setOrder(InboundOrder order) { this.order = order; }

    public List<InboundOrderDetail> getDetails() { return details; }
    public void setDetails(List<InboundOrderDetail> details) { this.details = details; }
}

class StatusUpdateRequest {
    private String status;

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}