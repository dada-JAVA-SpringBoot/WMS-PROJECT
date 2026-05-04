// ================================================================
// 1. ProductController.java
// ================================================================
package com.wmsbackend.controller;

import com.wmsbackend.dto.ProductDTO;
import com.wmsbackend.entity.Product;
import com.wmsbackend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private com.wmsbackend.repository.ProductUnitConversionRepository conversionRepository;

    // GET — tất cả role xem được sản phẩm
    // (Lấy danh sách sản phẩm cùng tổng tồn kho)
    @GetMapping("/details")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STOREKEEPER','INBOUND_STAFF','OUTBOUND_STAFF','CHECKER')")
    public List<ProductDTO> getProducts() {
        List<ProductDTO> products = productRepository.findAllProductsWithTotalStock();
        // Gắn danh sách quy đổi cho từng sản phẩm
        for (ProductDTO p : products) {
            p.setConversions(conversionRepository.findByProductId(p.getId()));
        }
        return products;
    }

    // 1b. Lấy danh sách quy đổi đơn vị của một sản phẩm
    @GetMapping("/{id}/conversions")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STOREKEEPER','INBOUND_STAFF','OUTBOUND_STAFF','CHECKER')")
    public List<com.wmsbackend.entity.ProductUnitConversion> getConversions(@PathVariable Integer id) {
        return conversionRepository.findByProductId(id);
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
        if (product.getConversions() != null) {
            for (com.wmsbackend.entity.ProductUnitConversion conv : product.getConversions()) {
                // ProductId sẽ được Hibernate tự động gắn khi save nhờ @JoinColumn
            }
        }
        return productRepository.save(product);
    }

    // 3. Cập nhật sản phẩm — chỉ ADMIN
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Product> updateProduct(@PathVariable Integer id, @RequestBody Product updatedProduct) {
        Optional<Product> existingOpt = productRepository.findById(id);
        if (existingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Product existing = existingOpt.get();
        existing.setSku(updatedProduct.getSku());
        existing.setBarcode(updatedProduct.getBarcode());
        existing.setName(updatedProduct.getName());
        existing.setBaseUnit(updatedProduct.getBaseUnit());
        existing.setCategoryId(updatedProduct.getCategoryId());
        existing.setImageUrl(updatedProduct.getImageUrl());
        existing.setStatus(updatedProduct.getStatus());
        existing.setWeight(updatedProduct.getWeight());
        existing.setLength(updatedProduct.getLength());
        existing.setWidth(updatedProduct.getWidth());
        existing.setHeight(updatedProduct.getHeight());
        existing.setStorageTemp(updatedProduct.getStorageTemp());
        existing.setSafetyStock(updatedProduct.getSafetyStock());
        existing.setFragile(updatedProduct.getFragile());

        // Cập nhật danh sách quy đổi (OneToMany Cascade ALL sẽ tự xử lý)
        existing.getConversions().clear();
        if (updatedProduct.getConversions() != null) {
            for (com.wmsbackend.entity.ProductUnitConversion conv : updatedProduct.getConversions()) {
                conv.setProductId(existing.getId());
                existing.getConversions().add(conv);
            }
        }

        return ResponseEntity.ok(productRepository.save(existing));
    }

    // 3b. Cập nhật riêng barcode để hỗ trợ tạo mã tự động — chỉ ADMIN
    @PatchMapping("/{id}/barcode")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Product> updateBarcode(@PathVariable Integer id, @RequestBody BarcodeUpdateRequest request) {
        Optional<Product> existingOpt = productRepository.findById(id);
        if (existingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Product existing = existingOpt.get();
        existing.setBarcode(request.getBarcode());
        return ResponseEntity.ok(productRepository.save(existing));
    }

    // DELETE — chỉ ADMIN
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteProduct(@PathVariable Integer id) {
        productRepository.deleteById(id);
    }

    // Class hỗ trợ nhận Request cập nhật Barcode
    public static class BarcodeUpdateRequest {
        private String barcode;

        public String getBarcode() {
            return barcode;
        }

        public void setBarcode(String barcode) {
            this.barcode = barcode;
        }
    }
}