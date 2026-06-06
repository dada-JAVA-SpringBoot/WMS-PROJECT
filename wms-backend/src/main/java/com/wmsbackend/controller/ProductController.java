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
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductRepository productRepository;
    private final com.wmsbackend.repository.ProductUnitConversionRepository conversionRepository;
    private final com.wmsbackend.repository.ProductSupplierRepository productSupplierRepository;

    public ProductController(ProductRepository productRepository, 
                             com.wmsbackend.repository.ProductUnitConversionRepository conversionRepository,
                             com.wmsbackend.repository.ProductSupplierRepository productSupplierRepository) {
        this.productRepository = productRepository;
        this.conversionRepository = conversionRepository;
        this.productSupplierRepository = productSupplierRepository;
    }

    // GET - Trả về danh sách sản phẩm đầy đủ thông tin tồn kho cho các vai trò vận hành
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STOREKEEPER','INBOUND_STAFF','OUTBOUND_STAFF','QUALITY_CONTROL','HANDLER')")
    public ResponseEntity<List<ProductDTO>> getAllProducts() {
        List<ProductDTO> products = productRepository.findAllProductsWithTotalStock();
        for (ProductDTO p : products) {
            p.setConversions(conversionRepository.findByProductId(p.getId()));
            
            // Lấy danh sách nhà cung cấp từ bảng ProductSuppliers
            List<com.wmsbackend.entity.ProductSupplier> psList = productSupplierRepository.findByProductId(p.getId());
            if (!psList.isEmpty()) {
                String names = psList.stream()
                        .map(ps -> ps.getSupplier().getName())
                        .collect(java.util.stream.Collectors.joining(", "));
                p.setSupplierCodes(names); // Tận dụng field này để hiển thị tên NCC
            }
        }
        return ResponseEntity.ok(products);
    }

    // GET — alias cho /details (tương thích ngược)
    @GetMapping("/details")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STOREKEEPER','INBOUND_STAFF','OUTBOUND_STAFF','QUALITY_CONTROL','HANDLER')")
    public ResponseEntity<List<ProductDTO>> getProducts() {
        return getAllProducts();
    }

    // 1b. Lấy danh sách quy đổi đơn vị của một sản phẩm
    @GetMapping("/{id}/conversions")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STOREKEEPER','INBOUND_STAFF','OUTBOUND_STAFF','CHECKER','QUALITY_CONTROL')")
    public List<com.wmsbackend.entity.ProductUnitConversion> getConversions(@PathVariable Integer id) {
        return conversionRepository.findByProductId(id);
    }

    // 1c. Lấy danh sách nhà cung cấp của sản phẩm
    @GetMapping("/{id}/suppliers")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STOREKEEPER','INBOUND_STAFF','OUTBOUND_STAFF','QUALITY_CONTROL','HANDLER')")
    public List<com.wmsbackend.entity.ProductSupplier> getProductSuppliers(@PathVariable Integer id) {
        return productSupplierRepository.findByProductId(id);
    }

    // 1d. Lưu/Cập nhật danh sách nhà cung cấp cho sản phẩm
    @PostMapping("/{id}/suppliers")
    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public void saveProductSuppliers(@PathVariable Integer id, @RequestBody List<Integer> supplierIds) {
        productSupplierRepository.deleteByProductId(id);
        if (supplierIds != null) {
            for (Integer sId : supplierIds) {
                com.wmsbackend.entity.ProductSupplier ps = new com.wmsbackend.entity.ProductSupplier();
                ps.setId(new com.wmsbackend.entity.ProductSupplier.ProductSupplierId(id, sId));
                productSupplierRepository.save(ps);
            }
        }
    }

    // GET — thống kê: ADMIN, MANAGER, STOREKEEPER, CHECKER
    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STOREKEEPER','CHECKER')")
    public long getStats() {
        return productRepository.count();
    }

    // GET — tìm kiếm theo barcode/sku cho quét mã
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STOREKEEPER','INBOUND_STAFF','OUTBOUND_STAFF','QUALITY_CONTROL','HANDLER')")
    public List<Product> searchProducts(@RequestParam String keyword) {
        return productRepository.searchProducts(keyword);
    }

    // POST — ADMIN & MANAGER
    @PostMapping
    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public Product createProduct(@RequestBody Product product) {
        // Tách conversions ra để lưu sau khi đã có Product ID
        List<com.wmsbackend.entity.ProductUnitConversion> conversions = product.getConversions();
        product.setConversions(new java.util.ArrayList<>());
        
        // Bước 1: Lưu Product trước để lấy ID (IDENTITY)
        Product savedProduct = productRepository.save(product);
        
        // Bước 2: Gắn ID vào các dòng quy đổi (vì ProductId NOT NULL trong DB)
        if (conversions != null && !conversions.isEmpty()) {
            for (com.wmsbackend.entity.ProductUnitConversion conv : conversions) {
                conv.setProductId(savedProduct.getId());
                savedProduct.getConversions().add(conv);
            }
            // Lưu lại lần nữa để Hibernate cập nhật OneToMany Cascade ALL
            return productRepository.save(savedProduct);
        }
        return savedProduct;
    }

    // 3. Cập nhật sản phẩm — ADMIN & MANAGER
    @PutMapping("/{id}")
    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
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