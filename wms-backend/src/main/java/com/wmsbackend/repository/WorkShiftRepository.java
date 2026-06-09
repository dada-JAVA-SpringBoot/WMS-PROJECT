package com.wmsbackend.repository;

import com.wmsbackend.entity.WorkShift;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WorkShiftRepository extends JpaRepository<WorkShift, Integer> {
    List<WorkShift> findByCompanyIdOrderByIdAsc(Integer companyId);
    Optional<WorkShift> findFirstByCompanyIdOrderByIdAsc(Integer companyId);
    Optional<WorkShift> findFirstByCompanyIdIsNullOrderByIdAsc();
}
