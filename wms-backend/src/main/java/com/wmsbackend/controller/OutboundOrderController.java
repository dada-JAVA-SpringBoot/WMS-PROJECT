// ================================================================
// 5. OutboundOrderController.java
// ================================================================
package com.wmsbackend.controller;

import com.wmsbackend.entity.OutboundOrder;
import com.wmsbackend.repository.OutboundOrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/outbound-orders")
public class OutboundOrderController {

    @Autowired
    private OutboundOrderRepository outboundOrderRepository;

    // GET danh sách phiếu xuất — ADMIN, MANAGER xem báo cáo
    //                             STOREKEEPER, OUTBOUND_STAFF thao tác
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STOREKEEPER','OUTBOUND_STAFF')")
    public List<OutboundOrder> getAllOrders() {
        return outboundOrderRepository.findAll();
    }

    // POST tạo phiếu xuất — chỉ OUTBOUND_STAFF thực hiện (ADMIN luôn có quyền)
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','OUTBOUND_STAFF')")
    public OutboundOrder createOrder(@RequestBody OutboundOrder newOrder) {
        return outboundOrderRepository.save(newOrder);
    }
}
 