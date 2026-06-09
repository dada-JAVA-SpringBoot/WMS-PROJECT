package com.wmsbackend.repository;

import com.wmsbackend.entity.CycleCountPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CycleCountPlanRepository extends JpaRepository<CycleCountPlan, Long> {
    List<CycleCountPlan> findByCompanyIdOrderByIdDesc(Integer companyId);
    Optional<CycleCountPlan> findByIdAndCompanyId(Long id, Integer companyId);
}
