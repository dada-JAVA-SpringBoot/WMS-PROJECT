package com.wmsbackend.controller;

import com.wmsbackend.dto.StatusUpdateRequest;
import com.wmsbackend.dto.OutboundCreateRequest;
import com.wmsbackend.entity.Inventory;
import com.wmsbackend.entity.OutboundOrder;
import com.wmsbackend.entity.OutboundOrderDetail;
import com.wmsbackend.repository.InventoryRepository;
import com.wmsbackend.repository.OutboundOrderDetailRepository;
import com.wmsbackend.repository.OutboundOrderRepository;
import com.wmsbackend.security.WorkspaceContext;
import com.wmsbackend.util.TimeUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
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
    private OutboundOrderDetailRepository outboundOrderDetailRepository;

    @Autowired
    private com.wmsbackend.repository.InventoryRepository inventoryRepo;

    @Autowired
    private com.wmsbackend.repository.InventoryTransactionRepository transactionRepo;

    // GET danh sách phiếu xuất
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STOREKEEPER','WAREHOUSE_KEEPER','INBOUND_STAFF','OUTBOUND_STAFF','QUALITY_CONTROL')")
    public ResponseEntity<?> getAllOrders(@RequestParam(defaultValue = "0") int page,
                                          @RequestParam(defaultValue = "20") int size) {
        Integer filterId = WorkspaceContext.getFilterCompanyId();

        if (page >= 0 && size > 0) {
            org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(
                page, size, org.springframework.data.domain.Sort.by("issueDate").descending());
            return ResponseEntity.ok(outboundOrderRepository.findAllByCompanyId(filterId, pageable));
        }

        List<OutboundOrder> orders = outboundOrderRepository.findAll().stream()
                .filter(o -> filterId == null || filterId.equals(o.getCompanyId()))
                .sorted((a, b) -> b.getIssueDate().compareTo(a.getIssueDate()))
                .toList();
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}/details")
    public List<OutboundOrderDetail> getDetails(@PathVariable Long id) {
        OutboundOrder order = outboundOrderRepository.findById(id).orElse(null);
        if (order != null && !isAccessible(order.getCompanyId())) {
            return List.of();
        }
        return outboundOrderDetailRepository.findByOutboundOrderId(id);
    }

    // POST tạo phiếu xuất
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','OUTBOUND_STAFF')")
    @Transactional
    public OutboundOrder createOrder(@RequestBody OutboundCreateRequest request) {
        OutboundOrder order = new OutboundOrder();
        order.setCustomerId(request.getCustomerId());
        order.setCompanyId(WorkspaceContext.getCurrentCompanyId());
        order.setCreatedBy(request.getCreatedBy());
        order.setIssueDate(request.getIssueDate() != null ? request.getIssueDate() : TimeUtils.now());
        order.setStatus(request.getStatus() != null ? request.getStatus() : "DRAFT");
        order.setNote(request.getNote());
        order.setTotalAmount(request.getTotalAmount());

        if (order.getIssueCode() == null || order.getIssueCode().isBlank()) {
            order.setIssueCode("XK-" + System.currentTimeMillis());
        }

        OutboundOrder savedOrder = outboundOrderRepository.save(order);

        if (request.getItems() != null) {
            for (OutboundCreateRequest.ItemRequest itemReq : request.getItems()) {
                OutboundOrderDetail detail = new OutboundOrderDetail();
                detail.setOutboundOrderId(savedOrder.getId());
                detail.setProductId(itemReq.getProductId());
                detail.setQuantity(itemReq.getQuantity());
                detail.setUnitPrice(itemReq.getUnitPrice());
                detail.setBatchId(itemReq.getBatchId());
                detail.setLocationId(itemReq.getLocationId());
                outboundOrderDetailRepository.save(detail);
            }
        }

        return savedOrder;
    }

    // PUT cập nhật trạng thái
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','OUTBOUND_STAFF','QUALITY_CONTROL')")
    @Transactional
    public String updateStatus(@PathVariable Long id, @RequestBody StatusUpdateRequest request) {
        OutboundOrder order = outboundOrderRepository.findById(id).orElse(null);
        if (order == null) return "Không tìm thấy";
        if (!isAccessible(order.getCompanyId())) return "Không có quyền";

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
            if (oldStatus.equals("ALLOCATED") || oldStatus.equals("PENDING")) {
                adjustAllocation(order.getId(), -1);
            }
            adjustOnHand(order, -1);
        }
        // Logic: COMPLETED -> CANCELED/DRAFT: Cộng lại tồn thực tế
        else if (oldStatus.equals("COMPLETED") && !nextStatus.equals("COMPLETED")) {
            adjustOnHand(order, 1);
        }

        order.setStatus(nextStatus);
        outboundOrderRepository.save(order);
        return "Cập nhật thành công";
    }

    // Endpoint xác nhận QC cho phiếu xuất
    @PostMapping("/{id}/qc")
    @PreAuthorize("hasAnyRole('ADMIN','QUALITY_CONTROL','MANAGER')")
    @Transactional
    public String confirmQC(@PathVariable Long id) {
        OutboundOrder order = outboundOrderRepository.findById(id).orElse(null);
        if (order == null) return "Không tìm thấy";
        if (!isAccessible(order.getCompanyId())) return "Không có quyền";
        
        String currentStatus = (order.getStatus() != null ? order.getStatus() : "DRAFT").toUpperCase();
        if (currentStatus.equals("COMPLETED")) return "Phiếu đã hoàn thành";

        // Khi QC xong, chuyển sang COMPLETED và trừ kho thực tế
        // GIẢI PHÓNG HÀNG PHÂN BỔ (ALLOCATED -> 0)
        if (currentStatus.equals("ALLOCATED") || currentStatus.equals("PENDING") || currentStatus.equals("PICKING")) {
            adjustAllocation(order.getId(), -1);
        }
        adjustOnHand(order, -1);

        order.setStatus("COMPLETED");
        outboundOrderRepository.save(order);
        return "Xác nhận QC và xuất kho thành công";
    }

    private void adjustAllocation(Long orderId, int direction) {
        List<OutboundOrderDetail> details = outboundOrderDetailRepository.findByOutboundOrderId(orderId);
        for (OutboundOrderDetail item : details) {
            Inventory stock = inventoryRepo.findAndLockByProductIdAndLocationIdAndBatchId(
                    item.getProductId(), item.getLocationId(), item.getBatchId()).orElse(null);
            if (stock != null) {
                BigDecimal delta = item.getQuantity().multiply(BigDecimal.valueOf(direction));
                BigDecimal current = stock.getQuantityAllocated() != null ? stock.getQuantityAllocated() : BigDecimal.ZERO;
                stock.setQuantityAllocated(current.add(delta).max(BigDecimal.ZERO));
                inventoryRepo.save(stock);
            }
        }
    }

    private void adjustOnHand(OutboundOrder order, int direction) {
        List<OutboundOrderDetail> details = outboundOrderDetailRepository.findByOutboundOrderId(order.getId());
        for (OutboundOrderDetail item : details) {
            Inventory stock = inventoryRepo.findAndLockByProductIdAndLocationIdAndBatchId(
                    item.getProductId(), item.getLocationId(), item.getBatchId()).orElse(null);
            if (stock != null) {
                BigDecimal delta = item.getQuantity().multiply(BigDecimal.valueOf(direction));
                BigDecimal current = stock.getQuantityOnHand() != null ? stock.getQuantityOnHand() : BigDecimal.ZERO;
                stock.setQuantityOnHand(current.add(delta).max(BigDecimal.ZERO));
                inventoryRepo.save(stock);

                // Ghi lịch sử kho (Inventory Transaction)
                com.wmsbackend.entity.InventoryTransaction tx = new com.wmsbackend.entity.InventoryTransaction();
                tx.setProductId(item.getProductId());
                tx.setLocationId(item.getLocationId());
                tx.setBatchId(item.getBatchId());
                tx.setCompanyId(order.getCompanyId());
                tx.setTransactionType(direction < 0 ? "OUTBOUND" : "ADJUSTMENT");
                tx.setQuantityChange(delta); // delta đã bao gồm direction (số âm nếu là xuất kho)
                tx.setReferenceId(order.getId());
                tx.setCreatedBy(order.getCreatedBy());
                tx.setCreatedAt(TimeUtils.now());
                transactionRepo.save(tx);
            }
        }
    }

    private boolean isAccessible(Integer companyId) {
        Integer currentCompanyId = WorkspaceContext.getCurrentCompanyId();
        return WorkspaceContext.isGlobalAdmin() || currentCompanyId == null || companyId == null || currentCompanyId.equals(companyId);
    }
}
