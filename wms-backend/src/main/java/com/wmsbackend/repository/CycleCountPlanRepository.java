package com.wmsbackend.repository;

import com.wmsbackend.entity.CycleCountPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CycleCountPlanRepository extends JpaRepository<CycleCountPlan, Long> {
}
