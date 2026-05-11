package com.wmsbackend.repository;

import com.wmsbackend.entity.CycleCountDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CycleCountDetailRepository extends JpaRepository<CycleCountDetail, Long> {
    List<CycleCountDetail> findByPlanId(Long planId);
}
