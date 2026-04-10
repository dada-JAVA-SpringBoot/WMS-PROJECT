package com.wmsbackend.controller;

import com.wmsbackend.dto.ProductDTO;
import com.wmsbackend.entity.Product;
import com.wmsbackend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin("*") // Cho phép Frontend gọi API
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    // 1. Lấy danh sách sản phẩm
    @GetMapping
    public List<ProductDTO> getProducts() {
        return productRepository.findAllProductsWithTotalStock();
    }

    // 2. Thêm mới sản phẩm
    @PostMapping
    public Product createProduct(@RequestBody Product product) {
        return productRepository.save(product);
    }

    // 3. Xóa sản phẩm
    @DeleteMapping("/{id}")
    public void deleteProduct(@PathVariable Integer id) {
        productRepository.deleteById(id);
    }
}