package com.wmsbackend.repository;

import com.wmsbackend.entity.ProductUnitConversion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductUnitConversionRepository extends JpaRepository<ProductUnitConversion, Integer> {
    List<ProductUnitConversion> findByProductId(Integer productId);
}
