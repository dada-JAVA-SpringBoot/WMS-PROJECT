package com.wmsbackend.repository;

import com.wmsbackend.entity.ProductUnit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductUnitRepository extends JpaRepository<ProductUnit, Integer> {
    List<ProductUnit> findAllByOrderByNameAsc();
    List<ProductUnit> findByCompanyIdOrderByNameAsc(Integer companyId);
    Optional<ProductUnit> findByUnitCodeIgnoreCase(String unitCode);
    Optional<ProductUnit> findByUnitCodeIgnoreCaseAndCompanyId(String unitCode, Integer companyId);
}
