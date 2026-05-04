package com.wmsbackend.controller;

import com.wmsbackend.dto.ProductDTO;
import com.wmsbackend.entity.Product;
import com.wmsbackend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin("*") // Cho phép Frontend gọi API
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private com.wmsbackend.repository.ProductUnitConversionRepository conversionRepository;

    // 1. Lấy danh sách sản phẩm
    @GetMapping("/details")
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
    public List<com.wmsbackend.entity.ProductUnitConversion> getConversions(@PathVariable Integer id) {
        return conversionRepository.findByProductId(id);
    }

    // 2. Thêm mới sản phẩm
    @PostMapping
    public Product createProduct(@RequestBody Product product) {
        if (product.getConversions() != null) {
            for (com.wmsbackend.entity.ProductUnitConversion conv : product.getConversions()) {
                // ProductId sẽ được Hibernate tự động gắn khi save nhờ @JoinColumn
            }
        }
        return productRepository.save(product);
    }

    // 3. Cập nhật sản phẩm
    @PutMapping("/{id}")
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

    // 3b. Cập nhật riêng barcode để hỗ trợ tạo mã tự động
    @PatchMapping("/{id}/barcode")
    public ResponseEntity<Product> updateBarcode(@PathVariable Integer id, @RequestBody BarcodeUpdateRequest request) {
        Optional<Product> existingOpt = productRepository.findById(id);
        if (existingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Product existing = existingOpt.get();
        existing.setBarcode(request.getBarcode());
        return ResponseEntity.ok(productRepository.save(existing));
    }

    // 3. Xóa sản phẩm
    @DeleteMapping("/{id}")
    public void deleteProduct(@PathVariable Integer id) {
        productRepository.deleteById(id);
    }

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
