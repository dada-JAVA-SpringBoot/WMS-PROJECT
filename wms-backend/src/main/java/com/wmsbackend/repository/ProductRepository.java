package com.wmsbackend.repository;

import com.wmsbackend.entity.Product;
import com.wmsbackend.dto.ProductDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {

    @Query("SELECT new com.wmsbackend.dto.ProductDTO(" +
            "p.id, p.sku, p.barcode, p.name, p.baseUnit, p.categoryId, " +
            "p.imageUrl, p.status, p.supplierCodes, p.createdAt, " +
            "p.weight, p.length, p.width, p.height, " +
            "p.storageTemp, p.safetyStock, p.isFragile, " +
            "(SELECT COALESCE(SUM(i.quantityOnHand), 0) FROM Inventory i WHERE i.productId = p.id), " +
            "(SELECT COALESCE(SUM(i.quantityAllocated), 0) FROM Inventory i WHERE i.productId = p.id), " +
            "(SELECT COALESCE(SUM(i.quantityOnHand), 0) - COALESCE(SUM(i.quantityAllocated), 0) FROM Inventory i WHERE i.productId = p.id), " +
            "(SELECT COALESCE(SUM(d.quantityReceived), 0) " +
            "FROM InboundOrderDetail d, InboundOrder o " +
            "WHERE d.inboundOrderId = o.id " +
            "AND d.productId = p.id " +
            "AND o.status IN ('DRAFT', 'ORDERED', 'IN_TRANSIT', 'PENDING')), " +
            "(SELECT MIN(b.expiryDate) FROM Inventory i, Batch b WHERE i.batchId = b.id AND i.productId = p.id)) " +
            "FROM Product p")
    List<ProductDTO> findAllProductsWithTotalStock();

    // ── Dashboard: Đếm sản phẩm dưới định mức ─────────────────────────────
    @Query("SELECT COUNT(DISTINCT p.id) FROM Product p " +
            "WHERE p.safetyStock IS NOT NULL AND p.safetyStock > 0 " +
            "AND (SELECT COALESCE(SUM(i.quantityOnHand), 0) - COALESCE(SUM(i.quantityAllocated), 0) " +
            "     FROM Inventory i WHERE i.productId = p.id) < p.safetyStock")
    long countLowStockProducts();

    // ── Inventory Stats: Lấy tất cả sản phẩm active ───────────────────────
    @Query("SELECT p FROM Product p WHERE p.status = 'ACTIVE' ORDER BY p.name")
    List<Product> findAllActiveProducts();
}
