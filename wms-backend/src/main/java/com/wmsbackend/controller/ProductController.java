// ================================================================
// 1. ProductController.java
// ================================================================
package com.wmsbackend.controller;

import com.wmsbackend.dto.ProductDTO;
import com.wmsbackend.entity.Product;
import com.wmsbackend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    // GET — tất cả role xem được sản phẩm
    @GetMapping("/details")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STOREKEEPER','INBOUND_STAFF','OUTBOUND_STAFF','CHECKER')")
    public List<ProductDTO> getProducts() {
        return productRepository.findAllProductsWithTotalStock();
    }

    // GET — thống kê: ADMIN, MANAGER, STOREKEEPER, CHECKER
    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STOREKEEPER','CHECKER')")
    public long getStats() {
        return productRepository.count();
    }

    // POST — chỉ ADMIN
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Product createProduct(@RequestBody Product product) {
        return productRepository.save(product);
    }

    // DELETE — chỉ ADMIN
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteProduct(@PathVariable Integer id) {
        productRepository.deleteById(id);
    }
}
 