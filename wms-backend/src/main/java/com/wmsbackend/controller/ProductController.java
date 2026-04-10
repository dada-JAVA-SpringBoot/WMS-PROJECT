package com.wmsbackend.controller;

import com.wmsbackend.entity.Product;
import com.wmsbackend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
// Lời khuyên: Nên đặt đường dẫn có chữ /api
@RequestMapping("/api/products")
public class ProductController {

    // Nhờ Spring Boot tự động đưa cỗ máy Repository vào đây
    @Autowired
    private ProductRepository productRepository;

    @GetMapping
    public List<Product> getProducts() {
        // Hàm findAll() sẽ tự động chạy câu lệnh "SELECT * FROM Products" dưới SQL Server
        return productRepository.findAll();
    }
}