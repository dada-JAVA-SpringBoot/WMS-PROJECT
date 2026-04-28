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
        List<InboundOrderDetail> details = request.getDetails();

        // luu thong tin
        order.setCreatedAt(LocalDateTime.now());
        if (order.getStatus() == null) order.setStatus("COMPLETED");

        // luu va lay
        InboundOrder savedOrder = orderRepo.save(order);

        // xu li sp
        for (InboundOrderDetail item : details) {
            item.setInboundOrderId(savedOrder.getId());
            detailRepo.save(item);

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
        }

        return "Nhập kho thành công: " + savedOrder.getReceiptCode();
    }

    // huy phieu nhap
    @DeleteMapping("/{id}")
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