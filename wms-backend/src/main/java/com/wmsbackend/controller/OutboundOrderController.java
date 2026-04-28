package com.wmsbackend.controller;

import com.wmsbackend.entity.OutboundOrder;
import com.wmsbackend.repository.OutboundOrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
// Có thể bạn cần import thêm Entity tùy theo code cũ
// import com.wmsbackend.entity.OutboundOrder;

@RestController
@RequestMapping("/api/outbound-orders")
@CrossOrigin("*") // Thêm dấu * vào đây cho chắc ăn 100%
public class OutboundOrderController {

    @Autowired
    private OutboundOrderRepository outboundOrderRepository;

    // --- HÀM CŨ CỦA NHÓM TRƯỞNG (HIỂN THỊ DỮ LIỆU) ---
    @GetMapping
    public List<OutboundOrder> getAllOrders() {
        return outboundOrderRepository.findAll();
    }

    // --- BẠN THÊM ĐOẠN NÀY VÀO ĐỂ LƯU PHIẾU TỪ REACT ---
    @PostMapping
    public OutboundOrder createOrder(@RequestBody OutboundOrder newOrder) {
        return outboundOrderRepository.save(newOrder); // Lưu thẳng vào SQL
    }
}