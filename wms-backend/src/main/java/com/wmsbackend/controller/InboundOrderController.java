package com.wmsbackend.controller;

import com.wmsbackend.entity.*;
import com.wmsbackend.repository.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/inbound")
@CrossOrigin(origins = "http://localhost:5173")
public class InboundOrderController {

    private final InboundOrderRepository orderRepo;
    private final InboundOrderDetailRepository detailRepo;
    private final InventoryRepository inventoryRepo;

    public InboundOrderController(InboundOrderRepository orderRepo,
                                  InboundOrderDetailRepository detailRepo,
                                  InventoryRepository inventoryRepo) {
        this.orderRepo = orderRepo;
        this.detailRepo = detailRepo;
        this.inventoryRepo = inventoryRepo;
    }

    // lay ds phieu nhap
    @GetMapping
    public List<InboundOrder> getAllOrders() {
        return orderRepo.findAll();
    }

    // lay chi tiet
    @GetMapping("/{id}/details")
    public List<InboundOrderDetail> getOrderDetails(@PathVariable Long id) {
        return detailRepo.findByInboundOrderId(id);
    }

    // xac nhan
    @PostMapping("/confirm")
    @Transactional
    public String confirmInbound(@RequestBody InboundRequest request) {
        // Dung Getter de lay du lieu (Sua loi private access)
        InboundOrder order = request.getOrder();
        List<InboundOrderDetail> details = request.getDetails() != null ? request.getDetails() : List.of();

        // luu thong tin
        if (order.getReceiptDate() == null) {
            order.setReceiptDate(LocalDateTime.now());
        }
        if (order.getStatus() == null || order.getStatus().isBlank()) order.setStatus("DRAFT");
        order.setTotalAmount(calculateTotalAmount(details));

        // luu va lay
        InboundOrder savedOrder = orderRepo.save(order);

        // xu li sp
        for (InboundOrderDetail item : details) {
            item.setInboundOrderId(savedOrder.getId());
            detailRepo.save(item);

            if (!"COMPLETED".equalsIgnoreCase(savedOrder.getStatus())) {
                continue;
            }

            // cap nhat hang ton
            Inventory stock = inventoryRepo.findByProductIdAndLocationIdAndBatchId(
                    item.getProductId(), item.getLocationId(), item.getBatchId());

            if (stock == null) {
                stock = new Inventory();
                stock.setProductId(item.getProductId());
                stock.setLocationId(item.getLocationId());
                stock.setBatchId(item.getBatchId());
                stock.setQuantityOnHand(item.getQuantityReceived());
            } else {
                BigDecimal currentQty = (stock.getQuantityOnHand() != null) ? stock.getQuantityOnHand() : BigDecimal.ZERO;
                stock.setQuantityOnHand(currentQty.add(item.getQuantityReceived()));
            }

            inventoryRepo.save(stock);
        }

        return "Nhập kho thành công: " + savedOrder.getReceiptCode();
    }

    // huy phieu nhap
    @DeleteMapping("/{id}")
    @Transactional
    public String cancelOrder(@PathVariable Long id) {
        InboundOrder order = orderRepo.findById(id).orElse(null);
        if (order != null) {
            if ("COMPLETED".equalsIgnoreCase(order.getStatus())) {
                applyInventoryDelta(order.getId(), -1);
            }
            order.setStatus("CANCELED");
            orderRepo.save(order);
            return "Đã hủy phiếu " + order.getReceiptCode();
        }
        return "Không tìm thấy";
    }

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

        if (!currentStatus.equalsIgnoreCase("COMPLETED") && nextStatus.equals("COMPLETED")) {
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
            BigDecimal delta = item.getQuantityReceived() != null ? item.getQuantityReceived() : BigDecimal.ZERO;
            Inventory stock = inventoryRepo.findByProductIdAndLocationIdAndBatchId(
                    item.getProductId(), item.getLocationId(), item.getBatchId());

            if (stock == null) {
                if (direction < 0) {
                    continue;
                }
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

    // xuat excel
    @GetMapping("/export")
    public void exportToExcel() {
        // phan logic Apache POI
        System.out.println("Đang xuất Excel...");
    }
}
class InboundRequest {
    private InboundOrder order;
    private List<InboundOrderDetail> details;

    public InboundRequest() {}

    public InboundOrder getOrder() {
        return order;
    }
    public void setOrder(InboundOrder order) {
        this.order = order;
    }

    public List<InboundOrderDetail> getDetails() {
        return details;
    }
    public void setDetails(List<InboundOrderDetail> details) {
        this.details = details;
    }
}

class StatusUpdateRequest {
    private String status;

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
