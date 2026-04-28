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
            "COALESCE(SUM(i.quantityOnHand), 0)) " +
            "FROM Product p LEFT JOIN Inventory i ON p.id = i.productId " +
            "GROUP BY p.id, p.sku, p.barcode, p.name, p.baseUnit, p.categoryId, " +
            "p.imageUrl, p.status, p.createdAt, " + // BỎ p.supplierCodes Ở DÒNG NÀY ĐỂ TRÁNH LỖI GROUP BY
            "p.weight, p.length, p.width, p.height, p.storageTemp, p.safetyStock, p.isFragile")
    List<ProductDTO> findAllProductsWithTotalStock();
}