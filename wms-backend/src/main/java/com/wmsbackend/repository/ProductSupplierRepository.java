package com.wmsbackend.repository;

import com.wmsbackend.entity.ProductSupplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductSupplierRepository extends JpaRepository<ProductSupplier, ProductSupplier.ProductSupplierId> {
    List<ProductSupplier> findByProductId(Integer productId);
    void deleteByProductId(Integer productId);
}
