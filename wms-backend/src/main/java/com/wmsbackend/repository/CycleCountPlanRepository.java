package com.wmsbackend.repository;

import com.wmsbackend.entity.CycleCountPlan;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CycleCountPlanRepository extends JpaRepository<CycleCountPlan, Long> {
    List<CycleCountPlan> findByCompanyIdOrderByIdDesc(Integer companyId);
    Page<CycleCountPlan> findByCompanyId(Integer companyId, Pageable pageable);
    Optional<CycleCountPlan> findByIdAndCompanyId(Long id, Integer companyId);

    /** Lấy các plan chưa hoàn thành được giao cho 1 nhân viên (dùng cho SmartAssistant) */
    @Query("SELECT p FROM CycleCountPlan p WHERE p.companyId = :companyId " +
           "AND p.status <> 'COMPLETED' AND p.assignedTo = :staffId " +
           "ORDER BY p.id DESC")
    List<CycleCountPlan> findAssignedActivePlans(
            @Param("companyId") Integer companyId,
            @Param("staffId") Long staffId);
}
