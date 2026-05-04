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
    //                             STOREKEEPER, INBOUND_STAFF thao tác
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
        InboundOrder order           = request.getOrder();
        List<InboundOrderDetail> details = request.getDetails();

        order.setCreatedAt(LocalDateTime.now());
        if (order.getStatus() == null) order.setStatus("COMPLETED");
        InboundOrder savedOrder = orderRepo.save(order);

        for (InboundOrderDetail item : details) {
            item.setInboundOrderId(savedOrder.getId());
            detailRepo.save(item);

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
            order.setStatus("CANCELED");
            orderRepo.save(order);
            return "Đã hủy phiếu " + order.getReceiptCode();
        }
        return "Không tìm thấy";
    }

    // GET xuất Excel — ADMIN, MANAGER, STOREKEEPER
    @GetMapping("/export")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STOREKEEPER')")
    public void exportToExcel() {
        System.out.println("Đang xuất Excel...");
    }
}

// Giữ nguyên class InboundRequest — không thay đổi
class InboundRequest {
    private InboundOrder order;
    private List<InboundOrderDetail> details;

    public InboundRequest() {}

    public InboundOrder getOrder() { return order; }
    public void setOrder(InboundOrder order) { this.order = order; }

    public List<InboundOrderDetail> getDetails() { return details; }
    public void setDetails(List<InboundOrderDetail> details) { this.details = details; }
}
 