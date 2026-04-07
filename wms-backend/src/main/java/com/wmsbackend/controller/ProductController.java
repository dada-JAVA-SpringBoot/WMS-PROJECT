package com.wmsbackend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("")
public class ProductController {

    // Đây là API đầu tiên: GET /api/products
    @GetMapping
    public String getProducts() {
        return "Chào mừng đến với Hệ thống Quản lý Kho (WMS)! Đây là danh sách sản phẩm.";
    }
}