package com.wmsbackend.repository;

import com.wmsbackend.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Integer> {
    List<Company> findAllByActiveTrueOrderByCompanyNameAsc();
    List<Company> findAllByOrderByActiveDescCompanyNameAsc();
    Optional<Company> findByCompanyCodeIgnoreCase(String companyCode);
}
