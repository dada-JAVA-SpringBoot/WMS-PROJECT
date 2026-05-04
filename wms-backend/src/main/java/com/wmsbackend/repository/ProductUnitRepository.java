package com.wmsbackend.repository;

import com.wmsbackend.entity.ProductUnit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductUnitRepository extends JpaRepository<ProductUnit, Integer> {
    List<ProductUnit> findAllByOrderByNameAsc();
    Optional<ProductUnit> findByUnitCodeIgnoreCase(String unitCode);
}
