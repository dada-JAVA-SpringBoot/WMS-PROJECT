// ================================================================
// 1. ProductController.java
// ================================================================
package com.wmsbackend.controller;

import com.wmsbackend.dto.ProductDTO;
import com.wmsbackend.entity.ProductCategory;
import com.wmsbackend.entity.Product;
import com.wmsbackend.repository.ProductCategoryRepository;
import com.wmsbackend.repository.ProductRepository;
import com.wmsbackend.security.WorkspaceContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.List;
import java.util.concurrent.atomic.AtomicMarkableReference;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductRepository productRepository;
    private final ProductCategoryRepository categoryRepository;
    private final com.wmsbackend.repository.ProductUnitConversionRepository conversionRepository;
    private final com.wmsbackend.repository.ProductSupplierRepository productSupplierRepository;

    public ProductController(ProductRepository productRepository, 
                             ProductCategoryRepository categoryRepository,
                             com.wmsbackend.repository.ProductUnitConversionRepository conversionRepository,
                             com.wmsbackend.repository.ProductSupplierRepository productSupplierRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.conversionRepository = conversionRepository;
        this.productSupplierRepository = productSupplierRepository;
    }

    // GET - Trả về danh sách sản phẩm đầy đủ thông tin tồn kho cho các vai trò vận hành
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STOREKEEPER','INBOUND_STAFF','OUTBOUND_STAFF','QUALITY_CONTROL','HANDLER')")
    public ResponseEntity<List<ProductDTO>> getAllProducts() {
        List<ProductDTO> products = productRepository.findAllProductsWithTotalStock(WorkspaceContext.getFilterCompanyId());
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
        if (!WorkspaceContext.isGlobalAdmin() && WorkspaceContext.getCurrentCompanyId() != null) {
            Product product = productRepository.findById(id).orElseThrow();
            if (product.getCompanyId() != null && !WorkspaceContext.getCurrentCompanyId().equals(product.getCompanyId())) {
                throw new RuntimeException("Không có quyền xem quy đổi của sản phẩm công ty khác");
            }
        }
        return conversionRepository.findByProductId(id);
    }

    // 1c. Lấy danh sách nhà cung cấp của sản phẩm
    @GetMapping("/{id}/suppliers")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STOREKEEPER','INBOUND_STAFF','OUTBOUND_STAFF','QUALITY_CONTROL','HANDLER')")
    public List<com.wmsbackend.entity.ProductSupplier> getProductSuppliers(@PathVariable Integer id) {
        if (!WorkspaceContext.isGlobalAdmin() && WorkspaceContext.getCurrentCompanyId() != null) {
            Product product = productRepository.findById(id).orElseThrow();
            if (product.getCompanyId() != null && !WorkspaceContext.getCurrentCompanyId().equals(product.getCompanyId())) {
                throw new RuntimeException("Không có quyền xem nhà cung cấp của sản phẩm công ty khác");
            }
        }
        return productSupplierRepository.findByProductId(id);
    }

    @Autowired
    private jakarta.persistence.EntityManager entityManager;
    // 1d. Lưu/Cập nhật danh sách nhà cung cấp cho sản phẩm
    @PostMapping("/{id}/suppliers")
    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public void saveProductSuppliers(@PathVariable Integer id, @RequestBody List<Integer> supplierIds) {
        // 1. Lấy thực thể Product thật để thỏa mãn @MapsId("productId")
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với ID: " + id));

        if (!WorkspaceContext.isGlobalAdmin() && WorkspaceContext.getCurrentCompanyId() != null) {
            if (product.getCompanyId() != null && !WorkspaceContext.getCurrentCompanyId().equals(product.getCompanyId())) {
                throw new RuntimeException("Không có quyền sửa nhà cung cấp của sản phẩm công ty khác");
            }
        }

        // 2. Clear danh sách nhà cung cấp cũ của sản phẩm này
        productSupplierRepository.deleteByProductId(id);

        // 3. Thêm mới danh sách ID nhà cung cấp gửi từ Frontend lên
        if (supplierIds != null) {
            for (Integer sId : supplierIds) {
                if (sId == null) continue; // Bỏ qua nếu ID là null để tránh lỗi Hibernate

                com.wmsbackend.entity.ProductSupplier ps = new com.wmsbackend.entity.ProductSupplier();

                // Khởi tạo Khóa chính hỗn hợp Composite Key
                ps.setId(new com.wmsbackend.entity.ProductSupplier.ProductSupplierId(id, sId));

                // Gán liên kết quan hệ hai chiều trọn vẹn
                ps.setProduct(product); // Ánh xạ vào @MapsId("productId")

                // Sử dụng Proxy Reference để ánh xạ vào @MapsId("supplierId") mà không sợ lỗi null field
                com.wmsbackend.entity.Supplier supplier = entityManager.getReference(com.wmsbackend.entity.Supplier.class, sId);
                ps.setSupplier(supplier);

                // Ghi xuống cơ sở dữ liệu SQL Server
                productSupplierRepository.save(ps);
            }
        }
    }

    // GET — thống kê: ADMIN, MANAGER, STOREKEEPER, CHECKER
    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STOREKEEPER','CHECKER')")
    public long getStats() {
        Integer companyId = WorkspaceContext.getCurrentCompanyId();
        if (companyId == null) return productRepository.count();
        return productRepository.findAll().stream()
                .filter(p -> companyId.equals(p.getCompanyId()))
                .count();
    }

    // GET — tìm kiếm theo barcode/sku cho quét mã
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STOREKEEPER','INBOUND_STAFF','OUTBOUND_STAFF','QUALITY_CONTROL','HANDLER')")
    public List<Product> searchProducts(@RequestParam String keyword) {
        return productRepository.searchProducts(keyword, WorkspaceContext.getFilterCompanyId());
    }

    // POST — ADMIN & MANAGER
    @PostMapping
    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public Product createProduct(@RequestBody Product product) {
        Integer companyId = WorkspaceContext.getCurrentCompanyId();
        if (product.getCompanyId() == null) {
            product.setCompanyId(companyId);
        } else if (companyId != null && !companyId.equals(product.getCompanyId())) {
            throw new RuntimeException("Không có quyền tạo sản phẩm cho công ty khác");
        }
        validateCategoryScope(product.getCategoryId(), companyId);

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
        if (!WorkspaceContext.isGlobalAdmin() && WorkspaceContext.getCurrentCompanyId() != null
                && existing.getCompanyId() != null
                && !WorkspaceContext.getCurrentCompanyId().equals(existing.getCompanyId())) {
            return ResponseEntity.status(403).build();
        }
        if (WorkspaceContext.getCurrentCompanyId() != null && updatedProduct.getCompanyId() != null
                && !WorkspaceContext.getCurrentCompanyId().equals(updatedProduct.getCompanyId())) {
            return ResponseEntity.status(403).build();
        }
        validateCategoryScope(updatedProduct.getCategoryId(), WorkspaceContext.getCurrentCompanyId());
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
        if (updatedProduct.getCompanyId() != null) {
            existing.setCompanyId(updatedProduct.getCompanyId());
        }

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
        if (!WorkspaceContext.isGlobalAdmin() && WorkspaceContext.getCurrentCompanyId() != null
                && existing.getCompanyId() != null
                && !WorkspaceContext.getCurrentCompanyId().equals(existing.getCompanyId())) {
            return ResponseEntity.status(403).build();
        }
        existing.setBarcode(request.getBarcode());
        return ResponseEntity.ok(productRepository.save(existing));
    }

    // DELETE — chỉ ADMIN
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteProduct(@PathVariable Integer id) {
        if (!WorkspaceContext.isGlobalAdmin() && WorkspaceContext.getCurrentCompanyId() != null) {
            Product existing = productRepository.findById(id).orElseThrow();
            if (existing.getCompanyId() != null && !WorkspaceContext.getCurrentCompanyId().equals(existing.getCompanyId())) {
                throw new RuntimeException("Không có quyền xóa sản phẩm của công ty khác");
            }
        }
        productRepository.deleteById(id);
    }

    private void validateCategoryScope(Integer categoryId, Integer companyId) {
        if (categoryId == null || companyId == null) {
            return;
        }
        ProductCategory category = categoryRepository.findById(categoryId).orElseThrow(() ->
                new RuntimeException("Không tìm thấy danh mục sản phẩm"));
        if (category.getCompanyId() != null && !companyId.equals(category.getCompanyId())) {
            throw new RuntimeException("Danh mục sản phẩm thuộc company khác");
        }
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
