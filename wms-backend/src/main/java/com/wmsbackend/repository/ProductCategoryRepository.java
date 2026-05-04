package com.wmsbackend.repository;

import com.wmsbackend.entity.ProductCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductCategoryRepository extends JpaRepository<ProductCategory, Integer> {
    List<ProductCategory> findAllByOrderByNameAsc();
    Optional<ProductCategory> findByCategoryCodeIgnoreCase(String categoryCode);
}
