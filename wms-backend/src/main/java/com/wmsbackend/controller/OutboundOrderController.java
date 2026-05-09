package com.wmsbackend.controller;

import com.wmsbackend.dto.StatusUpdateRequest;
import com.wmsbackend.entity.Inventory;
import com.wmsbackend.entity.OutboundOrder;
import com.wmsbackend.entity.OutboundOrderDetail;
import com.wmsbackend.repository.InventoryRepository;
import com.wmsbackend.repository.OutboundOrderDetailRepository;
import com.wmsbackend.repository.OutboundOrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/outbound-orders")
public class OutboundOrderController {

    @Autowired
    private OutboundOrderRepository outboundOrderRepository;

    @Autowired
    private OutboundOrderDetailRepository detailRepo;

    @Autowired
    private InventoryRepository inventoryRepo;

    // GET danh sách phiếu xuất
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STOREKEEPER','OUTBOUND_STAFF')")
    public List<OutboundOrder> getAllOrders() {
        return outboundOrderRepository.findAll();
    }

    // POST tạo phiếu xuất
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','OUTBOUND_STAFF')")
    @Transactional
    public OutboundOrder createOrder(@RequestBody OutboundOrder newOrder) {
        List<OutboundOrderDetail> items = newOrder.getItems();
        newOrder.setItems(null); // Tạm thời null để save cha lấy ID
        
        OutboundOrder savedOrder = outboundOrderRepository.save(newOrder);
        
        if (items != null) {
            for (OutboundOrderDetail detail : items) {
                detail.setOutboundOrderId(savedOrder.getId());
                detailRepo.save(detail);
            }
            savedOrder.setItems(items);
        }

        // Nếu trạng thái là ALLOCATED ngay từ đầu, thực hiện trừ kho (hoặc giữ chỗ)
        if ("ALLOCATED".equalsIgnoreCase(savedOrder.getStatus())) {
            applyInventoryDeduction(savedOrder.getId());
        }
        
        return savedOrder;
    }

    // PUT cập nhật trạng thái
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','OUTBOUND_STAFF')")
    @Transactional
    public String updateStatus(@PathVariable Long id, @RequestBody StatusUpdateRequest request) {
        OutboundOrder order = outboundOrderRepository.findById(id).orElse(null);
        if (order == null) return "Không tìm thấy";

        String oldStatus = (order.getStatus() != null ? order.getStatus() : "DRAFT").toUpperCase();
        String nextStatus = request.getStatus().toUpperCase();

        if (oldStatus.equals(nextStatus)) return "Trạng thái không đổi";

        // Logic: DRAFT -> ALLOCATED: Tăng phân bổ
        if (!oldStatus.equals("ALLOCATED") && nextStatus.equals("ALLOCATED")) {
            adjustAllocation(order.getId(), 1);
        }
        // Logic: ALLOCATED -> DRAFT/CANCELED: Giảm phân bổ
        else if (oldStatus.equals("ALLOCATED") && (nextStatus.equals("DRAFT") || nextStatus.equals("CANCELED"))) {
            adjustAllocation(order.getId(), -1);
        }
        // Logic: * -> COMPLETED: Trừ tồn thực tế, Giảm phân bổ (nếu trước đó đã phân bổ)
        else if (!oldStatus.equals("COMPLETED") && nextStatus.equals("COMPLETED")) {
            if (oldStatus.equals("ALLOCATED")) {
                adjustAllocation(order.getId(), -1);
            }
            adjustOnHand(order.getId(), -1);
        }
        // Logic: COMPLETED -> CANCELED/DRAFT: Cộng lại tồn thực tế
        else if (oldStatus.equals("COMPLETED") && !nextStatus.equals("COMPLETED")) {
            adjustOnHand(order.getId(), 1);
        }

        order.setStatus(nextStatus);
        outboundOrderRepository.save(order);
        return "Cập nhật thành công";
    }

    private void adjustAllocation(Long orderId, int direction) {
        List<OutboundOrderDetail> details = detailRepo.findByOutboundOrderId(orderId);
        for (OutboundOrderDetail item : details) {
            Inventory stock = inventoryRepo.findByProductIdAndLocationIdAndBatchId(
                    item.getProductId(), item.getLocationId(), item.getBatchId());
            if (stock != null) {
                BigDecimal delta = item.getQuantity().multiply(BigDecimal.valueOf(direction));
                BigDecimal current = stock.getQuantityAllocated() != null ? stock.getQuantityAllocated() : BigDecimal.ZERO;
                stock.setQuantityAllocated(current.add(delta).max(BigDecimal.ZERO));
                inventoryRepo.save(stock);
            }
        }
    }

    private void adjustOnHand(Long orderId, int direction) {
        List<OutboundOrderDetail> details = detailRepo.findByOutboundOrderId(orderId);
        for (OutboundOrderDetail item : details) {
            Inventory stock = inventoryRepo.findByProductIdAndLocationIdAndBatchId(
                    item.getProductId(), item.getLocationId(), item.getBatchId());
            if (stock != null) {
                BigDecimal delta = item.getQuantity().multiply(BigDecimal.valueOf(direction));
                BigDecimal current = stock.getQuantityOnHand() != null ? stock.getQuantityOnHand() : BigDecimal.ZERO;
                stock.setQuantityOnHand(current.add(delta).max(BigDecimal.ZERO));
                inventoryRepo.save(stock);
            }
        }
    }

    private void applyInventoryDeduction(Long orderId) {
        // Method cũ, giờ dùng adjustOnHand/adjustAllocation cho linh hoạt
        adjustAllocation(orderId, 1);
    }

    private void applyInventoryRestoration(Long orderId) {
        // Method cũ
        adjustAllocation(orderId, -1);
    }
}
 