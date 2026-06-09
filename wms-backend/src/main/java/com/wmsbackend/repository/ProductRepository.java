package com.wmsbackend.repository;

import com.wmsbackend.entity.Product;
import com.wmsbackend.dto.ProductDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {

    @Query("SELECT new com.wmsbackend.dto.ProductDTO(" +
            "p.id, p.sku, p.barcode, p.name, p.baseUnit, p.categoryId, " +
            "p.imageUrl, p.status, p.supplierCodes, p.createdAt, " +
            "p.weight, p.length, p.width, p.height, " +
            "p.storageTemp, CAST(p.safetyStock AS integer), p.isFragile, " +
            "CAST((SELECT COALESCE(SUM(i.quantityOnHand), 0) FROM Inventory i WHERE i.productId = p.id) AS double), " +
            "CAST((SELECT COALESCE(SUM(i.quantityAllocated), 0) FROM Inventory i WHERE i.productId = p.id) AS double), " +
            "CAST((SELECT COALESCE(SUM(i.quantityOnHand), 0) - COALESCE(SUM(i.quantityAllocated), 0) FROM Inventory i WHERE i.productId = p.id) AS double), " +
            "CAST((SELECT COALESCE(SUM(d.quantityReceived), 0) " +
            "FROM InboundOrderDetail d JOIN InboundOrder o ON d.inboundOrderId = o.id " +
            "WHERE d.productId = p.id " +
            "AND o.status IN ('DRAFT', 'ORDERED', 'IN_TRANSIT', 'PENDING')) AS double), " +
            "(SELECT MIN(b.expiryDate) FROM Inventory i JOIN Batch b ON i.batchId = b.id WHERE i.productId = p.id), " +
            "c.name, c.categoryCode, " +
            "(SELECT MAX(o2.receiptDate) FROM InboundOrder o2 JOIN InboundOrderDetail d2 ON o2.id = d2.inboundOrderId WHERE d2.productId = p.id AND o2.status = 'COMPLETED')) " +
            "FROM Product p LEFT JOIN ProductCategory c ON p.categoryId = c.id " +
            "WHERE (:companyId IS NULL OR p.companyId = :companyId)")
    List<ProductDTO> findAllProductsWithTotalStock(@Param("companyId") Integer companyId);

    // ── Dashboard: Đếm sản phẩm dưới định mức ─────────────────────────────
    @Query("SELECT COUNT(p) FROM Product p " +
            "WHERE p.safetyStock IS NOT NULL AND p.safetyStock > 0 " +
            "AND CAST((SELECT COALESCE(SUM(i.quantityOnHand), 0) - COALESCE(SUM(i.quantityAllocated), 0) " +
            "     FROM Inventory i WHERE i.productId = p.id) AS double) < CAST(p.safetyStock AS double)")
    long countLowStockProducts();

    // ── Inventory Stats: Lấy tất cả sản phẩm active ───────────────────────
    @Query("SELECT p FROM Product p WHERE p.status = 'ACTIVE' ORDER BY p.name")
    List<Product> findAllActiveProducts();

    @Query("SELECT p FROM Product p WHERE p.status = 'ACTIVE' " +
            "AND (:companyId IS NULL OR p.companyId = :companyId) ORDER BY p.name")
    List<Product> findActiveByCompany(@Param("companyId") Integer companyId);

    @Query("SELECT COUNT(p) FROM Product p " +
            "WHERE (:companyId IS NULL OR p.companyId = :companyId)")
    long countByCompany(@Param("companyId") Integer companyId);

    @Query("SELECT p FROM Product p WHERE (" +
            "LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(p.sku) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(p.barcode) LIKE LOWER(CONCAT('%', :keyword, '%'))" +
            ") AND (:companyId IS NULL OR p.companyId = :companyId)")
    List<Product> searchProducts(@Param("keyword") String keyword, @Param("companyId") Integer companyId);
}
