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
            "AND o.status IN ('DRAFT', 'ORDERED', 'IN_TRANSIT', 'RECEIVING', 'PENDING')), " +
            "(SELECT MIN(b.expiryDate) FROM Inventory i JOIN Batch b ON i.batchId = b.id WHERE i.productId = p.id)) " +
            "FROM Product p")
    List<ProductDTO> findAllProductsWithTotalStock();
}
